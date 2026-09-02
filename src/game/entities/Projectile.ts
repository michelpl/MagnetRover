import { BlendModes, GameObjects, Geom, Scene } from 'phaser';
import { ignoreUiCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { ensureLaserGlowTexture } from './laserGlowTexture';

type ActiveProjectile = {
  gfx: GameObjects.Image;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  lifeMs: number;
  active: boolean;
};

/** Pooled laser bolts — radial glow texture, no physics plugin. */
export class ProjectilePool {
  private readonly pool: ActiveProjectile[] = [];
  private readonly obstacleRects: Geom.Rectangle[];

  public constructor(
    scene: Scene,
    obstacleRects: readonly Geom.Rectangle[],
  ) {
    this.obstacleRects = [...obstacleRects];
    const key = ensureLaserGlowTexture(scene);
    const { projectilePoolSize, laserGlow } = GameConfig.survival;
    for (let i = 0; i < projectilePoolSize; i += 1) {
      const gfx = scene.add.image(0, 0, key);
      gfx.setDisplaySize(laserGlow.boltWidth, laserGlow.boltHeight);
      gfx.setBlendMode(BlendModes.ADD);
      gfx.setVisible(false);
      gfx.setDepth(500);
      ignoreUiCamera(scene, gfx);
      this.pool.push({ gfx, x: 0, y: 0, vx: 0, vy: 0, damage: 0, lifeMs: 0, active: false });
    }
  }

  public spawn(
    x: number,
    y: number,
    angle: number,
    speed: number,
    damage: number,
    range: number,
  ): void {
    const slot = this.pool.find((p) => !p.active);
    if (!slot) {
      return;
    }
    slot.active = true;
    slot.x = x;
    slot.y = y;
    slot.vx = Math.sin(angle) * speed;
    slot.vy = -Math.cos(angle) * speed;
    slot.damage = damage;
    slot.lifeMs = (range / speed) * 1000;
    slot.gfx.setVisible(true);
    slot.gfx.setPosition(x, y);
    slot.gfx.setRotation(Math.atan2(slot.vy, slot.vx));
  }

  public update(
    delta: number,
    mapWidth: number,
    mapHeight: number,
    onHit: (proj: ActiveProjectile, enemyIndex: number) => boolean,
    enemies: readonly { x: number; y: number; active: boolean }[],
  ): void {
    const hitRadius = GameConfig.survival.laserHitRadius;
    for (const proj of this.pool) {
      if (!proj.active) {
        continue;
      }
      proj.lifeMs -= delta;
      if (proj.lifeMs <= 0) {
        this.release(proj);
        continue;
      }
      proj.x += (proj.vx * delta) / 1000;
      proj.y += (proj.vy * delta) / 1000;
      proj.gfx.setPosition(proj.x, proj.y);

      const inset = GameConfig.map.wallInset;
      if (
        proj.x < inset ||
        proj.x > mapWidth - inset ||
        proj.y < inset ||
        proj.y > mapHeight - inset
      ) {
        this.release(proj);
        continue;
      }

      if (this.hitsObstacle(proj.x, proj.y)) {
        this.release(proj);
        continue;
      }

      for (let i = 0; i < enemies.length; i += 1) {
        const enemy = enemies[i];
        if (!enemy?.active) {
          continue;
        }
        const dist = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
        if (dist <= hitRadius && onHit(proj, i)) {
          this.release(proj);
          break;
        }
      }
    }
  }

  public releaseAll(): void {
    for (const proj of this.pool) {
      this.release(proj);
    }
  }

  private release(proj: ActiveProjectile): void {
    proj.active = false;
    proj.gfx.setVisible(false);
  }

  private hitsObstacle(x: number, y: number): boolean {
    for (const rect of this.obstacleRects) {
      if (rect.contains(x, y)) {
        return true;
      }
    }
    return false;
  }
}
