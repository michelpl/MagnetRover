---
name: US-020 — Result screen
overview: "Create ResultScene: victory shows summary + continue path; defeat shows retry. English copy only."
todos:
  - id: result-scene
    content: "Create ResultScene"
    status: pending
  - id: victory-path
    content: "Victory: summary + path to upgrades (or next level while upgrades off)"
    status: pending
  - id: defeat-path
    content: "Defeat: retry"
    status: pending
  - id: english-copy
    content: "Keep copy in English"
    status: pending
isProject: true
---

# US-020 — Result screen

Create ResultScene: victory shows summary + continue path; defeat shows retry. English copy only.

## Meta

- **Roadmap ID:** US-020
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** ResultScene shows victory (reward + continue) or defeat (retry).
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-017
- US-018

## Out of scope

- Share sheets
- Complex analytics panels

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/scenes/ResultScene.ts`
- `src/game/Game.ts`
- `src/game/scenes/GameScene.ts`

## Implementation

1. Register `ResultScene` in `Game.ts`.
2. Receive `{ outcome: 'win' | 'lose', stats? }` via registry/data.
3. Victory button → UpgradeScene if exists and enabled, else back to Menu/next Game.
4. Defeat button → retry GameScene.
5. English strings: “Victory”, “Defeat”, “Continue”, “Retry”.

## Constraints

- Upgrades may be disabled until prototype feels good (MVP §28) — gate navigation.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-020.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Win and lose both land on ResultScene with correct actions.
- No Portuguese UI strings.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
