"""
Standalone rover drop clip: 3/4 perspective studio shot, not gameplay sprites.

Run:
  blender --background --python tools/blender/render_rover_drop_clip.py
"""

from __future__ import annotations

import math
import shutil
import subprocess
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Vector

# ---------------------------------------------------------------------------
# Parameters
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_DIR = (
    REPO_ROOT
    / "ConceptArt"
    / "Meshy_AI_Lunar_Rover_Mini_0826181139_texture_fbx"
)
FBX_PATH = SOURCE_DIR / "Meshy_AI_Lunar_Rover_Mini_0826181139_texture.fbx"
TEXTURE_STEM = "Meshy_AI_Lunar_Rover_Mini_0826181139_texture"

CLIP_DIR = REPO_ROOT / "tools" / "blender" / "rover_drop"
TEXTURE_COPY_DIR = CLIP_DIR / "textures"
EYE_DIR = CLIP_DIR / "eyes"
BLEND_PATH = REPO_ROOT / "tools" / "blender" / "rover_drop.blend"
OUTPUT_DIR = REPO_ROOT / "tools" / "blender" / "output"
PREVIEW_MP4 = OUTPUT_DIR / "rover_drop_preview.mp4"
FRAME_DIR = OUTPUT_DIR / "rover_drop_frames"

IMPORT_AXIS_FORWARD = "-Z"
IMPORT_AXIS_UP = "Y"

FPS = 24
FRAME_START = 1
FRAME_END = 72
RESOLUTION = (640, 480)
SAMPLES = 12
CAMERA_FOCAL_MM = 35.0
CAMERA_ELEVATION_DEG = 48.0
CAMERA_AZIMUTH_DEG = 40.0
CAMERA_DISTANCE = 3.4
# Extra yaw so the face is 3/4, not dead-on to camera.
FACE_THREE_QUARTER_DEG = 32.0
# Tread bottoms sit this high above the studio plane (z=0).
GROUND_CLEARANCE = 0.08

DROP_HEIGHT = 1.35
IMPACT_FRAME = 28
SETTLE_FRAME = 52

EYE_SIZE = 128
EYE_CYAN = (0.25, 0.92, 1.0, 1.0)

# rest, wink_l, wink_r, happy, closed
EYE_REST = 0
EYE_WINK_L = 1
EYE_WINK_R = 2
EYE_HAPPY = 3
EYE_CLOSED = 4
EYE_NAMES = ("rest", "wink_l", "wink_r", "happy", "closed")


# ---------------------------------------------------------------------------
# Scene helpers
# ---------------------------------------------------------------------------
def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.images,
        bpy.data.cameras,
        bpy.data.lights,
        bpy.data.actions,
        bpy.data.collections,
    ):
        for item in list(block):
            if item.users == 0:
                block.remove(item)


def ensure_collection(name: str) -> bpy.types.Collection:
    collection = bpy.data.collections.get(name)
    if collection is None:
        collection = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(collection)
    return collection


def link_object_to_collection(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    for existing in list(obj.users_collection):
        existing.objects.unlink(obj)
    collection.objects.link(obj)


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


def unparent_keep_world(obj: bpy.types.Object) -> None:
    world = obj.matrix_world.copy()
    obj.parent = None
    obj.matrix_world = world


def apply_all_transforms(obj: bpy.types.Object) -> None:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)


def level_and_bake_mesh(obj: bpy.types.Object, clearance: float) -> None:
    bpy.context.view_layer.update()
    mesh = obj.data
    world = obj.matrix_world.copy()
    coords = [world @ vertex.co.copy() for vertex in mesh.vertices]
    max_abs_y = max(abs(co.y) for co in coords)
    treads = [co for co in coords if abs(co.y) >= max_abs_y * 0.52]
    if len(treads) < 12:
        treads = list(coords)
    mid_x = (min(co.x for co in treads) + max(co.x for co in treads)) * 0.5
    front = [co for co in treads if co.x <= mid_x]
    back = [co for co in treads if co.x > mid_x]
    left = [co for co in treads if co.y <= 0.0]
    right = [co for co in treads if co.y > 0.0]
    z_f = min(co.z for co in front)
    z_b = min(co.z for co in back)
    x_f = sum(co.x for co in front) / len(front)
    x_b = sum(co.x for co in back) / len(back)
    z_l = min(co.z for co in left)
    z_r = min(co.z for co in right)
    y_l = sum(co.y for co in left) / len(left)
    y_r = sum(co.y for co in right) / len(right)
    dx = x_f - x_b
    dy = y_r - y_l
    pitch = math.atan((z_f - z_b) / dx) if abs(dx) > 1e-5 else 0.0
    roll = math.atan((z_r - z_l) / dy) if abs(dy) > 1e-5 else 0.0
    rot = Matrix.Rotation(-roll, 3, "X") @ Matrix.Rotation(-pitch, 3, "Y")
    leveled = [rot @ co for co in coords]
    xs = [co.x for co in leveled]
    ys = [co.y for co in leveled]
    max_abs_y = max(abs(y) for y in ys)
    tread_z = min(co.z for co in leveled if abs(co.y) >= max_abs_y * 0.52)
    offset = Vector(((min(xs) + max(xs)) * 0.5, (min(ys) + max(ys)) * 0.5, tread_z - clearance))
    for vertex, co in zip(mesh.vertices, leveled):
        local = co - offset
        local.z = max(local.z, clearance)
        vertex.co = local
    mesh.update()
    obj.matrix_world = Matrix.Identity(4)
    obj.location = (0.0, 0.0, 0.0)
    obj.rotation_euler = (0.0, 0.0, 0.0)
    obj.scale = (1.0, 1.0, 1.0)
    bpy.context.view_layer.update()
    body_z = min(
        (v.co.z for v in mesh.vertices if abs(v.co.y) < max_abs_y * 0.45),
        default=clearance,
    )
    print(
        f"LEVEL pitch={math.degrees(pitch):.2f}deg roll={math.degrees(roll):.2f}deg "
        f"zmin={min(v.co.z for v in mesh.vertices):.4f} body_z={body_z:.4f} tread_z={clearance:.4f}"
    )


def bake_mesh_on_ground(obj: bpy.types.Object, clearance: float) -> None:
    level_and_bake_mesh(obj, clearance)


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

    for obj in meshes:
        unparent_keep_world(obj)
        obj.name = f"Rover_Mesh_{obj.name}"
        if obj.data:
            obj.data.name = f"{obj.name}_Data"

    for obj in imported:
        if obj.type != "MESH" and obj.name in bpy.data.objects:
            bpy.data.objects.remove(obj, do_unlink=True)

    for obj in meshes:
        apply_all_transforms(obj)

    bpy.ops.object.select_all(action="DESELECT")
    for obj in meshes:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1:
        bpy.ops.object.join()
    rover = bpy.context.view_layer.objects.active
    rover.name = "Rover_Mesh"
    if rover.data:
        rover.data.name = "Rover_Mesh_Data"
    bake_mesh_on_ground(rover, GROUND_CLEARANCE)

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0.0, 0.0, 0.0))
    root = bpy.context.active_object
    root.name = "Rover_Root"
    root.rotation_mode = "XYZ"
    rover.parent = root
    rover.matrix_parent_inverse.identity()
    rover.matrix_basis = Matrix.Identity(4)
    return root


def lowest_world_z(root: bpy.types.Object) -> float:
    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    z_min = math.inf
    for obj in mesh_objects(root):
        if obj.type != "MESH" or "Eye" in obj.name:
            continue
        evaluated = obj.evaluated_get(depsgraph)
        mesh = evaluated.to_mesh()
        matrix = evaluated.matrix_world
        for vertex in mesh.vertices:
            z_min = min(z_min, (matrix @ vertex.co).z)
        evaluated.to_mesh_clear()
    return z_min if z_min < math.inf else 0.0


def snap_geometry_to_ground(root: bpy.types.Object, pad: float = 0.12) -> None:
    z_min = lowest_world_z(root)
    lift = pad - z_min
    world_delta = Vector((0.0, 0.0, lift))
    parent_rot = root.matrix_world.to_3x3().inverted()
    local_delta = parent_rot @ world_delta
    print(f"GROUND zmin={z_min:.4f} lift={lift:.4f}")
    for obj in root.children:
        if obj.type != "MESH" or "Eye" in obj.name:
            continue
        obj.location += local_delta
        print(f"  lifted {obj.name} loc={tuple(round(c, 4) for c in obj.location)}")
    bpy.context.view_layer.update()
    print(f"GROUND zmin after={lowest_world_z(root):.4f}")


def mute_action(obj: bpy.types.Object):
    ad = obj.animation_data
    saved_action = ad.action if ad else None
    saved_slot = getattr(ad, "action_slot", None) if ad else None
    if ad is not None:
        ad.action = None
    return ad, saved_action, saved_slot


def restore_action(ad, saved_action, saved_slot) -> None:
    if ad is None:
        return
    ad.action = saved_action
    if saved_slot is not None and hasattr(ad, "action_slot"):
        try:
            ad.action_slot = saved_slot
        except (TypeError, ValueError):
            pass


def location_above_ground(
    root: bpy.types.Object,
    xy: tuple[float, float],
    extra_z: float,
    rotation: tuple[float, float, float],
    scale: tuple[float, float, float],
    pad: float = GROUND_CLEARANCE,
) -> Vector:
    saved_loc = root.location.copy()
    saved_rot = tuple(root.rotation_euler)
    saved_scale = tuple(root.scale)
    ad, saved_action, saved_slot = mute_action(root)
    root.location = Vector((xy[0], xy[1], 0.0))
    root.rotation_euler = rotation
    root.scale = scale
    bpy.context.view_layer.update()
    z_min = lowest_world_z(root)
    root.location = saved_loc
    root.rotation_euler = saved_rot
    root.scale = saved_scale
    restore_action(ad, saved_action, saved_slot)
    bpy.context.view_layer.update()
    return Vector((xy[0], xy[1], extra_z + (pad - z_min)))


def load_image(path: Path) -> bpy.types.Image | None:
    if not path.is_file():
        return None
    return bpy.data.images.load(str(path), check_existing=True)


def principled_bsdf(material: bpy.types.Material) -> bpy.types.Node:
    for node in material.node_tree.nodes:
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


def force_load_pixels(image: bpy.types.Image) -> None:
    if image.size[0] == 0 or image.size[1] == 0:
        raise RuntimeError(f"Image has no size: {image.name}")
    _ = image.pixels[0]


def copy_source_texture(filename: str) -> bpy.types.Image | None:
    src = SOURCE_DIR / filename
    if not src.is_file():
        return None
    TEXTURE_COPY_DIR.mkdir(parents=True, exist_ok=True)
    dest = TEXTURE_COPY_DIR / filename
    shutil.copy2(src, dest)
    image = bpy.data.images.load(str(dest), check_existing=False)
    force_load_pixels(image)
    return image


def rebuild_material() -> bpy.types.Material:
    mat = bpy.data.materials.new(name="Rover_PBR_Clip")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    for node in list(nodes):
        if node.type not in {"BSDF_PRINCIPLED", "OUTPUT_MATERIAL"}:
            nodes.remove(node)
    return mat


def blackout_cyan_pixels(image: bpy.types.Image) -> None:
    pixels = list(image.pixels)
    count = len(pixels) // 4
    for index in range(count):
        base = index * 4
        red = pixels[base]
        green = pixels[base + 1]
        blue = pixels[base + 2]
        if blue > 0.22 and green > 0.18 and blue > red * 1.25 and green > red * 1.05:
            pixels[base] = 0.0
            pixels[base + 1] = 0.0
            pixels[base + 2] = 0.0
    image.pixels = pixels


def save_image_png(image: bpy.types.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.filepath_raw = str(path)
    image.file_format = "PNG"
    image.save()


def assign_pbr_maps(root: bpy.types.Object) -> None:
    TEXTURE_COPY_DIR.mkdir(parents=True, exist_ok=True)
    base = copy_source_texture(f"{TEXTURE_STEM}.png")
    metallic = copy_source_texture(f"{TEXTURE_STEM}_metallic.png")
    roughness = copy_source_texture(f"{TEXTURE_STEM}_roughness.png")
    normal = copy_source_texture(f"{TEXTURE_STEM}_normal.png")
    emission = copy_source_texture(f"{TEXTURE_STEM}_emission.png")

    if base:
        blackout_cyan_pixels(base)
        save_image_png(base, TEXTURE_COPY_DIR / "rover_albedo_no_eyes.png")
    if emission:
        blackout_cyan_pixels(emission)
        save_image_png(emission, TEXTURE_COPY_DIR / "rover_emission_no_eyes.png")

    mat = rebuild_material()
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
        principled_bsdf(mat).inputs["Emission Strength"].default_value = 0.25

    for obj in mesh_objects(root):
        obj.data.materials.clear()
        obj.data.materials.append(mat)


# ---------------------------------------------------------------------------
# Eyes
# ---------------------------------------------------------------------------
def _pixel_index(size: int, x: int, y: int) -> int:
    return (y * size + x) * 4


def _blend_pixel(pixels: list[float], size: int, x: int, y: int, color: tuple[float, float, float, float]) -> None:
    if x < 0 or y < 0 or x >= size or y >= size:
        return
    index = _pixel_index(size, x, y)
    alpha = color[3]
    src_a = pixels[index + 3]
    out_a = alpha + src_a * (1.0 - alpha)
    if out_a <= 1e-6:
        return
    for channel in range(3):
        pixels[index + channel] = (
            color[channel] * alpha + pixels[index + channel] * src_a * (1.0 - alpha)
        ) / out_a
    pixels[index + 3] = out_a


def _stamp_disk(
    pixels: list[float],
    size: int,
    cx: float,
    cy: float,
    radius: float,
    color: tuple[float, float, float, float],
) -> None:
    r_int = int(math.ceil(radius)) + 1
    for y in range(int(cy) - r_int, int(cy) + r_int + 1):
        for x in range(int(cx) - r_int, int(cx) + r_int + 1):
            dist = math.hypot(x - cx, y - cy)
            if dist <= radius - 0.6:
                _blend_pixel(pixels, size, x, y, color)
            elif dist <= radius + 0.6:
                edge = max(0.0, 1.0 - (dist - (radius - 0.6)))
                _blend_pixel(pixels, size, x, y, (color[0], color[1], color[2], color[3] * edge))


def _stamp_ring_arc(
    pixels: list[float],
    size: int,
    cx: float,
    cy: float,
    radius: float,
    thickness: float,
    color: tuple[float, float, float, float],
    y_min: float,
) -> None:
    outer = radius + thickness * 0.5
    inner = radius - thickness * 0.5
    span = int(math.ceil(outer)) + 1
    for y in range(int(cy) - span, int(cy) + span + 1):
        if y < y_min:
            continue
        for x in range(int(cx) - span, int(cx) + span + 1):
            dist = math.hypot(x - cx, y - cy)
            if inner <= dist <= outer:
                _blend_pixel(pixels, size, x, y, color)


def _stamp_dash(
    pixels: list[float],
    size: int,
    cx: float,
    cy: float,
    half_w: float,
    half_h: float,
    color: tuple[float, float, float, float],
) -> None:
    for y in range(int(cy - half_h) - 1, int(cy + half_h) + 2):
        for x in range(int(cx - half_w) - 1, int(cx + half_w) + 2):
            dx = abs(x - cx) / max(half_w, 0.001)
            dy = abs(y - cy) / max(half_h, 0.001)
            if dx <= 1.0 and dy <= 1.0:
                _blend_pixel(pixels, size, x, y, color)


def _blank_eye_pixels(size: int) -> list[float]:
    return [0.0] * (size * size * 4)


def make_expression_image(name: str, kind: str) -> bpy.types.Image:
    size = EYE_SIZE
    pixels = _blank_eye_pixels(size)
    left = (size * 0.33, size * 0.56)
    right = (size * 0.67, size * 0.56)
    radius = size * 0.11
    color = EYE_CYAN

    if kind == "rest":
        _stamp_disk(pixels, size, *left, radius, color)
        _stamp_disk(pixels, size, *right, radius, color)
    elif kind == "wink_l":
        _stamp_dash(pixels, size, left[0], left[1], radius * 1.15, radius * 0.28, color)
        _stamp_disk(pixels, size, *right, radius, color)
    elif kind == "wink_r":
        _stamp_disk(pixels, size, *left, radius, color)
        _stamp_dash(pixels, size, right[0], right[1], radius * 1.15, radius * 0.28, color)
    elif kind == "happy":
        _stamp_ring_arc(pixels, size, *left, radius * 0.95, radius * 0.42, color, left[1] - 1.0)
        _stamp_ring_arc(pixels, size, *right, radius * 0.95, radius * 0.42, color, right[1] - 1.0)
    elif kind == "closed":
        _stamp_dash(pixels, size, left[0], left[1], radius * 1.2, radius * 0.28, color)
        _stamp_dash(pixels, size, right[0], right[1], radius * 1.2, radius * 0.28, color)
    else:
        raise ValueError(kind)

    image = bpy.data.images.new(name, width=size, height=size, alpha=True)
    image.pixels = pixels
    save_image_png(image, EYE_DIR / f"eye_{kind}.png")
    return image


def build_eye_card(root: bpy.types.Object) -> bpy.types.Object:
    images = [make_expression_image(f"Eye_{name.title()}", name) for name in EYE_NAMES]
    meshes = [obj for obj in mesh_objects(root) if "Eye" not in obj.name]
    mesh = meshes[0]
    bpy.context.view_layer.update()
    local = [Vector(corner) for corner in mesh.bound_box]
    min_x = min(point.x for point in local)
    min_y = min(point.y for point in local)
    max_y = max(point.y for point in local)
    min_z = min(point.z for point in local)
    max_z = max(point.z for point in local)
    width = max(max_y - min_y, 0.05)
    height = max(max_z - min_z, 0.05)
    card_w = width * 0.28
    card_h = height * 0.16
    local_pos = Vector((min_x - 0.006, (min_y + max_y) * 0.5 - width * 0.06, min_z + height * 0.70))
    # Plane lies in local XY with +Z normal. Map: X=across face (+Y), Y=up (+Z), Z=out (-X).
    axes = Matrix(
        (
            (0.0, 0.0, -1.0),
            (1.0, 0.0, 0.0),
            (0.0, 1.0, 0.0),
        )
    )
    local_mat = axes.to_4x4()
    local_mat.translation = local_pos

    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 0.0, 0.0))
    card = bpy.context.active_object
    card.name = "Rover_EyeCard"
    card.data.name = "Rover_EyeCard_Mesh"
    card.scale = (card_w, card_h, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    card.parent = mesh
    card.matrix_parent_inverse.identity()
    card.matrix_basis = local_mat
    bpy.context.view_layer.update()
    card.visible_shadow = False
    if hasattr(card, "visible_volume_scatter"):
        card.visible_volume_scatter = False

    mat = bpy.data.materials.new(name="Rover_EyeCard_Mat")
    mat.use_nodes = True
    mat.blend_method = "BLEND"
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    for node in list(nodes):
        nodes.remove(node)
    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (860, 0)
    emission = nodes.new("ShaderNodeEmission")
    emission.location = (560, 80)
    emission.inputs["Strength"].default_value = 10.0
    transparent = nodes.new("ShaderNodeBsdfTransparent")
    transparent.location = (560, -80)
    mix_shader = nodes.new("ShaderNodeMixShader")
    mix_shader.location = (700, 0)
    rgb_to_bw = nodes.new("ShaderNodeRGBToBW")
    rgb_to_bw.location = (560, 220)
    mix_value = nodes.new("ShaderNodeValue")
    mix_value.name = "EyeIndex"
    mix_value.label = "EyeIndex"
    mix_value.location = (-480, 80)
    mix_value.outputs[0].default_value = float(EYE_REST)

    tex_nodes: list[bpy.types.Node] = []
    for index, image in enumerate(images):
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = image
        tex.interpolation = "Closest"
        tex.location = (-260, 220 - index * 160)
        tex_nodes.append(tex)

    def color_output(node: bpy.types.Node) -> bpy.types.NodeSocket:
        return node.outputs.get("Result") or node.outputs.get("Color") or node.outputs[0]

    def compare_mix(a: bpy.types.Node, b: bpy.types.Node, threshold: float, loc_y: float) -> bpy.types.Node:
        compare = nodes.new("ShaderNodeMath")
        compare.operation = "COMPARE"
        compare.location = (40, loc_y)
        compare.inputs[1].default_value = threshold
        compare.inputs[2].default_value = 0.45
        links.new(mix_value.outputs[0], compare.inputs[0])
        mix = nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.location = (240, loc_y)
        factor_in = mix.inputs.get("Factor") or mix.inputs[0]
        color_a = mix.inputs.get("A") or mix.inputs.get("Color1") or mix.inputs[6]
        color_b = mix.inputs.get("B") or mix.inputs.get("Color2") or mix.inputs[7]
        links.new(compare.outputs[0], factor_in)
        links.new(color_output(a), color_a)
        links.new(color_output(b), color_b)
        return mix

    mixed = tex_nodes[0]
    for index in range(1, len(tex_nodes)):
        mixed = compare_mix(mixed, tex_nodes[index], float(index), 200 - index * 140)

    links.new(color_output(mixed), emission.inputs["Color"])
    links.new(color_output(mixed), rgb_to_bw.inputs["Color"])
    links.new(rgb_to_bw.outputs["Val"], mix_shader.inputs[0])
    links.new(transparent.outputs["BSDF"], mix_shader.inputs[1])
    links.new(emission.outputs["Emission"], mix_shader.inputs[2])
    links.new(mix_shader.outputs["Shader"], output.inputs["Surface"])

    if card.data.materials:
        card.data.materials[0] = mat
    else:
        card.data.materials.append(mat)
    return card


def eye_index_node(card: bpy.types.Object) -> bpy.types.Node:
    mat = card.data.materials[0]
    return mat.node_tree.nodes["EyeIndex"]


# ---------------------------------------------------------------------------
# Studio
# ---------------------------------------------------------------------------
def setup_world_and_lights() -> None:
    world = bpy.data.worlds.new("Drop_Studio_World")
    bpy.context.scene.world = world
    world.use_nodes = True
    background = world.node_tree.nodes.get("Background")
    if background:
        background.inputs["Color"].default_value = (0.72, 0.75, 0.80, 1.0)
        background.inputs["Strength"].default_value = 0.7

    def add_area(name: str, location: tuple[float, float, float], energy: float, size: float, rot: tuple[float, float, float]) -> bpy.types.Object:
        data = bpy.data.lights.new(name=name, type="AREA")
        data.energy = energy
        data.size = size
        data.use_shadow = True
        if hasattr(data, "spread"):
            data.spread = math.radians(120.0)
        obj = bpy.data.objects.new(name, data)
        bpy.context.scene.collection.objects.link(obj)
        obj.location = location
        obj.rotation_euler = rot
        return obj

    add_area("Studio_Key", (1.6, -2.4, 5.2), 520.0, 3.6, (math.radians(55), 0.0, math.radians(28)))
    add_area("Studio_Fill", (-3.2, 0.6, 2.6), 140.0, 5.0, (math.radians(70), 0.0, math.radians(-110)))
    add_area("Studio_Rim", (0.4, 3.2, 2.4), 70.0, 2.4, (math.radians(75), 0.0, math.radians(180)))

    sun_data = bpy.data.lights.new(name="Studio_Sun", type="SUN")
    sun_data.energy = 4.5
    sun_data.angle = math.radians(18.0)
    sun_data.use_shadow = True
    sun = bpy.data.objects.new("Studio_Sun", sun_data)
    bpy.context.scene.collection.objects.link(sun)
    sun.location = (1.2, -1.8, 6.0)
    sun.rotation_euler = (math.radians(42.0), 0.0, math.radians(28.0))


def setup_ground() -> bpy.types.Object:
    bpy.ops.mesh.primitive_plane_add(size=12.0, location=(0.0, 0.0, 0.0))
    ground = bpy.context.active_object
    ground.name = "Studio_Ground"
    ground.data.name = "Studio_Ground_Mesh"
    mat = bpy.data.materials.new(name="Studio_Ground_Mat")
    mat.use_nodes = True
    bsdf = principled_bsdf(mat)
    bsdf.inputs["Base Color"].default_value = (0.22, 0.21, 0.19, 1.0)
    bsdf.inputs["Roughness"].default_value = 0.86
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = 0.08
    assign = ground.data.materials
    if assign:
        assign[0] = mat
    else:
        assign.append(mat)
    return ground


def setup_blob_shadow() -> bpy.types.Object:
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=(0.0, 0.0, 0.004))
    blob = bpy.context.active_object
    blob.name = "Contact_Shadow"
    blob.data.name = "Contact_Shadow_Mesh"
    blob.scale = (0.55, 0.38, 1.0)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    blob.visible_shadow = False

    mat = bpy.data.materials.new(name="Contact_Shadow_Mat")
    mat.use_nodes = True
    mat.blend_method = "BLEND"
    if hasattr(mat, "shadow_method"):
        mat.shadow_method = "NONE"
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    for node in list(nodes):
        nodes.remove(node)
    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (360, 0)
    transparent = nodes.new("ShaderNodeBsdfTransparent")
    transparent.location = (80, -80)
    emission = nodes.new("ShaderNodeEmission")
    emission.location = (80, 80)
    emission.inputs["Color"].default_value = (0.07, 0.07, 0.08, 1.0)
    emission.inputs["Strength"].default_value = 1.0
    mix = nodes.new("ShaderNodeMixShader")
    mix.location = (220, 0)
    value = nodes.new("ShaderNodeValue")
    value.name = "ShadowAlpha"
    value.label = "ShadowAlpha"
    value.location = (-120, 80)
    value.outputs[0].default_value = 0.45
    links.new(value.outputs[0], mix.inputs[0])
    links.new(transparent.outputs["BSDF"], mix.inputs[1])
    links.new(emission.outputs["Emission"], mix.inputs[2])
    links.new(mix.outputs["Shader"], output.inputs["Surface"])
    if blob.data.materials:
        blob.data.materials[0] = mat
    else:
        blob.data.materials.append(mat)
    return blob


def camera_location(distance: float) -> Vector:
    elev = math.radians(CAMERA_ELEVATION_DEG)
    azim = math.radians(CAMERA_AZIMUTH_DEG)
    horizontal = distance * math.cos(elev)
    return Vector(
        (
            horizontal * math.sin(azim),
            -horizontal * math.cos(azim),
            distance * math.sin(elev),
        )
    )


def facing_yaw_radians() -> float:
    azim = math.radians(CAMERA_AZIMUTH_DEG)
    face_to_camera = math.atan2(math.cos(azim), -math.sin(azim))
    return face_to_camera + math.radians(FACE_THREE_QUARTER_DEG)


def setup_camera(look_z: float, distance: float) -> bpy.types.Object:
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0.0, 0.0, look_z))
    look_at = bpy.context.active_object
    look_at.name = "Camera_LookAt"

    data = bpy.data.cameras.new("Drop_Camera")
    data.type = "PERSP"
    data.lens = CAMERA_FOCAL_MM
    data.clip_start = 0.05
    data.clip_end = 80.0
    cam = bpy.data.objects.new("Drop_Camera", data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = camera_location(distance)
    constraint = cam.constraints.new(type="TRACK_TO")
    constraint.target = look_at
    constraint.track_axis = "TRACK_NEGATIVE_Z"
    constraint.up_axis = "UP_Y"
    bpy.context.scene.camera = cam
    return cam


# ---------------------------------------------------------------------------
# Animation
# ---------------------------------------------------------------------------
def iter_action_fcurves(action: bpy.types.Action):
    if hasattr(action, "fcurves"):
        yield from action.fcurves
        return
    for layer in getattr(action, "layers", []):
        for strip in getattr(layer, "strips", []):
            for bag in getattr(strip, "channelbags", []):
                yield from bag.fcurves


def insert_key(
    obj: bpy.types.Object,
    data_path: str,
    frame: int,
    interpolation: str = "BEZIER",
    easing: str = "AUTO",
) -> None:
    obj.keyframe_insert(data_path=data_path, frame=frame)
    action = obj.animation_data.action if obj.animation_data else None
    if action is None:
        return
    for curve in iter_action_fcurves(action):
        if curve.data_path != data_path:
            continue
        for point in curve.keyframe_points:
            if abs(point.co.x - frame) < 0.01:
                point.interpolation = interpolation
                point.handle_left_type = "VECTOR"
                point.handle_right_type = "VECTOR"
                if hasattr(point, "easing"):
                    point.easing = easing


def key_node_value(node: bpy.types.Node, frame: int, value: float, interpolation: str = "CONSTANT") -> None:
    node.outputs[0].default_value = value
    node.outputs[0].keyframe_insert(data_path="default_value", frame=frame)
    tree = node.id_data
    action = tree.animation_data.action if tree.animation_data else None
    if action is None:
        return
    for curve in iter_action_fcurves(action):
        for point in curve.keyframe_points:
            if abs(point.co.x - frame) < 0.01:
                point.interpolation = interpolation


def key_transform(
    obj: bpy.types.Object,
    frame: int,
    location: Vector | None = None,
    rotation: tuple[float, float, float] | None = None,
    scale: tuple[float, float, float] | None = None,
    interpolation: str = "BEZIER",
    easing: str = "AUTO",
) -> None:
    if location is not None:
        obj.location = location
        insert_key(obj, "location", frame, interpolation, easing)
    if rotation is not None:
        obj.rotation_euler = rotation
        insert_key(obj, "rotation_euler", frame, interpolation, easing)
    if scale is not None:
        obj.scale = scale
        insert_key(obj, "scale", frame, interpolation, easing)


def animate_drop(
    root: bpy.types.Object,
    blob: bpy.types.Object,
    card: bpy.types.Object,
    drop_height: float,
    shadow_size: float,
    rover_h: float,
) -> None:
    yaw = facing_yaw_radians()
    rest_rot = (0.0, 0.0, yaw)
    # No pitch/roll: those dive the chassis through the floor and shear the treads.
    air_yaw = (0.0, 0.0, yaw + math.radians(8.0))
    mid_yaw = (0.0, 0.0, yaw - math.radians(4.0))
    upright = rest_rot
    unit = (1.0, 1.0, 1.0)

    key_transform(
        root,
        FRAME_START,
        location=location_above_ground(root, (0.0, 0.0), drop_height, air_yaw, unit),
        rotation=air_yaw,
        scale=unit,
        interpolation="LINEAR",
    )
    key_transform(
        root,
        10,
        location=location_above_ground(root, (0.02, -0.03), drop_height * 0.92, air_yaw, unit),
        rotation=air_yaw,
        scale=unit,
        interpolation="LINEAR",
    )
    key_transform(
        root,
        20,
        location=location_above_ground(root, (-0.03, 0.02), drop_height * 0.42, mid_yaw, unit),
        rotation=mid_yaw,
        scale=unit,
        interpolation="LINEAR",
    )
    key_transform(
        root,
        IMPACT_FRAME,
        location=location_above_ground(root, (0.0, 0.0), 0.06, upright, unit),
        rotation=upright,
        scale=unit,
        interpolation="LINEAR",
    )
    key_transform(
        root,
        IMPACT_FRAME + 5,
        location=location_above_ground(root, (0.0, 0.0), drop_height * 0.10, upright, unit),
        rotation=upright,
        scale=unit,
        interpolation="LINEAR",
    )
    key_transform(
        root,
        IMPACT_FRAME + 12,
        location=location_above_ground(root, (0.0, 0.0), 0.03, upright, unit),
        rotation=upright,
        scale=unit,
        interpolation="LINEAR",
    )
    key_transform(
        root,
        SETTLE_FRAME,
        location=location_above_ground(root, (0.0, 0.0), 0.0, upright, unit),
        rotation=upright,
        scale=unit,
        interpolation="LINEAR",
    )
    key_transform(
        root,
        FRAME_END,
        location=location_above_ground(root, (0.0, 0.0), 0.0, upright, unit),
        rotation=upright,
        scale=unit,
        interpolation="LINEAR",
    )

    # Contact blob: tight/faint in air, planted on land.
    blob_keys = (
        (FRAME_START, (0.62 * shadow_size, 0.44 * shadow_size, 1.0), 0.42),
        (20, (0.82 * shadow_size, 0.56 * shadow_size, 1.0), 0.52),
        (IMPACT_FRAME, (1.12 * shadow_size, 0.78 * shadow_size, 1.0), 0.72),
        (IMPACT_FRAME + 5, (0.92 * shadow_size, 0.64 * shadow_size, 1.0), 0.58),
        (SETTLE_FRAME, (0.98 * shadow_size, 0.68 * shadow_size, 1.0), 0.62),
        (FRAME_END, (0.98 * shadow_size, 0.68 * shadow_size, 1.0), 0.62),
    )
    alpha_node = blob.data.materials[0].node_tree.nodes["ShadowAlpha"]
    for frame, scale, alpha in blob_keys:
        blob.scale = scale
        insert_key(blob, "scale", frame, "BEZIER", "AUTO")
        key_node_value(alpha_node, frame, alpha, interpolation="BEZIER")

    # Keep the blob under the rover as it drifts in XY.
    for frame, loc in (
        (FRAME_START, Vector((0.0, 0.0, 0.004))),
        (10, Vector((0.02, -0.03, 0.004))),
        (20, Vector((-0.04, 0.02, 0.004))),
        (IMPACT_FRAME, Vector((0.0, 0.0, 0.004))),
        (FRAME_END, Vector((0.0, 0.0, 0.004))),
    ):
        blob.location = loc
        insert_key(blob, "location", frame, "BEZIER", "AUTO")

    eye = eye_index_node(card)
    eye_keys = (
        (FRAME_START, EYE_REST),
        (12, EYE_REST),
        (18, EYE_REST),
        (IMPACT_FRAME - 2, EYE_CLOSED),
        (IMPACT_FRAME + 8, EYE_CLOSED),
        (IMPACT_FRAME + 12, EYE_REST),
        (38, EYE_REST),
        (40, EYE_CLOSED),
        (42, EYE_REST),
        (46, EYE_HAPPY),
        (58, EYE_HAPPY),
        (60, EYE_WINK_R),
        (64, EYE_REST),
        (FRAME_END, EYE_REST),
    )
    for frame, index in eye_keys:
        key_node_value(eye, frame, float(index), interpolation="CONSTANT")


def configure_render(*, use_ffmpeg: bool) -> None:
    scene = bpy.context.scene
    engines = bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items
    if "BLENDER_EEVEE_NEXT" in engines:
        scene.render.engine = "BLENDER_EEVEE_NEXT"
    else:
        scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = RESOLUTION[0]
    scene.render.resolution_y = RESOLUTION[1]
    scene.render.resolution_percentage = 100
    scene.render.fps = FPS
    scene.render.film_transparent = False
    scene.frame_start = FRAME_START
    scene.frame_end = FRAME_END
    try:
        scene.view_settings.view_transform = "Standard"
        scene.view_settings.exposure = 0.35
    except Exception:
        pass
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = SAMPLES
        if hasattr(scene.eevee, "use_shadows"):
            scene.eevee.use_shadows = True
        if hasattr(scene.eevee, "use_contact_shadows"):
            scene.eevee.use_contact_shadows = True

    if use_ffmpeg:
        scene.render.image_settings.file_format = "FFMPEG"
        scene.render.ffmpeg.format = "MPEG4"
        scene.render.ffmpeg.codec = "H264"
        if hasattr(scene.render.ffmpeg, "constant_rate_factor"):
            scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
        scene.render.filepath = str(PREVIEW_MP4)
    else:
        FRAME_DIR.mkdir(parents=True, exist_ok=True)
        scene.render.image_settings.file_format = "PNG"
        scene.render.image_settings.color_mode = "RGB"
        scene.render.filepath = str(FRAME_DIR / "frame_")


def save_blend() -> None:
    BLEND_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))


def encode_preview() -> Path:
    frames = sorted(FRAME_DIR.glob("frame_*.png"))
    if not frames:
        raise FileNotFoundError(FRAME_DIR)
    py = shutil.which("py") or shutil.which("python")
    encoder = REPO_ROOT / "tools" / "blender" / "encode_rover_drop_preview.py"
    if py is None or not encoder.is_file():
        print("No host Python encoder; leaving PNG sequence only.")
        return FRAME_DIR
    result = subprocess.run(
        [py, str(encoder), str(FRAME_DIR), str(OUTPUT_DIR)],
        check=False,
        capture_output=True,
        text=True,
    )
    print(result.stdout)
    if result.returncode != 0:
        print(result.stderr)
    mp4_path = OUTPUT_DIR / "rover_drop_preview.mp4"
    avi_path = OUTPUT_DIR / "rover_drop_preview.avi"
    gif_path = OUTPUT_DIR / "rover_drop_preview.gif"
    if mp4_path.is_file() and mp4_path.stat().st_size > 1024:
        return mp4_path
    if avi_path.is_file() and avi_path.stat().st_size > 1024:
        return avi_path
    if gif_path.is_file():
        return gif_path
    return FRAME_DIR


def render_clip() -> Path:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if FRAME_DIR.exists():
        shutil.rmtree(FRAME_DIR)
    configure_render(use_ffmpeg=False)
    bpy.ops.render.render(animation=True)
    return encode_preview()


def main() -> None:
    if not FBX_PATH.is_file():
        raise FileNotFoundError(FBX_PATH)

    if CLIP_DIR.exists():
        shutil.rmtree(CLIP_DIR)
    CLIP_DIR.mkdir(parents=True)

    clear_scene()
    rover_col = ensure_collection("Rover_Drop_Collection")
    studio_col = ensure_collection("Studio_Collection")

    root = import_fbx(FBX_PATH)
    assign_pbr_maps(root)
    for obj in [root, *root.children_recursive]:
        link_object_to_collection(obj, rover_col)

    setup_world_and_lights()
    ground = setup_ground()
    blob = setup_blob_shadow()
    link_object_to_collection(ground, studio_col)
    link_object_to_collection(blob, studio_col)

    card = build_eye_card(root)
    link_object_to_collection(card, rover_col)

    bpy.context.view_layer.update()
    mins, maxs = world_bbox(mesh_objects(root))
    rover_h = max(maxs.z - mins.z, 0.05)
    rover_w = max(maxs.x - mins.x, maxs.y - mins.y, 0.05)
    drop_height = rover_h * 1.25
    cam_distance = max(rover_w, rover_h + drop_height) * 3.35
    print(
        f"Rover {rover_w:.3f} x {rover_h:.3f} drop={drop_height:.3f} cam_dist={cam_distance:.3f}"
    )
    setup_camera(look_z=max(rover_h * 0.38, 0.22), distance=cam_distance)
    look_at = bpy.data.objects.get("Camera_LookAt")
    if look_at is not None:
        look_at.parent = root
        look_at.matrix_parent_inverse.identity()
        look_at.location = Vector((0.0, 0.0, rover_h * 0.42))
        bpy.context.view_layer.update()
    animate_drop(root, blob, card, drop_height=drop_height, shadow_size=rover_w, rover_h=rover_h)
    scene = bpy.context.scene
    for frame in (FRAME_START, 20, IMPACT_FRAME, FRAME_END):
        scene.frame_set(frame)
        bpy.context.view_layer.update()
        zmin = lowest_world_z(root)
        print(
            f"POSE f={frame} loc={tuple(round(c, 4) for c in root.location)} "
            f"rot={[round(math.degrees(a), 1) for a in root.rotation_euler]} "
            f"zmin={zmin:.4f}"
        )
    save_blend()
    if "--skip-render" in sys.argv:
        print("skip render")
        return
    output = render_clip()
    print(f"Saved blend {BLEND_PATH}")
    print(f"Preview {output}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise
