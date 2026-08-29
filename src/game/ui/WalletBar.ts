import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { drawNavyPanel } from './navyPanel';

/** Coin total for hub screens (garage wallet). */
export class WalletBar {
  private readonly coinsText: GameObjects.Text;

  public constructor(scene: Scene, options: WalletBarOptions = {}) {
    const { width } = GameConfig.viewport;
    const { marginTop, walletWidth, walletHeight, walletRadius, iconSize } = GameConfig.garage;

    const panel = scene.add.graphics();
    drawNavyPanel(panel, walletWidth, walletHeight, walletRadius);

    const iconPad = 18;
    const coin = scene.add.image(iconPad + iconSize / 2, walletHeight / 2, 'iconset', 'coin');
    coin.setDisplaySize(iconSize * 0.72, iconSize * 0.72);

    this.coinsText = scene.add
      .text(iconPad + iconSize, walletHeight / 2, '0', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '36px',
        fontStyle: 'bold',
        color: '#ffd22f',
      })
      .setOrigin(0, 0.5)
      .setShadow(0, 1, '#000000', 2, true, true);

    const plus = scene.add.image(
      walletWidth - iconPad - 28,
      walletHeight / 2,
      'iconset',
      'plus',
    );
    plus.setDisplaySize(48, 48);

    const x = options.x ?? (width - walletWidth) / 2;
    const y = options.y ?? marginTop;
    const root = scene.add.container(x, y, [panel, coin, this.coinsText, plus]);
    root.setDepth(options.depth ?? 1000);
    if (options.fixedToCamera) {
      root.setScrollFactor(0);
    }
  }

  public setCoins(amount: number): void {
    this.coinsText.setText(String(amount));
  }
}

type WalletBarOptions = {
  x?: number;
  y?: number;
  depth?: number;
  fixedToCamera?: boolean;
};
