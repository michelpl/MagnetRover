import { GameConfig } from './GameConfig';
import type { StageConfig } from './StageConfig';

const { width: mapWidth, height: mapHeight } = GameConfig.map;

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
    obstacles: [],
    enemyRecipe,
    wave,
  };
}

export const STAGES: readonly StageConfig[] = [
  stage(
    1,
    'Workshop Alpha',
    { hp: 10, speed: 90, contactDamage: 8 },
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
    { hp: 10, speed: 100, contactDamage: 10 },
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
    { hp: 20, speed: 110, contactDamage: 12 },
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
    { hp: 20, speed: 120, contactDamage: 14 },
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
    { hp: 30, speed: 130, contactDamage: 16 },
    {
      bursts: [
        { count: 6, intervalMs: 600, delayAfterMs: 1400 },
        { count: 5, intervalMs: 700, delayAfterMs: 1200 },
        { count: 4, intervalMs: 800, delayAfterMs: 1000 },
        { count: 2, intervalMs: 900, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    6,
    'Workshop Sigma',
    { hp: 30, speed: 138, contactDamage: 18 },
    {
      bursts: [
        { count: 6, intervalMs: 550, delayAfterMs: 1300 },
        { count: 6, intervalMs: 650, delayAfterMs: 1100 },
        { count: 5, intervalMs: 750, delayAfterMs: 1000 },
        { count: 3, intervalMs: 850, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    7,
    'Workshop Tau',
    { hp: 40, speed: 146, contactDamage: 20 },
    {
      bursts: [
        { count: 7, intervalMs: 500, delayAfterMs: 1200 },
        { count: 6, intervalMs: 600, delayAfterMs: 1100 },
        { count: 5, intervalMs: 700, delayAfterMs: 900 },
        { count: 4, intervalMs: 800, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    8,
    'Workshop Chi',
    { hp: 40, speed: 154, contactDamage: 22 },
    {
      bursts: [
        { count: 7, intervalMs: 480, delayAfterMs: 1100 },
        { count: 6, intervalMs: 560, delayAfterMs: 1000 },
        { count: 6, intervalMs: 640, delayAfterMs: 900 },
        { count: 5, intervalMs: 720, delayAfterMs: 800 },
        { count: 3, intervalMs: 800, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    9,
    'Workshop Psi',
    { hp: 50, speed: 162, contactDamage: 25 },
    {
      bursts: [
        { count: 8, intervalMs: 450, delayAfterMs: 1000 },
        { count: 7, intervalMs: 520, delayAfterMs: 950 },
        { count: 6, intervalMs: 600, delayAfterMs: 850 },
        { count: 5, intervalMs: 680, delayAfterMs: 750 },
        { count: 4, intervalMs: 760, delayAfterMs: 0 },
      ],
    },
  ),
  stage(
    10,
    'Workshop Apex',
    { hp: 60, speed: 172, contactDamage: 28 },
    {
      bursts: [
        { count: 8, intervalMs: 420, delayAfterMs: 900 },
        { count: 8, intervalMs: 480, delayAfterMs: 850 },
        { count: 7, intervalMs: 540, delayAfterMs: 800 },
        { count: 6, intervalMs: 600, delayAfterMs: 750 },
        { count: 5, intervalMs: 680, delayAfterMs: 700 },
        { count: 3, intervalMs: 760, delayAfterMs: 0 },
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
