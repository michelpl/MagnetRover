---
name: US-014 — Energy drain
overview: "Create EnergySystem: start at 100%, drain only while moving; never on collect/dump/idle; never regenerate."
todos:
  - id: energy-system
    content: "Create EnergySystem"
    status: pending
  - id: drain-while-moving
    content: "energy -= movementEnergyCost * delta while moving"
    status: pending
  - id: no-other-drain
    content: "Do not drain on collect, dump, or idle"
    status: pending
  - id: no-regen
    content: "Do not regenerate energy"
    status: pending
  - id: config-energy
    content: "Put initialEnergy and movementEnergyCost in config/level data"
    status: pending
isProject: true
---

# US-014 — Energy drain

Create EnergySystem: start at 100%, drain only while moving; never on collect/dump/idle; never regenerate.

## Meta

- **Roadmap ID:** US-014
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** Energy starts at 100% and drains only when the rover is moving.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-004
- US-007

## Out of scope

- Regenerative energy
- Drain on magnet use
- Multiple energy types

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/EnergySystem.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`
- `src/game/config/Levels.ts`

## Implementation

1. `EnergySystem` holds current energy, max energy, and `update(delta, isMoving)`.
2. `isMoving` from rover velocity threshold (reuse existing movement epsilon).
3. `initialEnergy` from `LevelConfig`; `movementEnergyCost` from `GameConfig`.
4. Clamp at 0; lose handling is US-018.
5. No passive regen timers.

## Constraints

- Standing still is free.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-014.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Idle: energy flat. Move: energy drops. Collect/dump while still: no drop.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
