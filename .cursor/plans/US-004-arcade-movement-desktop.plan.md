---
name: US-004 — Arcade movement (desktop)
overview: "Preserve WASD/arrow arcade movement with diagonal normalize, velocity lerp, rotation toward move, and map clamp — no realistic steering."
todos:
  - id: keyboard-input
    content: "Read WASD and arrow keys"
    status: completed
  - id: normalize-diagonal
    content: "Normalize diagonal input"
    status: completed
  - id: lerp-velocity
    content: "Lerp velocity toward target speed (no realistic steering)"
    status: completed
  - id: rotate-toward-move
    content: "Rotate the rover toward movement"
    status: completed
  - id: clamp-map
    content: "Clamp the rover to map bounds"
    status: completed
isProject: true
---

# US-004 — Arcade movement (desktop)

Preserve WASD/arrow arcade movement with diagonal normalize, velocity lerp, rotation toward move, and map clamp — no realistic steering.

## Meta

- **Roadmap ID:** US-004
- **Epic:** Epic 0 — Prototype slice
- **Status:** Implemented in Rover.updateRover. Do not regress when adding joystick.
- **Done when:** WASD and arrows move the rover with arcade smoothing, clamped to the map.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-003

## Out of scope

- Touch joystick
- Physics bodies
- Acceleration curves that feel “sim”

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/entities/Rover.ts`
- `src/game/config/GameConfig.ts`

## Context

Arcade feel is non-negotiable. Input → target velocity → damp/lerp → position. Rotate toward movement. Clamp to map.

## Implementation

1. Keep keyboard path working after joystick lands: merge joystick vector with keyboard into one normalized input.
2. Tunables stay in `GameConfig.rover` (`speed`, `inputSmoothing`, `rotationSmoothing`).
3. Expose a clean way for later systems to know if the rover is moving (energy drain).

## Constraints

- No Arcade Physics plugin.
- No realistic acceleration/steering.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-004.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- WASD and arrows work; diagonals are not faster.
- Rover stops smoothly and cannot leave the map.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
