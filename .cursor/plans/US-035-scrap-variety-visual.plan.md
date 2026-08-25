---
name: US-035 — Cube variety (visual)
overview: "Several colors and sizes of metallic cube placeholders; LevelConfig color/size select look only; identical magnet/queue/coin rules."
todos:
  - id: multi-placeholders
    content: "Several colors and sizes of metallic cube placeholders"
    status: pending
  - id: color-size-visual-only
    content: "color and size in level data only select visuals"
    status: pending
  - id: same-rules
    content: "Same magnet, queue, and coin rules for all cubes"
    status: pending
isProject: true
---

# US-035 — Cube variety (visual)

Several colors and sizes of metallic cube placeholders; LevelConfig color/size select look only; identical magnet/queue/coin rules.

## Meta

- **Roadmap ID:** US-035
- **Epic:** Epic 4 — Progression
- **Status:** Not started. Can overlap earlier cube work lightly.
- **Done when:** Cubes look mixed even though every piece is worth 1.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-008

## Out of scope

- Gameplay rarity
- Different pull physics by size
- Non-cube collectible shapes

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/entities/Scrap.ts`
- `src/game/config/Levels.ts`

## Implementation

1. Map `color` + `size` → tint / scale.
2. Ensure systems never branch on color/size for behavior.
3. Update level data to mix colors and sizes.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-035.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Visual variety visible; capacity/coins unchanged by color or size.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
