import { AbilityDef } from '../../types/abilities';

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
// ─── WATER T4/T5 ─────────────────────────────────────────────────────────────
/** T4 — Blizzard: interrupt + slow zone (Archimage: прерывание 5-10%) */
export const MOB_WATER_T4: AbilityDef = {
  id: 'mob_water_t4', prerequisiteId: 'mob_water_t3',
  nameRu: 'Blizzard', school: 'water', damageType: 'magic',
  effectType: 'ground_zone',
  castTime: 2, cooldown: 20, manaCost: 15, range: 250, baseDamage: 0,
  isAoe: true, aoeRadius: 120, zoneDuration: 4, zoneDps: 25,
  statusEffect: 'interrupt', statusChance: 0.1,
  description: 'Blizzard zone. 25 dps, r120, 4 sec. 10% interrupt per tick.',
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
