---
name: US-027 — Audio and haptics plumbing
overview: "Centralize SFX loading and one-shot helpers plus vibration no-op without Capacitor; missing audio must never break a run."
todos:
  - id: audio-folder
    content: "Add audio folder and load clips in BootScene"
    status: pending
  - id: oneshot-helpers
    content: "Centralize play-one-shot helpers (no scattered sound.play)"
    status: pending
  - id: vibrate-helper
    content: "Vibration helper no-ops when Capacitor absent"
    status: pending
  - id: safe-failures
    content: "Mute/ignore audio failures so missing files never break a run"
    status: pending
isProject: true
---

# US-027 — Audio and haptics plumbing

Centralize SFX loading and one-shot helpers plus vibration no-op without Capacitor; missing audio must never break a run.

## Meta

- **Roadmap ID:** US-027
- **Epic:** Epic 3 — Game feel
- **Status:** Not started. Do early in Epic 3 so feedback stories share helpers.
- **Done when:** Gameplay events can play SFX and vibration through shared helpers.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-001

## Out of scope

- Full music system
- Adaptive soundtrack

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/audio/Audio.ts`
- `src/game/audio/Haptics.ts`
- `src/game/scenes/BootScene.ts`
- `public/assets/audio/`

## Implementation

1. `public/assets/audio/` with placeholder short SFX (or generate silent-safe keys).
2. BootScene preload; `Audio.play(key)` wraps try/catch / existence checks.
3. `Haptics.vibrate(ms)` calls Capacitor Haptics if present, else no-op.
4. Ban direct `scene.sound.play` in entities — use helpers.

## Constraints

- Failure-safe: never throw into GameScene update.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-027.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Calling play with missing key does not crash.
- Desktop vibration is silent no-op.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
