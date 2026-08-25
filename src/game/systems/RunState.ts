export type RunOutcome = 'Playing' | 'Won' | 'Lost';

/** Thin run-state flag for win/lose freezes (US-017 / US-018). */
export class RunState {
  private outcome: RunOutcome = 'Playing';

  public get isPlaying(): boolean {
    return this.outcome === 'Playing';
  }

  public get current(): RunOutcome {
    return this.outcome;
  }

  public win(): void {
    if (this.outcome === 'Playing') {
      this.outcome = 'Won';
    }
  }

  public lose(): void {
    if (this.outcome === 'Playing') {
      this.outcome = 'Lost';
    }
  }
}
