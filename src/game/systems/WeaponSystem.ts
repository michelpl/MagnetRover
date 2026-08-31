import type { WeaponId } from '../config/Weapons';
import { getWeaponDefinition, scaledWeaponDamage } from '../config/Weapons';
import type { Enemy } from '../entities/Enemy';
import type { MineField } from '../entities/Projectile';
import { ProjectilePool, spawnMine, updateMines } from '../entities/Projectile';
import type { Rover } from '../entities/Rover';
import { Audio } from '../audio/Audio';
import type { CombatSystem } from './CombatSystem';
import { GameObjects, Geom, Scene } from 'phaser';

type WeaponSlot = {
  id: WeaponId;
  cooldownMs: number;
  orbitAngle: number;
};

/** Auto-fire up to four equipped weapons on independent cooldowns when targets are in range. */
export class WeaponSystem {
  private readonly slots: WeaponSlot[] = [];
  private readonly projectilePool: ProjectilePool;
  private readonly mines: MineField[] = [];
  private muzzleFlashMs = 0;
  private readonly muzzleGfx: GameObjects.Arc;

  public constructor(
    private readonly scene: Scene,
    private readonly rover: Rover,
    private readonly combat: CombatSystem,
    loadout: readonly (WeaponId | null)[],
    weaponTiers: Readonly<Partial<Record<WeaponId, number>>>,
    obstacleRects: readonly Geom.Rectangle[],
  ) {
    this.projectilePool = new ProjectilePool(scene, obstacleRects);
    this.muzzleGfx = scene.add.circle(0, 0, 10, 0xfff3bf, 0.9);
    this.muzzleGfx.setDepth(600);
    this.muzzleGfx.setVisible(false);

    for (const id of loadout) {
      if (id && this.slots.length < 4) {
        this.slots.push({ id, cooldownMs: 0, orbitAngle: 0 });
      }
    }

    for (const slot of this.slots) {
      const def = getWeaponDefinition(slot.id);
      slot.cooldownMs = def.fireRateMs * 0.5;
      void weaponTiers;
    }
  }

  public update(
    delta: number,
    enemies: readonly Enemy[],
    mapWidth: number,
    mapHeight: number,
    weaponTiers: Readonly<Partial<Record<WeaponId, number>>>,
  ): void {
    if (this.muzzleFlashMs > 0) {
      this.muzzleFlashMs = Math.max(0, this.muzzleFlashMs - delta);
      this.muzzleGfx.setVisible(this.muzzleFlashMs > 0);
    }

    for (const slot of this.slots) {
      slot.cooldownMs -= delta;
      if (slot.cooldownMs > 0) {
        continue;
      }
      const def = getWeaponDefinition(slot.id);
      if (!this.hasEnemyInRange(def.range, enemies)) {
        slot.cooldownMs = 0;
        continue;
      }
      const tier = weaponTiers[slot.id] ?? 0;
      const damage = scaledWeaponDamage(slot.id, tier);
      slot.cooldownMs = def.fireRateMs;
      this.fireWeapon(slot, def.kind, damage, def, enemies);
      Audio.play('fire');
      this.muzzleFlashMs = 80;
      this.muzzleGfx.setPosition(this.rover.x, this.rover.y - 20);
      this.muzzleGfx.setVisible(true);
    }

    const enemySnapshots = enemies.map((e, index) => ({
      x: e.x,
      y: e.y,
      index,
      active: e.active,
    }));

    this.projectilePool.update(
      delta,
      mapWidth,
      mapHeight,
      (proj, enemyIndex) => {
        const enemy = enemies[enemyIndex];
        if (!enemy?.active) {
          return false;
        }
        this.combat.applyWeaponDamage(enemy, proj.damage);
        return true;
      },
      enemies.map((e) => ({ x: e.x, y: e.y, active: e.active })),
    );

    updateMines(this.mines, delta, enemySnapshots, (mine, enemyIndex) => {
      const enemy = enemies[enemyIndex];
      if (enemy?.active) {
        this.combat.applyWeaponDamage(enemy, mine.damage);
      }
    });
  }

  public dispose(): void {
    this.projectilePool.releaseAll();
    for (const mine of this.mines) {
      mine.gfx.destroy();
    }
    this.mines.length = 0;
    this.muzzleGfx.destroy();
  }

  private hasEnemyInRange(range: number, enemies: readonly Enemy[]): boolean {
    for (const enemy of enemies) {
      if (!enemy.active) {
        continue;
      }
      const dist = Math.hypot(enemy.x - this.rover.x, enemy.y - this.rover.y);
      if (dist <= range) {
        return true;
      }
    }
    return false;
  }

  private fireWeapon(
    _slot: WeaponSlot,
    kind: ReturnType<typeof getWeaponDefinition>['kind'],
    damage: number,
    def: ReturnType<typeof getWeaponDefinition>,
    enemies: readonly Enemy[],
  ): void {
    switch (kind) {
      case 'projectile': {
        this.projectilePool.spawn(
          this.rover.x,
          this.rover.y,
          this.rover.rotation,
          def.projectileSpeed ?? 520,
          damage,
          def.range,
        );
        break;
      }
      case 'arc': {
        let nearest: Enemy | null = null;
        let best = def.range;
        for (const enemy of enemies) {
          if (!enemy.active) {
            continue;
          }
          const dist = Math.hypot(enemy.x - this.rover.x, enemy.y - this.rover.y);
          if (dist <= best) {
            best = dist;
            nearest = enemy;
          }
        }
        if (nearest) {
          this.combat.applyWeaponDamage(nearest, damage);
        }
        break;
      }
      case 'mine': {
        const angle = Math.random() * Math.PI * 2;
        const dist = def.range * 0.5;
        const mx = this.rover.x + Math.sin(angle) * dist;
        const my = this.rover.y - Math.cos(angle) * dist;
        this.mines.push(spawnMine(this.scene, mx, my, damage));
        break;
      }
      case 'orbit': {
        const def = getWeaponDefinition(_slot.id);
        const radius = def.orbitRadius ?? 72;
        const ox = this.rover.x + Math.cos(_slot.orbitAngle) * radius;
        const oy = this.rover.y + Math.sin(_slot.orbitAngle) * radius;
        _slot.orbitAngle += 0.4;
        for (const enemy of enemies) {
          if (!enemy.active) {
            continue;
          }
          if (Math.hypot(enemy.x - ox, enemy.y - oy) <= 24) {
            this.combat.applyWeaponDamage(enemy, damage);
          }
        }
        break;
      }
      default: {
        const _exhaustive: never = kind;
        return _exhaustive;
      }
    }
  }
}
