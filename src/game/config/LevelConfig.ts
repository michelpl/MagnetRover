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

/** Optional energy batteries placed by the layout solver. */
export type LevelPowerUp = {
  x: number;
  y: number;
  type: 'energy';
};

/** Static AABB the rover cannot drive through (world pixels, top-left origin). */
export type LevelObstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Data-driven level layout (MVP §25). One processor per level. */
export type LevelConfig = {
  id: number;
  displayName: string;
  mapWidth: number;
  mapHeight: number;
  processor: LevelProcessor;
  scraps: LevelScrap[];
  powerUps?: LevelPowerUp[];
  obstacles?: LevelObstacle[];
  spawn?: { x: number; y: number };
};
