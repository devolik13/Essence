/**
 * Neutral school spells — утилита без элемента.
 * T1: 5 маны | T2: 10 маны
 */
import { AbilityDef } from '../types/abilities';
import { WeaponType } from '../types/bodies';

// ─── NEUTRAL SCHOOL ────────────────────────────────────────────────────────────

/** T1 — Ускорение: самобафф +50% скорости на 5 сек */
export const MOB_NEUTRAL_T1: AbilityDef = {
  id: 'acceleration',
  nameRu: 'Ускорение',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'acceleration',
  castTime: 1,
  cooldown: 8,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенно даёт +50% скорости на 5 сек.',
};

/** T2 — Лечение: исцеляет себя, зависит от Интеллекта */
export const MOB_NEUTRAL_HEAL: AbilityDef = {
  id: 'neutral_heal',
  nameRu: 'Лечение',
  school: 'neutral',
  damageType: 'magic',
  effectType: 'self_heal',
  castTime: 1.5,
  cooldown: 8,
  manaCost: 10,
  range: 0,
  baseDamage: 20,
  description: 'Лечит себя на 20 × (1 + Интеллект/100) HP. Каст 1.5 сек.',
};

/** T2 — Рывок: мгновенный бросок вперёд на 180px */
export const MOB_NEUTRAL_T2: AbilityDef = {
  id: 'dash',
  prerequisiteId: 'acceleration',
  nameRu: 'Рывок',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'dash_forward',
  dashDistance: 180,
  cooldown: 10,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенный бросок вперёд на 180px. Требует Ускорение.',
};

// ─── НОВЫЕ НЕЙТРАЛЬНЫЕ ───────────────────────────────────────────────────────

/** Маневр — групповой бонус к уклонению на 3 сек */
export const ABILITY_MANEUVER: AbilityDef = {
  id: 'maneuver',
  nameRu: 'Маневр',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 15,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 200,
  statusEffect: 'evasion_boost',
  description: 'Союзники в r200 получают +10 Уклонение на 3 сек.',
};

/** Прикрытие — групповой блок следующей 1 атаки */
export const ABILITY_COVER: AbilityDef = {
  id: 'cover',
  nameRu: 'Прикрытие',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 20,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 200,
  statusEffect: 'block_next',
  description: 'Союзники в r200 блокируют следующую 1 атаку (10 сек).',
};

/** Щитовая стойка — замедление + броня, только для меча/булавы (со щитом) */
export const ABILITY_SHIELD_STANCE: AbilityDef = {
  id: 'shield_stance',
  nameRu: 'Щитовая стойка',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'shield_stance',
  cooldown: 15,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  requiredWeapons: [WeaponType.Sword, WeaponType.Mace],
  description: 'Замедление −30% на 5 сек, но +15 Armor. Только для меча и булавы (со щитом).',
};

/** Отчаяние — удар с +10 урона за каждый дебафф на себе. Только ближний бой */
export const ABILITY_DESPERATION: AbilityDef = {
  id: 'desperation',
  nameRu: 'Отчаяние',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 8,
  manaCost: 10,
  range: 60,
  baseDamage: 12,
  bonusDamagePerSelfDebuff: 10,
  description: 'Удар ближнего боя. +10 урона за каждый дебафф на себе.',
};

/** Разоблачение — удар с +10% урона за каждый бафф на противнике */
export const ABILITY_EXPOSE: AbilityDef = {
  id: 'expose',
  nameRu: 'Разоблачение',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 8,
  manaCost: 10,
  range: 60,
  baseDamage: 12,
  bonusDamagePercentPerTargetBuff: 0.1,
  description: 'Удар. +10% урона за каждый бафф на противнике.',
};
