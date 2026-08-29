import { GameObjects, Input, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { MoveInput } from '../entities/Rover';

/**
 * Semi-transparent virtual stick, fixed at bottom-center.
 * Drag can start anywhere in the bottom capture band; the visual base does not move.
 */
export class VirtualJoystick extends GameObjects.Container {
  private readonly base: GameObjects.Graphics;
  private readonly thumb: GameObjects.Graphics;
  private readonly capture: GameObjects.Zone;
  private readonly baseRadius: number;
  private readonly thumbRadius: number;
  private readonly deadzonePx: number;

  private axisX = 0;
  private axisY = 0;
  private thumbX = 0;
  private thumbY = 0;
  private activePointerId: number | null = null;

  public constructor(scene: Scene) {
    const { baseRadius, thumbRadius, marginBottom, deadzone, captureHeightRatio } =
      GameConfig.joystick;
    const { width, height } = GameConfig.viewport;
    const x = width / 2;
    const y = height - marginBottom;

    super(scene, x, y);

    this.baseRadius = baseRadius;
    this.thumbRadius = thumbRadius;
    this.deadzonePx = deadzone * baseRadius;

    this.base = scene.add.graphics();
    this.thumb = scene.add.graphics();
    this.add([this.base, this.thumb]);

    this.redrawIdle();

    const captureHeight = height * captureHeightRatio;
    this.capture = scene.add.zone(width / 2, height - captureHeight / 2, width, captureHeight);
    this.capture.setScrollFactor(0);
    this.capture.setDepth(1_500);
    this.capture.setInteractive();
    this.capture.on('pointerdown', this.handlePointerDown, this);

    scene.input.on('pointermove', this.handlePointerMove, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
    scene.input.on('pointerupoutside', this.handlePointerUp, this);

    this.setScrollFactor(0);
    this.setDepth(9_000);
    scene.add.existing(this);
  }

  /** Analog axes with length ≤ 1. Zeros when idle or inside the deadzone. */
  public getAxis(): MoveInput {
    return { x: this.axisX, y: this.axisY };
  }

  /** Drop the current stick so pause / overlays do not keep the rover moving. */
  public release(): void {
    this.clearStick();
    this.redrawIdle();
  }

  public destroy(fromScene?: boolean): void {
    this.capture.off('pointerdown', this.handlePointerDown, this);
    this.capture.destroy();
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
    super.destroy(fromScene);
  }

  private clearStick(): void {
    this.activePointerId = null;
    this.axisX = 0;
    this.axisY = 0;
    this.thumbX = 0;
    this.thumbY = 0;
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

    this.clearStick();
    this.redrawIdle();
  }

  private updateAxisFromPointer(pointer: Input.Pointer): void {
    const dx = pointer.x - this.x;
    const dy = pointer.y - this.y;
    const length = Math.hypot(dx, dy);

    if (length <= 0) {
      this.axisX = 0;
      this.axisY = 0;
      this.thumbX = 0;
      this.thumbY = 0;
      return;
    }

    const clamped = Math.min(length, this.baseRadius);
    this.thumbX = (dx / length) * clamped;
    this.thumbY = (dy / length) * clamped;

    if (length <= this.deadzonePx) {
      this.axisX = 0;
      this.axisY = 0;
      return;
    }

    const usable = this.baseRadius - this.deadzonePx;
    const analog = (clamped - this.deadzonePx) / usable;
    this.axisX = (dx / length) * analog;
    this.axisY = (dy / length) * analog;
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

    this.base.clear();
    this.base.lineStyle(3, color, opacity);
    this.base.strokeCircle(0, 0, this.baseRadius);
    this.base.fillStyle(color, opacity * 0.25);
    this.base.fillCircle(0, 0, this.baseRadius);

    this.thumb.setVisible(true);
    this.thumb.clear();
    this.thumb.fillStyle(color, opacity);
    this.thumb.fillCircle(this.thumbX, this.thumbY, this.thumbRadius);
    this.thumb.lineStyle(2, color, Math.min(1, opacity + 0.25));
    this.thumb.strokeCircle(this.thumbX, this.thumbY, this.thumbRadius);
  }
}
