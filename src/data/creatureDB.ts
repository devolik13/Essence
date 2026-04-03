import { BodyDefinition, BodyType, WeaponType, GOBLIN } from '../types/bodies';
import { StatName } from '../types/stats';

/** База всех существ в игре (кроме стартовых — они в starterBodies) */
export const CREATURE_DB: Record<string, BodyDefinition> = {
  goblin: GOBLIN,

  rabbit: {
    id: 'rabbit',
    name: 'Rabbit',
    nameRu: 'Кролик',
    type: BodyType.Passive,
    caps: {
      [StatName.Evasion]: 20,
      [StatName.Agility]: 8,
    },
    weapon: WeaponType.Dagger, // заглушка — кролик не атакует
    color: 0xccaa77,
    abilityName: 'Рывок',
  },

  wolf: {
    id: 'wolf',
    name: 'Wolf',
    nameRu: 'Волк',
    type: BodyType.Combat,
    caps: {
      [StatName.Agility]: 20,
      [StatName.Strength]: 12,
      [StatName.Health]: 8,
    },
    weapon: WeaponType.Dagger, // когти — быстрая атака
    color: 0x888888,
    abilityName: 'Кровотечение',
  },

  bear: {
    id: 'bear',
    name: 'Bear',
    nameRu: 'Медведь',
    type: BodyType.Combat,
    caps: {
      [StatName.Strength]: 35,
      [StatName.Health]: 24,
      [StatName.Armor]: 16,
    },
    weapon: WeaponType.Mace, // лапа — средняя скорость, сильный удар
    color: 0x664422,
    abilityName: 'Рёв',
  },

  orc: {
    id: 'orc',
    name: 'Orc',
    nameRu: 'Орк',
    type: BodyType.Combat,
    caps: {
      [StatName.Strength]: 40,
      [StatName.Health]: 20,
      [StatName.Armor]: 12,
    },
    weapon: WeaponType.Greatsword,
    color: 0x446633,
    abilityName: 'Рассечение',
  },

  shaman: {
    id: 'shaman',
    name: 'Shaman',
    nameRu: 'Шаман',
    type: BodyType.Combat,
    caps: {
      [StatName.Intellect]: 25,
      [StatName.Mana]: 20,
      [StatName.Will]: 10,
    },
    weapon: WeaponType.Staff,
    color: 0x9944aa,
    abilityName: 'Искра',
  },
};

export function getCreature(id: string): BodyDefinition | undefined {
  return CREATURE_DB[id];
}

export function getAllCreatures(): BodyDefinition[] {
  return Object.values(CREATURE_DB);
}
