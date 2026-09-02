import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { drawNavyPanel } from './navyPanel';
import { bindViewResize, viewSize } from './viewSize';
import { VolumeSliderPair } from './volumeSliders';

/** Overlay with draggable music and sound-effect volume controls. */
export class SettingsModal {
  private readonly root: GameObjects.Container;
  private readonly dim: GameObjects.Rectangle;
  private readonly volumes: VolumeSliderPair;

  public constructor(scene: Scene) {
    const { width, height } = viewSize(scene);
    const settings = GameConfig.settings;
    const panelX = (width - settings.panelWidth) / 2;
    const panelY = (height - settings.panelHeight) / 2;
    const sliderLeft = panelX + (settings.panelWidth - settings.sliderWidth) / 2;

    this.dim = scene.add
      .rectangle(0, 0, width, height, 0x020817, 0.78)
      .setOrigin(0, 0);
    this.dim.on('pointerup', () => this.hide());

    const panel = scene.add.graphics();
    drawNavyPanel(panel, settings.panelWidth, settings.panelHeight, settings.panelRadius);
    panel.setPosition(panelX, panelY);

    const title = scene.add
      .text(width / 2, panelY + 86, 'SETTINGS', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '54px',
        fontStyle: 'bold',
        color: '#f5f7fa',
      })
      .setOrigin(0.5);

    const closeBackground = scene.add
      .circle(panelX + settings.panelWidth - 58, panelY + 58, 34, 0x0a284d)
      .setStrokeStyle(2, 0x80b1e2)
      .setInteractive({ useHandCursor: true });
    const closeLabel = scene.add
      .text(closeBackground.x, closeBackground.y - 3, '×', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '48px',
        color: '#f5f7fa',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeBackground.on('pointerup', () => this.hide());
    closeLabel.on('pointerup', () => this.hide());

    this.volumes = new VolumeSliderPair(scene, {
      left: sliderLeft,
      width: settings.sliderWidth,
      sfxY: panelY + 252,
      musicY: panelY + 432,
    });

    this.root = scene.add.container(0, 0, [
      this.dim,
      panel,
      title,
      closeBackground,
      closeLabel,
      ...this.volumes.objects,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(20_000);
    this.setOpen(false);

    bindViewResize(scene, () => {
      const size = viewSize(scene);
      this.dim.setSize(size.width, size.height);
    });
  }

  public get isOpen(): boolean {
    return this.root.visible;
  }

  public show(): void {
    this.volumes.refreshFromSave();
    this.setOpen(true);
  }

  public hide(): void {
    this.setOpen(false);
  }

  private setOpen(open: boolean): void {
    this.root.setVisible(open);
    this.root.setActive(open);
    this.volumes.setInputEnabled(open);
    for (const child of this.root.list) {
      if (child.input) {
        child.input.enabled = open;
      }
    }
    if (open) {
      this.dim.setInteractive();
    } else {
      this.dim.disableInteractive();
    }
  }
}
