import { Sphere } from '../entities/Sphere';
import { AbilityDef } from '../types/abilities';
import { Stats, StatName, createDefaultStats } from '../types/stats';
import { QuestTracker } from './questTracker';
import { InventoryItem } from '../types/items';
import { calcRank } from './progression';
import { resolveSpellIds } from '../data/allSpells';

// ── Multi-slot save system ──────────────────────────────
const CHARACTERS_KEY = 'essence_characters';
const OLD_SAVE_KEY = 'essence_sphere_v1';

/**
 * Версия схемы сейва. Поднимать при ЛЮБОМ изменении семантики полей
 * (не только при добавлении — добавление additive-полей миграции не требует).
 * Миграции идут ТОЛЬКО вперёд (см. migrateSaveData): отката версии нет.
 *  v1 — первая версионированная схема. Сейвы без поля version = legacy (v0).
 *  v2 — стихийные/природные спеллы переименованы с mob_<школа>_t1..t5 на имена.
 */
const CURRENT_SAVE_VERSION = 2;

/** Ремап id стихийных/природных спеллов v1→v2 (нумерация тиров → имена). */
const SPELL_ID_RENAMES_V2: Record<string, string> = {
  mob_fire_t1: 'mob_fire_spark', mob_fire_t2: 'mob_fire_arrow', mob_fire_t3: 'mob_fire_wall', mob_fire_t4: 'mob_fireball', mob_fire_t5: 'mob_fire_tsunami',
  mob_water_t1: 'mob_ice_shard', mob_water_t2: 'mob_ice_arrow', mob_water_t3: 'mob_ice_rain', mob_water_t4: 'mob_blizzard', mob_water_t5: 'mob_absolute_zero',
  mob_earth_t1: 'mob_pebble_shot', mob_earth_t2: 'mob_stone_spike', mob_earth_t3: 'mob_earth_wall', mob_earth_t4: 'mob_stone_grotto', mob_earth_t5: 'mob_meteor_shower',
  mob_wind_t1: 'mob_gust', mob_wind_t2: 'mob_wind_blade', mob_wind_t3: 'mob_wind_barrier', mob_wind_t4: 'mob_storm_cloud', mob_wind_t5: 'mob_ball_lightning',
  mob_nature_t1: 'mob_summon_wolf', mob_nature_t2: 'mob_bark_armor', mob_nature_t3: 'mob_leaf_canopy', mob_nature_t4: 'mob_ent', mob_nature_t5: 'mob_meteorokinesis',
};

let activeSlotIndex = 0;

function getSaveKey(slot: number): string {
  return `essence_slot_${slot}`;
}

// ── Character metadata ──────────────────────────────────

export interface CharacterMeta {
  slotIndex: number;
  name: string;
  bodyId: string;
  rank: number;
  lastPlayed: number;
}

export function setActiveSlot(slot: number) {
  activeSlotIndex = slot;
}

export function getActiveSlot(): number {
  return activeSlotIndex;
}

export function getCharacters(): CharacterMeta[] {
  try {
    const raw = localStorage.getItem(CHARACTERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function saveCharacters(chars: CharacterMeta[]) {
  localStorage.setItem(CHARACTERS_KEY, JSON.stringify(chars));
}

export function saveCharacterMeta(meta: CharacterMeta): void {
  const chars = getCharacters();
  const idx = chars.findIndex(c => c.slotIndex === meta.slotIndex);
  if (idx >= 0) chars[idx] = meta;
  else chars.push(meta);
  saveCharacters(chars);
}

export function deleteCharacter(slotIndex: number): void {
  const chars = getCharacters().filter(c => c.slotIndex !== slotIndex);
  saveCharacters(chars);
  localStorage.removeItem(getSaveKey(slotIndex));
}

export function findFreeSlot(): number | null {
  const chars = getCharacters();
  const used = new Set(chars.map(c => c.slotIndex));
  for (let i = 0; i < 3; i++) {
    if (!used.has(i)) return i;
  }
  return null;
}

export function migrateOldSave(): void {
  const chars = getCharacters();
  if (chars.length > 0) return;
  const old = localStorage.getItem(OLD_SAVE_KEY);
  if (!old) return;
  localStorage.setItem(getSaveKey(0), old);
  localStorage.removeItem(OLD_SAVE_KEY);

  // Восстанавливаем реальные метаданные из старого сейва, а не хардкодим
  // воина/ранг 1 (иначе портим имя/тело/ранг любому не-воину).
  let name = 'Character';
  let bodyId = 'human_warrior';
  let rank = 1;
  try {
    const data = JSON.parse(old) as Partial<SaveData>;
    if (data.characterName) name = data.characterName;
    if (data.lastBodyId) bodyId = data.lastBodyId;
    if (data.stats) rank = calcRank({ ...createDefaultStats(), ...data.stats });
  } catch { /* битый старый сейв — оставляем дефолты */ }

  saveCharacterMeta({
    slotIndex: 0,
    name,
    bodyId,
    rank,
    lastPlayed: Date.now(),
  });
}

// ── Save data ───────────────────────────────────────────

interface SaveData {
  version: number;
  stats: Partial<Stats>;
  xpTracker: Partial<Record<StatName, number>>;
  spellProgress: Record<string, number>;
  learnedSpellIds: string[];
  questCompleted: string[];
  questCounts: Record<string, number[]>;
  savedSlotIds?: (string | null)[];
  inventory?: InventoryItem[];
  killCounts?: Record<string, number>;
  unlockedAchievements?: string[];
  trackedQuestIds?: string[];
  lastBodyId?: string | null;
  copper?: number;
  weaponSlotConfigs?: Record<string, (string | null)[]>;
  equipment?: import('../types/items').Equipment;
  activeWeaponSlot?: number;
  characterName?: string;
  sealFrequencies?: Record<string, boolean>;
  triggeredBodyQuests?: string[];
  learnedRecipes?: string[];
}

export function saveSphere(sphere: Sphere, _knownSpells?: AbilityDef[], quests?: QuestTracker): void {
  const questCompleted: string[] = [];
  const questCounts: Record<string, number[]> = {};
  if (quests) {
    for (const q of quests.getAll()) {
      if (q.completed) questCompleted.push(q.def.id);
      questCounts[q.def.id] = [...q.counts];
    }
  }

  const data: SaveData = {
    version: CURRENT_SAVE_VERSION,
    stats: { ...sphere.stats },
    xpTracker: { ...sphere.xpTracker },
    spellProgress: { ...sphere.spellProgress },
    learnedSpellIds: sphere.learnedSpells.map(s => s.id),
    questCompleted,
    questCounts,
    savedSlotIds: [...sphere.savedSlotIds],
    inventory: sphere.inventory.map(i => ({ ...i })),
    killCounts: { ...sphere.killCounts },
    unlockedAchievements: [...sphere.unlockedAchievements],
    trackedQuestIds: [...sphere.trackedQuestIds],
    lastBodyId: sphere.lastBodyId ?? null,
    copper: sphere.copper,
    weaponSlotConfigs: { ...sphere.weaponSlotConfigs },
    equipment: { ...sphere.equipment },
    activeWeaponSlot: sphere.activeWeaponSlot,
    characterName: sphere.characterName,
    sealFrequencies: { ...sphere.sealFrequencies },
    triggeredBodyQuests: [...sphere.triggeredBodyQuests],
    learnedRecipes: [...sphere.learnedRecipes],
  };
  try {
    localStorage.setItem(getSaveKey(activeSlotIndex), JSON.stringify(data));
  } catch {
    // localStorage unavailable
  }

  saveCharacterMeta({
    slotIndex: activeSlotIndex,
    name: sphere.characterName || 'Character',
    bodyId: sphere.lastBodyId ?? 'human_warrior',
    rank: calcRank(sphere.stats),
    lastPlayed: Date.now(),
  });
}

/**
 * Прогоняет распарсенный сейв через цепочку forward-миграций до текущей версии.
 * Сейв без поля version считается legacy (v0). Добавляйте ступени по мере
 * изменения семантики полей; каждая ступень поднимает version на 1.
 */
function migrateSaveData(parsed: unknown): SaveData {
  const data = (parsed ?? {}) as SaveData & { version?: number };
  let v = data.version ?? 0;

  // v0 → v1: первая версионированная схема. Поля additive/optional и читаются
  // загрузчиком через undefined-проверки, поэтому структурных правок нет —
  // просто проставляем версию.
  if (v < 1) v = 1;

  // v1 → v2: переименование id стихийных/природных спеллов на имена.
  if (v < 2) {
    const remap = (id: string) => SPELL_ID_RENAMES_V2[id] ?? id;
    if (Array.isArray(data.learnedSpellIds)) {
      data.learnedSpellIds = data.learnedSpellIds.map(remap);
    }
    if (data.spellProgress) {
      const np: Record<string, number> = {};
      for (const [k, val] of Object.entries(data.spellProgress)) np[remap(k)] = val;
      data.spellProgress = np;
    }
    if (data.weaponSlotConfigs) {
      for (const wkey of Object.keys(data.weaponSlotConfigs)) {
        data.weaponSlotConfigs[wkey] = data.weaponSlotConfigs[wkey].map(s => (s ? remap(s) : s));
      }
    }
    v = 2;
  }

  data.version = v;
  return data;
}

export function loadSphere(sphere: Sphere, _allSpells?: AbilityDef[], quests?: QuestTracker): boolean {
  try {
    const raw = localStorage.getItem(getSaveKey(activeSlotIndex));
    if (!raw) return false;

    // Миграции идут только вперёд; сейв новее кода (version > CURRENT, при
    // откате игры) грузим best-effort — неизвестные поля просто игнорируются.
    const data: SaveData = migrateSaveData(JSON.parse(raw));

    const defaults = createDefaultStats();
    for (const [k, v] of Object.entries(data.stats ?? {})) {
      if (k in defaults) sphere.stats[k as StatName] = v as number;
    }

    for (const [k, v] of Object.entries(data.xpTracker ?? {})) {
      sphere.xpTracker[k as StatName] = v as number;
    }

    sphere.spellProgress = { ...(data.spellProgress ?? {}) };
    sphere.learnedSpells = resolveSpellIds(data.learnedSpellIds ?? []);

    if (quests && data.questCounts) {
      quests.restoreState(data.questCompleted ?? [], data.questCounts);
    }

    if (data.savedSlotIds) {
      sphere.savedSlotIds = [...data.savedSlotIds];
    }
    if (data.inventory) {
      sphere.inventory = data.inventory.map(i => ({ ...i }));
    }
    if (data.killCounts) {
      sphere.killCounts = { ...data.killCounts };
    }
    if (data.unlockedAchievements) {
      sphere.unlockedAchievements = [...data.unlockedAchievements];
    }
    if (data.trackedQuestIds) {
      sphere.trackedQuestIds = [...data.trackedQuestIds];
    }
    if (data.lastBodyId !== undefined) {
      sphere.lastBodyId = data.lastBodyId;
    }
    if (data.copper !== undefined) {
      sphere.copper = data.copper;
    }
    if (data.weaponSlotConfigs) {
      sphere.weaponSlotConfigs = { ...data.weaponSlotConfigs };
    }
    if (data.equipment) {
      sphere.equipment = { ...data.equipment };
    }
    if (data.activeWeaponSlot !== undefined) {
      sphere.activeWeaponSlot = data.activeWeaponSlot;
    }
    if (data.characterName) {
      sphere.characterName = data.characterName;
    }
    if (data.sealFrequencies) {
      sphere.sealFrequencies = { ...sphere.sealFrequencies, ...data.sealFrequencies };
    }
    if (data.triggeredBodyQuests) {
      sphere.triggeredBodyQuests = [...data.triggeredBodyQuests];
    }
    if (data.learnedRecipes) {
      sphere.learnedRecipes = [...data.learnedRecipes];
    }

    return true;
  } catch {
    return false;
  }
}

export function resetSave(): void {
  localStorage.removeItem(getSaveKey(activeSlotIndex));
  const chars = getCharacters().filter(c => c.slotIndex !== activeSlotIndex);
  saveCharacters(chars);
}
