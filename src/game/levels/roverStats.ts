import { GameConfig } from '../config/GameConfig';
import type { UpgradeLevels } from '../save/Save';

export type RoverBalanceStats = {
  capacity: number;
  battery: number;
  speed: number;
  magnetRadius: number;
};

/** Resolve recipe tiers against GameConfig tables — never reads Save. */
export function roverStatsFromTiers(tiers: UpgradeLevels): RoverBalanceStats {
  const { capacity, battery, magnetRadius, speed } = GameConfig.upgrades;
  return {
    capacity: atTier(capacity.values, tiers.capacity),
    battery: atTier(battery.values, tiers.battery),
    magnetRadius: atTier(magnetRadius.values, tiers.magnetRadius),
    speed: atTier(speed.values, tiers.speed),
  };
}

function atTier(values: readonly number[], tier: number): number {
  const index = Math.max(0, Math.min(tier, values.length - 1));
  return values[index] ?? values[0] ?? 0;
}
