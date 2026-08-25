---
name: US-037 — Phone layout and performance
overview: "Validate portrait FIT, cheap update loop, joystick reach, HUD vs joystick, and produce APK + AAB."
todos:
  - id: test-resolutions
    content: "Test portrait FIT on a few resolutions"
    status: pending
  - id: cheap-update
    content: "Keep update cheap (no physics, modest scrap count)"
    status: pending
  - id: joystick-reach
    content: "Confirm one-hand joystick reach"
    status: pending
  - id: hud-vs-joystick
    content: "Confirm HUD does not cover the joystick"
    status: pending
  - id: apk
    content: "Generate APK"
    status: pending
  - id: aab
    content: "Generate AAB"
    status: pending
isProject: true
---

# US-037 — Phone layout and performance

Validate portrait FIT, cheap update loop, joystick reach, HUD vs joystick, and produce APK + AAB.

## Meta

- **Roadmap ID:** US-037
- **Epic:** Epic 5 — Mobile ship
- **Status:** Not started.
- **Done when:** One complete level runs without blocker bugs or heavy frame drops; APK and AAB exist.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-036
- US-006
- US-015

## Out of scope

- PC ultra settings
- Physics experiments

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `android/`
- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`

## Implementation

1. Profile on a mid/low Android device or emulator.
2. Fix overlaps / shrink effects if frame time spikes.
3. Document build commands in a short comment or existing README only if already present — do not invent large docs unless needed.
4. Produce release APK and AAB via Android Gradle.

## Constraints

- No physics plugin “optimizations” that change feel.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-037.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Full level completable on device.
- APK and AAB artifacts build successfully.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
