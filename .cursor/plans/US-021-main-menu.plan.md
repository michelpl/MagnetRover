---
name: US-021 — Main menu
overview: "Create MenuScene; Boot → Menu → Game. Play starts GameScene with the current level."
todos:
  - id: menu-scene
    content: "Create MenuScene"
    status: pending
  - id: play-starts-game
    content: "Play starts GameScene with the current level"
    status: pending
  - id: wire-boot-menu-game
    content: "Wire Boot → Menu → Game in Game.ts"
    status: pending
isProject: true
---

# US-021 — Main menu

Create MenuScene; Boot → Menu → Game. Play starts GameScene with the current level.

## Meta

- **Roadmap ID:** US-021
- **Epic:** Epic 2 — Game loop
- **Status:** Not started.
- **Done when:** MenuScene → play starts the current level.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-001

## Out of scope

- Settings labyrinth
- Cloud login
- Level select map

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `src/game/scenes/MenuScene.ts`
- `src/game/scenes/BootScene.ts`
- `src/game/Game.ts`

## Implementation

1. Minimal menu: title “Magnet Rover”, Play button.
2. BootScene loads assets (if any) then starts MenuScene.
3. Play reads `currentLevel` from save if present (US-029), else level 1.
4. English copy.

## Constraints

- No world map; linear levels later (US-032).

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-021.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Cold boot lands on menu; Play enters the level.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
