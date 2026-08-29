import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

export const UI_CAMERA_NAME = 'ui';

/** Keep a world-space object off the unzoomed HUD camera. */
export function ignoreUiCamera(scene: Scene, obj: GameObjects.GameObject): void {
  const ui = scene.cameras.getCamera(UI_CAMERA_NAME);
  if (ui) {
    ui.ignore(obj);
  }
}

/** Zoomed follow cam for the map; named `ui` cam for scrollFactor-0 HUD. */
export function bindPlayCameras(scene: Scene, follow: GameObjects.GameObject): void {
  const { lerp, zoom } = GameConfig.camera;
  const mapWidth = scene.registry.get('mapWidth') as number;
  const mapHeight = scene.registry.get('mapHeight') as number;
  const { width, height } = GameConfig.viewport;

  scene.cameras.main.setZoom(zoom);
  scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
  scene.cameras.main.startFollow(follow, true, lerp, lerp);

  const ui = scene.cameras.add(0, 0, width, height);
  ui.setName(UI_CAMERA_NAME);
  ui.setScroll(0, 0);

  scene.children.each((child) => {
    if (!hasScrollFactor(child)) {
      return;
    }
    if (child.scrollFactorX === 0 && child.scrollFactorY === 0) {
      scene.cameras.main.ignore(child);
    } else {
      ui.ignore(child);
    }
  });
}

function hasScrollFactor(
  obj: GameObjects.GameObject,
): obj is GameObjects.GameObject & { scrollFactorX: number; scrollFactorY: number } {
  return 'scrollFactorX' in obj && 'scrollFactorY' in obj;
}
