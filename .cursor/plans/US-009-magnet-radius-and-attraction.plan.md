---
name: US-009 — Rear magnet radius and attraction
overview: "Add MagnetSystem: idle cube within magnetRadius of the rear magnetAnchor becomes Attracted and interpolates toward the magnet / queue tip — no physics plugin."
todos:
  - id: magnet-system
    content: "Create MagnetSystem"
    status: pending
  - id: rear-anchor
    content: "Place a visible magnet anchor at the back of the rover"
    status: pending
  - id: visible-radius
    content: "Draw the magnet radius from the rear magnetAnchor"
    status: pending
  - id: attract-rule
    content: "If distance(scrap, magnetAnchor) <= magnetRadius, set Attracted"
    status: pending
  - id: interpolate
    content: "Attract with interpolation toward rear magnet / queue tip"
    status: pending
  - id: no-physics
    content: "Do not use Arcade Physics or any physics plugin"
    status: pending
  - id: config-tunables
    content: "Put magnetRadius and attractionSpeed in GameConfig"
    status: pending
isProject: true
---

# US-009 — Rear magnet radius and attraction

Add MagnetSystem: idle cube within magnetRadius of the rear magnetAnchor becomes Attracted and interpolates toward the magnet / queue tip — no physics plugin.

## Meta

- **Roadmap ID:** US-009
- **Epic:** Epic 1 — Core magnet loop
- **Status:** Not started. Core fantasy of the game.
- **Done when:** Idle cube within magnetRadius of the rear magnetAnchor becomes Attracted and interpolates toward the magnet / queue tip.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-003
- US-008

## Out of scope

- Arcade Physics
- Different pull strengths by cube size/color
- Enemies

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/MagnetSystem.ts`
- `src/game/entities/Rover.ts`
- `src/game/entities/Scrap.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`

## Context

MVP §7: magnet sits at the rover rear. Distance check against `magnetAnchor`. Interpolation:

`scrap.x += (targetX - scrap.x) * attractionSpeed` (same for y).

Target = rear magnet, or tip of cargo queue once cargo exists (US-010). Until cargo exists, target the magnet anchor.

## Implementation

1. Create `systems/` and `MagnetSystem.ts`.
2. Each frame (from GameScene.update): for Idle cubes in range → Attracted; move Attracted toward target.
3. Add `magnetRadius` and `attractionSpeed` to `GameConfig`.
4. Draw visible radius (graphics circle, low alpha) centered on rear magnetAnchor; scroll with rover.
5. Rover should expose `getMagnetWorldPosition(): { x, y }`.
6. Respect capacity later (US-011): for now attract freely or leave a hook `canAttract(): boolean`.

## Constraints

- Interpolation only — never physics forces.
- Scene wires system; system owns math.
- Magnet is rear-only, not centered on the hull.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-009.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Driving near cubes pulls them toward the rear magnet.
- Radius is visible from the rear anchor; tunables change feel from GameConfig.
- No physics plugin in package or scene config.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
