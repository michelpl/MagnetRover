import { GameConfig } from './GameConfig';

export type WeaponId = 'laser_cannon';

export type WeaponKind = 'laser';

export type WeaponDefinition = {
  id: WeaponId;
  name: string;
  kind: WeaponKind;
  damage: number;
  fireRateMs: number;
  range: number;
  projectileSpeed: number;
  burstCount: number;
  burstIntervalMs: number;
};

const WEAPONS: Record<WeaponId, WeaponDefinition> = {
  laser_cannon: {
    id: 'laser_cannon',
    name: 'Laser Cannon',
    kind: 'laser',
    damage: 10,
    fireRateMs: 420,
    range: 460,
    projectileSpeed: 740,
    burstCount: 1,
    burstIntervalMs: 50,
  },
};

export const WEAPON_IDS: readonly WeaponId[] = ['laser_cannon'];

export const DEFAULT_STARTER_WEAPONS: readonly WeaponId[] = ['laser_cannon'];

export const WEAPON_UNLOCK_ORDER: readonly WeaponId[] = WEAPON_IDS;

export function getWeaponDefinition(id: WeaponId): WeaponDefinition {
  const def = WEAPONS[id];
  if (!def) {
    throw new Error(`Unknown weapon id: ${id}`);
  }
  const mult = GameConfig.survival.weaponDamageMultiplier;
  return {
    ...def,
    damage: Math.round(def.damage * mult),
  };
}

export function scaledWeaponDamage(id: WeaponId, tier: number): number {
  const base = getWeaponDefinition(id).damage;
  const bonus = tier * GameConfig.survival.weaponUpgradeDamagePerTier;
  return base + bonus;
}

export function scaledLaserFireRateMs(tier: number): number {
  const { values } = GameConfig.laserCadence;
  const index = Math.max(0, Math.min(tier, values.length - 1));
  return values[index] ?? values[0] ?? 420;
}
