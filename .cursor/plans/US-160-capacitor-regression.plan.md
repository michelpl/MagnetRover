---
name: US-160 — Capacitor regression
overview: "APK/AAB builds; immersive chrome; save works after survival refactor."
todos:
  - id: retest-after-refactor
    content: Re-test after legacy removal
    status: pending
  - id: one-hand-layout
    content: Confirm one-hand joystick + HUD layout
    status: pending
isProject: true
---

# US-160 — Capacitor regression

Verify the survival build on Android after the combat refactor.

## Meta

- **Roadmap ID:** US-160
- **Epic:** E6 — Mobile ship
- **Status:** Not started. Capacitor project already exists.
- **Done when:** APK/AAB builds; immersive chrome; save works.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-114 (minimum playable survival loop)

## Out of scope

- FPS optimization pass (US-161)
- Play Store submission
- New native plugins
- iOS build

Global MVP exclusions: none.

## Likely files

- `capacitor.config.ts`
- `android/` project
- `package.json` (build scripts)
- `src/game/scenes/GameScene.ts` (HUD safe areas)
- `src/game/ui/VirtualJoystick.ts`
- `src/game/save/Save.ts`

## Context

Capacitor shell predates survival pivot. After legacy removal and HUD changes (HpBar, WaveIndicator), re-verify Android build, immersive fullscreen, localStorage save persistence, and one-hand portrait layout — joystick clear of system gestures, HUD not under notch.

## Implementation

1. Run web build + `cap sync` + Android assemble (AAB/APK per existing scripts).
2. Install on device/emulator; smoke test stage 1 start-to-result.
3. Confirm immersive/status bar handling still correct.
4. Verify save persists across app restart (coins, loadout if E4 done).
5. Check joystick thumb reach and HUD overlap on tall/narrow aspect ratios.
6. Fix layout regressions only — no feature additions.

## Constraints

- Do not change Capacitor config without cause.
- Portrait 1080×1920 design with Scale.EXPAND — test letterboxing.
- Document any device-specific issues in commit message if fixed.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-160.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Android build succeeds.
- Game playable on device: move, fight, win/lose.
- Save survives force-close and reopen.
- Joystick and HUD usable one-handed.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
