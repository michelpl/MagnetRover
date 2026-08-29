import { GameConfig } from '../config/GameConfig';

/**
 * Run energy: starts at full rover battery, drains only while moving.
 * Drain rate is global. Pickups restore; no drain on collect/dump/idle.
 */
export class EnergySystem {
  public energy: number;
  public readonly maxEnergy: number;

  public constructor(maxEnergy: number) {
    this.maxEnergy = maxEnergy;
    this.energy = maxEnergy;
  }

  public get ratio(): number {
    return this.maxEnergy <= 0 ? 0 : this.energy / this.maxEnergy;
  }

  public get isEmpty(): boolean {
    return this.energy <= 0;
  }

  /** Restore energy from a pickup; clamped to max. */
  public addEnergy(amount: number): void {
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
  }

  public update(delta: number, isMoving: boolean): void {
    if (!isMoving || this.energy <= 0) {
      return;
    }
    const drain = GameConfig.energy.movementEnergyCost * (delta / 1000);
    this.energy = Math.max(0, this.energy - drain);
  }
}
