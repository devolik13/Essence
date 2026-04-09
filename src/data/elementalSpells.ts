/**
 * Elemental spells — T1/T2/T3 for player learning and mob use.
 *
 * Школьные бонусы вынесены в magicSchools.ts — движок применяет их автоматически.
 * Если у заклинания есть собственный statusEffect — он перекрывает школьный.
 *
 * T1 дальность: 240px (как короткий лук)
 */
import { AbilityDef } from '../types/abilities';

// ─── FIRE SCHOOL ───────────────────────────────────────────────────────────────

/** T1 — Искра: одиночный выстрел */
export const MOB_FIRE_T1: AbilityDef = {
  id: 'mob_fire_t1',
  nameRu: 'Искра',
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
  nameRu: 'Огн. стрела',
  school: 'fire',
  damageType: 'magic',
  effectType: 'multi_projectile',
  projectileCount: 5,
  projectileRadius: 150,
  cooldown: 5,
  manaCost: 10,
  range: 240,
  baseDamage: 6,
  description: '5 снарядов по 6 урона в случайные цели (радиус 150px).',
};

/** T3 — Огненная стена: зона на земле, урон стоящим в ней (оригинал Archimage) */
export const MOB_FIRE_T3: AbilityDef = {
  id: 'mob_fire_t3',
  nameRu: 'Огн. стена',
  school: 'fire',
  damageType: 'magic',
  effectType: 'ground_zone',
  castTime: 1.2,
  cooldown: 12,
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

/** Enchant — Зачарование огнём: toggle-аура */
export const ENCHANT_FIRE: AbilityDef = {
  id: 'enchant_fire',
  prerequisiteId: 'mob_fire_t2',
  nameRu: 'Зачарование: Огонь',
  school: 'fire',
  damageType: 'magic',
  effectType: 'weapon_enchant',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  enchantDamage: 8,
  regenPenalty: 0.3,
  description: 'Аура: оружие наносит доп. урон огнём (от Интеллекта). Реген маны −30%.',
};

// ─── WATER SCHOOL ──────────────────────────────────────────────────────────────

/** T1 — Ледышка: одиночный выстрел */
export const MOB_WATER_T1: AbilityDef = {
  id: 'mob_water_t1',
  nameRu: 'Ледышка',
  school: 'water',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 5,
  range: 240,
  baseDamage: 20,
  description: 'Ледяной осколок.',
};

/** T2 — Ледяная стрела: снаряд в цель + взрыв AoE 45px вокруг неё */
export const MOB_WATER_T2: AbilityDef = {
  id: 'mob_water_t2',
  prerequisiteId: 'mob_water_t1',
  nameRu: 'Лед. стрела',
  school: 'water',
  damageType: 'magic',
  effectType: 'projectile_aoe',
  cooldown: 4.0,
  manaCost: 10,
  range: 240,
  baseDamage: 15,
  splashDamage: 10,
  aoeRadius: 45,
  description: 'Снаряд 15 урона + взрыв 10 урона (r45).',
};

/** T3 — Ледяной дождь: зона ледяного дождя, урон + охлаждение 3 сек */
export const MOB_WATER_T3: AbilityDef = {
  id: 'mob_water_t3',
  nameRu: 'Лед. дождь',
  school: 'water',
  damageType: 'magic',
  effectType: 'ground_zone',
  castTime: 1.0,
  cooldown: 10,
  manaCost: 15,
  range: 240,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 80,
  zoneDuration: 3,
  zoneDps: 25,
  statusEffect: 'chill',
  statusChance: 0.3,
  description: 'Зона ледяного дождя (r80, 3 сек). 16 урона/сек. 30% Охлаждение.',
};

/** Enchant — Зачарование водой: toggle-аура */
export const ENCHANT_WATER: AbilityDef = {
  id: 'enchant_water',
  prerequisiteId: 'mob_water_t2',
  nameRu: 'Зачарование: Вода',
  school: 'water',
  damageType: 'magic',
  effectType: 'weapon_enchant',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  enchantDamage: 8,
  regenPenalty: 0.3,
  description: 'Аура: оружие наносит доп. урон водой (от Интеллекта). Реген маны −30%.',
};

// ─── EARTH SCHOOL ──────────────────────────────────────────────────────────────

/** T1 — Камешек: одиночный выстрел */
export const MOB_EARTH_T1: AbilityDef = {
  id: 'mob_earth_t1',
  nameRu: 'Камешек',
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
  nameRu: 'Кам. шип',
  school: 'earth',
  damageType: 'magic',
  effectType: 'cross_aoe',
  crossArmLength: 260,
  crossArmWidth: 30,
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
  nameRu: 'Зем. стена',
  school: 'earth',
  damageType: 'magic',
  effectType: 'summon_wall',
  castTime: 1.0,
  cooldown: 15,
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

/** Enchant — Зачарование землёй: toggle-аура */
export const ENCHANT_EARTH: AbilityDef = {
  id: 'enchant_earth',
  prerequisiteId: 'mob_earth_t2',
  nameRu: 'Зачарование: Земля',
  school: 'earth',
  damageType: 'magic',
  effectType: 'weapon_enchant',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  enchantDamage: 8,
  regenPenalty: 0.3,
  description: 'Аура: оружие наносит доп. урон землёй (от Интеллекта). Реген маны −30%.',
};

// ─── WIND SCHOOL ───────────────────────────────────────────────────────────────

/** T1 — Порыв: одиночный выстрел */
export const MOB_WIND_T1: AbilityDef = {
  id: 'mob_wind_t1',
  nameRu: 'Порыв',
  school: 'wind',
  damageType: 'magic',
  cooldown: 2.0,
  manaCost: 5,
  range: 240,
  baseDamage: 20,
  description: 'Порыв ветра.',
};

/** T2 — Ветрорез: 3 смерча конусом 45°, дальность 160px */
export const MOB_WIND_T2: AbilityDef = {
  id: 'mob_wind_t2',
  prerequisiteId: 'mob_wind_t1',
  nameRu: 'Ветрорез',
  school: 'wind',
  damageType: 'magic',
  effectType: 'cone_projectiles',
  projectileCount: 3,
  coneAngle: 45,
  cooldown: 5.0,
  manaCost: 10,
  range: 160,
  baseDamage: 20,
  description: '3 смерча по 20 урона конусом 45° (160px).',
};

/** T3 — Ветряная стена: размещаемый барьер, снаряды теряют урон пролетая через (оригинал Archimage) */
export const MOB_WIND_T3: AbilityDef = {
  id: 'mob_wind_t3',
  nameRu: 'Ветр. стена',
  school: 'wind',
  damageType: 'magic',
  effectType: 'wind_barrier',
  castTime: 0.5,
  cooldown: 18,
  manaCost: 15,
  range: 200,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 80,
  isWallShape: true,
  wallWidth: 160,
  wallThickness: 20,
  barrierDamageReduction: 0.25,
  barrierDuration: 8,
  description: 'Ветряной барьер (160×20, 8 сек). Снаряды пролетая через него теряют 25% урона.',
};

/** Enchant — Зачарование ветром: toggle-аура */
export const ENCHANT_WIND: AbilityDef = {
  id: 'enchant_wind',
  prerequisiteId: 'mob_wind_t2',
  nameRu: 'Зачарование: Ветер',
  school: 'wind',
  damageType: 'magic',
  effectType: 'weapon_enchant',
  isToggle: true,
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  enchantDamage: 8,
  regenPenalty: 0.3,
  description: 'Аура: оружие наносит доп. урон ветром (от Интеллекта). Реген маны −30%.',
};

// ─── NATURE SCHOOL ─────────────────────────────────────────────────────────────

/** T1 — Призыв волка: призывает волка-союзника */
export const MOB_NATURE_T1: AbilityDef = {
  id: 'mob_nature_t1',
  nameRu: 'Призыв волка',
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
  nameRu: 'Древесная кора',
  school: 'nature',
  damageType: 'magic',
  effectType: 'self_buff',
  statusEffect: 'bark_armor',
  cooldown: 8,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенно даёт +20 Стойкость на 8 сек.',
};

/** T3 — Покров листвы: аура регена HP (оригинал Archimage) */
export const MOB_NATURE_T3: AbilityDef = {
  id: 'mob_nature_t3',
  prerequisiteId: 'mob_nature_t2',
  nameRu: 'Покров листвы',
  school: 'nature',
  damageType: 'magic',
  effectType: 'self_buff',
  statusEffect: 'leaf_regen',
  castTime: 0.5,
  cooldown: 25,
  manaCost: 15,
  range: 0,
  baseDamage: 0,
  description: 'Покров листвы: +100% реген HP на 10 сек.',
};
