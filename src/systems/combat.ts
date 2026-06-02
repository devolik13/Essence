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

/** Шанс крита: Удача / (Удача + 50) — при Удаче 50 = 50% */
export function critChance(luck: number): number {
  return luck / (luck + LUCK_CONSTANT);
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
