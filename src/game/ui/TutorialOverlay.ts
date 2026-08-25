import type { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';

const STEPS = [
  'Drag to drive the rover',
  'Back into scrap — the rear magnet pulls cubes',
  'When FULL, dump at the orange processor',
  'Clear every cube before energy runs out',
] as const;

/** Skippable first-run overlay (US-038). No quest system. */
export class TutorialOverlay {
  private root: Phaser.GameObjects.Container | null = null;
  private stepIndex = 0;
  private bodyText: Phaser.GameObjects.Text | null = null;

  public constructor(private readonly scene: Scene) {}

  public tryShow(): void {
    const save = Save.load();
    if (save.tutorialSeen) {
      return;
    }
    this.build();
  }

  private build(): void {
    const { width, height } = GameConfig.viewport;
    const panel = this.scene.add.rectangle(0, 0, width - 80, 420, 0x000000, 0.78);
    this.bodyText = this.scene.add
      .text(0, -40, STEPS[0], {
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: width - 160 },
      })
      .setOrigin(0.5);

    const next = this.scene.add
      .text(0, 100, 'Next', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#74c0fc',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const skip = this.scene.add
      .text(0, 160, 'Skip', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#adb5bd',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    next.on('pointerup', () => this.advance());
    skip.on('pointerup', () => this.finish());

    this.root = this.scene.add.container(width / 2, height / 2 - 120, [
      panel,
      this.bodyText,
      next,
      skip,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(3000);
  }

  private advance(): void {
    this.stepIndex += 1;
    if (this.stepIndex >= STEPS.length) {
      this.finish();
      return;
    }
    this.bodyText?.setText(STEPS[this.stepIndex]);
  }

  private finish(): void {
    Save.update((data) => {
      data.tutorialSeen = true;
    });
    this.root?.destroy(true);
    this.root = null;
  }
}
