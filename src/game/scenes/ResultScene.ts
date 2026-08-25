import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type ResultPayload = {
  outcome: 'Won' | 'Lost';
  cleanPercentage: number;
  levelId: number;
};

/**
 * Minimal result shell — richer layout lands in US-020.
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

    const { width, height } = GameConfig.viewport;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d10, 0.92);

    const title = outcome === 'Won' ? 'CLEARED' : 'OUT OF ENERGY';
    const color = outcome === 'Won' ? '#69db7c' : '#fa5252';

    this.add
      .text(width / 2, height / 2 - 80, title, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '64px',
        color,
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 20, `Clean ${clean}%`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ced4da',
      })
      .setOrigin(0.5);
  }
}
