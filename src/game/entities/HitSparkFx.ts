import { BlendModes, Scene } from 'phaser';
import { ignoreUiCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { ensureLaserGlowTexture } from './laserGlowTexture';

/** Short ADD burst at a weapon impact point. */
export function spawnHitSpark(scene: Scene, x: number, y: number): void {
  const { hitSparkDurationMs, laserGlow } = GameConfig.survival;
  const gfx = scene.add.image(x, y, ensureLaserGlowTexture(scene));
  gfx.setDisplaySize(laserGlow.sparkSize, laserGlow.sparkSize);
  gfx.setDepth(550);
  gfx.setBlendMode(BlendModes.ADD);
  ignoreUiCamera(scene, gfx);
  scene.tweens.add({
    targets: gfx,
    alpha: 0,
    scale: 1.6,
    duration: hitSparkDurationMs,
    onComplete: () => {
      gfx.destroy();
    },
  });
}
