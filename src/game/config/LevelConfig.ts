/** Visual-only scrap size — same magnet, queue, and coin behavior for every cube. */
export type ScrapSize = 'small' | 'medium' | 'large';

export type LevelScrap = {
  x: number;
  y: number;
  color: string;
  size: ScrapSize;
  /** Optional cluster id for region-clear feedback (US-026). */
  regionId?: number;
};

export type LevelProcessor = {
  x: number;
  y: number;
};

/** Optional pickups; prototype has none. Energy regen is out of scope for MVP. */
export type LevelPowerUp = {
  x: number;
  y: number;
  type: 'energy';
};

/** Data-driven level layout (MVP §25). One processor per level. */
export type LevelConfig = {
  id: number;
  mapWidth: number;
  mapHeight: number;
  initialEnergy: number;
  processor: LevelProcessor;
  scraps: LevelScrap[];
  powerUps?: LevelPowerUp[];
};
