import type { WeaponId } from '../config/Weapons';
import { getWeaponDefinition, scaledLaserFireRateMs, scaledWeaponDamage } from '../config/Weapons';
import { pickNearestTargetableEnemy } from '../combat/targeting';
import { GameConfig } from '../config/GameConfig';
import type { Enemy } from '../entities/Enemy';
import { ensureLaserGlowTexture } from '../entities/laserGlowTexture';
import { ProjectilePool } from '../entities/Projectile';
import type { Rover } from '../entities/Rover';
import { Audio } from '../audio/Audio';
import type { CombatSystem } from './CombatSystem';
import { BlendModes, GameObjects, Geom, Scene } from 'phaser';

type WeaponSlot = {
  id: WeaponId;
  cooldownMs: number;
  burstRemaining: number;
  burstCooldownMs: number;
};

/** Auto-fires the laser cannon: one glow bolt aimed at the nearest enemy in the forward cone. */
export class WeaponSystem {
  private readonly slots: WeaponSlot[] = [];
  private readonly projectilePool: ProjectilePool;
  private muzzleFlashMs = 0;
  private readonly muzzleGfx: GameObjects.Image;

  public constructor(
    private readonly scene: Scene,
    private readonly rover: Rover,
    private readonly combat: CombatSystem,
    loadout: readonly (WeaponId | null)[],
    weaponTiers: Readonly<Partial<Record<WeaponId, number>>>,
    laserCadenceTier: number,
    obstacleRects: readonly Geom.Rectangle[],
  ) {
    this.projectilePool = new ProjectilePool(scene, obstacleRects);
    const glowKey = ensureLaserGlowTexture(scene);
    this.muzzleGfx = scene.add.image(0, 0, glowKey);
    this.muzzleGfx.setDisplaySize(
      GameConfig.survival.laserGlow.muzzleSize,
      GameConfig.survival.laserGlow.muzzleSize,
    );
    this.muzzleGfx.setBlendMode(BlendModes.ADD);
    this.muzzleGfx.setDepth(600);
    this.muzzleGfx.setVisible(false);

    for (const id of loadout) {
      if (id && this.slots.length < 1) {
        this.slots.push({ id, cooldownMs: 0, burstRemaining: 0, burstCooldownMs: 0 });
      }
    }
    if (this.slots.length === 0) {
      this.slots.push({
        id: 'laser_cannon',
        cooldownMs: 0,
        burstRemaining: 0,
        burstCooldownMs: 0,
      });
    }

    for (const slot of this.slots) {
      slot.cooldownMs = scaledLaserFireRateMs(laserCadenceTier) * 0.5;
      void weaponTiers;
    }
  }

  public update(
    delta: number,
    enemies: readonly Enemy[],
    mapWidth: number,
    mapHeight: number,
    weaponTiers: Readonly<Partial<Record<WeaponId, number>>>,
    laserCadenceTier: number,
  ): void {
    if (this.muzzleFlashMs > 0) {
      this.muzzleFlashMs = Math.max(0, this.muzzleFlashMs - delta);
      this.muzzleGfx.setVisible(this.muzzleFlashMs > 0);
    }

    const camera = this.scene.cameras.main;
    const { fireConeDeg } = GameConfig.survival;
    const aimTarget = pickNearestTargetableEnemy(
      this.rover,
      enemies,
      camera,
      getWeaponDefinition(this.slots[0]?.id ?? 'laser_cannon').range,
      fireConeDeg,
    );
    this.rover.getCannon().aimAtWorldAngle(
      aimTarget
        ? Math.atan2(aimTarget.x - this.rover.x, -(aimTarget.y - this.rover.y))
        : null,
      this.rover.rotation,
      delta,
    );

    for (const slot of this.slots) {
      const def = getWeaponDefinition(slot.id);
      const tier = weaponTiers[slot.id] ?? 0;
      const damage = scaledWeaponDamage(slot.id, tier);

      if (slot.burstRemaining > 0) {
        slot.burstCooldownMs -= delta;
        if (slot.burstCooldownMs <= 0) {
          const midBurst = pickNearestTargetableEnemy(
            this.rover,
            enemies,
            camera,
            def.range,
            fireConeDeg,
          );
          if (midBurst) {
            this.fireLaser(def, damage, midBurst);
            slot.burstRemaining -= 1;
            slot.burstCooldownMs = def.burstIntervalMs;
          } else {
            slot.burstRemaining = 0;
          }
        }
      }

      slot.cooldownMs -= delta;
      if (slot.cooldownMs > 0) {
        continue;
      }
      const target = pickNearestTargetableEnemy(
        this.rover,
        enemies,
        camera,
        def.range,
        fireConeDeg,
      );
      if (!target) {
        slot.cooldownMs = 0;
        continue;
      }
      this.fireLaser(def, damage, target);
      slot.cooldownMs = scaledLaserFireRateMs(laserCadenceTier);
      slot.burstRemaining = Math.max(0, def.burstCount - 1);
      slot.burstCooldownMs = def.burstIntervalMs;
    }

    this.projectilePool.update(
      delta,
      mapWidth,
      mapHeight,
      (proj, enemyIndex) => {
        const enemy = enemies[enemyIndex];
        if (!enemy?.active) {
          return false;
        }
        this.combat.applyWeaponDamage(enemy, proj.damage, proj.x, proj.y);
        return true;
      },
      enemies.map((e) => ({ x: e.x, y: e.y, active: e.active })),
    );
  }

  public dispose(): void {
    this.projectilePool.releaseAll();
    this.muzzleGfx.destroy();
  }

  private fireLaser(
    def: ReturnType<typeof getWeaponDefinition>,
    damage: number,
    target: Enemy,
  ): void {
    const muzzle = this.muzzlePoint();
    const aim = Math.atan2(target.x - muzzle.x, -(target.y - muzzle.y));
    this.projectilePool.spawn(
      muzzle.x,
      muzzle.y,
      aim,
      def.projectileSpeed,
      damage,
      def.range,
    );
    Audio.play('fire');
    this.muzzleFlashMs = GameConfig.survival.muzzleFlashMs;
    this.muzzleGfx.setPosition(muzzle.x, muzzle.y);
    this.muzzleGfx.setVisible(true);
  }

  private muzzlePoint(): { x: number; y: number } {
    return this.rover.getCannon().getMuzzleWorldPosition();
  }
}
