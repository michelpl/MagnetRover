---
name: US-006 — Virtual joystick
overview: "Add a semi-transparent virtual joystick at bottom-center for one-thumb mobile driving, sharing the same arcade smoothing as keyboard."
todos:
  - id: joystick-ui
    content: "Add virtual joystick (bottom center, semi-transparent)"
    status: pending
  - id: map-drag
    content: "Map drag direction to arcade movement (up/down/left/right)"
    status: pending
  - id: same-smoothing
    content: "Keep the same smoothing as keyboard input"
    status: pending
  - id: hide-idle
    content: "Hide or ignore the joystick when there is no pointer"
    status: pending
  - id: no-block-hud
    content: "Do not block the rest of the screen for camera / HUD"
    status: pending
isProject: true
---

# US-006 — Virtual joystick

Add a semi-transparent virtual joystick at bottom-center for one-thumb mobile driving, sharing the same arcade smoothing as keyboard.

## Meta

- **Roadmap ID:** US-006
- **Epic:** Epic 1 — Core magnet loop
- **Status:** Not started. First story in suggested build order.
- **Done when:** A transparent joystick at the bottom-center moves the rover; keyboard still works on desktop.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-004
- US-005

## Out of scope

- Blocking full-screen touch overlays
- Separate “run” button
- Gyro controls

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/ui/VirtualJoystick.ts`
- `src/game/entities/Rover.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`

## Context

MVP control: transparent virtual joystick, bottom-center. Finger drag maps to world axes. Arcade smoothing already exists for keyboard — reuse it.

## Implementation

1. Create `src/game/ui/VirtualJoystick.ts` (create `ui/` now that the feature lands).
   - Base + thumb circles, fixed screen position (use camera scroll factor 0 / fixed UI).
   - Bottom center; opacity from `GameConfig`.
   - Pointer down within base radius activates; drag updates vector; pointer up resets.
2. Expose `getAxis(): { x: number; y: number }` normalized to length ≤ 1.
3. Refactor `Rover` input:
   - Prefer extracting `readMoveInput(): { x, y }` that sums keyboard + joystick and normalizes once.
   - Do not duplicate damp/rotate logic.
4. Joystick must not capture the entire screen — only its interactive zone. Camera follow and future HUD remain usable.
5. Optional: hide thumb/base when inactive; keep a faint base visible if readability needs it.

## Constraints

- Same `inputSmoothing` / speed as keyboard.
- English only; no Portuguese copy.
- No physics plugin.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-006.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Touch/drag moves rover; release stops with same smoothing.
- Keyboard still works with joystick present.
- Joystick sits bottom-center and does not cover the whole screen.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
