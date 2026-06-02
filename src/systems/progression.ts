import { Stats, StatName, StatCaps } from '../types/stats';

/** XP для повышения параметра с current до current+1 */
export function xpToNextLevel(current: number): number {
  return current * 10;
}

/** XP-трекер для каждого параметра */
export type StatXP = Record<StatName, number>;

export function createEmptyXP(): StatXP {
  const xp = {} as StatXP;
  for (const stat of Object.values(StatName)) {
    xp[stat] = 0;
  }
  return xp;
}

export interface ProgressionResult {
  leveled: boolean;
  stat: StatName;
  newValue: number;
}

/**
 * Добавить XP в конкретный параметр.
 * Если XP достаточно — повышает параметр.
 * Если параметр на капе — перетекает в другие (overflow).
 */
export function addXP(
  stats: Stats,
  xp: StatXP,
  stat: StatName,
  amount: number,
  caps: StatCaps,
): ProgressionResult | null {
  const cap = caps[stat];

  // Если стат на капе — не добавляем
  if (cap !== undefined && stats[stat] >= cap) {
    return null;
  }

  xp[stat] += amount;
  const needed = xpToNextLevel(stats[stat]);

  if (xp[stat] >= needed) {
    xp[stat] -= needed;
    stats[stat] += 1;
    return { leveled: true, stat, newValue: stats[stat] };
  }

  return null;
}

/** Проверить, достиг ли первый основной параметр тела своего капа */
export function isFirstCapReached(stats: Stats, caps: StatCaps): StatName | null {
  for (const [stat, cap] of Object.entries(caps)) {
    if (cap !== undefined && stats[stat as StatName] >= cap) {
      return stat as StatName;
    }
  }
  return null;
}

/** Ранг Сущности = сумма всех 10 параметров / 10 */
export function calcRank(stats: Stats): number {
  const sum = Object.values(stats).reduce((a, b) => a + b, 0);
  return +(sum / 10).toFixed(1);
}
