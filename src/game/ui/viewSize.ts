import { Scene } from 'phaser';

export type SafeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

/** Live canvas size after Scale.EXPAND (not the 1080×1920 design size). */
export function viewSize(scene: Scene): { width: number; height: number } {
  return { width: scene.scale.width, height: scene.scale.height };
}

/**
 * Notch / Dynamic Island / punch-hole / status-bar insets in game pixels.
 * The canvas stays full-bleed; only HUD should add these to layout.
 */
export function safeInsets(scene: Scene): SafeInsets {
  const css = readCssInsets();
  const { width, height } = viewSize(scene);
  const canvas = scene.game.canvas;
  const clientW = canvas.clientWidth || width;
  const clientH = canvas.clientHeight || height;
  const sx = clientW > 0 ? width / clientW : 1;
  const sy = clientH > 0 ? height / clientH : 1;
  return {
    top: css.top * sy,
    right: css.right * sx,
    bottom: css.bottom * sy,
    left: css.left * sx,
  };
}

/** Relayout HUD when the canvas size or system insets change; unsubscribes on scene shutdown. */
export function bindViewResize(scene: Scene, layout: () => void): void {
  layout();
  scene.scale.on('resize', layout);
  window.addEventListener('resize', layout);
  const viewport = window.visualViewport;
  viewport?.addEventListener('resize', layout);
  scene.events.once('shutdown', () => {
    scene.scale.off('resize', layout);
    window.removeEventListener('resize', layout);
    viewport?.removeEventListener('resize', layout);
  });
}

function readCssInsets(): SafeInsets {
  const style = getComputedStyle(document.documentElement);
  return {
    top: cssPx(style, '--hud-inset-top'),
    right: cssPx(style, '--hud-inset-right'),
    bottom: cssPx(style, '--hud-inset-bottom'),
    left: cssPx(style, '--hud-inset-left'),
  };
}

function cssPx(style: CSSStyleDeclaration, property: string): number {
  const value = parseFloat(style.getPropertyValue(property));
  return Number.isFinite(value) ? value : 0;
}
