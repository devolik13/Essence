import { AbilityDef } from '../../types/abilities';

// ─── FIRE SCHOOL ───────────────────────────────────────────────────────────────
/** T1 — Искра: одиночный выстрел */
export const MOB_FIRE_T1: AbilityDef = {
  id: 'mob_fire_t1',
  nameRu: 'Spark',
  school: 'fire',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 5,
  range: 240,
  baseDamage: 20,
  description: 'Быстрый магический разряд огня.',
};
/** T2 — Огненная стрела: 5 снарядов в случайные цели в радиусе 150px */
export const MOB_FIRE_T2: AbilityDef = {
  id: 'mob_fire_t2',
  prerequisiteId: 'mob_fire_t1',
  nameRu: 'Fire Arrow',
  school: 'fire',
  damageType: 'magic',
  effectType: 'multi_projectile',
  projectileCount: 5,
  projectileRadius: 150,
  castTime: 1,
  cooldown: 5,
  manaCost: 10,
  range: 240,
  baseDamage: 6,
  description: '5 снарядов по 6 урона в случайные цели (радиус 150px).',
};
/** T3 — Огненная стена: зона на земле, урон стоящим в ней (оригинал Archimage) */
export const MOB_FIRE_T3: AbilityDef = {
  id: 'mob_fire_t3',
  nameRu: 'Fire Wall',
  school: 'fire',
  damageType: 'magic',
  effectType: 'ground_zone',
  castTime: 2,
  cooldown: 8,
  manaCost: 15,
  range: 220,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 60,
  isWallShape: true,
  wallWidth: 140,
  wallThickness: 30,
  zoneDuration: 5,
  zoneDps: 35,
  description: 'Стена огня (140×30, 5 сек). Враги в зоне получают 12 урона/сек.',
};
// ─── FIRE T4/T5 ──────────────────────────────────────────────────────────────
/** T4 — Fireball: AoE explosion (Archimage: взрыв 3×3) */
export const MOB_FIRE_T4: AbilityDef = {
  id: 'mob_fire_t4', prerequisiteId: 'mob_fire_t3',
  nameRu: 'Fireball', school: 'fire', damageType: 'magic',
  isAoe: true, aoeRadius: 160,
  castTime: 2, cooldown: 15, manaCost: 15, range: 280, baseDamage: 35,
  description: 'Massive fireball explosion. AoE r160.',
};
/** T5 — Fire Tsunami: wave sweeps toward caster, leaves burning ground */
export const MOB_FIRE_T5: AbilityDef = {
  id: 'mob_fire_t5', prerequisiteId: 'mob_fire_t4',
  nameRu: 'Fire Tsunami', school: 'fire', damageType: 'magic',
  effectType: 'fire_tsunami',
  wallWidth: 200,       // width of the wave
  wallThickness: 160,   // depth of the zone (wave travels this distance)
  castTime: 3, cooldown: 30, manaCost: 15, range: 250,
  baseDamage: 30,       // wave hit damage (instant)
  isAoe: true, aoeRadius: 100,
  zoneDuration: 6,      // burning ground lasts 6 sec
  zoneDps: 25,          // burning ground DPS
  description: 'Fire wave sweeps toward caster. 30 dmg on hit + burning ground 25 dps, 6 sec.',
};
