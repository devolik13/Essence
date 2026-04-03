import { BodyDefinition, BodyType, WeaponType, GOBLIN } from '../types/bodies';
import { StatName } from '../types/stats';

/**
 * caps     = чему учит тело Сферу (потолки роста параметров)
 * npcStats = реальные боевые статы моба в мире (точность, уклонение и т.д.)
 *
 * Это разные вещи! Кролик учит Сферу уклонению (cap 20),
 * но сам кролик — слабое пассивное существо (evasion 3).
 */
export const CREATURE_DB: Record<string, BodyDefinition> = {
  goblin: {
    ...GOBLIN,
    npcStats: {
      [StatName.Strength]: 4,
      [StatName.Accuracy]: 5,
      [StatName.Evasion]: 6,   // немного уклоняется
      [StatName.Health]: 6,
      [StatName.Armor]: 1,
      [StatName.Luck]: 3,
    },
  },

  rabbit: {
    id: 'rabbit',
    name: 'Rabbit',
    nameRu: 'Кролик',
    type: BodyType.Passive,
    caps: {
      [StatName.Evasion]: 20,  // тело учит уклонению
      [StatName.Agility]: 8,
    },
    npcStats: {
      [StatName.Strength]: 1,
      [StatName.Accuracy]: 2,
      [StatName.Evasion]: 3,   // в мире кролик просто убегает, не танцует
      [StatName.Health]: 4,
      [StatName.Armor]: 1,
      [StatName.Luck]: 2,
    },
    weapon: WeaponType.Dagger,
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
    npcStats: {
      [StatName.Strength]: 8,
      [StatName.Accuracy]: 7,
      [StatName.Evasion]: 8,   // волк ловкий
      [StatName.Health]: 8,
      [StatName.Armor]: 2,
      [StatName.Luck]: 3,
    },
    weapon: WeaponType.Dagger,
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
    npcStats: {
      [StatName.Strength]: 18,
      [StatName.Accuracy]: 6,
      [StatName.Evasion]: 3,   // медведь медленный
      [StatName.Health]: 24,
      [StatName.Armor]: 10,
      [StatName.Luck]: 2,
    },
    weapon: WeaponType.Mace,
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
    npcStats: {
      [StatName.Strength]: 15,
      [StatName.Accuracy]: 8,
      [StatName.Evasion]: 4,
      [StatName.Health]: 20,
      [StatName.Armor]: 8,
      [StatName.Luck]: 3,
    },
    weapon: WeaponType.Greatsword,
    color: 0x446633,
    abilityName: 'Рассечение',
  },

  shaman: {
    id: 'shaman',
    name: 'Шаман',
    nameRu: 'Шаман',
    type: BodyType.Combat,
    caps: {
      [StatName.Intellect]: 25,
      [StatName.Mana]: 20,
      [StatName.Will]: 10,
    },
    npcStats: {
      [StatName.Intellect]: 12,
      [StatName.Accuracy]: 7,
      [StatName.Evasion]: 4,
      [StatName.Health]: 12,
      [StatName.Will]: 8,
      [StatName.Mana]: 15,
      [StatName.Luck]: 2,
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
