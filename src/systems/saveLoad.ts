import { Sphere } from '../entities/Sphere';
import { AbilityDef } from '../types/abilities';
import { Stats, StatName, createDefaultStats } from '../types/stats';
import { QuestTracker } from './questTracker';
import { InventoryItem } from '../types/items';
import { calcRank } from './progression';

// ── Multi-slot save system ──────────────────────────────
const CHARACTERS_KEY = 'essence_characters';
const OLD_SAVE_KEY = 'essence_sphere_v1';

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
  saveCharacterMeta({
    slotIndex: 0,
    name: 'Character',
    bodyId: 'human_warrior',
    rank: 1,
    lastPlayed: Date.now(),
  });
}

// ── Save data ───────────────────────────────────────────

interface SaveData {
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
  characterName?: string;
  sealFrequencies?: Record<string, boolean>;
  triggeredBodyQuests?: string[];
}

export function saveSphere(sphere: Sphere, knownSpells: AbilityDef[], quests?: QuestTracker): void {
  const questCompleted: string[] = [];
  const questCounts: Record<string, number[]> = {};
  if (quests) {
    for (const q of quests.getAll()) {
      if (q.completed) questCompleted.push(q.def.id);
      questCounts[q.def.id] = [...q.counts];
    }
  }

  const data: SaveData = {
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
    characterName: sphere.characterName,
    sealFrequencies: { ...sphere.sealFrequencies },
    triggeredBodyQuests: [...sphere.triggeredBodyQuests],
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

export function loadSphere(sphere: Sphere, allSpells: AbilityDef[], quests?: QuestTracker): boolean {
  try {
    const raw = localStorage.getItem(getSaveKey(activeSlotIndex));
    if (!raw) return false;

    const data: SaveData = JSON.parse(raw);

    const defaults = createDefaultStats();
    for (const [k, v] of Object.entries(data.stats ?? {})) {
      if (k in defaults) sphere.stats[k as StatName] = v as number;
    }

    for (const [k, v] of Object.entries(data.xpTracker ?? {})) {
      sphere.xpTracker[k as StatName] = v as number;
    }

    sphere.spellProgress = { ...(data.spellProgress ?? {}) };
    sphere.learnedSpells = allSpells.filter(s => data.learnedSpellIds?.includes(s.id));

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
    if (data.characterName) {
      sphere.characterName = data.characterName;
    }
    if (data.sealFrequencies) {
      sphere.sealFrequencies = { ...sphere.sealFrequencies, ...data.sealFrequencies };
    }
    if (data.triggeredBodyQuests) {
      sphere.triggeredBodyQuests = [...data.triggeredBodyQuests];
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
