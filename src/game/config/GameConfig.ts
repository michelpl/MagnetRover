export const GameConfig = {
  viewport: {
    width: 1080,
    height: 1920,
  },
  /** Defaults match prototype level 1 (`Levels.ts`); rover clamp uses these. */
  map: {
    width: 2000,
    height: 3000,
    gridSize: 200,
    borderWidth: 8,
  },
  colors: {
    background: 0x0d0d10,
    mapFill: 0x1e1e26,
    mapGrid: 0xffffff,
    mapBorder: 0x4c6ef5,
    roverBody: 0xadb5bd,
    roverCabin: 0x495057,
    roverAccent: 0x74c0fc,
    magnetGlow: 0x22b8cf,
    processorBody: 0xf76707,
    processorAccent: 0xffd43b,
    processorPad: 0xe8590c,
  },
  processor: {
    /** Dump zone radius in world pixels (circle centered on processor). */
    areaRadius: 90,
    bodyWidth: 96,
    bodyHeight: 80,
    padRadius: 70,
  },
  rover: {
    speed: 280,
    inputSmoothing: 0.18,
    rotationSmoothing: 0.2,
    /** Speed below this (px/s on either axis) counts as stopped for rotation / energy. */
    moveEpsilon: 8,
    bodyWidth: 56,
    bodyHeight: 72,
    /** Max cubes in the trailing cargo queue (US-011). */
    capacity: 20,
    /** Local Y of the rear magnet cue (positive = behind body when front is up). */
    magnetOffsetY: 44,
    magnetGlowRadius: 22,
    magnetRingRadius: 16,
    magnetRingWidth: 3,
  },
  camera: {
    lerp: 0.08,
  },
  /** Rear magnet pull — radius from magnetAnchor, not hull center. */
  magnet: {
    magnetRadius: 140,
    /** Per ~16.67ms frame factor; applied with delta scaling in MagnetSystem. */
    attractionSpeed: 0.14,
    radiusAlpha: 0.18,
  },
  /** Malleable trailing queue (snake/train) behind the rear magnet. */
  cargo: {
    stickRadius: 42,
    spacing: 34,
    followSmoothing: 0.28,
    wobbleAmplitude: 1.5,
    wobbleFrequency: 1.2,
    /** How long the FULL cue stays on screen (ms). */
    fullCueDurationMs: 1400,
  },
  /** Visual-only cube sizes — magnet, queue, and coins treat every scrap the same. */
  scrap: {
    sizePx: {
      small: 22,
      medium: 30,
      large: 40,
    },
    cornerRadius: 4,
    edgeHighlight: 0xffffff,
  },
  joystick: {
    baseRadius: 90,
    thumbRadius: 36,
    /** Distance from viewport bottom to joystick center. */
    marginBottom: 160,
    /** Active base / thumb fill alpha. */
    opacity: 0.45,
    /** Faint base while idle so the control stays discoverable. */
    idleOpacity: 0.18,
    color: 0xffffff,
  },
  debug: {
    boostSpeed: 800,
  },
} as const;

/** True only while running under Vite `npm run dev` (not production builds). */
export const isDebugMode = import.meta.env.DEV;
