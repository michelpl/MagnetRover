---
name: US-029 — Local save
overview: "localStorage save/load for { coins, currentLevel, upgrades }; defaults on missing/corrupt; shape ready for Capacitor."
todos:
  - id: save-helper
    content: "Save/load helper around localStorage"
    status: pending
  - id: persist-upgrades
    content: "Persist capacity, magnetRadius, speed upgrade levels"
    status: pending
  - id: defaults
    content: "Default save if missing or corrupt"
    status: pending
  - id: capacitor-ready
    content: "Keep this shape when Capacitor lands"
    status: pending
isProject: true
---

# US-029 — Local save

localStorage save/load for { coins, currentLevel, upgrades }; defaults on missing/corrupt; shape ready for Capacitor.

## Meta

- **Roadmap ID:** US-029
- **Epic:** Epic 4 — Progression
- **Status:** Not started. Foundation for coins/upgrades/levels.
- **Done when:** localStorage holds { coins, currentLevel, upgrades }.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-001

## Out of scope

- Cloud sync
- Account login

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/save/Save.ts`

## Schema (MVP §26)

```ts
{
  coins: number,
  currentLevel: number,
  upgrades: { capacity: number, magnetRadius: number, speed: number }
}
```

## Implementation

1. `load(): SaveData` parses JSON; validate with type guards (`unknown` → SaveData); fallback defaults.
2. `save(data)` writes atomically (stringify once).
3. Version key optional (`magnetRoverSaveV1`).
4. No empty catch — log and reset.

## Constraints

- Strict TS; no `any`.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-029.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Corrupt JSON resets to defaults without crashing.
- Values survive reload.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
