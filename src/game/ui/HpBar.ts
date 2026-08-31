import { GameObjects, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

/** Camera-fixed HP bar (replaces EnergyBar). */
export class HpBar {
  private readonly root: GameObjects.Container;
  private readonly fillGfx: GameObjects.Graphics;
  private readonly label: GameObjects.Text;
  private ratio = -1;

  public constructor(scene: Scene) {
    const cfg = GameConfig.hudSurvival;
    const bg = scene.add.graphics();
    bg.fillStyle(0x1a2533, 0.92);
    bg.fillRoundedRect(0, 0, cfg.hpBarWidth, cfg.hpBarHeight, 14);
    bg.lineStyle(2, 0x3d5368, 1);
    bg.strokeRoundedRect(0, 0, cfg.hpBarWidth, cfg.hpBarHeight, 14);

    this.fillGfx = scene.add.graphics();
    this.label = scene.add
      .text(cfg.hpBarWidth / 2, cfg.hpBarHeight / 2, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '22px',
        color: '#f3f7ff',
        stroke: '#07101c',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.root = scene.add.container(0, 0, [bg, this.fillGfx, this.label]);
    this.root.setScrollFactor(0);
    this.root.setDepth(2000);
    ignoreWorldCamera(scene, this.root);
    bindViewResize(scene, () => this.layout(scene));
    this.setRatio(1);
  }

  private layout(scene: Scene): void {
    const cfg = GameConfig.hudSurvival;
    const inset = safeInsets(scene);
    const { width, height } = viewSize(scene);
    this.root.setPosition(
      (width - cfg.hpBarWidth) / 2,
      height - inset.bottom - cfg.hpBarMarginBottom,
    );
  }

  public setRatio(ratio: number): void {
    const clamped = Math.max(0, Math.min(1, ratio));
    if (Math.abs(clamped - this.ratio) < 0.001) {
      return;
    }
    this.ratio = clamped;
    const cfg = GameConfig.hudSurvival;
    const pad = 4;
    const innerW = cfg.hpBarWidth - pad * 2;
    const innerH = cfg.hpBarHeight - pad * 2;
    this.fillGfx.clear();
    if (clamped > 0) {
      this.fillGfx.fillStyle(clamped > 0.35 ? 0x51cf66 : 0xff6b6b, 1);
      this.fillGfx.fillRoundedRect(pad, pad, innerW * clamped, innerH, 10);
    }
    this.label.setText(`${Math.round(clamped * 100)}%`);
  }
}
