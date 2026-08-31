import type { EnemyRecipe, StageConfig, WaveConfig } from '../config/StageConfig';
import { GameConfig } from '../config/GameConfig';
import { Enemy } from '../entities/Enemy';
import type { Rover } from '../entities/Rover';
import { Scene } from 'phaser';

export type SpawnEnemyFn = (x: number, y: number, recipe: EnemyRecipe) => Enemy;

type BurstState = {
  burstIndex: number;
  spawnedInBurst: number;
  timerMs: number;
  breatherMs: number;
  inBreather: boolean;
};

/** Spawns enemies in bursts with breathers — gameplay never pauses. */
export class WaveSpawnSystem {
  public waveFullySpawned = false;
  private readonly wave: WaveConfig;
  private readonly recipe: EnemyRecipe;
  private readonly state: BurstState = {
    burstIndex: 0,
    spawnedInBurst: 0,
    timerMs: 0,
    breatherMs: 0,
    inBreather: false,
  };

  public constructor(
    private readonly scene: Scene,
    stage: StageConfig,
    private readonly rover: Rover,
    private readonly spawnEnemy: SpawnEnemyFn,
  ) {
    this.wave = stage.wave;
    this.recipe = stage.enemyRecipe;
  }

  public update(delta: number): void {
    if (this.waveFullySpawned) {
      return;
    }

    const burst = this.wave.bursts[this.state.burstIndex];
    if (!burst) {
      this.waveFullySpawned = true;
      return;
    }

    if (this.state.inBreather) {
      this.state.breatherMs -= delta;
      if (this.state.breatherMs <= 0) {
        this.state.inBreather = false;
        this.state.burstIndex += 1;
        this.state.spawnedInBurst = 0;
        this.state.timerMs = 0;
        if (this.state.burstIndex >= this.wave.bursts.length) {
          this.waveFullySpawned = true;
        }
      }
      return;
    }

    if (this.state.spawnedInBurst >= burst.count) {
      if (burst.delayAfterMs > 0) {
        this.state.inBreather = true;
        this.state.breatherMs = burst.delayAfterMs;
      } else {
        this.state.burstIndex += 1;
        this.state.spawnedInBurst = 0;
        this.state.timerMs = 0;
        if (this.state.burstIndex >= this.wave.bursts.length) {
          this.waveFullySpawned = true;
        }
      }
      return;
    }

    this.state.timerMs -= delta;
    if (this.state.timerMs > 0) {
      return;
    }

    const pos = this.pickSpawnPosition();
    this.spawnEnemy(pos.x, pos.y, this.recipe);
    this.state.spawnedInBurst += 1;
    this.state.timerMs = burst.intervalMs;
  }

  private pickSpawnPosition(): { x: number; y: number } {
    const mapWidth =
      (this.scene.registry.get('mapWidth') as number | undefined) ?? GameConfig.map.width;
    const mapHeight =
      (this.scene.registry.get('mapHeight') as number | undefined) ?? GameConfig.map.height;
    const inset = GameConfig.survival.spawnEdgeInset;
    const minDist = GameConfig.survival.spawnMinDistanceFromRover;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const edge = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (edge === 0) {
        x = inset + Math.random() * (mapWidth - inset * 2);
        y = inset;
      } else if (edge === 1) {
        x = mapWidth - inset;
        y = inset + Math.random() * (mapHeight - inset * 2);
      } else if (edge === 2) {
        x = inset + Math.random() * (mapWidth - inset * 2);
        y = mapHeight - inset;
      } else {
        x = inset;
        y = inset + Math.random() * (mapHeight - inset * 2);
      }
      if (Math.hypot(x - this.rover.x, y - this.rover.y) >= minDist) {
        return { x, y };
      }
    }

    return {
      x: Math.max(inset, Math.min(mapWidth - inset, this.rover.x + minDist)),
      y: Math.max(inset, Math.min(mapHeight - inset, this.rover.y)),
    };
  }
}
