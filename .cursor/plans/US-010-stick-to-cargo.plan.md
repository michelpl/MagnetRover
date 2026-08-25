---
name: US-010 — Malleable trailing cargo queue
overview: "Add CargoSystem so Attracted cubes near the rear magnet become Carried and follow a malleable queue behind the rover (snake/train), staying visible."
todos:
  - id: cargo-system
    content: "Create CargoSystem with ordered cargo: Scrap[]"
    status: pending
  - id: attach-threshold
    content: "When Attracted cube is close enough, set Carried and push to cargo"
    status: pending
  - id: malleable-queue
    content: "Follow magnet → first cube → next cube with soft interpolation (snake/train)"
    status: pending
  - id: no-fixed-slots
    content: "Do not use fixed CargoSlot grid around the rover"
    status: pending
  - id: sync-transform
    content: "Update carried cube positions every frame from rover motion"
    status: pending
isProject: true
---

# US-010 — Malleable trailing cargo queue

Add CargoSystem so Attracted cubes near the rear magnet become Carried and follow a malleable queue behind the rover (snake/train), staying visible.

## Meta

- **Roadmap ID:** US-010
- **Epic:** Epic 1 — Core magnet loop
- **Status:** Not started. Follow MVP malleable queue — no fixed slots around the rover.
- **Done when:** Cube near the magnet / queue tip becomes Carried and follows the previous segment with smooth interpolation.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-009

## Out of scope

- Fixed orbital slots around the hull
- Inventory UI
- Per-color/size stacking rules

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/CargoSystem.ts`
- `src/game/systems/MagnetSystem.ts`
- `src/game/entities/Rover.ts`
- `src/game/entities/Scrap.ts`
- `src/game/scenes/GameScene.ts`

## Context

MVP §8: malleable metallic convoy behind the rear magnet.

```
[ROVER] 🧲 — ■ — ■ — ■ — ■
```

First carried cube follows the magnet; each next cube follows the previous. Soft follow — not rigid world offsets glued to the hull. Cubes of different colors and sizes share the same queue rules.

## Implementation

1. `CargoSystem` owns `cargo: Scrap[]` and attach/detach helpers.
2. Attach when Attracted distance to magnet (or queue tip) < stick radius (config).
3. Per frame: for i in cargo, lerp toward previous anchor (magnet if i===0 else cargo[i-1]), with spacing from `GameConfig`.
4. Optional tiny sine oscillation for juice (keep subtle).
5. MagnetSystem should target queue tip when cargo length > 0.
6. GameScene wires MagnetSystem + CargoSystem; no attach math in the scene.

## Constraints

- Carried cubes remain visible always.
- No physics joints.
- No predefined `CargoSlot` positions around the rover.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-010.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Cubes join and trail behind the rear magnet while moving/turning.
- Queue looks soft, not a rigid grid around the body.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
