import { GameObjects, Geom, Input, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { MoveInput } from '../entities/Rover';

/**
 * Semi-transparent virtual stick fixed at bottom-center.
 * Only the base circle is interactive — the rest of the screen stays free for camera / HUD.
 */
export class VirtualJoystick extends GameObjects.Container {
  private readonly base: GameObjects.Graphics;
  private readonly thumb: GameObjects.Graphics;
  private readonly baseRadius: number;
  private readonly thumbRadius: number;

  private axisX = 0;
  private axisY = 0;
  private activePointerId: number | null = null;

  public constructor(scene: Scene) {
    const { baseRadius, thumbRadius, marginBottom } = GameConfig.joystick;
    const x = GameConfig.viewport.width / 2;
    const y = GameConfig.viewport.height - marginBottom;

    super(scene, x, y);

    this.baseRadius = baseRadius;
    this.thumbRadius = thumbRadius;

    this.base = scene.add.graphics();
    this.thumb = scene.add.graphics();
    this.add([this.base, this.thumb]);

    this.redrawIdle();

    this.setSize(baseRadius * 2, baseRadius * 2);
    this.setInteractive(new Geom.Circle(0, 0, baseRadius), Geom.Circle.Contains);
    this.on('pointerdown', this.handlePointerDown, this);

    scene.input.on('pointermove', this.handlePointerMove, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
    scene.input.on('pointerupoutside', this.handlePointerUp, this);

    this.setScrollFactor(0);
    this.setDepth(9_000);
    scene.add.existing(this);
  }

  /** Normalized axes with length ≤ 1. Zeros when idle. */
  public getAxis(): MoveInput {
    return { x: this.axisX, y: this.axisY };
  }

  public destroy(fromScene?: boolean): void {
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
    super.destroy(fromScene);
  }

  private handlePointerDown(pointer: Input.Pointer): void {
    if (this.activePointerId !== null) {
      return;
    }

    this.activePointerId = pointer.id;
    this.updateAxisFromPointer(pointer);
    this.redrawActive();
  }

  private handlePointerMove(pointer: Input.Pointer): void {
    if (pointer.id !== this.activePointerId) {
      return;
    }

    this.updateAxisFromPointer(pointer);
    this.redrawActive();
  }

  private handlePointerUp(pointer: Input.Pointer): void {
    if (pointer.id !== this.activePointerId) {
      return;
    }

    this.activePointerId = null;
    this.axisX = 0;
    this.axisY = 0;
    this.redrawIdle();
  }

  private updateAxisFromPointer(pointer: Input.Pointer): void {
    const dx = pointer.x - this.x;
    const dy = pointer.y - this.y;
    const length = Math.hypot(dx, dy);

    if (length <= 0) {
      this.axisX = 0;
      this.axisY = 0;
      return;
    }

    const clamped = Math.min(length, this.baseRadius);
    this.axisX = (dx / length) * (clamped / this.baseRadius);
    this.axisY = (dy / length) * (clamped / this.baseRadius);
  }

  private redrawIdle(): void {
    const { color, idleOpacity } = GameConfig.joystick;

    this.base.clear();
    this.base.lineStyle(3, color, idleOpacity);
    this.base.strokeCircle(0, 0, this.baseRadius);
    this.base.fillStyle(color, idleOpacity * 0.35);
    this.base.fillCircle(0, 0, this.baseRadius);

    this.thumb.clear();
    this.thumb.setVisible(false);
  }

  private redrawActive(): void {
    const { color, opacity } = GameConfig.joystick;
    const thumbX = this.axisX * this.baseRadius;
    const thumbY = this.axisY * this.baseRadius;

    this.base.clear();
    this.base.lineStyle(3, color, opacity);
    this.base.strokeCircle(0, 0, this.baseRadius);
    this.base.fillStyle(color, opacity * 0.25);
    this.base.fillCircle(0, 0, this.baseRadius);

    this.thumb.setVisible(true);
    this.thumb.clear();
    this.thumb.fillStyle(color, opacity);
    this.thumb.fillCircle(thumbX, thumbY, this.thumbRadius);
    this.thumb.lineStyle(2, color, Math.min(1, opacity + 0.25));
    this.thumb.strokeCircle(thumbX, thumbY, this.thumbRadius);
  }
}
