import { Sphere } from '../entities/Sphere';
import { AbilityDef } from '../types/abilities';
import { Stats, StatName, createDefaultStats } from '../types/stats';
import { QuestTracker } from './questTracker';

const SAVE_KEY = 'essence_sphere_v1';

interface SaveData {
  stats: Partial<Stats>;
  xpTracker: Partial<Record<StatName, number>>;
  spellProgress: Record<string, number>;
  learnedSpellIds: string[];
  questCompleted: string[];
  questCounts: Record<string, number[]>;
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
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // localStorage недоступен
  }
}

export function loadSphere(sphere: Sphere, allSpells: AbilityDef[], quests?: QuestTracker): boolean {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;

    const data: SaveData = JSON.parse(raw);

    // Восстановить статы
    const defaults = createDefaultStats();
    for (const [k, v] of Object.entries(data.stats ?? {})) {
      if (k in defaults) sphere.stats[k as StatName] = v as number;
    }

    // Восстановить XP-трекер
    for (const [k, v] of Object.entries(data.xpTracker ?? {})) {
      sphere.xpTracker[k as StatName] = v as number;
    }

    // Восстановить прогресс заклинаний
    sphere.spellProgress = { ...(data.spellProgress ?? {}) };

    // Восстановить выученные заклинания
    sphere.learnedSpells = allSpells.filter(s => data.learnedSpellIds?.includes(s.id));

    // Восстановить квесты
    if (quests && data.questCounts) {
      quests.restoreState(data.questCompleted ?? [], data.questCounts);
    }

    return true;
  } catch {
    return false;
  }
}

export function resetSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
