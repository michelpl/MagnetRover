---
name: US-017 — Win
overview: "Win only when remainingObjects == 0 AND carriedObjects == 0; stop drain/input and hand off to result flow (stub OK)."
todos:
  - id: detect-win
    content: "Detect win in ProgressSystem or thin game-state helper"
    status: pending
  - id: stop-systems
    content: "Stop energy drain and input after win"
    status: pending
  - id: handoff-result
    content: "Hand off to result flow (stub enough)"
    status: pending
isProject: true
---

# US-017 — Win

Win only when remainingObjects == 0 AND carriedObjects == 0; stop drain/input and hand off to result flow (stub OK).

## Meta

- **Roadmap ID:** US-017
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** remainingObjects == 0 AND carriedObjects == 0 ends the level as a win.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-013
- US-016

## Out of scope

- Star ratings
- Time bonuses
- Optional objectives

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/ProgressSystem.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/scenes/ResultScene.ts`

## Implementation

1. After dump updates, evaluate win.
2. Set run state `Won`; ignore further input; freeze energy drain.
3. Transition to `ResultScene` with victory payload (or temporary on-screen stub if ResultScene not yet built — prefer creating a minimal ResultScene shell).
4. Do not win while cargo still held.

## Constraints

- Clear map alone is not enough; cargo must be empty.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-017.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Last dump with empty cargo triggers win.
- Holding last scraps on the rover does not win.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
