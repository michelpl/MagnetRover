"""
Render 16-direction rover sprites from the Meshy FBX with a locked game camera.

Run:
  blender --background --python tools/blender/render_rover_sprites.py
"""

from __future__ import annotations

import json
import math
import os
import sys
from pathlib import Path

import bpy
from mathutils import Vector

# ---------------------------------------------------------------------------
# Parameters (keep in sync with SPRITE_CAMERA.md)
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = (
    REPO_ROOT
    / "ConceptArt"
    / "Meshy_AI_Lunar_Rover_Mini_0826181139_texture_fbx"
)
FBX_PATH = SOURCE_DIR / "Meshy_AI_Lunar_Rover_Mini_0826181139_texture.fbx"
TEXTURE_STEM = "Meshy_AI_Lunar_Rover_Mini_0826181139_texture"

OUTPUT_DIR = REPO_ROOT / "public" / "assets" / "sprites" / "rover"
FRAME_SIZE = 256
FRAME_COUNT = 16
YAW_STEP_DEG = 22.5
# Meshy rest pose: green panel along +X, face/eyes along -X.
# Offset so north (frame 0) has the eyes toward +Y (top of the PNG).
MESH_FORWARD_OFFSET_DEG = -90.0

# Elevation from the ground plane (75° = 15° off vertical). Matches scenario1.
CAMERA_ELEVATION_DEG = 75.0
CAMERA_AZIMUTH_DEG = 0.0
CAMERA_ROLL_DEG = 0.0
CAMERA_DISTANCE = 6.0
ORTHO_FILL = 0.70
CLIP_START = 0.01
CLIP_END = 100.0

# Meshy FBX is typically Y-up (Unity). Rotate onto Blender Z-up.
IMPORT_AXIS_FORWARD = "-Z"
IMPORT_AXIS_UP = "Y"

SAMPLES = 32


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.cameras, bpy.data.lights):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def import_fbx(path: Path) -> bpy.types.Object:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(
        filepath=str(path),
        axis_forward=IMPORT_AXIS_FORWARD,
        axis_up=IMPORT_AXIS_UP,
        use_anim=False,
    )
    imported = [obj for obj in bpy.data.objects if obj not in before]
    meshes = [obj for obj in imported if obj.type == "MESH"]
    if not meshes:
        raise RuntimeError(f"No mesh in FBX: {path}")

    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
        obj.name = f"Rover_Mesh_{obj.name}"
        if obj.data:
            obj.data.name = f"{obj.name}_Data"
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    rover = bpy.context.view_layer.objects.active
    rover.name = "Rover_Mesh"
    if rover.data:
        rover.data.name = "Rover_Mesh_Data"

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0.0, 0.0, 0.0))
    root = bpy.context.active_object
    root.name = "Rover_Root"
    rover.parent = root
    return root


def mesh_objects(root: bpy.types.Object) -> list[bpy.types.Object]:
    return [obj for obj in root.children_recursive if obj.type == "MESH"] + (
        [root] if root.type == "MESH" else []
    )


def world_bbox(objects: list[bpy.types.Object]) -> tuple[Vector, Vector]:
    mins = Vector((math.inf, math.inf, math.inf))
    maxs = Vector((-math.inf, -math.inf, -math.inf))
    for obj in objects:
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            mins.x = min(mins.x, world.x)
            mins.y = min(mins.y, world.y)
            mins.z = min(mins.z, world.z)
            maxs.x = max(maxs.x, world.x)
            maxs.y = max(maxs.y, world.y)
            maxs.z = max(maxs.z, world.z)
    return mins, maxs


def normalize_origin(root: bpy.types.Object) -> None:
    meshes = mesh_objects(root)
    bpy.context.view_layer.update()
    mins, maxs = world_bbox(meshes)
    center_xy = Vector(((mins.x + maxs.x) * 0.5, (mins.y + maxs.y) * 0.5, mins.z))
    root.location -= center_xy
    bpy.context.view_layer.update()


def load_image(path: Path) -> bpy.types.Image | None:
    if not path.is_file():
        return None
    return bpy.data.images.load(str(path), check_existing=True)


def principled_bsdf(material: bpy.types.Material) -> bpy.types.Node:
    nodes = material.node_tree.nodes
    for node in nodes:
        if node.type == "BSDF_PRINCIPLED":
            return node
    raise RuntimeError(f"No Principled BSDF on {material.name}")


def link_texture(
    material: bpy.types.Material,
    image: bpy.types.Image,
    socket_name: str,
    *,
    non_color: bool,
    normal_map: bool = False,
) -> None:
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    tex = nodes.new("ShaderNodeTexImage")
    tex.image = image
    tex.label = image.name
    if non_color:
        image.colorspace_settings.name = "Non-Color"
        tex.image.colorspace_settings.name = "Non-Color"
    bsdf = principled_bsdf(material)
    if normal_map:
        nrm = nodes.new("ShaderNodeNormalMap")
        links.new(tex.outputs["Color"], nrm.inputs["Color"])
        links.new(nrm.outputs["Normal"], bsdf.inputs["Normal"])
        return
    if socket_name not in bsdf.inputs:
        return
    links.new(tex.outputs["Color"], bsdf.inputs[socket_name])


def assign_pbr_maps(root: bpy.types.Object) -> None:
    base = load_image(SOURCE_DIR / f"{TEXTURE_STEM}.png")
    metallic = load_image(SOURCE_DIR / f"{TEXTURE_STEM}_metallic.png")
    roughness = load_image(SOURCE_DIR / f"{TEXTURE_STEM}_roughness.png")
    normal = load_image(SOURCE_DIR / f"{TEXTURE_STEM}_normal.png")
    emission = load_image(SOURCE_DIR / f"{TEXTURE_STEM}_emission.png")

    for obj in mesh_objects(root):
        if not obj.data.materials:
            mat = bpy.data.materials.new(name="Rover_PBR")
            mat.use_nodes = True
            obj.data.materials.append(mat)
        for slot in obj.material_slots:
            mat = slot.material
            if mat is None:
                continue
            mat.use_nodes = True
            mat.name = "Rover_PBR"
            if base:
                link_texture(mat, base, "Base Color", non_color=False)
            if metallic:
                link_texture(mat, metallic, "Metallic", non_color=True)
            if roughness:
                link_texture(mat, roughness, "Roughness", non_color=True)
            if normal:
                link_texture(mat, normal, "Normal", non_color=True, normal_map=True)
            if emission:
                link_texture(mat, emission, "Emission Color", non_color=False)
                principled_bsdf(mat).inputs["Emission Strength"].default_value = 1.0


def setup_world_and_lights() -> None:
    world = bpy.data.worlds.new("Sprite_World")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.04, 0.045, 0.055, 1.0)
        bg.inputs["Strength"].default_value = 0.35

    def add_light(name: str, light_type: str, location: tuple[float, float, float], energy: float, size: float) -> None:
        light_data = bpy.data.lights.new(name=name, type=light_type)
        light_data.energy = energy
        if hasattr(light_data, "shadow_soft_size"):
            light_data.shadow_soft_size = size
        light_obj = bpy.data.objects.new(name, light_data)
        bpy.context.scene.collection.objects.link(light_obj)
        light_obj.location = location
        return light_obj

    key = add_light("Sprite_Key", "AREA", (2.4, -3.2, 5.5), 250.0, 1.4)
    key.data.size = 3.0
    fill = add_light("Sprite_Fill", "AREA", (-3.0, 1.5, 3.2), 80.0, 2.0)
    fill.data.size = 4.0
    rim = add_light("Sprite_Rim", "AREA", (0.2, 3.5, 2.8), 40.0, 1.5)
    rim.data.size = 2.5
    key.rotation_euler = (math.radians(55), 0.0, math.radians(35))
    fill.rotation_euler = (math.radians(70), 0.0, math.radians(-120))
    rim.rotation_euler = (math.radians(75), 0.0, math.radians(180))


def camera_location() -> Vector:
    elev = math.radians(CAMERA_ELEVATION_DEG)
    azim = math.radians(CAMERA_AZIMUTH_DEG)
    horizontal = CAMERA_DISTANCE * math.cos(elev)
    return Vector(
        (
            horizontal * math.sin(azim),
            -horizontal * math.cos(azim),
            CAMERA_DISTANCE * math.sin(elev),
        )
    )


def setup_camera(ortho_scale: float) -> bpy.types.Object:
    cam_data = bpy.data.cameras.new("Sprite_Camera")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = ortho_scale
    cam_data.clip_start = CLIP_START
    cam_data.clip_end = CLIP_END
    cam = bpy.data.objects.new("Sprite_Camera", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = camera_location()

    constraint = cam.constraints.new(type="TRACK_TO")
    constraint.target = bpy.data.objects["Rover_Root"]
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"
    cam.rotation_euler[1] = math.radians(CAMERA_ROLL_DEG)

    bpy.context.scene.camera = cam
    return cam


def fit_ortho_scale(root: bpy.types.Object) -> float:
    meshes = mesh_objects(root)
    bpy.context.view_layer.update()
    mins, maxs = world_bbox(meshes)
    size = max(maxs.x - mins.x, maxs.y - mins.y, maxs.z - mins.z)
    return max(size / ORTHO_FILL, 0.01)


def configure_render() -> None:
    scene = bpy.context.scene
    if "BLENDER_EEVEE_NEXT" in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    else:
        scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = FRAME_SIZE
    scene.render.resolution_y = FRAME_SIZE
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.compression = 15
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = SAMPLES
        if hasattr(scene.eevee, "use_shadows"):
            scene.eevee.use_shadows = True


FACING_NAMES = (
    "n",
    "nne",
    "ne",
    "ene",
    "e",
    "ese",
    "se",
    "sse",
    "s",
    "ssw",
    "sw",
    "wsw",
    "w",
    "wnw",
    "nw",
    "nnw",
)


def facing_name(index: int) -> str:
    return FACING_NAMES[index]


def render_frames(root: bpy.types.Object) -> list[Path]:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    paths: list[Path] = []
    scene = bpy.context.scene
    for index in range(FRAME_COUNT):
        yaw = -index * YAW_STEP_DEG
        root.rotation_euler = (0.0, 0.0, math.radians(MESH_FORWARD_OFFSET_DEG + yaw))
        bpy.context.view_layer.update()
        out = OUTPUT_DIR / f"rover_{facing_name(index)}.png"
        scene.render.filepath = str(out)
        bpy.ops.render.render(write_still=True)
        paths.append(out)
        print(f"Rendered {out.name} yaw={yaw}")
    root.rotation_euler = (0.0, 0.0, 0.0)
    return paths


def pack_spritesheet(frame_paths: list[Path]) -> Path:
    width = FRAME_SIZE * FRAME_COUNT
    height = FRAME_SIZE
    sheet = bpy.data.images.new("Rover_Spritesheet", width=width, height=height, alpha=True)
    pixels = [0.0] * (width * height * 4)

    for index, path in enumerate(frame_paths):
        image = bpy.data.images.load(str(path), check_existing=True)
        image.scale(FRAME_SIZE, FRAME_SIZE)
        src = list(image.pixels)
        x0 = index * FRAME_SIZE
        for y in range(FRAME_SIZE):
            for x in range(FRAME_SIZE):
                si = (y * FRAME_SIZE + x) * 4
                di = (y * width + x0 + x) * 4
                pixels[di : di + 4] = src[si : si + 4]

    sheet.pixels = pixels
    out = OUTPUT_DIR / "rover.png"
    sheet.filepath_raw = str(out)
    sheet.file_format = "PNG"
    sheet.save()
    return out


def camera_report(ortho_scale: float) -> dict:
    loc = camera_location()
    return {
        "projection": "orthographic",
        "elevation_deg": CAMERA_ELEVATION_DEG,
        "azimuth_deg": CAMERA_AZIMUTH_DEG,
        "roll_deg": CAMERA_ROLL_DEG,
        "distance": CAMERA_DISTANCE,
        "ortho_scale": round(ortho_scale, 6),
        "clip_start": CLIP_START,
        "clip_end": CLIP_END,
        "resolution": [FRAME_SIZE, FRAME_SIZE],
        "frame_count": FRAME_COUNT,
        "yaw_step_deg": YAW_STEP_DEG,
        "mesh_forward_offset_deg": MESH_FORWARD_OFFSET_DEG,
        "import_axis_forward": IMPORT_AXIS_FORWARD,
        "import_axis_up": IMPORT_AXIS_UP,
        "camera_location": [round(loc.x, 6), round(loc.y, 6), round(loc.z, 6)],
        "yaw_table": [
            {
                "index": i,
                "yaw_deg": -i * YAW_STEP_DEG,
                "facing": facing_name(i),
            }
            for i in range(FRAME_COUNT)
        ],
    }


def main() -> None:
    if not FBX_PATH.is_file():
        raise FileNotFoundError(FBX_PATH)

    clear_scene()
    root = import_fbx(FBX_PATH)
    normalize_origin(root)
    assign_pbr_maps(root)
    setup_world_and_lights()
    ortho_scale = fit_ortho_scale(root)
    setup_camera(ortho_scale)
    configure_render()

    report = camera_report(ortho_scale)
    print("SPRITE_CAMERA " + json.dumps(report))

    frames = render_frames(root)
    sheet = pack_spritesheet(frames)
    print(f"Spritesheet {sheet}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
