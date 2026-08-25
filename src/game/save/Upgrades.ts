import { GameConfig } from '../config/GameConfig';
import { Save, type SaveData, type UpgradeLevels } from './Save';

export type UpgradeLine = keyof UpgradeLevels;

export type AppliedUpgrades = {
  capacity: number;
  magnetRadius: number;
  speed: number;
};

/** Purchase and resolve upgrade tiers (US-030). */
export const Upgrades = {
  isEnabled(): boolean {
    return GameConfig.upgrades.enabled;
  },

  getApplied(levels: UpgradeLevels = Save.load().upgrades): AppliedUpgrades {
    const { capacity, magnetRadius, speed } = GameConfig.upgrades;
    return {
      capacity: capacity.values[clampTier(levels.capacity, capacity.values.length)] ?? capacity.values[0],
      magnetRadius:
        magnetRadius.values[clampTier(levels.magnetRadius, magnetRadius.values.length)] ??
        magnetRadius.values[0],
      speed: speed.values[clampTier(levels.speed, speed.values.length)] ?? speed.values[0],
    };
  },

  nextCost(line: UpgradeLine, levels: UpgradeLevels): number | null {
    const table = GameConfig.upgrades[line];
    const tier = levels[line];
    if (tier >= table.values.length - 1) {
      return null;
    }
    return table.costs[tier] ?? null;
  },

  /** Returns false if unaffordable, maxed, or upgrades disabled. */
  purchase(line: UpgradeLine): boolean {
    if (!Upgrades.isEnabled()) {
      return false;
    }
    const data = Save.load();
    const cost = Upgrades.nextCost(line, data.upgrades);
    if (cost === null || data.coins < cost) {
      return false;
    }
    data.coins -= cost;
    data.upgrades[line] += 1;
    Save.write(data);
    return true;
  },

  addCoins(amount: number): SaveData {
    return Save.update((data) => {
      data.coins += amount;
    });
  },
};

function clampTier(level: number, length: number): number {
  return Math.max(0, Math.min(level, length - 1));
}
