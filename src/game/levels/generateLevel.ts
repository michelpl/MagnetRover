import { isDebugMode } from '../config/GameConfig';
import type { LevelConfig, LevelPowerUp } from '../config/LevelConfig';
import { estimatePath } from './estimatePath';
import { generateLayout, placePickupsAlongPath } from './generateLayout';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  STOCK_UPGRADES,
  WORKSHOP_PROCESSOR,
  WORKSHOP_SPAWN,
  type LevelRecipe,
} from './recipes';
import { roverStatsFromTiers } from './roverStats';
import { leftoverRatio, MAX_PICKUPS, MIN_UPGRADE_GAP, TOO_EASY_SLACK } from './solveBalance';

export type BalanceReport = {
  stageId: number;
  pathPxExpected: number;
  pathPxStock: number;
  dumpTripsExpected: number;
  dumpTripsStock: number;
  pickupCount: number;
  leftoverExpected: number;
  leftoverStock: number;
  batteryExpected: number;
  batteryStock: number;
  spreadScale: number;
};

const MAX_SPREAD_ATTEMPTS = 10;
const SPREAD_GROWTH = 1.1;
const MAX_SPREAD_SCALE = 2.4;

export function generateLevel(recipe: LevelRecipe): LevelConfig {
  const { config, report } = generateLevelWithReport(recipe);
  if (isDebugMode) {
    console.info(
      `[level-balance] stage ${report.stageId} spread=${report.spreadScale.toFixed(2)} ` +
        `pickups=${report.pickupCount} leftover expected=${fmt(report.leftoverExpected)} ` +
        `stock=${fmt(report.leftoverStock)} path=${Math.round(report.pathPxExpected)}px ` +
        `dumps=${report.dumpTripsExpected}`,
    );
  }
  return config;
}

export function generateLevelWithReport(recipe: LevelRecipe): {
  config: LevelConfig;
  report: BalanceReport;
} {
  const expectedStats = roverStatsFromTiers(recipe.expectedUpgrades);
  const stockStats = roverStatsFromTiers(STOCK_UPGRADES);
  const spawn = recipe.spawn ?? WORKSHOP_SPAWN;
  const isStockStage = recipe.id === 1;
  let spreadScale = recipe.spreadScale;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < MAX_SPREAD_ATTEMPTS; attempt += 1) {
    const layout = generateLayout(recipe, spreadScale);
    const expectedPath = estimatePath(
      layout.scraps,
      layout.obstacles,
      spawn,
      WORKSHOP_PROCESSOR,
      expectedStats,
    );
    const leftover0 = leftoverRatio(
      expectedPath.pathPx,
      expectedStats,
      layout.scraps.length,
      0,
    );

    if (leftover0 > recipe.targetLeftoverRatio + TOO_EASY_SLACK && spreadScale < MAX_SPREAD_SCALE && !isStockStage) {
      spreadScale = Math.min(MAX_SPREAD_SCALE, spreadScale * SPREAD_GROWTH);
      lastError = `too easy at 0 pickups (leftover ${fmt(leftover0)})`;
      continue;
    }

    let pickupCount = 0;
    let leftoverExpected = leftover0;
    let pickups: LevelPowerUp[] = [];

    while (leftoverExpected < recipe.targetLeftoverRatio && pickupCount < MAX_PICKUPS) {
      pickupCount += 1;
      pickups = placePickupsAlongPath(expectedPath.waypoints, pickupCount, layout.obstacles);
      leftoverExpected = leftoverRatio(
        expectedPath.pathPx,
        expectedStats,
        layout.scraps.length,
        pickupCount,
      );
    }

    if (leftoverExpected < recipe.targetLeftoverRatio) {
      lastError =
        `expected leftover ${fmt(leftoverExpected)} below target ${recipe.targetLeftoverRatio} ` +
        `with ${MAX_PICKUPS} pickups`;
      break;
    }

    const stockPath = estimatePath(
      layout.scraps,
      layout.obstacles,
      spawn,
      WORKSHOP_PROCESSOR,
      stockStats,
    );
    let leftoverStock = leftoverRatio(
      stockPath.pathPx,
      stockStats,
      layout.scraps.length,
      pickupCount,
    );

    if (leftoverStock < recipe.stockLeftoverMin) {
      lastError =
        `stock leftover ${fmt(leftoverStock)} below min ${recipe.stockLeftoverMin}`;
      break;
    }

    if (!isStockStage && leftoverExpected - leftoverStock < MIN_UPGRADE_GAP) {
      if (spreadScale < MAX_SPREAD_SCALE) {
        spreadScale = Math.min(MAX_SPREAD_SCALE, spreadScale * SPREAD_GROWTH);
        lastError = `upgrade gap too small (${fmt(leftoverExpected - leftoverStock)})`;
        continue;
      }
      lastError = `upgrade gap too small (${fmt(leftoverExpected - leftoverStock)}) at max spread`;
      break;
    }

    const report: BalanceReport = {
      stageId: recipe.id,
      pathPxExpected: expectedPath.pathPx,
      pathPxStock: stockPath.pathPx,
      dumpTripsExpected: expectedPath.dumpTrips,
      dumpTripsStock: stockPath.dumpTrips,
      pickupCount,
      leftoverExpected,
      leftoverStock,
      batteryExpected: expectedStats.battery,
      batteryStock: stockStats.battery,
      spreadScale,
    };

    const config: LevelConfig = {
      id: recipe.id,
      displayName: `Stage ${recipe.id}`,
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT,
      processor: { x: WORKSHOP_PROCESSOR.x, y: WORKSHOP_PROCESSOR.y },
      scraps: layout.scraps,
      powerUps: pickups,
      obstacles: layout.obstacles,
      spawn: recipe.spawn ? { x: recipe.spawn.x, y: recipe.spawn.y } : undefined,
    };
    return { config, report };
  }

  throw new Error(`Stage ${recipe.id} failed to balance: ${lastError ?? 'unknown'}`);
}

function fmt(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
