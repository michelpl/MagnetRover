import { GameConfig } from '../config/GameConfig';
import type { RoverBalanceStats } from './roverStats';

/** Real players weave more than a greedy collector. */
export const PLAYER_INEFFICIENCY = 1.05;

export const MAX_PICKUPS = 4;
export const TOO_EASY_SLACK = 0.08;
export const MIN_UPGRADE_GAP = 0.03;

export function leftoverRatio(
  pathPx: number,
  stats: RoverBalanceStats,
  _scrapCount: number,
  pickupCount: number,
): number {
  const { movementEnergyCost, pickupBonusRatio } = GameConfig.energy;
  const energySpent = ((pathPx * PLAYER_INEFFICIENCY) / stats.speed) * movementEnergyCost;
  const energyGained = stats.battery + pickupCount * pickupBonusRatio * stats.battery;
  return stats.battery <= 0 ? 0 : (energyGained - energySpent) / stats.battery;
}
