---
name: US-030 — Three upgrades
overview: "Capacity, magnet radius, and speed upgrade tables in GameConfig; apply at run start; refuse unaffordable buys; may stay disabled until prototype is fun."
todos:
  - id: upgrade-tables
    content: "Put upgrade tables in GameConfig"
    status: pending
  - id: apply-on-run
    content: "Apply purchased levels to the rover at run start"
    status: pending
  - id: extra-cargo
    content: "Unlock longer cargo queue when capacity increases"
    status: pending
  - id: refuse-unaffordable
    content: "Refuse purchases the player cannot afford"
    status: pending
  - id: feature-flag
    content: "Disable upgrades until prototype loop is fun"
    status: pending
isProject: true
---

# US-030 — Three upgrades

Capacity, magnet radius, and speed upgrade tables in GameConfig; apply at run start; refuse unaffordable buys; may stay disabled until prototype is fun.

## Meta

- **Roadmap ID:** US-030
- **Epic:** Epic 4 — Progression
- **Status:** Not started. Disable until core loop feels good (MVP §28).
- **Done when:** Each upgrade has paid tiers and applies on the next run.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-028
- US-029

## Out of scope

- Skill trees
- More than three upgrade lines
- Consumables

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/config/GameConfig.ts`
- `src/game/save/Save.ts`
- `src/game/entities/Rover.ts`
- `src/game/systems/CargoSystem.ts`

## Tables (roadmap)

| Upgrade | Tiers |
| Capacity | 20 → 25 → 30 → 40 |
| Magnet radius | 100 → 120 → 145 → 175 px |
| Speed | 200 → 215 → 230 → 250 |
| Cost | 100 → 250 → 500 coins |

## Implementation

1. Encode tiers/costs in `GameConfig.upgrades`.
2. `purchase(line)` checks coins, increments level, saves.
3. On GameScene start, read save and apply to rover/magnet/capacity.
4. `upgradesEnabled` flag defaults false until you turn it on.

## Constraints

- No fourth upgrade type in MVP.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-030.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Buying capacity increases max carry next run.
- Unaffordable purchase no-ops.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
