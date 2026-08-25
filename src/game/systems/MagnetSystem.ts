import { GameObjects } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { Rover } from '../entities/Rover';
import type { Scrap } from '../entities/Scrap';
import type { CargoSystem } from './CargoSystem';

/**
 * Pulls Idle scraps into Attracted when inside magnetRadius of the rear anchor,
 * then interpolates them toward the magnet or cargo queue tip.
 */
export class MagnetSystem {
  private readonly radiusGraphics: GameObjects.Graphics;
  private canAttractFn: () => boolean = () => true;

  public constructor(
    private readonly rover: Rover,
    private readonly scraps: Scrap[],
    private readonly cargo: CargoSystem,
  ) {
    this.radiusGraphics = rover.scene.add.graphics();
    this.radiusGraphics.setDepth(this.rover.depth - 1);
  }

  /** Hook for capacity (US-011). When false, Idle scraps are not pulled. */
  public setCanAttract(fn: () => boolean): void {
    this.canAttractFn = fn;
  }

  public update(delta: number): void {
    const magnet = this.rover.getMagnetWorldPosition();
    this.drawRadius(magnet.x, magnet.y);

    const tip = this.cargo.getQueueTip(magnet);
    const { magnetRadius, attractionSpeed } = GameConfig.magnet;
    const radiusSq = magnetRadius * magnetRadius;
    const t = 1 - Math.pow(1 - attractionSpeed, delta / 16.6667);

    for (const scrap of this.scraps) {
      if (scrap.state === 'Idle') {
        if (!this.canAttractFn()) {
          continue;
        }
        const dx = scrap.x - magnet.x;
        const dy = scrap.y - magnet.y;
        if (dx * dx + dy * dy <= radiusSq) {
          scrap.state = 'Attracted';
        }
      }

      if (scrap.state === 'Attracted') {
        scrap.x += (tip.x - scrap.x) * t;
        scrap.y += (tip.y - scrap.y) * t;
      }
    }
  }

  private drawRadius(x: number, y: number): void {
    const { magnetRadius, radiusAlpha } = GameConfig.magnet;
    const { magnetGlow } = GameConfig.colors;

    this.radiusGraphics.clear();
    this.radiusGraphics.lineStyle(2, magnetGlow, radiusAlpha);
    this.radiusGraphics.strokeCircle(x, y, magnetRadius);
    this.radiusGraphics.fillStyle(magnetGlow, radiusAlpha * 0.35);
    this.radiusGraphics.fillCircle(x, y, magnetRadius);
  }
}
