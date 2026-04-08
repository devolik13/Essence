/**
 * Neutral school spells — утилита без элемента.
 * T1: 5 маны | T2: 10 маны
 */
import { AbilityDef } from '../types/abilities';

// ─── NEUTRAL SCHOOL ────────────────────────────────────────────────────────────

/** T1 — Ускорение: самобафф +50% скорости на 5 сек */
export const MOB_NEUTRAL_T1: AbilityDef = {
  id: 'acceleration',
  nameRu: 'Ускорение',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'acceleration',
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
  damageType: 'melee',
  effectType: 'dash_forward',
  dashDistance: 180,
  cooldown: 10,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенный бросок вперёд на 180px. Требует Ускорение.',
};
