import type { Scrap } from '../entities/Scrap';
import type { CargoSystem } from './CargoSystem';
import type { DumpSystem } from './DumpSystem';

/**
 * Cleanup progress.
 * Floor remaining = Idle + Attracted. The clean bar rises when cubes leave the floor.
 * Victory waits until every cube has been dumped (removed from scraps[]).
 */
export class ProgressSystem {
  public readonly totalObjects: number;

  public constructor(
    private readonly scraps: Scrap[],
    private readonly cargo: CargoSystem,
    private readonly dump: DumpSystem,
    totalObjects: number,
  ) {
    this.totalObjects = totalObjects;
  }

  /** Scraps still sitting on the map (not in the queue or the processor). */
  public get floorRemaining(): number {
    return this.scraps.filter(
      (scrap) => scrap.state === 'Idle' || scrap.state === 'Attracted',
    ).length;
  }

  /** Scraps not yet processed (includes carried cargo and in-flight dumps). */
  public get remainingObjects(): number {
    return this.scraps.length;
  }

  public get carriedObjects(): number {
    return this.cargo.length;
  }

  public get processedObjects(): number {
    return this.dump.processedTotal;
  }

  public get processingObjects(): number {
    return this.scraps.filter((scrap) => scrap.state === 'Processing').length;
  }

  /** Cubes that count as collected for coins if the run ends now. */
  public get creditedScrapCount(): number {
    return this.processedObjects + this.carriedObjects + this.processingObjects;
  }

  /** ((total - floor remaining) / total); rises on pickup, not only dump. */
  public get cleanupRatio(): number {
    if (this.totalObjects <= 0) {
      return 1;
    }
    return (this.totalObjects - this.floorRemaining) / this.totalObjects;
  }

  public getCleanPercentage(): number {
    return this.cleanupRatio * 100;
  }

  /** True only after the last scrap has finished dumping at the processor. */
  public get isComplete(): boolean {
    return this.remainingObjects === 0 && this.carriedObjects === 0;
  }
}
