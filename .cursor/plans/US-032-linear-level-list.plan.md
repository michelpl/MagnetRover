---
name: US-032 — Linear level list
overview: "Linear levels 1, 2, 3… with currentLevel in save; advance on victory; replay last or show “more later” if none."
todos:
  - id: store-current
    content: "Store currentLevel in save data"
    status: pending
  - id: advance-on-win
    content: "Advance on victory"
    status: pending
  - id: end-behavior
    content: "Replay last level if no next one (or simple more later)"
    status: pending
isProject: true
---

# US-032 — Linear level list

Linear levels 1, 2, 3… with currentLevel in save; advance on victory; replay last or show “more later” if none.

## Meta

- **Roadmap ID:** US-032
- **Epic:** Epic 4 — Progression
- **Status:** Not started.
- **Done when:** Levels are 1, 2, 3, … with no world map.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-029
- US-007

## Out of scope

- World map
- Branching paths
- Look-ahead camera

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/save/Save.ts`
- `src/game/config/Levels.ts`
- `src/game/scenes/ResultScene.ts`

## Implementation

1. `levels` array indexed by id.
2. On win: `currentLevel = min(current+1, max)` or flag end.
3. Menu Play uses `currentLevel`.
4. No map UI.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-032.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Winning level 1 starts level 2 next run.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
