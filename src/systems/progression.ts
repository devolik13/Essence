import { Stats, StatName, StatCaps } from '../types/stats';

/** XP для повышения параметра с current до current+1.
 *  Math.max(1, …): стат со значением 0 не должен левелиться от нулевого XP. */
export function xpToNextLevel(current: number): number {
  return Math.max(1, current) * 10;
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
 * Добавить XP в конкретный параметр. Поднимает стат столько раз, на сколько
 * хватает накопленного XP (несколько уровней за один вызов). Достигнув капа
 * тела, остаток XP обнуляется — лишний опыт никуда не копится.
 */
export function addXP(
  stats: Stats,
  xp: StatXP,
  stat: StatName,
  amount: number,
  caps: StatCaps,
): ProgressionResult | null {
  const cap = caps[stat];

  // Уже на капе — доли не получает, ничего не копим.
  if (cap !== undefined && stats[stat] >= cap) return null;

  xp[stat] += amount;
  let leveled = false;

  while (true) {
    if (cap !== undefined && stats[stat] >= cap) {
      xp[stat] = 0; // достигли капа — остаток не банкуем
      break;
    }
    const needed = xpToNextLevel(stats[stat]);
    if (xp[stat] < needed) break;
    xp[stat] -= needed;
    stats[stat] += 1;
    leveled = true;
  }

  return leveled ? { leveled: true, stat, newValue: stats[stat] } : null;
}

/**
 * Распределяет XP убийства/квеста по РАСТУЩИМ (ещё не на капе) cap-статам тела.
 * Делит поровну только между открытыми статами: на капе стат доли не получает,
 * по мере закрытия статов весь XP уходит оставшимся. Лишний опыт не копится.
 * Возвращает список произошедших левел-апов (для событий stat-up).
 */
export function distributeXP(
  stats: Stats,
  xp: StatXP,
  amount: number,
  caps: StatCaps,
): ProgressionResult[] {
  const results: ProgressionResult[] = [];
  if (amount <= 0) return results;

  const open = (Object.keys(caps) as StatName[]).filter(
    s => caps[s] !== undefined && stats[s] < (caps[s] as number),
  );
  if (open.length === 0) return results;

  const each = Math.floor(amount / open.length);
  if (each <= 0) return results;

  for (const stat of open) {
    const r = addXP(stats, xp, stat, each, caps);
    if (r) results.push(r);
  }
  return results;
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

/** Ранг Сущности = среднее всех параметров */
export function calcRank(stats: Stats): number {
  const sum = Object.values(stats).reduce((a, b) => a + b, 0);
  return +(sum / Object.keys(stats).length).toFixed(1);
}
