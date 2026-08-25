---
name: US-028 — Coins
overview: "Award 1 coin per processed scrap; persist total between runs; show on result/upgrade screens. No multipliers."
todos:
  - id: award-coins
    content: "Award 1 coin per processed scrap"
    status: pending
  - id: show-total
    content: "Show coin total on result / upgrade screens"
    status: pending
  - id: no-multipliers
    content: "No multipliers in MVP"
    status: pending
isProject: true
---

# US-028 — Coins

Award 1 coin per processed scrap; persist total between runs; show on result/upgrade screens. No multipliers.

## Meta

- **Roadmap ID:** US-028
- **Epic:** Epic 4 — Progression
- **Status:** Not started. Start Epic 4 only after Epic 1–2 feel good.
- **Done when:** playerCoins += processedObjects and the total survives a refresh.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-013
- US-029

## Out of scope

- Premium currency
- Multipliers
- Ads for coins

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/ProgressSystem.ts`
- `src/game/save/Save.ts`
- `src/game/scenes/ResultScene.ts`

## Implementation

1. On each processed scrap: `coins += 1` and persist via save helper.
2. Display on Result/Upgrade.
3. Retry behavior: coins already saved stay (player keeps earnings) — document in code; alternatively award only on leave — pick persist-on-process for arcade gratification.

## Constraints

- Exactly 1:1 scrap to coin.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-028.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Process N scraps → +N coins; refresh page → coins remain.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
