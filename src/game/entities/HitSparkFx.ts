import { BlendModes, Scene } from 'phaser';
import { ignoreUiCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';

/** Short ADD burst at a weapon impact point. */
export function spawnHitSpark(scene: Scene, x: number, y: number): void {
  const { hitSparkRadius, hitSparkDurationMs } = GameConfig.survival;
  const gfx = scene.add.circle(x, y, hitSparkRadius, 0x74c0fc, 0.85);
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
