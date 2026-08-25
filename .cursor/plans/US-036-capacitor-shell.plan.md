---
name: US-036 — Capacitor shell
overview: "Add Capacitor, create Android project, confirm localStorage works, wire vibration when Capacitor present."
todos:
  - id: add-capacitor
    content: "Add Capacitor"
    status: pending
  - id: android-project
    content: "Create the Android project"
    status: pending
  - id: localstorage-ok
    content: "Confirm localStorage still works"
    status: pending
  - id: wire-vibration
    content: "Wire vibration through Capacitor when present"
    status: pending
isProject: true
---

# US-036 — Capacitor shell

Add Capacitor, create Android project, confirm localStorage works, wire vibration when Capacitor present.

## Meta

- **Roadmap ID:** US-036
- **Epic:** Epic 5 — Mobile ship
- **Status:** Not started. After web loop is solid.
- **Done when:** A Capacitor Android project builds and opens GameScene.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-021
- US-027
- US-029

## Out of scope

- iOS ship
- Play feature store listing work beyond build

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `package.json`
- `capacitor.config.ts`
- `android/`
- `src/game/audio/Haptics.ts`

## Implementation

1. `npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/haptics` as needed.
2. `npx cap init` / add android; point `webDir` to Vite build output.
3. Build web → `cap sync`.
4. Confirm save + haptics on device/emulator.
5. Keep web `npm run dev` working.

## Constraints

- Do not rewrite save system.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-036.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Android app launches into the game flow.
- Coins persist between app sessions.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
