import { AbilityDef } from '../../types/abilities';

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
  effectType: 'chain_lightning',
  chainRadius: 120,   // jump radius between targets
  chainCount: 5,      // number of jumps
  castTime: 1.5, cooldown: 25, manaCost: 15, range: 300, baseDamage: 30,
  doubleDamageChance: 0.3, statusEffect: 'stun', statusChance: 0.05,
  description: 'Ball lightning hits target then chains to 4 nearby enemies. 30% double dmg, 5% stun.',
};

export const WIND_SPELLS: AbilityDef[] = [
  MOB_WIND_T1, MOB_WIND_T2, MOB_WIND_T3, MOB_WIND_T4, MOB_WIND_T5,
];
