---
name: US-025 — Full-cargo feedback
overview: "When capacity hits full: rover pulse, SFX, optional FULL toast, hint toward processor."
todos:
  - id: pulse
    content: "Short visual pulse on the rover"
    status: pending
  - id: sfx
    content: "Short SFX"
    status: pending
  - id: full-toast
    content: "Optional FULL toast"
    status: pending
  - id: processor-hint
    content: "Hint toward the processor (pulse / marker)"
    status: pending
isProject: true
---

# US-025 — Full-cargo feedback

When capacity hits full: rover pulse, SFX, optional FULL toast, hint toward processor.

## Meta

- **Roadmap ID:** US-025
- **Epic:** Epic 3 — Game feel
- **Status:** Not started. Extends US-011 cue.
- **Done when:** Player knows they are full without reading UI.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-011
- US-027

## Out of scope

- Blocking modal
- Auto pathfinding to processor

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/CargoSystem.ts`
- `src/game/entities/Processor.ts`
- `src/game/entities/Rover.ts`

## Implementation

1. Edge-trigger on becoming full (once per full state).
2. Pulse processor landmark until cargo decreases.
3. English “FULL” only.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-025.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Becoming full is obvious at a glance; movement still free.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
