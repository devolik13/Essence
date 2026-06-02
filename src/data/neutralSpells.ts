/**
 * Neutral school spells — утилита без элемента, без привязки к оружию.
 * T1: 5 маны | T2: 10 маны
 */
import { AbilityDef } from '../types/abilities';

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
  cooldown: 15,
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

/** Отчаяние — удар с +10 урона за каждый дебафф на себе */
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

/** Адаптация — следующий навык бесплатный */
export const ABILITY_ADAPTATION: AbilityDef = {
  id: 'adaptation',
  nameRu: 'Адаптация',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 15,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  grantFreeNextCast: true,
  description: 'Следующий навык не тратит ману.',
};

/** Подпитка — реген HP за каждый бафф на себе */
export const ABILITY_SUSTAIN: AbilityDef = {
  id: 'sustain',
  nameRu: 'Подпитка',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'regen_per_buff',
  cooldown: 15,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: '+3 HP/сек за каждый активный бафф на себе (8 сек).',
};

/** Стойкость духа — реген HP за каждый дебафф на себе */
export const ABILITY_SPIRIT_RESILIENCE: AbilityDef = {
  id: 'spirit_resilience',
  nameRu: 'Стойкость духа',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'regen_per_debuff',
  cooldown: 15,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: '+3 HP/сек за каждый активный дебафф на себе (8 сек).',
};

/** Очищение — лечение за каждый статус на себе */
export const ABILITY_PURIFY: AbilityDef = {
  id: 'purify',
  nameRu: 'Очищение',
  school: 'neutral',
  damageType: 'magic',
  effectType: 'self_heal',
  cooldown: 10,
  castTime: 1.5,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  healPerStatusEffect: 10,
  description: 'Лечит 10 HP за каждый активный статус (бафф или дебафф) на себе.',
};

/** Mana Flow — группа +20% реген маны */
export const ABILITY_MANA_FLOW: AbilityDef = {
  id: 'mana_flow',
  nameRu: 'Поток маны',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'mana_flow',
  cooldown: 30,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  targetParty: true,
  description: 'All party members gain +20% mana regen for 10 sec.',
};

/** Mana Link — toggle-аура, постоянная передача регена маны сопартийцу */
export const ABILITY_MANA_LINK: AbilityDef = {
  id: 'mana_link',
  nameRu: 'Связь маны',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  targetParty: true,
  description: 'Toggle: Self -10% mana regen, target ally +15% mana regen. Active until cancelled.',
};

/** Исцеление союзника — лечит выбранного союзника */
export const ABILITY_ALLY_HEAL: AbilityDef = {
  id: 'ally_heal',
  nameRu: 'Исцеление союзника',
  school: 'neutral',
  damageType: 'magic',
  effectType: 'self_heal',
  targetAlly: true,
  cooldown: 8,
  castTime: 1.5,
  manaCost: 10,
  range: 150,
  baseDamage: 20,
  description: 'Лечит выбранного союзника на 20 × (1 + Интеллект/100) HP. Дальность 150.',
};

export const NEUTRAL_SPELLS: AbilityDef[] = [
  MOB_NEUTRAL_T1, MOB_NEUTRAL_T2, MOB_NEUTRAL_HEAL,
  ABILITY_DESPERATION, ABILITY_ADAPTATION,
  ABILITY_SUSTAIN, ABILITY_SPIRIT_RESILIENCE, ABILITY_PURIFY,
  ABILITY_MANA_FLOW, ABILITY_MANA_LINK, ABILITY_ALLY_HEAL,
];
