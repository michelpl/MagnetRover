---
name: US-023 — Queue-join feedback
overview: "On join to the trailing cargo queue: small bounce, soft settle, click SFX, light vibration (no-op on desktop)."
todos:
  - id: bounce
    content: "Small bounce on attach"
    status: pending
  - id: settle
    content: "Soft settle into the end of the queue"
    status: pending
  - id: click-sfx
    content: "Click SFX"
    status: pending
  - id: vibrate
    content: "Light vibration (no-op on desktop)"
    status: pending
isProject: true
---

# US-023 — Queue-join feedback

On join to the trailing cargo queue: small bounce, soft settle, click SFX, light vibration (no-op on desktop).

## Meta

- **Roadmap ID:** US-023
- **Epic:** Epic 3 — Game feel
- **Status:** Not started.
- **Done when:** Player feels the click when a cube joins the trailing queue.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-010
- US-027

## Out of scope

- Heavy rumble patterns
- Combo announcers

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/CargoSystem.ts`

## Implementation

1. On Carried attach to queue tip: scale punch tween + soft settle + audio helper + vibrate helper.
2. Debounce if many attach same frame (stagger lightly).

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-023.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Queue-join is distinct from attract feedback.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
