import { GameObjects, Geom, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { setContainerInteractive } from './setContainerInteractive';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

const BUTTON_WIDTH = 120;
const BUTTON_HEIGHT = 48;
const MARGIN = 24;

type ToggleHandler = (active: boolean) => void;

/**
 * Floating on/off control for debug speed boost.
 * Fixed to the camera (top-right); only constructed when `isDebugMode` is true.
 */
export class DebugSpeedButton extends GameObjects.Container {
  private boostOn = false;
  private readonly background: GameObjects.Graphics;
  private readonly label: GameObjects.Text;
  private readonly onToggle: ToggleHandler;

  public constructor(scene: Scene, onToggle: ToggleHandler) {
    super(scene, 0, 0);

    this.onToggle = onToggle;
    this.background = scene.add.graphics();
    this.label = scene.add
      .text(0, 0, this.labelText(), {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add([this.background, this.label]);
    this.redraw();

    this.setSize(BUTTON_WIDTH, BUTTON_HEIGHT);
    setContainerInteractive(
      this,
      new Geom.Rectangle(-BUTTON_WIDTH / 2, -BUTTON_HEIGHT / 2, BUTTON_WIDTH, BUTTON_HEIGHT),
      Geom.Rectangle.Contains,
    );
    this.on('pointerdown', this.handlePointerDown, this);

    this.setScrollFactor(0);
    this.setDepth(10_000);
    scene.add.existing(this);
    ignoreWorldCamera(scene, this);
    bindViewResize(scene, () => this.layout());
  }

  private layout(): void {
    const inset = safeInsets(this.scene);
    this.setPosition(
      viewSize(this.scene).width - inset.right - MARGIN - BUTTON_WIDTH / 2,
      inset.top + MARGIN + BUTTON_HEIGHT / 2,
    );
  }

  private handlePointerDown(): void {
    this.boostOn = !this.boostOn;
    this.redraw();
    this.onToggle(this.boostOn);
  }

  private redraw(): void {
    const fill = this.boostOn ? GameConfig.colors.magnetGlow : GameConfig.colors.roverCabin;
    const stroke = this.boostOn ? GameConfig.colors.roverAccent : GameConfig.colors.mapBorder;

    this.background.clear();
    this.background.fillStyle(fill, this.boostOn ? 0.95 : 0.85);
    this.background.fillRoundedRect(
      -BUTTON_WIDTH / 2,
      -BUTTON_HEIGHT / 2,
      BUTTON_WIDTH,
      BUTTON_HEIGHT,
      10,
    );
    this.background.lineStyle(2, stroke, 1);
    this.background.strokeRoundedRect(
      -BUTTON_WIDTH / 2,
      -BUTTON_HEIGHT / 2,
      BUTTON_WIDTH,
      BUTTON_HEIGHT,
      10,
    );

    this.label.setText(this.labelText());
  }

  private labelText(): string {
    return this.boostOn ? `SPD ${GameConfig.debug.boostSpeed}` : 'SPD OFF';
  }
}
