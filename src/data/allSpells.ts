/**
 * Единый реестр всех заклинаний/способностей.
 *
 * Чтобы добавить новое заклинание:
 *   1. Определи AbilityDef в соответствующем файле школы/оружия
 *   2. Добавь объект в массив *_SPELLS / WEAPON_ABILITIES / NEUTRAL_SPELLS
 *   — Всё. Реестр, Map, save/load подхватят автоматически.
 *
 * Для быстрого поиска по ID используй SPELL_MAP.get(id).
 */
import { AbilityDef } from '../types/abilities';

import { FIRE_SPELLS } from './spells/fire';
import { WATER_SPELLS } from './spells/water';
import { EARTH_SPELLS } from './spells/earth';
import { WIND_SPELLS } from './spells/wind';
import { NATURE_SPELLS } from './spells/nature';
import { NEUTRAL_SPELLS } from './neutralSpells';
import { WEAPON_ABILITIES } from './specialAbilities';

/** Плоский массив всех заклинаний (для итерации, save/load) */
export const ALL_KNOWN_SPELLS: AbilityDef[] = [
  ...FIRE_SPELLS,
  ...WATER_SPELLS,
  ...EARTH_SPELLS,
  ...WIND_SPELLS,
  ...NATURE_SPELLS,
  ...NEUTRAL_SPELLS,
  ...WEAPON_ABILITIES,
];

/** O(1) поиск заклинания по id */
export const SPELL_MAP: ReadonlyMap<string, AbilityDef> = new Map(
  ALL_KNOWN_SPELLS.map(s => [s.id, s]),
);

/** Поиск заклинания по id (shorthand) */
export function getSpellById(id: string): AbilityDef | undefined {
  return SPELL_MAP.get(id);
}

/** Собрать AbilityDef[] из массива id (для save/load) */
export function resolveSpellIds(ids: string[]): AbilityDef[] {
  const result: AbilityDef[] = [];
  for (const id of ids) {
    const spell = SPELL_MAP.get(id);
    if (spell) result.push(spell);
  }
  return result;
}
