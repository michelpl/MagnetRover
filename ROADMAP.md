# Magnet Rover — Survival roadmap

Source of truth: [MVP.md](MVP.md). This file turns that spec into stories and tasks.

Status key:

- `[x]` done
- `[ ]` not started
- `[~]` superseded (old magnet/collection design — do not implement)

---

## Design pivot

The game loop changed from **magnet collection** (scrap → cargo queue → processor → energy) to **survival combat** (HP → enemy waves → auto-fire weapons → loadout).

All stories below **US-100+** target the new design. Stories **US-001–US-038** are superseded unless noted as reusable infrastructure.

---

## Current snapshot

### Reuse (keep or adapt)

- Phaser 4 + TypeScript + Vite + Capacitor shell
- `BootScene`, `MenuScene`, `GarageScene`, `GameScene`, `ResultScene`
- `Rover` movement, `VirtualJoystick`, `GameCameras`, map clamp
- Workshop map (`scenario1`), obstacle support
- `HubBar`, `StageCarousel`, `WalletBar`, pause/settings
- `Save` / `Upgrades` shape (extend for weapons + loadout)
- `RunState`, `Audio`, `Haptics`, Android build scripts

### Legacy (remove or replace)

- **Entities:** `Scrap`, `Processor`, `EnergyPickup`
- **Systems:** `MagnetSystem`, `CargoSystem`, `DumpSystem`, `EnergySystem`, `ProgressSystem`, `RegionClearSystem`
- **UI:** `EnergyBar`, `CleanBar`, `CargoIndicator` (replace with `HpBar`, `WaveIndicator`)
- **Levels:** scrap recipes, energy balance solver, processor placement
- **Upgrades:** capacity, battery, magnet radius lines
- **Scenes:** `ShopScene` (remove — Inventory + Garage cover meta)
- **Tutorial:** magnet/cargo/processor copy

---

## Epic E0 — Documentation pivot

Align all docs with the survival loop before code changes.

### US-100 — MVP rewrite

As a developer, I have a single spec for the survival loop.

**Done when:** [MVP.md](MVP.md) describes HP, waves, weapons, inventory, stages, save, and open decisions.

- [x] Rewrite MVP.md for survival combat
- [x] Document deprecated legacy systems
- [x] Add open decisions table (§33)

### US-101 — Agent and Cursor rules

As an agent, I follow rules that match the new game loop.

**Done when:** [AGENTS.md](AGENTS.md) and `.cursor/rules/*.mdc` forbid magnet/scrap/energy and allow combat/inventory.

- [x] Update AGENTS.md
- [x] Update project-premises, architecture, phaser, english-language rules

### US-102 — Roadmap rewrite

As a developer, I have a backlog for survival features, not scrap collection.

**Done when:** this file lists E0–E6 with new stories; old US marked superseded.

- [x] Rewrite ROADMAP.md (this file)

---

## Epic E1 — Core combat

Remove legacy loop pieces; add HP, enemies, win/lose.

### US-110 — Strip legacy gameplay

As a developer, the game no longer references magnet, cargo, processor, or energy in the active loop.

**Done when:** `GameScene` does not wire Magnet/Cargo/Dump/Energy/Progress systems; Scrap/Processor/EnergyPickup not spawned.

- [ ] Remove legacy system wiring from `GameScene`
- [ ] Delete or archive unused legacy files (after replacement exists)
- [ ] Remove scrap/processor assets from boot preload if unused

### US-111 — Rover HP

As a player, I have a health bar and lose when it reaches zero.

**Done when:** rover has `maxHp` / `hp`; damage reduces hp; `hp <= 0` triggers defeat.

- [ ] Add HP fields to `Rover` (or `HpSystem` owner)
- [ ] Create `HpSystem` for damage, i-frames (300 ms per MVP recommendation)
- [ ] Create `HpBar` UI (replaces `EnergyBar`)
- [ ] Put base HP and armor in `GameConfig`

### US-112 — Enemy placeholder

As a player, hostile rovers chase me on the map.

**Done when:** `Enemy` entity spawns, pursues player with arcade lerp, clamps to map.

- [ ] Create `Enemy` entity (hostile rover tint)
- [ ] Chase behavior: move toward player, no A* pathfinding
- [ ] Stats from `enemyRecipe` in stage config

### US-113 — Contact damage

As a player, touching an enemy damages my rover.

**Done when:** overlap between rover and enemy applies `contactDamage` respecting i-frames and armor.

- [ ] Create `CombatSystem` (damage, death, simple AABB/distance checks)
- [ ] Enemy death removes entity and decrements `remainingEnemies`
- [ ] Hit feedback: flash, optional SFX/haptics

### US-114 — Win and lose

As a player, I win when all enemies are gone; I lose when HP hits zero.

**Done when:** `remainingEnemies === 0 && waveFullySpawned` → win; `roverHp <= 0` → lose.

- [ ] Update `RunState` transitions
- [ ] Wire `ResultScene` for survival outcomes (coins placeholder OK)
- [ ] Retry resets rover HP, enemies, wave state

---

## Epic E2 — Weapons

Auto-fire loadout weapons (up to 4).

### US-120 — Weapon definitions

As a designer, weapons are data-driven.

**Done when:** `Weapons.ts` defines at least 4 placeholder weapons with damage, fireRate, range.

- [ ] Add `WeaponDefinition` type
- [ ] Ship Pulse Cannon, Arc Turret, Orbit Drone, Mine Layer (behavior stubs OK initially)
- [ ] Tunables in `GameConfig`

### US-121 — WeaponSystem auto-fire

As a player, equipped weapons fire automatically on cooldown.

**Done when:** each loadout slot runs its own cooldown timer and triggers attacks.

- [ ] Create `WeaponSystem`
- [ ] Read loadout from save/registry at run start
- [ ] Max 4 active weapons per run

### US-122 — Projectiles and hits

As a player, my weapons damage enemies.

**Done when:** projectile or instant-hit weapons reduce enemy HP; enemy dies at 0.

- [ ] Create `Projectile` entity (where needed)
- [ ] `CombatSystem` resolves weapon hits on enemies
- [ ] Obstacles block projectiles (per open decision #7)

### US-123 — Weapon feel

As a player, shooting feels responsive.

**Done when:** muzzle flash or equivalent, impact SFX, light shake on kill.

- [ ] Wire Audio/Haptics for fire and hit
- [ ] No missing-asset crashes

---

## Epic E3 — Waves

One wave per stage with bursts and breathers.

### US-130 — StageConfig + WaveConfig

As a designer, I define waves without code changes.

**Done when:** `StageConfig` replaces scrap-oriented `LevelConfig`; includes `wave.bursts[]`.

- [ ] Add `StageConfig.ts` and `Stages.ts` (or migrate `Levels.ts`)
- [ ] Define `WaveConfig` burst shape: `count`, `intervalMs`, `delayAfterMs`
- [ ] Rover spawns at map center (or `spawn` from config)

### US-131 — WaveSpawnSystem

As a player, enemies arrive in bursts with short pauses between them.

**Done when:** spawns follow burst schedule; during `delayAfterMs` no new spawns; game does not pause.

- [ ] Create `WaveSpawnSystem`
- [ ] Track `waveFullySpawned`
- [ ] Spawn at valid positions (avoid stacking on player — simple offset)

### US-132 — Wave HUD

As a player, I know how many enemies remain.

**Done when:** `WaveIndicator` shows remaining count or wave progress (replaces `CleanBar`).

- [ ] Create `WaveIndicator.ts`
- [ ] Remove `CleanBar` from HUD

### US-133 — Five stage recipes

As a player, stages 1–5 get harder on the same map.

**Done when:** 5 `StageConfig` entries scale enemy count/HP/speed; same `scenario1` background.

- [ ] Author 5 wave recipes (replace scrap `STAGE_RECIPES`)
- [ ] Keep obstacle slots where appropriate
- [ ] Stage carousel still unlocks linearly

---

## Epic E4 — Meta (inventory + garage)

Loadout, coins, permanent upgrades.

### US-140 — Save shape migration

As a player, my weapons and loadout persist.

**Done when:** save includes `ownedWeapons`, `loadout[4]`, `weaponUpgrades`, `roverUpgrades { hp, speed, armor }`.

- [ ] Migrate `Save.ts` with backward-compatible default for old saves
- [ ] Remove capacity/battery/magnet upgrade keys from new saves

### US-141 — InventoryScene

As a player, I equip up to 4 weapons before a run.

**Done when:** new scene lists owned weapons, 4 slots, confirms to save.

- [ ] Create `InventoryScene` + `InventoryUI`
- [ ] Register in `Game.ts`
- [ ] HubBar tab: Stages | Inventory | Garage
- [ ] Remove `ShopScene` from design and code

### US-142 — Weapon unlock progression

As a player, I unlock more weapons as I progress.

**Done when:** per MVP open decision #5 — 2 weapons at start, +1 per stage won (tunable).

- [ ] Unlock logic in `Save.applyWin` or dedicated helper
- [ ] Locked weapons visible but not equippable

### US-143 — Garage repurpose

As a player, I spend coins on rover and weapon upgrades.

**Done when:** `GarageScene` shows HP, speed, armor + per-weapon upgrade tiers; old upgrade lines removed.

- [ ] Replace `UpgradeCard` lines in garage
- [ ] Apply upgrades at run start via `Upgrades.ts`
- [ ] Costs from `GameConfig` (e.g. 12 / 30 / 70)

### US-144 — Coins from combat

As a player, I earn coins for kills and stage wins.

**Done when:** coins credited on `ResultScene` (not in-run drops — per open decision #3).

- [ ] `1 coin per kill` + stage bonus
- [ ] Display on result screen

---

## Epic E5 — Content and feel

Tutorial, juice, polish.

### US-150 — Tutorial rewrite

As a new player, I learn move → auto weapons → avoid damage → clear wave.

**Done when:** `TutorialOverlay` on stage 1 matches survival steps; skippable; gated on `tutorialDone`.

- [ ] Replace magnet/cargo/processor copy
- [ ] First-run only

### US-151 — Combat juice pass

As a player, hits and kills feel satisfying.

**Done when:** enemy hit flash, death particles, rover damage flash, screen shake on kill.

- [ ] Reuse/extend existing VFX patterns from dump feedback where applicable
- [ ] Tune shake intensity for mobile

### US-152 — Minimap update

As a player, the minimap helps in combat.

**Done when:** minimap shows enemies instead of scrap/processor.

- [ ] Update `Minimap.ts` blips

### US-153 — Audio pass

As a player, combat has distinct SFX.

**Done when:** fire, hit, enemy death, player hurt, win, lose clips wired (failure-safe).

- [ ] Preload in `BootScene` when assets exist

---

## Epic E6 — Mobile ship

Keep existing Android criteria.

### US-160 — Capacitor regression

As a player, the survival build runs on Android.

**Done when:** APK/AAB builds; immersive chrome; save works.

- [x] Capacitor project exists (verify after combat refactor)
- [ ] Re-test after legacy removal
- [ ] Confirm one-hand joystick + HUD layout

### US-161 — Performance

As a player, combat stays smooth on modest phones.

**Done when:** one full stage with max enemies and 4 weapons runs without blocker FPS drops.

- [ ] Keep update loop cheap (no physics plugin)
- [ ] Pool projectiles if count grows

---

## Superseded stories (magnet collection — do not implement)

These tracked the old MVP. Kept for history only.

| Story | Title | Superseded by |
| ----- | ----- | ------------- |
| US-006 | Virtual joystick | Reuse as-is — already done |
| US-007 | Level data (scrap) | US-130 |
| US-008 | Metallic cubes | US-112, US-131 |
| US-009 | Rear magnet | Removed |
| US-010 | Cargo queue | Removed |
| US-011 | Capacity limit | Removed |
| US-012 | Processor | Removed |
| US-013 | Dump cargo | Removed |
| US-014 | Energy drain | Removed |
| US-015 | Energy/clean/cargo HUD | US-111, US-132 |
| US-016 | Cleanup progress | US-132 |
| US-017 | Win (clean map) | US-114 |
| US-018 | Lose (energy) | US-114 |
| US-019 | Retry | US-114 (reuse pattern) |
| US-020 | Result screen | US-114 (adapt copy) |
| US-021 | Main menu | Reuse — already done |
| US-022–US-026 | Magnet/cargo/dump feel | US-123, US-151 |
| US-027 | Audio plumbing | US-153 (reuse) |
| US-028 | Coins (per scrap) | US-144 |
| US-029 | Local save | US-140 |
| US-030 | Three upgrades (magnet etc.) | US-143 |
| US-031 | Upgrade screen | US-143 (Garage) |
| US-032 | Linear levels | US-133 (reuse carousel) |
| US-033 | Extra levels | US-133 |
| US-034 | Energy pickup | Removed |
| US-035 | Cube variety | Removed |
| US-036–US-038 | Capacitor, perf, tutorial | US-160, US-161, US-150 |

Partially done infrastructure (US-001–US-005, US-021): keep; do not revert.

---

## Suggested build order

Work top to bottom. Finish E1 before E4 meta. E5 can overlap E3–E4.

| Order | Stories | Goal |
| ----- | ------- | ---- |
| 1 | US-100–US-102 | Documentation aligned |
| 2 | US-110–US-114 | HP, enemy, contact damage, win/lose |
| 3 | US-120–US-123 | Weapons + auto-fire |
| 4 | US-130–US-133 | Waves + 5 stages |
| 5 | US-140–US-144 | Inventory, garage, coins |
| 6 | US-150–US-153 | Tutorial, feel, minimap, audio |
| 7 | US-160–US-161 | Android regression + perf |

Tune before adding content: rover speed, enemy HP/speed, weapon DPS, burst timing, breather duration, map size.

---

## MVP done checklist

The survival MVP is done when all of these are true:

- [ ] One-hand driving feels comfortable
- [ ] Map is larger than the screen
- [ ] Camera follows the rover
- [ ] HP bar visible; HP 0 = loss
- [ ] Enemies chase the player
- [ ] At least one weapon auto-fires; up to 4 in loadout
- [ ] Wave spawns in bursts with breathers (no pause)
- [ ] All enemies dead after full wave = win
- [ ] Inventory saves loadout between sessions
- [ ] Garage upgrades rover + weapons with coins
- [ ] 5 stages on same map with rising difficulty
- [ ] Progress saved in localStorage
- [ ] Game runs smoothly on Android
- [ ] One full stage playable start to finish without blocker bugs
