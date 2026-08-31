---
name: US-153 — Audio pass
overview: "Fire, hit, enemy death, player hurt, win, lose clips wired (failure-safe)."
todos:
  - id: combat-sfx-wiring
    content: Wire fire, hit, death, hurt, win, lose SFX
    status: pending
  - id: boot-preload
    content: Preload in BootScene when assets exist
    status: pending
isProject: true
---

# US-153 — Audio pass

Add distinct combat sound effects with failure-safe loading.

## Meta

- **Roadmap ID:** US-153
- **Epic:** E5 — Content and feel
- **Status:** Not started.
- **Done when:** Fire, hit, enemy death, player hurt, win, lose clips wired (failure-safe).
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-123
- US-113

## Out of scope

- Music soundtrack overhaul
- Recording new assets (wire placeholders or existing clips)
- 3D spatial audio
- Haptics redesign

Global MVP exclusions: none.

## Likely files

- `src/game/audio/Audio.ts`
- `src/game/scenes/BootScene.ts`
- `src/game/systems/WeaponSystem.ts`
- `src/game/systems/CombatSystem.ts`
- `src/game/scenes/ResultScene.ts`
- `public/assets/audio/` (if adding files)

## Context

Map combat events to audio keys: `fire`, `hit`, `enemyDeath`, `playerHurt`, `win`, `lose`. Preload in `BootScene` only when files exist. `Audio.play` must guard missing keys — no throws. Reuse US-027 plumbing patterns.

## Implementation

1. Define audio key constants aligned with BootScene preload entries.
2. Preload combat clips in `BootScene` (optional files — skip gracefully).
3. Hook `WeaponSystem` fire → `fire` SFX.
4. Hook weapon hit → `hit`; enemy kill → `enemyDeath`.
5. Hook rover damage → `playerHurt`.
6. Hook `ResultScene` → `win` or `lose` on enter.
7. Test with assets removed — game silent but stable.

## Constraints

- Failure-safe playback — no empty catch; explicit guards.
- Do not block gameplay on load failure.
- English key names only in code.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-153.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Each event triggers correct SFX when files present.
- Missing files cause no crash.
- Win/lose sounds play once on result.
- Volume consistent with existing UI sounds.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
