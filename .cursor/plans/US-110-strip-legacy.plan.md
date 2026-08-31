---
name: US-110 — Strip legacy gameplay
overview: "GameScene does not wire Magnet/Cargo/Dump/Energy/Progress systems; Scrap/Processor/EnergyPickup are not spawned."
todos:
  - id: remove-legacy-wiring
    content: Remove legacy system wiring from GameScene
    status: pending
  - id: delete-legacy-files
    content: Delete or archive unused legacy files (after replacement exists)
    status: pending
  - id: clean-boot-preload
    content: Remove scrap/processor assets from boot preload if unused
    status: pending
isProject: true
---

# US-110 — Strip legacy gameplay

Remove magnet, cargo, processor, and energy from the active gameplay loop so survival systems can replace them.

## Meta

- **Roadmap ID:** US-110
- **Epic:** E1 — Core combat
- **Status:** Not started. Entry point for the survival pivot.
- **Done when:** `GameScene` does not wire Magnet/Cargo/Dump/Energy/Progress systems; Scrap/Processor/EnergyPickup not spawned.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English). If AGENTS.md still mentions magnet/scrap, follow MVP + ROADMAP instead.

## Prerequisites

- None (entry point)

## Out of scope

- Adding HP, enemies, weapons, or waves (US-111+)
- Deleting legacy files before survival replacements compile (defer file deletion if needed)
- Rewriting `LevelConfig` / stage data (US-130)
- Inventory, garage, or save migration (E4)

Global MVP exclusions: pathfinding, Arcade Physics, regenerative HP, multiple enemy types, multiplayer, skill trees, crafting, quests.

## Likely files

- `src/game/scenes/GameScene.ts`
- `src/game/scenes/BootScene.ts`
- `src/game/systems/MagnetSystem.ts` (remove wiring; delete when safe)
- `src/game/systems/CargoSystem.ts`
- `src/game/systems/DumpSystem.ts`
- `src/game/systems/EnergySystem.ts`
- `src/game/systems/ProgressSystem.ts`
- `src/game/systems/RegionClearSystem.ts`
- `src/game/entities/Scrap.ts`
- `src/game/entities/Processor.ts`
- `src/game/entities/EnergyPickup.ts`
- `src/game/ui/EnergyBar.ts`
- `src/game/ui/CleanBar.ts`
- `src/game/ui/CargoIndicator.ts`

## Context

The codebase still runs the legacy magnet collection loop. Survival combat requires a clean `GameScene` that wires only rover movement, camera, joystick, and (later) HP/combat/waves. Remove legacy imports, field declarations, `create()` spawn logic, and `update()` calls first; delete orphaned files once US-111+ provides replacements or stubs keep the build green.

## Implementation

1. In `GameScene.ts`, remove imports and fields for `MagnetSystem`, `CargoSystem`, `DumpSystem`, `EnergySystem`, `ProgressSystem`, `RegionClearSystem`.
2. Remove spawn logic for `Scrap`, `Processor`, `EnergyPickup` from level config.
3. Remove legacy HUD wiring: `EnergyBar`, `CleanBar`, `CargoIndicator` (US-111 adds `HpBar` later).
4. Remove win/lose checks tied to `ProgressSystem.isComplete` and `EnergySystem.isEmpty`.
5. Keep `Rover`, `VirtualJoystick`, `GameCameras`, map clamp, and pause flow intact.
6. Delete legacy system/entity/UI files only when nothing imports them and `npm run build` passes.
7. In `BootScene.ts`, drop preload entries for scrap/processor/energy assets no longer referenced.

## Constraints

- Scene wires systems; do not leave gameplay math in `GameScene`.
- Prefer minimal stubs over a broken build between stories.
- Do not reintroduce magnet/cargo/processor/energy behavior.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-110.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- `GameScene` has no references to Magnet/Cargo/Dump/Energy/Progress/RegionClear systems.
- No Scrap, Processor, or EnergyPickup spawn at run start.
- Game still loads: rover moves with joystick; camera follows.
- `npm run build` succeeds.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
