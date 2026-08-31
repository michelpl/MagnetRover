import { Scene } from 'phaser';
import { bindViewResize, viewSize } from './viewSize';

/** Cover-fit a texture to the live canvas. */
export function addCoverBackground(scene: Scene, textureKey: string): void {
  const frame = scene.textures.get(textureKey).get();
  const image = scene.add.image(0, 0, textureKey);
  image.setDepth(0);
  bindViewResize(scene, () => {
    const { width, height } = viewSize(scene);
    image.setPosition(width / 2, height / 2);
    image.setScale(Math.max(width / frame.width, height / frame.height));
  });
}
