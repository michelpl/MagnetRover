---
name: US-144 — Coins from combat
overview: "Coins credited on ResultScene (not in-run drops — per open decision #3)."
todos:
  - id: coin-formula
    content: 1 coin per kill + stage bonus
    status: pending
  - id: result-display
    content: Display on result screen
    status: pending
isProject: true
---

# US-144 — Coins from combat

Award coins for kills and stage wins on the result screen.

## Meta

- **Roadmap ID:** US-144
- **Epic:** E4 — Meta (inventory + garage)
- **Status:** Not started.
- **Done when:** Coins credited on `ResultScene` (not in-run drops — per open decision #3).
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-114
- US-113

## Out of scope

- In-run coin pickups or floating +1 text
- Coin spend UI (garage already exists — US-143)
- Lose-run coin rewards (unless MVP specifies — default none on lose)
- IAP or ads

Global MVP exclusions: per-scrap coin collection.

## Likely files

- `src/game/scenes/GameScene.ts` (track kills)
- `src/game/scenes/ResultScene.ts`
- `src/game/save/Save.ts`
- `src/game/config/GameConfig.ts` (bonus table)

## Context

MVP open decision #3: credit coins on result, not during combat. Track `killCount` during run. On win: `coins = kills * 1 + stageBonus[stageId]`; persist via `Save.addCoins`. On lose: optional partial kill coins or zero — document choice in config. Show breakdown on ResultScene.

## Implementation

1. Track kills in `CombatSystem` or run session state.
2. Pass `{ kills, stageId, outcome }` to `ResultScene`.
3. Compute payout from `GameConfig.coins` (perKill, stageBonuses).
4. On win (and optionally lose per config), `Save.addCoins(payout)`.
5. Result UI: "Kills: N", "+N coins", stage bonus line, total wallet after credit.

## Constraints

- No in-run coin entities or magnet collection.
- Credit once on result — idempotent if scene revisited.
- English result copy.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-144.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Winning a run increases saved coin total.
- Result screen shows kill and bonus breakdown.
- No coins spawn on map during play.
- Garage wallet reflects new total after win.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
