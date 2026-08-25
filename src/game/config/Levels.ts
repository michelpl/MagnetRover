import type { LevelConfig, LevelScrap, ScrapSize } from './LevelConfig';

const SCRAP_COLORS = [
  '#adb5bd',
  '#ffd43b',
  '#ff922b',
  '#74c0fc',
  '#69db7c',
  '#e599f7',
  '#ffa8a8',
  '#ced4da',
] as const;

const SCRAP_SIZES: readonly ScrapSize[] = ['small', 'medium', 'large'];

/** Workshop-style clusters across 2000×3000 — open lanes, not mazes. */
const PROTOTYPE_CLUSTERS: readonly { cx: number; cy: number; count: number; spread: number }[] =
  [
    { cx: 380, cy: 720, count: 16, spread: 220 },
    { cx: 1620, cy: 720, count: 16, spread: 220 },
    { cx: 380, cy: 1500, count: 14, spread: 200 },
    { cx: 1620, cy: 1500, count: 14, spread: 200 },
    { cx: 1000, cy: 2100, count: 16, spread: 260 },
    { cx: 420, cy: 2650, count: 12, spread: 180 },
    { cx: 1580, cy: 2650, count: 12, spread: 180 },
  ];

const PROCESSOR_CLEAR_RADIUS = 200;
const MAP_MARGIN = 90;

/**
 * Deterministic 0..1 PRNG so level layout is stable across reloads
 * without baking 100 hand-written coordinates.
 */
function createRng(seed: number): () => number {
  let state = seed % 2147483647;
  if (state <= 0) {
    state += 2147483646;
  }
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

function buildPrototypeScraps(
  mapWidth: number,
  mapHeight: number,
  processorX: number,
  processorY: number,
): LevelScrap[] {
  const rand = createRng(1007);
  const scraps: LevelScrap[] = [];
  const clearR2 = PROCESSOR_CLEAR_RADIUS * PROCESSOR_CLEAR_RADIUS;

  for (let regionId = 0; regionId < PROTOTYPE_CLUSTERS.length; regionId += 1) {
    const cluster = PROTOTYPE_CLUSTERS[regionId];
    let placed = 0;
    let attempts = 0;
    const maxAttempts = cluster.count * 40;

    while (placed < cluster.count && attempts < maxAttempts) {
      attempts += 1;
      const angle = rand() * Math.PI * 2;
      const radius = rand() * cluster.spread;
      const x = cluster.cx + Math.cos(angle) * radius;
      const y = cluster.cy + Math.sin(angle) * radius;

      if (x < MAP_MARGIN || x > mapWidth - MAP_MARGIN) {
        continue;
      }
      if (y < MAP_MARGIN || y > mapHeight - MAP_MARGIN) {
        continue;
      }

      const dx = x - processorX;
      const dy = y - processorY;
      if (dx * dx + dy * dy < clearR2) {
        continue;
      }

      scraps.push({
        x: Math.round(x),
        y: Math.round(y),
        color: SCRAP_COLORS[Math.floor(rand() * SCRAP_COLORS.length)] ?? SCRAP_COLORS[0],
        size: SCRAP_SIZES[Math.floor(rand() * SCRAP_SIZES.length)] ?? 'medium',
        regionId,
      });
      placed += 1;
    }
  }

  return scraps;
}

const PROTOTYPE_MAP_WIDTH = 2000;
const PROTOTYPE_MAP_HEIGHT = 3000;
/** Landmark near top-center — clear path down to rover spawn at map center. */
const PROTOTYPE_PROCESSOR = { x: 1000, y: 380 };

const prototypeScraps = buildPrototypeScraps(
  PROTOTYPE_MAP_WIDTH,
  PROTOTYPE_MAP_HEIGHT,
  PROTOTYPE_PROCESSOR.x,
  PROTOTYPE_PROCESSOR.y,
);

if (prototypeScraps.length !== 100) {
  throw new Error(
    `Prototype level expected 100 scraps, got ${prototypeScraps.length}`,
  );
}

/** First playable level: 2000×3000, 100 cubes, 1 processor, no pickups. */
export const prototypeLevel: LevelConfig = {
  id: 1,
  mapWidth: PROTOTYPE_MAP_WIDTH,
  mapHeight: PROTOTYPE_MAP_HEIGHT,
  initialEnergy: 100,
  processor: PROTOTYPE_PROCESSOR,
  scraps: prototypeScraps,
  powerUps: [],
};

export const levels: readonly LevelConfig[] = [prototypeLevel];

export function getLevelById(id: number): LevelConfig {
  const level = levels.find((entry) => entry.id === id);
  if (!level) {
    throw new Error(`Unknown level id: ${id}`);
  }
  return level;
}
