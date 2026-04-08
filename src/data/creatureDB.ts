import { BodyDefinition, BodyType, WeaponType, GOBLIN } from '../types/bodies';
import { StatName } from '../types/stats';
import {
  MOB_FIRE_T1, MOB_FIRE_T2, MOB_FIRE_T3, ENCHANT_FIRE,
  MOB_WATER_T1, MOB_WATER_T2, MOB_WATER_T3, ENCHANT_WATER,
  MOB_EARTH_T1, MOB_EARTH_T2, MOB_EARTH_T3, ENCHANT_EARTH,
  MOB_WIND_T1, MOB_WIND_T2, MOB_WIND_T3, ENCHANT_WIND,
  MOB_NATURE_T1, MOB_NATURE_T2,
} from './elementalSpells';
import { MOB_NEUTRAL_T1, MOB_NEUTRAL_T2 } from './neutralSpells';
import {
  ABILITY_STING,
  ABILITY_KNIFE_THROW,
  ABILITY_SWORD_STRIKE,
  ABILITY_DOUBLE_STRIKE,
  ABILITY_MACE_STRIKE,
  ABILITY_MACE_BASH,
  ABILITY_SLASH,
  ABILITY_SLASH_SWEEP,
  ABILITY_BOW_SHOT,
  ABILITY_BOW_BACKSHOT,
  ABILITY_LONGBOW_SHOT,
  ABILITY_ARROW_RAIN,
  ABILITY_CROSSBOW_BOLT,
  ABILITY_CROSSBOW_SNARE,
  ABILITY_SPEAR_THRUST,
  ABILITY_SPEAR_BUTT,
  ABILITY_HAMMER_STRIKE,
  ABILITY_HAMMER_SMASH,
} from './specialAbilities';


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
    weapon: WeaponType.Dagger, color: 0xccaa77, abilityName: 'Ускорение',
    signatureSpell: MOB_NEUTRAL_T1,         spellXPThreshold: 50,
  },

  spirit: {
    id: 'spirit', name: 'Spirit', nameRu: 'Спирит',
    type: BodyType.Passive, damageType: 'melee',
    caps: { [StatName.Agility]: 40, [StatName.Evasion]: 30, [StatName.Luck]: 20 },
    xpReward: 60,
    npcStats: {
      [StatName.Agility]: 20, [StatName.Accuracy]: 5, [StatName.Evasion]: 18,
      [StatName.Health]: 6,   [StatName.Armor]: 1,    [StatName.Luck]: 8,
    },
    weapon: WeaponType.Dagger, color: 0xeeeeff, abilityName: 'Рывок',
    npcSpells: [MOB_NEUTRAL_T1, MOB_NEUTRAL_T2],
    signatureSpell: MOB_NEUTRAL_T2,         spellXPThreshold: 100,
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
    npcSpells: [ABILITY_SWORD_STRIKE],
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
    npcSpells: [ABILITY_MACE_STRIKE],
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
    npcSpells: [ABILITY_SLASH],
    signatureSpell: ABILITY_SLASH,          spellXPThreshold: 50,
  },

  // ─── Глава 1: Школа природы ─────────────────────────────────────────────────

  shaman: {
    id: 'shaman', name: 'Shaman', nameRu: 'Шаман',
    type: BodyType.Combat, damageType: 'magic',
    caps: { [StatName.Intellect]: 25, [StatName.Mana]: 20, [StatName.Will]: 10 },
    xpReward: 60,
    npcStats: {
      [StatName.Intellect]: 12, [StatName.Accuracy]: 7, [StatName.Evasion]: 4,
      [StatName.Health]: 12,    [StatName.Will]: 8,     [StatName.Mana]: 15, [StatName.Luck]: 2,
    },
    weapon: WeaponType.StaffNature, color: 0x9944aa, abilityName: 'Призыв волка',
    npcSpells: [MOB_NATURE_T1],
    signatureSpell: MOB_NATURE_T1,           spellXPThreshold: 50,
  },

  spirit_wolf: {
    id: 'spirit_wolf', name: 'Spirit Wolf', nameRu: 'Волк-дух',
    type: BodyType.Combat, damageType: 'magic', element: 'nature' as any,
    caps: { [StatName.Intellect]: 20, [StatName.Health]: 16, [StatName.Mana]: 14 },
    xpReward: 75,
    npcStats: {
      [StatName.Intellect]: 10, [StatName.Accuracy]: 8, [StatName.Evasion]: 6,
      [StatName.Health]: 14,    [StatName.Will]: 6,     [StatName.Mana]: 12, [StatName.Luck]: 2,
    },
    weapon: WeaponType.StaffNature, color: 0x88cc88, abilityName: 'Древесная кора',
    npcSpells: [MOB_NATURE_T1, MOB_NATURE_T2],
    signatureSpell: MOB_NATURE_T2,           spellXPThreshold: 100,
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
    npcSpells: [ABILITY_BOW_SHOT],
    signatureSpell: ABILITY_BOW_SHOT,       spellXPThreshold: 50,
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
    weapon: WeaponType.StaffFire, color: 0xff6600, abilityName: 'Искра',
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
    weapon: WeaponType.StaffFire, color: 0xaa4400, abilityName: 'Огненная стрела',
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
    weapon: WeaponType.StaffWater, color: 0x44aaff, abilityName: 'Ледышка',
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
    weapon: WeaponType.StaffWater, color: 0x88ccee, abilityName: 'Лед. стрела',
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
    weapon: WeaponType.StaffEarth, color: 0x665533, abilityName: 'Зем. удар',
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

  // ─── Ветераны (учат T2 умениям оружия) ────────────────────────────────────

  goblin_veteran: {
    ...GOBLIN,
    id: 'goblin_veteran', name: 'Goblin Veteran', nameRu: 'Гоблин-ветеран',
    damageType: 'melee',
    caps: { [StatName.Agility]: 18, [StatName.Evasion]: 14, [StatName.Accuracy]: 12 },
    xpReward: 90,
    npcStats: {
      [StatName.Strength]: 7,  [StatName.Accuracy]: 9,  [StatName.Evasion]: 10,
      [StatName.Health]: 11,   [StatName.Armor]: 3,     [StatName.Luck]: 5,
    },
    weapon: WeaponType.Dagger, color: 0xaa5500, abilityName: 'Бросок кинжала',
    npcSpells: [ABILITY_STING, ABILITY_KNIFE_THROW],
    signatureSpell: ABILITY_KNIFE_THROW,   spellXPThreshold: 100,
  },

  wolf_veteran: {
    id: 'wolf_veteran', name: 'Wolf Alpha', nameRu: 'Волк-вожак',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Agility]: 28, [StatName.Strength]: 18, [StatName.Health]: 14 },
    xpReward: 110,
    npcStats: {
      [StatName.Strength]: 13, [StatName.Accuracy]: 11, [StatName.Evasion]: 12,
      [StatName.Health]: 14,   [StatName.Armor]: 4,     [StatName.Luck]: 4,
    },
    weapon: WeaponType.Sword, color: 0x555555, abilityName: 'Двойной удар',
    npcSpells: [ABILITY_SWORD_STRIKE, ABILITY_DOUBLE_STRIKE],
    signatureSpell: ABILITY_DOUBLE_STRIKE, spellXPThreshold: 100,
  },

  bear_veteran: {
    id: 'bear_veteran', name: 'Elder Bear', nameRu: 'Медведь-старейшина',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 50, [StatName.Health]: 36, [StatName.Armor]: 24 },
    xpReward: 150,
    npcStats: {
      [StatName.Strength]: 26, [StatName.Accuracy]: 8,  [StatName.Evasion]: 2,
      [StatName.Health]: 36,   [StatName.Armor]: 16,    [StatName.Luck]: 1,
    },
    weapon: WeaponType.Mace, color: 0x442200, abilityName: 'Удар плашмя',
    npcSpells: [ABILITY_MACE_STRIKE, ABILITY_MACE_BASH],
    signatureSpell: ABILITY_MACE_BASH,     spellXPThreshold: 100,
  },

  orc_veteran: {
    id: 'orc_veteran', name: 'Orc Warchief', nameRu: 'Орк-военачальник',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 55, [StatName.Health]: 30, [StatName.Armor]: 18 },
    xpReward: 140,
    npcStats: {
      [StatName.Strength]: 22, [StatName.Accuracy]: 11, [StatName.Evasion]: 5,
      [StatName.Health]: 28,   [StatName.Armor]: 12,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.Greatsword, color: 0x224411, abilityName: 'Размах',
    npcSpells: [ABILITY_SLASH, ABILITY_SLASH_SWEEP],
    signatureSpell: ABILITY_SLASH_SWEEP,   spellXPThreshold: 100,
  },

  scout_veteran: {
    id: 'scout_veteran', name: 'Scout Captain', nameRu: 'Капитан разведчиков',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Agility]: 36, [StatName.Accuracy]: 28, [StatName.Evasion]: 18 },
    xpReward: 100,
    npcStats: {
      [StatName.Agility]: 14, [StatName.Accuracy]: 16, [StatName.Evasion]: 10,
      [StatName.Health]: 12,  [StatName.Armor]: 3,     [StatName.Luck]: 5,
    },
    weapon: WeaponType.ShortBow, color: 0x557722, abilityName: 'Выстрел с отскоком',
    npcSpells: [ABILITY_BOW_SHOT, ABILITY_BOW_BACKSHOT],
    signatureSpell: ABILITY_BOW_BACKSHOT,  spellXPThreshold: 100,
  },

  bandit_archer_veteran: {
    id: 'bandit_archer_veteran', name: 'Bandit Sniper', nameRu: 'Разбойник-снайпер',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Accuracy]: 36, [StatName.Agility]: 30, [StatName.Evasion]: 20 },
    xpReward: 115,
    npcStats: {
      [StatName.Agility]: 15, [StatName.Accuracy]: 18, [StatName.Evasion]: 10,
      [StatName.Health]: 13,  [StatName.Armor]: 3,     [StatName.Luck]: 5,
    },
    weapon: WeaponType.LongBow, color: 0x334422, abilityName: 'Дождь стрел',
    npcSpells: [ABILITY_LONGBOW_SHOT, ABILITY_ARROW_RAIN],
    signatureSpell: ABILITY_ARROW_RAIN,    spellXPThreshold: 100,
  },

  bandit_crossbow_veteran: {
    id: 'bandit_crossbow_veteran', name: 'Bandit Marksman', nameRu: 'Арбалетчик-мастер',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Accuracy]: 38, [StatName.Strength]: 24, [StatName.Health]: 24 },
    xpReward: 120,
    npcStats: {
      [StatName.Strength]: 13, [StatName.Accuracy]: 22, [StatName.Evasion]: 4,
      [StatName.Health]: 18,   [StatName.Armor]: 7,     [StatName.Luck]: 3,
    },
    weapon: WeaponType.Crossbow, color: 0x442211, abilityName: 'Удерживающий болт',
    npcSpells: [ABILITY_CROSSBOW_BOLT, ABILITY_CROSSBOW_SNARE],
    signatureSpell: ABILITY_CROSSBOW_SNARE, spellXPThreshold: 100,
  },

  bandit_spear_veteran: {
    id: 'bandit_spear_veteran', name: 'Bandit Lancer', nameRu: 'Копейщик-ветеран',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 30, [StatName.Accuracy]: 26, [StatName.Health]: 26 },
    xpReward: 118,
    npcStats: {
      [StatName.Strength]: 17, [StatName.Accuracy]: 14, [StatName.Evasion]: 8,
      [StatName.Health]: 20,   [StatName.Armor]: 8,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.Spear, color: 0x223344, abilityName: 'Удар древком',
    npcSpells: [ABILITY_SPEAR_THRUST, ABILITY_SPEAR_BUTT],
    signatureSpell: ABILITY_SPEAR_BUTT,    spellXPThreshold: 100,
  },

  bandit_brute_veteran: {
    id: 'bandit_brute_veteran', name: 'Bandit Berserker', nameRu: 'Громила-берсерк',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 40, [StatName.Health]: 38, [StatName.Armor]: 26 },
    xpReward: 145,
    npcStats: {
      [StatName.Strength]: 22, [StatName.Accuracy]: 8,  [StatName.Evasion]: 3,
      [StatName.Health]: 28,   [StatName.Armor]: 12,    [StatName.Luck]: 2,
    },
    weapon: WeaponType.Hammer, color: 0x441111, abilityName: 'Сильный удар',
    npcSpells: [ABILITY_HAMMER_STRIKE, ABILITY_HAMMER_SMASH],
    signatureSpell: ABILITY_HAMMER_SMASH,  spellXPThreshold: 100,
  },

  // ─── Боссы Главы 1: Стражи стихий ──────────────────────────────────────────

  ignis: {
    id: 'ignis', name: 'Ignis', nameRu: 'Игнис — Страж Огня',
    type: BodyType.Combat, damageType: 'magic', element: 'fire',
    caps: { [StatName.Intellect]: 50, [StatName.Mana]: 40, [StatName.Health]: 30 },
    xpReward: 200,
    npcStats: {
      [StatName.Intellect]: 35, [StatName.Accuracy]: 10, [StatName.Evasion]: 5,
      [StatName.Health]: 30,    [StatName.Armor]: 8,     [StatName.Will]: 15,
      [StatName.Mana]: 40,      [StatName.Luck]: 5,
    },
    weapon: WeaponType.StaffFire, color: 0xff3300, abilityName: 'Зачарование: Огонь',
    npcSpells: [MOB_FIRE_T1, MOB_FIRE_T2, MOB_FIRE_T3],
    signatureSpell: ENCHANT_FIRE,            spellXPThreshold: 150,
  },

  aquaris: {
    id: 'aquaris', name: 'Aquaris', nameRu: 'Акварис — Страж Воды',
    type: BodyType.Combat, damageType: 'magic', element: 'water',
    caps: { [StatName.Intellect]: 50, [StatName.Mana]: 40, [StatName.Health]: 30 },
    xpReward: 200,
    npcStats: {
      [StatName.Intellect]: 35, [StatName.Accuracy]: 10, [StatName.Evasion]: 8,
      [StatName.Health]: 28,    [StatName.Armor]: 6,     [StatName.Will]: 18,
      [StatName.Mana]: 40,      [StatName.Luck]: 5,
    },
    weapon: WeaponType.StaffWater, color: 0x0066ff, abilityName: 'Зачарование: Вода',
    npcSpells: [MOB_WATER_T1, MOB_WATER_T2, MOB_WATER_T3],
    signatureSpell: ENCHANT_WATER,           spellXPThreshold: 150,
  },

  terra: {
    id: 'terra', name: 'Terra', nameRu: 'Терра — Страж Земли',
    type: BodyType.Combat, damageType: 'magic', element: 'earth',
    caps: { [StatName.Intellect]: 50, [StatName.Mana]: 40, [StatName.Health]: 30 },
    xpReward: 200,
    npcStats: {
      [StatName.Intellect]: 30, [StatName.Accuracy]: 10, [StatName.Evasion]: 3,
      [StatName.Health]: 35,    [StatName.Armor]: 15,    [StatName.Will]: 12,
      [StatName.Mana]: 40,      [StatName.Luck]: 5,
    },
    weapon: WeaponType.StaffEarth, color: 0x886622, abilityName: 'Зачарование: Земля',
    npcSpells: [MOB_EARTH_T1, MOB_EARTH_T2, MOB_EARTH_T3],
    signatureSpell: ENCHANT_EARTH,           spellXPThreshold: 150,
  },

  aeros: {
    id: 'aeros', name: 'Aeros', nameRu: 'Аэрос — Страж Ветра',
    type: BodyType.Combat, damageType: 'magic', element: 'wind',
    caps: { [StatName.Intellect]: 50, [StatName.Mana]: 40, [StatName.Health]: 30 },
    xpReward: 200,
    npcStats: {
      [StatName.Intellect]: 32, [StatName.Accuracy]: 10, [StatName.Evasion]: 12,
      [StatName.Health]: 25,    [StatName.Armor]: 5,     [StatName.Will]: 14,
      [StatName.Mana]: 40,      [StatName.Luck]: 8,
    },
    weapon: WeaponType.StaffWind, color: 0xccddff, abilityName: 'Зачарование: Ветер',
    npcSpells: [MOB_WIND_T1, MOB_WIND_T2, MOB_WIND_T3],
    signatureSpell: ENCHANT_WIND,            spellXPThreshold: 150,
  },
};

export function getCreature(id: string): BodyDefinition | undefined {
  return CREATURE_DB[id];
}

export function getAllCreatures(): BodyDefinition[] {
  return Object.values(CREATURE_DB);
}
