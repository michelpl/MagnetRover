import { GameObjects } from 'phaser';
import { Audio } from '../audio/Audio';
import { Haptics } from '../audio/Haptics';
import { GameConfig } from '../config/GameConfig';
import type { Processor } from '../entities/Processor';
import type { Rover } from '../entities/Rover';
import type { Scrap } from '../entities/Scrap';

export type WorldPoint = { x: number; y: number };

/**
 * Ordered malleable cargo queue behind the rear magnet (snake/train).
 * No fixed orbital slots around the hull.
 */
export class CargoSystem {
  public readonly cargo: Scrap[] = [];
  private capacity: number = GameConfig.rover.capacity;
  private fullCue: GameObjects.Text | null = null;
  private wasFull = false;
  private attachStaggerMs = 0;
  private processor: Processor | null = null;

  public constructor(
    private readonly rover: Rover,
    private readonly scraps: Scrap[],
    capacity: number = GameConfig.rover.capacity,
  ) {
    this.capacity = capacity;
  }

  public setCapacity(capacity: number): void {
    this.capacity = capacity;
  }

  public setProcessor(processor: Processor): void {
    this.processor = processor;
  }

  public get length(): number {
    return this.cargo.length;
  }

  public get isFull(): boolean {
    return this.cargo.length >= this.capacity;
  }

  public canAccept(): boolean {
    return this.cargo.length < this.capacity;
  }

  /** Tip of the queue: magnet when empty, otherwise the last carried cube. */
  public getQueueTip(magnet: WorldPoint): WorldPoint {
    if (this.cargo.length === 0) {
      return magnet;
    }
    const last = this.cargo[this.cargo.length - 1];
    return { x: last.x, y: last.y };
  }

  public attach(scrap: Scrap): boolean {
    if (scrap.state === 'Carried' || !this.canAccept()) {
      return false;
    }
    scrap.state = 'Carried';
    scrap.setAttractGlow(false);
    this.cargo.push(scrap);
    this.playAttachFeedback(scrap);
    return true;
  }

  public detachAll(): Scrap[] {
    const detached = this.cargo.slice();
    this.cargo.length = 0;
    return detached;
  }

  /** Remove and return the front of the queue (nearest the magnet) for dumping. */
  public shiftFront(): Scrap | undefined {
    return this.cargo.shift();
  }

  /**
   * Attracted scraps close enough to magnet / tip become Carried;
   * then each carried cube lerps toward the previous segment.
   */
  public update(delta: number): void {
    if (this.attachStaggerMs > 0) {
      this.attachStaggerMs -= delta;
    }
    const magnet = this.rover.getMagnetWorldPosition();
    this.tryAttachAttracted(magnet);
    this.releaseOverflowAttracted();
    this.updateQueueFollow(magnet, delta);
    this.updateFullCue();
  }

  private playAttachFeedback(scrap: Scrap): void {
    Audio.play('stick', 0.4);
    Haptics.vibrate(10);
    this.rover.scene.tweens.add({
      targets: scrap,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 70,
      yoyo: true,
      ease: 'Quad.easeOut',
    });
  }

  private tryAttachAttracted(magnet: WorldPoint): void {
    if (!this.canAccept() || this.attachStaggerMs > 0) {
      return;
    }
    const tip = this.getQueueTip(magnet);
    const stickSq = GameConfig.cargo.stickRadius * GameConfig.cargo.stickRadius;

    for (const scrap of this.scraps) {
      if (!this.canAccept()) {
        break;
      }
      if (scrap.state !== 'Attracted') {
        continue;
      }
      const dx = scrap.x - tip.x;
      const dy = scrap.y - tip.y;
      if (dx * dx + dy * dy <= stickSq) {
        if (this.attach(scrap)) {
          this.attachStaggerMs = 28;
          break;
        }
      }
    }
  }

  /** When cargo is full, Attracted scraps that cannot join drop back to Idle. */
  private releaseOverflowAttracted(): void {
    if (!this.isFull) {
      return;
    }
    for (const scrap of this.scraps) {
      if (scrap.state === 'Attracted') {
        scrap.state = 'Idle';
        scrap.setAttractGlow(false);
      }
    }
  }

  private updateFullCue(): void {
    const full = this.isFull;
    if (full && !this.wasFull) {
      this.showFullCue();
      Audio.play('full', 0.5);
      Haptics.vibrate(18);
      this.rover.scene.tweens.add({
        targets: this.rover,
        scaleX: 1.12,
        scaleY: 1.12,
        duration: 90,
        yoyo: true,
        repeat: 1,
      });
      this.processor?.setHintPulse(true);
    }
    if (!full) {
      this.processor?.setHintPulse(false);
      if (this.fullCue) {
        this.fullCue.destroy();
        this.fullCue = null;
      }
    }
    this.wasFull = full;

    if (this.fullCue) {
      this.fullCue.setPosition(this.rover.x, this.rover.y - 70);
    }
  }

  private showFullCue(): void {
    if (this.fullCue) {
      this.fullCue.destroy();
    }
    const text = this.rover.scene.add
      .text(this.rover.x, this.rover.y - 70, 'FULL — dump at processor', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffd43b',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(1000);

    this.fullCue = text;
    this.rover.scene.tweens.add({
      targets: text,
      alpha: { from: 1, to: 0.35 },
      duration: 280,
      yoyo: true,
      repeat: 2,
    });

    this.rover.scene.time.delayedCall(GameConfig.cargo.fullCueDurationMs, () => {
      if (this.fullCue === text) {
        text.destroy();
        this.fullCue = null;
      }
    });
  }

  private updateQueueFollow(magnet: WorldPoint, delta: number): void {
    const { spacing, followSmoothing, wobbleAmplitude, wobbleFrequency } =
      GameConfig.cargo;
    const t = 1 - Math.pow(1 - followSmoothing, delta / 16.6667);
    const timeSec = this.rover.scene.time.now / 1000;

    let prevX = magnet.x;
    let prevY = magnet.y;

    for (let i = 0; i < this.cargo.length; i += 1) {
      const scrap = this.cargo[i];
      let dx = scrap.x - prevX;
      let dy = scrap.y - prevY;
      let dist = Math.hypot(dx, dy);

      if (dist < 0.001) {
        const facing = this.rover.rotation;
        dx = -Math.sin(facing);
        dy = Math.cos(facing);
        dist = 1;
      }

      const inv = 1 / dist;
      const targetX = prevX + dx * inv * spacing;
      const targetY = prevY + dy * inv * spacing;

      const wobble =
        wobbleAmplitude * Math.sin(timeSec * wobbleFrequency * Math.PI * 2 + i * 0.7);
      const perpX = -dy * inv;
      const perpY = dx * inv;

      scrap.x += (targetX + perpX * wobble - scrap.x) * t;
      scrap.y += (targetY + perpY * wobble - scrap.y) * t;

      prevX = scrap.x;
      prevY = scrap.y;
    }
  }
}
