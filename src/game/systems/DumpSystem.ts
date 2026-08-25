import { Audio } from '../audio/Audio';
import { Haptics } from '../audio/Haptics';
import { GameConfig } from '../config/GameConfig';
import type { Processor } from '../entities/Processor';
import type { Rover } from '../entities/Rover';
import type { Scrap } from '../entities/Scrap';
import { Upgrades } from '../save/Upgrades';
import type { CargoSystem } from './CargoSystem';

/**
 * Drive-in dump: while the rover overlaps the processor with cargo, unload
 * cubes one-by-one with a short tween into the machine.
 */
export class DumpSystem {
  private dumping = false;
  private cooldownMs = 0;
  private processedCount = 0;
  private onProcessed: (() => void) | null = null;

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

  public setOnProcessed(fn: () => void): void {
    this.onProcessed = fn;
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
    scrap.setAttractGlow(false);

    const scene = this.rover.scene;
    const { dumpIntervalMs } = GameConfig.processor;

    Audio.play('dump', 0.4);
    Haptics.vibrate(8);
    scene.cameras.main.shake(dumpIntervalMs, 0.0025);

    scene.tweens.add({
      targets: scrap,
      x: this.processor.x,
      y: this.processor.y,
      scaleX: 0.1,
      scaleY: 0.1,
      angle: scrap.angle + 220,
      duration: dumpIntervalMs,
      ease: 'Back.easeIn',
      onComplete: () => {
        this.spawnDumpBurst();
        this.finishScrap(scrap);
        this.dumping = false;
        this.cooldownMs = dumpIntervalMs;
      },
    });
  }

  private spawnDumpBurst(): void {
    const scene = this.rover.scene;
    const burst = scene.add.circle(
      this.processor.x,
      this.processor.y,
      12,
      GameConfig.colors.processorAccent,
      0.8,
    );
    scene.tweens.add({
      targets: burst,
      scaleX: 3.5,
      scaleY: 3.5,
      alpha: 0,
      duration: 180,
      onComplete: () => burst.destroy(),
    });
  }

  private finishScrap(scrap: Scrap): void {
    const index = this.scraps.indexOf(scrap);
    if (index >= 0) {
      this.scraps.splice(index, 1);
    }
    scrap.destroy();
    this.processedCount += 1;
    // Persist 1 coin per processed scrap immediately (US-028); retry keeps earned coins.
    Upgrades.addCoins(1);
    this.onProcessed?.();
  }
}
