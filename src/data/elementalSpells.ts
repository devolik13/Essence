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

/** Enchant — Зачарование огнём: toggle-аура */
export const ENCHANT_FIRE: AbilityDef = {
  id: 'enchant_fire',
  prerequisiteId: 'mob_fire_t2',
  nameRu: 'Enchant: Fire',
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
  nameRu: 'Ice Shard',
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
  nameRu: 'Ice Arrow',
  school: 'water',
  damageType: 'magic',
  effectType: 'projectile_aoe',
  castTime: 1,
  cooldown: 4.0,
  manaCost: 10,
  range: 240,
  baseDamage: 15,
  splashDamage: 10,
  aoeRadius: 45,
  description: 'Снаряд 15 урона + взрыв 10 урона (r45).',
};

/** T3 — Ледяной дождь: зона ледяного дождя, урон + школьный бонус охлаждения */
export const MOB_WATER_T3: AbilityDef = {
  id: 'mob_water_t3',
  nameRu: 'Ice Rain',
  school: 'water',
  damageType: 'magic',
  effectType: 'ground_zone',
  castTime: 3,
  cooldown: 12,
  manaCost: 15,
  range: 240,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 80,
  zoneDuration: 3,
  zoneDps: 25,
  description: 'Зона ледяного дождя (r80, 3 сек). 25 урона/сек. Школьный бонус: 20% охлаждение.',
};

/** Enchant — Зачарование водой: toggle-аура */
export const ENCHANT_WATER: AbilityDef = {
  id: 'enchant_water',
  prerequisiteId: 'mob_water_t2',
  nameRu: 'Enchant: Water',
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

/** Enchant — Зачарование землёй: toggle-аура */
export const ENCHANT_EARTH: AbilityDef = {
  id: 'enchant_earth',
  prerequisiteId: 'mob_earth_t2',
  nameRu: 'Enchant: Earth',
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
  nameRu: 'Gust',
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
  nameRu: 'Wind Blade',
  school: 'wind',
  damageType: 'magic',
  effectType: 'cone_projectiles',
  projectileCount: 3,
  coneAngle: 45,
  castTime: 1,
  cooldown: 5.0,
  manaCost: 10,
  range: 160,
  baseDamage: 20,
  description: '3 смерча по 20 урона конусом 45° (160px).',
};

/** T3 — Ветряная стена: размещаемый барьер, снаряды теряют урон пролетая через (оригинал Archimage) */
export const MOB_WIND_T3: AbilityDef = {
  id: 'mob_wind_t3',
  nameRu: 'Wind Barrier',
  school: 'wind',
  damageType: 'magic',
  effectType: 'wind_barrier',
  castTime: 1,
  cooldown: 8,
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
  nameRu: 'Enchant: Wind',
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

// ─── FIRE T4/T5 ──────────────────────────────────────────────────────────────

/** T4 — Fireball: AoE explosion (Archimage: взрыв 3×3) */
export const MOB_FIRE_T4: AbilityDef = {
  id: 'mob_fire_t4', prerequisiteId: 'mob_fire_t3',
  nameRu: 'Fireball', school: 'fire', damageType: 'magic',
  isAoe: true, aoeRadius: 100,
  castTime: 2, cooldown: 15, manaCost: 15, range: 280, baseDamage: 35,
  description: 'Massive fireball explosion. AoE r100.',
};

/** T5 — Fire Tsunami: wave of fire, burning ground (Archimage: волна 30-70/колонку) */
export const MOB_FIRE_T5: AbilityDef = {
  id: 'mob_fire_t5', prerequisiteId: 'mob_fire_t4',
  nameRu: 'Fire Tsunami', school: 'fire', damageType: 'magic',
  effectType: 'ground_zone', isWallShape: true, wallWidth: 200, wallThickness: 40,
  castTime: 3, cooldown: 30, manaCost: 15, range: 250, baseDamage: 0,
  isAoe: true, aoeRadius: 100, zoneDuration: 6, zoneDps: 45,
  description: 'Wave of fire. 200×40 wall, 45 dps, 6 sec.',
};

// ─── WATER T4/T5 ─────────────────────────────────────────────────────────────

/** T4 — Blizzard: interrupt + slow zone (Archimage: прерывание 5-10%) */
export const MOB_WATER_T4: AbilityDef = {
  id: 'mob_water_t4', prerequisiteId: 'mob_water_t3',
  nameRu: 'Blizzard', school: 'water', damageType: 'magic',
  effectType: 'ground_zone',
  castTime: 2, cooldown: 20, manaCost: 15, range: 250, baseDamage: 0,
  isAoe: true, aoeRadius: 120, zoneDuration: 4, zoneDps: 25,
  statusEffect: 'chill', statusChance: 0.3,
  description: 'Blizzard zone. 25 dps, r120, 4 sec. 30% chill.',
};

/** T5 — Absolute Zero: instant freeze nova (Archimage: пассивка урон + заморозка) */
export const MOB_WATER_T5: AbilityDef = {
  id: 'mob_water_t5', prerequisiteId: 'mob_water_t4',
  nameRu: 'Absolute Zero', school: 'water', damageType: 'magic',
  isAoe: true, aoeRadius: 150,
  cooldown: 30, manaCost: 15, range: 0, baseDamage: 30,
  statusEffect: 'freeze', statusChance: 1.0,
  description: 'Instant ice nova. r150, freeze all 1 sec.',
};

// ─── WIND T4/T5 ──────────────────────────────────────────────────────────────

/** T4 — Storm Cloud: multiple lightning (Archimage: 5-9 молний по 15-30) */
export const MOB_WIND_T4: AbilityDef = {
  id: 'mob_wind_t4', prerequisiteId: 'mob_wind_t3',
  nameRu: 'Storm Cloud', school: 'wind', damageType: 'magic',
  effectType: 'multi_projectile', projectileCount: 7, projectileRadius: 250,
  castTime: 2, cooldown: 18, manaCost: 15, range: 280, baseDamage: 20,
  doubleDamageChance: 0.2,
  description: '7 lightning bolts at random targets. 20% double damage.',
};

/** T5 — Ball Lightning: chain lightning (Archimage: цепная 30-50, стан + крит) */
export const MOB_WIND_T5: AbilityDef = {
  id: 'mob_wind_t5', prerequisiteId: 'mob_wind_t4',
  nameRu: 'Ball Lightning', school: 'wind', damageType: 'magic',
  effectType: 'multi_projectile', projectileCount: 5, projectileRadius: 300,
  castTime: 1.5, cooldown: 25, manaCost: 15, range: 300, baseDamage: 30,
  doubleDamageChance: 0.3, statusEffect: 'stun', statusChance: 0.05,
  description: 'Chain lightning 5 targets. 30% double dmg, 5% stun.',
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

/** T5 — Meteor Shower: multiple impacts (Archimage: 1-5 метеоритов, -50% брони) */
export const MOB_EARTH_T5: AbilityDef = {
  id: 'mob_earth_t5', prerequisiteId: 'mob_earth_t4',
  nameRu: 'Meteor Shower', school: 'earth', damageType: 'magic',
  effectType: 'multi_projectile', projectileCount: 5, projectileRadius: 200,
  castTime: 3, cooldown: 30, manaCost: 15, range: 280, baseDamage: 30,
  statusEffect: 'armor_break', statusChance: 0.5,
  description: '5 meteors. 30 dmg each, 50% armor break.',
};

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
