import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

type ArrowKeys = {
  up: Input.Keyboard.Key;
  down: Input.Keyboard.Key;
  left: Input.Keyboard.Key;
  right: Input.Keyboard.Key;
};

export class Rover extends GameObjects.Container {
  private readonly wasd: ArrowKeys;
  private readonly arrows: ArrowKeys;
  private velocityX = 0;
  private velocityY = 0;

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

  public updateRover(delta: number): void {
    const inputX = Number(this.isHeld('right')) - Number(this.isHeld('left'));
    const inputY = Number(this.isHeld('down')) - Number(this.isHeld('up'));

    let targetX = inputX;
    let targetY = inputY;
    if (targetX !== 0 || targetY !== 0) {
      const length = Math.hypot(targetX, targetY);
      targetX /= length;
      targetY /= length;
    }

    const speed = GameConfig.rover.speed;
    this.velocityX = this.damp(
      this.velocityX,
      targetX * speed,
      GameConfig.rover.inputSmoothing,
      delta,
    );
    this.velocityY = this.damp(
      this.velocityY,
      targetY * speed,
      GameConfig.rover.inputSmoothing,
      delta,
    );

    const dt = delta / 1000;
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.clampToMap();

    const moving = Math.abs(this.velocityX) > 8 || Math.abs(this.velocityY) > 8;
    if (moving) {
      const targetRotation = Math.atan2(this.velocityX, -this.velocityY);
      this.rotation = PhaserMath.Angle.RotateTo(
        this.rotation,
        targetRotation,
        GameConfig.rover.rotationSmoothing * (delta / 16.6667),
      );
    }
  }

  private drawBody(): void {
    const { bodyWidth, bodyHeight } = GameConfig.rover;
    const { roverBody, roverCabin, roverAccent } = GameConfig.colors;
    const graphics = this.scene.add.graphics();

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

    this.add(graphics);
  }

  private clampToMap(): void {
    const radius = Math.max(GameConfig.rover.bodyWidth, GameConfig.rover.bodyHeight) / 2;
    this.x = PhaserMath.Clamp(this.x, radius, GameConfig.map.width - radius);
    this.y = PhaserMath.Clamp(this.y, radius, GameConfig.map.height - radius);
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
