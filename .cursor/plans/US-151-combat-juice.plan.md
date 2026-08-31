---
name: US-151 — Combat juice pass
overview: "Enemy hit flash, death particles, rover damage flash, screen shake on kill."
todos:
  - id: combat-vfx
    content: Reuse/extend existing VFX patterns from dump feedback where applicable
    status: pending
  - id: mobile-shake-tune
    content: Tune shake intensity for mobile
    status: pending
isProject: true
---

# US-151 — Combat juice pass

Polish combat feedback beyond minimal weapon feel.

## Meta

- **Roadmap ID:** US-151
- **Epic:** E5 — Content and feel
- **Status:** Not started.
- **Done when:** Enemy hit flash, death particles, rover damage flash, screen shake on kill.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-113
- US-122

## Out of scope

- New weapon definitions or balance
- Full audio pass (US-153)
- Minimap changes (US-152)
- Heavy particle systems that hurt FPS (US-161)

Global MVP exclusions: none beyond performance budget.

## Likely files

- `src/game/entities/Enemy.ts`
- `src/game/entities/Rover.ts`
- `src/game/systems/CombatSystem.ts`
- `src/game/cameras/GameCameras.ts`
- Legacy VFX references in `DumpSystem.ts` or feedback tweens (read-only patterns)

## Context

Extend US-123 feel with enemy white flash on hit, brief particle burst on death, rover red flash on damage (may overlap US-113), and slightly stronger shake on kill. Reuse tween/Graphics patterns from legacy dump/region feedback if files still exist or were archived in git history.

## Implementation

1. Enemy hit: short tint/alpha flash tween on damage.
2. Enemy death: spawn 4–8 small Graphics particles outward; destroy with enemy.
3. Rover damage: ensure visible flash distinct from i-frame flicker.
4. Kill: camera shake via `GameCameras` — tune amplitude/duration in `GameConfig.juice`.
5. Guard all tweens — no leaks on scene shutdown.

## Constraints

- Mobile-safe particle counts.
- Shake must not induce nausea — subtle on small screens.
- No new audio required in this story.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-151.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- Hits and kills visibly distinct from idle combat.
- Rover damage clearly readable.
- Stage 5 with many enemies still acceptable FPS on dev machine.
- No console errors from orphaned tweens.

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
