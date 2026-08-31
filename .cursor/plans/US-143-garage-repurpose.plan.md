---
name: US-143 — Garage repurpose
overview: "GarageScene shows HP, speed, armor + per-weapon upgrade tiers; old upgrade lines removed."
todos:
  - id: replace-upgrade-cards
    content: Replace UpgradeCard lines in garage
    status: pending
  - id: apply-upgrades-run-start
    content: Apply upgrades at run start via Upgrades.ts
    status: pending
  - id: upgrade-costs-config
    content: Costs from GameConfig (e.g. 12 / 30 / 70)
    status: pending
isProject: true
---

# US-143 — Garage repurpose

Spend coins on rover HP, speed, armor and weapon upgrade tiers.

## Meta

- **Roadmap ID:** US-143
- **Epic:** E4 — Meta (inventory + garage)
- **Status:** Not started.
- **Done when:** `GarageScene` shows HP, speed, armor + per-weapon upgrade tiers; old upgrade lines removed.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-140

## Out of scope

- Earning coins (US-144)
- Inventory loadout UI (US-141)
- Visual reskin beyond card line changes
- Capacity/battery/magnet upgrades

Global MVP exclusions: legacy four-line garage (capacity, battery, magnet).

## Likely files

- `src/game/scenes/GarageScene.ts`
- `src/game/ui/UpgradeCard.ts`
- `src/game/save/Upgrades.ts`
- `src/game/save/Save.ts`
- `src/game/config/GameConfig.ts`
- `src/game/scenes/GameScene.ts` (apply at run start)

## Context

Replace garage cards: Rover HP, Speed, Armor plus one card per weapon upgrade tier (damage/fire rate). Remove capacity/battery/magnet lines. `Upgrades.ts` applies tiers when run starts — same pattern as existing stat application. Costs from `GameConfig` tier table (e.g. 12 / 30 / 70 coins).

## Implementation

1. Define `GameConfig.upgrades` for rover lines and per-weapon tiers (costs, max tier, deltas).
2. Refactor `Upgrades.ts`: purchase/apply for `hp`, `speed`, `armor`, `weaponDamage`, etc.
3. Rebuild `GarageScene` card list — remove legacy four lines.
4. Update `UpgradeCard` to support weapon-specific rows if needed.
5. On `GameScene` run start, apply upgraded max HP, speed, armor, weapon stat multipliers.
6. Keep `WalletBar` and hub navigation intact.

## Constraints

- Purchase logic in `Upgrades.ts`, not scene.
- Old upgrade keys removed from UI and save writes.
- English card labels.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-143.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Garage shows HP/speed/armor + weapon upgrades only.
- Purchase spends coins and persists.
- Next run reflects upgraded rover stats and weapon damage.
- No capacity/battery/magnet cards remain.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
