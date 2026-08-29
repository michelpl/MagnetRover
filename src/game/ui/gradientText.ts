import { GameObjects, Scene } from 'phaser';

export type GradientTextStyle = {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  topColor: string;
  bottomColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  innerStrokeColor?: string;
  innerStrokeWidth?: number;
  glowColor?: string;
  glowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;
  bevelPx?: number;
  bevelLight?: string;
  bevelDark?: string;
};

export function addGradientText(
  scene: Scene,
  x: number,
  y: number,
  key: string,
  text: string,
  style: GradientTextStyle,
): GameObjects.Image {
  ensureGradientTextTexture(scene, key, text, style);
  return scene.add.image(x, y, key).setOrigin(0.5);
}

export function ensureGradientTextTexture(
  scene: Scene,
  key: string,
  text: string,
  style: GradientTextStyle,
): void {
  if (scene.textures.exists(key)) {
    return;
  }
  const stroke = style.strokeWidth ?? 0;
  const innerStroke = style.innerStrokeWidth ?? 0;
  const shadowX = style.shadowOffsetX ?? 0;
  const shadowY = style.shadowOffsetY ?? 0;
  const shadowBlur = style.shadowBlur ?? 0;
  const bevel = style.bevelPx ?? 0;
  const glowBlur = style.glowBlur ?? 0;
  const padX = stroke + bevel + glowBlur + Math.abs(shadowX) + 8;
  const padY = stroke + bevel + Math.abs(shadowY) + shadowBlur + glowBlur + 8;

  const measure = document.createElement('canvas').getContext('2d');
  if (!measure) {
    throw new Error('2D canvas is required for gradient text');
  }
  measure.font = `${style.fontWeight} ${style.fontSize}px "${style.fontFamily}"`;
  const textW = Math.ceil(measure.measureText(text).width);
  const width = textW + padX * 2;
  const height = Math.ceil(style.fontSize * 1.2) + padY * 2;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas is required for gradient text');
  }
  ctx.font = `${style.fontWeight} ${style.fontSize}px "${style.fontFamily}"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const cx = width / 2;
  const cy = height / 2 - shadowY / 2;
  const gradient = ctx.createLinearGradient(0, cy - style.fontSize * 0.48, 0, cy + style.fontSize * 0.48);
  gradient.addColorStop(0, style.topColor);
  gradient.addColorStop(1, style.bottomColor);

  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  if (style.shadowColor && shadowBlur === 0 && (shadowX !== 0 || shadowY !== 0)) {
    const sx = cx + shadowX;
    const sy = cy + shadowY;
    ctx.fillStyle = style.shadowColor;
    ctx.fillText(text, sx, sy);
    if (stroke > 0) {
      ctx.strokeStyle = style.shadowColor;
      ctx.lineWidth = stroke;
      ctx.strokeText(text, sx, sy);
    }
  }
  if (bevel > 0) {
    ctx.fillStyle = style.bevelLight ?? 'rgba(255, 255, 255, 0.55)';
    ctx.fillText(text, cx - bevel, cy - bevel);
    ctx.fillStyle = style.bevelDark ?? 'rgba(0, 10, 28, 0.85)';
    ctx.fillText(text, cx + bevel, cy + bevel);
  }
  if (style.shadowColor && shadowBlur > 0) {
    ctx.shadowColor = style.shadowColor;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowX;
    ctx.shadowOffsetY = shadowY;
  }
  if (stroke > 0 && style.strokeColor) {
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = stroke;
    ctx.strokeText(text, cx, cy);
  }
  if (innerStroke > 0 && style.innerStrokeColor) {
    ctx.strokeStyle = style.innerStrokeColor;
    ctx.lineWidth = innerStroke;
    ctx.strokeText(text, cx, cy);
  }
  ctx.fillStyle = gradient;
  ctx.fillText(text, cx, cy);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  scene.textures.addCanvas(key, canvas);
}
