import { DEFAULT_STARTER_WEAPONS, type WeaponId, WEAPON_UNLOCK_ORDER } from '../config/Weapons';
import { getMaxStageId, getNextStageId } from '../config/Stages';
import { isDebugMode } from '../config/GameConfig';

export type RoverUpgradeLevels = {
  hp: number;
  speed: number;
  armor: number;
};

/** Legacy magnet-loop tiers — kept for unused level generator modules. */
export type UpgradeLevels = {
  capacity: number;
  battery: number;
  magnetRadius: number;
  speed: number;
};

export type WeaponUpgradeLevels = Partial<Record<WeaponId, number>>;

export type SaveData = {
  coins: number;
  currentLevel: number;
  tutorialDone: boolean;
  sfxMuted: boolean;
  hapticsEnabled: boolean;
  ownedWeapons: WeaponId[];
  loadout: (WeaponId | null)[];
  weaponUpgrades: WeaponUpgradeLevels;
  roverUpgrades: RoverUpgradeLevels;
};

const SAVE_KEY = 'magnetRoverSaveV2';

const EMPTY_LOADOUT: (WeaponId | null)[] = [null, null, null, null];

const DEFAULT_SAVE: SaveData = {
  coins: isDebugMode ? 999 : 0,
  currentLevel: 1,
  tutorialDone: false,
  sfxMuted: false,
  hapticsEnabled: true,
  ownedWeapons: [...DEFAULT_STARTER_WEAPONS],
  loadout: [DEFAULT_STARTER_WEAPONS[0] ?? null, DEFAULT_STARTER_WEAPONS[1] ?? null, null, null],
  weaponUpgrades: {},
  roverUpgrades: { hp: 0, speed: 0, armor: 0 },
};

function isWeaponId(value: unknown): value is WeaponId {
  return (
    value === 'pulse_cannon' ||
    value === 'arc_turret' ||
    value === 'orbit_drone' ||
    value === 'mine_layer'
  );
}

function parseLoadout(value: unknown): (WeaponId | null)[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_SAVE.loadout];
  }
  const slots: (WeaponId | null)[] = [...EMPTY_LOADOUT];
  for (let i = 0; i < 4; i += 1) {
    const entry = value[i];
    slots[i] = isWeaponId(entry) ? entry : null;
  }
  return slots;
}

function parseOwnedWeapons(value: unknown): WeaponId[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_STARTER_WEAPONS];
  }
  const owned = value.filter(isWeaponId);
  return owned.length > 0 ? owned : [...DEFAULT_STARTER_WEAPONS];
}

function isSaveData(value: unknown): value is SaveData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.coins === 'number' &&
    typeof record.currentLevel === 'number' &&
    Array.isArray(record.ownedWeapons)
  );
}

function migrateLegacySave(parsed: Record<string, unknown>): SaveData {
  const data = cloneDefaults();
  data.coins = typeof parsed.coins === 'number' ? parsed.coins : data.coins;
  data.currentLevel =
    typeof parsed.currentLevel === 'number'
      ? clampCurrentLevel(parsed.currentLevel)
      : data.currentLevel;
  data.tutorialDone = typeof parsed.tutorialDone === 'boolean' ? parsed.tutorialDone : false;
  data.sfxMuted = typeof parsed.sfxMuted === 'boolean' ? parsed.sfxMuted : false;
  data.hapticsEnabled =
    typeof parsed.hapticsEnabled === 'boolean' ? parsed.hapticsEnabled : true;
  return data;
}

function cloneDefaults(): SaveData {
  return {
    coins: DEFAULT_SAVE.coins,
    currentLevel: DEFAULT_SAVE.currentLevel,
    tutorialDone: DEFAULT_SAVE.tutorialDone,
    sfxMuted: DEFAULT_SAVE.sfxMuted,
    hapticsEnabled: DEFAULT_SAVE.hapticsEnabled,
    ownedWeapons: [...DEFAULT_SAVE.ownedWeapons],
    loadout: [...DEFAULT_SAVE.loadout],
    weaponUpgrades: { ...DEFAULT_SAVE.weaponUpgrades },
    roverUpgrades: { ...DEFAULT_SAVE.roverUpgrades },
  };
}

function clampCurrentLevel(id: number): number {
  const max = getMaxStageId();
  if (!Number.isFinite(id)) {
    return 1;
  }
  return Math.min(max, Math.max(1, Math.floor(id)));
}

/** localStorage save/load — survival shape with legacy migration. */
export const Save = {
  load(): SaveData {
    try {
      const rawV2 = localStorage.getItem(SAVE_KEY);
      if (rawV2) {
        const parsed: unknown = JSON.parse(rawV2);
        if (isSaveData(parsed)) {
          return normalizeSave(parsed);
        }
      }
      const rawV1 = localStorage.getItem('magnetRoverSaveV1');
      if (rawV1) {
        const parsed: unknown = JSON.parse(rawV1);
        if (typeof parsed === 'object' && parsed !== null) {
          return migrateLegacySave(parsed as Record<string, unknown>);
        }
      }
      return cloneDefaults();
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

  applyWin(stageId: number, coinsEarned: number): SaveData {
    return Save.update((data) => {
      data.coins += coinsEarned;
      data.currentLevel = Math.max(data.currentLevel, getNextStageId(stageId));
      Save.unlockNextWeapon(data);
    });
  },

  unlockNextWeapon(data: SaveData): void {
    const next = WEAPON_UNLOCK_ORDER.find((id) => !data.ownedWeapons.includes(id));
    if (next) {
      data.ownedWeapons.push(next);
    }
  },

  markTutorialDone(): SaveData {
    return Save.update((data) => {
      data.tutorialDone = true;
    });
  },

  setLoadoutSlot(index: number, weaponId: WeaponId | null): SaveData {
    return Save.update((data) => {
      if (index < 0 || index >= 4) {
        return;
      }
      if (weaponId !== null && !data.ownedWeapons.includes(weaponId)) {
        return;
      }
      data.loadout[index] = weaponId;
    });
  },
};

function normalizeSave(parsed: SaveData): SaveData {
  return {
    coins: parsed.coins,
    currentLevel: clampCurrentLevel(parsed.currentLevel),
    tutorialDone: parsed.tutorialDone ?? false,
    sfxMuted: parsed.sfxMuted ?? false,
    hapticsEnabled: parsed.hapticsEnabled ?? true,
    ownedWeapons: parseOwnedWeapons(parsed.ownedWeapons),
    loadout: parseLoadout(parsed.loadout),
    weaponUpgrades: parsed.weaponUpgrades ?? {},
    roverUpgrades: {
      hp: parsed.roverUpgrades?.hp ?? 0,
      speed: parsed.roverUpgrades?.speed ?? 0,
      armor: parsed.roverUpgrades?.armor ?? 0,
    },
  };
}
