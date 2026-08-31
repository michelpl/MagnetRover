---
name: US-141 — InventoryScene
overview: "New scene lists owned weapons, 4 slots, confirms to save."
todos:
  - id: inventory-scene-ui
    content: Create InventoryScene + InventoryUI
    status: pending
  - id: register-game-ts
    content: Register in Game.ts
    status: pending
  - id: hub-bar-tabs
    content: "HubBar tab: Stages | Inventory | Garage"
    status: pending
  - id: remove-shop-scene
    content: Remove ShopScene from design and code
    status: pending
isProject: true
---

# US-141 — InventoryScene

Let the player equip up to four weapons before a run.

## Meta

- **Roadmap ID:** US-141
- **Epic:** E4 — Meta (inventory + garage)
- **Status:** Not started.
- **Done when:** New scene lists owned weapons, 4 slots, confirms to save.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-140

## Out of scope

- Weapon unlock on win (US-142)
- Garage upgrade purchases (US-143)
- In-run weapon swapping
- Shop tab / crystals economy

Global MVP exclusions: ShopScene, magnet upgrade UI.

## Likely files

- `src/game/scenes/InventoryScene.ts` (new)
- `src/game/ui/InventoryUI.ts` (new)
- `src/game/Game.ts`
- `src/game/ui/HubBar.ts`
- `src/game/scenes/ShopScene.ts` (delete)
- `src/game/save/Save.ts`

## Context

Hub navigation: Stages (center/menu), Inventory, Garage. Inventory shows owned weapons list and four loadout slots; tap to assign/clear. Confirm writes `loadout` to save. Remove dead `ShopScene` and references. Reuse HubBar hex tab pattern from Garage/Menu.

## Implementation

1. Create `InventoryUI`: owned list, four slot cards, equip/remove interactions.
2. Create `InventoryScene`: layout + `HubBar` + bind to `Save` loadout.
3. Register `InventoryScene` in `Game.ts` scene list.
4. Update `HubBar` tabs: inventory icon opens `InventoryScene`.
5. Delete `ShopScene.ts` and remove from any imports/registrations/docs references in code.
6. Locked weapons (future US-142) shown dimmed — stub OK with owned-only list.

## Constraints

- Max 4 equipped weapons enforced in UI and save write.
- Scene is wiring; UI widgets own layout.
- English copy.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-141.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Hub opens Inventory tab.
- Player can assign owned weapons to slots and save persists.
- Next run uses updated loadout.
- ShopScene removed; no broken routes.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
