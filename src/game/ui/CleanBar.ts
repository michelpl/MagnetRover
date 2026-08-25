import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Cleanup percentage bar under energy (camera-fixed). */
export class CleanBar {
  private readonly root: GameObjects.Container;
  private readonly fill: GameObjects.Rectangle;
  private readonly percentText: GameObjects.Text;

  public constructor(scene: Scene) {
    const { barWidth, barHeight, marginTop, marginX, barGap } = GameConfig.hud;
    const x = marginX;
    const y = marginTop + barHeight + barGap + 28;

    const bg = scene.add.rectangle(0, 0, barWidth, barHeight, 0x212529, 0.85).setOrigin(0, 0);
    this.fill = scene.add
      .rectangle(0, 0, 0, barHeight, GameConfig.colors.processorAccent, 1)
      .setOrigin(0, 0);

    const label = scene.add
      .text(0, -22, 'CLEAN', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ced4da',
      })
      .setOrigin(0, 0);

    this.percentText = scene.add
      .text(barWidth, -22, '0%', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ffd43b',
      })
      .setOrigin(1, 0);

    this.root = scene.add.container(x, y, [bg, this.fill, label, this.percentText]);
    this.root.setScrollFactor(0);
    this.root.setDepth(2000);
  }

  public setRatio(ratio: number): void {
    const clamped = Math.max(0, Math.min(1, ratio));
    this.fill.width = GameConfig.hud.barWidth * clamped;
    this.percentText.setText(`${Math.floor(clamped * 100)}%`);
  }
}
