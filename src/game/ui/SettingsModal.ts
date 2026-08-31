import { GameObjects, Input, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { drawNavyPanel } from './navyPanel';
import { bindViewResize, viewSize } from './viewSize';

type VolumeSlider = {
  fill: GameObjects.Rectangle;
  knob: GameObjects.Arc;
  valueText: GameObjects.Text;
  value: number;
};

/** Overlay with visual-only, draggable music and sound-effect volume controls. */
export class SettingsModal {
  private readonly root: GameObjects.Container;
  private readonly dim: GameObjects.Rectangle;
  private readonly sliders: VolumeSlider[] = [];
  private activeSlider: VolumeSlider | null = null;
  private readonly sliderLeft: number;
  private readonly sliderWidth: number;

  public constructor(scene: Scene) {
    const { width, height } = viewSize(scene);
    const settings = GameConfig.settings;
    const panelX = (width - settings.panelWidth) / 2;
    const panelY = (height - settings.panelHeight) / 2;
    this.sliderLeft = panelX + (settings.panelWidth - settings.sliderWidth) / 2;
    this.sliderWidth = settings.sliderWidth;

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

    const sfx = this.createSlider(scene, 'SOUND EFFECTS', panelY + 252);
    const music = this.createSlider(scene, 'MUSIC', panelY + 432);
    this.sliders.push(sfx, music);

    this.root = scene.add.container(0, 0, [
      this.dim,
      panel,
      title,
      closeBackground,
      closeLabel,
      ...this.rootChildren,
      ...this.sliders.flatMap((slider) => [slider.fill, slider.knob, slider.valueText]),
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(20_000);
    this.setOpen(false);

    bindViewResize(scene, () => {
      const size = viewSize(scene);
      this.dim.setSize(size.width, size.height);
    });

    scene.input.on('pointermove', this.onPointerMove, this);
    scene.input.on('pointerup', this.onPointerUp, this);
    scene.events.once('shutdown', () => {
      scene.input.off('pointermove', this.onPointerMove, this);
      scene.input.off('pointerup', this.onPointerUp, this);
    });
  }

  public get isOpen(): boolean {
    return this.root.visible;
  }

  public show(): void {
    this.setOpen(true);
  }

  public hide(): void {
    this.activeSlider = null;
    this.setOpen(false);
  }

  private setOpen(open: boolean): void {
    this.root.setVisible(open);
    this.root.setActive(open);
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

  private createSlider(scene: Scene, label: string, y: number): VolumeSlider {
    const settings = GameConfig.settings;
    const labelText = scene.add
      .text(this.sliderLeft, y - 58, label, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#d9ecff',
      })
      .setOrigin(0, 0.5);
    const track = scene.add
      .rectangle(this.sliderLeft, y, this.sliderWidth, settings.sliderHeight, 0x07192f)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0x3a628c)
      .setInteractive({ useHandCursor: true });
    const fill = scene.add
      .rectangle(this.sliderLeft, y, 0, settings.sliderHeight - 8, 0x7df000)
      .setOrigin(0, 0.5);
    const knob = scene.add
      .circle(this.sliderLeft, y, settings.knobRadius, 0xffd22f)
      .setStrokeStyle(3, 0xfff3a3)
      .setInteractive({ useHandCursor: true });
    const valueText = scene.add
      .text(this.sliderLeft + this.sliderWidth, y - 58, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffd22f',
      })
      .setOrigin(1, 0.5);
    const slider: VolumeSlider = { fill, knob, valueText, value: settings.initialVolume };
    this.setSliderValue(slider, settings.initialVolume);

    const startDrag = (pointer: Input.Pointer): void => {
      this.activeSlider = slider;
      this.setSliderValue(slider, this.pointerToValue(pointer.x));
    };
    track.on('pointerdown', startDrag);
    knob.on('pointerdown', startDrag);
    this.rootChildren.push(labelText, track);
    return slider;
  }

  private readonly rootChildren: GameObjects.GameObject[] = [];

  private onPointerMove(pointer: Input.Pointer): void {
    if (this.activeSlider) {
      this.setSliderValue(this.activeSlider, this.pointerToValue(pointer.x));
    }
  }

  private onPointerUp(): void {
    this.activeSlider = null;
  }

  private pointerToValue(pointerX: number): number {
    return Math.max(0, Math.min(1, (pointerX - this.sliderLeft) / this.sliderWidth));
  }

  private setSliderValue(slider: VolumeSlider, value: number): void {
    slider.value = value;
    slider.fill.width = this.sliderWidth * value;
    slider.knob.x = this.sliderLeft + this.sliderWidth * value;
    slider.valueText.setText(`${Math.round(value * 100)}%`);
  }
}
