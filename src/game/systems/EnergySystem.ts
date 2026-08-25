import { GameConfig } from '../config/GameConfig';

/**
 * Run energy: starts at level initialEnergy, drains only while the rover moves.
 * No regen; no drain on collect/dump/idle.
 */
export class EnergySystem {
  public energy: number;
  public readonly maxEnergy: number;

  public constructor(initialEnergy: number) {
    this.maxEnergy = initialEnergy;
    this.energy = initialEnergy;
  }

  public get ratio(): number {
    return this.maxEnergy <= 0 ? 0 : this.energy / this.maxEnergy;
  }

  public get isEmpty(): boolean {
    return this.energy <= 0;
  }

  public update(delta: number, isMoving: boolean): void {
    if (!isMoving || this.energy <= 0) {
      return;
    }
    const drain = GameConfig.energy.movementEnergyCost * (delta / 1000);
    this.energy = Math.max(0, this.energy - drain);
  }
}
