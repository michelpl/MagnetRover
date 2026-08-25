import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Top-of-screen energy fill bar (camera-fixed). */
export class EnergyBar {
  private readonly root: GameObjects.Container;
  private readonly fill: GameObjects.Rectangle;

  public constructor(scene: Scene) {
    const { barWidth, barHeight, marginTop, marginX } = GameConfig.hud;
    const x = marginX;
    const y = marginTop;

    const bg = scene.add.rectangle(0, 0, barWidth, barHeight, 0x212529, 0.85).setOrigin(0, 0);
    this.fill = scene.add
      .rectangle(0, 0, barWidth, barHeight, GameConfig.colors.roverAccent, 1)
      .setOrigin(0, 0);

    const label = scene.add
      .text(0, -22, 'ENERGY', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#ced4da',
      })
      .setOrigin(0, 0);

    this.root = scene.add.container(x, y, [bg, this.fill, label]);
    this.root.setScrollFactor(0);
    this.root.setDepth(2000);
  }

  public setRatio(ratio: number): void {
    const clamped = Math.max(0, Math.min(1, ratio));
    this.fill.width = GameConfig.hud.barWidth * clamped;
    this.fill.fillColor = clamped < 0.25 ? 0xfa5252 : GameConfig.colors.roverAccent;
  }
}
