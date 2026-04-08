import { StatCaps, StatName, Stats } from './stats';
import { AbilityDef } from './abilities';
import { LootEntry } from './items';

export enum BodyType {
  Passive = 1,
  Combat = 2,
}

export enum WeaponType {
  Dagger = 'dagger',
  Sword = 'sword',
  Greatsword = 'greatsword',
  Spear = 'spear',
  Mace = 'mace',
  Hammer = 'hammer',
  ShortBow = 'shortbow',
  LongBow = 'longbow',
  Crossbow = 'crossbow',
  StaffFire = 'staff_fire',
  StaffWater = 'staff_water',
  StaffEarth = 'staff_earth',
  StaffWind = 'staff_wind',
  StaffNature = 'staff_nature',
}

/** Тип урона — определяет формулу расчёта и стат-источник */
export type DamageType = 'melee' | 'magic' | 'ranged';

export const WEAPON_COOLDOWNS: Record<WeaponType, number> = {
  [WeaponType.Dagger]: 0.8,
  [WeaponType.Sword]: 1.2,
  [WeaponType.Greatsword]: 2.0,
  [WeaponType.Spear]: 1.8,
  [WeaponType.Mace]: 1.3,
  [WeaponType.Hammer]: 2.2,
  [WeaponType.ShortBow]: 1.0,
  [WeaponType.LongBow]: 1.8,
  [WeaponType.Crossbow]: 2.5,
  [WeaponType.StaffFire]: 1.5,
  [WeaponType.StaffWater]: 1.5,
  [WeaponType.StaffEarth]: 1.5,
  [WeaponType.StaffWind]: 1.5,
  [WeaponType.StaffNature]: 1.5,
};

export interface BodyDefinition {
  id: string;
  name: string;
  nameRu: string;
  type: BodyType;
  damageType: DamageType;  // тип урона существа — определяет формулу атаки
  caps: StatCaps;
  npcStats?: Partial<Stats>;
  xpReward: number;
  weapon: WeaponType;
  color: number;
  abilityName: string;
  signatureSpell?: AbilityDef;
  spellXPThreshold?: number;
  lootTable?: LootEntry[];
  /** Заклинания которые моб использует в бою (тиры 1-3 своей школы) */
  npcSpells?: AbilityDef[];
  /** Стихия моба — для слабостей и зонального спавна */
  element?: 'fire' | 'water' | 'earth' | 'wind';
  /** Босс Главы */
  isBoss?: boolean;
}

// ─── Стартовые тела ────────────────────────────────────

export const STARTER_BODIES: BodyDefinition[] = [
  {
    id: 'human_warrior',
    name: 'Human Warrior',
    nameRu: 'Человек-воин',
    type: BodyType.Combat,
    damageType: 'melee',
    caps: { [StatName.Strength]: 30, [StatName.Armor]: 15, [StatName.Health]: 5 },
    xpReward: 40,
    weapon: WeaponType.Sword,
    color: 0xcc3333,
    abilityName: 'Двойной удар',
  },
  {
    id: 'human_archer',
    name: 'Human Archer',
    nameRu: 'Человек-лучник',
    type: BodyType.Combat,
    damageType: 'ranged',
    caps: { [StatName.Agility]: 30, [StatName.Accuracy]: 15, [StatName.Evasion]: 5 },
    xpReward: 40,
    weapon: WeaponType.ShortBow,
    color: 0x33cc33,
    abilityName: 'Прицельный выстрел',
  },
  {
    id: 'human_mage',
    name: 'Human Mage',
    nameRu: 'Человек-маг',
    type: BodyType.Combat,
    damageType: 'magic',
    caps: { [StatName.Intellect]: 30, [StatName.Mana]: 15, [StatName.Will]: 5 },
    xpReward: 40,
    weapon: WeaponType.StaffFire,
    color: 0x3366ff,
    abilityName: 'Искра',
  },
];

// ─── Первые мобы ───────────────────────────────────────

export const GOBLIN: BodyDefinition = {
  id: 'goblin',
  name: 'Goblin',
  nameRu: 'Гоблин',
  type: BodyType.Combat,
  damageType: 'melee',
  caps: { [StatName.Agility]: 15, [StatName.Luck]: 10, [StatName.Evasion]: 8 },
  xpReward: 25,
  weapon: WeaponType.Dagger,
  color: 0x66aa44,
  abilityName: 'Укол',
};
