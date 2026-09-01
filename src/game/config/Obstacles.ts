import type { ObstacleVariant } from './StageConfig';

export type ObstacleVisual = {
  variant: ObstacleVariant;
  textureKey: string;
  assetPath: string;
  displayWidth: number;
  displayHeight: number;
};

const OBSTACLE_VISUALS: Record<ObstacleVariant, ObstacleVisual> = {
  barrier: {
    variant: 'barrier',
    textureKey: 'obstacle-barrier',
    assetPath: 'assets/sprites/obstacle/barrier.png',
    displayWidth: 168,
    displayHeight: 126,
  },
  pillar: {
    variant: 'pillar',
    textureKey: 'obstacle-pillar',
    assetPath: 'assets/sprites/obstacle/pillar.png',
    displayWidth: 72,
    displayHeight: 96,
  },
  vat_long: {
    variant: 'vat_long',
    textureKey: 'obstacle-vat-long',
    assetPath: 'assets/sprites/obstacle/vat_long.jpg',
    displayWidth: 90,
    displayHeight: 120,
  },
  pool_wide: {
    variant: 'pool_wide',
    textureKey: 'obstacle-pool-wide',
    assetPath: 'assets/sprites/obstacle/pool_wide.jpg',
    displayWidth: 160,
    displayHeight: 120,
  },
  crate_tall: {
    variant: 'crate_tall',
    textureKey: 'obstacle-crate-tall',
    assetPath: 'assets/sprites/obstacle/crate_tall.jpg',
    displayWidth: 72,
    displayHeight: 96,
  },
  vat_square: {
    variant: 'vat_square',
    textureKey: 'obstacle-vat-square',
    assetPath: 'assets/sprites/obstacle/vat_square.jpg',
    displayWidth: 120,
    displayHeight: 120,
  },
  crate_rect: {
    variant: 'crate_rect',
    textureKey: 'obstacle-crate-rect',
    assetPath: 'assets/sprites/obstacle/crate_rect.jpg',
    displayWidth: 140,
    displayHeight: 105,
  },
  crate_square: {
    variant: 'crate_square',
    textureKey: 'obstacle-crate-square',
    assetPath: 'assets/sprites/obstacle/crate_square.jpg',
    displayWidth: 110,
    displayHeight: 110,
  },
};

export const OBSTACLE_VARIANTS: readonly ObstacleVariant[] = [
  'barrier',
  'pillar',
  'vat_long',
  'pool_wide',
  'crate_tall',
  'vat_square',
  'crate_rect',
  'crate_square',
];

export function getObstacleVisual(variant: ObstacleVariant): ObstacleVisual {
  return OBSTACLE_VISUALS[variant];
}
