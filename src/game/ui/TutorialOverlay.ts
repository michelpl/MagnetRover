import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';
import { drawNavyPanel } from './navyPanel';
import { setContainerInteractive } from './setContainerInteractive';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { viewSize } from './viewSize';

const STEPS: readonly { title: string; body: string }[] = [
  { title: 'Drive', body: 'Slide the stick to move the rover.' },
  { title: 'Laser cannon', body: 'The laser auto-aims enemies in a 120° cone ahead of the rover.' },
  { title: 'Avoid damage', body: 'Hostile rovers drain your HP on contact.' },
  { title: 'Clear the wave', body: 'Eliminate all enemies to win the stage.' },
];

const CARD_WIDTH = 920;
const CARD_HEIGHT = 280;

export type TutorialSignals = {
  moving: boolean;
  fired: boolean;
  damaged: boolean;
  cleared: boolean;
};

/** First-run survival cues on stage 1. */
export class TutorialOverlay {
  private readonly root: GameObjects.Container;
  private readonly title: GameObjects.Text;
  private readonly body: GameObjects.Text;
  private readonly progress: GameObjects.Text;
  private step = 0;
  private done = false;

  public constructor(scene: Scene) {
    const { width } = viewSize(scene);
    const cardX = (width - CARD_WIDTH) / 2;
    const cardY = 430;

    const panel = scene.add.graphics();
    drawNavyPanel(panel, CARD_WIDTH, CARD_HEIGHT, 24);

    this.title = scene.add
      .text(CARD_WIDTH / 2, 36, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '40px',
        color: '#74c0fc',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0);

    this.body = scene.add
      .text(CARD_WIDTH / 2, 100, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        color: '#ced4da',
        align: 'center',
        wordWrap: { width: CARD_WIDTH - 80 },
      })
      .setOrigin(0.5, 0);

    this.progress = scene.add
      .text(48, CARD_HEIGHT - 52, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '22px',
        color: '#adb5bd',
      })
      .setOrigin(0, 0.5);

    const skip = this.makeSkip(scene, CARD_WIDTH - 100, CARD_HEIGHT - 52);

    this.root = scene.add.container(cardX, cardY, [
      panel,
      this.title,
      this.body,
      this.progress,
      skip,
    ]);
    this.root.setScrollFactor(0);
    this.root.setDepth(8_500);
    ignoreWorldCamera(scene, this.root);

    this.refreshCopy();
  }

  public get isActive(): boolean {
    return !this.done;
  }

  public sync(signals: TutorialSignals): void {
    if (this.done) {
      return;
    }

    if (this.step === 0 && signals.moving) {
      this.advance();
      return;
    }
    if (this.step === 1 && signals.fired) {
      this.advance();
      return;
    }
    if (this.step === 2 && signals.damaged) {
      this.advance();
      return;
    }
    if (this.step === 3 && signals.cleared) {
      this.complete();
    }
  }

  public destroy(): void {
    this.done = true;
    this.root.destroy();
  }

  private skip(): void {
    this.complete();
  }

  private advance(): void {
    this.step += 1;
    if (this.step >= STEPS.length) {
      this.complete();
      return;
    }
    this.refreshCopy();
  }

  private complete(): void {
    if (this.done) {
      return;
    }
    Save.markTutorialDone();
    this.destroy();
  }

  private refreshCopy(): void {
    const cue = STEPS[this.step];
    if (!cue) {
      return;
    }
    this.title.setText(cue.title);
    this.body.setText(cue.body);
    this.progress.setText(`${this.step + 1} / ${STEPS.length}`);
  }

  private makeSkip(scene: Scene, x: number, y: number): GameObjects.Container {
    const label = 'SKIP';
    const btnW = 160;
    const btnH = 56;
    const btn = scene.add.container(x, y);
    const bg = scene.add.rectangle(0, 0, btnW, btnH, GameConfig.colors.roverCabin, 1);
    bg.setStrokeStyle(2, GameConfig.colors.mapBorder);
    const text = scene.add
      .text(0, 0, label, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '26px',
        color: '#f8f9fa',
      })
      .setOrigin(0.5);
    btn.add([bg, text]);
    btn.setSize(btnW, btnH);
    setContainerInteractive(
      btn,
      new Geom.Rectangle(-btnW / 2, -btnH / 2, btnW, btnH),
      Geom.Rectangle.Contains,
    );
    btn.on('pointerup', () => this.skip());
    return btn;
  }
}
