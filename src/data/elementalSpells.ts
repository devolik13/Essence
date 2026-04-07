/**
 * Elemental spells used by Chapter 1 mobs.
 * Based on concept/17_magic.md — tiers 1-3 of each elemental school.
 * Mob-appropriate: lower baseDamage than player spells, no mana cost (mobs don't track mana).
 *
 * Школьные эффекты (применяются ко всем заклинаниям школы):
 *   Огонь  — 10% шанс Горение
 *   Вода   — 20% шанс Охлаждение
 *   Земля  — 50% шанс Пробитие брони
 *   Ветер  — 20% шанс двойной урон
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
  statusEffect: 'burn',
  statusChance: 0.1,
  description: 'Быстрый магический разряд огня. 10% шанс Горения.',
};

/** T2 — Огненная стрела (Fire Arrow) */
export const MOB_FIRE_T2: AbilityDef = {
  id: 'mob_fire_t2',
  prerequisiteId: 'mob_fire_t1',
  nameRu: 'Огн. стрела',
  damageType: 'magic',
  cooldown: 3.5,
  manaCost: 0,
  range: 200,
  baseDamage: 11,
  statusEffect: 'burn',
  statusChance: 0.1,
  description: 'Огненная стрела — усиленный выстрел. 10% шанс Горения.',
};

/** T3 — Огненная стена (Fire Wall): AOE */
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
  statusEffect: 'burn',
  statusChance: 0.1,
  description: 'Огненная зона вокруг цели. 10% шанс Горения.',
};

// ─── WATER SCHOOL ──────────────────────────────────────────────────────────────

/** T1 — Ледышка (Ice Shard) */
export const MOB_WATER_T1: AbilityDef = {
  id: 'mob_water_t1',
  nameRu: 'Ледышка',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 0,
  range: 200,
  baseDamage: 7,
  statusEffect: 'chill',
  statusChance: 0.2,
  description: 'Ледяной осколок. 20% шанс Охлаждения.',
};

/** T2 — Ледяная стрела (Ice Arrow): splash */
export const MOB_WATER_T2: AbilityDef = {
  id: 'mob_water_t2',
  prerequisiteId: 'mob_water_t1',
  nameRu: 'Лед. стрела',
  damageType: 'magic',
  cooldown: 4.0,
  manaCost: 0,
  range: 220,
  baseDamage: 13,
  isAoe: true,
  aoeRadius: 45,
  statusEffect: 'chill',
  statusChance: 0.2,
  description: 'Ледяной снаряд с брызгами. 20% шанс Охлаждения.',
};

/** T3 — Ледяной дождь (Ice Rain): AOE */
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
  statusEffect: 'chill',
  statusChance: 0.2,
  description: 'Зона ледяного дождя. 20% шанс Охлаждения.',
};

// ─── EARTH SCHOOL ──────────────────────────────────────────────────────────────

/** T1 — Камешек (Pebble) */
export const MOB_EARTH_T1: AbilityDef = {
  id: 'mob_earth_t1',
  nameRu: 'Камешек',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 0,
  range: 140,
  baseDamage: 9,
  statusEffect: 'armor_break',
  statusChance: 0.5,
  description: 'Каменный снаряд. 50% шанс Пробития брони.',
};

/** T2 — Каменный шип (Stone Spike): AoE */
export const MOB_EARTH_T2: AbilityDef = {
  id: 'mob_earth_t2',
  prerequisiteId: 'mob_earth_t1',
  nameRu: 'Кам. шип',
  damageType: 'magic',
  cooldown: 5.0,
  manaCost: 0,
  range: 160,
  baseDamage: 15,
  isAoe: true,
  aoeRadius: 55,
  statusEffect: 'armor_break',
  statusChance: 0.5,
  description: 'Шипы из земли вокруг цели. 50% шанс Пробития брони.',
};

/** T3 — Земляной удар (Earth Slam): AoE */
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
  statusEffect: 'armor_break',
  statusChance: 0.5,
  description: 'Мощный удар землёй. 50% шанс Пробития брони.',
};

// ─── WIND SCHOOL ───────────────────────────────────────────────────────────────

/** T1 — Порыв (Gust) */
export const MOB_WIND_T1: AbilityDef = {
  id: 'mob_wind_t1',
  nameRu: 'Порыв',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 0,
  range: 160,
  baseDamage: 5,
  doubleDamageChance: 0.2,
  description: 'Порыв ветра. 20% шанс двойного урона.',
};

/** T2 — Ветрорез (Wind Cutter) */
export const MOB_WIND_T2: AbilityDef = {
  id: 'mob_wind_t2',
  prerequisiteId: 'mob_wind_t1',
  nameRu: 'Ветрорез',
  damageType: 'magic',
  cooldown: 5.0,
  manaCost: 0,
  range: 220,
  baseDamage: 12,
  doubleDamageChance: 0.2,
  description: 'Лезвие воздуха. 20% шанс двойного урона.',
};

/** T3 — Грозовая туча (Storm Cloud): AOE */
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
  doubleDamageChance: 0.2,
  description: 'Молнии по случайным целям в зоне. 20% шанс двойного урона.',
};
