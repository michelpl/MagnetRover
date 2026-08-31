import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

type ActiveProjectile = {
  gfx: GameObjects.Arc;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  lifeMs: number;
  active: boolean;
};

/** Pooled forward projectiles — no physics plugin. */
export class ProjectilePool {
  private readonly pool: ActiveProjectile[] = [];
  private readonly obstacleRects: Geom.Rectangle[];

  public constructor(
    scene: Scene,
    obstacleRects: readonly Geom.Rectangle[],
  ) {
    this.obstacleRects = [...obstacleRects];
    const size = GameConfig.survival.projectilePoolSize;
    for (let i = 0; i < size; i += 1) {
      const gfx = scene.add.circle(0, 0, 6, 0x74c0fc, 1);
      gfx.setVisible(false);
      gfx.setDepth(500);
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
  }

  public update(
    delta: number,
    mapWidth: number,
    mapHeight: number,
    onHit: (proj: ActiveProjectile, enemyIndex: number) => boolean,
    enemies: readonly { x: number; y: number; active: boolean }[],
  ): void {
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
        if (dist <= 22 && onHit(proj, i)) {
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

export type MineField = {
  x: number;
  y: number;
  radius: number;
  damage: number;
  lifeMs: number;
  gfx: GameObjects.Arc;
};

export function spawnMine(
  scene: Scene,
  x: number,
  y: number,
  damage: number,
): MineField {
  const gfx = scene.add.circle(x, y, 14, 0xff922b, 0.85);
  gfx.setDepth(400);
  return { x, y, radius: 28, damage, lifeMs: 8000, gfx };
}

export function updateMines(
  mines: MineField[],
  delta: number,
  enemies: readonly { x: number; y: number; index: number; active: boolean }[],
  onDetonate: (mine: MineField, enemyIndex: number) => void,
): void {
  for (let m = mines.length - 1; m >= 0; m -= 1) {
    const mine = mines[m];
    if (!mine) {
      continue;
    }
    mine.lifeMs -= delta;
    if (mine.lifeMs <= 0) {
      mine.gfx.destroy();
      mines.splice(m, 1);
      continue;
    }
    for (const enemy of enemies) {
      if (!enemy.active) {
        continue;
      }
      if (Math.hypot(enemy.x - mine.x, enemy.y - mine.y) <= mine.radius) {
        onDetonate(mine, enemy.index);
        mine.gfx.destroy();
        mines.splice(m, 1);
        break;
      }
    }
  }
}
