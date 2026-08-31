import { GameConfig } from '../config/GameConfig';
import type { WeaponId } from '../config/Weapons';
import { Save, type RoverUpgradeLevels, type SaveData } from './Save';

export type RoverUpgradeLine = keyof RoverUpgradeLevels;

export type AppliedRoverStats = {
  maxHp: number;
  speed: number;
  armor: number;
};

/** Purchase and resolve survival upgrade tiers. */
export const Upgrades = {
  getAppliedRover(levels: RoverUpgradeLevels = Save.load().roverUpgrades): AppliedRoverStats {
    const { hp, speed, armor } = GameConfig.roverUpgrades;
    return {
      maxHp: hp.values[clampTier(levels.hp, hp.values.length)] ?? hp.values[0],
      speed: speed.values[clampTier(levels.speed, speed.values.length)] ?? speed.values[0],
      armor: armor.values[clampTier(levels.armor, armor.values.length)] ?? armor.values[0],
    };
  },

  roverNextCost(line: RoverUpgradeLine, levels: RoverUpgradeLevels): number | null {
    const table = GameConfig.roverUpgrades[line];
    const tier = levels[line];
    if (tier >= table.values.length - 1) {
      return null;
    }
    return table.costs[tier] ?? null;
  },

  roverIsMaxed(line: RoverUpgradeLine, levels: RoverUpgradeLevels): boolean {
    return Upgrades.roverNextCost(line, levels) === null;
  },

  purchaseRover(line: RoverUpgradeLine): boolean {
    const data = Save.load();
    const cost = Upgrades.roverNextCost(line, data.roverUpgrades);
    if (cost === null || data.coins < cost) {
      return false;
    }
    data.coins -= cost;
    data.roverUpgrades[line] += 1;
    Save.write(data);
    return true;
  },

  weaponTier(weaponId: WeaponId, data: SaveData = Save.load()): number {
    return data.weaponUpgrades[weaponId] ?? 0;
  },

  weaponNextCost(weaponId: WeaponId, data: SaveData = Save.load()): number | null {
    const tier = Upgrades.weaponTier(weaponId, data);
    if (tier >= GameConfig.weaponUpgradeConfig.maxTier) {
      return null;
    }
    return GameConfig.weaponUpgradeConfig.costs[tier] ?? null;
  },

  purchaseWeapon(weaponId: WeaponId): boolean {
    const data = Save.load();
    const cost = Upgrades.weaponNextCost(weaponId, data);
    if (cost === null || data.coins < cost) {
      return false;
    }
    data.coins -= cost;
    data.weaponUpgrades[weaponId] = Upgrades.weaponTier(weaponId, data) + 1;
    Save.write(data);
    return true;
  },
};

function clampTier(level: number, length: number): number {
  return Math.max(0, Math.min(level, length - 1));
}
