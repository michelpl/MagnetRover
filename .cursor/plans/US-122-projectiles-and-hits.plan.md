---
name: US-122 — Projectiles and hits
overview: "Projectile or instant-hit weapons reduce enemy HP; enemy dies at 0."
todos:
  - id: projectile-entity
    content: Create Projectile entity (where needed)
    status: pending
  - id: combat-weapon-hits
    content: CombatSystem resolves weapon hits on enemies
    status: pending
  - id: obstacles-block
    content: Obstacles block projectiles (per MVP open decision #7)
    status: pending
isProject: true
---

# US-122 — Projectiles and hits

Weapons damage enemies; enemies die when HP reaches zero.

## Meta

- **Roadmap ID:** US-122
- **Epic:** E2 — Weapons
- **Status:** Not started.
- **Done when:** Projectile or instant-hit weapons reduce enemy HP; enemy dies at 0.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-121
- US-112

## Out of scope

- Weapon feel polish (US-123)
- Projectile pooling at scale (US-161)
- Complex pierce/bounce rules
- Friendly fire on rover

Global MVP exclusions: Arcade Physics plugin — use manual overlap for hits.

## Likely files

- `src/game/entities/Projectile.ts` (new)
- `src/game/systems/CombatSystem.ts`
- `src/game/systems/WeaponSystem.ts`
- `src/game/entities/Enemy.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts` (obstacle rects if needed)

## Context

Pulse Cannon spawns moving projectiles; Arc Turret / Orbit Drone may use instant overlap checks. `CombatSystem` applies weapon damage to enemy HP and calls existing kill path from US-113. Per MVP open decision #7, projectiles stop or despawn when hitting map obstacles (reuse obstacle data from level layout).

## Implementation

1. Add `Projectile` entity: position, velocity, damage, lifetime; update each frame.
2. Extend `WeaponSystem` fire hooks to spawn projectiles or apply instant hits per weapon kind.
3. In `CombatSystem`, test projectile-enemy and instant-hit overlaps; apply damage.
4. On enemy `hp <= 0`, reuse `killEnemy` — decrement `remainingEnemies`.
5. Test projectile vs obstacle bounds; destroy projectile on hit.
6. Orbit Drone: orbiting hitbox around rover checking enemy overlap on interval.

## Constraints

- No physics plugin — manual circle/AABB checks.
- Obstacle blocking must not crash if obstacle list empty.
- Damage values from `WeaponDefinition`, not hardcoded in entity.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-122.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Weapons reduce enemy HP; enemy removed at 0 HP.
- Win condition can trigger when all enemies killed by weapons.
- Projectiles despawn on obstacle contact.
- Instant-hit weapons (arc/drone) damage nearby enemies.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
