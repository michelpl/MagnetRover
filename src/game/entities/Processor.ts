import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

type Point = { x: number; y: number };

/**
 * Single dump landmark with a world-space processingArea for overlap tests (US-013).
 */
export class Processor extends GameObjects.Container {
  /** World-space dump pad in front of the intake tray. */
  public readonly processingArea: Geom.Rectangle;
  /** Solid machine body; the rover cannot enter this rect. */
  public readonly collider: Geom.Rectangle;

  public constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);

    const {
      dumpZoneWidth,
      dumpZoneHeight,
      dumpZoneLocalTop,
      spriteDisplaySize,
      colliderWidth,
      colliderHeight,
      dumpZoneGlowAlphaMin,
      dumpZoneGlowAlphaMax,
      dumpZoneGlowMs,
    } = GameConfig.processor;

    this.processingArea = new Geom.Rectangle(
      x - dumpZoneWidth / 2,
      y + dumpZoneLocalTop,
      dumpZoneWidth,
      dumpZoneHeight,
    );
    this.collider = new Geom.Rectangle(
      x - colliderWidth / 2,
      y - colliderHeight / 2,
      colliderWidth,
      colliderHeight,
    );

    const sprite = scene.add.image(0, 0, 'processor');
    sprite.setDisplaySize(spriteDisplaySize, spriteDisplaySize);
    this.add(sprite);

    const dumpZone = scene.add.graphics();
    this.drawDumpZone(dumpZone);
    this.add(dumpZone);

    scene.tweens.add({
      targets: dumpZone,
      alpha: { from: dumpZoneGlowAlphaMin, to: dumpZoneGlowAlphaMax },
      duration: dumpZoneGlowMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    scene.add.existing(this);
  }

  /** True when a world point is inside the dump pad. */
  public containsPoint(x: number, y: number): boolean {
    return this.processingArea.contains(x, y);
  }

  /** Pulse landmark while cargo is full (US-025). */
  public setHintPulse(active: boolean): void {
    const scene = this.scene;
    if (active) {
      if (!scene.tweens.isTweening(this)) {
        scene.tweens.add({
          targets: this,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 320,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else {
      scene.tweens.killTweensOf(this);
      this.setScale(1);
    }
  }

  private drawDumpZone(graphics: GameObjects.Graphics): void {
    const {
      dumpZoneWidth,
      dumpZoneHeight,
      dumpZoneCornerRadius,
      dumpZoneDash,
      dumpZoneGap,
      dumpZoneLineWidth,
      dumpZoneGlowWidth,
      dumpZoneColor,
      dumpZoneLocalTop,
    } = GameConfig.processor;

    const x = -dumpZoneWidth / 2;
    const y = dumpZoneLocalTop;
    graphics.lineStyle(dumpZoneGlowWidth, dumpZoneColor, 0.4);
    strokeDashedRoundedRect(
      graphics,
      x,
      y,
      dumpZoneWidth,
      dumpZoneHeight,
      dumpZoneCornerRadius,
      dumpZoneDash,
      dumpZoneGap,
    );
    graphics.lineStyle(dumpZoneLineWidth, dumpZoneColor, 1);
    strokeDashedRoundedRect(
      graphics,
      x,
      y,
      dumpZoneWidth,
      dumpZoneHeight,
      dumpZoneCornerRadius,
      dumpZoneDash,
      dumpZoneGap,
    );
  }
}

function strokeDashedRoundedRect(
  graphics: GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  dash: number,
  gap: number,
): void {
  const points = roundedRectPoints(x, y, width, height, radius);
  let drawing = true;
  let remaining = dash;

  graphics.beginPath();

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let segLen = Math.hypot(dx, dy);
    if (segLen < 0.001) {
      continue;
    }

    let px = a.x;
    let py = a.y;
    const ux = dx / segLen;
    const uy = dy / segLen;

    while (segLen > 0) {
      const step = Math.min(remaining, segLen);
      const nx = px + ux * step;
      const ny = py + uy * step;
      if (drawing) {
        graphics.moveTo(px, py);
        graphics.lineTo(nx, ny);
      }
      px = nx;
      py = ny;
      segLen -= step;
      remaining -= step;
      if (remaining <= 0.001) {
        drawing = !drawing;
        remaining = drawing ? dash : gap;
      }
    }
  }

  graphics.strokePath();
}

function roundedRectPoints(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): Point[] {
  const r = Math.min(radius, width / 2, height / 2);
  const points: Point[] = [];
  const step = Math.PI / 16;

  const pushArc = (cx: number, cy: number, start: number, end: number): void => {
    for (let a = start; a <= end + 0.0001; a += step) {
      points.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
  };

  points.push({ x: x + r, y });
  points.push({ x: x + width - r, y });
  pushArc(x + width - r, y + r, -Math.PI / 2, 0);
  points.push({ x: x + width, y: height + y - r });
  pushArc(x + width - r, y + height - r, 0, Math.PI / 2);
  points.push({ x: x + r, y: y + height });
  pushArc(x + r, y + height - r, Math.PI / 2, Math.PI);
  points.push({ x, y: y + r });
  pushArc(x + r, y + r, Math.PI, (3 * Math.PI) / 2);
  points.push({ x: x + r, y });

  return points;
}
