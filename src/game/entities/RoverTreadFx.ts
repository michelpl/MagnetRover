import { BlendModes, GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Procedural tread highlight that scrolls with rover speed (US-162).
 * Local −Y is hull front. Parent layer is counter-rotated; callers set this
 * object's rotation to `roverFrameToAngle(frame)` so the glow matches the baked hull.
 */
export class RoverTreadFx extends GameObjects.Graphics {
  private treadPhase = 0;
  private displayAlpha = 0;

  public constructor(scene: Scene) {
    super(scene);
    this.setBlendMode(BlendModes.ADD);
  }

  public updateFx(speed: number, maxSpeed: number, delta: number): void {
    const { moveEpsilon, tread } = GameConfig.rover;
    const dt = delta / 1000;
    const moving = speed > moveEpsilon;
    const targetAlpha = moving
      ? Math.min(1, speed / Math.max(maxSpeed, 1)) * tread.maxAlpha
      : 0;

    const fadeT = 1 - Math.pow(1 - tread.fadeSmoothing, delta / 16.6667);
    this.displayAlpha = moving
      ? PhaserMath.Linear(this.displayAlpha, targetAlpha, fadeT)
      : 0;

    if (moving) {
      const next = this.treadPhase - speed * tread.scrollRate * dt;
      this.treadPhase = ((next % 1) + 1) % 1;
    }

    this.clear();
    if (!moving || this.displayAlpha < 0.01) {
      return;
    }

    const {
      offsetX,
      offsetY,
      length,
      width,
      segmentCount,
      segmentLength,
      glowColor,
    } = tread;
    const halfLen = length / 2;
    const travel = Math.max(0, length - segmentLength);
    const corner = Math.min(width / 2, segmentLength / 2);

    for (const side of [-1, 1] as const) {
      const centerX = side * offsetX;
      for (let i = 0; i < segmentCount; i++) {
        const t = (this.treadPhase + i / segmentCount) % 1;
        const y = offsetY + PhaserMath.Linear(-travel / 2, travel / 2, t);
        const top = Math.max(offsetY - halfLen, y - segmentLength / 2);
        const bottom = Math.min(offsetY + halfLen, y + segmentLength / 2);
        const h = bottom - top;
        if (h < 1) {
          continue;
        }
        this.fillStyle(glowColor, this.displayAlpha);
        this.fillRoundedRect(centerX - width / 2, top, width, h, corner);
      }
    }
  }
}
