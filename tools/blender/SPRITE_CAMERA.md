# Sprite camera (in-run assets)

Locked Blender camera used to render Magnet Rover gameplay sprites. Reuse these numbers for scrap, processor, and other ground props so they sit on `scenario1` with the same tilt.

Do **not** use the splash / hub 3/4 view (~35–45° elevation). That framing is promotional only.

## Rig

| Property | Value |
| --- | --- |
| Projection | Orthographic |
| Elevation | **75°** from the ground plane (15° off vertical) |
| Azimuth | **0°** (camera south of the subject, looking at origin) |
| Roll | 0° |
| Distance | 6.0 (look-at origin; ortho so distance only frames the view) |
| Ortho scale (rover v1) | 2.713699 |
| Clip start / end | 0.01 / 100 |
| Resolution | 256 × 256 per frame |
| Film | Transparent PNG |
| Engine | EEVEE |

Camera location (Blender Z-up):

```
elev = radians(75)
azim = radians(0)
horizontal = distance * cos(elev)
location = (horizontal * sin(azim), -horizontal * cos(azim), distance * sin(elev))
```

The camera **Track To** constraint aims at `Rover_Root` (`-Z` track, `+Y` up). **Do not orbit the camera per facing.** Rotate the model around **Z** instead so world lights stay fixed.

Fitted `ortho_scale` from the last rover render: **2.713699**.

Meshy rest pose has the green top panel along **+X** and the face/eyes along **-X**. The script adds `MESH_FORWARD_OFFSET_DEG = -90` so frame 0 (north) points the eyes to **+Y** (top of the PNG).

## 16-direction yaw (rover)

Phaser `Rover.rotation === 0` faces up (negative world Y). Frame index:

`frame = round(wrap(rotation) / (PI / 8)) % 16`

Yaw is **clockwise** from north (negative Blender Z) so it matches Phaser (`Y` down, `rotation` clockwise).

| Index | Yaw ° (clockwise from north) | Facing | File |
| --- | --- | --- | --- |
| 0 | 0 | N | `rover_n.png` |
| 1 | 22.5 | NNE | `rover_nne.png` |
| 2 | 45 | NE | `rover_ne.png` |
| 3 | 67.5 | ENE | `rover_ene.png` |
| 4 | 90 | E | `rover_e.png` |
| 5 | 112.5 | ESE | `rover_ese.png` |
| 6 | 135 | SE | `rover_se.png` |
| 7 | 157.5 | SSE | `rover_sse.png` |
| 8 | 180 | S | `rover_s.png` |
| 9 | 202.5 | SSW | `rover_ssw.png` |
| 10 | 225 | SW | `rover_sw.png` |
| 11 | 247.5 | WSW | `rover_wsw.png` |
| 12 | 270 | W | `rover_w.png` |
| 13 | 292.5 | WNW | `rover_wnw.png` |
| 14 | 315 | NW | `rover_nw.png` |
| 15 | 337.5 | NNW | `rover_nnw.png` |

Packed strip: `public/assets/sprites/rover/rover.png` (16 × 1, 256 px cells).

## Import

Meshy FBX is treated as Unity-style Y-up: Blender import `axis_forward = -Z`, `axis_up = Y`. Origin is shifted to ground-center XY after import.

## Render

```text
blender --background --python tools/blender/render_rover_sprites.py
```

If Blender is not installed, build a 16-dir sheet from the existing 8-dir PNGs (blended intermediates):

```text
python tools/blender/pack_rover_16_from_8.py
```

Source mesh: `ConceptArt/Meshy_AI_Lunar_Rover_Mini_0826181139_texture_fbx/`.

## Weapons (base + laser cannon)

Same camera, lights, and **fixed** `ortho_scale` **2.713699** as the rover (do not auto-fit). Disc and cannon are scaled in Blender against the rover FBX (`BASE_DIAMETER_FRAC` / `CANNON_SIZE_FRAC` in the render script).

```text
blender --background --python tools/blender/render_weapon_sprites.py
```

Sources: `ConceptArt/Weapons/WeaponBase/`, `ConceptArt/Weapons/LaserCannon/`.

### Weapon base (16-dir)

Same yaw table as the rover. Packed strip: `public/assets/sprites/weapons/weapon_base.png` (16 × 1, 256 px cells).

Phaser parents this sprite to the hull layer and uses the same frame as the rover hull.

### Laser cannon (32-dir)

Yaw step **11.25°** clockwise from north. Packed grid: `public/assets/sprites/weapons/laser_cannon.png` (8 × 4, 256 px cells, 2048 × 1024). Phaser frame index:

`frame = round(wrap(worldAngle) / (PI / 16)) % 32`

| Index | Yaw ° | File |
| --- | --- | --- |
| 0 | 0 | `laser_cannon_00.png` |
| 8 | 90 | `laser_cannon_08.png` |
| 16 | 180 | `laser_cannon_16.png` |
| 24 | 270 | `laser_cannon_24.png` |

Gameplay still clamps aim to a 120° forward cone; the extra frames are for a later 360° turret.

Debug composite (not used in-game): `public/assets/sprites/weapons/_debug/rover_base_cannon_se.png`.
