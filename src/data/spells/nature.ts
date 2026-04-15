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
/** T4 — Ent: protective structure (Archimage: защищает связанных магов) */
export const MOB_NATURE_T4: AbilityDef = {
  id: 'mob_nature_t4', prerequisiteId: 'mob_nature_t3',
  nameRu: 'Ent', school: 'nature', damageType: 'magic',
  effectType: 'summon_ent',
  aoeRadius: 100,       // protection radius
  barrierDuration: 20,  // max lifetime
  castTime: 2, cooldown: 40, manaCost: 15, range: 150, baseDamage: 0,
  description: 'Place Ent (HP=10% of caster). Absorbs damage for allies in r100. 20 sec.',
};
/** T5 — Meteorokinesis: AoE debuff (Archimage: +5-15% стихийным) */
export const MOB_NATURE_T5: AbilityDef = {
  id: 'mob_nature_t5', prerequisiteId: 'mob_nature_t4',
  nameRu: 'Meteorokinesis', school: 'nature', damageType: 'magic',
  isAoe: true, aoeRadius: 250,
  statusEffect: 'magic_vulnerability', statusChance: 1.0,
  castTime: 2, cooldown: 30, manaCost: 15, range: 0, baseDamage: 0,
  description: 'All enemies in r250 take +50% magic damage for 8 sec.',
};
