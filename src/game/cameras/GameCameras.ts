import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { bindViewResize, viewSize } from '../ui/viewSize';

export const UI_CAMERA_NAME = 'ui';

/** Keep a world-space object off the unzoomed HUD camera. */
export function ignoreUiCamera(scene: Scene, obj: GameObjects.GameObject): void {
  const ui = scene.cameras.getCamera(UI_CAMERA_NAME);
  if (!ui) {
    return;
  }
  ui.ignore(obj);
  if (obj instanceof GameObjects.Container) {
    for (const child of obj.list) {
      ignoreUiCamera(scene, child);
    }
  }
}

/**
 * Keep a HUD object (and interactive children) off the zoomed world camera
 * so hit tests use unzoomed screen space.
 */
export function ignoreWorldCamera(scene: Scene, obj: GameObjects.GameObject): void {
  scene.cameras.main.ignore(obj);
  if (obj instanceof GameObjects.Container) {
    for (const child of obj.list) {
      ignoreWorldCamera(scene, child);
    }
  }
}

/** Zoomed follow cam for the map; named `ui` cam for scrollFactor-0 HUD. */
export function bindPlayCameras(scene: Scene, follow: GameObjects.GameObject): void {
  const { lerp, zoom } = GameConfig.camera;
  const mapWidth = scene.registry.get('mapWidth') as number;
  const mapHeight = scene.registry.get('mapHeight') as number;

  scene.cameras.main.setZoom(zoom);
  scene.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
  scene.cameras.main.startFollow(follow, true, lerp, lerp);

  const { width, height } = viewSize(scene);
  const ui = scene.cameras.add(0, 0, width, height);
  ui.setName(UI_CAMERA_NAME);
  ui.setScroll(0, 0);

  scene.children.each((child) => {
    if (!hasScrollFactor(child)) {
      return;
    }
    if (child.scrollFactorX === 0 && child.scrollFactorY === 0) {
      ignoreWorldCamera(scene, child);
    } else {
      ignoreUiCamera(scene, child);
    }
  });

  bindViewResize(scene, () => {
    const size = viewSize(scene);
    ui.setSize(size.width, size.height);
    ui.setViewport(0, 0, size.width, size.height);
  });
}

function hasScrollFactor(
  obj: GameObjects.GameObject,
): obj is GameObjects.GameObject & { scrollFactorX: number; scrollFactorY: number } {
  return 'scrollFactorX' in obj && 'scrollFactorY' in obj;
}
