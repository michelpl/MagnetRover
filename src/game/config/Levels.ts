import type { LevelConfig } from './LevelConfig';
import { generateLevel } from '../levels/generateLevel';
import { STAGE_RECIPES } from '../levels/recipes';

export const levels: readonly LevelConfig[] = STAGE_RECIPES.map(generateLevel);

export function getLevelById(id: number): LevelConfig {
  const level = levels.find((entry) => entry.id === id);
  if (!level) {
    throw new Error(`Unknown level id: ${id}`);
  }
  return level;
}

export function getNextLevelId(currentId: number): number {
  const index = levels.findIndex((entry) => entry.id === currentId);
  if (index < 0 || index >= levels.length - 1) {
    return levels[levels.length - 1]?.id ?? currentId;
  }
  return levels[index + 1].id;
}

export function getMaxLevelId(): number {
  return levels[levels.length - 1]?.id ?? 1;
}

export function isLevelUnlocked(levelId: number, currentLevel: number): boolean {
  return levelId <= currentLevel;
}
