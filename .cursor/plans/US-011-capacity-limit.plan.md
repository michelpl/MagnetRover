---
name: US-011 — Capacity limit
overview: "Enforce default capacity 20: when full, block new attractions; movement continues; show a short full-cargo cue."
todos:
  - id: default-capacity
    content: "Default capacity = 20 in GameConfig"
    status: pending
  - id: block-attract
    content: "Ignore new attractions while full (or drop back to Idle)"
    status: pending
  - id: full-cue
    content: "Short full-cargo cue (flash / FULL / processor hint)"
    status: pending
  - id: no-freeze
    content: "Do not freeze movement when full"
    status: pending
isProject: true
---

# US-011 — Capacity limit

Enforce default capacity 20: when full, block new attractions; movement continues; show a short full-cargo cue.

## Meta

- **Roadmap ID:** US-011
- **Epic:** Epic 1 — Core magnet loop
- **Status:** Not started. Completes the magnet collect loop before processor.
- **Done when:** carriedObjects >= capacity blocks new pickups; scraps stay on the map; movement is not blocked.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-010

## Out of scope

- Freezing controls
- Auto-dump
- Upgrade tiers (US-030)

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/systems/CargoSystem.ts`
- `src/game/systems/MagnetSystem.ts`
- `src/game/config/GameConfig.ts`
- `src/game/scenes/GameScene.ts`

## Implementation

1. `GameConfig.rover.capacity = 20` (overridable later by upgrades).
2. `CargoSystem.isFull` / `canAccept` used by MagnetSystem before Idle→Attracted and before attach.
3. If already Attracted when becoming full, revert extras to Idle.
4. Minimal feedback now (flash rover / brief “FULL” text). Richer juice is US-025.
5. Movement path untouched.

## Constraints

- Capacity is a collect limit, not a movement brake.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-011.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- At 20 carried, no more scraps join; leftovers stay Idle on map.
- Rover still drives; a clear full cue appears.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
