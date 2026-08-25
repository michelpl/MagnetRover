---
name: US-019 — Retry
overview: "After defeat, Retry rebuilds the same LevelConfig from scratch: rover, scraps, energy, cargo, HUD; no leftover processed state."
todos:
  - id: retry-action
    content: "Add retry action on defeat"
    status: pending
  - id: full-reset
    content: "Reset rover, scraps, energy, cargo, and HUD"
    status: pending
  - id: no-keep-progress
    content: "Do not keep processed scraps or spent energy"
    status: pending
isProject: true
---

# US-019 — Retry

After defeat, Retry rebuilds the same LevelConfig from scratch: rover, scraps, energy, cargo, HUD; no leftover processed state.

## Meta

- **Roadmap ID:** US-019
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** Retry rebuilds the same LevelConfig from scratch.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-018

## Out of scope

- Checkpoint mid-level
- Keep partial cleanup

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/scenes/GameScene.ts`
- `src/game/scenes/ResultScene.ts`

## Implementation

1. Prefer `this.scene.restart()` with level id in registry, or explicit teardown + `create` from same `LevelConfig`.
2. Ensure systems reinitalize totals/energy/cargo.
3. Coins from prior failed run: do not award (coins on process may need defer-to-result — if coins award on process mid-run, document behavior; MVP awards on process but persistence is US-028 — keep retry from duplicating unfair gains if save already flushed; simplest MVP: award coins only on victory summary later, or accept mid-run award and persist carefully. Prefer awarding at process time only after US-028 designs it; until then keep coins in memory and reset on retry.)

## Constraints

- Same level data; no page reload.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-019.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Retry restores full scrap set and full energy.
- No stale carried scraps or HUD values.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
