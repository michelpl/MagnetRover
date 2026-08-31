---
name: US-123 — Weapon feel
overview: "Muzzle flash or equivalent, impact SFX, and light shake on kill."
todos:
  - id: audio-haptics-fire-hit
    content: Wire Audio/Haptics for fire and hit
    status: pending
  - id: no-missing-asset-crashes
    content: No missing-asset crashes when clips absent
    status: pending
isProject: true
---

# US-123 — Weapon feel

Make auto-fire combat feel responsive with light VFX and audio.

## Meta

- **Roadmap ID:** US-123
- **Epic:** E2 — Weapons
- **Status:** Not started.
- **Done when:** Muzzle flash or equivalent, impact SFX, light shake on kill.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-122

## Out of scope

- Full combat juice pass (US-151) — death particles, extended screen shake
- New audio asset production (wire existing or placeholders)
- Haptic patterns for every weapon type individually

Global MVP exclusions: none beyond MVP scope.

## Likely files

- `src/game/systems/WeaponSystem.ts`
- `src/game/systems/CombatSystem.ts`
- `src/game/audio/Audio.ts`
- `src/game/audio/Haptics.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/cameras/GameCameras.ts` (light shake)

## Context

Each weapon fire should have a brief visual cue (muzzle flash, arc flicker, drone pulse). Enemy hits play impact SFX; kills trigger light camera shake and optional haptic. `Audio.play` must no-op safely when keys or files are missing — same pattern as existing UI SFX.

## Implementation

1. On fire: spawn short-lived Graphics/sprite flash at rover or weapon anchor; tween alpha out.
2. On weapon hit: call `Audio.play('hit')` (or per-weapon key) with failure-safe guard.
3. On enemy kill: light camera shake via `GameCameras` or scene tweens; optional `Haptics.light()`.
4. On fire: `Audio.play('fire')` failure-safe.
5. Verify no throws when asset keys missing in dev.

## Constraints

- Failure-safe audio — empty catch forbidden; guard before play.
- Shake intensity tuned for mobile (subtle).
- Do not block gameplay if assets missing.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-123.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Visible feedback when weapons fire.
- Hit/kill feedback triggers without console errors.
- Game runs with zero combat audio files loaded.
- Kill produces noticeable but subtle shake.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
