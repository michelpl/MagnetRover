---
name: US-026 — Region-clear feedback
overview: "When a local scrap cluster is cleared, play dust/sparkle, optional Clean! text, positive SFX."
todos:
  - id: cluster-detect
    content: "Detect local cluster cleared (radius or region tag)"
    status: pending
  - id: vfx
    content: "Dust / sparkle VFX"
    status: pending
  - id: clean-text
    content: "Optional Clean! text"
    status: pending
  - id: positive-sfx
    content: "Positive SFX"
    status: pending
isProject: true
---

# US-026 — Region-clear feedback

When a local scrap cluster is cleared, play dust/sparkle, optional Clean! text, positive SFX.

## Meta

- **Roadmap ID:** US-026
- **Epic:** Epic 3 — Game feel
- **Status:** Not started.
- **Done when:** Clearing a cluster feels like progress.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-008
- US-027

## Out of scope

- Quest system
- Mandatory region objectives

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/ProgressSystem.ts`
- `src/game/config/Levels.ts`

## Implementation

1. Simple approach: grid/region id on scraps in level data, or spatial hash; when a region’s idle+attracted+carried count for that region hits 0 after a process/attract, fire feedback once.
2. Keep optional — must not block MVP loop if clusters undefined.
3. English “Clean!” if shown.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-026.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Clearing a dense pile triggers a local celebration without false spam.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
