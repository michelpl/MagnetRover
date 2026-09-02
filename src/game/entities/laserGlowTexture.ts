import type { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Build the additive radial glow once; projectiles, muzzle, and sparks share it. */
export function ensureLaserGlowTexture(scene: Scene): string {
  const { textureKey, textureSize, stops } = GameConfig.survival.laserGlow;
  if (scene.textures.exists(textureKey)) {
    return textureKey;
  }

  const canvas = document.createElement('canvas');
  canvas.width = textureSize;
  canvas.height = textureSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas is required to build the laser glow texture');
  }

  const radius = textureSize / 2;
  const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
  for (const stop of stops) {
    gradient.addColorStop(stop.t, hexToRgba(stop.hex, stop.alpha));
  }
  ctx.clearRect(0, 0, textureSize, textureSize);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, textureSize, textureSize);
  scene.textures.addCanvas(textureKey, canvas);
  return textureKey;
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.startsWith('#') ? hex.slice(1) : hex;
  if (raw.length !== 6) {
    throw new Error(`Laser glow stop hex must be RRGGBB, got ${hex}`);
  }
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
