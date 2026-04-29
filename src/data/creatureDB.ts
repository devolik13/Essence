import { BodyDefinition, BodyType, WeaponType, GOBLIN } from '../types/bodies';
import { StatName } from '../types/stats';
import { MOB_FIRE_T1, MOB_FIRE_T2, MOB_FIRE_T3, MOB_FIRE_T4 } from './spells/fire';
import { MOB_WATER_T1, MOB_WATER_T2, MOB_WATER_T3 } from './spells/water';
import { MOB_EARTH_T1, MOB_EARTH_T2, MOB_EARTH_T3 } from './spells/earth';
import { MOB_WIND_T1, MOB_WIND_T2, MOB_WIND_T3 } from './spells/wind';
import { MOB_NATURE_T1, MOB_NATURE_T2, MOB_NATURE_T3 } from './spells/nature';
import { MOB_NEUTRAL_T1, MOB_NEUTRAL_T2, MOB_NEUTRAL_HEAL } from './neutralSpells';
import { ABILITY_RAM } from './specialAbilities';
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
  ABILITY_FIST_STRIKE,
} from './specialAbilities';


export const CREATURE_DB: Record<string, BodyDefinition> = {
  goblin: {
    ...GOBLIN,
    damageType: 'melee',
    npcStats: {
      [StatName.Strength]: 4, [StatName.Accuracy]: 5, [StatName.Evasion]: 6,
      [StatName.Health]: 6,   [StatName.Armor]: 1,    [StatName.Luck]: 3,
    },
    signatureSpell: ABILITY_STING,
    npcSpells: [ABILITY_STING],
  },

  hare: {
    id: 'hare', name: 'Hare', nameRu: 'Hare',
    type: BodyType.Passive, damageType: 'melee',
    caps: { [StatName.Evasion]: 10, [StatName.Agility]: 8 },
    xpReward: 8,
    npcStats: {
      [StatName.Strength]: 1, [StatName.Accuracy]: 1, [StatName.Evasion]: 1,
      [StatName.Health]: 1, [StatName.Armor]: 1, [StatName.Luck]: 1,
    },
    weapon: WeaponType.Dagger, color: 0xbb9966, abilityName: 'Acceleration',
    signatureSpell: MOB_NEUTRAL_T1,
  },

  deer: {
    id: 'deer', name: 'Deer', nameRu: 'Deer',
    type: BodyType.Fleeing, damageType: 'melee',
    caps: { [StatName.Agility]: 40, [StatName.Evasion]: 30, [StatName.Luck]: 20 },
    xpReward: 60,
    npcStats: {
      [StatName.Agility]: 20, [StatName.Accuracy]: 5, [StatName.Evasion]: 18,
      [StatName.Health]: 6, [StatName.Armor]: 1, [StatName.Luck]: 8,
    },
    weapon: WeaponType.Dagger, color: 0xaa7744, abilityName: 'Dash',
    npcSpells: [MOB_NEUTRAL_T1, MOB_NEUTRAL_T2],
    signatureSpell: MOB_NEUTRAL_T2,
  },

  fox: {
    id: 'fox', name: 'Fox', nameRu: 'Fox',
    type: BodyType.Passive, damageType: 'melee',
    caps: { [StatName.Agility]: 15, [StatName.Evasion]: 12 },
    xpReward: 15,
    npcStats: {
      [StatName.Strength]: 3, [StatName.Accuracy]: 4, [StatName.Evasion]: 6,
      [StatName.Health]: 4, [StatName.Armor]: 1, [StatName.Luck]: 4,
    },
    weapon: WeaponType.Fists, color: 0xdd6622, abilityName: 'Disorienting Blow',
    signatureSpell: ABILITY_FIST_STRIKE,
  },

  boar: {
    id: 'boar', name: 'Boar', nameRu: 'Boar',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 15, [StatName.Health]: 10 },
    xpReward: 30,
    npcStats: {
      [StatName.Strength]: 6, [StatName.Accuracy]: 4, [StatName.Evasion]: 3,
      [StatName.Health]: 8, [StatName.Armor]: 3, [StatName.Luck]: 2,
    },
    weapon: WeaponType.Spear, color: 0x774422, abilityName: 'Ram',
    signatureSpell: ABILITY_RAM,
    npcSpells: [ABILITY_SPEAR_THRUST],
  },

  grouse: {
    id: 'grouse', name: 'Grouse', nameRu: 'Grouse',
    type: BodyType.Passive, damageType: 'melee',
    caps: { [StatName.Evasion]: 12, [StatName.Agility]: 10 },
    xpReward: 6,
    npcStats: {
      [StatName.Strength]: 1, [StatName.Accuracy]: 1, [StatName.Evasion]: 6,
      [StatName.Health]: 2, [StatName.Armor]: 0, [StatName.Luck]: 4,
    },
    weapon: WeaponType.Dagger, color: 0x334455, abilityName: 'Heal',
    signatureSpell: MOB_NEUTRAL_HEAL,
  },

  wolf: {
    id: 'wolf', name: 'Wolf', nameRu: 'Wolf',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Agility]: 20, [StatName.Strength]: 12, [StatName.Health]: 8 },
    xpReward: 40,
    npcStats: {
      [StatName.Strength]: 8, [StatName.Accuracy]: 7, [StatName.Evasion]: 8,
      [StatName.Health]: 8,   [StatName.Armor]: 2,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.Sword, color: 0x888888, abilityName: 'Sword Strike',
    npcSpells: [ABILITY_SWORD_STRIKE],
    signatureSpell: ABILITY_SWORD_STRIKE,
  },

  bear: {
    id: 'bear', name: 'Bear', nameRu: 'Bear',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 35, [StatName.Health]: 24, [StatName.Armor]: 16 },
    xpReward: 80,
    npcStats: {
      [StatName.Strength]: 18, [StatName.Accuracy]: 6, [StatName.Evasion]: 3,
      [StatName.Health]: 24,   [StatName.Armor]: 10,   [StatName.Luck]: 2,
    },
    weapon: WeaponType.Mace, color: 0x664422, abilityName: 'Crushing Blow',
    npcSpells: [ABILITY_MACE_STRIKE],
    signatureSpell: ABILITY_MACE_STRIKE,
  },

  orc: {
    id: 'orc', name: 'Orc', nameRu: 'Orc',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 40, [StatName.Health]: 20, [StatName.Armor]: 12 },
    xpReward: 70,
    npcStats: {
      [StatName.Strength]: 15, [StatName.Accuracy]: 8, [StatName.Evasion]: 4,
      [StatName.Health]: 20,   [StatName.Armor]: 8,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.Greatsword, color: 0x446633, abilityName: 'Slash',
    npcSpells: [ABILITY_SLASH],
    signatureSpell: ABILITY_SLASH,
  },

  // ─── Глава 1: Школа природы ─────────────────────────────────────────────────

  shaman: {
    id: 'shaman', name: 'Shaman', nameRu: 'Shaman',
    type: BodyType.Combat, damageType: 'magic',
    caps: { [StatName.Intellect]: 25, [StatName.Mana]: 20, [StatName.Will]: 10 },
    xpReward: 60,
    npcStats: {
      [StatName.Intellect]: 12, [StatName.Accuracy]: 7, [StatName.Evasion]: 4,
      [StatName.Health]: 12,    [StatName.Will]: 8,     [StatName.Mana]: 15, [StatName.Luck]: 2,
    },
    weapon: WeaponType.StaffNature, color: 0x9944aa, abilityName: 'Summon Wolf',
    npcSpells: [MOB_NATURE_T1],
    signatureSpell: MOB_NATURE_T1,
  },

  wounded_human: {
    id: 'wounded_human', name: 'Wounded Human', nameRu: 'Раненый человек',
    type: BodyType.Passive, damageType: 'melee',
    caps: { [StatName.Health]: 8 },
    xpReward: 0,
    npcStats: { [StatName.Health]: 8, [StatName.Armor]: 2 },
    weapon: WeaponType.Fists, color: 0xccaa88, abilityName: '',
    canUseAllSpells: false,
  },

  spirit_wolf: {
    id: 'spirit_wolf', name: 'Spirit Wolf', nameRu: 'Spirit Wolf',
    type: BodyType.Combat, damageType: 'magic', element: 'nature' as any,
    caps: { [StatName.Intellect]: 20, [StatName.Health]: 16, [StatName.Mana]: 14 },
    xpReward: 75,
    npcStats: {
      [StatName.Intellect]: 10, [StatName.Accuracy]: 8, [StatName.Evasion]: 6,
      [StatName.Health]: 14,    [StatName.Will]: 6,     [StatName.Mana]: 12, [StatName.Luck]: 2,
    },
    weapon: WeaponType.StaffNature, color: 0x88cc88, abilityName: 'Bark Armor',
    npcSpells: [MOB_NATURE_T1, MOB_NATURE_T2],
    signatureSpell: MOB_NATURE_T2,
  },

  scout: {
    id: 'scout', name: 'Scout', nameRu: 'Scout',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Agility]: 25, [StatName.Accuracy]: 20, [StatName.Evasion]: 12 },
    xpReward: 35,
    npcStats: {
      [StatName.Agility]: 8, [StatName.Accuracy]: 10, [StatName.Evasion]: 6,
      [StatName.Health]: 7,  [StatName.Armor]: 2,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.ShortBow, color: 0x88aa55, abilityName: 'Aimed Shot',
    npcSpells: [ABILITY_BOW_SHOT],
    signatureSpell: ABILITY_BOW_SHOT,
  },


  // ─── Глава 1: Элементали Огня ───────────────────────────────────────────────

  spark: {
    id: 'spark', name: 'Spark', nameRu: 'Spark',
    type: BodyType.Combat, damageType: 'magic', element: 'fire',
    caps: { [StatName.Intellect]: 8, [StatName.Agility]: 12 },
    xpReward: 12,
    npcStats: {
      [StatName.Intellect]: 3, [StatName.Accuracy]: 5, [StatName.Evasion]: 8,
      [StatName.Health]: 3,    [StatName.Mana]: 5,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.StaffFire, color: 0xff6600, abilityName: 'Spark',
    npcSpells: [MOB_FIRE_T1],
    signatureSpell: MOB_FIRE_T1,
  },

  asher: {
    id: 'asher', name: 'Asher', nameRu: 'Asher',
    type: BodyType.Combat, damageType: 'magic', element: 'fire',
    caps: { [StatName.Intellect]: 14, [StatName.Health]: 10, [StatName.Armor]: 4 },
    xpReward: 28,
    npcStats: {
      [StatName.Intellect]: 7, [StatName.Accuracy]: 6, [StatName.Evasion]: 3,
      [StatName.Health]: 10,   [StatName.Armor]: 3,    [StatName.Luck]: 2,
    },
    weapon: WeaponType.StaffFire, color: 0xaa4400, abilityName: 'Fire Arrow',
    npcSpells: [MOB_FIRE_T1, MOB_FIRE_T2],
    signatureSpell: MOB_FIRE_T2,
  },

  // ─── Глава 1: Элементали Воды ───────────────────────────────────────────────

  splasher: {
    id: 'splasher', name: 'Splasher', nameRu: 'Splasher',
    type: BodyType.Combat, damageType: 'magic', element: 'water',
    caps: { [StatName.Intellect]: 10, [StatName.Agility]: 10, [StatName.Evasion]: 8 },
    xpReward: 20,
    npcStats: {
      [StatName.Intellect]: 5, [StatName.Accuracy]: 6, [StatName.Evasion]: 5,
      [StatName.Health]: 6,    [StatName.Mana]: 6,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.StaffWater, color: 0x44aaff, abilityName: 'Ice Shard',
    npcSpells: [MOB_WATER_T1],
    signatureSpell: MOB_WATER_T1,
  },

  fogger: {
    id: 'fogger', name: 'Fogger', nameRu: 'Fogger',
    type: BodyType.Combat, damageType: 'magic', element: 'water',
    caps: { [StatName.Intellect]: 12, [StatName.Will]: 8, [StatName.Mana]: 12 },
    xpReward: 25,
    npcStats: {
      [StatName.Intellect]: 6, [StatName.Accuracy]: 5, [StatName.Evasion]: 4,
      [StatName.Health]: 8,    [StatName.Will]: 5,     [StatName.Mana]: 10, [StatName.Luck]: 1,
    },
    weapon: WeaponType.StaffWater, color: 0x88ccee, abilityName: 'Ice Arrow',
    npcSpells: [MOB_WATER_T1, MOB_WATER_T2],
    signatureSpell: MOB_WATER_T2,
  },

  // ─── Глава 1: Элементали Земли ──────────────────────────────────────────────

  pebble: {
    id: 'pebble', name: 'Pebble', nameRu: 'Pebble',
    type: BodyType.Combat, damageType: 'magic', element: 'earth',
    caps: { [StatName.Health]: 20, [StatName.Armor]: 14, [StatName.Strength]: 10 },
    xpReward: 35,
    npcStats: {
      [StatName.Intellect]: 5, [StatName.Accuracy]: 5, [StatName.Evasion]: 1,
      [StatName.Health]: 20,   [StatName.Armor]: 8,    [StatName.Luck]: 1,
    },
    weapon: WeaponType.StaffEarth, color: 0x887755, abilityName: 'Pebble Shot',
    npcSpells: [MOB_EARTH_T1],
    signatureSpell: MOB_EARTH_T1,
  },

  mudder: {
    id: 'mudder', name: 'Mudder', nameRu: 'Mudder',
    type: BodyType.Combat, damageType: 'magic', element: 'earth',
    caps: { [StatName.Health]: 16, [StatName.Armor]: 8, [StatName.Intellect]: 10 },
    xpReward: 30,
    npcStats: {
      [StatName.Intellect]: 6, [StatName.Accuracy]: 4, [StatName.Evasion]: 2,
      [StatName.Health]: 14,   [StatName.Armor]: 5,    [StatName.Luck]: 1,
    },
    weapon: WeaponType.StaffEarth, color: 0x665533, abilityName: 'Stone Spike',
    npcSpells: [MOB_EARTH_T1, MOB_EARTH_T2],
    signatureSpell: MOB_EARTH_T2,
  },

  // ─── Глава 1: Элементали Ветра ──────────────────────────────────────────────

  gusty: {
    id: 'gusty', name: 'Gusty', nameRu: 'Gusty',
    type: BodyType.Combat, damageType: 'magic', element: 'wind',
    caps: { [StatName.Agility]: 20, [StatName.Evasion]: 14, [StatName.Accuracy]: 10 },
    xpReward: 15,
    npcStats: {
      [StatName.Intellect]: 3, [StatName.Accuracy]: 7, [StatName.Evasion]: 10,
      [StatName.Health]: 4,    [StatName.Agility]: 12, [StatName.Luck]: 3,
    },
    weapon: WeaponType.StaffWind, color: 0xcceeaa, abilityName: 'Gust',
    npcSpells: [MOB_WIND_T1],
    signatureSpell: MOB_WIND_T1,
  },

  whistler: {
    id: 'whistler', name: 'Whistler', nameRu: 'Whistler',
    type: BodyType.Combat, damageType: 'magic', element: 'wind',
    caps: { [StatName.Agility]: 14, [StatName.Accuracy]: 16, [StatName.Intellect]: 12 },
    xpReward: 22,
    npcStats: {
      [StatName.Intellect]: 6, [StatName.Accuracy]: 9, [StatName.Evasion]: 7,
      [StatName.Health]: 7,    [StatName.Agility]: 8,  [StatName.Luck]: 3,
    },
    weapon: WeaponType.StaffWind, color: 0x99ddcc, abilityName: 'Wind Blade',
    npcSpells: [MOB_WIND_T1, MOB_WIND_T2],
    signatureSpell: MOB_WIND_T2,
  },

  // ─── Лагерь разбойников ────────────────────────────────────────────────────

  bandit_archer: {
    id: 'bandit_archer', name: 'Bandit Archer', nameRu: 'Bandit Archer',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Accuracy]: 24, [StatName.Agility]: 22, [StatName.Evasion]: 14 },
    xpReward: 45,
    npcStats: {
      [StatName.Agility]: 10,  [StatName.Accuracy]: 12, [StatName.Evasion]: 7,
      [StatName.Health]: 9,    [StatName.Armor]: 2,     [StatName.Luck]: 4,
    },
    weapon: WeaponType.LongBow, color: 0x556633, abilityName: 'Backshot',
    npcSpells: [ABILITY_LONGBOW_SHOT],
    signatureSpell: ABILITY_BOW_BACKSHOT,
  },

  bandit_crossbow: {
    id: 'bandit_crossbow', name: 'Bandit Crossbowman', nameRu: 'Crossbowman',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Accuracy]: 26, [StatName.Strength]: 16, [StatName.Health]: 16 },
    xpReward: 50,
    npcStats: {
      [StatName.Strength]: 8,  [StatName.Accuracy]: 15, [StatName.Evasion]: 3,
      [StatName.Health]: 11,   [StatName.Armor]: 4,     [StatName.Luck]: 3,
    },
    weapon: WeaponType.Crossbow, color: 0x664433, abilityName: 'Snare Bolt',
    npcSpells: [ABILITY_CROSSBOW_BOLT],
    signatureSpell: ABILITY_CROSSBOW_SNARE,
  },

  bandit_spear: {
    id: 'bandit_spear', name: 'Bandit Spearman', nameRu: 'Spearman',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 20, [StatName.Accuracy]: 18, [StatName.Health]: 18 },
    xpReward: 48,
    npcStats: {
      [StatName.Strength]: 11, [StatName.Accuracy]: 9,  [StatName.Evasion]: 6,
      [StatName.Health]: 12,   [StatName.Armor]: 5,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.Spear, color: 0x445566, abilityName: 'Butt Strike',
    npcSpells: [ABILITY_SPEAR_THRUST],
    signatureSpell: ABILITY_SPEAR_BUTT,
  },

  bandit_brute: {
    id: 'bandit_brute', name: 'Bandit Brute', nameRu: 'Brute',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 28, [StatName.Health]: 26, [StatName.Armor]: 18 },
    xpReward: 65,
    npcStats: {
      [StatName.Strength]: 15, [StatName.Accuracy]: 6,  [StatName.Evasion]: 2,
      [StatName.Health]: 18,   [StatName.Armor]: 8,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.Hammer, color: 0x664444, abilityName: 'Heavy Smash',
    npcSpells: [ABILITY_HAMMER_STRIKE],
    signatureSpell: ABILITY_HAMMER_SMASH,
  },

  // ─── Ветераны (учат T2 умениям оружия) ────────────────────────────────────

  goblin_veteran: {
    ...GOBLIN,
    id: 'goblin_veteran', name: 'Goblin Veteran', nameRu: 'Goblin Veteran',
    damageType: 'melee',
    caps: { [StatName.Agility]: 18, [StatName.Evasion]: 14, [StatName.Accuracy]: 12 },
    xpReward: 90,
    npcStats: {
      [StatName.Strength]: 7,  [StatName.Accuracy]: 9,  [StatName.Evasion]: 10,
      [StatName.Health]: 11,   [StatName.Armor]: 3,     [StatName.Luck]: 5,
    },
    weapon: WeaponType.Dagger, color: 0xaa5500, abilityName: 'Knife Throw',
    npcSpells: [ABILITY_STING, ABILITY_KNIFE_THROW],
    signatureSpell: ABILITY_KNIFE_THROW,   spellXPThreshold: 100,
  },

  wolf_veteran: {
    id: 'wolf_veteran', name: 'Wolf Alpha', nameRu: 'Wolf Alpha',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Agility]: 28, [StatName.Strength]: 18, [StatName.Health]: 14 },
    xpReward: 110,
    npcStats: {
      [StatName.Strength]: 13, [StatName.Accuracy]: 11, [StatName.Evasion]: 12,
      [StatName.Health]: 14,   [StatName.Armor]: 4,     [StatName.Luck]: 4,
    },
    weapon: WeaponType.Sword, color: 0x555555, abilityName: 'Double Strike',
    npcSpells: [ABILITY_SWORD_STRIKE, ABILITY_DOUBLE_STRIKE],
    signatureSpell: ABILITY_DOUBLE_STRIKE, spellXPThreshold: 100,
  },

  bear_veteran: {
    id: 'bear_veteran', name: 'Elder Bear', nameRu: 'Elder Bear',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 50, [StatName.Health]: 36, [StatName.Armor]: 24 },
    xpReward: 150,
    npcStats: {
      [StatName.Strength]: 26, [StatName.Accuracy]: 8,  [StatName.Evasion]: 2,
      [StatName.Health]: 36,   [StatName.Armor]: 16,    [StatName.Luck]: 1,
    },
    weapon: WeaponType.Mace, color: 0x442200, abilityName: 'Sturdy Strike',
    npcSpells: [ABILITY_MACE_STRIKE, ABILITY_MACE_BASH],
    signatureSpell: ABILITY_MACE_BASH,     spellXPThreshold: 100,
  },

  orc_veteran: {
    id: 'orc_veteran', name: 'Orc Warchief', nameRu: 'Orc Warchief',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 55, [StatName.Health]: 30, [StatName.Armor]: 18 },
    xpReward: 140,
    npcStats: {
      [StatName.Strength]: 22, [StatName.Accuracy]: 11, [StatName.Evasion]: 5,
      [StatName.Health]: 28,   [StatName.Armor]: 12,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.Greatsword, color: 0x224411, abilityName: 'Sweep',
    npcSpells: [ABILITY_SLASH, ABILITY_SLASH_SWEEP],
    signatureSpell: ABILITY_SLASH_SWEEP,   spellXPThreshold: 100,
  },

  scout_veteran: {
    id: 'scout_veteran', name: 'Scout Captain', nameRu: 'Scout Captain',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Agility]: 36, [StatName.Accuracy]: 28, [StatName.Evasion]: 18 },
    xpReward: 100,
    npcStats: {
      [StatName.Agility]: 14, [StatName.Accuracy]: 16, [StatName.Evasion]: 10,
      [StatName.Health]: 12,  [StatName.Armor]: 3,     [StatName.Luck]: 5,
    },
    weapon: WeaponType.ShortBow, color: 0x557722, abilityName: 'Backshot',
    npcSpells: [ABILITY_BOW_SHOT, ABILITY_BOW_BACKSHOT],
    signatureSpell: ABILITY_BOW_BACKSHOT,  spellXPThreshold: 100,
  },

  bandit_archer_veteran: {
    id: 'bandit_archer_veteran', name: 'Bandit Sniper', nameRu: 'Bandit Sniper',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Accuracy]: 36, [StatName.Agility]: 30, [StatName.Evasion]: 20 },
    xpReward: 115,
    npcStats: {
      [StatName.Agility]: 15, [StatName.Accuracy]: 18, [StatName.Evasion]: 10,
      [StatName.Health]: 13,  [StatName.Armor]: 3,     [StatName.Luck]: 5,
    },
    weapon: WeaponType.LongBow, color: 0x334422, abilityName: 'Arrow Rain',
    npcSpells: [ABILITY_LONGBOW_SHOT, ABILITY_ARROW_RAIN],
    signatureSpell: ABILITY_ARROW_RAIN,    spellXPThreshold: 100,
  },

  bandit_crossbow_veteran: {
    id: 'bandit_crossbow_veteran', name: 'Bandit Marksman', nameRu: 'Marksman',
    type: BodyType.Combat, damageType: 'ranged',
    caps: { [StatName.Accuracy]: 38, [StatName.Strength]: 24, [StatName.Health]: 24 },
    xpReward: 120,
    npcStats: {
      [StatName.Strength]: 13, [StatName.Accuracy]: 22, [StatName.Evasion]: 4,
      [StatName.Health]: 18,   [StatName.Armor]: 7,     [StatName.Luck]: 3,
    },
    weapon: WeaponType.Crossbow, color: 0x442211, abilityName: 'Snare Bolt',
    npcSpells: [ABILITY_CROSSBOW_BOLT, ABILITY_CROSSBOW_SNARE],
    signatureSpell: ABILITY_CROSSBOW_SNARE, spellXPThreshold: 100,
  },

  bandit_spear_veteran: {
    id: 'bandit_spear_veteran', name: 'Bandit Lancer', nameRu: 'Spear Veteran',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 30, [StatName.Accuracy]: 26, [StatName.Health]: 26 },
    xpReward: 118,
    npcStats: {
      [StatName.Strength]: 17, [StatName.Accuracy]: 14, [StatName.Evasion]: 8,
      [StatName.Health]: 20,   [StatName.Armor]: 8,     [StatName.Luck]: 2,
    },
    weapon: WeaponType.Spear, color: 0x223344, abilityName: 'Butt Strike',
    npcSpells: [ABILITY_SPEAR_THRUST, ABILITY_SPEAR_BUTT],
    signatureSpell: ABILITY_SPEAR_BUTT,    spellXPThreshold: 100,
  },

  bandit_brute_veteran: {
    id: 'bandit_brute_veteran', name: 'Bandit Berserker', nameRu: 'Berserker',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 40, [StatName.Health]: 38, [StatName.Armor]: 26 },
    xpReward: 145,
    npcStats: {
      [StatName.Strength]: 22, [StatName.Accuracy]: 8,  [StatName.Evasion]: 3,
      [StatName.Health]: 28,   [StatName.Armor]: 12,    [StatName.Luck]: 2,
    },
    weapon: WeaponType.Hammer, color: 0x441111, abilityName: 'Heavy Smash',
    npcSpells: [ABILITY_HAMMER_STRIKE, ABILITY_HAMMER_SMASH],
    signatureSpell: ABILITY_HAMMER_SMASH,  spellXPThreshold: 100,
  },

  // ─── Боссы Главы 1: Стражи стихий ──────────────────────────────────────────

  ignis: {
    id: 'ignis', name: 'Ignis', nameRu: 'Ignis — Fire Guardian',
    type: BodyType.Combat, damageType: 'magic', element: 'fire',
    caps: { [StatName.Intellect]: 50, [StatName.Mana]: 40, [StatName.Health]: 30 },
    xpReward: 200,
    npcStats: {
      [StatName.Intellect]: 35, [StatName.Accuracy]: 10, [StatName.Evasion]: 5,
      [StatName.Health]: 30,    [StatName.Armor]: 8,     [StatName.Will]: 15,
      [StatName.Mana]: 40,      [StatName.Luck]: 5,
    },
    weapon: WeaponType.StaffFire, color: 0xff3300, abilityName: 'Fire Wall',
    npcSpells: [MOB_FIRE_T1, MOB_FIRE_T2, MOB_FIRE_T3],
    isBoss: true,
  },

  aquaris: {
    id: 'aquaris', name: 'Aquaris', nameRu: 'Aquaris — Water Guardian',
    type: BodyType.Combat, damageType: 'magic', element: 'water',
    caps: { [StatName.Intellect]: 50, [StatName.Mana]: 40, [StatName.Health]: 30 },
    xpReward: 200,
    npcStats: {
      [StatName.Intellect]: 35, [StatName.Accuracy]: 10, [StatName.Evasion]: 8,
      [StatName.Health]: 28,    [StatName.Armor]: 6,     [StatName.Will]: 18,
      [StatName.Mana]: 40,      [StatName.Luck]: 5,
    },
    weapon: WeaponType.StaffWater, color: 0x0066ff, abilityName: 'Ice Rain',
    npcSpells: [MOB_WATER_T1, MOB_WATER_T2, MOB_WATER_T3],
    isBoss: true,
  },

  terra: {
    id: 'terra', name: 'Terra', nameRu: 'Terra — Earth Guardian',
    type: BodyType.Combat, damageType: 'magic', element: 'earth',
    caps: { [StatName.Intellect]: 50, [StatName.Mana]: 40, [StatName.Health]: 30 },
    xpReward: 200,
    npcStats: {
      [StatName.Intellect]: 30, [StatName.Accuracy]: 10, [StatName.Evasion]: 3,
      [StatName.Health]: 35,    [StatName.Armor]: 15,    [StatName.Will]: 12,
      [StatName.Mana]: 40,      [StatName.Luck]: 5,
    },
    weapon: WeaponType.StaffEarth, color: 0x886622, abilityName: 'Earth Wall',
    npcSpells: [MOB_EARTH_T1, MOB_EARTH_T2, MOB_EARTH_T3],
    isBoss: true,
  },

  aeros: {
    id: 'aeros', name: 'Aeros', nameRu: 'Aeros — Wind Guardian',
    type: BodyType.Combat, damageType: 'magic', element: 'wind',
    caps: { [StatName.Intellect]: 50, [StatName.Mana]: 40, [StatName.Health]: 30 },
    xpReward: 200,
    npcStats: {
      [StatName.Intellect]: 32, [StatName.Accuracy]: 10, [StatName.Evasion]: 12,
      [StatName.Health]: 25,    [StatName.Armor]: 5,     [StatName.Will]: 14,
      [StatName.Mana]: 40,      [StatName.Luck]: 8,
    },
    weapon: WeaponType.StaffWind, color: 0xccddff, abilityName: 'Wind Barrier',
    npcSpells: [MOB_WIND_T1, MOB_WIND_T2, MOB_WIND_T3],
    isBoss: true,
  },

  // ─── Тестовые сферы (пассивные, 1 заклинание, порог 1 XP) ────────────────────

  // Стихийная магия T1
  // Стихийная магия T2
  // Природа
  t_nature_t2: { id: 't_nature_t2', name: 'Nature T2',     nameRu: 'Nature T2',         type: BodyType.Passive, damageType: 'magic', caps: { [StatName.Intellect]: 10 }, xpReward: 5, weapon: WeaponType.StaffNature, color: 0x338833, abilityName: 'Bark Armor',       signatureSpell: MOB_NATURE_T2, spellXPThreshold: 1 },
  t_nature_t3: { id: 't_nature_t3', name: 'Nature T3',     nameRu: 'Nature T3',         type: BodyType.Passive, damageType: 'magic', caps: { [StatName.Intellect]: 15 }, xpReward: 5, weapon: WeaponType.StaffNature, color: 0x226622, abilityName: 'Leaf Canopy',        signatureSpell: MOB_NATURE_T3, spellXPThreshold: 1 },
  // Нейтральная
  t_heal:      { id: 't_heal',      name: 'Neutral T2b',   nameRu: 'Heal',             type: BodyType.Passive, damageType: 'magic', caps: { [StatName.Intellect]: 10 }, xpReward: 5, weapon: WeaponType.StaffNature, color: 0xaaffaa, abilityName: 'Heal',              signatureSpell: MOB_NEUTRAL_HEAL, spellXPThreshold: 1 },
  // Оружейные T1
  // Оружейные T2
  t_xbow_t2:     { id: 't_xbow_t2',     name: 'Crossbow T2', nameRu: 'Crossbow T2',       type: BodyType.Passive, damageType: 'ranged', caps: { [StatName.Agility]: 10 },  xpReward: 5, weapon: WeaponType.Crossbow,   color: 0x885533, abilityName: 'Snare Bolt',    signatureSpell: ABILITY_CROSSBOW_SNARE, spellXPThreshold: 1 },
  // T3 тестовые
  t_fire_t3:   { id: 't_fire_t3',   name: 'Fire T3',    nameRu: 'Fire T3',    type: BodyType.Passive, damageType: 'magic', caps: { [StatName.Intellect]: 15 }, xpReward: 5, weapon: WeaponType.StaffFire,   color: 0xaa2200, abilityName: 'Fire Wall',     signatureSpell: MOB_FIRE_T3,    spellXPThreshold: 1 },
  t_water_t3:  { id: 't_water_t3',  name: 'Water T3',   nameRu: 'Water T3',     type: BodyType.Passive, damageType: 'magic', caps: { [StatName.Intellect]: 15 }, xpReward: 5, weapon: WeaponType.StaffWater,  color: 0x2266aa, abilityName: 'Ice Rain',     signatureSpell: MOB_WATER_T3,   spellXPThreshold: 1 },
  t_earth_t3:  { id: 't_earth_t3',  name: 'Earth T3',   nameRu: 'Earth T3',    type: BodyType.Passive, damageType: 'magic', caps: { [StatName.Intellect]: 15 }, xpReward: 5, weapon: WeaponType.StaffEarth,  color: 0x554422, abilityName: 'Earth Wall',     signatureSpell: MOB_EARTH_T3,   spellXPThreshold: 1 },
  t_wind_t3:   { id: 't_wind_t3',   name: 'Wind T3',    nameRu: 'Wind T3',    type: BodyType.Passive, damageType: 'magic', caps: { [StatName.Intellect]: 15 }, xpReward: 5, weapon: WeaponType.StaffWind,   color: 0x88bbaa, abilityName: 'Wind Barrier',    signatureSpell: MOB_WIND_T3,    spellXPThreshold: 1 },
  t_nature_t3b:{ id: 't_nature_t3b', name: 'Nature T3',  nameRu: 'Nature T3b', type: BodyType.Passive, damageType: 'magic', caps: { [StatName.Intellect]: 15 }, xpReward: 5, weapon: WeaponType.StaffNature, color: 0x115511, abilityName: 'Leaf Canopy',  signatureSpell: MOB_NATURE_T3,  spellXPThreshold: 1 },

  // ── Тренировочные манекены (1 HP, XP дамми) ──────────────────────────────
  dummy_xp: {
    id: 'dummy_xp', name: 'XP Dummy', nameRu: 'XP Dummy',
    type: BodyType.Passive, damageType: 'melee',
    caps: { [StatName.Health]: 1 },
    npcStats: { [StatName.Health]: 0, [StatName.Armor]: 0, [StatName.Evasion]: 0 },
    xpReward: 50, weapon: WeaponType.Dagger, color: 0x888888, abilityName: 'none',
  },

  // ── Тренировочные обучатели (1 HP, учат заклинания) ────────────────────────
  dummy_fire_t1: {
    id: 'dummy_fire_t1', name: 'T.Spark', nameRu: 'T.Spark',
    type: BodyType.Passive, damageType: 'magic',
    caps: { [StatName.Intellect]: 5 },
    npcStats: { [StatName.Health]: 0, [StatName.Armor]: 0, [StatName.Evasion]: 0 },
    xpReward: 5, weapon: WeaponType.StaffFire, color: 0xff6600, abilityName: 'Spark',
    signatureSpell: MOB_FIRE_T1, spellXPThreshold: 1,
  },
  dummy_arrow_rain: {
    id: 'dummy_arrow_rain', name: 'T.ArrowRain', nameRu: 'T.ArrowRain',
    type: BodyType.Passive, damageType: 'ranged',
    caps: { [StatName.Agility]: 5 },
    npcStats: { [StatName.Health]: 0, [StatName.Armor]: 0, [StatName.Evasion]: 0 },
    xpReward: 5, weapon: WeaponType.LongBow, color: 0x88aa44, abilityName: 'Arrow Rain',
    signatureSpell: ABILITY_ARROW_RAIN, spellXPThreshold: 1,
  },
  dummy_fire_arrow: {
    id: 'dummy_fire_arrow', name: 'T.FireArrow', nameRu: 'T.FireArrow',
    type: BodyType.Passive, damageType: 'magic',
    caps: { [StatName.Intellect]: 5 },
    npcStats: { [StatName.Health]: 0, [StatName.Armor]: 0, [StatName.Evasion]: 0 },
    xpReward: 5, weapon: WeaponType.StaffFire, color: 0xff4400, abilityName: 'Fire Arrow',
    signatureSpell: MOB_FIRE_T2, spellXPThreshold: 1,
  },
  dummy_fire_wall: {
    id: 'dummy_fire_wall', name: 'T.FireWall', nameRu: 'T.FireWall',
    type: BodyType.Passive, damageType: 'magic',
    caps: { [StatName.Intellect]: 5 },
    npcStats: { [StatName.Health]: 0, [StatName.Armor]: 0, [StatName.Evasion]: 0 },
    xpReward: 5, weapon: WeaponType.StaffFire, color: 0xaa2200, abilityName: 'Fire Wall',
    signatureSpell: MOB_FIRE_T3, spellXPThreshold: 1,
  },
  dummy_fireball: {
    id: 'dummy_fireball', name: 'T.Fireball', nameRu: 'T.Fireball',
    type: BodyType.Passive, damageType: 'magic',
    caps: { [StatName.Intellect]: 5 },
    npcStats: { [StatName.Health]: 1, [StatName.Armor]: 0, [StatName.Evasion]: 0 },
    xpReward: 5, weapon: WeaponType.StaffFire, color: 0xff2200, abilityName: 'Fireball',
    signatureSpell: MOB_FIRE_T4, spellXPThreshold: 1,
  },
  dummy_bark: {
    id: 'dummy_bark', name: 'T.BarkArmor', nameRu: 'T.BarkArmor',
    type: BodyType.Passive, damageType: 'magic',
    caps: { [StatName.Intellect]: 5 },
    npcStats: { [StatName.Health]: 1, [StatName.Armor]: 0, [StatName.Evasion]: 0 },
    xpReward: 5, weapon: WeaponType.StaffNature, color: 0x448833, abilityName: 'Bark Armor',
    signatureSpell: MOB_NATURE_T2, spellXPThreshold: 1,
  },
  dummy_sweep: {
    id: 'dummy_sweep', name: 'T.Sweep', nameRu: 'T.Sweep',
    type: BodyType.Passive, damageType: 'melee',
    caps: { [StatName.Strength]: 5 },
    npcStats: { [StatName.Health]: 0, [StatName.Armor]: 0, [StatName.Evasion]: 0 },
    xpReward: 5, weapon: WeaponType.Greatsword, color: 0xaa4444, abilityName: 'Sweep',
    signatureSpell: ABILITY_SLASH_SWEEP, spellXPThreshold: 1,
  },

  // ─── Caravan defenders (Trade Road) ───────────────────────────────────────
  // Used by bq_caravan_guard, bq_bandit_*_veteran (kill caravan_guard).

  caravan_guard: {
    id: 'caravan_guard', name: 'Caravan Guard', nameRu: 'Caravan Guard',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 20, [StatName.Health]: 15, [StatName.Armor]: 8 },
    xpReward: 45,
    npcStats: {
      [StatName.Strength]: 9, [StatName.Accuracy]: 8, [StatName.Evasion]: 5,
      [StatName.Health]: 14,  [StatName.Armor]: 6,    [StatName.Luck]: 3,
    },
    weapon: WeaponType.Spear, color: 0xc4a874, abilityName: 'Thrust',
    npcSpells: [ABILITY_SPEAR_THRUST],
    signatureSpell: ABILITY_SPEAR_THRUST,
    faction: 'caravan',
  },

  ambusher: {
    id: 'ambusher', name: 'Ambusher', nameRu: 'Ambusher',
    type: BodyType.Combat, damageType: 'melee',
    caps: { [StatName.Strength]: 32, [StatName.Health]: 18, [StatName.Armor]: 10 },
    xpReward: 55,
    npcStats: {
      [StatName.Strength]: 12, [StatName.Accuracy]: 7, [StatName.Evasion]: 3,
      [StatName.Health]: 16,   [StatName.Armor]: 6,    [StatName.Luck]: 4,
    },
    weapon: WeaponType.Greatsword, color: 0x6b4a2b, abilityName: 'Slash',
    npcSpells: [ABILITY_SLASH],
    signatureSpell: ABILITY_SLASH,
    faction: 'raider',
  },

  caravan_merchant: {
    id: 'caravan_merchant', name: 'Merchant', nameRu: 'Merchant',
    type: BodyType.Fleeing, damageType: 'melee',
    caps: { [StatName.Health]: 10, [StatName.Evasion]: 6 },
    xpReward: 15,
    npcStats: {
      [StatName.Strength]: 2, [StatName.Accuracy]: 3, [StatName.Evasion]: 4,
      [StatName.Health]: 10,  [StatName.Armor]: 2,    [StatName.Luck]: 2,
    },
    weapon: WeaponType.Dagger, color: 0xddbb77, abilityName: 'Acceleration',
    signatureSpell: MOB_NEUTRAL_T1,
    faction: 'caravan',
  },
};

export function getCreature(id: string): BodyDefinition | undefined {
  return CREATURE_DB[id];
}

export function getAllCreatures(): BodyDefinition[] {
  return Object.values(CREATURE_DB);
}
