import { StatCaps, StatName, Stats } from './stats';
import { AbilityDef } from './abilities';
import { LootEntry } from './items';

export enum BodyType {
  Passive = 1,  // Не атакует первым, но дерётся в ответ
  Combat = 2,   // Агрессивный, атакует при приближении
  Fleeing = 3,  // Всегда убегает, никогда не дерётся
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
  Fists = 'fists',
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
  [WeaponType.Fists]: 0.9,
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
  /** Школа моба — для слабостей/VFX/спавна. 4 стихии участвуют в Печати Стихий;
   *  nature/neutral — школы вне Печати (частоту не дают). */
  element?: 'fire' | 'water' | 'earth' | 'wind' | 'nature' | 'neutral';
  /** Босс Главы */
  isBoss?: boolean;
  /** true = в этом теле доступны все выученные заклинания. false/undefined = только базовая атака + своё умение */
  canUseAllSpells?: boolean;
  /** Фракционная принадлежность для межсуществной вражды (e.g. 'caravan' vs 'raider'). */
  faction?: string;
  /** Multiplier on the rendered display size (1.0 = default, 1.5 = +50%, 2.0 = +100%). */
  displaySizeMultiplier?: number;
}

// ─── Стартовые тела ────────────────────────────────────

export const STARTER_BODIES: BodyDefinition[] = [
  {
    id: 'human_warrior',
    name: 'Human Warrior',
    nameRu: 'Human Warrior',
    type: BodyType.Combat,
    damageType: 'melee',
    caps: { [StatName.Strength]: 30, [StatName.Armor]: 15, [StatName.Health]: 5 },
    xpReward: 40,
    weapon: WeaponType.Sword,
    color: 0xcc3333,
    abilityName: 'Double Strike',
    canUseAllSpells: true,
  },
  {
    id: 'human_archer',
    name: 'Human Archer',
    nameRu: 'Human Archer',
    type: BodyType.Combat,
    damageType: 'ranged',
    caps: { [StatName.Agility]: 30, [StatName.Accuracy]: 15, [StatName.Evasion]: 5 },
    xpReward: 40,
    weapon: WeaponType.ShortBow,
    color: 0x33cc33,
    abilityName: 'Aimed Shot',
    canUseAllSpells: true,
  },
  {
    id: 'human_mage',
    name: 'Human Mage',
    nameRu: 'Human Mage',
    type: BodyType.Combat,
    damageType: 'magic',
    caps: { [StatName.Intellect]: 30, [StatName.Mana]: 15, [StatName.Will]: 5 },
    xpReward: 40,
    weapon: WeaponType.StaffFire,
    color: 0x3366ff,
    abilityName: 'Spark',
    canUseAllSpells: true,
  },
];

// ─── Первые мобы ───────────────────────────────────────

export const GOBLIN: BodyDefinition = {
  id: 'goblin',
  name: 'Goblin',
  nameRu: 'Goblin',
  type: BodyType.Combat,
  damageType: 'melee',
  caps: { [StatName.Agility]: 15, [StatName.Luck]: 10, [StatName.Evasion]: 8 },
  xpReward: 25,
  weapon: WeaponType.Dagger,
  color: 0x66aa44,
  abilityName: 'Sting',
};
