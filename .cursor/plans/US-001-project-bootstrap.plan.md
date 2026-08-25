---
name: US-001 — Project bootstrap
overview: Ensure Vite + TypeScript + Phaser 4 boots a portrait 1080×1920 canvas via npm run dev, with GameConfig tunables and no premature systems/ui code.
todos:
  - id: verify-scaffold
    content: Confirm Vite + TS + Phaser 4 scaffold and scripts
    status: completed
  - id: verify-scenes
    content: Confirm Game.ts, BootScene, GameScene wiring
    status: completed
  - id: verify-config
    content: Confirm tunables live in GameConfig (no magic numbers in update)
    status: completed
  - id: verify-scale
    content: Confirm Scale.FIT, centered canvas, 1080×1920
    status: completed
  - id: hygiene-folders
    content: Do not create empty systems/ or ui/ folders until features land
    status: completed
isProject: true
---

# US-001 — Project bootstrap

Ensure Vite + TypeScript + Phaser 4 boots a portrait 1080×1920 canvas via npm run dev, with GameConfig tunables and no premature systems/ui code.

## Meta

- **Roadmap ID:** US-001
- **Epic:** Epic 0 — Prototype slice
- **Status:** Mostly done in repo. Finish only remaining hygiene (do not create empty systems/ui folders ahead of features). Treat this plan as verify + close gaps.
- **Done when:** `npm run dev` opens a portrait 1080 × 1920 Phaser canvas.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- None

## Out of scope

- Joystick
- Scrap
- Capacitor
- Menu/Result scenes

Global MVP exclusions still apply: enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

## Likely files

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `index.html`
- `src/main.ts`
- `src/game/Game.ts`
- `src/game/scenes/BootScene.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/config/GameConfig.ts`

## Context

Magnet Rover is a Phaser 4 + Vite + TypeScript web game. Source of truth: [MVP.md](../../MVP.md), roadmap: [ROADMAP.md](../../ROADMAP.md). Follow `.cursor/rules/`.

## Current state

Scaffold already exists. BootScene starts GameScene. Viewport and map sizes are in `GameConfig`.

## Implementation

1. Open `src/game/Game.ts` and confirm Phaser config uses `GameConfig.viewport` (1080×1920), `Scale.FIT`, and dark background.
2. Confirm `BootScene` → `GameScene` only (no Menu yet).
3. Confirm `GameConfig` holds all tunables; no hardcoded speeds/sizes in update loops.
4. If empty `systems/` or `ui/` folders exist with no real modules, remove them (architecture rule: create folders when features land).
5. Do not add new gameplay features under this story.

## Constraints

- English identifiers and comments only.
- `strict` TypeScript; no `any`.
- No Capacitor, no joystick, no scrap.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-001.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Run `npm run dev` and open the local URL.
- Canvas is portrait 1080×1920 and scales with FIT.
- No console errors on boot.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
