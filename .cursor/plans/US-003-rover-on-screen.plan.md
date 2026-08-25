---
name: US-003 — Rover on screen
overview: "Keep a small top-down Magnet Rover placeholder on the map and add a visible magnet ring/glow at the rear so the magnet is readable."
todos:
  - id: rover-container
    content: "Rover as Phaser container with placeholder graphics"
    status: completed
  - id: magnet-ring
    content: "Draw a visible magnet ring / glow on the rover (rear)"
    status: pending
  - id: spawn-position
    content: "Spawn rover at a sensible start position"
    status: completed
isProject: true
---

# US-003 — Rover on screen

Keep a small top-down Magnet Rover placeholder on the map and add a visible magnet ring/glow at the rear so the magnet is readable.

## Meta

- **Roadmap ID:** US-003
- **Epic:** Epic 0 — Prototype slice
- **Status:** Rover container + body exist. Remaining: visible magnet ring / glow.
- **Done when:** A small, readable vehicle sits on the map with a visible magnet cue.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-002

## Out of scope

- Attraction logic
- Cargo trail
- Final art sprites

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/entities/Rover.ts`
- `src/game/config/GameConfig.ts`

## Context

MVP: small top-down vehicle with a clearly visible magnet at the rear. Attraction math is later (US-009); this story is visual identity only.

## Implementation

1. In `Rover.drawBody` (or a dedicated draw method), add a rear magnet marker:
   - Circle or soft glow behind the body (local space, negative Y if front is up).
   - Put colors/sizes in `GameConfig` (e.g. `colors.magnetGlow`, `rover.magnetOffsetY`).
2. Keep the body readable at camera zoom/default follow.
3. Do not implement radius gameplay circle yet if that belongs with MagnetSystem (US-009); a small rear glow/ring is enough here. If you draw the full `magnetRadius` preview, gate it so US-009 can own the gameplay radius.

## Constraints

- Generated Graphics/Container only; no art pipeline.
- No Arcade Physics.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-003.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Rover is identifiable top-down.
- Magnet cue is visible at the rear while rotating.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
