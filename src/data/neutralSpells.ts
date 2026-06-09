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
  nameEn: 'Haste',
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
  descriptionEn: 'Instantly grants +50% movement speed for 5 sec.',
};

/** T2 — Лечение: исцеляет себя, зависит от Интеллекта */
export const MOB_NEUTRAL_HEAL: AbilityDef = {
  id: 'neutral_heal',
  nameRu: 'Лечение',
  nameEn: 'Heal',
  school: 'neutral',
  damageType: 'magic',
  effectType: 'self_heal',
  castTime: 1.5,
  cooldown: 8,
  manaCost: 10,
  range: 0,
  baseDamage: 20,
  description: 'Лечит себя на 20 × (1 + Интеллект/100) HP. Каст 1.5 сек.',
  descriptionEn: 'Heals yourself for 20 × (1 + Intellect/100) HP. Cast 1.5 sec.',
};

/** T2 — Рывок: мгновенный бросок вперёд на 180px */
export const MOB_NEUTRAL_T2: AbilityDef = {
  id: 'dash',
  nameRu: 'Рывок',
  nameEn: 'Dash',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'dash_forward',
  dashDistance: 180,
  cooldown: 10,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенный бросок вперёд на 180px. Требует Ускорение.',
  descriptionEn: 'An instant 180px dash forward. Requires Haste.',
};

/** Отчаяние — удар с +10 урона за каждый дебафф на себе */
export const ABILITY_DESPERATION: AbilityDef = {
  id: 'desperation',
  nameRu: 'Отчаяние',
  nameEn: 'Desperation',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 8,
  manaCost: 10,
  range: 60,
  baseDamage: 12,
  bonusDamagePerSelfDebuff: 10,
  description: 'Удар ближнего боя. +10 урона за каждый дебафф на себе.',
  descriptionEn: 'A melee strike. +10 damage for each debuff on you.',
};

/** Адаптация — следующий навык бесплатный */
export const ABILITY_ADAPTATION: AbilityDef = {
  id: 'adaptation',
  nameRu: 'Адаптация',
  nameEn: 'Adaptation',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 15,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  grantFreeNextCast: true,
  description: 'Следующий навык не тратит ману.',
  descriptionEn: 'Your next ability costs no mana.',
};

/** Подпитка — реген HP за каждый бафф на себе */
export const ABILITY_SUSTAIN: AbilityDef = {
  id: 'sustain',
  nameRu: 'Подпитка',
  nameEn: 'Sustenance',
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
  descriptionEn: '+3 HP/sec for each active buff on you (8 sec).',
};

/** Стойкость духа — реген HP за каждый дебафф на себе */
export const ABILITY_SPIRIT_RESILIENCE: AbilityDef = {
  id: 'spirit_resilience',
  nameRu: 'Стойкость духа',
  nameEn: 'Fortitude',
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
  descriptionEn: '+3 HP/sec for each active debuff on you (8 sec).',
};

/** Очищение — лечение за каждый статус на себе */
export const ABILITY_PURIFY: AbilityDef = {
  id: 'purify',
  nameRu: 'Очищение',
  nameEn: 'Purification',
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
  descriptionEn: 'Heals 10 HP for each active status (buff or debuff) on you.',
};

/** Mana Flow — группа +20% реген маны */
export const ABILITY_MANA_FLOW: AbilityDef = {
  id: 'mana_flow',
  nameRu: 'Поток маны',
  nameEn: 'Mana Flow',
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
  descriptionEn: 'All party members gain +20% mana regen for 10 sec.',
};

/** Mana Link — toggle-аура, постоянная передача регена маны сопартийцу */
export const ABILITY_MANA_LINK: AbilityDef = {
  id: 'mana_link',
  nameRu: 'Связь маны',
  nameEn: 'Mana Link',
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
  descriptionEn: 'Toggle: Self -10% mana regen, target ally +15% mana regen. Active until cancelled.',
};

/** Исцеление союзника — лечит выбранного союзника */
export const ABILITY_ALLY_HEAL: AbilityDef = {
  id: 'ally_heal',
  nameRu: 'Исцеление союзника',
  nameEn: 'Heal Ally',
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
  descriptionEn: 'Heals the selected ally for 20 × (1 + Intellect/100) HP. Range 150.',
};

export const NEUTRAL_SPELLS: AbilityDef[] = [
  MOB_NEUTRAL_T1, MOB_NEUTRAL_T2, MOB_NEUTRAL_HEAL,
  ABILITY_DESPERATION, ABILITY_ADAPTATION,
  ABILITY_SUSTAIN, ABILITY_SPIRIT_RESILIENCE, ABILITY_PURIFY,
  ABILITY_MANA_FLOW, ABILITY_MANA_LINK, ABILITY_ALLY_HEAL,
];
