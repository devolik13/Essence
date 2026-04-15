import { AbilityDef } from '../../types/abilities';

// ─── EARTH SCHOOL ──────────────────────────────────────────────────────────────
/** T1 — Камешек: одиночный выстрел */
export const MOB_EARTH_T1: AbilityDef = {
  id: 'mob_earth_t1',
  nameRu: 'Pebble Shot',
  school: 'earth',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 5,
  range: 240,
  baseDamage: 20,
  description: 'Каменный снаряд.',
};
/** T2 — Каменный шип: удар + 4 шипа крестом, Пробитие брони (spell-specific: armor_break вместо школьного armor_reduce) */
export const MOB_EARTH_T2: AbilityDef = {
  id: 'mob_earth_t2',
  prerequisiteId: 'mob_earth_t1',
  nameRu: 'Stone Spike',
  school: 'earth',
  damageType: 'magic',
  effectType: 'cross_aoe',
  crossArmLength: 260,
  crossArmWidth: 30,
  castTime: 1,
  cooldown: 5.0,
  manaCost: 10,
  range: 240,
  baseDamage: 20,
  statusEffect: 'armor_break',
  statusChance: 0.2,
  description: 'Удар по цели + 4 шипа крестом (260px). 20% Пробитие брони (-50%).',
};
/** T3 — Земляная стена: призыв стены с HP (оригинал Archimage) */
export const MOB_EARTH_T3: AbilityDef = {
  id: 'mob_earth_t3',
  nameRu: 'Earth Wall',
  school: 'earth',
  damageType: 'magic',
  effectType: 'summon_wall',
  castTime: 1,
  cooldown: 12,
  manaCost: 15,
  range: 120,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 60,
  isWallShape: true,
  wallWidth: 120,
  wallThickness: 24,
  wallHP: 50,
  barrierDuration: 10,
  description: 'Призывает каменную стену (120×24, 10 сек, HP = 50 × (1+Инт/100)).',
};
// ─── EARTH T4/T5 ─────────────────────────────────────────────────────────────
/** T4 — Stone Grotto: armor aura (Archimage: пассивка +10-20% брони) */
export const MOB_EARTH_T4: AbilityDef = {
  id: 'mob_earth_t4', prerequisiteId: 'mob_earth_t3',
  nameRu: 'Stone Grotto', school: 'earth', damageType: 'magic',
  effectType: 'self_buff', statusEffect: 'bark_armor',
  castTime: 1.5, cooldown: 20, manaCost: 15, range: 0, baseDamage: 0,
  isAoe: true, aoeRadius: 200,
  description: '+15% armor to self and allies r200, 8 sec.',
};
/** T5 — Meteor Shower: AoE around caster (Archimage: 1-5 метеоритов, -50% брони) */
export const MOB_EARTH_T5: AbilityDef = {
  id: 'mob_earth_t5', prerequisiteId: 'mob_earth_t4',
  nameRu: 'Meteor Shower', school: 'earth', damageType: 'magic',
  isAoe: true, aoeRadius: 200,
  castTime: 3, cooldown: 30, manaCost: 15, range: 0, baseDamage: 30,
  statusEffect: 'armor_break', statusChance: 0.5,
  description: 'Meteors rain around caster. r200, 30 dmg, 50% armor break.',
};
