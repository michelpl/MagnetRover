import { getMaxLevelId, getNextLevelId } from '../config/Levels';
import { isDebugMode } from '../config/GameConfig';

export type UpgradeLevels = {
  capacity: number;
  battery: number;
  magnetRadius: number;
  speed: number;
};

export type SaveData = {
  coins: number;
  currentLevel: number;
  upgrades: UpgradeLevels;
  tutorialDone: boolean;
  sfxMuted: boolean;
  hapticsEnabled: boolean;
};

const SAVE_KEY = 'magnetRoverSaveV1';

const DEFAULT_SAVE: SaveData = {
  coins: isDebugMode ? 999 : 0,
  currentLevel: 1,
  tutorialDone: false,
  sfxMuted: false,
  hapticsEnabled: true,
  upgrades: {
    capacity: 0,
    battery: 0,
    magnetRadius: 0,
    speed: 0,
  },
};

function isUpgradeLevels(value: unknown): value is UpgradeLevels {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.capacity === 'number' &&
    typeof record.magnetRadius === 'number' &&
    typeof record.speed === 'number' &&
    (typeof record.battery === 'number' || record.battery === undefined)
  );
}

function isSaveData(value: unknown): value is SaveData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.coins === 'number' &&
    typeof record.currentLevel === 'number' &&
    isUpgradeLevels(record.upgrades)
  );
}

function cloneDefaults(): SaveData {
  return {
    coins: DEFAULT_SAVE.coins,
    currentLevel: DEFAULT_SAVE.currentLevel,
    tutorialDone: DEFAULT_SAVE.tutorialDone,
    sfxMuted: DEFAULT_SAVE.sfxMuted,
    hapticsEnabled: DEFAULT_SAVE.hapticsEnabled,
    upgrades: { ...DEFAULT_SAVE.upgrades },
  };
}

function clampCurrentLevel(id: number): number {
  const max = getMaxLevelId();
  if (!Number.isFinite(id)) {
    return 1;
  }
  return Math.min(max, Math.max(1, Math.floor(id)));
}

function readFlag(value: unknown, key: string, defaultValue: boolean): boolean {
  if (typeof value !== 'object' || value === null) {
    return defaultValue;
  }
  const flag = (value as Record<string, unknown>)[key];
  return typeof flag === 'boolean' ? flag : defaultValue;
}

function readTutorialDone(value: unknown): boolean {
  return readFlag(value, 'tutorialDone', false);
}

/** localStorage save/load — shape stays Capacitor-ready (US-029). */
export const Save = {
  load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return cloneDefaults();
      }
      const parsed: unknown = JSON.parse(raw);
      if (!isSaveData(parsed)) {
        console.warn('Save data corrupt; resetting to defaults');
        return cloneDefaults();
      }
      return {
        coins: parsed.coins,
        currentLevel: clampCurrentLevel(parsed.currentLevel),
        tutorialDone: readTutorialDone(parsed),
        sfxMuted: readFlag(parsed, 'sfxMuted', false),
        hapticsEnabled: readFlag(parsed, 'hapticsEnabled', true),
        upgrades: {
          capacity: parsed.upgrades.capacity,
          battery: parsed.upgrades.battery ?? 0,
          magnetRadius: parsed.upgrades.magnetRadius,
          speed: parsed.upgrades.speed,
        },
      };
    } catch (error) {
      console.warn('Failed to load save; resetting to defaults', error);
      return cloneDefaults();
    }
  },

  write(data: SaveData): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to write save', error);
    }
  },

  update(mutator: (data: SaveData) => void): SaveData {
    const data = Save.load();
    mutator(data);
    Save.write(data);
    return data;
  },

  /** Persist a win once: coins plus highest unlocked stage (never decreases). */
  applyWin(levelId: number, coinsEarned: number): SaveData {
    return Save.update((data) => {
      data.coins += coinsEarned;
      data.currentLevel = Math.max(data.currentLevel, getNextLevelId(levelId));
    });
  },

  markTutorialDone(): SaveData {
    return Save.update((data) => {
      data.tutorialDone = true;
    });
  },
};
