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

type Cluster = { cx: number; cy: number; count: number; spread: number };

const PROCESSOR_CLEAR_RADIUS = 200;
const MAP_MARGIN = 90;

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

function buildScraps(
  mapWidth: number,
  mapHeight: number,
  processorX: number,
  processorY: number,
  clusters: readonly Cluster[],
  seed: number,
  expectedCount: number,
): LevelScrap[] {
  const rand = createRng(seed);
  const scraps: LevelScrap[] = [];
  const clearR2 = PROCESSOR_CLEAR_RADIUS * PROCESSOR_CLEAR_RADIUS;

  for (let regionId = 0; regionId < clusters.length; regionId += 1) {
    const cluster = clusters[regionId];
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

  if (scraps.length !== expectedCount) {
    throw new Error(`Expected ${expectedCount} scraps, got ${scraps.length}`);
  }
  return scraps;
}

/** Level 1: 2000×3000 workshop clusters, 100 cubes. */
const level1Clusters: readonly Cluster[] = [
  { cx: 380, cy: 720, count: 16, spread: 220 },
  { cx: 1620, cy: 720, count: 16, spread: 220 },
  { cx: 380, cy: 1500, count: 14, spread: 200 },
  { cx: 1620, cy: 1500, count: 14, spread: 200 },
  { cx: 1000, cy: 2100, count: 16, spread: 260 },
  { cx: 420, cy: 2650, count: 12, spread: 180 },
  { cx: 1580, cy: 2650, count: 12, spread: 180 },
];

/** Level 2: wider yard, side lanes, 90 cubes. */
const level2Clusters: readonly Cluster[] = [
  { cx: 500, cy: 600, count: 18, spread: 240 },
  { cx: 1900, cy: 600, count: 18, spread: 240 },
  { cx: 1200, cy: 1400, count: 20, spread: 320 },
  { cx: 500, cy: 2200, count: 17, spread: 220 },
  { cx: 1900, cy: 2200, count: 17, spread: 220 },
];

/** Level 3: taller map, ring around center processor approach, 110 cubes. */
const level3Clusters: readonly Cluster[] = [
  { cx: 400, cy: 900, count: 15, spread: 200 },
  { cx: 1700, cy: 900, count: 15, spread: 200 },
  { cx: 400, cy: 1800, count: 18, spread: 240 },
  { cx: 1700, cy: 1800, count: 18, spread: 240 },
  { cx: 1050, cy: 2600, count: 22, spread: 300 },
  { cx: 1050, cy: 3400, count: 22, spread: 280 },
];

export const prototypeLevel: LevelConfig = {
  id: 1,
  mapWidth: 2000,
  mapHeight: 3000,
  initialEnergy: 100,
  processor: { x: 1000, y: 380 },
  scraps: buildScraps(2000, 3000, 1000, 380, level1Clusters, 1007, 100),
  powerUps: [],
};

export const yardLevel: LevelConfig = {
  id: 2,
  mapWidth: 2400,
  mapHeight: 2800,
  initialEnergy: 110,
  processor: { x: 1200, y: 320 },
  scraps: buildScraps(2400, 2800, 1200, 320, level2Clusters, 2049, 90),
  powerUps: [
    { x: 1200, y: 1400, type: 'energy' },
    { x: 500, y: 2200, type: 'energy' },
  ],
};

export const junkyardLevel: LevelConfig = {
  id: 3,
  mapWidth: 2100,
  mapHeight: 3600,
  initialEnergy: 120,
  processor: { x: 1050, y: 400 },
  scraps: buildScraps(2100, 3600, 1050, 400, level3Clusters, 3331, 110),
  powerUps: [
    { x: 1050, y: 1800, type: 'energy' },
    { x: 400, y: 2600, type: 'energy' },
    { x: 1700, y: 2600, type: 'energy' },
  ],
};

export const levels: readonly LevelConfig[] = [prototypeLevel, yardLevel, junkyardLevel];

export function getLevelById(id: number): LevelConfig {
  const level = levels.find((entry) => entry.id === id);
  if (!level) {
    throw new Error(`Unknown level id: ${id}`);
  }
  return level;
}

export function getNextLevelId(currentId: number): number {
  const index = levels.findIndex((entry) => entry.id === currentId);
  if (index < 0 || index >= levels.length - 1) {
    return levels[levels.length - 1]?.id ?? currentId;
  }
  return levels[index + 1].id;
}

export function getMaxLevelId(): number {
  return levels[levels.length - 1]?.id ?? 1;
}
