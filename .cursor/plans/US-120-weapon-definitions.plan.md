---
name: US-120 — Weapon definitions
overview: "Weapons.ts defines at least 4 placeholder weapons with damage, fireRate, and range."
todos:
  - id: weapon-definition-type
    content: Add WeaponDefinition type
    status: pending
  - id: ship-four-weapons
    content: Ship Pulse Cannon, Arc Turret, Orbit Drone, Mine Layer (behavior stubs OK)
    status: pending
  - id: weapon-tunables
    content: Put weapon tunables in GameConfig
    status: pending
isProject: true
---

# US-120 — Weapon definitions

Define data-driven weapons for the auto-fire loadout.

## Meta

- **Roadmap ID:** US-120
- **Epic:** E2 — Weapons
- **Status:** Not started.
- **Done when:** `Weapons.ts` defines at least 4 placeholder weapons with damage, fireRate, range.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-114

## Out of scope

- WeaponSystem auto-fire timers (US-121)
- Projectile entities and hit resolution (US-122)
- Save/loadout persistence (US-140)
- Visual polish and SFX (US-123)
- More than 4 weapon definitions

Global MVP exclusions: manual aim, skill trees, crafting.

## Likely files

- `src/game/config/Weapons.ts` (new)
- `src/game/config/GameConfig.ts`

## Context

MVP lists four starter weapons: Pulse Cannon (forward projectile), Arc Turret (short-range arc), Orbit Drone (orbiting hitbox), Mine Layer (delayed area). Define a discriminated union or tagged `WeaponDefinition` with shared stats (`damage`, `fireRateMs`, `range`) and behavior-specific fields. Behavior execution is stubbed until US-121/122.

## Implementation

1. Add `WeaponId` union and `WeaponDefinition` type (discriminated by `kind` or similar).
2. Create registry in `Weapons.ts` with four entries and stable string IDs.
3. Export `getWeaponDefinition(id)` helper with exhaustiveness for unknown IDs.
4. Add `GameConfig.weapons` overrides for tuning (damage multipliers, default fire rates).
5. Document behavior intent in comments — no runtime firing in this story.

## Constraints

- Strict TypeScript; no `any`.
- External JSON not required — TypeScript data is fine for MVP.
- English identifiers only.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-120.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Four weapons registered with damage, fireRate, range.
- Types compile under `strict`.
- `GameConfig` exposes tunable weapon defaults.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
