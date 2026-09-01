import { Geom, Math as PhaserMath } from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type MutablePoint = {
  x: number;
  y: number;
};

export type MutableVelocity = {
  velocityX: number;
  velocityY: number;
};

export function hullRadius(): number {
  return Math.max(GameConfig.rover.bodyWidth, GameConfig.rover.bodyHeight) / 2;
}

/** Push a circle out of an AABB and cancel velocity into the surface. */
export function resolveCircleVsRect(
  pos: MutablePoint,
  vel: MutableVelocity | null,
  radius: number,
  rect: Geom.Rectangle,
): void {
  const closestX = PhaserMath.Clamp(pos.x, rect.left, rect.right);
  const closestY = PhaserMath.Clamp(pos.y, rect.top, rect.bottom);
  let dx = pos.x - closestX;
  let dy = pos.y - closestY;
  const distSq = dx * dx + dy * dy;
  const radiusSq = radius * radius;

  if (distSq >= radiusSq) {
    return;
  }

  if (distSq < 0.0001) {
    const overlapLeft = pos.x - rect.left;
    const overlapRight = rect.right - pos.x;
    const overlapTop = pos.y - rect.top;
    const overlapBottom = rect.bottom - pos.y;
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    if (minOverlap === overlapLeft) {
      pos.x = rect.left - radius;
      if (vel) {
        vel.velocityX = Math.min(vel.velocityX, 0);
      }
    } else if (minOverlap === overlapRight) {
      pos.x = rect.right + radius;
      if (vel) {
        vel.velocityX = Math.max(vel.velocityX, 0);
      }
    } else if (minOverlap === overlapTop) {
      pos.y = rect.top - radius;
      if (vel) {
        vel.velocityY = Math.min(vel.velocityY, 0);
      }
    } else {
      pos.y = rect.bottom + radius;
      if (vel) {
        vel.velocityY = Math.max(vel.velocityY, 0);
      }
    }
    return;
  }

  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const ny = dy / dist;
  const push = radius - dist;
  pos.x += nx * push;
  pos.y += ny * push;
  if (!vel) {
    return;
  }
  const into = vel.velocityX * nx + vel.velocityY * ny;
  if (into < 0) {
    vel.velocityX -= into * nx;
    vel.velocityY -= into * ny;
  }
}

/**
 * Push two overlapping circles apart. `shareA` is how much of the correction
 * body A takes (0 = A stays, 1 = A takes all).
 */
export function separateCircles(
  a: MutablePoint,
  b: MutablePoint,
  radiusA: number,
  radiusB: number,
  shareA: number,
): void {
  const minDist = radiusA + radiusB;
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let dist = Math.hypot(dx, dy);
  if (dist >= minDist) {
    return;
  }

  if (dist < 0.0001) {
    dx = 1;
    dy = 0;
    dist = 1;
  }

  const overlap = minDist - dist;
  const nx = dx / dist;
  const ny = dy / dist;
  const clampedShare = PhaserMath.Clamp(shareA, 0, 1);
  a.x += nx * overlap * clampedShare;
  a.y += ny * overlap * clampedShare;
  b.x -= nx * overlap * (1 - clampedShare);
  b.y -= ny * overlap * (1 - clampedShare);
}

export function clampToMap(
  pos: MutablePoint,
  radius: number,
  mapWidth: number,
  mapHeight: number,
): void {
  const inset = GameConfig.map.wallInset + radius;
  pos.x = PhaserMath.Clamp(pos.x, inset, mapWidth - inset);
  pos.y = PhaserMath.Clamp(pos.y, inset, mapHeight - inset);
}
