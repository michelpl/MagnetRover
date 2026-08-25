import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';
import { Upgrades, type UpgradeLine } from '../save/Upgrades';

/** Spend coins on capacity, magnet radius, and speed (US-031). */
export class UpgradeScene extends Scene {
  private coinsText!: Phaser.GameObjects.Text;
  private buttonLabels: Partial<Record<UpgradeLine, Phaser.GameObjects.Text>> = {};

  public constructor() {
    super('UpgradeScene');
  }

  public create(): void {
    const { width, height } = GameConfig.viewport;
    this.add.rectangle(width / 2, height / 2, width, height, GameConfig.colors.background);

    this.add
      .text(width / 2, 160, 'Upgrades', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '64px',
        color: '#74c0fc',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.coinsText = this.add
      .text(width / 2, 250, '', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        color: '#ffd43b',
      })
      .setOrigin(0.5);

    this.addUpgradeButton('capacity', 'Capacity', width / 2, 420);
    this.addUpgradeButton('magnetRadius', 'Magnet', width / 2, 560);
    this.addUpgradeButton('speed', 'Speed', width / 2, 700);

    this.refresh();

    const continueBg = this.add
      .rectangle(width / 2, height - 220, 400, 90, GameConfig.colors.magnetGlow, 1)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(width / 2, height - 220, 'Continue', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        color: '#0d0d10',
      })
      .setOrigin(0.5);

    continueBg.on('pointerup', () => {
      const save = Save.load();
      this.registry.set('activeLevelId', save.currentLevel);
      this.scene.start('GameScene');
    });
  }

  private addUpgradeButton(line: UpgradeLine, label: string, x: number, y: number): void {
    const bg = this.add
      .rectangle(x, y, 520, 100, 0x343a40, 1)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.buttonLabels[line] = text;

    bg.on('pointerup', () => {
      Upgrades.purchase(line);
      this.refresh();
    });
  }

  private refresh(): void {
    const data = Save.load();
    this.coinsText.setText(`Coins: ${data.coins}`);
    const lines: UpgradeLine[] = ['capacity', 'magnetRadius', 'speed'];
    for (const line of lines) {
      const label = this.buttonLabels[line];
      if (!label) {
        continue;
      }
      const cost = Upgrades.nextCost(line, data.upgrades);
      const tier = data.upgrades[line];
      const title =
        line === 'capacity' ? 'Capacity' : line === 'magnetRadius' ? 'Magnet' : 'Speed';
      label.setText(
        cost === null ? `${title} MAX (tier ${tier})` : `${title} tier ${tier} — ${cost} coins`,
      );
    }
  }
}
