import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Compact carried/capacity readout (camera-fixed, top-right). */
export class CargoIndicator {
  private readonly text: GameObjects.Text;

  public constructor(scene: Scene) {
    const { marginX, marginTop } = GameConfig.hud;
    this.text = scene.add
      .text(GameConfig.viewport.width - marginX, marginTop, '0 / 20', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(2000);
  }

  public setCargo(carried: number, capacity: number): void {
    this.text.setText(`${carried} / ${capacity}`);
    this.text.setColor(carried >= capacity ? '#ffd43b' : '#ffffff');
  }
}
