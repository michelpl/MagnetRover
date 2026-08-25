---
name: US-034 — Energy pickup
overview: "Single pickup type EnergyPickup from LevelConfig.powerUps; restore energy with one bonus value; remove on collect."
todos:
  - id: energy-pickup-entity
    content: "Create EnergyPickup"
    status: pending
  - id: spawn-powerups
    content: "Spawn from optional LevelConfig.powerUps (type: 'energy')"
    status: pending
  - id: one-bonus
    content: "Ship one bonus value (+10% / +20% / +25%)"
    status: pending
  - id: remove-on-collect
    content: "Remove the pickup after collect"
    status: pending
  - id: no-other-types
    content: "Do not add other pickup types"
    status: pending
isProject: true
---

# US-034 — Energy pickup

Single pickup type EnergyPickup from LevelConfig.powerUps; restore energy with one bonus value; remove on collect.

## Meta

- **Roadmap ID:** US-034
- **Epic:** Epic 4 — Progression
- **Status:** Not started. Prototype level may keep 0 pickups.
- **Done when:** energy = min(maxEnergy, energy + energyBonus) for one pickup type.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-014
- US-007

## Out of scope

- Magnet boost pickups
- Coin pickups
- Weapons

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/entities/EnergyPickup.ts`
- `src/game/systems/EnergySystem.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/Levels.ts`

## Implementation

1. Overlap rover vs pickup → apply bonus once → destroy.
2. Put `energyBonus` in GameConfig (choose one, e.g. 0.2 * max).
3. Only `type: 'energy'` in data.

## Constraints

- No energy regen over time.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-034.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Collecting a battery raises energy and removes the pickup.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
