# Magnet Rover — MVP roadmap

Source of truth: [MVP.md](MVP.md). This file turns that spec into stories and tasks.

Status key:

- `[x]` done
- `[ ]` not started

Out of scope for MVP (do not pick up): enemies, combat, realistic physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, multiple processor types, level map, look-ahead camera.

---

## Current snapshot

Already in the repo:

- Phaser 4 + TypeScript + Vite
- `BootScene` → `GameScene`
- Map larger than the viewport (2000 × 3000)
- Rover placeholder with WASD / arrow keys
- Camera follow with lerp, clamped to map bounds
- Rover clamped to the map

Still missing: touch joystick, metallic cubes, rear magnet, malleable cargo queue, processor, energy, HUD, win/lose, feel, coins, upgrades, save, extra levels, Capacitor/Android.

---

## Epic 0 — Prototype slice

One playable level that answers: is it fun to drive, pull metallic cubes with the rear magnet, grow a malleable trailing queue, and dump at the processor?

Target config (MVP §28): map 2000 × 3000, 100 metallic cubes, capacity 20, energy 100, 1 processor, 0 energy pickups, upgrades off.

### US-001 — Project bootstrap

As a developer, I can run the game in the browser so we can iterate on feel.

**Done when:** `npm run dev` opens a portrait 1080 × 1920 Phaser canvas.

- [x] Scaffold Vite + TypeScript + Phaser
- [x] Create `Game.ts`, `BootScene`, `GameScene`
- [x] Put tunables in `GameConfig` (no magic numbers in update)
- [x] Use `Scale.FIT` and center the canvas
- [x] Keep `systems/` and `ui/` empty until those features land (folders exist only when needed)

### US-002 — Oversized map

As a player, I see a world larger than the screen so exploration feels real.

**Done when:** the map is bigger than the viewport and has a clear edge.

- [x] Draw a filled map with a light grid
- [x] Draw a visible map border
- [x] Size the first level at 2000 × 3000

### US-003 — Rover on screen

As a player, I can identify the Magnet Rover from a top-down camera.

**Done when:** a small, readable vehicle sits on the map.

- [x] Create `Rover` as a Phaser container with placeholder graphics
- [ ] Draw a visible rear magnet (anchor + radius ring / glow) on the rover
- [x] Spawn the rover at a sensible start position

### US-004 — Arcade movement (desktop)

As a player, I can drive the rover with keyboard input while iterating on desktop.

**Done when:** WASD and arrows move the rover with arcade smoothing, clamped to the map.

- [x] Read WASD and arrow keys
- [x] Normalize diagonal input
- [x] Lerp velocity toward target speed (no realistic steering)
- [x] Rotate the rover toward movement
- [x] Clamp the rover to map bounds

### US-005 — Follow camera

As a player, the camera stays on the rover and never shows outside the map.

**Done when:** the camera follows with a small lerp and respects map bounds.

- [x] `startFollow` with lerp `0.08`
- [x] `setBounds` to the map
- [ ] Do **not** add look-ahead (post-MVP)

---

## Epic 1 — Core magnet loop

### US-006 — Virtual joystick

As a player, I can drive with one thumb on a phone.

**Done when:** a transparent joystick at the bottom-center of the screen moves the rover; keyboard still works on desktop.

- [ ] Add a virtual joystick (bottom center, semi-transparent)
- [ ] Map drag direction to arcade movement (up/down/left/right)
- [ ] Keep the same smoothing as keyboard input
- [ ] Hide or ignore the joystick when there is no pointer
- [ ] Do not block the rest of the screen for camera / HUD

### US-007 — Level data

As a designer, I can define a level without changing gameplay code.

**Done when:** the first level loads from `LevelConfig` (map size, processor, scrap/cube list, optional pickups).

- [ ] Add `LevelConfig` (`id`, `mapWidth`, `mapHeight`, `initialEnergy`, `processor`, `scraps`, optional `powerUps`)
- [ ] Add `Levels.ts` with the prototype level (100 metallic cubes, 1 processor, 0 pickups)
- [ ] Spawn entities from config in `GameScene` (scene wires, does not own math)
- [ ] Keep cube `color` and `size` visual-only (same gameplay for every cube)

### US-008 — Metallic cubes on the map

As a player, I see metallic cubes of different colors and sizes scattered across the level.

**Done when:** ~100 cubes are visible, all counting as 1 object, idle until attracted.

- [ ] Create `Scrap` entity (metallic cube) with `ScrapState` (`Idle`, `Attracted`, `Carried`, `Processing`)
- [ ] Add `color` and `size` (`small` | `medium` | `large`) fields
- [ ] Spawn cubes from `LevelConfig`
- [ ] Use placeholder cube graphics (varied color + size only)
- [ ] Do not add weight, rarity, or different coin values

### US-009 — Rear magnet radius and attraction

As a player, cubes inside the rear magnet radius fly toward the magnet (or the end of the cargo queue).

**Done when:** idle cube within `magnetRadius` of the rear `magnetAnchor` becomes `Attracted` and interpolates toward the magnet / queue tip.

- [ ] Create `MagnetSystem`
- [ ] Place a visible magnet anchor at the back of the rover
- [ ] Draw the magnet radius from that rear anchor
- [ ] If `distance(scrap, magnetAnchor) <= magnetRadius`, set state to `Attracted`
- [ ] Attract with interpolation toward the rear magnet (or the tip of the existing queue)
- [ ] Do **not** use Arcade Physics or any physics plugin
- [ ] Put `magnetRadius` and `attractionSpeed` in `GameConfig`

### US-010 — Malleable trailing cargo queue

As a player, attracted cubes join a soft chain behind the rover and follow its turns.

**Done when:** cube near the magnet / queue tip becomes `Carried` and follows the previous segment with smooth interpolation (snake / train feel).

- [ ] Create `CargoSystem` as an ordered queue (`cargo: Scrap[]`)
- [ ] First carried cube follows the rear magnet anchor
- [ ] Each following cube follows the previous cube
- [ ] Use smooth follow / lerp so the queue bends with rover movement
- [ ] Keep the queue malleable — no fixed `CargoSlot` grid around the rover
- [ ] Cubes of different colors and sizes share the same queue rules

### US-011 — Capacity limit

As a player, I stop picking up cubes when the rover is full, but I can still drive.

**Done when:** `carriedObjects >= capacity` blocks new pickups; cubes stay on the map; movement is not blocked.

- [ ] Default `capacity = 20`
- [ ] Ignore new attractions while full (or drop them back to `Idle`)
- [ ] Show a short full-cargo cue (flash / “FULL” / processor hint)
- [ ] Do not freeze movement when full

---

## Epic 2 — Game loop

### US-012 — Processor

As a player, I can find one processor that is visually distinct from the rest of the map.

**Done when:** the level has a single processor with a dump area.

- [ ] Create `Processor` with `processingArea`
- [ ] Spawn from `LevelConfig.processor`
- [ ] Make it clearly different from cubes and the rover (placeholder is fine)

### US-013 — Dump cargo

As a player, driving a loaded rover into the processor unloads cubes one by one from the queue.

**Done when:** carried cubes go `Processing`, tween into the machine at 20–60 ms each (from the queue tip preferred), then leave the world.

- [ ] Detect rover overlap with the processor area
- [ ] Only dump while `carriedObjects > 0`
- [ ] Unload sequentially from the cargo queue (not all at once)
- [ ] Tween scale / rotation toward the processor
- [ ] Remove cube permanently after processing
- [ ] Update remaining / carried counts as each item finishes

### US-014 — Energy drain

As a player, energy only drops while I am moving, so standing still is free.

**Done when:** energy starts at 100% and drains only when the rover is moving.

- [ ] Create `EnergySystem`
- [ ] `energy -= movementEnergyCost * delta` while moving
- [ ] Do not drain on collect, dump, or idle
- [ ] Do not regenerate energy
- [ ] Put `initialEnergy` and `movementEnergyCost` in config / level data

### US-015 — In-run HUD

As a player, I can see energy, cleanup progress, and cargo at a glance without relying only on the HUD.

**Done when:** a minimal HUD shows energy bar, cleanup bar, and optional `12 / 20` cargo.

- [ ] Create `EnergyBar` (top)
- [ ] Create `CleanBar` (cleanup %)
- [ ] Create `CargoIndicator` (`carried / capacity`)
- [ ] Prefer cleanup % over a remaining-count label
- [ ] Keep HUD readable on a phone; the trailing cube queue remains the main fullness cue

### US-016 — Cleanup progress

As a player, I can tell how much of the map I have cleared.

**Done when:** `cleanPercentage = ((totalObjects - remainingObjects) / totalObjects) * 100`.

- [ ] Create `ProgressSystem`
- [ ] Track `totalObjects`, `remainingObjects`, `carriedObjects`
- [ ] `remainingObjects` excludes cubes that have been processed
- [ ] Drive the cleanup bar from this value

### US-017 — Win

As a player, I win only after every cube is gone from the map **and** my cargo queue is empty.

**Done when:** `remainingObjects == 0 AND carriedObjects == 0` ends the level as a win.

- [ ] Detect the win condition in `ProgressSystem` (or a thin game-state helper)
- [ ] Stop energy drain and input after win
- [ ] Hand off to a result flow (even a stub is enough for this story)

### US-018 — Lose

As a player, I lose if energy hits 0 before the level is complete.

**Done when:** `energy <= 0` and the level is not won → defeat.

- [ ] Detect lose in `EnergySystem` / game state
- [ ] Stop movement when energy is 0
- [ ] Hand off to retry

### US-019 — Retry

As a player, I can restart the current level after a loss without reloading the page.

**Done when:** Retry rebuilds the same `LevelConfig` from scratch.

- [ ] Add a retry action on defeat
- [ ] Reset rover, cubes, energy, cargo queue, and HUD
- [ ] Do not keep processed cubes or spent energy

### US-020 — Result screen

As a player, I see a short win or lose screen before the next step.

**Done when:** `ResultScene` shows victory (reward + continue) or defeat (retry).

- [ ] Create `ResultScene`
- [ ] Victory: summary + path to upgrades (or next level while upgrades are off)
- [ ] Defeat: retry
- [ ] Keep copy in English

### US-021 — Main menu

As a player, I can start a run from a menu instead of dropping straight into the map.

**Done when:** `MenuScene` → play starts the current level.

- [ ] Create `MenuScene`
- [ ] Play starts `GameScene` with the current level
- [ ] Wire Boot → Menu → Game in `Game.ts`

---

## Epic 3 — Game feel

Do not treat this as polish-only. Feel is the product.

### US-022 — Attract feedback

As a player, cubes feel magnetic when they enter the rear magnet radius.

- [ ] Small cube rotation while attracted
- [ ] Speed up toward the rear magnet / queue tip
- [ ] Optional glow
- [ ] Short metallic SFX

### US-023 — Queue-join feedback

As a player, I feel the click when a cube joins the trailing queue.

- [ ] Small bounce on attach
- [ ] Soft settle into the end of the queue
- [ ] Click SFX
- [ ] Light vibration (no-op on desktop)

### US-024 — Dump feedback

As a player, unloading feels fast and juicy.

- [ ] Suction tween into the processor
- [ ] Staggered SFX
- [ ] Particles
- [ ] Coin pop / rising numbers (once coins exist)
- [ ] Light screen shake
- [ ] Light vibration

### US-025 — Full-cargo feedback

As a player, I know I am full without reading UI.

- [ ] Short visual pulse on the rover / queue
- [ ] Short SFX
- [ ] Optional “FULL” toast
- [ ] Hint toward the processor (pulse / marker)

### US-026 — Region-clear feedback

As a player, clearing a cluster feels like progress.

- [ ] Dust / sparkle when a local cluster is gone (simple radius or region tag is enough)
- [ ] Optional “Clean!” text
- [ ] Positive SFX

### US-027 — Audio and haptics plumbing

As a developer, I can play SFX and vibration from gameplay events.

- [ ] Add an audio folder and load clips in `BootScene`
- [ ] Centralize play-one-shot helpers (do not scatter `sound.play` in entities)
- [ ] Vibration helper that no-ops when Capacitor is absent
- [ ] Mute / ignore audio failures so a missing file never breaks a run

---

## Epic 4 — Progression

Prototype first. Turn this epic on after the core loop feels good.

### US-028 — Coins

As a player, I earn 1 coin per processed cube, and coins persist between runs.

**Done when:** `playerCoins += processedObjects` and the total survives a refresh.

- [ ] Award 1 coin per processed cube
- [ ] Show a coin total on result / upgrade screens
- [ ] No multipliers in MVP

### US-029 — Local save

As a player, my coins, current level, and upgrades survive closing the tab.

**Done when:** `localStorage` holds `{ coins, currentLevel, upgrades }`.

- [ ] Save/load helper around `localStorage`
- [ ] Persist `capacity`, `magnetRadius`, `speed` upgrade levels
- [ ] Default save if missing or corrupt
- [ ] Keep this shape when Capacitor lands (no rewrite required)

### US-030 — Three upgrades

As a player, I can spend coins on capacity, magnet radius, and speed.

**Done when:** each upgrade has a few paid tiers and applies on the next run.

| Upgrade        | Example tiers              |
| -------------- | -------------------------- |
| Capacity       | 20 → 25 → 30 → 40          |
| Magnet radius  | 100 → 120 → 145 → 175 px   |
| Speed          | 200 → 215 → 230 → 250      |
| Cost           | 100 → 250 → 500 coins      |

- [ ] Put upgrade tables in `GameConfig`
- [ ] Apply purchased levels to the rover at run start
- [ ] Allow a longer cargo queue when capacity increases
- [ ] Refuse purchases the player cannot afford
- [ ] Disable upgrades entirely until the prototype loop is fun (MVP §28)

### US-031 — Upgrade screen

As a player, after a win I can buy upgrades before the next level.

**Done when:** `UpgradeScene` sits between result and the next level.

- [ ] Create `UpgradeScene`
- [ ] Show current coins and the three upgrade buttons
- [ ] Continue / next-level button
- [ ] Screen flow: Boot → Menu → Game → Result → Upgrades → next Game

### US-032 — Linear level list

As a player, winning moves me to the next numbered level.

**Done when:** levels are `1, 2, 3, …` with no world map.

- [ ] Store `currentLevel` in save data
- [ ] Advance on victory
- [ ] Replay last level if there is no next one (or show a simple “more later”)

### US-033 — Extra levels

As a player, later levels change layout, cube count, and optional energy pickups.

**Done when:** at least 2–3 `LevelConfig` entries exist, still one processor each.

- [ ] Author 2–3 maps larger than the viewport
- [ ] Vary cube placement (workshop / junkyard style regions, not mazes)
- [ ] Keep navigation obvious

### US-034 — Energy pickup

As a player, some levels have batteries that restore energy.

**Done when:** one pickup type exists: `energy = min(maxEnergy, energy + energyBonus)`.

- [ ] Create `EnergyPickup`
- [ ] Spawn from optional `LevelConfig.powerUps` (`type: 'energy'`)
- [ ] Bonus options: +10% / +20% / +25% — ship one value
- [ ] Remove the pickup after collect
- [ ] Do not add other pickup types

### US-035 — Cube variety (visual)

As a player, cubes look mixed even though every piece is worth 1.

- [ ] Several colors and sizes of metallic cube placeholders
- [ ] `color` and `size` in level data only select visuals
- [ ] Same magnet, queue, and coin rules for all cubes

---

## Epic 5 — Mobile ship

### US-036 — Capacitor shell

As a player, I can run the game as an Android app.

**Done when:** a Capacitor Android project builds and opens `GameScene`.

- [ ] Add Capacitor
- [ ] Create the Android project
- [ ] Confirm `localStorage` still works
- [ ] Wire vibration through Capacitor when present

### US-037 — Phone layout and performance

As a player, the game stays readable and smooth on a modest Android phone.

**Done when:** one complete level runs without blocker bugs or heavy frame drops.

- [ ] Test portrait FIT on a few resolutions
- [ ] Keep `update` cheap (no physics, modest cube count)
- [ ] Confirm one-hand joystick reach
- [ ] Confirm HUD does not cover the joystick
- [ ] Generate APK
- [ ] Generate AAB

### US-038 — First-run tutorial

As a player, I understand move → rear magnet → trailing queue → dump → clean before the first real level.

**Done when:** a short, skippable cue covers movement, rear magnet, full cargo queue, and the processor.

- [ ] First-run only (gate on save data)
- [ ] Do not add a quest system
- [ ] Keep it to a few sentences or finger hints

---

## Suggested build order

Work top to bottom. Do not start Epic 4 until Epic 1–2 feel good. Epic 3 can overlap Epic 2.

| Order | Stories                         | Goal                                      |
| ----- | ------------------------------- | ----------------------------------------- |
| 1     | US-006 → US-011                 | Touch + rear magnet + malleable cube queue |
| 2     | US-012 → US-021                 | Dump, energy, HUD, win / lose / retry     |
| 3     | US-022 → US-027                 | Juice until the prototype question is yes |
| 4     | US-028 → US-035                 | Coins, save, upgrades, extra levels       |
| 5     | US-036 → US-038                 | Android + tutorial                        |

Tune before adding systems: rover speed, magnet radius, attraction feel, cube count, cube layout, queue malleability, dump effect, map size.

---

## MVP done

The MVP is done when all of these are true:

- [ ] One-hand driving feels comfortable
- [ ] Map is larger than the screen
- [ ] Camera follows the rover
- [ ] Cubes are attracted inside the rear magnet radius
- [ ] Cubes form a malleable queue behind the rover
- [ ] Cargo has a max capacity
- [ ] Processor dumps the cargo queue
- [ ] Processed cubes are gone for good
- [ ] Energy drains only while moving
- [ ] Energy 0 is a loss
- [ ] Clear + dump everything is a win
- [ ] Coins are awarded
- [ ] Three basic upgrades work
- [ ] Progress is saved
- [ ] The game runs smoothly on Android
- [ ] One full level can be played start to finish with no blocker bugs
