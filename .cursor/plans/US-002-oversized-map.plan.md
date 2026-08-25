---
name: US-002 — Oversized map
overview: "Keep a 2000×3000 playable map larger than the viewport, with a filled surface, light grid, and visible border so exploration feels real."
todos:
  - id: map-fill-grid
    content: "Filled map with light grid"
    status: completed
  - id: map-border
    content: "Visible map border"
    status: completed
  - id: map-size
    content: "First level size 2000 × 3000"
    status: completed
isProject: true
---

# US-002 — Oversized map

Keep a 2000×3000 playable map larger than the viewport, with a filled surface, light grid, and visible border so exploration feels real.

## Meta

- **Roadmap ID:** US-002
- **Epic:** Epic 0 — Prototype slice
- **Status:** Done in GameScene.drawEmptyMap. Plan is verify / do not regress.
- **Done when:** The map is bigger than the viewport and has a clear edge.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-001

## Out of scope

- Scrap placement
- Obstacles
- World map UI

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`

## Context

Map size comes from MVP §28 / `GameConfig.map` (2000 × 3000). Viewport is 1080 × 1920, so the world must feel larger than the screen.

## Implementation

1. Keep map width/height in `GameConfig.map` only.
2. Draw fill + light grid + border in `GameScene` (or a tiny map helper if extracted later).
3. Camera bounds and rover clamp must use the same map size.
4. Do not hardcode map dimensions elsewhere.

## Constraints

- No obstacles, mazes, or fog.
- No look-ahead camera (post-MVP).

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-002.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Drive to map edges; border is visible.
- Camera never shows outside the map once follow + bounds are set (US-005).

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
