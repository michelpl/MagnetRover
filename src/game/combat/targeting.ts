import { Cameras, Math as PhaserMath } from 'phaser';
import type { Enemy } from '../entities/Enemy';
import type { Rover } from '../entities/Rover';

/** True when an enemy is in range, inside the forward fire cone, and on screen. */
export function isEnemyTargetable(
  rover: Rover,
  enemy: Enemy,
  camera: Cameras.Scene2D.Camera,
  range: number,
  coneDeg: number,
): boolean {
  if (!enemy.active) {
    return false;
  }

  const dx = enemy.x - rover.x;
  const dy = enemy.y - rover.y;
  const dist = Math.hypot(dx, dy);
  if (dist > range || dist < 0.001) {
    return false;
  }

  const toEnemy = Math.atan2(dx, -dy);
  const halfCone = PhaserMath.DegToRad(coneDeg / 2);
  const angleDelta = Math.abs(PhaserMath.Angle.Wrap(toEnemy - rover.rotation));
  if (angleDelta > halfCone) {
    return false;
  }

  return camera.worldView.contains(enemy.x, enemy.y);
}

/** Nearest enemy in the forward fire cone — used for laser auto-aim. */
export function pickNearestTargetableEnemy(
  rover: Rover,
  enemies: readonly Enemy[],
  camera: Cameras.Scene2D.Camera,
  range: number,
  coneDeg: number,
): Enemy | null {
  let best: Enemy | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const enemy of enemies) {
    if (!isEnemyTargetable(rover, enemy, camera, range, coneDeg)) {
      continue;
    }
    const dist = Math.hypot(enemy.x - rover.x, enemy.y - rover.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = enemy;
    }
  }
  return best;
}
