import { GameObjects, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { drawNavyPanel } from './navyPanel';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

/** Coin total for hub screens (garage wallet). */
export class WalletBar {
  private readonly coinsText: GameObjects.Text;
  private readonly root: GameObjects.Container;
  private readonly options: WalletBarOptions;

  public constructor(scene: Scene, options: WalletBarOptions = {}) {
    this.options = options;
    const { walletWidth, walletHeight, walletRadius, iconSize } = GameConfig.garage;

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

    this.root = scene.add.container(0, 0, [panel, coin, this.coinsText, plus]);
    this.root.setDepth(options.depth ?? 1000);
    if (options.fixedToCamera) {
      this.root.setScrollFactor(0);
      ignoreWorldCamera(scene, this.root);
    }
    bindViewResize(scene, () => this.layout(scene));
  }

  public setCoins(amount: number): void {
    this.coinsText.setText(String(amount));
  }

  private layout(scene: Scene): void {
    const { width } = viewSize(scene);
    const { marginTop, walletWidth } = GameConfig.garage;
    const inset = safeInsets(scene);
    const x = this.options.x ?? (width - walletWidth) / 2;
    const y = this.options.y ?? inset.top + marginTop;
    this.root.setPosition(x, y);
  }
}

type WalletBarOptions = {
  x?: number;
  y?: number;
  depth?: number;
  fixedToCamera?: boolean;
};
