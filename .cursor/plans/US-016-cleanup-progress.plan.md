---
name: US-016 — Cleanup progress
overview: "Add ProgressSystem tracking totalObjects, remainingObjects, carriedObjects and drive cleanup % = ((total - remaining) / total) * 100."
todos:
  - id: progress-system
    content: "Create ProgressSystem"
    status: pending
  - id: track-counts
    content: "Track totalObjects, remainingObjects, carriedObjects"
    status: pending
  - id: remaining-excludes-processed
    content: "remainingObjects excludes processed scraps"
    status: pending
  - id: drive-clean-bar
    content: "Drive the cleanup bar from this value"
    status: pending
isProject: true
---

# US-016 — Cleanup progress

Add ProgressSystem tracking totalObjects, remainingObjects, carriedObjects and drive cleanup % = ((total - remaining) / total) * 100.

## Meta

- **Roadmap ID:** US-016
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** cleanPercentage = ((totalObjects - remainingObjects) / totalObjects) * 100.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-008
- US-013

## Out of scope

- Region scores as separate win conditions
- Achievements

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/ProgressSystem.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/ui/CleanBar.ts`

## Definitions

- `totalObjects`: scraps at level start.
- `remainingObjects`: scraps not yet processed (Idle + Attracted + Carried still count as remaining).
- Processed scraps leave remaining.
- Win needs remaining 0 **and** carried 0 (US-017) — carried still counts as remaining until dumped.

Clarify in code comments: remaining includes carried; clean % rises when processed, not merely picked up.

## Implementation

1. Initialize total from spawned scrap count.
2. On each successful process, decrement remaining.
3. Expose `getCleanPercentage()`.
4. Wire CleanBar.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-016.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Picking up scrap does not increase clean %; dumping does.
- At full clear+empty cargo, percentage is 100.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
