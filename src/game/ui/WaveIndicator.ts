import { GameObjects, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

/** Remaining enemy count (replaces CleanBar). */
export class WaveIndicator {
  private readonly root: GameObjects.Container;
  private readonly countText: GameObjects.Text;
  private lastCount = -1;

  public constructor(scene: Scene) {
    const cfg = GameConfig.hudSurvival;
    const panel = scene.add.graphics();
    panel.fillStyle(0x273b52, 0.95);
    panel.fillRoundedRect(0, 0, cfg.wavePanelWidth, cfg.wavePanelHeight, 16);
    panel.lineStyle(2, 0x4dabf7, 0.8);
    panel.strokeRoundedRect(0, 0, cfg.wavePanelWidth, cfg.wavePanelHeight, 16);

    const title = scene.add
      .text(16, cfg.wavePanelHeight / 2, 'Enemies', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '24px',
        color: '#adb5bd',
      })
      .setOrigin(0, 0.5);

    this.countText = scene.add
      .text(cfg.wavePanelWidth - 16, cfg.wavePanelHeight / 2, '0', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        color: '#74c0fc',
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5);

    this.root = scene.add.container(0, 0, [panel, title, this.countText]);
    this.root.setScrollFactor(0);
    this.root.setDepth(2000);
    ignoreWorldCamera(scene, this.root);
    bindViewResize(scene, () => this.layout(scene));
  }

  private layout(scene: Scene): void {
    const cfg = GameConfig.hudSurvival;
    const inset = safeInsets(scene);
    const { width } = viewSize(scene);
    this.root.setPosition((width - cfg.wavePanelWidth) / 2, inset.top + cfg.wavePanelMarginTop);
  }

  public setRemaining(count: number): void {
    if (count === this.lastCount) {
      return;
    }
    this.lastCount = count;
    this.countText.setText(String(Math.max(0, count)));
  }
}
