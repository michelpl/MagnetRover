---
name: US-038 — First-run tutorial
overview: "Short skippable first-run cues for move → magnet → dump → clean; gate on save data; no quest system."
todos:
  - id: first-run-gate
    content: "First-run only (gate on save data)"
    status: pending
  - id: no-quests
    content: "Do not add a quest system"
    status: pending
  - id: short-copy
    content: "Keep it to a few sentences or finger hints"
    status: pending
isProject: true
---

# US-038 — First-run tutorial

Short skippable first-run cues for move → magnet → dump → clean; gate on save data; no quest system.

## Meta

- **Roadmap ID:** US-038
- **Epic:** Epic 5 — Mobile ship
- **Status:** Not started.
- **Done when:** A short, skippable cue covers movement, magnet, full cargo, and the processor.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-021
- US-029
- US-013

## Out of scope

- Quest log
- Multi-step mission graph
- Forced long cutscenes

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/ui/TutorialOverlay.ts`
- `src/game/save/Save.ts`
- `src/game/scenes/GameScene.ts`

## Implementation

1. Save flag `tutorialDone` (extend save schema carefully with defaults).
2. Overlay steps: drag to move; approach scrap; when full go to processor; clear the map.
3. Skip button always available; completing or skipping sets flag.
4. English copy only.

## Constraints

- No quest system / objectives framework.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-038.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- First launch shows cues; second launch does not.
- Skip works; gameplay remains usable underneath.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
