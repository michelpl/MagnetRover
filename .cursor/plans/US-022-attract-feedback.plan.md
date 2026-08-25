---
name: US-022 — Attract feedback
overview: "Juice Attracted cubes: spin, speed-up toward rear magnet / queue tip, optional glow, short metallic SFX."
todos:
  - id: spin-attracted
    content: "Small cube rotation while attracted"
    status: pending
  - id: speed-up
    content: "Speed up toward the rear magnet / queue tip"
    status: pending
  - id: optional-glow
    content: "Optional glow"
    status: pending
  - id: metallic-sfx
    content: "Short metallic SFX on enter radius"
    status: pending
isProject: true
---

# US-022 — Attract feedback

Juice Attracted cubes: spin, speed-up toward rear magnet / queue tip, optional glow, short metallic SFX.

## Meta

- **Roadmap ID:** US-022
- **Epic:** Epic 3 — Game feel
- **Status:** Not started. Feel is product, not polish-only.
- **Done when:** Cubes feel magnetic when they enter the rear magnet radius.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-009
- US-027

## Out of scope

- Physics-based tumbling
- Per-material simulation

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/MagnetSystem.ts`
- `src/game/entities/Scrap.ts`

## Implementation

1. On Idle→Attracted: play one-shot SFX via audio helper (US-027).
2. While Attracted: add angular velocity / rotate; optionally ramp attractionSpeed toward rear magnet / queue tip.
3. Soft glow tint or additive circle.
4. Keep update cheap for Android.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-022.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Entering radius is audible/visible; pull feels snappier than raw lerp alone.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
