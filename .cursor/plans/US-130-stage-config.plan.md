---
name: US-130 — StageConfig + WaveConfig
overview: "StageConfig replaces scrap-oriented LevelConfig; includes wave.bursts[]."
todos:
  - id: stage-config-files
    content: Add StageConfig.ts and Stages.ts (or migrate Levels.ts)
    status: pending
  - id: wave-config-shape
    content: "Define WaveConfig burst shape: count, intervalMs, delayAfterMs"
    status: pending
  - id: rover-spawn
    content: Rover spawns at map center (or spawn from config)
    status: pending
isProject: true
---

# US-130 — StageConfig + WaveConfig

Replace scrap-oriented level data with stage and wave configuration.

## Meta

- **Roadmap ID:** US-130
- **Epic:** E3 — Waves
- **Status:** Not started.
- **Done when:** `StageConfig` replaces scrap-oriented `LevelConfig`; includes `wave.bursts[]`.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-114

## Out of scope

- WaveSpawnSystem runtime (US-131)
- Authoring all five stage recipes (US-133)
- Scrap/processor fields in level data
- New map backgrounds (keep `scenario1`)

Global MVP exclusions: procedural level generation for scrap placement.

## Likely files

- `src/game/config/StageConfig.ts` (new)
- `src/game/config/Stages.ts` (new)
- `src/game/config/LevelConfig.ts` (deprecate or adapt)
- `src/game/config/Levels.ts`
- `src/game/levels/recipes.ts`
- `src/game/scenes/GameScene.ts`

## Context

Each stage references the same workshop map (`scenario1`) with obstacle slots and an `enemyRecipe` plus `wave.bursts[]`. Each burst: spawn `count` enemies every `intervalMs`, then wait `delayAfterMs` before the next burst. Rover spawn defaults to map center unless config provides `spawn: { x, y }`.

## Implementation

1. Define `WaveBurstConfig`: `{ count, intervalMs, delayAfterMs }`.
2. Define `WaveConfig`: `{ bursts: WaveBurstConfig[] }`.
3. Define `EnemyRecipe`: hp, speed, contactDamage (align with US-112).
4. Define `StageConfig`: id, backgroundKey, obstacles, enemyRecipe, wave, optional spawn point.
5. Create `Stages.ts` with at least one test stage; migrate carousel/menu to read stage id.
6. Position rover at center or config spawn in `GameScene`.

## Constraints

- Data-driven stages — no hardcoded wave tables in scene.
- Keep backward compatibility path until US-133 replaces all recipes.
- English type and field names.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-130.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- `StageConfig` type exports and one stage loads in dev.
- Wave burst shape matches ROADMAP fields.
- Rover spawns at expected position.
- Legacy scrap fields not required for new stages.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
