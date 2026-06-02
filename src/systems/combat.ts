import { Stats, StatName } from '../types/stats';
import { LUCK_CONSTANT } from '../utils/constants';

// ─── Ресурсы ───────────────────────────────────────────

export function maxHP(stats: Stats): number {
  return 50 + stats[StatName.Health] * 5;
}

export function maxMana(stats: Stats): number {
  // 50 (старт) + стат Мана × 2.5 (личный стат, кап стата ~20 → до +50)
  // + бонус маны от экипировки (manaBonus добавляется в стат Mana в getEquippedStats)
  // Жёсткий кап 150: личный стат и экипировка вместе.
  return Math.min(50 + stats[StatName.Mana] * 2.5, 150);
}

// ─── Регенерация (процентная) ──────────────────────────

/** HP/сек — полный бар за 60 сек */
export function hpRegenPerSec(stats: Stats): number {
  return maxHP(stats) / 60;
}

/** Мана/сек — полный бар за 30 сек */
export function manaRegenPerSec(stats: Stats): number {
  return maxMana(stats) / 30;
}

// ─── Урон ──────────────────────────────────────────────

/** Урон = базовый урон оружия × (1 + Стат/100) */
export function meleeBaseDamage(weaponBase: number, strength: number): number {
  return weaponBase * (1 + strength / 100);
}

export function rangedBaseDamage(weaponBase: number, agility: number): number {
  return weaponBase * (1 + agility / 100);
}

export function magicBaseDamage(weaponBase: number, intellect: number): number {
  return weaponBase * (1 + intellect / 100);
}

// ─── Защита ────────────────────────────────────────────

/** Снижение физурона: Стойкость / (Стойкость + 125), макс 80%.
 *  Броня клампится в ≥0: отрицательная (от armor_break) даёт 0 редукции,
 *  а не сингулярность/усиление урона (за усиление отвечает статус vulnerability). */
export function physicalReduction(armor: number): number {
  const a = Math.max(0, armor);
  return Math.min(a / (a + 125), 0.8);
}

/** Снижение магурона: Воля / (Воля + 125), макс 80%. Воля клампится в ≥0. */
export function magicalReduction(will: number): number {
  const w = Math.max(0, will);
  return Math.min(w / (w + 125), 0.8);
}

// ─── Попадание и крит ──────────────────────────────────

/** Шанс попасть: Точность / (Точность + Уклонение), в [0,1].
 *  Нет ни точности, ни уклонения — атака просто попадает (нечем уклоняться). */
export function hitChance(accuracy: number, evasion: number): number {
  const denom = accuracy + evasion;
  if (denom <= 0) return 1;
  return Math.min(1, Math.max(0, accuracy / denom));
}

/** Шанс крита: Удача / (Удача + 50) — при Удаче 50 = 50%. Удача клампится в ≥0. */
export function critChance(luck: number): number {
  const l = Math.max(0, luck);
  return l / (l + LUCK_CONSTANT);
}

export const CRIT_MULTIPLIER = 1.5;

// ─── Расчёт итогового урона ────────────────────────────

export interface DamageResult {
  raw: number;
  reduced: number;
  hit: boolean;
  crit: boolean;
  final: number;
}

export function calcMeleeDamage(attacker: Stats, defender: Stats, weaponBase: number): DamageResult {
  const hit = Math.random() < hitChance(attacker[StatName.Accuracy], defender[StatName.Evasion]);
  if (!hit) return { raw: 0, reduced: 0, hit: false, crit: false, final: 0 };

  const raw = meleeBaseDamage(weaponBase, attacker[StatName.Strength]);
  const reduction = physicalReduction(defender[StatName.Armor]);
  const reduced = raw * (1 - reduction);
  const crit = Math.random() < critChance(attacker[StatName.Luck]);
  const final_ = crit ? reduced * CRIT_MULTIPLIER : reduced;

  return { raw, reduced, hit: true, crit, final: Math.round(final_) };
}

export function calcRangedDamage(attacker: Stats, defender: Stats, weaponBase: number): DamageResult {
  const hit = Math.random() < hitChance(attacker[StatName.Accuracy], defender[StatName.Evasion]);
  if (!hit) return { raw: 0, reduced: 0, hit: false, crit: false, final: 0 };

  const raw = rangedBaseDamage(weaponBase, attacker[StatName.Agility]);
  const reduction = physicalReduction(defender[StatName.Armor]);
  const reduced = raw * (1 - reduction);
  const crit = Math.random() < critChance(attacker[StatName.Luck]);
  const final_ = crit ? reduced * CRIT_MULTIPLIER : reduced;

  return { raw, reduced, hit: true, crit, final: Math.round(final_) };
}

export function calcMagicDamage(attacker: Stats, defender: Stats, weaponBase: number): DamageResult {
  // Магия всегда попадает
  const raw = magicBaseDamage(weaponBase, attacker[StatName.Intellect]);
  const reduction = magicalReduction(defender[StatName.Will]);
  const reduced = raw * (1 - reduction);
  const crit = Math.random() < critChance(attacker[StatName.Luck]);
  const final_ = crit ? reduced * CRIT_MULTIPLIER : reduced;

  return { raw, reduced, hit: true, crit, final: Math.round(final_) };
}

// Ранг Сущности и XP-прогрессия живут в systems/progression.ts (calcRank,
// xpToNextLevel) — единый источник истины. Дубли отсюда удалены.
