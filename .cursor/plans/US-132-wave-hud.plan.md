---
name: US-132 — Wave HUD
overview: "WaveIndicator shows remaining count or wave progress (replaces CleanBar)."
todos:
  - id: create-wave-indicator
    content: Create WaveIndicator.ts
    status: pending
  - id: remove-clean-bar
    content: Remove CleanBar from HUD
    status: pending
isProject: true
---

# US-132 — Wave HUD

Show the player how many enemies remain in the current wave.

## Meta

- **Roadmap ID:** US-132
- **Epic:** E3 — Waves
- **Status:** Not started.
- **Done when:** `WaveIndicator` shows remaining count or wave progress (replaces `CleanBar`).
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-131

## Out of scope

- Clean-map / cleanup percentage (legacy)
- Minimap enemy blips (US-152)
- Spawn timer countdown UI
- HP bar changes (US-111)

Global MVP exclusions: energy bar, cargo indicator.

## Likely files

- `src/game/ui/WaveIndicator.ts` (new)
- `src/game/ui/CleanBar.ts` (remove from HUD)
- `src/game/scenes/GameScene.ts`
- `src/game/systems/CombatSystem.ts` or run state (`remainingEnemies`)

## Context

Replace legacy `CleanBar` with a compact HUD widget showing enemies remaining (e.g. "Enemies: 12" or icon + count). Bind to `remainingEnemies` each frame or on kill events. Reuse panel styling from existing HUD (`CleanBar`, `HpBar` patterns). Use `viewSize` from live scale for portrait layout.

## Implementation

1. Create `WaveIndicator` widget with `setRemaining(count)` or `refresh(remaining, total?)`.
2. Mount in `GameScene` HUD layer at same depth band as `HpBar`.
3. Remove `CleanBar` import, create, and update from `GameScene`.
4. Delete `CleanBar.ts` if unused elsewhere.
5. Optional: show total wave size if easily computed from stage config.

## Constraints

- HUD uses live `scene.scale` size — no hardcoded 1080×1920-only layout.
- English user-facing label.
- Widget owns draw logic; scene only passes numbers.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-132.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Remaining enemy count visible during run.
- Count decreases when enemies die.
- `CleanBar` no longer appears.
- Layout works with joystick and HP bar.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
