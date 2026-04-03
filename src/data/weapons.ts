import { WeaponType, WEAPON_COOLDOWNS } from '../types/bodies';

export interface WeaponDef {
  type: WeaponType;
  nameRu: string;
  cooldown: number;    // сек
  range: number;       // пикс (ближний ~40, дальний ~250)
  isMelee: boolean;
}

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  [WeaponType.Dagger]:     { type: WeaponType.Dagger,     nameRu: 'Кинжал',       cooldown: WEAPON_COOLDOWNS[WeaponType.Dagger],     range: 40,  isMelee: true },
  [WeaponType.Sword]:      { type: WeaponType.Sword,      nameRu: 'Меч',          cooldown: WEAPON_COOLDOWNS[WeaponType.Sword],      range: 48,  isMelee: true },
  [WeaponType.Greatsword]: { type: WeaponType.Greatsword, nameRu: 'Двуручник',    cooldown: WEAPON_COOLDOWNS[WeaponType.Greatsword], range: 56,  isMelee: true },
  [WeaponType.Spear]:      { type: WeaponType.Spear,      nameRu: 'Копьё',        cooldown: WEAPON_COOLDOWNS[WeaponType.Spear],      range: 64,  isMelee: true },
  [WeaponType.Mace]:       { type: WeaponType.Mace,       nameRu: 'Булава',       cooldown: WEAPON_COOLDOWNS[WeaponType.Mace],       range: 44,  isMelee: true },
  [WeaponType.Hammer]:     { type: WeaponType.Hammer,     nameRu: 'Молот',        cooldown: WEAPON_COOLDOWNS[WeaponType.Hammer],     range: 52,  isMelee: true },
  [WeaponType.ShortBow]:   { type: WeaponType.ShortBow,   nameRu: 'Короткий лук', cooldown: WEAPON_COOLDOWNS[WeaponType.ShortBow],   range: 200, isMelee: false },
  [WeaponType.LongBow]:    { type: WeaponType.LongBow,    nameRu: 'Длинный лук',  cooldown: WEAPON_COOLDOWNS[WeaponType.LongBow],    range: 300, isMelee: false },
  [WeaponType.Crossbow]:   { type: WeaponType.Crossbow,   nameRu: 'Арбалет',      cooldown: WEAPON_COOLDOWNS[WeaponType.Crossbow],   range: 280, isMelee: false },
  [WeaponType.Staff]:      { type: WeaponType.Staff,      nameRu: 'Посох',        cooldown: WEAPON_COOLDOWNS[WeaponType.Staff],      range: 180, isMelee: false },
};
