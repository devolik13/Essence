/**
 * Elemental spells — T1/T2 for player learning and mob use.
 *
 * Школьные эффекты:
 *   Огонь  — 10% шанс Горение
 *   Вода   — 20% шанс Охлаждение
 *   Земля  — 20% шанс Сокрушение/Пробитие брони
 *   Ветер  — 20% шанс двойной урон
 *
 * T1 дальность: 240px (как короткий лук)
 */
import { AbilityDef } from '../types/abilities';

// ─── FIRE SCHOOL ───────────────────────────────────────────────────────────────

/** T1 — Искра: одиночный выстрел, 10% горение */
export const MOB_FIRE_T1: AbilityDef = {
  id: 'mob_fire_t1',
  nameRu: 'Искра',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 5,
  range: 240,
  baseDamage: 6,
  statusEffect: 'burn',
  statusChance: 0.1,
  description: 'Быстрый магический разряд огня. 10% шанс Горения.',
};

/** T2 — Огненная стрела: 5 снарядов в случайные цели в радиусе 150px */
export const MOB_FIRE_T2: AbilityDef = {
  id: 'mob_fire_t2',
  prerequisiteId: 'mob_fire_t1',
  nameRu: 'Огн. стрела',
  damageType: 'magic',
  effectType: 'multi_projectile',
  projectileCount: 5,
  projectileRadius: 150,
  cooldown: 3.5,
  manaCost: 10,
  range: 240,
  baseDamage: 11,
  statusEffect: 'burn',
  statusChance: 0.1,
  description: '5 огненных снарядов в случайные цели в радиусе 150px. 10% горение каждый.',
};

/** T3 — Огненная стена: AOE */
export const MOB_FIRE_T3: AbilityDef = {
  id: 'mob_fire_t3',
  nameRu: 'Огн. стена',
  damageType: 'magic',
  castTime: 1.2,
  cooldown: 12,
  manaCost: 15,
  range: 220,
  baseDamage: 18,
  isAoe: true,
  aoeRadius: 70,
  statusEffect: 'burn',
  statusChance: 0.1,
  description: 'Огненная зона вокруг цели. 10% шанс Горения.',
};

/** Enchant — Зачарование огнём: toggle-аура, оружие наносит доп. маг. урон огнём */
export const ENCHANT_FIRE: AbilityDef = {
  id: 'enchant_fire',
  prerequisiteId: 'mob_fire_t2',
  nameRu: 'Зачарование: Огонь',
  damageType: 'magic',
  effectType: 'weapon_enchant',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  enchantDamage: 8,
  regenPenalty: 0.3,
  statusEffect: 'burn',
  statusChance: 0.1,
  description: 'Аура: оружие наносит доп. урон огнём (от Интеллекта). 10% Горение. Реген маны −30%.',
};

// ─── WATER SCHOOL ──────────────────────────────────────────────────────────────

/** T1 — Ледышка: одиночный выстрел, 20% охлаждение */
export const MOB_WATER_T1: AbilityDef = {
  id: 'mob_water_t1',
  nameRu: 'Ледышка',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 5,
  range: 240,
  baseDamage: 7,
  statusEffect: 'chill',
  statusChance: 0.2,
  description: 'Ледяной осколок. 20% шанс Охлаждения.',
};

/** T2 — Ледяная стрела: удар по цели + взрыв AoE 45px, 20% охлаждение */
export const MOB_WATER_T2: AbilityDef = {
  id: 'mob_water_t2',
  prerequisiteId: 'mob_water_t1',
  nameRu: 'Лед. стрела',
  damageType: 'magic',
  cooldown: 4.0,
  manaCost: 10,
  range: 240,
  baseDamage: 13,
  isAoe: true,
  aoeRadius: 45,
  statusEffect: 'chill',
  statusChance: 0.2,
  description: 'Удар по цели + взрыв 45px. 20% охлаждение на каждую цель.',
};

/** T3 — Ледяной дождь: AOE */
export const MOB_WATER_T3: AbilityDef = {
  id: 'mob_water_t3',
  nameRu: 'Лед. дождь',
  damageType: 'magic',
  castTime: 1.0,
  cooldown: 10,
  manaCost: 15,
  range: 240,
  baseDamage: 16,
  isAoe: true,
  aoeRadius: 80,
  statusEffect: 'chill',
  statusChance: 0.2,
  description: 'Зона ледяного дождя. 20% шанс Охлаждения.',
};

/** Enchant — Зачарование водой: toggle-аура, оружие наносит доп. маг. урон водой */
export const ENCHANT_WATER: AbilityDef = {
  id: 'enchant_water',
  prerequisiteId: 'mob_water_t2',
  nameRu: 'Зачарование: Вода',
  damageType: 'magic',
  effectType: 'weapon_enchant',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  enchantDamage: 8,
  regenPenalty: 0.3,
  statusEffect: 'chill',
  statusChance: 0.2,
  description: 'Аура: оружие наносит доп. урон водой (от Интеллекта). 20% Охлаждение. Реген маны −30%.',
};

// ─── EARTH SCHOOL ──────────────────────────────────────────────────────────────

/** T1 — Камешек: одиночный выстрел, 20% Сокрушение брони (-20%) */
export const MOB_EARTH_T1: AbilityDef = {
  id: 'mob_earth_t1',
  nameRu: 'Камешек',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 5,
  range: 240,
  baseDamage: 9,
  statusEffect: 'armor_reduce',
  statusChance: 0.2,
  description: 'Каменный снаряд. 20% шанс Сокрушения брони (-20%).',
};

/** T2 — Каменный шип: удар по цели + 4 шипа крестом по 260px, 20% Пробитие брони (-50%) */
export const MOB_EARTH_T2: AbilityDef = {
  id: 'mob_earth_t2',
  prerequisiteId: 'mob_earth_t1',
  nameRu: 'Кам. шип',
  damageType: 'magic',
  effectType: 'cross_aoe',
  crossArmLength: 260,
  crossArmWidth: 30,
  cooldown: 5.0,
  manaCost: 10,
  range: 240,
  baseDamage: 15,
  statusEffect: 'armor_break',
  statusChance: 0.2,
  description: 'Удар по цели + 4 шипа крестом (260px). 20% Пробитие брони (-50%) на каждую цель.',
};

/** T3 — Земляной удар: AOE */
export const MOB_EARTH_T3: AbilityDef = {
  id: 'mob_earth_t3',
  nameRu: 'Зем. удар',
  damageType: 'magic',
  castTime: 1.0,
  cooldown: 15,
  manaCost: 15,
  range: 180,
  baseDamage: 22,
  isAoe: true,
  aoeRadius: 65,
  statusEffect: 'armor_break',
  statusChance: 0.2,
  description: 'Мощный удар землёй. 20% шанс Пробития брони.',
};

/** Enchant — Зачарование землёй: toggle-аура, оружие наносит доп. маг. урон землёй */
export const ENCHANT_EARTH: AbilityDef = {
  id: 'enchant_earth',
  prerequisiteId: 'mob_earth_t2',
  nameRu: 'Зачарование: Земля',
  damageType: 'magic',
  effectType: 'weapon_enchant',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  enchantDamage: 8,
  regenPenalty: 0.3,
  statusEffect: 'armor_reduce',
  statusChance: 0.2,
  description: 'Аура: оружие наносит доп. урон землёй (от Интеллекта). 20% Сокрушение брони. Реген маны −30%.',
};

// ─── WIND SCHOOL ───────────────────────────────────────────────────────────────

/** T1 — Порыв: одиночный выстрел, 20% двойной урон */
export const MOB_WIND_T1: AbilityDef = {
  id: 'mob_wind_t1',
  nameRu: 'Порыв',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 5,
  range: 240,
  baseDamage: 5,
  doubleDamageChance: 0.2,
  description: 'Порыв ветра. 20% шанс двойного урона.',
};

/** T2 — Ветрорез: 3 смерча конусом 45°, дальность 160px, 20% двойной урон */
export const MOB_WIND_T2: AbilityDef = {
  id: 'mob_wind_t2',
  prerequisiteId: 'mob_wind_t1',
  nameRu: 'Ветрорез',
  damageType: 'magic',
  effectType: 'cone_projectiles',
  projectileCount: 3,
  coneAngle: 45,
  cooldown: 5.0,
  manaCost: 10,
  range: 160,
  baseDamage: 12,
  doubleDamageChance: 0.2,
  description: '3 смерча конусом 45° (160px). 20% двойной урон на каждый.',
};

/** T3 — Грозовая туча: AOE */
export const MOB_WIND_T3: AbilityDef = {
  id: 'mob_wind_t3',
  nameRu: 'Гроз. туча',
  damageType: 'magic',
  castTime: 1.0,
  cooldown: 18,
  manaCost: 15,
  range: 250,
  baseDamage: 14,
  isAoe: true,
  aoeRadius: 90,
  doubleDamageChance: 0.2,
  description: 'Молнии по случайным целям в зоне. 20% шанс двойного урона.',
};

/** Enchant — Зачарование ветром: toggle-аура, оружие наносит доп. маг. урон ветром */
export const ENCHANT_WIND: AbilityDef = {
  id: 'enchant_wind',
  prerequisiteId: 'mob_wind_t2',
  nameRu: 'Зачарование: Ветер',
  damageType: 'magic',
  effectType: 'weapon_enchant',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  enchantDamage: 8,
  regenPenalty: 0.3,
  doubleDamageChance: 0.2,
  description: 'Аура: оружие наносит доп. урон ветром (от Интеллекта). 20% двойной урон. Реген маны −30%.',
};

// ─── NATURE SCHOOL ─────────────────────────────────────────────────────────────

/** T1 — Призыв волка: призывает волка-союзника */
export const MOB_NATURE_T1: AbilityDef = {
  id: 'mob_nature_t1',
  nameRu: 'Призыв волка',
  damageType: 'magic',
  effectType: 'summon_wolf',
  cooldown: 5,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  description: 'Призывает волка-союзника. HP и атака волка масштабируются от Интеллекта. Пока волк жив — повторный призыв невозможен.',
};

/** T2 — Древесная кора: самобафф +Стойкость на 8 сек */
export const MOB_NATURE_T2: AbilityDef = {
  id: 'mob_nature_t2',
  prerequisiteId: 'mob_nature_t1',
  nameRu: 'Древесная кора',
  damageType: 'magic',
  effectType: 'self_buff',
  statusEffect: 'bark_armor',
  cooldown: 8,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенно даёт +20 Стойкость на 8 сек.',
};
