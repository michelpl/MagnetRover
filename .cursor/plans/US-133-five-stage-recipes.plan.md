---
name: US-133 — Five stage recipes
overview: "Five StageConfig entries scale enemy count/HP/speed; same scenario1 background."
todos:
  - id: author-five-recipes
    content: Author 5 wave recipes (replace scrap STAGE_RECIPES)
    status: pending
  - id: keep-obstacles
    content: Keep obstacle slots where appropriate
    status: pending
  - id: linear-unlock
    content: Stage carousel still unlocks linearly
    status: pending
isProject: true
---

# US-133 — Five stage recipes

Author five difficulty-scaled stages on the same map.

## Meta

- **Roadmap ID:** US-133
- **Epic:** E3 — Waves
- **Status:** Not started.
- **Done when:** 5 `StageConfig` entries scale enemy count/HP/speed; same `scenario1` background.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-130
- US-131

## Out of scope

- New maps or art
- Weapon unlock rules (US-142)
- Balance solver / procedural generation
- Endless mode

Global MVP exclusions: scrap placement recipes.

## Likely files

- `src/game/config/Stages.ts`
- `src/game/config/StageConfig.ts`
- `src/game/levels/recipes.ts` (replace or remove scrap recipes)
- `src/game/ui/StageCarousel.ts`
- `src/game/scenes/MenuScene.ts`
- `src/game/save/Save.ts` (unlocked stage index)

## Context

Stages 1–5 share `scenario1` background and obstacle layout with increasing `enemyRecipe` stats and heavier wave bursts. Replace legacy `STAGE_RECIPES` / scrap-oriented level generation. Carousel continues linear unlock: beat stage N to unlock N+1.

## Implementation

1. Define five entries in `Stages.ts` with monotonic difficulty (more enemies, higher HP/speed).
2. Tune burst schedules: stage 1 shorter/slower; stage 5 more enemies and tighter intervals.
3. Reuse obstacle slots from existing layout generator or static config per stage.
4. Point `StageCarousel` and `MenuScene` play flow at `StageConfig` by id.
5. Remove or bypass scrap `STAGE_RECIPES` / `generateLevel` scrap paths if still referenced.
6. Verify save `unlockedStage` (or equivalent) still advances on win.

## Constraints

- Same map art for all five — difficulty via data only.
- Playtest stage 1 before maxing stage 5 counts.
- Data in config files, not inline in scenes.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-133.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Five selectable stages in carousel (respecting unlock).
- Each stage loads scenario1 with distinct wave/enemy stats.
- Stage 5 noticeably harder than stage 1.
- Linear unlock still works after wins.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
