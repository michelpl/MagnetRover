---
name: US-112 — Enemy placeholder
overview: "Enemy entity spawns, pursues player with arcade lerp, and clamps to map."
todos:
  - id: enemy-entity
    content: Create Enemy entity (hostile rover tint)
    status: pending
  - id: chase-behavior
    content: "Chase behavior: move toward player, no A* pathfinding"
    status: pending
  - id: enemy-recipe-config
    content: Stats from enemyRecipe in stage config
    status: pending
isProject: true
---

# US-112 — Enemy placeholder

Add a hostile rover enemy that chases the player with simple arcade movement.

## Meta

- **Roadmap ID:** US-112
- **Epic:** E1 — Core combat
- **Status:** Not started.
- **Done when:** `Enemy` entity spawns, pursues player with arcade lerp, clamps to map.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-110

## Out of scope

- Contact damage and CombatSystem (US-113)
- Wave bursts and WaveSpawnSystem (US-131)
- Weapon hits on enemies (US-122)
- Pathfinding around obstacles
- Multiple enemy archetypes with distinct AI

Global MVP exclusions: A* pathfinding, Arcade Physics, magnet/cargo loop.

## Likely files

- `src/game/entities/Enemy.ts` (new)
- `src/game/config/GameConfig.ts`
- `src/game/config/LevelConfig.ts` or interim inline spawn config
- `src/game/scenes/GameScene.ts`
- `src/game/entities/Rover.ts` (target position)

## Context

Enemies are placeholder hostile rovers (tinted sprite). Each frame they lerp toward the player position at `speed` from config. Movement must respect map bounds like the rover. Until `StageConfig` exists (US-130), use a minimal inline `enemyRecipe` or temporary config object with `hp`, `speed`, `contactDamage`.

## Implementation

1. Define `EnemyRecipe` type (or interim shape): `hp`, `maxHp`, `speed`, `contactDamage`.
2. Create `Enemy` as Container/Graphics + optional rover sprite with hostile tint.
3. Implement `update(delta, playerX, playerY, mapBounds)`: lerp velocity toward player, clamp to map.
4. Store `hp` on enemy for later combat stories.
5. Spawn one or more enemies from config in `GameScene` for manual testing (full wave spawn is US-131).

## Constraints

- Arcade lerp only — no realistic steering or physics plugin.
- Clamp enemies to map edges.
- Stats come from data, not hardcoded per enemy instance.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-112.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- At least one enemy spawns on the map.
- Enemy moves toward the rover while the player moves.
- Enemy stays inside map bounds.
- No pathfinding plugin added.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
