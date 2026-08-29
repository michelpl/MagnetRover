# Magnet Rover project instructions

Apply these instructions before making changes in this repository. Rules that are scoped to TypeScript or game code apply whenever editing those files.

## Architecture

Keep game code under `src/game/` as in MVP §23:

- `scenes/` — Phaser scenes (Boot, Game; Menu/Upgrade/Result later)
- `entities/` — Rover, Scrap (metallic cube), Processor, pickups
- `systems/` — magnet (rear anchor), cargo queue, energy, progress (no logic dumped in the scene)
- `config/` — `GameConfig`, later `Levels`
- `ui/` — HUD widgets

### Rules

- Scenes wire systems and entities. They do not own gameplay math.
- Put tunables in `GameConfig`. No magic numbers in update loops.
- One concern per file. Do not grow a god-scene or god-entity.
- Placeholder folders (`systems/`, `ui/`) stay empty until that feature lands.

## English language

- Identifiers, comments, commit messages, and project docs are English.
- Do not write Portuguese (or any other language) in source files.
- User-facing game copy stays English until an i18n system exists.
- Keep names concrete: `Rover`, `Scrap`, `Processor`, `magnetRadius`, `magnetAnchor`.
- Collectibles are metallic cubes; use `color` and `size` for visuals, not gameplay weight.
- Exception: `MVP.md` may stay in Portuguese as the original spec.

## Phaser

- Arcade movement: read input, apply speed, lerp velocity/rotation. No realistic acceleration or steering.
- Camera follows the rover with a small lerp and stays inside map bounds.
- Clamp the rover to the map. Do not let it leave the world.
- Use generated Graphics/Container placeholders until art exists.
- Do not add Arcade Physics (or any physics plugin) unless a later task needs it. Attract cubes to the rear magnet and follow the cargo queue with interpolation.
- Collectibles are metallic cubes (color + size visual only). Carried cubes form a malleable queue behind the rear magnet — not fixed cargo slots around the rover.
- Scale is portrait 1080×1920 with `Scale.FIT`.
- Keep `update(time, delta)` cheap: modest Android devices are the target.

## Project premises

Magnet Rover is a mobile hyper-casual top-down game. The player drives a small vehicle with a rear magnet, collects metallic cubes of different colors and sizes into a malleable trailing queue, dumps them at a processor, and clears the map before energy runs out.

Follow [MVP.md](MVP.md). Keep scope tight.

### Must

- Arcade feel: simple controls, short sessions, satisfying feedback.
- Interpolate positions. Do not use realistic physics or steering.
- Keep levels data-driven (`LevelConfig`) once levels exist.
- Collectibles are metallic cubes (color + size visual only). Magnet sits at the rear of the rover; carried cubes form a malleable queue behind it.
- Prioritize feel (speed, magnet radius, trailing cube queue) over extra systems.

### Must not (MVP)

Do not add enemies, combat, complex physics, pathfinding, multiplayer, skill trees, crafting, inventory, quests, regenerative energy, or multiple processor types.

Energy only drains while moving. Capacitor/Android comes later.

## TypeScript

- Keep `strict` on. Never use `any`. External data is `unknown` until parsed.
- Prefer named domain types (`RoverConfig`, `ScrapState`) over inline bags.
- Model variants with discriminated unions, not optional-field bags.
- No empty `catch`. Log or rethrow with context.
- No `as` casts except after a real runtime check.
- Object arguments for non-hot APIs. Per-frame update may take primitives.
- Exhaust `switch` on unions with `const _exhaustive: never = x`.
