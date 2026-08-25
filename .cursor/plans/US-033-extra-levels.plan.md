---
name: US-033 — Extra levels
overview: "Author 2–3 LevelConfig maps larger than the viewport with varied scrap layouts; still one processor each; obvious navigation."
todos:
  - id: author-maps
    content: "Author 2–3 maps larger than the viewport"
    status: pending
  - id: vary-scraps
    content: "Vary scrap placement (workshop/junkyard regions, not mazes)"
    status: pending
  - id: obvious-nav
    content: "Keep navigation obvious"
    status: pending
isProject: true
---

# US-033 — Extra levels

Author 2–3 LevelConfig maps larger than the viewport with varied scrap layouts; still one processor each; obvious navigation.

## Meta

- **Roadmap ID:** US-033
- **Epic:** Epic 4 — Progression
- **Status:** Not started.
- **Done when:** At least 2–3 LevelConfig entries exist, still one processor each.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-007
- US-032

## Out of scope

- Mazes
- Combat arenas
- Multiple processors

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/config/Levels.ts`

## Implementation

1. Add level 2/3 configs with different sizes/layouts/energy.
2. Optional energy pickups only via `powerUps` (US-034 can fill).
3. Playtest reachability without pathfinding aids.

## Constraints

- One processor each.
- No maze intent.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-033.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Player can select/advance through multiple distinct layouts.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
