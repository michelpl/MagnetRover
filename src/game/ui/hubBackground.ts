import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Cover-fit a texture to the 1080×1920 viewport. */
export function addCoverBackground(scene: Scene, textureKey: string): void {
  const { width, height } = GameConfig.viewport;
  const frame = scene.textures.get(textureKey).get();
  const image = scene.add.image(width / 2, height / 2, textureKey);
  const scale = Math.max(width / frame.width, height / frame.height);
  image.setScale(scale);
  image.setDepth(0);
}
