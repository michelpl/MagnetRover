import { GameConfig } from './GameConfig';

export type WeaponId = 'pulse_cannon' | 'arc_turret' | 'orbit_drone' | 'mine_layer';

export type WeaponKind = 'projectile' | 'arc' | 'orbit' | 'mine';

export type WeaponDefinition = {
  id: WeaponId;
  name: string;
  kind: WeaponKind;
  damage: number;
  fireRateMs: number;
  range: number;
  projectileSpeed?: number;
  orbitRadius?: number;
};

const WEAPONS: Record<WeaponId, WeaponDefinition> = {
  pulse_cannon: {
    id: 'pulse_cannon',
    name: 'Pulse Cannon',
    kind: 'projectile',
    damage: 12,
    fireRateMs: 450,
    range: 420,
    projectileSpeed: 520,
  },
  arc_turret: {
    id: 'arc_turret',
    name: 'Arc Turret',
    kind: 'arc',
    damage: 8,
    fireRateMs: 320,
    range: 140,
  },
  orbit_drone: {
    id: 'orbit_drone',
    name: 'Orbit Drone',
    kind: 'orbit',
    damage: 6,
    fireRateMs: 280,
    range: 90,
    orbitRadius: 72,
  },
  mine_layer: {
    id: 'mine_layer',
    name: 'Mine Layer',
    kind: 'mine',
    damage: 24,
    fireRateMs: 1800,
    range: 180,
  },
};

export const WEAPON_IDS: readonly WeaponId[] = [
  'pulse_cannon',
  'arc_turret',
  'orbit_drone',
  'mine_layer',
];

export const DEFAULT_STARTER_WEAPONS: readonly WeaponId[] = ['pulse_cannon', 'arc_turret'];

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
