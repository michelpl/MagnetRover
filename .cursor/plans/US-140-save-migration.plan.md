---
name: US-140 — Save shape migration
overview: "Save includes ownedWeapons, loadout[4], weaponUpgrades, roverUpgrades { hp, speed, armor }."
todos:
  - id: migrate-save-ts
    content: Migrate Save.ts with backward-compatible default for old saves
    status: pending
  - id: remove-legacy-upgrade-keys
    content: Remove capacity/battery/magnet upgrade keys from new saves
    status: pending
isProject: true
---

# US-140 — Save shape migration

Persist weapons, loadout, and survival upgrades in localStorage.

## Meta

- **Roadmap ID:** US-140
- **Epic:** E4 — Meta (inventory + garage)
- **Status:** Not started.
- **Done when:** Save includes `ownedWeapons`, `loadout[4]`, `weaponUpgrades`, `roverUpgrades { hp, speed, armor }`.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-120

## Out of scope

- Inventory UI (US-141)
- Garage UI repurpose (US-143)
- Win unlock logic (US-142)
- Cloud save or encryption

Global MVP exclusions: capacity/battery/magnet upgrade lines.

## Likely files

- `src/game/save/Save.ts`
- `src/game/save/Upgrades.ts`
- `src/game/config/Weapons.ts`

## Context

Extend save schema for survival meta. Old saves with capacity/battery/magnet keys must load with sensible defaults (two starter weapons, empty tiers). New writes omit legacy keys. Parse external data as `unknown` until validated.

## Implementation

1. Define save types: `ownedWeapons: WeaponId[]`, `loadout: (WeaponId | null)[4]`, `weaponUpgrades: Record<WeaponId, tier>`, `roverUpgrades: { hp, speed, armor }`.
2. Add migration in load path: if legacy keys present, map to defaults and strip on next save.
3. Default new game: 2 owned weapons (MVP open decision #5), loadout filled with those two.
4. Remove or ignore `capacity`, `battery`, `magnetRadius` upgrade fields in new schema.
5. Export helpers: `getLoadout()`, `setLoadoutSlot()`, `getOwnedWeapons()`.

## Constraints

- Strict TypeScript; validate parsed JSON.
- Backward compatible — no crash on old localStorage.
- English field names in code.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-140.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Fresh save has survival fields with defaults.
- Old save loads without error and migrates on save.
- `WeaponSystem` can read loadout from save (US-121 integration).
- Legacy upgrade keys not written on new save.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
