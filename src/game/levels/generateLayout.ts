import type { LevelObstacle, LevelPowerUp, LevelScrap, ScrapSize } from '../config/LevelConfig';
import {
  CLUSTER_SLOTS,
  MAP_HEIGHT,
  MAP_MARGIN,
  MAP_WIDTH,
  OBSTACLE_SLOTS,
  PROCESSOR_CLEAR_RADIUS,
  WORKSHOP_PROCESSOR,
  type LevelRecipe,
} from './recipes';
import { createRng } from './rng';

const SCRAP_COLORS = [
  '#ced4da',
  '#adb5bd',
  '#868e96',
  '#495057',
  '#74c0fc',
  '#4c6ef5',
  '#22b8cf',
] as const;

const SCRAP_SIZES: readonly ScrapSize[] = ['small', 'medium', 'large'];
const OBSTACLE_SCRAP_PADDING = 18;

export type LayoutDraft = {
  scraps: LevelScrap[];
  obstacles: LevelObstacle[];
};

export function resolveObstacles(recipe: LevelRecipe): LevelObstacle[] {
  const obstacles: LevelObstacle[] = [];
  for (const id of recipe.obstacleSlotIds) {
    const slot = OBSTACLE_SLOTS.find((entry) => entry.id === id);
    if (!slot) {
      throw new Error(`Unknown obstacle slot id: ${id}`);
    }
    obstacles.push({ x: slot.x, y: slot.y, width: slot.width, height: slot.height });
  }
  return obstacles;
}

export function generateLayout(recipe: LevelRecipe, spreadScale: number): LayoutDraft {
  const obstacles = resolveObstacles(recipe);
  const scraps = placeScraps(recipe, spreadScale, obstacles);
  return { scraps, obstacles };
}

function placeScraps(
  recipe: LevelRecipe,
  spreadScale: number,
  obstacles: readonly LevelObstacle[],
): LevelScrap[] {
  const slots = recipe.slotIds.map((id) => {
    const slot = CLUSTER_SLOTS.find((entry) => entry.id === id);
    if (!slot) {
      throw new Error(`Unknown cluster slot id: ${id}`);
    }
    return slot;
  });
  if (slots.length === 0) {
    throw new Error(`Stage ${recipe.id} has no cluster slots`);
  }

  const counts = distributeCount(recipe.scrapCount, slots.length);
  const rand = createRng(recipe.seed);
  const scraps: LevelScrap[] = [];
  const clearR2 = PROCESSOR_CLEAR_RADIUS * PROCESSOR_CLEAR_RADIUS;

  for (let regionId = 0; regionId < slots.length; regionId += 1) {
    const slot = slots[regionId];
    const count = counts[regionId] ?? 0;
    const spread = slot.baseSpread * spreadScale;
    let placed = 0;
    let attempts = 0;
    const maxAttempts = count * 80;

    while (placed < count && attempts < maxAttempts) {
      attempts += 1;
      const angle = rand() * Math.PI * 2;
      const radius = rand() * spread;
      const x = slot.cx + Math.cos(angle) * radius;
      const y = slot.cy + Math.sin(angle) * radius;

      if (x < MAP_MARGIN || x > MAP_WIDTH - MAP_MARGIN) {
        continue;
      }
      if (y < MAP_MARGIN || y > MAP_HEIGHT - MAP_MARGIN) {
        continue;
      }

      const dx = x - WORKSHOP_PROCESSOR.x;
      const dy = y - WORKSHOP_PROCESSOR.y;
      if (dx * dx + dy * dy < clearR2) {
        continue;
      }
      if (hitsObstacle(x, y, obstacles, OBSTACLE_SCRAP_PADDING)) {
        continue;
      }

      scraps.push({
        x: Math.round(x),
        y: Math.round(y),
        color: SCRAP_COLORS[Math.floor(rand() * SCRAP_COLORS.length)] ?? SCRAP_COLORS[0],
        size: SCRAP_SIZES[Math.floor(rand() * SCRAP_SIZES.length)] ?? 'medium',
        regionId,
      });
      placed += 1;
    }
  }

  if (scraps.length !== recipe.scrapCount) {
    throw new Error(
      `Stage ${recipe.id}: expected ${recipe.scrapCount} scraps, placed ${scraps.length} (spread ${spreadScale.toFixed(2)})`,
    );
  }
  return scraps;
}

export function placePickupsAlongPath(
  waypoints: readonly { x: number; y: number }[],
  count: number,
  obstacles: readonly LevelObstacle[],
): LevelPowerUp[] {
  if (count <= 0 || waypoints.length < 2) {
    return [];
  }

  const total = pathLength(waypoints);
  if (total <= 1) {
    return [];
  }

  const pickups: LevelPowerUp[] = [];
  const clearR2 = PROCESSOR_CLEAR_RADIUS * PROCESSOR_CLEAR_RADIUS;

  for (let i = 1; i <= count; i += 1) {
    const target = (i / (count + 1)) * total;
    const point = pointAtLength(waypoints, target);
    let x = point.x;
    let y = point.y;

    const dx = x - WORKSHOP_PROCESSOR.x;
    const dy = y - WORKSHOP_PROCESSOR.y;
    if (dx * dx + dy * dy < clearR2 || hitsObstacle(x, y, obstacles, 12)) {
      const nudged = pointAtLength(waypoints, Math.min(total * 0.92, target + 80));
      x = nudged.x;
      y = nudged.y;
    }

    x = clamp(x, MAP_MARGIN, MAP_WIDTH - MAP_MARGIN);
    y = clamp(y, MAP_MARGIN, MAP_HEIGHT - MAP_MARGIN);
    pickups.push({ x: Math.round(x), y: Math.round(y), type: 'energy' });
  }
  return pickups;
}

function distributeCount(total: number, slotCount: number): number[] {
  const base = Math.floor(total / slotCount);
  const remainder = total % slotCount;
  const counts: number[] = [];
  for (let i = 0; i < slotCount; i += 1) {
    counts.push(base + (i < remainder ? 1 : 0));
  }
  return counts;
}

function hitsObstacle(
  x: number,
  y: number,
  obstacles: readonly LevelObstacle[],
  padding: number,
): boolean {
  for (const obstacle of obstacles) {
    if (
      x >= obstacle.x - padding &&
      x <= obstacle.x + obstacle.width + padding &&
      y >= obstacle.y - padding &&
      y <= obstacle.y + obstacle.height + padding
    ) {
      return true;
    }
  }
  return false;
}

function pathLength(waypoints: readonly { x: number; y: number }[]): number {
  let length = 0;
  for (let i = 1; i < waypoints.length; i += 1) {
    const prev = waypoints[i - 1];
    const next = waypoints[i];
    if (!prev || !next) {
      continue;
    }
    length += hypot(next.x - prev.x, next.y - prev.y);
  }
  return length;
}

function pointAtLength(
  waypoints: readonly { x: number; y: number }[],
  distance: number,
): { x: number; y: number } {
  let remaining = distance;
  for (let i = 1; i < waypoints.length; i += 1) {
    const prev = waypoints[i - 1];
    const next = waypoints[i];
    if (!prev || !next) {
      continue;
    }
    const span = hypot(next.x - prev.x, next.y - prev.y);
    if (span <= 0.001) {
      continue;
    }
    if (remaining <= span) {
      const t = remaining / span;
      return { x: prev.x + (next.x - prev.x) * t, y: prev.y + (next.y - prev.y) * t };
    }
    remaining -= span;
  }
  const last = waypoints[waypoints.length - 1];
  return last ?? { x: WORKSHOP_PROCESSOR.x, y: WORKSHOP_PROCESSOR.y };
}

function hypot(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
