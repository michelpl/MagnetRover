import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import type { MoveInput } from '../entities/Rover';
import { isPointerOnEnergyPanel, isPointerOnPlayHudButton } from './hudHit';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

/**
 * Virtual stick that appears at the finger in the bottom capture band.
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
  private captureEnabled = true;

  public constructor(scene: Scene) {
    const { baseRadius, thumbRadius, deadzone } = GameConfig.joystick;
    const rest = restPosition(scene, baseRadius);
    super(scene, rest.x, rest.y);

    this.baseRadius = baseRadius;
    this.thumbRadius = thumbRadius;
    this.deadzonePx = deadzone * baseRadius;

    this.base = scene.add.graphics();
    this.thumb = scene.add.graphics();
    this.add([this.base, this.thumb]);

    this.redrawIdle();

    this.capture = scene.add.zone(0, 0, 1, 1);
    this.capture.setScrollFactor(0);
    this.capture.setDepth(1_500);
    this.capture.on('pointerdown', this.handlePointerDown, this);

    scene.input.on('pointermove', this.handlePointerMove, this);
    scene.input.on('pointerup', this.handlePointerUp, this);
    scene.input.on('pointerupoutside', this.handlePointerUp, this);

    this.setScrollFactor(0);
    this.setDepth(9_000);
    scene.add.existing(this);
    ignoreWorldCamera(scene, this);
    ignoreWorldCamera(scene, this.capture);

    bindViewResize(scene, () => this.layoutCapture());
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

  public setCaptureEnabled(enabled: boolean): void {
    this.captureEnabled = enabled;
    if (enabled) {
      this.capture.setInteractive();
    } else {
      this.capture.disableInteractive();
    }
  }

  public destroy(fromScene?: boolean): void {
    this.capture.off('pointerdown', this.handlePointerDown, this);
    this.capture.destroy();
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
    super.destroy(fromScene);
  }

  private layoutCapture(): void {
    const { width, height } = viewSize(this.scene);
    const captureHeight = height * GameConfig.joystick.captureHeightRatio;
    this.capture.setPosition(width / 2, height - captureHeight / 2);
    this.capture.setSize(width, captureHeight);
    if (this.captureEnabled) {
      this.capture.setInteractive();
    }
    if (this.activePointerId === null) {
      const rest = restPosition(this.scene, this.baseRadius);
      this.setPosition(rest.x, rest.y);
    }
  }

  private clearStick(): void {
    this.activePointerId = null;
    this.axisX = 0;
    this.axisY = 0;
    this.thumbX = 0;
    this.thumbY = 0;
  }

  private handlePointerDown(pointer: Input.Pointer): void {
    if (!this.captureEnabled || this.activePointerId !== null) {
      return;
    }
    if (isPointerOnEnergyPanel(this.scene, pointer.x, pointer.y)) {
      return;
    }
    if (isPointerOnPlayHudButton(this.scene, pointer.x, pointer.y)) {
      return;
    }

    this.activePointerId = pointer.id;
    this.placeAtPointer(pointer);
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

  private placeAtPointer(pointer: Input.Pointer): void {
    const { width, height } = viewSize(this.scene);
    const r = this.baseRadius;
    const bandTop = height * (1 - GameConfig.joystick.captureHeightRatio);
    this.x = PhaserMath.Clamp(pointer.x, r, width - r);
    this.y = PhaserMath.Clamp(pointer.y, bandTop + r, height - r);
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

function restPosition(scene: Scene, baseRadius: number): { x: number; y: number } {
  const { width, height } = viewSize(scene);
  const { marginBottom } = GameConfig.joystick;
  const inset = safeInsets(scene);
  return {
    x: width / 2,
    y: Math.min(height - inset.bottom - marginBottom, height - inset.bottom - baseRadius),
  };
}
