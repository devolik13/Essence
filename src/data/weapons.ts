import { WeaponType, WEAPON_COOLDOWNS } from '../types/bodies';

// ── Группы оружий по основному стату ──────────────────────
export const STRENGTH_WEAPONS: WeaponType[] = [
  WeaponType.Sword, WeaponType.Mace, WeaponType.Greatsword,
  WeaponType.Spear, WeaponType.Hammer,
];

export const AGILITY_WEAPONS: WeaponType[] = [
  WeaponType.Dagger, WeaponType.Fists,
  WeaponType.ShortBow, WeaponType.LongBow, WeaponType.Crossbow,
];

export const INTELLECT_WEAPONS: WeaponType[] = [
  WeaponType.StaffFire, WeaponType.StaffWater, WeaponType.StaffEarth,
  WeaponType.StaffWind, WeaponType.StaffNature,
];

import { StatusEffectId } from '../types/statuses';

export interface WeaponDef {
  type: WeaponType;
  nameRu: string;
  cooldown: number;    // сек
  range: number;       // пикс (ближний ~40, дальний ~250)
  isMelee: boolean;
  baseDamage: number;  // базовый урон оружия
  /** Фирменный эффект оружия — автоматически применяется ко всем способностям этого оружия */
  weaponEffect?: StatusEffectId;
  /** Шанс фирменного эффекта (0-1) */
  weaponEffectChance?: number;
  /** Шанс сброса КД при атаке (длинный лук) */
  weaponResetCooldownChance?: number;
  /** Шанс двойного урона при атаке (штормовой посох) */
  weaponDoubleDamageChance?: number;
  /** Шанс самоисцеления при атаке + % от макс HP (посох природы) */
  weaponSelfHealChance?: number;
  weaponSelfHealPercent?: number;
}

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  [WeaponType.Dagger]:     { type: WeaponType.Dagger,     nameRu: 'Кинжал',       cooldown: WEAPON_COOLDOWNS[WeaponType.Dagger],     range: 40,  isMelee: true,  baseDamage: 8,  weaponEffect: 'poison',    weaponEffectChance: 0.2 },
  [WeaponType.Sword]:      { type: WeaponType.Sword,      nameRu: 'Меч',          cooldown: WEAPON_COOLDOWNS[WeaponType.Sword],      range: 48,  isMelee: true,  baseDamage: 12, weaponEffect: 'slow',      weaponEffectChance: 0.2 },
  [WeaponType.Greatsword]: { type: WeaponType.Greatsword, nameRu: 'Двуручник',    cooldown: WEAPON_COOLDOWNS[WeaponType.Greatsword], range: 56,  isMelee: true,  baseDamage: 20, weaponEffect: 'bleed',     weaponEffectChance: 0.2 },
  [WeaponType.Spear]:      { type: WeaponType.Spear,      nameRu: 'Копьё',        cooldown: WEAPON_COOLDOWNS[WeaponType.Spear],      range: 64,  isMelee: true,  baseDamage: 16, weaponEffect: 'knockback', weaponEffectChance: 0.2 },
  [WeaponType.Mace]:       { type: WeaponType.Mace,       nameRu: 'Булава',       cooldown: WEAPON_COOLDOWNS[WeaponType.Mace],       range: 44,  isMelee: true,  baseDamage: 14, weaponEffect: 'fortify',    weaponEffectChance: 0.2 },
  [WeaponType.Hammer]:     { type: WeaponType.Hammer,     nameRu: 'Молот',        cooldown: WEAPON_COOLDOWNS[WeaponType.Hammer],     range: 52,  isMelee: true,  baseDamage: 22, weaponEffect: 'armor_reduce', weaponEffectChance: 0.2 },
  [WeaponType.ShortBow]:   { type: WeaponType.ShortBow,   nameRu: 'Короткий лук', cooldown: WEAPON_COOLDOWNS[WeaponType.ShortBow],   range: 200, isMelee: false, baseDamage: 10, weaponEffect: 'vulnerability', weaponEffectChance: 0.2 },
  [WeaponType.LongBow]:    { type: WeaponType.LongBow,    nameRu: 'Длинный лук',  cooldown: WEAPON_COOLDOWNS[WeaponType.LongBow],    range: 300, isMelee: false, baseDamage: 15, weaponResetCooldownChance: 0.2 },
  [WeaponType.Crossbow]:   { type: WeaponType.Crossbow,   nameRu: 'Арбалет',      cooldown: WEAPON_COOLDOWNS[WeaponType.Crossbow],   range: 280, isMelee: false, baseDamage: 18, weaponEffect: 'weaken', weaponEffectChance: 0.2 },
  [WeaponType.StaffFire]:   { type: WeaponType.StaffFire,   nameRu: 'Огненный посох',  cooldown: WEAPON_COOLDOWNS[WeaponType.StaffFire],   range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.StaffWater]:  { type: WeaponType.StaffWater,  nameRu: 'Ледяной посох',   cooldown: WEAPON_COOLDOWNS[WeaponType.StaffWater],  range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.StaffEarth]:  { type: WeaponType.StaffEarth,  nameRu: 'Каменный посох',  cooldown: WEAPON_COOLDOWNS[WeaponType.StaffEarth],  range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.StaffWind]:   { type: WeaponType.StaffWind,   nameRu: 'Штормовой посох', cooldown: WEAPON_COOLDOWNS[WeaponType.StaffWind],   range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.StaffNature]: { type: WeaponType.StaffNature, nameRu: 'Посох природы',   cooldown: WEAPON_COOLDOWNS[WeaponType.StaffNature], range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.Fists]:       { type: WeaponType.Fists,       nameRu: 'Кастеты',         cooldown: WEAPON_COOLDOWNS[WeaponType.Fists],       range: 36,  isMelee: true,  baseDamage: 10, weaponEffect: 'daze', weaponEffectChance: 0.2 },
};


/**
 * Map item id (e.g. "starter_sword", "fine_longbow") to its WeaponType.
 * Returns undefined for non-weapon items or unknown patterns.
 */
/** Тип урона оружия по его группе: STR→melee, AGI→ranged, INT(посохи)→magic.
 *  Базовая атака следует за оружием в руках, а не за врождённым типом тела
 *  (воин с посохом бьёт магией по Интеллекту). */
export function weaponDamageType(wt: WeaponType): 'melee' | 'ranged' | 'magic' {
  if (INTELLECT_WEAPONS.includes(wt)) return 'magic';
  if (AGILITY_WEAPONS.includes(wt)) {
    // Кинжал/кастеты — ближний (по Ловкости), луки/арбалет — дальний.
    return (wt === WeaponType.Dagger || wt === WeaponType.Fists) ? 'melee' : 'ranged';
  }
  return 'melee';
}

export function getItemWeaponType(itemId: string): WeaponType | undefined {
  // Strip rarity/tier prefix ("starter_"/"basic_"…) AND crafted tier suffix ("_t1".."_t3").
  const base = itemId
    .replace(/^(starter|basic|fine|master|legendary)_/, "")
    .replace(/_t\d+$/, "");
  switch (base) {
    case "sword":           return WeaponType.Sword;
    case "mace":            return WeaponType.Mace;
    case "greatsword":      return WeaponType.Greatsword;
    case "spear":           return WeaponType.Spear;
    case "hammer":          return WeaponType.Hammer;
    case "dagger":          return WeaponType.Dagger;
    case "fists":           return WeaponType.Fists;
    case "shortbow":        return WeaponType.ShortBow;
    case "longbow":         return WeaponType.LongBow;
    case "crossbow":        return WeaponType.Crossbow;
    case "staff_fire":      return WeaponType.StaffFire;
    case "staff_water":     return WeaponType.StaffWater;
    case "staff_earth":     return WeaponType.StaffEarth;
    case "staff_wind":      return WeaponType.StaffWind;
    case "staff_nature":    return WeaponType.StaffNature;
    default: return undefined;
  }
}
