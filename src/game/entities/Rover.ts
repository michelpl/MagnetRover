import { GameObjects, Geom, Input, Math as PhaserMath, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

type ArrowKeys = {
  up: Input.Keyboard.Key;
  down: Input.Keyboard.Key;
  left: Input.Keyboard.Key;
  right: Input.Keyboard.Key;
};

/** Move vector. Keyboard is unit length; joystick keeps analog magnitude ≤ 1. */
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
  private readonly hull: GameObjects.Sprite;

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

    const { bodyWidth, bodyHeight } = GameConfig.rover;
    const display = Math.max(bodyWidth, bodyHeight);
    this.hull = new GameObjects.Sprite(scene, 0, 0, 'rover', 0);
    this.hull.setDisplaySize(display, display);
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
   * Inject joystick axes (length ≤ 1). Stick input wins over keyboard while active.
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

    this.syncHullFrame();
  }

  /**
   * Push the rover out of a solid AABB (no physics plugin — circle vs rect).
   */
  public resolveSolidRect(rect: Geom.Rectangle): void {
    const radius = Math.max(GameConfig.rover.bodyWidth, GameConfig.rover.bodyHeight) / 2;
    const closestX = PhaserMath.Clamp(this.x, rect.left, rect.right);
    const closestY = PhaserMath.Clamp(this.y, rect.top, rect.bottom);
    let dx = this.x - closestX;
    let dy = this.y - closestY;
    const distSq = dx * dx + dy * dy;
    const radiusSq = radius * radius;

    if (distSq >= radiusSq) {
      return;
    }

    if (distSq < 0.0001) {
      const overlapLeft = this.x - rect.left;
      const overlapRight = rect.right - this.x;
      const overlapTop = this.y - rect.top;
      const overlapBottom = rect.bottom - this.y;
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      if (minOverlap === overlapLeft) {
        this.x = rect.left - radius;
        this.velocityX = Math.min(this.velocityX, 0);
      } else if (minOverlap === overlapRight) {
        this.x = rect.right + radius;
        this.velocityX = Math.max(this.velocityX, 0);
      } else if (minOverlap === overlapTop) {
        this.y = rect.top - radius;
        this.velocityY = Math.min(this.velocityY, 0);
      } else {
        this.y = rect.bottom + radius;
        this.velocityY = Math.max(this.velocityY, 0);
      }
      this.clampToMap();
      return;
    }

    const dist = Math.sqrt(distSq);
    const nx = dx / dist;
    const ny = dy / dist;
    const push = radius - dist;
    this.x += nx * push;
    this.y += ny * push;
    const into = this.velocityX * nx + this.velocityY * ny;
    if (into < 0) {
      this.velocityX -= into * nx;
      this.velocityY -= into * ny;
    }
    this.clampToMap();
  }

  /** Debug-only: when true, uses `GameConfig.debug.boostSpeed` instead of normal speed. */
  public setSpeedBoostActive(active: boolean): void {
    this.speedBoostActive = active;
  }

  /**
   * Keyboard is unit length (diagonals not faster). Joystick keeps analog magnitude.
   * While the stick is active it wins so a partial tilt is not forced to full speed.
   */
  private readMoveInput(): MoveInput {
    const stickX = this.joystickInputX;
    const stickY = this.joystickInputY;
    if (stickX !== 0 || stickY !== 0) {
      return { x: stickX, y: stickY };
    }

    let x = Number(this.isHeld('right')) - Number(this.isHeld('left'));
    let y = Number(this.isHeld('down')) - Number(this.isHeld('up'));
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
    this.add(graphics);
    this.add(this.hull);
    this.syncHullFrame();
  }

  /**
   * Facing is baked into the 8-dir sheet. Counter-rotate the sprite so the
   * container can still rotate the rear magnet in world space.
   */
  private syncHullFrame(): void {
    const step = Math.PI / 4;
    const wrapped = PhaserMath.Angle.Wrap(this.rotation);
    let index = Math.round(wrapped / step) % 8;
    if (index < 0) {
      index += 8;
    }
    this.hull.setFrame(index);
    this.hull.setRotation(-this.rotation);
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

  private clampToMap(): void {
    const radius = Math.max(GameConfig.rover.bodyWidth, GameConfig.rover.bodyHeight) / 2;
    const inset = GameConfig.map.wallInset + radius;
    const mapWidth = this.scene.registry.get('mapWidth') as number | undefined;
    const mapHeight = this.scene.registry.get('mapHeight') as number | undefined;
    const width = mapWidth ?? GameConfig.map.width;
    const height = mapHeight ?? GameConfig.map.height;
    this.x = PhaserMath.Clamp(this.x, inset, width - inset);
    this.y = PhaserMath.Clamp(this.y, inset, height - inset);
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
