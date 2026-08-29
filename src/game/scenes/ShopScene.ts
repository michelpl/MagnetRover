import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { HubBar } from '../ui/HubBar';

/** Placeholder shop tab — no purchases yet. */
export class ShopScene extends Scene {
  public constructor() {
    super('ShopScene');
  }

  public create(): void {
    const { width, height } = GameConfig.viewport;
    this.add.rectangle(width / 2, height / 2, width, height, GameConfig.colors.background);
    this.add
      .text(width / 2, height / 2 - 80, 'Shop', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '64px',
        color: '#74c0fc',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2, 'Coming soon', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '32px',
        color: '#adb5bd',
      })
      .setOrigin(0.5);
    new HubBar(this, 'shop');
  }
}
