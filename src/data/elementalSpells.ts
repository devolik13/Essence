/**
 * Elemental spells used by Chapter 1 mobs.
 * Based on concept/17_magic.md — tiers 1-3 of each elemental school.
 * Mob-appropriate: lower baseDamage than player spells, no mana cost (mobs don't track mana).
 */
import { AbilityDef } from '../types/abilities';

// ─── FIRE SCHOOL ───────────────────────────────────────────────────────────────

/** T1 — Искра (Spark): quick single-target shot */
export const MOB_FIRE_T1: AbilityDef = {
  id: 'mob_fire_t1',
  nameRu: 'Искра',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 0,
  range: 180,
  baseDamage: 6,
  description: 'Быстрый магический разряд огня.',
};

/** T2 — Огненная стрела (Fire Arrow): burst of 2-3 shots at nearby targets */
export const MOB_FIRE_T2: AbilityDef = {
  id: 'mob_fire_t2',
  nameRu: 'Огн. стрела',
  damageType: 'magic',
  cooldown: 3.5,
  manaCost: 0,
  range: 200,
  baseDamage: 11,
  description: 'Огненная стрела — усиленный выстрел.',
};

/** T3 — Огненная стена (Fire Wall): AOE around player */
export const MOB_FIRE_T3: AbilityDef = {
  id: 'mob_fire_t3',
  nameRu: 'Огн. стена',
  damageType: 'magic',
  castTime: 1.2,
  cooldown: 12,
  manaCost: 0,
  range: 220,
  baseDamage: 18,
  isAoe: true,
  aoeRadius: 70,
  description: 'Огненная зона вокруг цели, Горение.',
};

// ─── WATER SCHOOL ──────────────────────────────────────────────────────────────

/** T1 — Ледышка (Ice Shard): single target, slight slow */
export const MOB_WATER_T1: AbilityDef = {
  id: 'mob_water_t1',
  nameRu: 'Ледышка',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 0,
  range: 200,
  baseDamage: 7,
  description: 'Ледяной осколок, замедляет цель.',
};

/** T2 — Ледяная стрела (Ice Arrow): hits target + nearby splash */
export const MOB_WATER_T2: AbilityDef = {
  id: 'mob_water_t2',
  nameRu: 'Лед. стрела',
  damageType: 'magic',
  cooldown: 4.0,
  manaCost: 0,
  range: 220,
  baseDamage: 13,
  isAoe: true,
  aoeRadius: 45,
  description: 'Ледяной снаряд с брызгами по соседям.',
};

/** T3 — Ледяной дождь (Ice Rain): AOE slow + damage */
export const MOB_WATER_T3: AbilityDef = {
  id: 'mob_water_t3',
  nameRu: 'Лед. дождь',
  damageType: 'magic',
  castTime: 1.0,
  cooldown: 10,
  manaCost: 0,
  range: 240,
  baseDamage: 16,
  isAoe: true,
  aoeRadius: 80,
  description: 'Зона ледяного дождя, замедление.',
};

// ─── EARTH SCHOOL ──────────────────────────────────────────────────────────────

/** T1 — Камешек (Pebble): single target, armor pierce */
export const MOB_EARTH_T1: AbilityDef = {
  id: 'mob_earth_t1',
  nameRu: 'Камешек',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 0,
  range: 140,
  baseDamage: 9,
  description: 'Каменный снаряд, пробивает броню.',
};

/** T2 — Каменный шип (Stone Spike): hits multiple nearby targets */
export const MOB_EARTH_T2: AbilityDef = {
  id: 'mob_earth_t2',
  nameRu: 'Кам. шип',
  damageType: 'magic',
  cooldown: 5.0,
  manaCost: 0,
  range: 160,
  baseDamage: 15,
  isAoe: true,
  aoeRadius: 55,
  description: 'Шипы из земли вокруг цели.',
};

/** T3 — Земляная стена (Earth Wall): AOE slam */
export const MOB_EARTH_T3: AbilityDef = {
  id: 'mob_earth_t3',
  nameRu: 'Зем. удар',
  damageType: 'magic',
  castTime: 1.0,
  cooldown: 15,
  manaCost: 0,
  range: 180,
  baseDamage: 22,
  isAoe: true,
  aoeRadius: 65,
  description: 'Мощный удар землёй, оглушение.',
};

// ─── WIND SCHOOL ───────────────────────────────────────────────────────────────

/** T1 — Порыв (Gust): single target, knockback */
export const MOB_WIND_T1: AbilityDef = {
  id: 'mob_wind_t1',
  nameRu: 'Порыв',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 0,
  range: 160,
  baseDamage: 5,
  description: 'Порыв ветра, отталкивает цель.',
};

/** T2 — Ветрорез (Wind Cutter): line damage */
export const MOB_WIND_T2: AbilityDef = {
  id: 'mob_wind_t2',
  nameRu: 'Ветрорез',
  damageType: 'magic',
  cooldown: 5.0,
  manaCost: 0,
  range: 220,
  baseDamage: 12,
  description: 'Лезвие воздуха по линии, крит.',
};

/** T3 — Грозовая туча (Storm Cloud): AOE random lightning hits */
export const MOB_WIND_T3: AbilityDef = {
  id: 'mob_wind_t3',
  nameRu: 'Гроз. туча',
  damageType: 'magic',
  castTime: 1.0,
  cooldown: 18,
  manaCost: 0,
  range: 250,
  baseDamage: 14,
  isAoe: true,
  aoeRadius: 90,
  description: 'Молнии по случайным целям в зоне.',
};
