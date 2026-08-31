import { GameObjects, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';
import { bindViewResize, viewSize } from './viewSize';

/**
 * Full-screen overlay: Continue resumes, Quit returns to the menu, mute toggles persist.
 */
export class PauseModal {
  private readonly root: GameObjects.Container;
  private readonly dim: GameObjects.Rectangle;
  private readonly sfxLabel: GameObjects.Text;
  private readonly hapticsLabel: GameObjects.Text;

  public constructor(
    scene: Scene,
    handlers: { onContinue: () => void; onQuit: () => void },
  ) {
    const { width, height } = viewSize(scene);
    const cx = width / 2;
    const cy = height / 2;

    this.dim = scene.add
      .rectangle(0, 0, width, height, 0x0d0d10, 0.82)
      .setOrigin(0, 0);

    const panel = scene.add.rectangle(cx, cy, 720, 760, 0x1e1e26, 1);
    panel.setStrokeStyle(4, GameConfig.colors.mapBorder);

    const title = scene.add
      .text(cx, cy - 300, 'Paused', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '64px',
        color: '#74c0fc',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const sfxBtn = this.makeButton(scene, cx, cy - 140, '', GameConfig.colors.roverCabin, () => {
      Save.update((data) => {
        data.sfxMuted = !data.sfxMuted;
      });
      this.refreshToggles();
    });
    this.sfxLabel = sfxBtn.label;

    const hapticsBtn = this.makeButton(scene, cx, cy - 20, '', GameConfig.colors.roverCabin, () => {
      Save.update((data) => {
        data.hapticsEnabled = !data.hapticsEnabled;
      });
      this.refreshToggles();
    });
    this.hapticsLabel = hapticsBtn.label;

    const continueBtn = this.makeButton(
      scene,
      cx,
      cy + 140,
      'Continue',
      GameConfig.colors.magnetGlow,
      handlers.onContinue,
    );
    const quitBtn = this.makeButton(
      scene,
      cx,
      cy + 260,
      'Quit',
      GameConfig.colors.roverCabin,
      handlers.onQuit,
    );

    this.root = scene.add.container(0, 0, [
      this.dim,
      panel,
      title,
      ...sfxBtn.parts,
      ...hapticsBtn.parts,
      ...continueBtn.parts,
      ...quitBtn.parts,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(15_000);
    ignoreWorldCamera(scene, this.root);
    this.setOpen(false);
    this.refreshToggles();

    bindViewResize(scene, () => {
      const size = viewSize(scene);
      this.dim.setSize(size.width, size.height);
    });
  }

  public show(): void {
    this.refreshToggles();
    this.setOpen(true);
  }

  public hide(): void {
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

  private refreshToggles(): void {
    const save = Save.load();
    this.sfxLabel.setText(save.sfxMuted ? 'SFX: Off' : 'SFX: On');
    this.hapticsLabel.setText(save.hapticsEnabled ? 'Haptics: On' : 'Haptics: Off');
  }

  private makeButton(
    scene: Scene,
    x: number,
    y: number,
    label: string,
    fill: number,
    onClick: () => void,
  ): { parts: GameObjects.GameObject[]; label: GameObjects.Text } {
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

    bg.on('pointerdown', onClick);
    text.on('pointerdown', onClick);
    return { parts: [bg, text], label: text };
  }
}
