import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type ResultPayload = {
  outcome: 'Won' | 'Lost';
  cleanPercentage: number;
  levelId: number;
};

/**
 * Victory / defeat summary with Continue or Retry (US-020).
 * Registry key: `resultPayload`.
 */
export class ResultScene extends Scene {
  public constructor() {
    super('ResultScene');
  }

  public create(): void {
    const payload = this.registry.get('resultPayload') as ResultPayload | undefined;
    const outcome = payload?.outcome ?? 'Won';
    const clean = Math.floor(payload?.cleanPercentage ?? 0);
    const levelId = payload?.levelId ?? 1;

    const { width, height } = GameConfig.viewport;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d10, 0.92);

    const isWin = outcome === 'Won';
    const title = isWin ? 'Victory' : 'Defeat';
    const color = isWin ? '#69db7c' : '#fa5252';

    this.add
      .text(width / 2, height / 2 - 160, title, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '72px',
        color,
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 40, `Clean ${clean}%`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        color: '#ced4da',
      })
      .setOrigin(0.5);

    if (isWin) {
      this.addButton(width / 2, height / 2 + 120, 'Continue', () => {
        this.registry.set('activeLevelId', levelId);
        this.scene.start('MenuScene');
      });
    } else {
      this.addButton(width / 2, height / 2 + 120, 'Retry', () => {
        this.registry.set('activeLevelId', levelId);
        this.scene.start('GameScene');
      });
    }
  }

  private addButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add
      .rectangle(x, y, 360, 80, GameConfig.colors.roverAccent, 1)
      .setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        color: '#0d0d10',
      })
      .setOrigin(0.5);

    bg.on('pointerup', onClick);
    text.setInteractive({ useHandCursor: true }).on('pointerup', onClick);
  }
}
