import { Scene } from 'phaser';

export const PLAY_BUTTON_WIDTH = 380;
export const PLAY_BUTTON_HEIGHT = 128;
export const PLAY_BUTTON_RADIUS = 28;
const SLAB = 8;

/** Soft drop shadow under the Play button. Tweak blur / offsetY / color here. */
export const PLAY_SHADOW = {
  blur: 18,
  offsetY: 15,
  color: 'rgba(5, 8, 15, 0.7)',
} as const;

const PLAY_SHADOW_KEY = `play-shadow-${PLAY_SHADOW.blur}-${PLAY_SHADOW.offsetY}-${PLAY_SHADOW.color}`;

type ChromeKind = 'ready' | 'locked';

export function playChromeKey(kind: ChromeKind): string {
  return kind === 'ready' ? 'play-chrome-ready-v4' : 'play-chrome-locked-v4';
}

export function ensurePlayChromeTexture(scene: Scene, kind: ChromeKind): void {
  const key = playChromeKey(kind);
  if (scene.textures.exists(key)) {
    return;
  }
  const width = PLAY_BUTTON_WIDTH;
  const height = PLAY_BUTTON_HEIGHT;
  const radius = PLAY_BUTTON_RADIUS;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round((height + SLAB + 4) * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas is required for play chrome');
  }
  ctx.scale(scale, scale);

  const x = 1.5;
  const y = 1.5;
  const w = width - 3;
  const h = height - 3;

  roundRect(ctx, x, y, w, h + SLAB, radius);
  ctx.fillStyle = kind === 'ready' ? '#9a4a00' : '#243040';
  ctx.fill();

  roundRect(ctx, x, y, w, h, radius);
  const fill = ctx.createLinearGradient(0, y, 0, y + h);
  if (kind === 'ready') {
    fill.addColorStop(0, '#ffd000');
    fill.addColorStop(0.55, '#ffb000');
    fill.addColorStop(1, '#f59b00');
  } else {
    fill.addColorStop(0, '#8a9bb0');
    fill.addColorStop(0.55, '#6a7c92');
    fill.addColorStop(1, '#3e4c5e');
  }
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  const topLight = ctx.createLinearGradient(0, y, 0, y + 12);
  topLight.addColorStop(0, kind === 'ready' ? 'rgba(255,245,200,0.7)' : 'rgba(220,230,240,0.35)');
  topLight.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = topLight;
  ctx.fillRect(x, y, w, 14);

  const bottomShade = ctx.createLinearGradient(0, y + h - 16, 0, y + h);
  bottomShade.addColorStop(0, 'rgba(0,0,0,0)');
  bottomShade.addColorStop(1, kind === 'ready' ? 'rgba(140,50,0,0.28)' : 'rgba(0,0,0,0.28)');
  ctx.fillStyle = bottomShade;
  ctx.fillRect(x, y + h - 16, w, 16);
  ctx.restore();

  roundRect(ctx, x, y, w, h, radius);
  ctx.strokeStyle = kind === 'ready' ? '#332200' : '#121820';
  ctx.lineWidth = 2;
  ctx.stroke();

  scene.textures.addCanvas(key, canvas);
}

export function playShadowLayout(): {
  width: number;
  height: number;
  originY: number;
} {
  const pad = PLAY_SHADOW.blur * 2 + 8;
  const width = PLAY_BUTTON_WIDTH + pad * 2;
  const height = PLAY_BUTTON_HEIGHT + PLAY_SHADOW.offsetY + pad * 2;
  return {
    width,
    height,
    originY: (pad + PLAY_BUTTON_HEIGHT / 2) / height,
  };
}

export function ensurePlayShadowTexture(scene: Scene): void {
  if (scene.textures.exists(PLAY_SHADOW_KEY)) {
    return;
  }
  const pad = PLAY_SHADOW.blur * 2 + 8;
  const width = PLAY_BUTTON_WIDTH;
  const height = PLAY_BUTTON_HEIGHT;
  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round((width + pad * 2) * scale);
  canvas.height = Math.round((height + PLAY_SHADOW.offsetY + pad * 2) * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas is required for play shadow');
  }
  ctx.scale(scale, scale);
  ctx.filter = `blur(${PLAY_SHADOW.blur}px)`;
  ctx.fillStyle = PLAY_SHADOW.color;
  roundRect(ctx, pad, pad + PLAY_SHADOW.offsetY, width, height, PLAY_BUTTON_RADIUS);
  ctx.fill();
  ctx.filter = 'none';
  scene.textures.addCanvas(PLAY_SHADOW_KEY, canvas);
}

export function playShadowKey(): string {
  return PLAY_SHADOW_KEY;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}
