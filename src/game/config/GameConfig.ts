export const GameConfig = {
  viewport: {
    width: 1080,
    height: 1920,
  },
  ui: {
    fontFamily: 'Oxanium',
  },
  splash: {
    versionLabel: 'Version 1.0.0 (1)',
    loadingLabel: 'LOADING...',
    minimumDisplayMs: 900,
    progressBar: {
      width: 780,
      height: 42,
      radius: 21,
      y: 1608,
      labelOffsetY: -82,
      versionOffsetY: 76,
      padding: 4,
      trackColor: 0x011d3b,
      trackStrokeColor: 0x0e4e7d,
      fillColor: 0x7df000,
      fillHighlightColor: 0xb7ff4e,
      textColor: 0xe9f6ff,
    },
  },
  /** World size of the floor. `scenario1` texture is 2x (3344×1882), drawn at this size. */
  map: {
    width: 1672,
    height: 941,
    gridSize: 200,
    /** Inner floor inset matching painted walls (world px). */
    wallInset: 64,
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
    /** On-screen size of the recycler sprite (square). */
    spriteDisplaySize: 96,
    /** Solid AABB the rover cannot enter (world pixels, centered on the sprite). */
    colliderWidth: 80,
    colliderHeight: 76,
    /** Drive-in dump pad in front of the intake tray (world pixels). */
    dumpZoneWidth: 120,
    dumpZoneHeight: 72,
    dumpZoneCornerRadius: 12,
    dumpZoneDash: 8,
    dumpZoneGap: 5,
    dumpZoneLineWidth: 2,
    dumpZoneGlowWidth: 6,
    dumpZoneColor: 0x51cf66,
    dumpZoneGlowAlphaMin: 0.35,
    dumpZoneGlowAlphaMax: 1,
    dumpZoneGlowMs: 800,
    /** Local Y of the dump pad top edge (sprite half-height + a few pixels of gap). */
    dumpZoneLocalTop: 58,
    /** Delay between sequential scrap dumps (ms); keep in the 20–60 feel range. */
    dumpIntervalMs: 40,
  },
  rover: {
    speed: 160,
    inputSmoothing: 0.18,
    rotationSmoothing: 0.2,
    /** Speed below this (px/s on either axis) counts as stopped for rotation / energy. */
    moveEpsilon: 8,
    bodyWidth: 34,
    bodyHeight: 44,
    /** Packed 8-dir sheet in `assets/sprites/rover/rover.png`. */
    spriteFrameSize: 256,
    /** Max cubes in the trailing cargo queue (US-011). */
    capacity: 3,
    /** Local Y of the rear magnet cue (positive = behind body when front is up). */
    magnetOffsetY: 26,
    magnetGlowRadius: 13,
    magnetRingRadius: 10,
    magnetRingWidth: 2,
  },
  camera: {
    lerp: 0.08,
    /** In-run zoom; HUD uses a second unzoomed camera. */
    zoom: 3.4,
  },
  /** Rear magnet pull — radius from magnetAnchor, not hull center. */
  magnet: {
    magnetRadius: 70,
    /** Per ~16.67ms frame factor; applied with delta scaling in MagnetSystem. */
    attractionSpeed: 0.14,
    /** Extra pull factor while Attracted (US-022). */
    attractionBoost: 1.55,
    radiusAlpha: 0.18,
    spinDegPerSec: 220,
  },
  /** Malleable trailing queue (snake/train) behind the rear magnet. */
  cargo: {
    stickRadius: 26,
    spacing: 21,
    followSmoothing: 0.28,
    wobbleAmplitude: 1.5,
    wobbleFrequency: 1.2,
    /** How long the FULL cue stays on screen (ms). */
    fullCueDurationMs: 1400,
  },
  /** Visual-only gear sizes — magnet, queue, and coins treat every scrap the same. */
  scrap: {
    sizePx: {
      small: 18,
      medium: 24,
      large: 32,
    },
  },
  joystick: {
    baseRadius: 110,
    thumbRadius: 44,
    /** Distance from viewport bottom to idle stick center. */
    marginBottom: 200,
    /** Fraction of base radius that reads as zero before analog ramp. */
    deadzone: 0.12,
    /** Bottom fraction of the viewport that can start a stick drag. */
    captureHeightRatio: 0.55,
    /** Active base / thumb fill alpha. */
    opacity: 0.45,
    /** Faint base while idle so the control stays discoverable. */
    idleOpacity: 0.18,
    color: 0xffffff,
  },
  debug: {
    boostSpeed: 800,
  },
  /** Drain only while moving. Rate is global — battery size is a rover upgrade. */
  energy: {
    /** Units drained per second of movement. Constant across stages. */
    movementEnergyCost: 4,
    /** Fraction of max energy restored by one EnergyPickup (US-034). */
    pickupBonusRatio: 0.2,
  },
  coins: {
    perKill: 1,
    perScrap: 1,
  },
  /**
   * Bottom hub bar on menu screens (shop / stages / garage).
   * Icon PNGs are 440×440; buttonSize is the on-screen display width.
   */
  hub: {
    marginBottom: 168,
    buttonSize: 220,
    spacing: 360,
    hitRadius: 92,
    iconSourceSize: 440,
  },
  /**
   * Garage (upgrade) tab. Last card must stay above the HubBar
   * (center at height - marginBottom).
   * Icon frames are pixel crops of `assets/ui/iconset.png` (irregular grid).
   */
  garage: {
    marginX: 48,
    marginTop: 88,
    walletWidth: 420,
    walletHeight: 84,
    walletRadius: 16,
    /** World Y of the rover, aligned to the painted pad on garage-bg (cover-fit). */
    showcaseY: 762,
    roverDisplaySize: 260,
    roverFrame: 3,
    cardsTop: 930,
    cardWidth: 984,
    cardHeight: 168,
    cardGap: 14,
    cardRadius: 18,
    iconSize: 96,
    buySize: 92,
    pipSize: 12,
    pipGap: 8,
    colors: {
      panel: 0x103760,
      panelBottom: 0x0a284d,
      stroke: 0x3a628c,
      gloss: 0x80b1e2,
      buy: 0xffb00d,
      buyDim: 0x435971,
      pipOn: 0xffd22f,
      pipOff: 0x1c4f82,
    },
    iconFrames: {
      bolt: { x: 50, y: 20, width: 196, height: 268 },
      plus: { x: 300, y: 58, width: 210, height: 210 },
      coin: { x: 565, y: 50, width: 204, height: 228 },
      gear: { x: 825, y: 48, width: 236, height: 236 },
      chest: { x: 585, y: 552, width: 266, height: 246 },
      boost: { x: 888, y: 548, width: 262, height: 254 },
    },
    lineIcons: {
      capacity: '1',
      battery: '3',
      speed: '0',
      magnetRadius: '2',
    },
  },
  /** Shared currency and future-settings controls on game and hub screens. */
  topControls: {
    marginTop: 88,
    gearSize: 84,
    gearMarginRight: 48,
    pauseGapBelowGear: 12,
  },
  settings: {
    panelWidth: 840,
    panelHeight: 620,
    panelRadius: 28,
    sliderWidth: 600,
    sliderHeight: 24,
    knobRadius: 28,
    initialVolume: 0.75,
  },
  /** Camera-fixed in-run HUD — keep clear of bottom joystick. */
  hud: {
    marginX: 48,
    marginTop: 88,
    marginBottom: 96,
    /** Camera-fixed lower-left battery panel. Artwork is the source of its chrome. */
    energyPanel: {
      width: 260,
      height: 520,
      slotCount: 8,
      firstSlotCenterY: 182,
      slotPitch: 36,
      unitScale: 0.08,
      percentageCenterY: 472,
      percentageFontSize: 32,
      matteThreshold: 8,
    },
    /** Horizontal bar length; vertical energy stack uses this as height. */
    barWidth: 640,
    /** Horizontal bar thickness; vertical energy stack uses this as width. */
    barHeight: 22,
    pauseSize: 72,
    /** Uniform scale for the top-center cleanup panel. */
    cleanPanelScale: 2,
    cleanPanelWidth: 272,
    cleanPanelHeight: 55,
    cleanPanelRadius: 15,
    /** Leaves room for the shared wallet at the top of the in-run HUD. */
    cleanPanelMarginTop: 196,
    cleanTrackX: 16,
    cleanTrackY: 31,
    cleanTrackWidth: 190,
    cleanTrackHeight: 14,
    cleanTrackRadius: 8,
    cleanTrackPadding: 2,
    cleanFillRadius: 6,
    cleanPercentRight: 16,
    minimap: {
      width: 320,
      gapBelowBars: 16,
      padding: 24,
      cornerRadius: 16,
      strokeWidth: 4,
      gridCols: 4,
      gridRows: 2,
      gridAlpha: 0.22,
      fillColor: 0x1a2533,
      fillAlpha: 0.8,
      strokeColor: 0x3d5368,
      gridColor: 0x5c7a94,
      roverColor: 0x7fff00,
      roverRadius: 7,
      coneLength: 16,
      coneWidth: 12,
      coneAlpha: 0.35,
      scrapColor: 0xffbf00,
      scrapRadius: 6,
      energyColor: 0x66d9e8,
      energyRadius: 4,
      processorColor: 0xf76707,
      processorSize: 10,
    },
  },
  /**
   * Legacy capacity / battery / speed / magnet tiers.
   * Garage uses roverUpgrades for survival — kept for save migration only.
   */
  upgrades: {
    enabled: true,
    capacity: {
      values: [3, 6, 10, 16],
      costs: [12, 30, 70],
    },
    battery: {
      values: [100, 120, 145, 175],
      costs: [12, 30, 70],
    },
    speed: {
      values: [160, 180, 200, 220],
      costs: [12, 30, 70],
    },
    magnetRadius: {
      values: [70, 85, 105, 125],
      costs: [12, 30, 70],
    },
  },
  /** Survival combat tunables. */
  survival: {
    baseMaxHp: 100,
    baseArmor: 0,
    invulnMs: 300,
    hitFlashMs: 120,
    roverDamageFlashMs: 150,
    contactOverlapRadius: 32,
    weaponDamageMultiplier: 1,
    weaponUpgradeDamagePerTier: 4,
    spawnMinDistanceFromRover: 220,
    spawnEdgeInset: 80,
    projectilePoolSize: 48,
    killShakeDurationMs: 120,
    killShakeIntensity: 0.006,
    muzzleFlashMs: 80,
    stageCoinBonus: [10, 15, 20, 25, 35] as readonly number[],
  },
  roverUpgrades: {
    hp: { values: [100, 120, 145, 175] as readonly number[], costs: [12, 30, 70] as readonly number[] },
    speed: { values: [160, 180, 200, 220] as readonly number[], costs: [12, 30, 70] as readonly number[] },
    armor: { values: [0, 2, 4, 6] as readonly number[], costs: [12, 30, 70] as readonly number[] },
  },
  weaponUpgradeConfig: {
    maxTier: 3,
    costs: [12, 30, 70] as readonly number[],
  },
  hudSurvival: {
    hpBarWidth: 420,
    hpBarHeight: 28,
    hpBarMarginBottom: 420,
    wavePanelWidth: 320,
    wavePanelHeight: 56,
    wavePanelMarginTop: 196,
  },
} as const;

/** True only while running under Vite `npm run dev` (not production builds). */
export const isDebugMode = import.meta.env?.DEV === true;
