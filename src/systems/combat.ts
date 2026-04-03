import { Stats, StatName } from '../types/stats';

// ─── Ресурсы ───────────────────────────────────────────

export function maxHP(stats: Stats): number {
  return 50 + stats[StatName.Health] * 5;
}

export function maxMana(stats: Stats): number {
  return 20 + stats[StatName.Mana] * 3;
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

export function meleeBaseDamage(strength: number): number {
  return 5 + strength * 2;
}

export function rangedBaseDamage(agility: number): number {
  return 5 + agility * 2;
}

export function magicBaseDamage(intellect: number): number {
  return 3 + intellect * 2.5;
}

// ─── Защита ────────────────────────────────────────────

/** Снижение физурона: Стойкость / (Стойкость + 125), макс 80% */
export function physicalReduction(armor: number): number {
  return Math.min(armor / (armor + 125), 0.8);
}

/** Снижение магурона: Воля / (Воля + 125), макс 80% */
export function magicalReduction(will: number): number {
  return Math.min(will / (will + 125), 0.8);
}

// ─── Попадание и крит ──────────────────────────────────

/** Шанс попасть: Точность / (Точность + Уклонение) */
export function hitChance(accuracy: number, evasion: number): number {
  return accuracy / (accuracy + evasion);
}

/** Шанс крита: Удача / (Удача + 50) */
export function critChance(luck: number): number {
  return luck / (luck + 50);
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

export function calcMeleeDamage(attacker: Stats, defender: Stats): DamageResult {
  const hit = Math.random() < hitChance(attacker[StatName.Accuracy], defender[StatName.Evasion]);
  if (!hit) return { raw: 0, reduced: 0, hit: false, crit: false, final: 0 };

  const raw = meleeBaseDamage(attacker[StatName.Strength]);
  const reduction = physicalReduction(defender[StatName.Armor]);
  const reduced = raw * (1 - reduction);
  const crit = Math.random() < critChance(attacker[StatName.Luck]);
  const final_ = crit ? reduced * CRIT_MULTIPLIER : reduced;

  return { raw, reduced, hit: true, crit, final: Math.round(final_) };
}

export function calcRangedDamage(attacker: Stats, defender: Stats): DamageResult {
  const hit = Math.random() < hitChance(attacker[StatName.Accuracy], defender[StatName.Evasion]);
  if (!hit) return { raw: 0, reduced: 0, hit: false, crit: false, final: 0 };

  const raw = rangedBaseDamage(attacker[StatName.Agility]);
  const reduction = physicalReduction(defender[StatName.Armor]);
  const reduced = raw * (1 - reduction);
  const crit = Math.random() < critChance(attacker[StatName.Luck]);
  const final_ = crit ? reduced * CRIT_MULTIPLIER : reduced;

  return { raw, reduced, hit: true, crit, final: Math.round(final_) };
}

export function calcMagicDamage(attacker: Stats, defender: Stats): DamageResult {
  // Магия всегда попадает
  const raw = magicBaseDamage(attacker[StatName.Intellect]);
  const reduction = magicalReduction(defender[StatName.Will]);
  const reduced = raw * (1 - reduction);
  const crit = Math.random() < critChance(attacker[StatName.Luck]);
  const final_ = crit ? reduced * CRIT_MULTIPLIER : reduced;

  return { raw, reduced, hit: true, crit, final: Math.round(final_) };
}

// ─── Ранг Сущности ────────────────────────────────────

export function sphereRank(stats: Stats): number {
  const sum = Object.values(stats).reduce((a, b) => a + b, 0);
  return sum / 10;
}

// ─── Прогрессия XP ────────────────────────────────────

/** XP для повышения параметра с current до current+1 */
export function xpToNextLevel(current: number): number {
  return current * 10;
}
