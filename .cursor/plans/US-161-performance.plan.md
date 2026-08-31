---
name: US-161 — Performance
overview: "One full stage with max enemies and 4 weapons runs without blocker FPS drops."
todos:
  - id: cheap-update-loop
    content: Keep update loop cheap (no physics plugin)
    status: pending
  - id: pool-projectiles
    content: Pool projectiles if count grows
    status: pending
isProject: true
---

# US-161 — Performance

Keep combat smooth on modest Android devices.

## Meta

- **Roadmap ID:** US-161
- **Epic:** E6 — Mobile ship
- **Status:** Not started.
- **Done when:** One full stage with max enemies and 4 weapons runs without blocker FPS drops.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-133
- US-122
- US-123

## Out of scope

- New rendering pipeline or WebGL shaders
- Arcade Physics plugin
- Reducing enemy counts for balance (tune separately)
- Desktop-only optimizations

Global MVP exclusions: physics plugin.

## Likely files

- `src/game/scenes/GameScene.ts`
- `src/game/systems/WeaponSystem.ts`
- `src/game/systems/WaveSpawnSystem.ts`
- `src/game/systems/CombatSystem.ts`
- `src/game/entities/Projectile.ts`
- `src/game/config/GameConfig.ts`

## Context

Worst case: stage 5 peak enemy count + four weapons firing projectiles. Profile `update()` cost: avoid O(n²) loops where possible, pool projectiles instead of create/destroy churn, limit particle counts from US-151. Target stable play on modest phones — no hard FPS counter required, but no obvious stutter during peak wave.

## Implementation

1. Audit hot paths in `GameScene.update` — single pass over enemies where feasible.
2. Implement `ProjectilePool` (or generic pool) — acquire on fire, release on hit/timeout.
3. Cap simultaneous projectiles per weapon if needed via `GameConfig.performance`.
4. Confirm no physics plugin imported.
5. Test stage 5 with full loadout on device or throttled CPU in Chrome DevTools.
6. Fix obvious allocations in per-frame loops (reuse arrays, avoid spread in hot path).

## Constraints

- Gameplay feel unchanged — pooling must be invisible.
- Tunables in `GameConfig`, not magic caps in entities.
- Maintain strict TypeScript.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-161.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Stage 5 + 4 weapons playable without severe stutter.
- Projectile pool reuses instances (inspect count stability in dev log if added).
- No Arcade Physics in bundle.
- `npm run build` passes.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
