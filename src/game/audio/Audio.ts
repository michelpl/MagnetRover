import type { Scene } from 'phaser';
import { Save } from '../save/Save';

export type SfxKey =
  | 'attract'
  | 'stick'
  | 'dump'
  | 'full'
  | 'clean'
  | 'ui'
  | 'fire'
  | 'hit'
  | 'enemyDeath'
  | 'hurt'
  | 'win'
  | 'lose';

/**
 * Failure-safe one-shot SFX. Missing keys never throw into gameplay.
 * Place optional clips at `public/assets/audio/{key}.wav` and preload when present.
 */
let boundScene: Scene | null = null;

export const Audio = {
  bind(scene: Scene): void {
    boundScene = scene;
  },

  /**
   * Optional preload. Only queue keys that were registered; empty folder is fine.
   * Callers may skip this until real clips exist — play() stays safe either way.
   */
  preload(scene: Scene, keys: SfxKey[] = []): void {
    for (const key of keys) {
      scene.load.audio(key, `assets/audio/${key}.wav`);
    }
  },

  play(key: SfxKey, volume = 0.45): void {
    try {
      if (!boundScene) {
        return;
      }
      if (Save.load().sfxMuted) {
        return;
      }
      if (!boundScene.cache.audio.exists(key)) {
        return;
      }
      boundScene.sound.play(key, { volume });
    } catch {
      // Never break a run for audio failures.
    }
  },
};
