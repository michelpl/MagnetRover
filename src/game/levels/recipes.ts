import { GameConfig } from '../config/GameConfig';
import type { UpgradeLevels } from '../save/Save';

export type ClusterSlot = {
  id: number;
  cx: number;
  cy: number;
  baseSpread: number;
};

export type ObstacleSlot = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LevelRecipe = {
  id: number;
  seed: number;
  scrapCount: number;
  slotIds: readonly number[];
  spreadScale: number;
  obstacleSlotIds: readonly number[];
  expectedUpgrades: UpgradeLevels;
  targetLeftoverRatio: number;
  stockLeftoverMin: number;
  spawn?: { x: number; y: number };
};

const LAYOUT_WIDTH = 1672;
const LAYOUT_HEIGHT = 941;

export const MAP_WIDTH = GameConfig.map.width;
export const MAP_HEIGHT = GameConfig.map.height;
export const PROCESSOR_CLEAR_RADIUS = 140;
export const MAP_MARGIN = Math.max(70, GameConfig.map.wallInset + 12);

export function toWorldX(x: number): number {
  return Math.round((x / LAYOUT_WIDTH) * MAP_WIDTH);
}

export function toWorldY(y: number): number {
  return Math.round((y / LAYOUT_HEIGHT) * MAP_HEIGHT);
}

export function toWorldSpread(spread: number): number {
  return Math.round(spread * Math.sqrt((MAP_WIDTH / LAYOUT_WIDTH) * (MAP_HEIGHT / LAYOUT_HEIGHT)));
}

export const WORKSHOP_PROCESSOR = {
  x: toWorldX(836),
  y: toWorldY(140),
} as const;

export const WORKSHOP_SPAWN = {
  x: Math.round(MAP_WIDTH / 2),
  y: Math.round(MAP_HEIGHT / 2),
} as const;

/** Stage 1: south of the processor with a short haul to dump. */
export const TUTORIAL_SPAWN = {
  x: toWorldX(836),
  y: toWorldY(380),
} as const;

/**
 * Walkable workshop cluster anchors (layout space mapped to world).
 * 0–1 near processor corners, 2–4 mid, 5–6 far (bottom), 7 tutorial pile in front of processor.
 */
export const CLUSTER_SLOTS: readonly ClusterSlot[] = [
  { id: 0, cx: toWorldX(280), cy: toWorldY(320), baseSpread: toWorldSpread(140) },
  { id: 1, cx: toWorldX(1390), cy: toWorldY(320), baseSpread: toWorldSpread(140) },
  { id: 2, cx: toWorldX(280), cy: toWorldY(500), baseSpread: toWorldSpread(130) },
  { id: 3, cx: toWorldX(1390), cy: toWorldY(500), baseSpread: toWorldSpread(130) },
  { id: 4, cx: toWorldX(836), cy: toWorldY(620), baseSpread: toWorldSpread(160) },
  { id: 5, cx: toWorldX(320), cy: toWorldY(780), baseSpread: toWorldSpread(110) },
  { id: 6, cx: toWorldX(1350), cy: toWorldY(780), baseSpread: toWorldSpread(110) },
  { id: 7, cx: toWorldX(836), cy: toWorldY(520), baseSpread: toWorldSpread(100) },
];

/** Placeholder crate AABBs (top-left, layout mapped to world). */
export const OBSTACLE_SLOTS: readonly ObstacleSlot[] = [
  { id: 0, x: toWorldX(760), y: toWorldY(380), width: toWorldX(80), height: toWorldY(56) },
  { id: 1, x: toWorldX(1080), y: toWorldY(540), width: toWorldX(72), height: toWorldY(72) },
  { id: 2, x: toWorldX(420), y: toWorldY(560), width: toWorldX(88), height: toWorldY(48) },
];

export const STOCK_UPGRADES: UpgradeLevels = {
  capacity: 0,
  battery: 0,
  magnetRadius: 0,
  speed: 0,
};

/**
 * Buy order the generator assumes: capacity → battery → speed → magnet.
 * Stage 1 is a short tutorial (one pile, modest dump haul).
 * Later stages add distance, scraps, and blockers. Pickups only pad the expected rover.
 */
export const STAGE_RECIPES: readonly LevelRecipe[] = [
  {
    id: 1,
    seed: 1001,
    scrapCount: 12,
    slotIds: [7],
    spreadScale: 0.85,
    obstacleSlotIds: [],
    expectedUpgrades: { ...STOCK_UPGRADES },
    targetLeftoverRatio: 0.28,
    stockLeftoverMin: 0.18,
    spawn: { ...TUTORIAL_SPAWN },
  },
  {
    id: 2,
    seed: 1002,
    scrapCount: 24,
    slotIds: [0, 1, 4],
    spreadScale: 1.05,
    obstacleSlotIds: [],
    expectedUpgrades: { capacity: 1, battery: 0, magnetRadius: 0, speed: 0 },
    targetLeftoverRatio: 0.06,
    stockLeftoverMin: -1.4,
  },
  {
    id: 3,
    seed: 1003,
    scrapCount: 30,
    slotIds: [0, 1, 4, 2],
    spreadScale: 1.12,
    obstacleSlotIds: [],
    expectedUpgrades: { capacity: 1, battery: 1, magnetRadius: 0, speed: 0 },
    targetLeftoverRatio: 0.04,
    stockLeftoverMin: -2.8,
  },
  {
    id: 4,
    seed: 1004,
    scrapCount: 48,
    slotIds: [0, 1, 2, 3, 4, 5, 6],
    spreadScale: 1.25,
    obstacleSlotIds: [0, 1],
    expectedUpgrades: { capacity: 2, battery: 1, magnetRadius: 1, speed: 1 },
    targetLeftoverRatio: 0.02,
    stockLeftoverMin: -5.5,
  },
  {
    id: 5,
    seed: 1005,
    scrapCount: 48,
    slotIds: [0, 1, 2, 3, 4, 5, 6],
    spreadScale: 1.35,
    obstacleSlotIds: [0, 1, 2],
    expectedUpgrades: { capacity: 2, battery: 1, magnetRadius: 1, speed: 1 },
    targetLeftoverRatio: -0.04,
    stockLeftoverMin: -8.5,
  },
];
