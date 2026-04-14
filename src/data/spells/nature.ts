import { AbilityDef } from '../../types/abilities';

// ─── NATURE SCHOOL ─────────────────────────────────────────────────────────────
/** T1 — Призыв волка: призывает волка-союзника */
export const MOB_NATURE_T1: AbilityDef = {
  id: 'mob_nature_t1',
  nameRu: 'Summon Wolf',
  school: 'nature',
  damageType: 'magic',
  effectType: 'summon_wolf',
  cooldown: 5,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  description: 'Призывает волка-союзника. HP и атака масштабируются от Интеллекта.',
};
/** T2 — Древесная кора: самобафф +Стойкость на 8 сек */
export const MOB_NATURE_T2: AbilityDef = {
  id: 'mob_nature_t2',
  prerequisiteId: 'mob_nature_t1',
  nameRu: 'Bark Armor',
  school: 'nature',
  damageType: 'magic',
  effectType: 'self_buff',
  statusEffect: 'bark_armor',
  castTime: 2,
  cooldown: 8,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенно даёт +20 Стойкость на 8 сек.',
};
/** T3 — Покров листвы: групповая аура регена HP (оригинал Archimage) */
export const MOB_NATURE_T3: AbilityDef = {
  id: 'mob_nature_t3',
  prerequisiteId: 'mob_nature_t2',
  nameRu: 'Leaf Canopy',
  school: 'nature',
  damageType: 'magic',
  effectType: 'self_buff',
  statusEffect: 'leaf_regen',
  castTime: 1,
  cooldown: 25,
  manaCost: 15,
  range: 0,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 200,
  description: 'Покров листвы: +100% реген HP на 10 сек. Групповой (r200).',
};
// ═══════════════════════════════════════════════════════════════════════════════
// T4 & T5 — Adapted from Archimage. Not assigned to creatures yet.
// ═══════════════════════════════════════════════════════════════════════════════
// ─── NATURE T4/T5 ────────────────────────────────────────────────────────────
/** T4 — Ent: summon tank (Archimage: защищает + хилит слабейшего) */
export const MOB_NATURE_T4: AbilityDef = {
  id: 'mob_nature_t4', prerequisiteId: 'mob_nature_t3',
  nameRu: 'Ent', school: 'nature', damageType: 'magic',
  effectType: 'summon_wolf',
  castTime: 2, cooldown: 40, manaCost: 15, range: 0, baseDamage: 0,
  description: 'Summon Ent. Tanks and heals weakest ally. 20 sec.',
};
/** T5 — Meteorokinesis: magic damage aura (Archimage: +5-15% стихийным) */
export const MOB_NATURE_T5: AbilityDef = {
  id: 'mob_nature_t5', prerequisiteId: 'mob_nature_t4',
  nameRu: 'Meteorokinesis', school: 'nature', damageType: 'magic',
  effectType: 'self_buff', statusEffect: 'damage_boost',
  isToggle: true,
  cooldown: 0, manaCost: 0, range: 0, baseDamage: 0,
  regenPenalty: 0.2,
  description: 'Toggle: +10% magic damage. -20% mana regen.',
};
