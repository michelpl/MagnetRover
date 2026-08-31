import { GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { EnemyRecipe } from '../config/StageConfig';

/** Hostile rover placeholder — arcade chase toward the player. */
export class Enemy extends GameObjects.Container {
  public hp: number;
  public readonly maxHp: number;
  public readonly contactDamage: number;
  private readonly speed: number;
  private hitFlashMs = 0;
  private readonly hull: GameObjects.Sprite;

  public constructor(scene: Scene, x: number, y: number, recipe: EnemyRecipe) {
    super(scene, x, y);
    this.maxHp = recipe.hp;
    this.hp = recipe.hp;
    this.speed = recipe.speed;
    this.contactDamage = recipe.contactDamage;

    const display = Math.max(GameConfig.rover.bodyWidth, GameConfig.rover.bodyHeight);
    this.hull = new GameObjects.Sprite(scene, 0, 0, 'rover', 4);
    this.hull.setDisplaySize(display, display);
    this.hull.setTint(0xff6b6b);
    this.add(this.hull);
    scene.add.existing(this);
  }

  public updateChase(
    delta: number,
    targetX: number,
    targetY: number,
    mapWidth: number,
    mapHeight: number,
  ): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 4) {
      const step = (this.speed * delta) / 1000;
      const nx = dx / dist;
      const ny = dy / dist;
      this.x += nx * step;
      this.y += ny * step;
      this.rotation = PhaserMath.Angle.RotateTo(
        this.rotation,
        Math.atan2(nx, -ny),
        GameConfig.rover.rotationSmoothing,
      );
    }
    this.clampToMap(mapWidth, mapHeight);

    if (this.hitFlashMs > 0) {
      this.hitFlashMs = Math.max(0, this.hitFlashMs - delta);
      this.hull.setTint(this.hitFlashMs > 0 ? 0xffffff : 0xff6b6b);
    }
  }

  public flashHit(): void {
    this.hitFlashMs = GameConfig.survival.hitFlashMs;
    this.hull.setTint(0xffffff);
  }

  public playDeath(scene: Scene, onComplete: () => void): void {
    scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 0.4,
      scaleY: 0.4,
      duration: 180,
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  private clampToMap(mapWidth: number, mapHeight: number): void {
    const inset = GameConfig.map.wallInset;
    this.x = PhaserMath.Clamp(this.x, inset, mapWidth - inset);
    this.y = PhaserMath.Clamp(this.y, inset, mapHeight - inset);
  }
}
