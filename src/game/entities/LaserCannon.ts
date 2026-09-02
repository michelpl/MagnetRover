import { GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { angleToRoverFrame } from '../rover/roverFacing';

/** Front-mounted laser turret. 32-dir baked sprite; yaw stays inside the fire cone. */
export class LaserCannon extends GameObjects.Container {
  private readonly barrel: GameObjects.Sprite;

  public constructor(scene: Scene) {
    super(scene, GameConfig.survival.cannonOffsetX, GameConfig.survival.cannonOffsetY);
    const display = GameConfig.survival.cannonDisplaySize;
    this.barrel = new GameObjects.Sprite(scene, 0, 0, 'laser-cannon', 0);
    this.barrel.setDisplaySize(display, display);
    this.add(this.barrel);
    this.syncBarrelFrame(0);
  }

  /**
   * Ease toward a world facing, then clamp local yaw to ±fireCone/2 of rover facing.
   * `worldAngle` null eases the barrel forward.
   */
  public aimAtWorldAngle(worldAngle: number | null, facing: number, delta: number): void {
    const half = PhaserMath.DegToRad(GameConfig.survival.fireConeDeg / 2);
    const targetLocal =
      worldAngle === null ? 0 : PhaserMath.Clamp(PhaserMath.Angle.Wrap(worldAngle - facing), -half, half);
    const step = GameConfig.survival.cannonYawRate * (delta / 16.6667);
    this.rotation = PhaserMath.Angle.RotateTo(this.rotation, targetLocal, step);
    this.rotation = PhaserMath.Clamp(PhaserMath.Angle.Wrap(this.rotation), -half, half);
    this.syncBarrelFrame(facing);
  }

  public getMuzzleWorldPosition(): { x: number; y: number } {
    const localY = GameConfig.survival.cannonMuzzleLocalY;
    const out = new PhaserMath.Vector2();
    this.getWorldTransformMatrix().transformPoint(0, localY, out);
    return { x: out.x, y: out.y };
  }

  private syncBarrelFrame(facing: number): void {
    const { cannonDirectionCount, fireConeDeg } = GameConfig.survival;
    const worldAngle = facing + this.rotation;
    const facingFrame = angleToRoverFrame(facing, cannonDirectionCount, cannonDirectionCount);
    const aimFrame = angleToRoverFrame(worldAngle, cannonDirectionCount, cannonDirectionCount);
    const maxSteps = Math.floor((fireConeDeg / 2 / 360) * cannonDirectionCount);
    const frame = clampFrameOffset(facingFrame, aimFrame, cannonDirectionCount, maxSteps);
    this.barrel.setFrame(frame);
    this.barrel.setRotation(-worldAngle);
  }
}

function clampFrameOffset(
  facingFrame: number,
  aimFrame: number,
  dirCount: number,
  maxSteps: number,
): number {
  let delta = aimFrame - facingFrame;
  const halfCircle = dirCount / 2;
  if (delta > halfCircle) {
    delta -= dirCount;
  } else if (delta < -halfCircle) {
    delta += dirCount;
  }
  const steps = PhaserMath.Clamp(delta, -maxSteps, maxSteps);
  return (facingFrame + steps + dirCount) % dirCount;
}
