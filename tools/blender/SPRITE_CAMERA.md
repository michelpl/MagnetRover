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

## 8-direction yaw (rover)

Phaser `Rover.rotation === 0` faces up (negative world Y). Frame index:

`frame = round(wrap(rotation) / (PI / 4)) % 8`

Yaw is **clockwise** from north (negative Blender Z) so it matches Phaser (`Y` down, `rotation` clockwise).

| Index | Yaw ° (clockwise from north) | Facing | File |
| --- | --- | --- | --- |
| 0 | 0 | N | `rover_n.png` |
| 1 | 45 | NE | `rover_ne.png` |
| 2 | 90 | E | `rover_e.png` |
| 3 | 135 | SE | `rover_se.png` |
| 4 | 180 | S | `rover_s.png` |
| 5 | 225 | SW | `rover_sw.png` |
| 6 | 270 | W | `rover_w.png` |
| 7 | 315 | NW | `rover_nw.png` |

Packed strip: `public/assets/sprites/rover/rover.png` (8 × 1, 256 px cells).

## Import

Meshy FBX is treated as Unity-style Y-up: Blender import `axis_forward = -Z`, `axis_up = Y`. Origin is shifted to ground-center XY after import.

## Render

```text
blender --background --python tools/blender/render_rover_sprites.py
```

Source mesh: `ConceptArt/Meshy_AI_Lunar_Rover_Mini_0826181139_texture_fbx/`.
