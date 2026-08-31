---
name: US-142 — Weapon unlock progression
overview: "Per MVP open decision #5 — 2 weapons at start, +1 per stage won (tunable)."
todos:
  - id: unlock-on-win
    content: Unlock logic in Save.applyWin or dedicated helper
    status: pending
  - id: locked-weapons-ui
    content: Locked weapons visible but not equippable
    status: pending
isProject: true
---

# US-142 — Weapon unlock progression

Unlock additional weapons as the player clears stages.

## Meta

- **Roadmap ID:** US-142
- **Epic:** E4 — Meta (inventory + garage)
- **Status:** Not started.
- **Done when:** Per MVP open decision #5 — 2 weapons at start, +1 per stage won (tunable).
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-140
- US-114

## Out of scope

- Coin-gated weapon purchases
- Random loot drops
- Respec or refund unlocks
- More than four weapons in loadout

Global MVP exclusions: gacha, crafting.

## Likely files

- `src/game/save/Save.ts`
- `src/game/config/GameConfig.ts` (unlock order table)
- `src/game/config/Weapons.ts`
- `src/game/scenes/ResultScene.ts`
- `src/game/ui/InventoryUI.ts`

## Context

MVP open decision #5: start with 2 weapons; each stage win unlocks the next weapon in a fixed order (Pulse → Arc → Orbit → Mine). Tunable via `GameConfig.weaponUnlockOrder`. Inventory shows locked entries grayed out; cannot equip until owned.

## Implementation

1. Add `weaponUnlockOrder: WeaponId[]` to `GameConfig`.
2. Implement `unlockNextWeapon()` called from win handler (`Save.applyWin` or Result → Save).
3. Idempotent unlock — no duplicate adds to `ownedWeapons`.
4. Update `InventoryUI` to render locked vs owned states.
5. Prevent equipping weapons not in `ownedWeapons`.

## Constraints

- Unlock order data-driven, not hardcoded in UI.
- Winning same stage twice must not duplicate unlocks incorrectly.
- English UI strings ("Locked").

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-142.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- New game owns exactly 2 weapons.
- Beating stage 1 unlocks third weapon in inventory.
- Locked weapons visible but not equippable.
- Tunable order via `GameConfig`.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
