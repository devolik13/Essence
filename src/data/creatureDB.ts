import { BodyDefinition, BodyType, WeaponType, GOBLIN } from '../types/bodies';
import { StatName } from '../types/stats';
import { AbilityDef } from '../types/abilities';
import {
  MOB_FIRE_T1, MOB_FIRE_T2, MOB_FIRE_T3,
  MOB_WATER_T1, MOB_WATER_T2, MOB_WATER_T3,
  MOB_EARTH_T1, MOB_EARTH_T2, MOB_EARTH_T3,
  MOB_WIND_T1, MOB_WIND_T2,
} from './elementalSpells';
import {
  ABILITY_DASH,
  ABILITY_STING,
  ABILITY_SWORD_STRIKE,
  ABILITY_MACE_STRIKE,
  ABILITY_SLASH,
  ABILITY_BOW_SHOT,
  ABILITY_LONGBOW_SHOT,
  ABILITY_CROSSBOW_BOLT,
  ABILITY_SPEAR_THRUST,
  ABILITY_HAMMER_STRIKE,
  ABILITY_SUMMON_WOLF,
} from './specialAbilities';

/** Заклинание Огненный Шар (AoE) */
export const SPELL_FIREBALL: AbilityDef = {
  id: 'spell_fireball',
  nameRu: 'Огн. Шар',
  damageType: 'magic',
  castTime: 2,
  cooldown: 5,
  manaCost: 15,
  range: 260,
  baseDamage: 18,
  isAoe: true,
  aoeRadius: 80,
  description: 'Огненный взрыв. Каст 2с. Урон: 18 × (1 + Интеллект/100) по всем в радиусе 80',
};

/** Заклинание Искра */
export const SPELL_SPARK: AbilityDef = {
  id: 'spell_spark',
  nameRu: 'Искра',
  damageType: 'magic',
  cooldown: 1.8,
  manaCost: 5,
  range: 150,
  baseDamage: 14,  // базовый урон заклинания (выше посоха, это спец. способность)
  description: 'Магический разряд. Урон: 14 × (1 + Интеллект/100)',
};

export const CREATURE_DB: Record<string, BodyDefinition> = {
  goblin: {
    ...GOBLIN,
    damageType: 'melee',
    npcStats: {
      [StatName.Strength]: 4, [StatName.Accuracy]: 5, [StatName.Evasion]: 6,
      [StatName.Health]: 6,   [StatName.Armor]: 1,    [StatName.Luck]: 3,
    },
    signatureSpell: ABILITY_STING,          spellXPThreshold: 50,
    npcSpells: [ABILITY_STING],
  },

  rabbit: {
    id: 'rabbit', name: 'Rabbit', nameRu: 'Кролик',
    type: BodyType.Passive, damageType: 'melee',
    caps: { [StatName.Evasion]: 10, [StatName.Agility]: 8 },
    xpReward: 10,
    npcStats: {
      [StatName.Strength]: 1, [StatName.Accuracy]: 2, [StatName.Evasion]: 0,
      [StatName.Health]: 4,   [StatName.Armor]: 1,    [StatName.Luck]: 2,
    },
    weapon: WeaponType.Dagger, color: 0xccaa77, abilityName: 'Рывок',
    signatureSpell: ABILITY_DASH,           spellXPThreshold: 50,
  },

  wolf: {
    id: 'wolf', name: 'Wolf', nameRu: 'Волк',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Agility]: 20, [StatName.Strength]: 12, [StatName.Health]: 8 },
    xpReward: 40,
    npcStats: {
      [StatName.Strength]: 8, [StatName.Accuracy]: 7, [StatName.Evasion]: 8,
      [StatName.Health]: 8,   [StatName.Armor]: 2,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.Sword, color: 0x888888, abilityName: 'Удар мечом',
    signatureSpell: ABILITY_SWORD_STRIKE,   spellXPThreshold: 50,
  },

  bear: {
    id: 'bear', name: 'Bear', nameRu: 'Медведь',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 35, [StatName.Health]: 24, [StatName.Armor]: 16 },
    xpReward: 80,
    npcStats: {
      [StatName.Strength]: 18, [StatName.Accuracy]: 6, [StatName.Evasion]: 3,
      [StatName.Health]: 24,   [StatName.Armor]: 10,   [StatName.Luck]: 2,
    },
    weapon: WeaponType.Mace, color: 0x664422, abilityName: 'Дробящий удар',
    signatureSpell: ABILITY_MACE_STRIKE,    spellXPThreshold: 50,
  },

  orc: {
    id: 'orc', name: 'Orc', nameRu: 'Орк',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 40, [StatName.Health]: 20, [StatName.Armor]: 12 },
    xpReward: 70,
    npcStats: {
      [StatName.Strength]: 15, [StatName.Accuracy]: 8, [StatName.Evasion]: 4,
      [StatName.Health]: 20,   [StatName.Armor]: 8,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.Greatsword, color: 0x446633, abilityName: 'Рубящий удар',
    signatureSpell: ABILITY_SLASH,          spellXPThreshold: 50,
  },

  forest_spirit: {
    id: 'forest_spirit', name: 'Forest Spirit', nameRu: 'Лесной дух',
    type: BodyType.Passive, damageType: 'magic',
    caps: { [StatName.Mana]: 12, [StatName.Intellect]: 8 },
    xpReward: 15,
    signatureSpell: SPELL_SPARK,            spellXPThreshold: 50,
    npcStats: {
      [StatName.Intellect]: 4, [StatName.Accuracy]: 3, [StatName.Evasion]: 2,
      [StatName.Health]: 3,    [StatName.Mana]: 10,    [StatName.Luck]: 1,
    },
    weapon: WeaponType.Staff, color: 0x88eecc, abilityName: 'Искра',
    npcSpells: [SPELL_SPARK],
  },

  scout: {
    id: 'scout', name: 'Scout', nameRu: 'Разведчик',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Agility]: 25, [StatName.Accuracy]: 20, [StatName.Evasion]: 12 },
    xpReward: 35,
    npcStats: {
      [StatName.Agility]: 8, [StatName.Accuracy]: 10, [StatName.Evasion]: 6,
      [StatName.Health]: 7,  [StatName.Armor]: 2,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.ShortBow, color: 0x88aa55, abilityName: 'Прицельный выстрел',
    signatureSpell: ABILITY_BOW_SHOT,       spellXPThreshold: 50,
  },

  shaman: {
    id: 'shaman', name: 'Shaman', nameRu: 'Шаман',
    type: BodyType.Combat, damageType: 'magic',
    caps: { [StatName.Intellect]: 25, [StatName.Mana]: 20, [StatName.Will]: 10 },
    xpReward: 60,
    npcStats: {
      [StatName.Intellect]: 12, [StatName.Accuracy]: 7, [StatName.Evasion]: 4,
      [StatName.Health]: 12,    [StatName.Will]: 8,     [StatName.Mana]: 15, [StatName.Luck]: 2,
    },
    weapon: WeaponType.Staff, color: 0x9944aa, abilityName: 'Призыв волка',
    signatureSpell: ABILITY_SUMMON_WOLF,    spellXPThreshold: 50,
  },

  // ─── Глава 1: Элементали Огня ───────────────────────────────────────────────

  spark: {
    id: 'spark', name: 'Spark', nameRu: 'Искра',
    type: BodyType.Combat, damageType: 'magic', element: 'fire',
    caps: { [StatName.Intellect]: 8, [StatName.Agility]: 12 },
    xpReward: 12,
    npcStats: {
      [StatName.Intellect]: 3, [StatName.Accuracy]: 5, [StatName.Evasion]: 8,
      [StatName.Health]: 3,    [StatName.Mana]: 5,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.Staff, color: 0xff6600, abilityName: 'Искра',
    npcSpells: [MOB_FIRE_T1],
    signatureSpell: MOB_FIRE_T1, spellXPThreshold: 50,
  },

  asher: {
    id: 'asher', name: 'Asher', nameRu: 'Пепельник',
    type: BodyType.Combat, damageType: 'magic', element: 'fire',
    caps: { [StatName.Intellect]: 14, [StatName.Health]: 10, [StatName.Armor]: 4 },
    xpReward: 28,
    npcStats: {
      [StatName.Intellect]: 7, [StatName.Accuracy]: 6, [StatName.Evasion]: 3,
      [StatName.Health]: 10,   [StatName.Armor]: 3,    [StatName.Luck]: 2,
    },
    weapon: WeaponType.Staff, color: 0xaa4400, abilityName: 'Огненная стрела',
    npcSpells: [MOB_FIRE_T1, MOB_FIRE_T2],
    signatureSpell: MOB_FIRE_T2, spellXPThreshold: 100,
  },

  // ─── Глава 1: Элементали Воды ───────────────────────────────────────────────

  splasher: {
    id: 'splasher', name: 'Splasher', nameRu: 'Брызгун',
    type: BodyType.Combat, damageType: 'magic', element: 'water',
    caps: { [StatName.Intellect]: 10, [StatName.Agility]: 10, [StatName.Evasion]: 8 },
    xpReward: 20,
    npcStats: {
      [StatName.Intellect]: 5, [StatName.Accuracy]: 6, [StatName.Evasion]: 5,
      [StatName.Health]: 6,    [StatName.Mana]: 6,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.Staff, color: 0x44aaff, abilityName: 'Ледышка',
    npcSpells: [MOB_WATER_T1],
    signatureSpell: MOB_WATER_T1, spellXPThreshold: 50,
  },

  fogger: {
    id: 'fogger', name: 'Fogger', nameRu: 'Туманник',
    type: BodyType.Combat, damageType: 'magic', element: 'water',
    caps: { [StatName.Intellect]: 12, [StatName.Will]: 8, [StatName.Mana]: 12 },
    xpReward: 25,
    npcStats: {
      [StatName.Intellect]: 6, [StatName.Accuracy]: 5, [StatName.Evasion]: 4,
      [StatName.Health]: 8,    [StatName.Will]: 5,     [StatName.Mana]: 10, [StatName.Luck]: 1,
    },
    weapon: WeaponType.Staff, color: 0x88ccee, abilityName: 'Лед. стрела',
    npcSpells: [MOB_WATER_T1, MOB_WATER_T2],
    signatureSpell: MOB_WATER_T2, spellXPThreshold: 100,
  },

  // ─── Глава 1: Элементали Земли ──────────────────────────────────────────────

  pebble: {
    id: 'pebble', name: 'Pebble', nameRu: 'Каменыш',
    type: BodyType.Combat, damageType: 'magic', element: 'earth',
    caps: { [StatName.Health]: 20, [StatName.Armor]: 14, [StatName.Strength]: 10 },
    xpReward: 35,
    npcStats: {
      [StatName.Intellect]: 5, [StatName.Accuracy]: 5, [StatName.Evasion]: 1,
      [StatName.Health]: 20,   [StatName.Armor]: 8,    [StatName.Luck]: 1,
    },
    weapon: WeaponType.Mace, color: 0x887755, abilityName: 'Камешек',
    npcSpells: [MOB_EARTH_T1],
    signatureSpell: MOB_EARTH_T1, spellXPThreshold: 50,
  },

  mudder: {
    id: 'mudder', name: 'Mudder', nameRu: 'Грязевик',
    type: BodyType.Combat, damageType: 'magic', element: 'earth',
    caps: { [StatName.Health]: 16, [StatName.Armor]: 8, [StatName.Intellect]: 10 },
    xpReward: 30,
    npcStats: {
      [StatName.Intellect]: 6, [StatName.Accuracy]: 4, [StatName.Evasion]: 2,
      [StatName.Health]: 14,   [StatName.Armor]: 5,    [StatName.Luck]: 1,
    },
    weapon: WeaponType.Staff, color: 0x665533, abilityName: 'Зем. удар',
    npcSpells: [MOB_EARTH_T1, MOB_EARTH_T2],
    signatureSpell: MOB_EARTH_T2, spellXPThreshold: 100,
  },

  // ─── Глава 1: Элементали Ветра ──────────────────────────────────────────────

  gusty: {
    id: 'gusty', name: 'Gusty', nameRu: 'Вихрик',
    type: BodyType.Combat, damageType: 'magic', element: 'wind',
    caps: { [StatName.Agility]: 20, [StatName.Evasion]: 14, [StatName.Accuracy]: 10 },
    xpReward: 15,
    npcStats: {
      [StatName.Intellect]: 3, [StatName.Accuracy]: 7, [StatName.Evasion]: 10,
      [StatName.Health]: 4,    [StatName.Agility]: 12, [StatName.Luck]: 3,
    },
    weapon: WeaponType.Dagger, color: 0xcceeaa, abilityName: 'Порыв',
    npcSpells: [MOB_WIND_T1],
    signatureSpell: MOB_WIND_T1, spellXPThreshold: 50,
  },

  whistler: {
    id: 'whistler', name: 'Whistler', nameRu: 'Свистун',
    type: BodyType.Combat, damageType: 'magic', element: 'wind',
    caps: { [StatName.Agility]: 14, [StatName.Accuracy]: 16, [StatName.Intellect]: 12 },
    xpReward: 22,
    npcStats: {
      [StatName.Intellect]: 6, [StatName.Accuracy]: 9, [StatName.Evasion]: 7,
      [StatName.Health]: 7,    [StatName.Agility]: 8,  [StatName.Luck]: 3,
    },
    weapon: WeaponType.ShortBow, color: 0x99ddcc, abilityName: 'Ветрорез',
    npcSpells: [MOB_WIND_T1, MOB_WIND_T2],
    signatureSpell: MOB_WIND_T2, spellXPThreshold: 100,
  },

  // ─── Лагерь разбойников ────────────────────────────────────────────────────

  bandit_archer: {
    id: 'bandit_archer', name: 'Bandit Archer', nameRu: 'Разбойник-лучник',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Accuracy]: 24, [StatName.Agility]: 22, [StatName.Evasion]: 14 },
    xpReward: 45,
    npcStats: {
      [StatName.Agility]: 10,  [StatName.Accuracy]: 12, [StatName.Evasion]: 7,
      [StatName.Health]: 9,    [StatName.Armor]: 2,     [StatName.Luck]: 4,
    },
    weapon: WeaponType.LongBow, color: 0x556633, abilityName: 'Дальний выстрел',
    signatureSpell: ABILITY_LONGBOW_SHOT,   spellXPThreshold: 50,
  },

  bandit_crossbow: {
    id: 'bandit_crossbow', name: 'Bandit Crossbowman', nameRu: 'Арбалетчик',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Accuracy]: 26, [StatName.Strength]: 16, [StatName.Health]: 16 },
    xpReward: 50,
    npcStats: {
      [StatName.Strength]: 8,  [StatName.Accuracy]: 15, [StatName.Evasion]: 3,
      [StatName.Health]: 11,   [StatName.Armor]: 4,     [StatName.Luck]: 3,
    },
    weapon: WeaponType.Crossbow, color: 0x664433, abilityName: 'Пробивающий болт',
    signatureSpell: ABILITY_CROSSBOW_BOLT,  spellXPThreshold: 50,
  },

  bandit_spear: {
    id: 'bandit_spear', name: 'Bandit Spearman', nameRu: 'Копейщик',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 20, [StatName.Accuracy]: 18, [StatName.Health]: 18 },
    xpReward: 48,
    npcStats: {
      [StatName.Strength]: 11, [StatName.Accuracy]: 9,  [StatName.Evasion]: 6,
      [StatName.Health]: 12,   [StatName.Armor]: 5,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.Spear, color: 0x445566, abilityName: 'Выпад',
    signatureSpell: ABILITY_SPEAR_THRUST,   spellXPThreshold: 50,
  },

  bandit_brute: {
    id: 'bandit_brute', name: 'Bandit Brute', nameRu: 'Громила',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 28, [StatName.Health]: 26, [StatName.Armor]: 18 },
    xpReward: 65,
    npcStats: {
      [StatName.Strength]: 15, [StatName.Accuracy]: 6,  [StatName.Evasion]: 2,
      [StatName.Health]: 18,   [StatName.Armor]: 8,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.Hammer, color: 0x664444, abilityName: 'Сокрушительный удар',
    signatureSpell: ABILITY_HAMMER_STRIKE,  spellXPThreshold: 50,
  },
};

export function getCreature(id: string): BodyDefinition | undefined {
  return CREATURE_DB[id];
}

export function getAllCreatures(): BodyDefinition[] {
  return Object.values(CREATURE_DB);
}
