import { GameConfig } from './GameConfig';
import type { StageConfig } from './StageConfig';

const { width: mapWidth, height: mapHeight } = GameConfig.map;

const BASE_OBSTACLES = [
  { x: 420, y: 280, width: 120, height: 80 },
  { x: 980, y: 520, width: 140, height: 90 },
  { x: 680, y: 680, width: 100, height: 100 },
] as const;

function stage(
  id: number,
  name: string,
  enemyRecipe: StageConfig['enemyRecipe'],
  wave: StageConfig['wave'],
): StageConfig {
  return {
    id,
    name,
    mapWidth,
    mapHeight,
    backgroundKey: 'scenario1',
    obstacles: BASE_OBSTACLES.map((o) => ({ ...o })),
    enemyRecipe,
    wave,
  };
}

export const STAGES: readonly StageConfig[] = [
  stage(
    1,
    'Workshop Alpha',
    { hp: 30, speed: 90, contactDamage: 8 },
    {
      bursts: [
        { count: 3, intervalMs: 900, delayAfterMs: 2000 },
        { count: 2, intervalMs: 1100, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    2,
    'Workshop Beta',
    { hp: 40, speed: 100, contactDamage: 10 },
    {
      bursts: [
        { count: 4, intervalMs: 800, delayAfterMs: 1800 },
        { count: 3, intervalMs: 900, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    3,
    'Workshop Gamma',
    { hp: 55, speed: 110, contactDamage: 12 },
    {
      bursts: [
        { count: 4, intervalMs: 700, delayAfterMs: 1600 },
        { count: 4, intervalMs: 800, delayAfterMs: 1400 },
        { count: 2, intervalMs: 900, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    4,
    'Workshop Delta',
    { hp: 70, speed: 120, contactDamage: 14 },
    {
      bursts: [
        { count: 5, intervalMs: 650, delayAfterMs: 1500 },
        { count: 4, intervalMs: 750, delayAfterMs: 1200 },
        { count: 3, intervalMs: 850, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    5,
    'Workshop Omega',
    { hp: 90, speed: 130, contactDamage: 16 },
    {
      bursts: [
        { count: 6, intervalMs: 600, delayAfterMs: 1400 },
        { count: 5, intervalMs: 700, delayAfterMs: 1200 },
        { count: 4, intervalMs: 800, delayAfterMs: 1000 },
        { count: 2, intervalMs: 900, delayAfterMs: 0 },
      ],
    },
  ),
];

export function getStageById(id: number): StageConfig {
  const stageEntry = STAGES.find((entry) => entry.id === id);
  if (!stageEntry) {
    throw new Error(`Unknown stage id: ${id}`);
  }
  return stageEntry;
}

export function getNextStageId(currentId: number): number {
  const index = STAGES.findIndex((entry) => entry.id === currentId);
  if (index < 0 || index >= STAGES.length - 1) {
    return STAGES[STAGES.length - 1]?.id ?? currentId;
  }
  return STAGES[index + 1].id;
}

export function getMaxStageId(): number {
  return STAGES[STAGES.length - 1]?.id ?? 1;
}

export function isStageUnlocked(stageId: number, currentLevel: number): boolean {
  return stageId <= currentLevel;
}

export function totalWaveEnemies(wave: StageConfig['wave']): number {
  return wave.bursts.reduce((sum, burst) => sum + burst.count, 0);
}
