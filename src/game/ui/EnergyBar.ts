import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Camera-fixed energy panel with eight visual charge units. */
export class EnergyBar {
  private readonly root: GameObjects.Container;
  private readonly units: GameObjects.Image[];
  private readonly percentageLabel: GameObjects.Text;
  private filledUnits = -1;
  private percentage = -1;

  public constructor(scene: Scene) {
    const { marginX, marginBottom, energyPanel } = GameConfig.hud;

    const x = marginX;
    const y = GameConfig.viewport.height - marginBottom - energyPanel.height;

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

    this.root = scene.add.container(x, y, [background, ...this.units, this.percentageLabel]);
    this.root.setScrollFactor(0);
    this.root.setDepth(2000);
    this.setRatio(1);
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
