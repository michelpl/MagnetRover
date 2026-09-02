import { GameObjects, Input, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';
import { bindViewResize, viewSize } from './viewSize';
import { VolumeSliderPair } from './volumeSliders';

type PauseItem = {
  bg: GameObjects.Rectangle;
  activate: () => void;
};

/**
 * Full-screen overlay: volume sliders, haptics, Continue, and Quit.
 */
export class PauseModal {
  private readonly root: GameObjects.Container;
  private readonly dim: GameObjects.Rectangle;
  private readonly volumes: VolumeSliderPair;
  private readonly hapticsLabel: GameObjects.Text;
  private readonly items: PauseItem[] = [];
  private focusIndex = 1;

  public constructor(
    scene: Scene,
    handlers: { onContinue: () => void; onQuit: () => void },
  ) {
    const { width, height } = viewSize(scene);
    const cx = width / 2;
    const cy = height / 2;
    const settings = GameConfig.settings;
    const sliderLeft = cx - settings.sliderWidth / 2;

    this.dim = scene.add
      .rectangle(0, 0, width, height, 0x0d0d10, 0.82)
      .setOrigin(0, 0);

    const panel = scene.add.rectangle(cx, cy, 840, 980, 0x1e1e26, 1);
    panel.setStrokeStyle(4, GameConfig.colors.mapBorder);

    const title = scene.add
      .text(cx, cy - 430, 'Paused', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '64px',
        color: '#74c0fc',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.volumes = new VolumeSliderPair(scene, {
      left: sliderLeft,
      width: settings.sliderWidth,
      sfxY: cy - 280,
      musicY: cy - 100,
    });

    const hapticsBtn = this.makeButton(scene, cx, cy + 80, '', GameConfig.colors.roverCabin, () => {
      Save.update((data) => {
        data.hapticsEnabled = !data.hapticsEnabled;
      });
      this.refreshToggles();
    });
    this.hapticsLabel = hapticsBtn.label;

    const continueBtn = this.makeButton(
      scene,
      cx,
      cy + 220,
      'Continue',
      GameConfig.colors.magnetGlow,
      handlers.onContinue,
    );
    const quitBtn = this.makeButton(
      scene,
      cx,
      cy + 340,
      'Quit',
      GameConfig.colors.roverCabin,
      handlers.onQuit,
    );

    this.root = scene.add.container(0, 0, [
      this.dim,
      panel,
      title,
      ...this.volumes.objects,
      ...hapticsBtn.parts,
      ...continueBtn.parts,
      ...quitBtn.parts,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(15_000);
    ignoreWorldCamera(scene, this.root);
    this.setOpen(false);
    this.refreshToggles();
    this.bindKeyboard(scene);

    bindViewResize(scene, () => {
      const size = viewSize(scene);
      this.dim.setSize(size.width, size.height);
    });
  }

  public show(): void {
    this.volumes.refreshFromSave();
    this.refreshToggles();
    this.focusIndex = 1;
    this.setOpen(true);
    this.refreshFocus();
  }

  public hide(): void {
    this.setOpen(false);
  }

  private bindKeyboard(scene: Scene): void {
    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      return;
    }
    keyboard.addCapture([Input.Keyboard.KeyCodes.ENTER]);
    const onKey = (event: KeyboardEvent) => this.onKeyDown(event);
    scene.input.keyboard?.on('keydown', onKey);
    scene.events.once('shutdown', () => {
      scene.input.keyboard?.off('keydown', onKey);
    });
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!this.root.visible) {
      return;
    }
    const raw = event.key;
    if (!raw) {
      return;
    }
    const key = raw.toLowerCase();
    if (key === 'w' || key === 'a' || key === 'arrowup' || key === 'arrowleft') {
      this.moveFocus(-1);
      event.preventDefault();
      return;
    }
    if (key === 's' || key === 'd' || key === 'arrowdown' || key === 'arrowright') {
      this.moveFocus(1);
      event.preventDefault();
      return;
    }
    if (key === 'enter') {
      this.items[this.focusIndex]?.activate();
      event.preventDefault();
    }
  }

  private moveFocus(delta: number): void {
    const count = this.items.length;
    this.focusIndex = (this.focusIndex + delta + count) % count;
    this.refreshFocus();
  }

  private refreshFocus(): void {
    this.items.forEach((item, index) => {
      if (index === this.focusIndex) {
        item.bg.setStrokeStyle(4, GameConfig.colors.roverAccent);
      } else {
        item.bg.setStrokeStyle(0);
      }
    });
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

  private refreshToggles(): void {
    const save = Save.load();
    this.hapticsLabel.setText(save.hapticsEnabled ? 'Haptics: On' : 'Haptics: Off');
  }

  private makeButton(
    scene: Scene,
    x: number,
    y: number,
    label: string,
    fill: number,
    onClick: () => void,
  ): {
    parts: GameObjects.GameObject[];
    label: GameObjects.Text;
    bg: GameObjects.Rectangle;
    activate: () => void;
  } {
    const bg = scene.add
      .rectangle(x, y, 400, 88, fill, 1)
      .setInteractive({ useHandCursor: true });
    const text = scene.add
      .text(x, y, label, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '36px',
        color: '#f8f9fa',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const activate = () => onClick();
    const select = (index: number) => {
      this.focusIndex = index;
      this.refreshFocus();
    };

    const index = this.items.length;
    this.items.push({ bg, activate });
    bg.on('pointerdown', () => {
      select(index);
      activate();
    });
    text.on('pointerdown', () => {
      select(index);
      activate();
    });
    return { parts: [bg, text], label: text, bg, activate };
  }
}
