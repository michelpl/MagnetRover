---
name: US-005 — Follow camera
overview: "Camera follows the rover with lerp 0.08 and setBounds to the map. Explicitly do not add look-ahead."
todos:
  - id: start-follow
    content: "startFollow with lerp 0.08"
    status: completed
  - id: set-bounds
    content: "setBounds to the map"
    status: completed
  - id: no-lookahead
    content: "Do not add look-ahead (post-MVP constraint)"
    status: completed
isProject: true
---

# US-005 — Follow camera

Camera follows the rover with lerp 0.08 and setBounds to the map. Explicitly do not add look-ahead.

## Meta

- **Roadmap ID:** US-005
- **Epic:** Epic 0 — Prototype slice
- **Status:** Done. Guard against look-ahead regressions.
- **Done when:** The camera follows with a small lerp and respects map bounds.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-002
- US-003

## Out of scope

- Look-ahead
- Zoom gameplay
- Split cameras

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`

## Implementation

1. Keep `cameras.main.setBounds(0, 0, mapWidth, mapHeight)`.
2. Keep `startFollow(rover, true, lerp, lerp)` with `GameConfig.camera.lerp` (0.08).
3. Reject any PR/task that adds predictive camera offset / look-ahead.

## Constraints

- Look-ahead is post-MVP (roadmap out-of-scope list).

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-005.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Camera tracks rover smoothly.
- At map corners, no empty void outside the map is shown.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
