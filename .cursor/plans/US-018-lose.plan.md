---
name: US-018 — Lose
overview: "If energy <= 0 before win, defeat: stop movement and hand off to retry flow."
todos:
  - id: detect-lose
    content: "Detect lose in EnergySystem / game state"
    status: pending
  - id: stop-movement
    content: "Stop movement when energy is 0"
    status: pending
  - id: handoff-retry
    content: "Hand off to retry"
    status: pending
isProject: true
---

# US-018 — Lose

If energy <= 0 before win, defeat: stop movement and hand off to retry flow.

## Meta

- **Roadmap ID:** US-018
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** energy <= 0 and the level is not won → defeat.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-014

## Out of scope

- Continue with ads
- Partial energy revive
- Soft lock warnings beyond basic

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/EnergySystem.ts`
- `src/game/scenes/GameScene.ts`

## Implementation

1. When energy hits 0 and state is not Won → `Lost`.
2. Zero velocity; ignore move input.
3. Route to defeat UI / ResultScene defeat / inline Retry (US-019/US-020).
4. Winning with 0 energy same frame: prefer win if both conditions met on same tick only if remaining/cargo already satisfied before drain — keep deterministic order (check win before lose).

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-018.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Drain to 0 without clearing → lose and stop.
- Win condition takes precedence if already satisfied.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
