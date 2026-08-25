---
name: US-013 — Dump cargo
overview: "When a loaded rover overlaps the processor, unload carried scraps sequentially (Processing), tween into the machine at 20–60 ms each, then remove them and update counts."
todos:
  - id: overlap-detect
    content: "Detect rover overlap with processor area"
    status: pending
  - id: only-if-cargo
    content: "Only dump while carriedObjects > 0"
    status: pending
  - id: sequential
    content: "Unload sequentially (not all at once)"
    status: pending
  - id: tween-in
    content: "Tween scale/rotation toward the processor"
    status: pending
  - id: remove-scrap
    content: "Remove scrap permanently after processing"
    status: pending
  - id: update-counts
    content: "Update remaining/carried counts as each item finishes"
    status: pending
isProject: true
---

# US-013 — Dump cargo

When a loaded rover overlaps the processor, unload carried scraps sequentially (Processing), tween into the machine at 20–60 ms each, then remove them and update counts.

## Meta

- **Roadmap ID:** US-013
- **Epic:** Epic 2 — Game loop
- **Status:** Not started. Core convert step of the loop.
- **Done when:** Carried scraps go Processing, tween into the machine at 20–60 ms each, then leave the world.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-010
- US-012

## Out of scope

- Instant mass dump
- Partial refunds
- Multiple dump buildings

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/CargoSystem.ts`
- `src/game/entities/Processor.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`

## Implementation

1. While rover overlaps `processingArea` and cargo length > 0, process one scrap at a time.
2. Interval / tween duration from `GameConfig` (clamp 20–60 ms feel — pick a tunable like `dumpIntervalMs: 40`).
3. Pop from cargo (front or back — pick one and keep consistent), set `Processing`, tween toward processor center with scale-down/spin, destroy/disable on complete.
4. Notify progress/coins hooks (stubs OK until US-016/US-028).
5. Do not require a button — drive-in dump.

## Constraints

- Processed scrap never returns to the map.
- Interpolation/tweens only; no physics.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-013.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Enter processor with cargo: items suck in one-by-one.
- Cargo empties; scraps are gone for good.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
