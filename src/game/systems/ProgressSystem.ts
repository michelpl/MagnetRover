import type { Scrap } from '../entities/Scrap';
import type { CargoSystem } from './CargoSystem';
import type { DumpSystem } from './DumpSystem';

/**
 * Cleanup progress.
 * remainingObjects = scraps still in the world (Idle + Attracted + Carried).
 * Clean % rises only when scraps are processed at the dump — not when picked up.
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

  /** Scraps not yet processed (includes carried cargo). */
  public get remainingObjects(): number {
    return this.scraps.length;
  }

  public get carriedObjects(): number {
    return this.cargo.length;
  }

  public get processedObjects(): number {
    return this.dump.processedTotal;
  }

  /** ((total - remaining) / total); rises on dump, not on pickup. */
  public get cleanupRatio(): number {
    if (this.totalObjects <= 0) {
      return 1;
    }
    return (this.totalObjects - this.remainingObjects) / this.totalObjects;
  }

  public getCleanPercentage(): number {
    return this.cleanupRatio * 100;
  }

  public get isComplete(): boolean {
    return this.remainingObjects === 0 && this.carriedObjects === 0;
  }
}
