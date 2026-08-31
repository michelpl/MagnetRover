---
name: US-152 — Minimap update
overview: "Minimap shows enemies instead of scrap/processor."
todos:
  - id: minimap-enemy-blips
    content: Update Minimap.ts blips
    status: pending
isProject: true
---

# US-152 — Minimap update

Show enemy positions on the minimap instead of legacy collectibles.

## Meta

- **Roadmap ID:** US-152
- **Epic:** E5 — Content and feel
- **Status:** Not started.
- **Done when:** Minimap shows enemies instead of scrap/processor.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-112
- US-131

## Out of scope

- Wave indicator (US-132)
- Processor/scrap blips
- Fog of war or unexplored areas
- Full-screen map

Global MVP exclusions: scrap/processor markers.

## Likely files

- `src/game/ui/Minimap.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/entities/Enemy.ts`

## Context

`Minimap` currently plots scrap and processor positions. Replace data source with live enemy list + rover + optional processor removal. Use hostile color blip (red/orange) for enemies; keep rover blip distinct.

## Implementation

1. Change `Minimap.refresh` (or equivalent) signature to accept `enemies: { x, y }[]` instead of scrap/processor arrays.
2. Remove scrap/processor blip drawing.
3. Draw one blip per live enemy; cull off-map entities.
4. Update `GameScene` HUD update to pass enemy positions each frame or on kill.
5. Keep minimap scale/clamp logic unchanged.

## Constraints

- Cheap update — avoid allocating new arrays every frame if possible (reuse buffer).
- No scrap/processor references left in minimap code.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-152.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Enemies appear on minimap while alive.
- Dead enemies remove blips.
- No scrap/processor dots.
- Rover still centered or mapped correctly.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
