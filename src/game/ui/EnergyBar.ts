import { GameObjects, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

/** Camera-fixed energy panel with eight visual charge units. */
export class EnergyBar {
  private readonly root: GameObjects.Container;
  private readonly units: GameObjects.Image[];
  private readonly percentageLabel: GameObjects.Text;
  private filledUnits = -1;
  private percentage = -1;

  public constructor(scene: Scene) {
    const { energyPanel } = GameConfig.hud;

    const background = scene.add
      .image(0, 0, 'energy-panel')
      .setOrigin(0, 0);
    background.setDisplaySize(energyPanel.width, energyPanel.height);

    this.units = Array.from({ length: energyPanel.slotCount }, (_, index) =>
      scene.add
        .image(
          energyPanel.width / 2,
          energyPanel.firstSlotCenterY + index * energyPanel.slotPitch,
          'energy-unit',
        )
        .setScale(energyPanel.unitScale),
    );
    this.percentageLabel = scene.add
      .text(energyPanel.width / 2, energyPanel.percentageCenterY, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: `${energyPanel.percentageFontSize}px`,
        color: '#f3f7ff',
        stroke: '#07101c',
        strokeThickness: 6,
      })
      .setOrigin(0.5, 0.5);

    this.root = scene.add.container(0, 0, [background, ...this.units, this.percentageLabel]);
    this.root.setScrollFactor(0);
    this.root.setDepth(2000);
    ignoreWorldCamera(scene, this.root);
    this.setRatio(1);
    bindViewResize(scene, () => this.layout(scene));
  }

  private layout(scene: Scene): void {
    const { marginX, marginBottom, energyPanel } = GameConfig.hud;
    const inset = safeInsets(scene);
    this.root.setPosition(
      inset.left + marginX,
      viewSize(scene).height - inset.bottom - marginBottom - energyPanel.height,
    );
  }

  public setRatio(ratio: number): void {
    const clamped = Math.max(0, Math.min(1, ratio));
    const filledUnits = Math.ceil(clamped * this.units.length);
    const percentage = Math.round(clamped * 100);

    if (filledUnits !== this.filledUnits) {
      const firstFilledUnit = this.units.length - filledUnits;
      this.units.forEach((unit, index) => unit.setVisible(index >= firstFilledUnit));
      this.filledUnits = filledUnits;
    }
    if (percentage !== this.percentage) {
      this.percentageLabel.setText(`${percentage}%`);
      this.percentage = percentage;
    }
  }
}
