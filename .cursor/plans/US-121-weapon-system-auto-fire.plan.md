---
name: US-121 — WeaponSystem auto-fire
overview: "Each loadout slot runs its own cooldown timer and triggers attacks."
todos:
  - id: create-weapon-system
    content: Create WeaponSystem
    status: pending
  - id: read-loadout
    content: Read loadout from save/registry at run start
    status: pending
  - id: max-four-weapons
    content: Max 4 active weapons per run
    status: pending
isProject: true
---

# US-121 — WeaponSystem auto-fire

Equipped weapons fire automatically on their own cooldowns.

## Meta

- **Roadmap ID:** US-121
- **Epic:** E2 — Weapons
- **Status:** Not started.
- **Done when:** Each loadout slot runs its own cooldown timer and triggers attacks.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-120

## Out of scope

- Projectile spawning and enemy HP reduction (US-122)
- Inventory UI for changing loadout (US-141)
- Full save migration (US-140) — use hardcoded default loadout until save exists
- Weapon upgrade tiers (US-143)
- Manual fire or aim

Global MVP exclusions: player-triggered firing, skill trees.

## Likely files

- `src/game/systems/WeaponSystem.ts` (new)
- `src/game/config/Weapons.ts`
- `src/game/save/Save.ts` (read-only or interim default)
- `src/game/scenes/GameScene.ts`
- `src/game/entities/Rover.ts`

## Context

Up to four weapons fire without player input. Each slot holds a `WeaponId | null`; `WeaponSystem.update(delta)` decrements per-weapon cooldowns and calls behavior-specific `fire()` hooks. Until US-122, `fire()` may log or spawn placeholder graphics. Default loadout: first two weapons from MVP open decision #5 until save migration.

## Implementation

1. Create `WeaponSystem` with four slots and per-slot cooldown timers.
2. At run start, resolve loadout from `Save` or interim default (e.g. Pulse Cannon + Arc Turret).
3. Each frame, for each equipped weapon: if cooldown elapsed, invoke fire handler and reset timer from `fireRateMs`.
4. Pass rover position/rotation and enemy list into fire context.
5. Wire `WeaponSystem` in `GameScene` after rover update.

## Constraints

- Max 4 active weapons; ignore excess slots.
- Cooldown logic in `WeaponSystem`, not scattered in scene.
- Keep update loop cheap.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-121.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Equipped weapons attempt to fire on interval while playing.
- Four slots enforced; empty slots do nothing.
- Cooldowns independent per weapon.
- Game runs without save migration (default loadout works).

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
