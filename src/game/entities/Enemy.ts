import { GameObjects, Geom, Math as PhaserMath, Scene } from 'phaser';
import { ignoreUiCamera } from '../cameras/GameCameras';
import {
  clampToMap,
  hullRadius,
  resolveCircleVsRect,
} from '../collision/solidBody';
import { GameConfig } from '../config/GameConfig';
import type { EnemyRecipe } from '../config/StageConfig';
import { angleToRoverFrame, roverFrameToAngle } from '../rover/roverFacing';
import { DustTrailFx } from './DustTrailFx';
import { RoverTreadFx } from './RoverTreadFx';

/** Hostile rover placeholder — arcade chase toward the player. */
export class Enemy extends GameObjects.Container {
  public hp: number;
  public readonly maxHp: number;
  public readonly contactDamage: number;
  private readonly speed: number;
  private hitFlashMs = 0;
  private readonly hullLayer: GameObjects.Container;
  private readonly hull: GameObjects.Sprite;
  private readonly treadFx: RoverTreadFx;
  private readonly dustFx: DustTrailFx;

  public constructor(scene: Scene, x: number, y: number, recipe: EnemyRecipe) {
    super(scene, x, y);
    this.maxHp = recipe.hp;
    this.hp = recipe.hp;
    this.speed = recipe.speed;
    this.contactDamage = recipe.contactDamage;

    const display = Math.max(GameConfig.rover.bodyWidth, GameConfig.rover.bodyHeight);
    this.hull = new GameObjects.Sprite(scene, 0, 0, 'rover', 0);
    this.hull.setDisplaySize(display, display);
    this.hull.setTint(0xff6b6b);
    this.treadFx = new RoverTreadFx(scene);
    this.hullLayer = new GameObjects.Container(scene, 0, 0, [this.hull, this.treadFx]);
    this.dustFx = new DustTrailFx(scene, 'enemy');
    this.add(this.hullLayer);
    this.syncHullFrame();
    scene.add.existing(this);
    ignoreUiCamera(scene, this);
    ignoreUiCamera(scene, this.dustFx);
    this.once('destroy', () => this.dustFx.destroy());
  }

  public updateChase(
    delta: number,
    targetX: number,
    targetY: number,
  ): void {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 4) {
      const step = (this.speed * delta) / 1000;
      const nx = dx / dist;
      const ny = dy / dist;
      this.x += nx * step;
      this.y += ny * step;
      this.rotation = PhaserMath.Angle.RotateTo(
        this.rotation,
        Math.atan2(nx, -ny),
        GameConfig.rover.rotationSmoothing,
      );
    }
    this.syncHullFrame();
    const currentSpeed = dist > 4 ? this.speed : 0;
    this.treadFx.updateFx(currentSpeed, this.speed, delta);
    this.dustFx.updateTrail(this.x, this.y, this.rotation, currentSpeed, delta);

    if (this.hitFlashMs > 0) {
      this.hitFlashMs = Math.max(0, this.hitFlashMs - delta);
      this.hull.setTint(this.hitFlashMs > 0 ? 0xffffff : 0xff6b6b);
    }
  }

  public resolveSolidRect(rect: Geom.Rectangle): void {
    resolveCircleVsRect(this, null, hullRadius(), rect);
  }

  public clampToWorld(mapWidth: number, mapHeight: number): void {
    clampToMap(this, hullRadius(), mapWidth, mapHeight);
  }

  public flashHit(): void {
    this.hitFlashMs = GameConfig.survival.hitFlashMs;
    this.hull.setTint(0xffffff);
  }

  public playDeath(scene: Scene, onComplete: () => void): void {
    scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        this.destroy();
        onComplete();
      },
    });
  }

  private syncHullFrame(): void {
    const frame = angleToRoverFrame(this.rotation);
    this.hull.setFrame(frame);
    this.hullLayer.setRotation(-this.rotation);
    this.treadFx.setRotation(roverFrameToAngle(frame));
  }
}
