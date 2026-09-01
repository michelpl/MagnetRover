import { GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { angleToRoverFrame } from '../rover/roverFacing';

/** Front-mounted laser turret. 32-dir baked sprite; yaw is clamped to the fire cone. */
export class LaserCannon extends GameObjects.Container {
  private readonly barrel: GameObjects.Sprite;

  public constructor(scene: Scene) {
    super(scene, 0, GameConfig.survival.cannonOffsetY);
    const display = GameConfig.survival.cannonDisplaySize;
    this.barrel = new GameObjects.Sprite(scene, 0, 0, 'laser-cannon', 0);
    this.barrel.setDisplaySize(display, display);
    this.add(this.barrel);
    this.syncBarrelFrame();
  }

  /**
   * Point at a world facing (Phaser rover convention) clamped to the fire cone.
   * `null` snaps the barrel forward.
   */
  public aimAtWorldAngle(worldAngle: number | null): void {
    if (worldAngle === null) {
      this.rotation = 0;
      this.syncBarrelFrame();
      return;
    }
    const facing = this.parentContainer?.rotation ?? 0;
    const half = PhaserMath.DegToRad(GameConfig.survival.fireConeDeg / 2);
    const delta = PhaserMath.Angle.Wrap(worldAngle - facing);
    this.rotation = PhaserMath.Clamp(delta, -half, half);
    this.syncBarrelFrame();
  }

  public getMuzzleWorldPosition(): { x: number; y: number } {
    const localY = GameConfig.survival.cannonMuzzleLocalY;
    const out = new PhaserMath.Vector2();
    this.getWorldTransformMatrix().transformPoint(0, localY, out);
    return { x: out.x, y: out.y };
  }

  private syncBarrelFrame(): void {
    const worldAngle = (this.parentContainer?.rotation ?? 0) + this.rotation;
    const { cannonDirectionCount } = GameConfig.survival;
    const frame = angleToRoverFrame(worldAngle, cannonDirectionCount, cannonDirectionCount);
    this.barrel.setFrame(frame);
    this.barrel.setRotation(-worldAngle);
  }
}
