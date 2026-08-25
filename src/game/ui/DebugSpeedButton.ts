import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

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
    const x = GameConfig.viewport.width - MARGIN - BUTTON_WIDTH / 2;
    const y = MARGIN + BUTTON_HEIGHT / 2;
    super(scene, x, y);

    this.onToggle = onToggle;
    this.background = scene.add.graphics();
    this.label = scene.add
      .text(0, 0, this.labelText(), {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.add([this.background, this.label]);
    this.redraw();

    this.setSize(BUTTON_WIDTH, BUTTON_HEIGHT);
    this.setInteractive(
      new Geom.Rectangle(-BUTTON_WIDTH / 2, -BUTTON_HEIGHT / 2, BUTTON_WIDTH, BUTTON_HEIGHT),
      Geom.Rectangle.Contains,
    );
    this.on('pointerdown', this.handlePointerDown, this);

    this.setScrollFactor(0);
    this.setDepth(10_000);
    scene.add.existing(this);
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
