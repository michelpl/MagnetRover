---
name: US-008 — Metallic cubes on the map
overview: "Create Scrap entity as metallic cubes with color/size visuals and spawn ~100 idle cubes from LevelConfig; every piece counts as 1 object."
todos:
  - id: scrap-entity
    content: "Create Scrap entity (metallic cube) with ScrapState (Idle, Attracted, Carried, Processing)"
    status: pending
  - id: color-size
    content: "Add color and size (small | medium | large) fields"
    status: pending
  - id: spawn-scraps
    content: "Spawn cubes from LevelConfig"
    status: pending
  - id: placeholder-gfx
    content: "Placeholder cube graphics (varied color + size only)"
    status: pending
  - id: no-economy-diff
    content: "Do not add weight, rarity, or different coin values"
    status: pending
isProject: true
---

# US-008 — Metallic cubes on the map

Create Scrap entity as metallic cubes with color/size visuals and spawn ~100 idle cubes from LevelConfig; every piece counts as 1 object.

## Meta

- **Roadmap ID:** US-008
- **Epic:** Epic 1 — Core magnet loop
- **Status:** Not started. Depends on LevelConfig (US-007).
- **Done when:** ~100 cubes are visible, all counting as 1 object, idle until attracted.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-007

## Out of scope

- Weight
- Rarity
- Different coin values
- Physics bodies
- Non-cube collectible shapes (screws, gears, tools)

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/entities/Scrap.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/Levels.ts`

## Context

MVP §15: collectibles are metallic cubes. Color and size are visual only. `ScrapState`: Idle | Attracted | Carried | Processing. Every cube is worth 1.

## Implementation

1. Create `src/game/entities/Scrap.ts` as Container/Graphics with `state`, `color`, `size`, and position.
2. Start every cube in `Idle`.
3. Spawn from level scraps array in GameScene (wire only).
4. Draw square/cube placeholders tinted by color and scaled by size.
5. Do not implement attraction here (US-009).

## Constraints

- No Arcade Physics.
- English enum/type names.
- Cubes only — no screw/gear/tool art for MVP.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-008.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- ~100 metallic cubes visible on the oversized map with mixed colors/sizes.
- All start Idle; no movement until magnet story.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
