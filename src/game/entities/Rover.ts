import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

type ArrowKeys = {
  up: Input.Keyboard.Key;
  down: Input.Keyboard.Key;
  left: Input.Keyboard.Key;
  right: Input.Keyboard.Key;
};

/** Unit-ish move vector; callers may pass raw joystick axes (merged then normalized). */
export type MoveInput = {
  x: number;
  y: number;
};

export class Rover extends GameObjects.Container {
  private readonly wasd: ArrowKeys;
  private readonly arrows: ArrowKeys;
  private velocityX = 0;
  private velocityY = 0;
  private speedBoostActive = false;
  /** Extra axes from virtual joystick (US-006); merged with keyboard each frame. */
  private joystickInputX = 0;
  private joystickInputY = 0;
  private moveSpeed: number = GameConfig.rover.speed;

  public constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    const keyboard = scene.input.keyboard;
    if (!keyboard) {
      throw new Error('Keyboard plugin is required for rover controls');
    }

    this.wasd = {
      up: keyboard.addKey(Input.Keyboard.KeyCodes.W),
      down: keyboard.addKey(Input.Keyboard.KeyCodes.S),
      left: keyboard.addKey(Input.Keyboard.KeyCodes.A),
      right: keyboard.addKey(Input.Keyboard.KeyCodes.D),
    };

    const cursors = keyboard.createCursorKeys();
    this.arrows = {
      up: this.requireKey(cursors.up, 'up'),
      down: this.requireKey(cursors.down, 'down'),
      left: this.requireKey(cursors.left, 'left'),
      right: this.requireKey(cursors.right, 'right'),
    };

    keyboard.addCapture([
      Input.Keyboard.KeyCodes.W,
      Input.Keyboard.KeyCodes.A,
      Input.Keyboard.KeyCodes.S,
      Input.Keyboard.KeyCodes.D,
      Input.Keyboard.KeyCodes.UP,
      Input.Keyboard.KeyCodes.DOWN,
      Input.Keyboard.KeyCodes.LEFT,
      Input.Keyboard.KeyCodes.RIGHT,
    ]);

    this.drawBody();
    scene.add.existing(this);
  }

  /**
   * True while velocity is above moveEpsilon — used later for energy drain while moving.
   */
  public get isMoving(): boolean {
    const { moveEpsilon } = GameConfig.rover;
    return Math.abs(this.velocityX) > moveEpsilon || Math.abs(this.velocityY) > moveEpsilon;
  }

  /** World position of the rear magnet anchor (local +Y rotated into world). */
  public getMagnetWorldPosition(): { x: number; y: number } {
    const { magnetOffsetY } = GameConfig.rover;
    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);
    // Local (0, magnetOffsetY) under Phaser rotation: (-y·sin, y·cos).
    return {
      x: this.x - sin * magnetOffsetY,
      y: this.y + cos * magnetOffsetY,
    };
  }

  /**
   * Inject joystick axes (typically -1..1). Merged with keyboard, then normalized once.
   * Pass zeros when the stick is idle so keyboard-only play keeps working.
   */
  public setJoystickInput(x: number, y: number): void {
    this.joystickInputX = x;
    this.joystickInputY = y;
  }

  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }

  public updateRover(delta: number): void {
    const input = this.readMoveInput();
    const speed = this.speedBoostActive
      ? GameConfig.debug.boostSpeed
      : this.moveSpeed;

    this.velocityX = this.damp(
      this.velocityX,
      input.x * speed,
      GameConfig.rover.inputSmoothing,
      delta,
    );
    this.velocityY = this.damp(
      this.velocityY,
      input.y * speed,
      GameConfig.rover.inputSmoothing,
      delta,
    );

    const dt = delta / 1000;
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.clampToMap();

    if (this.isMoving) {
      const targetRotation = Math.atan2(this.velocityX, -this.velocityY);
      this.rotation = PhaserMath.Angle.RotateTo(
        this.rotation,
        targetRotation,
        GameConfig.rover.rotationSmoothing * (delta / 16.6667),
      );
    }
  }

  /** Debug-only: when true, uses `GameConfig.debug.boostSpeed` instead of normal speed. */
  public setSpeedBoostActive(active: boolean): void {
    this.speedBoostActive = active;
  }

  /**
   * Merge keyboard + joystick into one vector, then normalize so diagonals are not faster.
   * Shared damp/rotate path — do not branch smoothing by input source.
   */
  private readMoveInput(): MoveInput {
    const keyboardX = Number(this.isHeld('right')) - Number(this.isHeld('left'));
    const keyboardY = Number(this.isHeld('down')) - Number(this.isHeld('up'));

    let x = keyboardX + this.joystickInputX;
    let y = keyboardY + this.joystickInputY;

    if (x !== 0 || y !== 0) {
      const length = Math.hypot(x, y);
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  private drawBody(): void {
    const graphics = this.scene.add.graphics();
    this.drawMagnetCue(graphics);
    this.drawHull(graphics);
    this.add(graphics);
  }

  /** Soft rear glow + ring only — full magnetRadius preview belongs to MagnetSystem (US-009). */
  private drawMagnetCue(graphics: GameObjects.Graphics): void {
    const { magnetOffsetY, magnetGlowRadius, magnetRingRadius, magnetRingWidth } =
      GameConfig.rover;
    const { magnetGlow } = GameConfig.colors;

    graphics.fillStyle(magnetGlow, 0.12);
    graphics.fillCircle(0, magnetOffsetY, magnetGlowRadius);
    graphics.fillStyle(magnetGlow, 0.28);
    graphics.fillCircle(0, magnetOffsetY, magnetGlowRadius * 0.65);
    graphics.fillStyle(magnetGlow, 0.55);
    graphics.fillCircle(0, magnetOffsetY, magnetGlowRadius * 0.35);

    graphics.lineStyle(magnetRingWidth, magnetGlow, 0.9);
    graphics.strokeCircle(0, magnetOffsetY, magnetRingRadius);
  }

  private drawHull(graphics: GameObjects.Graphics): void {
    const { bodyWidth, bodyHeight } = GameConfig.rover;
    const { roverBody, roverCabin, roverAccent } = GameConfig.colors;

    graphics.fillStyle(roverBody, 1);
    graphics.fillRoundedRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight, 10);

    graphics.fillStyle(roverCabin, 1);
    graphics.fillRoundedRect(-bodyWidth / 2 + 8, -bodyHeight / 2 + 10, bodyWidth - 16, 22, 6);

    graphics.fillStyle(roverAccent, 1);
    graphics.fillTriangle(
      0,
      -bodyHeight / 2 - 8,
      -10,
      -bodyHeight / 2 + 6,
      10,
      -bodyHeight / 2 + 6,
    );
  }

  private clampToMap(): void {
    const radius = Math.max(GameConfig.rover.bodyWidth, GameConfig.rover.bodyHeight) / 2;
    const mapWidth = this.scene.registry.get('mapWidth') as number | undefined;
    const mapHeight = this.scene.registry.get('mapHeight') as number | undefined;
    const width = mapWidth ?? GameConfig.map.width;
    const height = mapHeight ?? GameConfig.map.height;
    this.x = PhaserMath.Clamp(this.x, radius, width - radius);
    this.y = PhaserMath.Clamp(this.y, radius, height - radius);
  }

  private damp(current: number, target: number, smoothing: number, delta: number): number {
    const t = 1 - Math.pow(1 - smoothing, delta / 16.6667);
    return PhaserMath.Linear(current, target, t);
  }

  private isHeld(direction: keyof ArrowKeys): boolean {
    return this.wasd[direction].isDown || this.arrows[direction].isDown;
  }

  private requireKey(
    key: Input.Keyboard.Key | undefined,
    direction: keyof ArrowKeys,
  ): Input.Keyboard.Key {
    if (!key) {
      throw new Error(`Missing cursor key: ${direction}`);
    }
    return key;
  }
}
