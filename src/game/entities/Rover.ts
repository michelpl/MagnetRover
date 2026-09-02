import { GameObjects, Geom, Input, Math as PhaserMath, Scene } from 'phaser';
import {
  clampToMap,
  hullRadius,
  resolveCircleVsRect,
} from '../collision/solidBody';
import { GameConfig } from '../config/GameConfig';
import {
  angleToRoverFrame,
  moveInputToFacing,
  roverFrameToAngle,
} from '../rover/roverFacing';
import { DustTrailFx } from './DustTrailFx';
import { LaserCannon } from './LaserCannon';
import { RoverTreadFx } from './RoverTreadFx';

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

const ROTATION_SNAP_RAD = PhaserMath.DegToRad(5);

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
  private readonly hullLayer: GameObjects.Container;
  private readonly hull: GameObjects.Sprite;
  private readonly weaponBase: GameObjects.Sprite;
  private readonly treadFx: RoverTreadFx;
  private readonly dustFx: DustTrailFx;
  private readonly cannon: LaserCannon;

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
    const { cannonOffsetX, cannonOffsetY, cannonDisplaySize } = GameConfig.survival;
    this.weaponBase = new GameObjects.Sprite(scene, cannonOffsetX, cannonOffsetY, 'weapon-base', 0);
    this.weaponBase.setDisplaySize(cannonDisplaySize, cannonDisplaySize);
    this.treadFx = new RoverTreadFx(scene);
    this.hullLayer = new GameObjects.Container(scene, 0, 0, [this.hull, this.treadFx]);
    this.dustFx = new DustTrailFx(scene, 'player');
    this.cannon = new LaserCannon(scene);
    this.add(this.hullLayer);
    this.add(this.weaponBase);
    this.add(this.cannon);
    this.syncHullFrame();
    scene.add.existing(this);
    this.once('destroy', () => this.dustFx.destroy());
  }

  public getDustFx(): DustTrailFx {
    return this.dustFx;
  }

  public getCannon(): LaserCannon {
    return this.cannon;
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
    const hasInput = input.x !== 0 || input.y !== 0;
    const speed = this.speedBoostActive
      ? GameConfig.debug.boostSpeed
      : this.moveSpeed;
    const {
      accelSmoothing,
      brakeSmoothing,
      stopSnapSpeed,
      rotationSmoothing,
    } = GameConfig.rover;
    const smoothing = hasInput ? accelSmoothing : brakeSmoothing;

    this.velocityX = this.damp(
      this.velocityX,
      input.x * speed,
      smoothing,
      delta,
    );
    this.velocityY = this.damp(
      this.velocityY,
      input.y * speed,
      smoothing,
      delta,
    );

    if (!hasInput) {
      const currentSpeed = Math.hypot(this.velocityX, this.velocityY);
      if (currentSpeed < stopSnapSpeed) {
        this.velocityX = 0;
        this.velocityY = 0;
      }
    }

    const dt = delta / 1000;
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.clampToMap();

    const inputFacing = moveInputToFacing(input);
    let targetRotation: number | null = inputFacing;
    if (targetRotation === null && this.isMoving) {
      targetRotation = Math.atan2(this.velocityX, -this.velocityY);
    }

    if (targetRotation !== null) {
      const angleDelta = PhaserMath.Angle.ShortestBetween(
        this.rotation,
        targetRotation,
      );
      if (Math.abs(angleDelta) < ROTATION_SNAP_RAD) {
        this.rotation = targetRotation;
      } else {
        this.rotation = PhaserMath.Angle.RotateTo(
          this.rotation,
          targetRotation,
          rotationSmoothing * (delta / 16.6667),
        );
      }
    }

    this.syncHullFrame(input);
    const currentSpeed = Math.hypot(this.velocityX, this.velocityY);
    this.treadFx.updateFx(currentSpeed, speed, delta);
    this.dustFx.updateTrail(this.x, this.y, this.rotation, currentSpeed, delta);
  }

  /**
   * Push the rover out of a solid AABB (no physics plugin — circle vs rect).
   */
  public resolveSolidRect(rect: Geom.Rectangle): void {
    const vel = { velocityX: this.velocityX, velocityY: this.velocityY };
    resolveCircleVsRect(this, vel, hullRadius(), rect);
    this.velocityX = vel.velocityX;
    this.velocityY = vel.velocityY;
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

  /**
   * Facing is baked into the hull sheet. Counter-rotate the hull layer so the
   * container can still yaw the laser cannon in world space.
   */
  private syncHullFrame(input?: MoveInput): void {
    const move = input ?? this.readMoveInput();
    let facing = moveInputToFacing(move);
    if (facing === null) {
      if (this.velocityX !== 0 || this.velocityY !== 0) {
        facing = Math.atan2(this.velocityX, -this.velocityY);
      } else {
        facing = this.rotation;
      }
    }
    const frame = angleToRoverFrame(facing);
    this.hull.setFrame(frame);
    this.weaponBase.setFrame(frame);
    this.weaponBase.setRotation(-this.rotation);
    this.hullLayer.setRotation(-this.rotation);
    // Hull art is pre-rotated in the sheet; the layer cancels container yaw so the
    // cannon can still turn in world space. Tread FX is procedural, so it must be
    // rotated to the baked frame or the highlights sit on world axes (often opposite
    // the hull).
    this.treadFx.setRotation(roverFrameToAngle(frame));
  }

  private clampToMap(): void {
    const mapWidth = this.scene.registry.get('mapWidth') as number | undefined;
    const mapHeight = this.scene.registry.get('mapHeight') as number | undefined;
    clampToMap(
      this,
      hullRadius(),
      mapWidth ?? GameConfig.map.width,
      mapHeight ?? GameConfig.map.height,
    );
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
