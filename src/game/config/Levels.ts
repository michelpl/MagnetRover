import { getMaxStageId, getNextStageId, getStageById, isStageUnlocked, STAGES } from './Stages';

/** Stage list for carousel — delegates to survival StageConfig. */
export const levels = STAGES.map((stage) => ({ id: stage.id, name: stage.name }));

export function getLevelById(id: number) {
  return getStageById(id);
}

export function getNextLevelId(currentId: number): number {
  return getNextStageId(currentId);
}

export function getMaxLevelId(): number {
  return getMaxStageId();
}

export function isLevelUnlocked(levelId: number, currentLevel: number): boolean {
  return isStageUnlocked(levelId, currentLevel);
}

export { getStageById, STAGES };
