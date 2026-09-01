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

export type ObstacleVariant =
  | 'barrier'
  | 'pillar'
  | 'vat_long'
  | 'pool_wide'
  | 'crate_tall'
  | 'vat_square'
  | 'crate_rect'
  | 'crate_square';

export type StageObstacle = {
  variant: ObstacleVariant;
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
