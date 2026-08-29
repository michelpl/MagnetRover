import { GameConfig } from '../config/GameConfig';
import type { LevelObstacle, LevelScrap } from '../config/LevelConfig';
import type { RoverBalanceStats } from './roverStats';

export type Point = { x: number; y: number };

type ScrapPoint = Point & { regionId: number };

export type PathEstimate = {
  pathPx: number;
  dumpTrips: number;
  waypoints: Point[];
};

const CORNER_PAD = 20;

/**
 * Greedy cluster collector used only for balance — not in-game pathfinding.
 * Travels cluster-to-cluster, harvests a region in one stop, dumps when full.
 */
export function estimatePath(
  scraps: readonly LevelScrap[],
  obstacles: readonly LevelObstacle[],
  spawn: Point,
  processor: Point,
  stats: RoverBalanceStats,
): PathEstimate {
  const remaining: ScrapPoint[] = scraps.map((scrap) => ({
    x: scrap.x,
    y: scrap.y,
    regionId: scrap.regionId ?? 0,
  }));
  let x = spawn.x;
  let y = spawn.y;
  let cargo = 0;
  let pathPx = 0;
  let dumpTrips = 0;
  const waypoints: Point[] = [{ x, y }];

  const travelTo = (tx: number, ty: number): void => {
    pathPx += travelCost({ x, y }, { x: tx, y: ty }, obstacles);
    x = tx;
    y = ty;
    waypoints.push({ x, y });
  };

  while (remaining.length > 0) {
    if (cargo >= stats.capacity) {
      travelTo(processor.x, processor.y);
      cargo = 0;
      dumpTrips += 1;
      continue;
    }

    let nearestIndex = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i += 1) {
      const point = remaining[i];
      if (!point) {
        continue;
      }
      const dist = distSq(x, y, point.x, point.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    }

    const target = remaining[nearestIndex];
    if (!target) {
      break;
    }
    travelTo(target.x, target.y);

    const inRegion: { index: number; point: ScrapPoint }[] = [];
    for (let i = 0; i < remaining.length; i += 1) {
      const point = remaining[i];
      if (!point || point.regionId !== target.regionId) {
        continue;
      }
      inRegion.push({ index: i, point });
    }
    inRegion.sort(
      (a, b) => distSq(x, y, a.point.x, a.point.y) - distSq(x, y, b.point.x, b.point.y),
    );

    const takeN = Math.min(stats.capacity - cargo, inRegion.length);
    const taken = inRegion.slice(0, takeN);
    const harvested = taken.map((entry) => entry.point);
    pathPx += coveringCost(harvested, stats.magnetRadius);
    const center = centroid(harvested);
    if (center) {
      x = center.x;
      y = center.y;
      waypoints.push({ x, y });
    }

    const remove = taken.map((entry) => entry.index).sort((a, b) => b - a);
    for (const index of remove) {
      remaining.splice(index, 1);
      cargo += 1;
    }
  }

  if (cargo > 0) {
    travelTo(processor.x, processor.y);
    dumpTrips += 1;
  }

  return { pathPx, dumpTrips, waypoints };
}

function coveringCost(points: readonly Point[], magnetRadius: number): number {
  if (points.length <= 1) {
    return 0;
  }
  const center = centroid(points);
  if (!center) {
    return 0;
  }
  let radius = 0;
  for (const point of points) {
    radius = Math.max(radius, hypot(point.x - center.x, point.y - center.y));
  }
  const weave = radius * Math.sqrt(points.length);
  const baseMagnet = GameConfig.upgrades.magnetRadius.values[0] ?? 70;
  const magnetScale = baseMagnet / Math.max(magnetRadius, 40);
  return weave * magnetScale;
}

function centroid(points: readonly Point[]): Point | null {
  if (points.length === 0) {
    return null;
  }
  let sx = 0;
  let sy = 0;
  for (const point of points) {
    sx += point.x;
    sy += point.y;
  }
  return { x: sx / points.length, y: sy / points.length };
}

function travelCost(from: Point, to: Point, obstacles: readonly LevelObstacle[]): number {
  const straight = hypot(to.x - from.x, to.y - from.y);
  const hits = obstacles.filter((obstacle) => segmentHitsAabb(from, to, obstacle));
  if (hits.length === 0) {
    return straight;
  }

  let best = Infinity;
  for (const obstacle of hits) {
    const corners: Point[] = [
      { x: obstacle.x - CORNER_PAD, y: obstacle.y - CORNER_PAD },
      { x: obstacle.x + obstacle.width + CORNER_PAD, y: obstacle.y - CORNER_PAD },
      { x: obstacle.x - CORNER_PAD, y: obstacle.y + obstacle.height + CORNER_PAD },
      {
        x: obstacle.x + obstacle.width + CORNER_PAD,
        y: obstacle.y + obstacle.height + CORNER_PAD,
      },
    ];
    for (const corner of corners) {
      const detour = hypot(corner.x - from.x, corner.y - from.y) + hypot(to.x - corner.x, to.y - corner.y);
      if (detour < best) {
        best = detour;
      }
    }
  }
  return Math.max(best, straight * 1.15);
}

function segmentHitsAabb(a: Point, b: Point, obstacle: LevelObstacle): boolean {
  if (pointInAabb(a.x, a.y, obstacle) || pointInAabb(b.x, b.y, obstacle)) {
    return true;
  }
  const x1 = obstacle.x;
  const y1 = obstacle.y;
  const x2 = obstacle.x + obstacle.width;
  const y2 = obstacle.y + obstacle.height;
  return (
    segmentsIntersect(a.x, a.y, b.x, b.y, x1, y1, x2, y1) ||
    segmentsIntersect(a.x, a.y, b.x, b.y, x2, y1, x2, y2) ||
    segmentsIntersect(a.x, a.y, b.x, b.y, x2, y2, x1, y2) ||
    segmentsIntersect(a.x, a.y, b.x, b.y, x1, y2, x1, y1)
  );
}

function pointInAabb(x: number, y: number, obstacle: LevelObstacle): boolean {
  return (
    x >= obstacle.x &&
    x <= obstacle.x + obstacle.width &&
    y >= obstacle.y &&
    y <= obstacle.y + obstacle.height
  );
}

function segmentsIntersect(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number,
  dx: number,
  dy: number,
): boolean {
  const d1 = cross(dx - cx, dy - cy, ax - cx, ay - cy);
  const d2 = cross(dx - cx, dy - cy, bx - cx, by - cy);
  const d3 = cross(bx - ax, by - ay, cx - ax, cy - ay);
  const d4 = cross(bx - ax, by - ay, dx - ax, dy - ay);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }
  return false;
}

function cross(ax: number, ay: number, bx: number, by: number): number {
  return ax * by - ay * bx;
}

function distSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function hypot(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}
