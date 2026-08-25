---
name: US-012 — Processor
overview: "Add a single Processor entity with a processingArea, spawned from LevelConfig, visually distinct from scrap and rover."
todos:
  - id: processor-entity
    content: "Create Processor with processingArea"
    status: pending
  - id: spawn-processor
    content: "Spawn from LevelConfig.processor"
    status: pending
  - id: distinct-visual
    content: "Make it clearly different from scrap and rover (placeholder OK)"
    status: pending
isProject: true
---

# US-012 — Processor

Add a single Processor entity with a processingArea, spawned from LevelConfig, visually distinct from scrap and rover.

## Meta

- **Roadmap ID:** US-012
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** The level has a single processor with a dump area.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-007

## Out of scope

- Multiple processor types
- Crafting
- Auto magnets to processor

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/entities/Processor.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/Levels.ts`

## Implementation

1. `Processor` entity: landmark graphics + `processingArea` as `Phaser.Geom.Rectangle` (or circle) in world space.
2. Spawn from level data; one only.
3. Visually loud: larger footprint, contrasting color, simple “machine” silhouette.
4. Dump behavior is US-013 — this story is presence + area.

## Constraints

- Exactly one processor per MVP level.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-012.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Processor visible and distinct.
- processingArea exists and can be queried for overlap tests.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
