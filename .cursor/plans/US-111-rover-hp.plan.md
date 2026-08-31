---
name: US-111 — Rover HP
overview: "Rover has maxHp/hp; damage reduces hp; hp <= 0 triggers defeat."
todos:
  - id: hp-fields
    content: Add HP fields to Rover (or HpSystem owner)
    status: pending
  - id: hp-system
    content: Create HpSystem for damage and i-frames (300 ms per MVP)
    status: pending
  - id: hp-bar-ui
    content: Create HpBar UI (replaces EnergyBar)
    status: pending
  - id: game-config-hp
    content: Put base HP and armor in GameConfig
    status: pending
isProject: true
---

# US-111 — Rover HP

Give the player a health bar and defeat when HP reaches zero.

## Meta

- **Roadmap ID:** US-111
- **Epic:** E1 — Core combat
- **Status:** Not started.
- **Done when:** Rover has `maxHp` / `hp`; damage reduces hp; `hp <= 0` triggers defeat.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-110

## Out of scope

- Enemy contact damage (US-113)
- Win/lose flow and ResultScene (US-114)
- Garage HP upgrades (US-143)
- Regenerative HP
- Shield or overheal mechanics

Global MVP exclusions: pathfinding, Arcade Physics, magnet/cargo/energy loop, multiple processor types.

## Likely files

- `src/game/systems/HpSystem.ts` (new)
- `src/game/ui/HpBar.ts` (new)
- `src/game/entities/Rover.ts`
- `src/game/config/GameConfig.ts`
- `src/game/scenes/GameScene.ts`

## Context

MVP recommends base rover HP (~100), armor reducing incoming damage, and invulnerability frames (~300 ms) after a hit. `HpSystem` owns damage application and i-frame timing; `HpBar` replaces the legacy `EnergyBar` in the HUD. Defeat on `hp <= 0` can set a flag or call `RunState` — full ResultScene wiring lands in US-114.

## Implementation

1. Add `GameConfig.rover` (or similar): `baseMaxHp`, `baseArmor`, `invulnMs` (default 300).
2. Create `HpSystem` with `applyDamage(amount)`, i-frame gate, and `isDead` / `hp` getters.
3. Either extend `Rover` with hp fields or let `HpSystem` own rover HP state keyed to the rover instance.
4. Wire `HpSystem` in `GameScene`; expose a test hook or temporary debug damage if no enemies yet.
5. Create `HpBar` using existing HUD patterns (`EnergyBar` layout as reference); bind to current/max HP each frame.
6. On `hp <= 0`, signal defeat (minimal stub OK until US-114).

## Constraints

- Tunables live in `GameConfig`, not magic numbers in `update()`.
- No passive HP regeneration.
- English identifiers and user-facing copy.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-111.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- HP bar visible during a run.
- Applying damage reduces displayed HP.
- Repeated hits respect ~300 ms i-frames.
- HP at 0 triggers defeat signal (even if ResultScene is stubbed).

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
