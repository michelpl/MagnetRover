export type UpgradeLevels = {
  capacity: number;
  magnetRadius: number;
  speed: number;
};

export type SaveData = {
  coins: number;
  currentLevel: number;
  upgrades: UpgradeLevels;
  /** First-run tutorial seen (US-038). */
  tutorialSeen: boolean;
};

const SAVE_KEY = 'magnetRoverSaveV1';

const DEFAULT_SAVE: SaveData = {
  coins: 0,
  currentLevel: 1,
  upgrades: {
    capacity: 0,
    magnetRadius: 0,
    speed: 0,
  },
  tutorialSeen: false,
};

function isUpgradeLevels(value: unknown): value is UpgradeLevels {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.capacity === 'number' &&
    typeof record.magnetRadius === 'number' &&
    typeof record.speed === 'number'
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
    isUpgradeLevels(record.upgrades) &&
    typeof record.tutorialSeen === 'boolean'
  );
}

function cloneDefaults(): SaveData {
  return {
    coins: DEFAULT_SAVE.coins,
    currentLevel: DEFAULT_SAVE.currentLevel,
    upgrades: { ...DEFAULT_SAVE.upgrades },
    tutorialSeen: DEFAULT_SAVE.tutorialSeen,
  };
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
      return parsed;
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
};
