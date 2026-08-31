import { GameObjects, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

/** Compact carried/capacity readout (camera-fixed, top-right). */
export class CargoIndicator {
  private readonly text: GameObjects.Text;

  public constructor(scene: Scene) {
    this.text = scene.add
      .text(0, 0, '0 / 20', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(2000);
    ignoreWorldCamera(scene, this.text);
    bindViewResize(scene, () => this.layout(scene));
  }

  public setCargo(carried: number, capacity: number): void {
    this.text.setText(`${carried} / ${capacity}`);
    this.text.setColor(carried >= capacity ? '#ffd43b' : '#ffffff');
  }

  private layout(scene: Scene): void {
    const { marginX, marginTop } = GameConfig.hud;
    const inset = safeInsets(scene);
    this.text.setPosition(
      viewSize(scene).width - inset.right - marginX,
      inset.top + marginTop,
    );
  }
}
