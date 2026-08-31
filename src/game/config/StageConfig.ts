export type WaveBurstConfig = {
  count: number;
  intervalMs: number;
  delayAfterMs: number;
};

export type WaveConfig = {
  bursts: WaveBurstConfig[];
};

export type EnemyRecipe = {
  hp: number;
  speed: number;
  contactDamage: number;
};

export type StageObstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type StageConfig = {
  id: number;
  name: string;
  mapWidth: number;
  mapHeight: number;
  backgroundKey: string;
  spawn?: { x: number; y: number };
  obstacles: StageObstacle[];
  enemyRecipe: EnemyRecipe;
  wave: WaveConfig;
};
