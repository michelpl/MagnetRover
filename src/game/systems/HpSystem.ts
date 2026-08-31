import { GameConfig } from '../config/GameConfig';

export type HpSystemOptions = {
  maxHp: number;
  armor: number;
  invulnMs?: number;
};

/** Rover HP, armor reduction, and post-hit invulnerability. */
export class HpSystem {
  public readonly maxHp: number;
  private hp: number;
  private readonly armor: number;
  private readonly invulnMs: number;
  private invulnRemainingMs = 0;
  private onDeath: (() => void) | null = null;

  public constructor(options: HpSystemOptions) {
    this.maxHp = Math.max(1, options.maxHp);
    this.hp = this.maxHp;
    this.armor = Math.max(0, options.armor);
    this.invulnMs = options.invulnMs ?? GameConfig.survival.invulnMs;
  }

  public get currentHp(): number {
    return this.hp;
  }

  public get ratio(): number {
    return this.hp / this.maxHp;
  }

  public get isDead(): boolean {
    return this.hp <= 0;
  }

  public get isInvulnerable(): boolean {
    return this.invulnRemainingMs > 0;
  }

  public setOnDeath(handler: () => void): void {
    this.onDeath = handler;
  }

  public fullHeal(): void {
    this.hp = this.maxHp;
    this.invulnRemainingMs = 0;
  }

  public update(delta: number): void {
    if (this.invulnRemainingMs > 0) {
      this.invulnRemainingMs = Math.max(0, this.invulnRemainingMs - delta);
    }
  }

  public applyDamage(rawAmount: number): boolean {
    if (this.isDead || this.isInvulnerable || rawAmount <= 0) {
      return false;
    }
    const reduced = Math.max(1, rawAmount - this.armor);
    this.hp = Math.max(0, this.hp - reduced);
    this.invulnRemainingMs = this.invulnMs;
    if (this.isDead) {
      this.onDeath?.();
    }
    return true;
  }
}
