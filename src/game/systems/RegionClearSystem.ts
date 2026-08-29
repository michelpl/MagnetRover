import type { Scene } from 'phaser';
import { ignoreUiCamera } from '../cameras/GameCameras';
import { Audio } from '../audio/Audio';
import { GameConfig } from '../config/GameConfig';
import type { Scrap } from '../entities/Scrap';

/**
 * Fires once when every scrap in a regionId has been processed (US-026).
 */
export class RegionClearSystem {
  private readonly cleared = new Set<number>();
  private readonly regionTotals = new Map<number, number>();
  private readonly regionCenters = new Map<number, { x: number; y: number; count: number }>();

  public constructor(
    private readonly scene: Scene,
    scraps: Scrap[],
  ) {
    for (const scrap of scraps) {
      const id = scrap.regionId;
      this.regionTotals.set(id, (this.regionTotals.get(id) ?? 0) + 1);
      const center = this.regionCenters.get(id) ?? { x: 0, y: 0, count: 0 };
      center.x += scrap.x;
      center.y += scrap.y;
      center.count += 1;
      this.regionCenters.set(id, center);
    }
    for (const [id, center] of this.regionCenters) {
      center.x /= center.count;
      center.y /= center.count;
      this.regionCenters.set(id, center);
    }
  }

  public check(scraps: Scrap[]): void {
    for (const [regionId, total] of this.regionTotals) {
      if (this.cleared.has(regionId) || total <= 0) {
        continue;
      }
      const remaining = scraps.filter((s) => s.regionId === regionId).length;
      if (remaining === 0) {
        this.cleared.add(regionId);
        const center = this.regionCenters.get(regionId);
        if (center) {
          this.celebrate(center.x, center.y);
        }
      }
    }
  }

  private celebrate(x: number, y: number): void {
    Audio.play('clean', 0.45);
    const text = this.scene.add
      .text(x, y, 'Clean!', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '40px',
        color: '#69db7c',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(1500);
    ignoreUiCamera(this.scene, text);

    this.scene.tweens.add({
      targets: text,
      y: y - 60,
      alpha: 0,
      duration: 700,
      ease: 'Quad.easeOut',
      onComplete: () => text.destroy(),
    });

    for (let i = 0; i < 8; i += 1) {
      const spark = this.scene.add.circle(
        x,
        y,
        6,
        GameConfig.colors.processorAccent,
        0.9,
      );
      ignoreUiCamera(this.scene, spark);
      const angle = (Math.PI * 2 * i) / 8;
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * 70,
        y: y + Math.sin(angle) * 70,
        alpha: 0,
        duration: 420,
        onComplete: () => spark.destroy(),
      });
    }
  }
}
