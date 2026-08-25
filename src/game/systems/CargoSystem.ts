import { GameConfig } from '../config/GameConfig';
import type { Rover } from '../entities/Rover';
import type { Scrap } from '../entities/Scrap';

export type WorldPoint = { x: number; y: number };

/**
 * Ordered malleable cargo queue behind the rear magnet (snake/train).
 * No fixed orbital slots around the hull.
 */
export class CargoSystem {
  public readonly cargo: Scrap[] = [];

  public constructor(
    private readonly rover: Rover,
    private readonly scraps: Scrap[],
  ) {}

  public get length(): number {
    return this.cargo.length;
  }

  /** Tip of the queue: magnet when empty, otherwise the last carried cube. */
  public getQueueTip(magnet: WorldPoint): WorldPoint {
    if (this.cargo.length === 0) {
      return magnet;
    }
    const last = this.cargo[this.cargo.length - 1];
    return { x: last.x, y: last.y };
  }

  public attach(scrap: Scrap): void {
    if (scrap.state === 'Carried') {
      return;
    }
    scrap.state = 'Carried';
    this.cargo.push(scrap);
  }

  public detachAll(): Scrap[] {
    const detached = this.cargo.slice();
    this.cargo.length = 0;
    return detached;
  }

  /**
   * Attracted scraps close enough to magnet / tip become Carried;
   * then each carried cube lerps toward the previous segment.
   */
  public update(delta: number): void {
    const magnet = this.rover.getMagnetWorldPosition();
    this.tryAttachAttracted(magnet);
    this.updateQueueFollow(magnet, delta);
  }

  private tryAttachAttracted(magnet: WorldPoint): void {
    const tip = this.getQueueTip(magnet);
    const stickSq = GameConfig.cargo.stickRadius * GameConfig.cargo.stickRadius;

    for (const scrap of this.scraps) {
      if (scrap.state !== 'Attracted') {
        continue;
      }
      const dx = scrap.x - tip.x;
      const dy = scrap.y - tip.y;
      if (dx * dx + dy * dy <= stickSq) {
        this.attach(scrap);
      }
    }
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

      // Just stuck: place behind previous along rover rear (local +Y).
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
