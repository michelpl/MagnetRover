import { GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

type DustPuff = {
  x: number;
  y: number;
  radius: number;
  ageMs: number;
};

type DustKind = 'player' | 'enemy';

type DustConfig = {
  spacingPx: number;
  maxPuffs: number;
  lifeMs: number;
  sizeMin: number;
  sizeMax: number;
  color: number;
  maxAlpha: number;
  spread: number;
  rearOffsetY: number;
  trackOffsetX: number;
  extraPuffs: number;
};

/** World-space dust puffs left behind moving rovers. */
export class DustTrailFx extends GameObjects.Graphics {
  private readonly puffs: DustPuff[] = [];
  private travelAcc = 0;
  private readonly kind: DustKind;

  public constructor(scene: Scene, kind: DustKind = 'player') {
    super(scene);
    this.kind = kind;
    scene.add.existing(this);
    this.setDepth(-1);
  }

  public updateTrail(
    originX: number,
    originY: number,
    rotation: number,
    speed: number,
    delta: number,
  ): void {
    const { moveEpsilon } = GameConfig.rover;
    const dust = this.dustConfig();
    const moving = speed > moveEpsilon;
    const dt = delta / 1000;

    if (moving) {
      this.travelAcc += speed * dt;
      const spacing = Math.max(dust.spacingPx, 1);
      while (this.travelAcc >= spacing) {
        this.travelAcc -= spacing;
        this.spawnPuffs(originX, originY, rotation);
      }
    } else {
      this.travelAcc = 0;
    }

    for (let i = this.puffs.length - 1; i >= 0; i -= 1) {
      const puff = this.puffs[i];
      puff.ageMs += delta;
      if (puff.ageMs >= dust.lifeMs) {
        this.puffs.splice(i, 1);
      }
    }

    this.redraw();
  }

  private dustConfig(): DustConfig {
    return this.kind === 'player' ? GameConfig.rover.dust : GameConfig.rover.enemyDust;
  }

  private spawnPuffs(originX: number, originY: number, rotation: number): void {
    const dust = this.dustConfig();
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const sides: readonly number[] = [-1, 1];
    const extra = dust.extraPuffs;
    const count = sides.length + extra;
    for (let i = 0; i < count; i += 1) {
      if (this.puffs.length >= dust.maxPuffs) {
        this.puffs.shift();
      }
      const side = i < 2 ? (sides[i] ?? 1) : PhaserMath.FloatBetween(-1, 1);
      const spread = i < 2 ? dust.spread : dust.spread * 1.6;
      const localX = side * dust.trackOffsetX + PhaserMath.FloatBetween(-spread, spread);
      const localY = dust.rearOffsetY + PhaserMath.FloatBetween(-spread, spread);
      this.puffs.push({
        x: originX + localX * cos - localY * sin,
        y: originY + localX * sin + localY * cos,
        radius: PhaserMath.FloatBetween(dust.sizeMin, dust.sizeMax),
        ageMs: 0,
      });
    }
  }

  private redraw(): void {
    const dust = this.dustConfig();
    this.clear();
    for (const puff of this.puffs) {
      const t = 1 - puff.ageMs / dust.lifeMs;
      const alpha = dust.maxAlpha * t * t;
      if (alpha < 0.01) {
        continue;
      }
      this.fillStyle(dust.color, alpha);
      this.fillCircle(puff.x, puff.y, puff.radius * (0.7 + 0.5 * (1 - t)));
    }
  }
}
