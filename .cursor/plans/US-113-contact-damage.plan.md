---
name: US-113 — Contact damage
overview: "Overlap between rover and enemy applies contactDamage respecting i-frames and armor."
todos:
  - id: combat-system
    content: Create CombatSystem (damage, death, simple AABB/distance checks)
    status: pending
  - id: enemy-death-count
    content: Enemy death removes entity and decrements remainingEnemies
    status: pending
  - id: hit-feedback
    content: "Hit feedback: flash, optional SFX/haptics"
    status: pending
isProject: true
---

# US-113 — Contact damage

Enemies damage the rover on contact; enemies can die and decrement the remaining count.

## Meta

- **Roadmap ID:** US-113
- **Epic:** E1 — Core combat
- **Status:** Not started.
- **Done when:** Overlap between rover and enemy applies `contactDamage` respecting i-frames and armor.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-111
- US-112

## Out of scope

- Weapon/projectile hits (US-122)
- Win condition when all enemies dead (US-114)
- Wave spawn scheduling (US-131)
- Coin rewards on kill (US-144)
- Complex hitboxes or physics colliders

Global MVP exclusions: Arcade Physics plugin, pathfinding.

## Likely files

- `src/game/systems/CombatSystem.ts` (new)
- `src/game/systems/HpSystem.ts`
- `src/game/entities/Enemy.ts`
- `src/game/entities/Rover.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/audio/Audio.ts`
- `src/game/audio/Haptics.ts`

## Context

`CombatSystem` runs each frame: distance or AABB overlap between rover and each live enemy triggers `HpSystem.applyDamage(contactDamage)` when i-frames allow. Armor from `GameConfig` reduces effective damage. Track `remainingEnemies`; when an enemy's HP hits 0 (weapon hits in US-122), remove it and decrement the counter.

## Implementation

1. Create `CombatSystem` with rover-enemy overlap checks (circle distance is fine for MVP).
2. On overlap, apply contact damage through `HpSystem` (respect i-frames + armor).
3. Add `remainingEnemies` counter on run state or combat helper; init from spawned count.
4. Implement `killEnemy(enemy)` — destroy display object, decrement counter.
5. Rover damage flash (tint tween) on hit; optional `Audio` / `Haptics` if clips exist (failure-safe).

## Constraints

- No Arcade Physics bodies — manual distance checks only.
- Combat math lives in `CombatSystem`, not `GameScene`.
- Keep per-frame work cheap for mobile.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-113.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Touching an enemy reduces rover HP (with i-frame gap between hits).
- Armor tunable in `GameConfig` visibly reduces damage.
- Killing an enemy removes it and decrements `remainingEnemies`.
- Hit flash visible on rover damage.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
