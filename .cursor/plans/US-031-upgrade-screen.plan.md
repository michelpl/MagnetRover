---
name: US-031 — Upgrade screen
overview: "UpgradeScene between result and next level: show coins, three upgrade buttons, continue. Flow Boot→Menu→Game→Result→Upgrades→Game."
todos:
  - id: upgrade-scene
    content: "Create UpgradeScene"
    status: pending
  - id: show-buttons
    content: "Show current coins and three upgrade buttons"
    status: pending
  - id: continue-btn
    content: "Continue / next-level button"
    status: pending
  - id: wire-flow
    content: "Wire Boot → Menu → Game → Result → Upgrades → next Game"
    status: pending
isProject: true
---

# US-031 — Upgrade screen

UpgradeScene between result and next level: show coins, three upgrade buttons, continue. Flow Boot→Menu→Game→Result→Upgrades→Game.

## Meta

- **Roadmap ID:** US-031
- **Epic:** Epic 4 — Progression
- **Status:** Not started.
- **Done when:** UpgradeScene sits between result and the next level.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-020
- US-030

## Out of scope

- Drag-drop loadouts
- Reset builds

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/scenes/UpgradeScene.ts`
- `src/game/Game.ts`
- `src/game/scenes/ResultScene.ts`

## Implementation

1. Simple vertical layout, English labels.
2. Each button shows next cost and current tier.
3. Continue advances `currentLevel` (US-032) and starts GameScene.
4. If upgrades disabled, Result victory may skip straight to next game.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-031.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Victory path reaches upgrades when enabled; purchases reflect in next run.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
