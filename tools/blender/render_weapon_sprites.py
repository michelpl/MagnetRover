"""
Render weapon-base (16-dir) and laser-cannon (32-dir) sprites with the locked game camera.

Scale is derived from the rover FBX; ortho_scale is the rover v1 value so pixels match.

Run:
  blender --background --python tools/blender/render_weapon_sprites.py
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

# ---------------------------------------------------------------------------
# Parameters (keep in sync with SPRITE_CAMERA.md)
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[2]
ROVER_DIR = (
    REPO_ROOT
    / "ConceptArt"
    / "Meshy_AI_Lunar_Rover_Mini_0826181139_texture_fbx"
)
ROVER_FBX = ROVER_DIR / "Meshy_AI_Lunar_Rover_Mini_0826181139_texture.fbx"
ROVER_TEXTURE_STEM = "Meshy_AI_Lunar_Rover_Mini_0826181139_texture"

WEAPON_DIR = REPO_ROOT / "ConceptArt" / "Weapons"
BASE_DIR = WEAPON_DIR / "WeaponBase"
CANNON_DIR = WEAPON_DIR / "LaserCannon"
BASE_FBX = BASE_DIR / "Meshy_AI_model.fbx"
CANNON_FBX = CANNON_DIR / "Meshy_AI_model.fbx"

OUTPUT_DIR = REPO_ROOT / "public" / "assets" / "sprites" / "weapons"
DEBUG_DIR = OUTPUT_DIR / "_debug"

FRAME_SIZE = 256
BASE_FRAME_COUNT = 16
CANNON_FRAME_COUNT = 32
BASE_YAW_STEP_DEG = 22.5
CANNON_YAW_STEP_DEG = 11.25
CANNON_SHEET_COLS = 8
CANNON_SHEET_ROWS = 4

# Rest-pose offsets so frame 0 points the muzzle / disc toward +Y (top of PNG).
ROVER_FORWARD_OFFSET_DEG = -90.0
BASE_FORWARD_OFFSET_DEG = -90.0
CANNON_FORWARD_OFFSET_DEG = -90.0

CAMERA_ELEVATION_DEG = 75.0
CAMERA_AZIMUTH_DEG = 0.0
CAMERA_ROLL_DEG = 0.0
CAMERA_DISTANCE = 6.0
ORTHO_SCALE = 2.713699
CLIP_START = 0.01
CLIP_END = 100.0

IMPORT_AXIS_FORWARD = "-Z"
IMPORT_AXIS_UP = "Y"

# Disc diameter as a fraction of rover XY body width (concept: ~1/3–1/2 of roof).
BASE_DIAMETER_FRAC = 0.38
# Cannon max XY relative to scaled disc diameter (housing fills most of the disc).
CANNON_SIZE_FRAC = 1.7
# Sit the assembly slightly above the rover AABB top so it does not z-fight.
ROOF_GAP = 0.04

SAMPLES = 32


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (bpy.data.meshes, bpy.data.materials, bpy.data.images, bpy.data.cameras, bpy.data.lights):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def import_fbx(path: Path, root_name: str, mesh_prefix: str) -> bpy.types.Object:
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
        obj.name = f"{mesh_prefix}_{obj.name}"
        if obj.data:
            obj.data.name = f"{obj.name}_Data"
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    mesh = bpy.context.view_layer.objects.active
    mesh.name = f"{mesh_prefix}_Mesh"
    if mesh.data:
        mesh.data.name = f"{mesh_prefix}_Mesh_Data"

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0.0, 0.0, 0.0))
    root = bpy.context.active_object
    root.name = root_name
    mesh.parent = root
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


def root_bbox(root: bpy.types.Object) -> tuple[Vector, Vector]:
    bpy.context.view_layer.update()
    return world_bbox(mesh_objects(root))


def xy_size(mins: Vector, maxs: Vector) -> float:
    return max(maxs.x - mins.x, maxs.y - mins.y)


def normalize_ground_center(root: bpy.types.Object) -> None:
    mins, maxs = root_bbox(root)
    center_xy = Vector(((mins.x + maxs.x) * 0.5, (mins.y + maxs.y) * 0.5, mins.z))
    root.location -= center_xy
    bpy.context.view_layer.update()


def set_uniform_scale(root: bpy.types.Object, scale: float) -> None:
    root.scale = (scale, scale, scale)
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


def find_map(directory: Path, needle: str, *, exclude: str | None = None) -> Path | None:
    needle_l = needle.lower()
    exclude_l = exclude.lower() if exclude else None
    for path in sorted(directory.iterdir()):
        if path.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            continue
        name = path.name.lower()
        if needle_l not in name:
            continue
        if exclude_l and exclude_l in name:
            continue
        return path
    return None


def find_albedo(directory: Path) -> Path | None:
    for path in sorted(directory.iterdir()):
        if path.suffix.lower() != ".png":
            continue
        name = path.name.lower()
        if any(token in name for token in ("metallic", "roughness", "normal", "emission")):
            continue
        if "texture" in name:
            return path
    return None


def assign_pbr_maps(root: bpy.types.Object, directory: Path, albedo_stem: str | None = None) -> None:
    if albedo_stem:
        albedo = load_image(directory / f"{albedo_stem}.png")
        metallic = load_image(directory / f"{albedo_stem}_metallic.png")
        roughness = load_image(directory / f"{albedo_stem}_roughness.png")
        normal = load_image(directory / f"{albedo_stem}_normal.png")
        emission = load_image(directory / f"{albedo_stem}_emission.png")
    else:
        albedo_path = find_albedo(directory)
        albedo = load_image(albedo_path) if albedo_path else None
        metallic_path = find_map(directory, "metallic", exclude="metallic_roughness")
        metallic = load_image(metallic_path) if metallic_path else None
        roughness_path = find_map(directory, "roughness", exclude="metallic_roughness")
        roughness = load_image(roughness_path) if roughness_path else None
        normal_path = find_map(directory, "normal")
        normal = load_image(normal_path) if normal_path else None
        emission_path = find_map(directory, "emission")
        emission = load_image(emission_path) if emission_path else None

    mat_name = f"{root.name}_PBR"
    for obj in mesh_objects(root):
        if not obj.data.materials:
            mat = bpy.data.materials.new(name=mat_name)
            mat.use_nodes = True
            obj.data.materials.append(mat)
        for slot in obj.material_slots:
            mat = slot.material
            if mat is None:
                continue
            mat.use_nodes = True
            mat.name = mat_name
            if albedo:
                link_texture(mat, albedo, "Base Color", non_color=False)
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


def setup_camera(look_at: bpy.types.Object, ortho_scale: float) -> bpy.types.Object:
    cam_data = bpy.data.cameras.new("Sprite_Camera")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = ortho_scale
    cam_data.clip_start = CLIP_START
    cam_data.clip_end = CLIP_END
    cam = bpy.data.objects.new("Sprite_Camera", cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = camera_location()

    constraint = cam.constraints.new(type="TRACK_TO")
    constraint.target = look_at
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"
    cam.rotation_euler[1] = math.radians(CAMERA_ROLL_DEG)

    bpy.context.scene.camera = cam
    return cam


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


FACING_NAMES_16 = (
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


def set_hide(root: bpy.types.Object, hide: bool) -> None:
    root.hide_render = hide
    root.hide_viewport = hide
    for obj in root.children_recursive:
        obj.hide_render = hide
        obj.hide_viewport = hide


def set_yaw(root: bpy.types.Object, forward_offset_deg: float, yaw_clockwise_deg: float) -> None:
    # Clockwise from north matches Phaser; Blender Z-up yaw is applied as negative Z.
    root.rotation_euler = (0.0, 0.0, math.radians(forward_offset_deg - yaw_clockwise_deg))
    bpy.context.view_layer.update()


def render_still(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)
    print(f"Rendered {path.name}")


def copy_frame_pixels(
    dest: list[float],
    dest_width: int,
    dest_height: int,
    src: list[float],
    src_size: int,
    dest_x: int,
    dest_y_from_bottom: int,
) -> None:
    for y in range(src_size):
        for x in range(src_size):
            si = (y * src_size + x) * 4
            di = ((dest_y_from_bottom + y) * dest_width + dest_x + x) * 4
            dest[di : di + 4] = src[si : si + 4]


def pack_strip(frame_paths: list[Path], out: Path, name: str) -> Path:
    width = FRAME_SIZE * len(frame_paths)
    height = FRAME_SIZE
    sheet = bpy.data.images.new(name, width=width, height=height, alpha=True)
    pixels = [0.0] * (width * height * 4)
    for index, path in enumerate(frame_paths):
        image = bpy.data.images.load(str(path), check_existing=True)
        image.scale(FRAME_SIZE, FRAME_SIZE)
        copy_frame_pixels(pixels, width, height, list(image.pixels), FRAME_SIZE, index * FRAME_SIZE, 0)
    sheet.pixels = pixels
    sheet.filepath_raw = str(out)
    sheet.file_format = "PNG"
    sheet.save()
    return out


def pack_grid(frame_paths: list[Path], out: Path, name: str, cols: int, rows: int) -> Path:
    if len(frame_paths) != cols * rows:
        raise ValueError(f"Expected {cols * rows} frames, got {len(frame_paths)}")
    width = FRAME_SIZE * cols
    height = FRAME_SIZE * rows
    sheet = bpy.data.images.new(name, width=width, height=height, alpha=True)
    pixels = [0.0] * (width * height * 4)
    for index, path in enumerate(frame_paths):
        image = bpy.data.images.load(str(path), check_existing=True)
        image.scale(FRAME_SIZE, FRAME_SIZE)
        col = index % cols
        row_from_top = index // cols
        y_from_bottom = (rows - 1 - row_from_top) * FRAME_SIZE
        copy_frame_pixels(
            pixels,
            width,
            height,
            list(image.pixels),
            FRAME_SIZE,
            col * FRAME_SIZE,
            y_from_bottom,
        )
    sheet.pixels = pixels
    sheet.filepath_raw = str(out)
    sheet.file_format = "PNG"
    sheet.save()
    return out


def recenter_xy(root: bpy.types.Object) -> None:
    mins, maxs = root_bbox(root)
    root.location.x -= (mins.x + maxs.x) * 0.5
    root.location.y -= (mins.y + maxs.y) * 0.5
    bpy.context.view_layer.update()


def place_bottom_at_z(root: bpy.types.Object, world_z: float) -> None:
    mins, _maxs = root_bbox(root)
    root.location.z += world_z - mins.z
    bpy.context.view_layer.update()


def scale_to_target_xy(root: bpy.types.Object, target_xy: float) -> float:
    mins, maxs = root_bbox(root)
    current = xy_size(mins, maxs)
    if current <= 1e-8:
        raise RuntimeError(f"{root.name} has empty XY bounds")
    factor = target_xy / current
    set_uniform_scale(root, factor)
    return factor


def main() -> None:
    for path in (ROVER_FBX, BASE_FBX, CANNON_FBX):
        if not path.is_file():
            raise FileNotFoundError(path)

    clear_scene()
    rover = import_fbx(ROVER_FBX, "Rover_Root", "Rover")
    base = import_fbx(BASE_FBX, "WeaponBase_Root", "WeaponBase")
    cannon = import_fbx(CANNON_FBX, "LaserCannon_Root", "LaserCannon")

    normalize_ground_center(rover)
    normalize_ground_center(base)
    normalize_ground_center(cannon)

    assign_pbr_maps(rover, ROVER_DIR, ROVER_TEXTURE_STEM)
    assign_pbr_maps(base, BASE_DIR)
    assign_pbr_maps(cannon, CANNON_DIR)

    rover_mins, rover_maxs = root_bbox(rover)
    rover_xy = xy_size(rover_mins, rover_maxs)
    roof_z = rover_maxs.z + ROOF_GAP

    base_scale = scale_to_target_xy(base, rover_xy * BASE_DIAMETER_FRAC)
    base_mins, base_maxs = root_bbox(base)
    base_xy = xy_size(base_mins, base_maxs)
    cannon_scale = scale_to_target_xy(cannon, base_xy * CANNON_SIZE_FRAC)

    # Disc and barrel share the same XY axis (disc hole). Do not AABB-center
    # the cannon or the barrel midpoint drifts off the mount.
    place_bottom_at_z(base, roof_z)
    recenter_xy(base)
    place_bottom_at_z(cannon, root_bbox(base)[1].z)
    cannon.location.x = base.location.x
    cannon.location.y = base.location.y
    bpy.context.view_layer.update()

    look_at = bpy.data.objects.new("Sprite_LookAt", None)
    bpy.context.scene.collection.objects.link(look_at)
    look_at.location = (0.0, 0.0, 0.0)

    setup_world_and_lights()
    setup_camera(look_at, ORTHO_SCALE)
    configure_render()

    print(
        "BOUNDS "
        + json.dumps(
            {
                "rover": [round(v, 4) for v in (*rover_mins, *rover_maxs)],
                "base": [round(v, 4) for v in (*root_bbox(base)[0], *root_bbox(base)[1])],
                "cannon": [round(v, 4) for v in (*root_bbox(cannon)[0], *root_bbox(cannon)[1])],
            }
        )
    )

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    set_hide(rover, False)
    set_hide(base, False)
    set_hide(cannon, False)
    set_yaw(rover, ROVER_FORWARD_OFFSET_DEG, 135.0)
    set_yaw(base, BASE_FORWARD_OFFSET_DEG, 135.0)
    set_yaw(cannon, CANNON_FORWARD_OFFSET_DEG, 135.0)
    render_still(DEBUG_DIR / "rover_base_cannon_se.png")

    mount_z = (root_bbox(base)[0].z + root_bbox(base)[1].z) * 0.5
    look_at.location = (0.0, 0.0, mount_z)

    set_hide(rover, True)
    set_hide(cannon, True)
    set_hide(base, False)
    base_frames: list[Path] = []
    for index in range(BASE_FRAME_COUNT):
        yaw = index * BASE_YAW_STEP_DEG
        set_yaw(base, BASE_FORWARD_OFFSET_DEG, yaw)
        out = OUTPUT_DIR / f"weapon_base_{FACING_NAMES_16[index]}.png"
        render_still(out)
        base_frames.append(out)

    set_hide(base, True)
    set_hide(cannon, False)
    cannon_frames: list[Path] = []
    for index in range(CANNON_FRAME_COUNT):
        yaw = index * CANNON_YAW_STEP_DEG
        set_yaw(cannon, CANNON_FORWARD_OFFSET_DEG, yaw)
        out = OUTPUT_DIR / f"laser_cannon_{index:02d}.png"
        render_still(out)
        cannon_frames.append(out)

    base_sheet = pack_strip(base_frames, OUTPUT_DIR / "weapon_base.png", "WeaponBase_Spritesheet")
    cannon_sheet = pack_grid(
        cannon_frames,
        OUTPUT_DIR / "laser_cannon.png",
        "LaserCannon_Spritesheet",
        CANNON_SHEET_COLS,
        CANNON_SHEET_ROWS,
    )

    loc = camera_location()
    report = {
        "projection": "orthographic",
        "elevation_deg": CAMERA_ELEVATION_DEG,
        "azimuth_deg": CAMERA_AZIMUTH_DEG,
        "roll_deg": CAMERA_ROLL_DEG,
        "distance": CAMERA_DISTANCE,
        "ortho_scale": ORTHO_SCALE,
        "resolution": [FRAME_SIZE, FRAME_SIZE],
        "base_frame_count": BASE_FRAME_COUNT,
        "cannon_frame_count": CANNON_FRAME_COUNT,
        "cannon_sheet_grid": [CANNON_SHEET_COLS, CANNON_SHEET_ROWS],
        "rover_xy": round(rover_xy, 6),
        "base_xy": round(base_xy, 6),
        "base_scale": round(base_scale, 6),
        "cannon_scale": round(cannon_scale, 6),
        "base_diameter_frac": BASE_DIAMETER_FRAC,
        "cannon_size_frac": CANNON_SIZE_FRAC,
        "roof_z": round(roof_z, 6),
        "camera_location": [round(loc.x, 6), round(loc.y, 6), round(loc.z, 6)],
        "base_sheet": str(base_sheet),
        "cannon_sheet": str(cannon_sheet),
        "debug_composite": str(DEBUG_DIR / "rover_base_cannon_se.png"),
    }
    print("SPRITE_CAMERA " + json.dumps(report))
    print(f"Spritesheet {base_sheet}")
    print(f"Spritesheet {cannon_sheet}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
