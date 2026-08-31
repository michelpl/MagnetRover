---
name: US-150 — Tutorial rewrite
overview: "TutorialOverlay on stage 1 matches survival steps; skippable; gated on tutorialDone."
todos:
  - id: replace-tutorial-copy
    content: Replace magnet/cargo/processor copy
    status: pending
  - id: first-run-only
    content: First-run only
    status: pending
isProject: true
---

# US-150 — Tutorial rewrite

Teach move → auto weapons → avoid damage → clear wave on first run.

## Meta

- **Roadmap ID:** US-150
- **Epic:** E5 — Content and feel
- **Status:** Not started.
- **Done when:** `TutorialOverlay` on stage 1 matches survival steps; skippable; gated on `tutorialDone`.
- **Source of truth:** [MVP.md](../../MVP.md), [ROADMAP.md](../../ROADMAP.md)
- **Rules:** `.cursor/rules/` (premises, architecture, TypeScript, Phaser, English)

## Prerequisites

- US-114
- US-121

## Out of scope

- Full combat juice (US-151)
- Tutorial for inventory/garage meta screens
- Voice-over or video
- Forced slow-motion steps

Global MVP exclusions: magnet/cargo/processor tutorial steps.

## Likely files

- `src/game/ui/TutorialOverlay.ts`
- `src/game/scenes/GameScene.ts`
- `src/game/save/Save.ts`

## Context

Replace legacy tutorial strings with survival flow: (1) move with joystick, (2) weapons fire automatically, (3) avoid enemy contact, (4) clear all enemies to win. Show on stage 1 only when `save.tutorialDone === false`. Skip button sets flag and hides overlay. Advance steps on simple triggers (moved distance, first kill, etc.) if existing pattern supports it.

## Implementation

1. Audit `TutorialOverlay` step list — remove magnet/cargo/processor references.
2. Add survival steps with English copy aligned to MVP.
3. Gate display: stage id 1 && !`tutorialDone`.
4. On complete or skip: `Save.setTutorialDone(true)`.
5. Ensure overlay does not block joystick input incorrectly (pointer pass-through where needed).

## Constraints

- Skippable always.
- English user-facing text.
- Do not reintroduce legacy mechanics in copy.

## Autonomous execution checklist

1. Read this plan end-to-end and the linked roadmap story US-150.
2. Inspect current `src/game/` before editing; reuse existing patterns (`GameConfig`, Container placeholders, arcade lerp).
3. Implement todos in order; keep the scene as a wirer and put math in systems/entities.
4. Run `npm run build` (and `npm run dev` smoke) before declaring done.
5. Mark todos completed in this file's frontmatter as you finish them.
6. Do not expand into neighboring user stories unless required to compile/run.

## Verify

- First stage-1 run shows survival tutorial.
- Skip or complete hides tutorial on future runs.
- No magnet/cargo/processor text remains.
- Player can still move while tutorial visible (per design).

## Stop conditions

Stop when **Done when** is satisfied and verify checks pass. Do not start the next US in the same execution unless the user explicitly asks.
