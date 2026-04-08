/**
 * Neutral school spells — утилита без элемента.
 * T2: 10 маны | T3: 15 маны
 */
import { AbilityDef } from '../types/abilities';

// ─── NEUTRAL SCHOOL ────────────────────────────────────────────────────────────

/** T2 — Ускорение: самобафф +50% скорости на 3 сек */
export const MOB_NEUTRAL_T2: AbilityDef = {
  id: 'acceleration',
  nameRu: 'Ускорение',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'acceleration',
  cooldown: 8,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенно даёт +50% скорости на 3 сек.',
};

/** T3 — Рывок: мгновенный бросок вперёд на 180px */
export const MOB_NEUTRAL_T3: AbilityDef = {
  id: 'dash',
  prerequisiteId: 'acceleration',
  nameRu: 'Рывок',
  damageType: 'melee',
  effectType: 'dash_forward',
  dashDistance: 180,
  cooldown: 10,
  manaCost: 15,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенный бросок вперёд на 180px.',
};
