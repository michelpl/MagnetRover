---
name: US-024 — Dump feedback
overview: "Make dumping juicy: suction tween, staggered SFX, particles, optional coin pops, light shake + vibration."
todos:
  - id: suction-tween
    content: "Suction tween into the processor"
    status: pending
  - id: staggered-sfx
    content: "Staggered SFX"
    status: pending
  - id: particles
    content: "Particles"
    status: pending
  - id: coin-pop
    content: "Coin pop / rising numbers (once coins exist)"
    status: pending
  - id: shake-vibrate
    content: "Light screen shake + vibration"
    status: pending
isProject: true
---

# US-024 — Dump feedback

Make dumping juicy: suction tween, staggered SFX, particles, optional coin pops, light shake + vibration.

## Meta

- **Roadmap ID:** US-024
- **Epic:** Epic 3 — Game feel
- **Status:** Not started. Coin pop after US-028 exists.
- **Done when:** Unloading feels fast and juicy.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-013
- US-027

## Out of scope

- Slow cinematic dump
- Reward calendars

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/CargoSystem.ts`
- `src/game/entities/Processor.ts`

## Implementation

1. Enhance dump tweens; emit particles at processor.
2. Stagger SFX per item.
3. Camera shake small intensity; vibrate helper.
4. If coins system present, floating “+1”; else skip gracefully.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-024.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Dumping a full cargo feels rapid and satisfying without hitching.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
