import { GameConfig } from '../config/GameConfig';
import type { Processor } from '../entities/Processor';
import type { Rover } from '../entities/Rover';
import type { Scrap } from '../entities/Scrap';
import type { CargoSystem } from './CargoSystem';

/**
 * Drive-in dump: while the rover overlaps the processor with cargo, unload
 * cubes one-by-one with a short tween into the machine.
 */
export class DumpSystem {
  private dumping = false;
  private cooldownMs = 0;
  private processedCount = 0;

  public constructor(
    private readonly rover: Rover,
    private readonly processor: Processor,
    private readonly cargo: CargoSystem,
    private readonly scraps: Scrap[],
  ) {}

  /** Cubes successfully dumped this run (hook for progress / coins). */
  public get processedTotal(): number {
    return this.processedCount;
  }

  public update(delta: number): void {
    if (this.cooldownMs > 0) {
      this.cooldownMs -= delta;
    }

    if (this.dumping || this.cooldownMs > 0) {
      return;
    }

    if (this.cargo.length === 0) {
      return;
    }

    if (!this.processor.containsPoint(this.rover.x, this.rover.y)) {
      return;
    }

    this.startNextDump();
  }

  private startNextDump(): void {
    const scrap = this.cargo.shiftFront();
    if (!scrap) {
      return;
    }

    this.dumping = true;
    scrap.state = 'Processing';

    const scene = this.rover.scene;
    const { dumpIntervalMs } = GameConfig.processor;

    scene.tweens.add({
      targets: scrap,
      x: this.processor.x,
      y: this.processor.y,
      scaleX: 0.15,
      scaleY: 0.15,
      angle: scrap.angle + 180,
      duration: dumpIntervalMs,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.finishScrap(scrap);
        this.dumping = false;
        this.cooldownMs = dumpIntervalMs;
      },
    });
  }

  private finishScrap(scrap: Scrap): void {
    const index = this.scraps.indexOf(scrap);
    if (index >= 0) {
      this.scraps.splice(index, 1);
    }
    scrap.destroy();
    this.processedCount += 1;
  }
}
