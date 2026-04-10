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

export interface WeaponDef {
  type: WeaponType;
  nameRu: string;
  cooldown: number;    // сек
  range: number;       // пикс (ближний ~40, дальний ~250)
  isMelee: boolean;
  baseDamage: number;  // базовый урон оружия
}

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  [WeaponType.Dagger]:     { type: WeaponType.Dagger,     nameRu: 'Кинжал',       cooldown: WEAPON_COOLDOWNS[WeaponType.Dagger],     range: 40,  isMelee: true,  baseDamage: 8  },
  [WeaponType.Sword]:      { type: WeaponType.Sword,      nameRu: 'Меч',          cooldown: WEAPON_COOLDOWNS[WeaponType.Sword],      range: 48,  isMelee: true,  baseDamage: 12 },
  [WeaponType.Greatsword]: { type: WeaponType.Greatsword, nameRu: 'Двуручник',    cooldown: WEAPON_COOLDOWNS[WeaponType.Greatsword], range: 56,  isMelee: true,  baseDamage: 20 },
  [WeaponType.Spear]:      { type: WeaponType.Spear,      nameRu: 'Копьё',        cooldown: WEAPON_COOLDOWNS[WeaponType.Spear],      range: 64,  isMelee: true,  baseDamage: 16 },
  [WeaponType.Mace]:       { type: WeaponType.Mace,       nameRu: 'Булава',       cooldown: WEAPON_COOLDOWNS[WeaponType.Mace],       range: 44,  isMelee: true,  baseDamage: 14 },
  [WeaponType.Hammer]:     { type: WeaponType.Hammer,     nameRu: 'Молот',        cooldown: WEAPON_COOLDOWNS[WeaponType.Hammer],     range: 52,  isMelee: true,  baseDamage: 22 },
  [WeaponType.ShortBow]:   { type: WeaponType.ShortBow,   nameRu: 'Короткий лук', cooldown: WEAPON_COOLDOWNS[WeaponType.ShortBow],   range: 200, isMelee: false, baseDamage: 10 },
  [WeaponType.LongBow]:    { type: WeaponType.LongBow,    nameRu: 'Длинный лук',  cooldown: WEAPON_COOLDOWNS[WeaponType.LongBow],    range: 300, isMelee: false, baseDamage: 15 },
  [WeaponType.Crossbow]:   { type: WeaponType.Crossbow,   nameRu: 'Арбалет',      cooldown: WEAPON_COOLDOWNS[WeaponType.Crossbow],   range: 280, isMelee: false, baseDamage: 18 },
  [WeaponType.StaffFire]:   { type: WeaponType.StaffFire,   nameRu: 'Огненный посох',  cooldown: WEAPON_COOLDOWNS[WeaponType.StaffFire],   range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.StaffWater]:  { type: WeaponType.StaffWater,  nameRu: 'Ледяной посох',   cooldown: WEAPON_COOLDOWNS[WeaponType.StaffWater],  range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.StaffEarth]:  { type: WeaponType.StaffEarth,  nameRu: 'Каменный посох',  cooldown: WEAPON_COOLDOWNS[WeaponType.StaffEarth],  range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.StaffWind]:   { type: WeaponType.StaffWind,   nameRu: 'Штормовой посох', cooldown: WEAPON_COOLDOWNS[WeaponType.StaffWind],   range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.StaffNature]: { type: WeaponType.StaffNature, nameRu: 'Посох природы',   cooldown: WEAPON_COOLDOWNS[WeaponType.StaffNature], range: 180, isMelee: false, baseDamage: 9 },
  [WeaponType.Fists]:       { type: WeaponType.Fists,       nameRu: 'Кастеты',         cooldown: WEAPON_COOLDOWNS[WeaponType.Fists],       range: 36,  isMelee: true,  baseDamage: 10 },
};
