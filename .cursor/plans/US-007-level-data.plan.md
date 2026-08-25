---
name: US-007 — Level data
overview: "Introduce LevelConfig + Levels.ts and spawn the prototype level from data (map size, processor, metallic cubes, optional pickups) without baking layout into GameScene math."
todos:
  - id: level-config-type
    content: "Add LevelConfig type (id, map, energy, processor, scraps, optional powerUps)"
    status: pending
  - id: levels-ts
    content: "Add Levels.ts with prototype level (100 metallic cubes, 1 processor, 0 pickups)"
    status: pending
  - id: spawn-from-config
    content: "Spawn entities from config in GameScene (scene wires, does not own math)"
    status: pending
  - id: cube-visual-only
    content: "Keep cube color and size visual-only (same behavior for every cube)"
    status: pending
isProject: true
---

# US-007 — Level data

Introduce LevelConfig + Levels.ts and spawn the prototype level from data (map size, processor, metallic cubes, optional pickups) without baking layout into GameScene math.

## Meta

- **Roadmap ID:** US-007
- **Epic:** Epic 1 — Core magnet loop
- **Status:** Not started. Unblocks cube/processor spawning stories.
- **Done when:** The first level loads from LevelConfig (map size, processor, scrap/cube list, optional pickups).
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-002

## Out of scope

- Level editor UI
- Procedural generation
- Multiple processors

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/config/LevelConfig.ts`
- `src/game/config/Levels.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`

## Context

MVP §25 `LevelConfig`. Prototype: 2000×3000, 100 metallic cubes, 1 processor, initialEnergy 100, 0 pickups, upgrades off.

```ts
interface LevelConfig {
  id: number;
  mapWidth: number;
  mapHeight: number;
  initialEnergy: number;
  processor: { x: number; y: number };
  scraps: {
    x: number;
    y: number;
    color: string;
    size: 'small' | 'medium' | 'large';
  }[];
  powerUps?: { x: number; y: number; type: 'energy' }[];
}
```

`color` and `size` are visual only — same magnet, queue, and coin behavior for every cube.

## Implementation

1. Add `LevelConfig` type module and `Levels.ts` exporting `prototypeLevel` / `levels` array.
2. Generate 100 cube positions spread across the map with mixed colors/sizes (avoid overlapping the processor spawn; keep navigation obvious — workshop clusters OK, not mazes).
3. `GameScene.create` loads one level (hardcode prototype id for now), sets map size from level (or keep GameConfig defaults matching level 1).
4. Spawn hooks can stub entities until US-008/US-012 exist. Prefer thin entity stubs so the scene stays a wirer.
5. Scene must not contain attraction/dump math.

## Constraints

- One processor per level.
- No regenerative energy.
- Data-driven: changing `Levels.ts` changes the run without editing systems.
- Collectibles are metallic cubes only.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-007.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Prototype level data exists with ~100 metallic cubes and 1 processor.
- GameScene reads LevelConfig rather than hardcoding cube coordinates.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
