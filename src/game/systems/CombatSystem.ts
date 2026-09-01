import { GameConfig } from '../config/GameConfig';
import { hullRadius } from '../collision/solidBody';
import type { Enemy } from '../entities/Enemy';
import { spawnHitSpark } from '../entities/HitSparkFx';
import type { Rover } from '../entities/Rover';
import { Audio } from '../audio/Audio';
import { Haptics } from '../audio/Haptics';
import type { HpSystem } from './HpSystem';

export type CombatCallbacks = {
  onEnemyRemoved: (enemy: Enemy) => void;
  onRoverDamaged: () => void;
  onKillShake: () => void;
};

/** Contact overlap, weapon damage, kill tracking. */
export class CombatSystem {
  public killCount = 0;
  public remainingEnemies = 0;

  public constructor(
    private readonly rover: Rover,
    private readonly hp: HpSystem,
    private readonly callbacks: CombatCallbacks,
  ) {}

  public initRemaining(count: number): void {
    this.remainingEnemies = count;
  }

  public addRemaining(count: number): void {
    this.remainingEnemies += count;
  }

  public updateContact(enemies: readonly Enemy[]): void {
    const radius = Math.max(
      GameConfig.survival.contactOverlapRadius,
      hullRadius() * 2,
    );
    for (const enemy of enemies) {
      if (!enemy.active) {
        continue;
      }
      const dist = Math.hypot(enemy.x - this.rover.x, enemy.y - this.rover.y);
      if (dist <= radius) {
        const hit = this.hp.applyDamage(enemy.contactDamage);
        if (hit) {
          this.callbacks.onRoverDamaged();
          Audio.play('hurt');
          Haptics.vibrate(10);
        }
      }
    }
  }

  public applyWeaponDamage(
    enemy: Enemy,
    amount: number,
    sparkX?: number,
    sparkY?: number,
  ): void {
    if (!enemy.active || amount <= 0) {
      return;
    }
    enemy.hp -= amount;
    enemy.flashHit();
    spawnHitSpark(enemy.scene, sparkX ?? enemy.x, sparkY ?? enemy.y);
    Audio.play('hit');
    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  public killEnemy(enemy: Enemy): void {
    if (!enemy.active) {
      return;
    }
    enemy.setActive(false);
    this.killCount += 1;
    this.remainingEnemies = Math.max(0, this.remainingEnemies - 1);
    this.callbacks.onKillShake();
    Audio.play('enemyDeath');
    Haptics.vibrate(8);
    enemy.playDeath(enemy.scene, () => {
      this.callbacks.onEnemyRemoved(enemy);
    });
  }
}
