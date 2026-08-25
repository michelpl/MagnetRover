---
name: US-015 — In-run HUD
overview: "Minimal phone-readable HUD: EnergyBar, CleanBar, optional cargo 12/20; cargo visuals on rover remain the primary fullness cue."
todos:
  - id: energy-bar
    content: "Create EnergyBar (top)"
    status: pending
  - id: clean-bar
    content: "Create CleanBar (cleanup %)"
    status: pending
  - id: cargo-indicator
    content: "Create CargoIndicator (carried / capacity)"
    status: pending
  - id: prefer-percent
    content: "Prefer cleanup % over a remaining-count label"
    status: pending
  - id: phone-readable
    content: "Keep HUD readable on phone; do not cover joystick"
    status: pending
isProject: true
---

# US-015 — In-run HUD

Minimal phone-readable HUD: EnergyBar, CleanBar, optional cargo 12/20; cargo visuals on rover remain the primary fullness cue.

## Meta

- **Roadmap ID:** US-015
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** A minimal HUD shows energy bar, cleanup bar, and optional carried/capacity cargo.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-011
- US-014
- US-016

## Out of scope

- Quest trackers
- Minimap
- Dense RPG HUD

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/ui/EnergyBar.ts`
- `src/game/ui/CleanBar.ts`
- `src/game/ui/CargoIndicator.ts`
- `src/game/scenes/GameScene.ts`

## Implementation

1. Create `ui/` widgets with scrollFactor 0, fixed to camera.
2. Top energy bar; cleanup % bar; cargo text optional.
3. Layout must leave bottom-center free for joystick (US-006).
4. Bind to EnergySystem + ProgressSystem values each frame or on change.
5. English labels only if any (“FULL” etc.).

## Constraints

- Minimal hyper-casual HUD — not a dashboard.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-015.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Bars update live; cargo numbers match carried/capacity.
- Joystick still reachable; HUD readable in portrait.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
