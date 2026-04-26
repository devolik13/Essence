import { ItemDef, LootEntry, RecipeDef } from '../types/items';

// ─── Item definitions ─────────────────────────────────────────────────────────

export const ITEMS: Record<string, ItemDef> = {
  // ── Starter Weapons (from weapon vendor, 0 cost) ─────────────────────────
  starter_sword:       { id: 'starter_sword',       nameRu: 'Rusty Sword',       rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Strength', icon: '⚔', statBonuses: {"strength":1} },
  starter_mace:        { id: 'starter_mace',        nameRu: 'Rusty Mace',        rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Strength', icon: '🔨', statBonuses: {"strength":1} },
  starter_greatsword:  { id: 'starter_greatsword',  nameRu: 'Rusty Greatsword',  rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Strength', icon: '⚔', statBonuses: {"strength":1} },
  starter_spear:       { id: 'starter_spear',       nameRu: 'Rusty Spear',       rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Strength', icon: '🔱', statBonuses: {"strength":1} },
  starter_hammer:      { id: 'starter_hammer',       nameRu: 'Rusty Hammer',      rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Strength', icon: '🔨', statBonuses: {"strength":1} },
  starter_dagger:      { id: 'starter_dagger',       nameRu: 'Rusty Dagger',      rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Agility', icon: '🗡', statBonuses: {"agility":1} },
  starter_fists:       { id: 'starter_fists',        nameRu: 'Worn Fists',        rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Agility', icon: '👊', statBonuses: {"agility":1} },
  starter_shortbow:    { id: 'starter_shortbow',     nameRu: 'Rusty Short Bow',   rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Agility', icon: '🏹', statBonuses: {"agility":1} },
  starter_longbow:     { id: 'starter_longbow',      nameRu: 'Rusty Long Bow',    rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Agility', icon: '🏹', statBonuses: {"agility":1} },
  starter_crossbow:    { id: 'starter_crossbow',     nameRu: 'Rusty Crossbow',    rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Agility', icon: '🏹', statBonuses: {"agility":1} },
  starter_staff_fire:  { id: 'starter_staff_fire',   nameRu: 'Worn Fire Staff',   rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Intellect', icon: '🔥', statBonuses: {"intellect":1} },
  starter_staff_water: { id: 'starter_staff_water',  nameRu: 'Worn Ice Staff',    rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Intellect', icon: '❄', statBonuses: {"intellect":1} },
  starter_staff_earth: { id: 'starter_staff_earth',  nameRu: 'Worn Earth Staff',  rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Intellect', icon: '🪨', statBonuses: {"intellect":1} },
  starter_staff_wind:  { id: 'starter_staff_wind',   nameRu: 'Worn Storm Staff',  rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Intellect', icon: '🌪', statBonuses: {"intellect":1} },
  starter_staff_nature:{ id: 'starter_staff_nature', nameRu: 'Worn Nature Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 1. +1 Intellect', icon: '🌿', statBonuses: {"intellect":1} },

  // Materials
  rabbit_fur: {
    id: 'rabbit_fur', nameRu: 'Заячья шкурка', rarity: 'common', type: 'material',
    descRu: 'Мягкая шкурка кролика. Пригодится для крафта.',
    icon: '~',
  },
  goblin_tooth: {
    id: 'goblin_tooth', nameRu: 'Зуб гоблина', rarity: 'common', type: 'material',
    descRu: 'Острый зуб гоблина. Коллекционируется авантюристами.',
    icon: '◇',
  },
  wolf_pelt: {
    id: 'wolf_pelt', nameRu: 'Волчья шкура', rarity: 'uncommon', type: 'material',
    descRu: 'Густая волчья шкура. Тёплая и прочная.',
    icon: '◈',
  },
  scout_badge: {
    id: 'scout_badge', nameRu: 'Знак разведчика', rarity: 'uncommon', type: 'material',
    descRu: 'Металлический знак вражеского разведчика.',
    icon: '▲',
  },
  bear_claw: {
    id: 'bear_claw', nameRu: 'Коготь медведя', rarity: 'uncommon', type: 'material',
    descRu: 'Массивный коготь. Острее любого ножа.',
    icon: '⌖',
  },
  orc_bone: {
    id: 'orc_bone', nameRu: 'Кость орка', rarity: 'uncommon', type: 'material',
    descRu: 'Прочная кость орка. Из неё делают амулеты.',
    icon: '✦',
  },
  shaman_totem: {
    id: 'shaman_totem', nameRu: 'Тотем шамана', rarity: 'rare', type: 'material',
    descRu: 'Заряженный магической энергией тотем.',
    icon: '✺',
  },
  spirit_essence: {
    id: 'spirit_essence', nameRu: 'Эссенция духа', rarity: 'rare', type: 'material',
    descRu: 'Частица магической сущности лесного духа.',
    icon: '◉',
  },
  bandit_coin: {
    id: 'bandit_coin', nameRu: 'Монета разбойника', rarity: 'common', type: 'material',
    descRu: 'Монета со скрещёнными кинжалами — знак разбойничьей гильдии.',
    icon: '¤',
  },
  bandit_quiver: {
    id: 'bandit_quiver', nameRu: 'Колчан разбойника', rarity: 'uncommon', type: 'material',
    descRu: 'Хорошо сделанный колчан. Стрелы подобраны с умом.',
    icon: '↑',
  },
  bandit_bolt: {
    id: 'bandit_bolt', nameRu: 'Арбалетный болт', rarity: 'uncommon', type: 'material',
    descRu: 'Тяжёлый болт с бронебойным наконечником.',
    icon: '→',
  },
  // ── Gathering Tools (from vendor, free) ──────────────────────────────────
  pickaxe: {
    id: 'pickaxe', nameRu: 'Pickaxe', rarity: 'common', type: 'material',
    descRu: 'Required for mining ore.', icon: '⛏',
  },
  axe: {
    id: 'axe', nameRu: 'Axe', rarity: 'common', type: 'material',
    descRu: 'Required for chopping wood.', icon: '🪓',
  },
  skinning_knife: {
    id: 'skinning_knife', nameRu: 'Skinning Knife', rarity: 'common', type: 'material',
    descRu: 'Required for gathering trophies.', icon: '🔪',
  },

  // ── Gathering Resources T1 ───────────────────────────────────────────────
  // Mining
  copper_ore: {
    id: 'copper_ore', nameRu: 'Copper Ore', rarity: 'common', type: 'material',
    descRu: 'Soft metal, base for T1 crafting.', icon: '⛏',
  },
  // Woodcutting
  willow_branch: {
    id: 'willow_branch', nameRu: 'Willow Branch', rarity: 'common', type: 'material',
    descRu: 'Flexible wood for arrows and T1 gear.', icon: '🌿',
  },
  // Trophy
  wolf_hide: {
    id: 'wolf_hide', nameRu: 'Wolf Hide', rarity: 'common', type: 'material',
    descRu: 'Common hide for light armor.', icon: '🦴',
  },

// ── Craftable Weapons T1-T3 ──────────────────────────────────────────────
  sword_t1: { id: 'sword_t1', nameRu: 'Steel Sword', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 13. +1 Strength', icon: '⚔', statBonuses: {"strength":1} },
  sword_t2: { id: 'sword_t2', nameRu: 'Hardened Sword', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 14. +2 Strength, +1 Armor', icon: '⚔', statBonuses: {"strength":2,"armor":1} },
  sword_t3: { id: 'sword_t3', nameRu: 'Master Sword', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 15. +3 Strength, +2 Armor', icon: '⚔', statBonuses: {"strength":3,"armor":2} },
  mace_t1: { id: 'mace_t1', nameRu: 'Steel Mace', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 15. +1 Strength', icon: '🔨', statBonuses: {"strength":1} },
  mace_t2: { id: 'mace_t2', nameRu: 'Hardened Mace', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 16. +2 Strength, +1 Armor', icon: '🔨', statBonuses: {"strength":2,"armor":1} },
  mace_t3: { id: 'mace_t3', nameRu: 'Master Mace', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 17. +3 Strength, +2 Armor', icon: '🔨', statBonuses: {"strength":3,"armor":2} },
  greatsword_t1: { id: 'greatsword_t1', nameRu: 'Steel Greatsword', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 21. +2 Strength', icon: '⚔', statBonuses: {"strength":2} },
  greatsword_t2: { id: 'greatsword_t2', nameRu: 'Hardened Greatsword', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 22. +3 Strength, +1 Health', icon: '⚔', statBonuses: {"strength":3,"health":1} },
  greatsword_t3: { id: 'greatsword_t3', nameRu: 'Master Greatsword', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 23. +4 Strength, +2 Health', icon: '⚔', statBonuses: {"strength":4,"health":2} },
  spear_t1: { id: 'spear_t1', nameRu: 'Steel Spear', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 17. +2 Strength', icon: '🔱', statBonuses: {"strength":2} },
  spear_t2: { id: 'spear_t2', nameRu: 'Hardened Spear', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 18. +3 Strength, +1 Health', icon: '🔱', statBonuses: {"strength":3,"health":1} },
  spear_t3: { id: 'spear_t3', nameRu: 'Master Spear', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 19. +4 Strength, +2 Health', icon: '🔱', statBonuses: {"strength":4,"health":2} },
  hammer_t1: { id: 'hammer_t1', nameRu: 'Steel Hammer', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 23. +2 Strength', icon: '🔨', statBonuses: {"strength":2} },
  hammer_t2: { id: 'hammer_t2', nameRu: 'Hardened Hammer', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 24. +3 Strength, +1 Health', icon: '🔨', statBonuses: {"strength":3,"health":1} },
  hammer_t3: { id: 'hammer_t3', nameRu: 'Master Hammer', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 25. +4 Strength, +2 Health', icon: '🔨', statBonuses: {"strength":4,"health":2} },
  dagger_t1: { id: 'dagger_t1', nameRu: 'Steel Dagger', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 9. +1 Agility', icon: '🗡', statBonuses: {"agility":1} },
  dagger_t2: { id: 'dagger_t2', nameRu: 'Hardened Dagger', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +2 Agility, +1 Evasion', icon: '🗡', statBonuses: {"agility":2,"evasion":1} },
  dagger_t3: { id: 'dagger_t3', nameRu: 'Master Dagger', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +3 Agility, +2 Evasion', icon: '🗡', statBonuses: {"agility":3,"evasion":2} },
  fists_t1: { id: 'fists_t1', nameRu: 'Steel Fists', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +1 Agility', icon: '👊', statBonuses: {"agility":1} },
  fists_t2: { id: 'fists_t2', nameRu: 'Hardened Fists', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +2 Agility, +1 Evasion', icon: '👊', statBonuses: {"agility":2,"evasion":1} },
  fists_t3: { id: 'fists_t3', nameRu: 'Master Fists', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 13. +3 Agility, +2 Evasion', icon: '👊', statBonuses: {"agility":3,"evasion":2} },
  shortbow_t1: { id: 'shortbow_t1', nameRu: 'Steel Short Bow', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +1 Agility, +1 Accuracy', icon: '🏹', statBonuses: {"agility":1,"accuracy":1} },
  shortbow_t2: { id: 'shortbow_t2', nameRu: 'Hardened Short Bow', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +2 Agility, +1 Accuracy', icon: '🏹', statBonuses: {"agility":2,"accuracy":1} },
  shortbow_t3: { id: 'shortbow_t3', nameRu: 'Master Short Bow', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 13. +3 Agility, +2 Accuracy', icon: '🏹', statBonuses: {"agility":3,"accuracy":2} },
  longbow_t1: { id: 'longbow_t1', nameRu: 'Steel Long Bow', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 16. +1 Agility, +1 Accuracy', icon: '🏹', statBonuses: {"agility":1,"accuracy":1} },
  longbow_t2: { id: 'longbow_t2', nameRu: 'Hardened Long Bow', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 17. +2 Agility, +1 Accuracy', icon: '🏹', statBonuses: {"agility":2,"accuracy":1} },
  longbow_t3: { id: 'longbow_t3', nameRu: 'Master Long Bow', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 18. +3 Agility, +2 Accuracy', icon: '🏹', statBonuses: {"agility":3,"accuracy":2} },
  crossbow_t1: { id: 'crossbow_t1', nameRu: 'Steel Crossbow', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 19. +1 Agility, +1 Accuracy', icon: '🏹', statBonuses: {"agility":1,"accuracy":1} },
  crossbow_t2: { id: 'crossbow_t2', nameRu: 'Hardened Crossbow', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 20. +2 Agility, +1 Accuracy', icon: '🏹', statBonuses: {"agility":2,"accuracy":1} },
  crossbow_t3: { id: 'crossbow_t3', nameRu: 'Master Crossbow', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 21. +3 Agility, +2 Accuracy', icon: '🏹', statBonuses: {"agility":3,"accuracy":2} },
  staff_fire_t1: { id: 'staff_fire_t1', nameRu: 'Steel Fire Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', icon: '🔥', statBonuses: {"intellect":1} },
  staff_fire_t2: { id: 'staff_fire_t2', nameRu: 'Hardened Fire Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', icon: '🔥', statBonuses: {"intellect":2} },
  staff_fire_t3: { id: 'staff_fire_t3', nameRu: 'Master Fire Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect, +1 Mana', icon: '🔥', statBonuses: {"intellect":3,"mana":1} },
  staff_water_t1: { id: 'staff_water_t1', nameRu: 'Steel Ice Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', icon: '❄', statBonuses: {"intellect":1} },
  staff_water_t2: { id: 'staff_water_t2', nameRu: 'Hardened Ice Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', icon: '❄', statBonuses: {"intellect":2} },
  staff_water_t3: { id: 'staff_water_t3', nameRu: 'Master Ice Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect, +1 Mana', icon: '❄', statBonuses: {"intellect":3,"mana":1} },
  staff_earth_t1: { id: 'staff_earth_t1', nameRu: 'Steel Earth Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', icon: '🪨', statBonuses: {"intellect":1} },
  staff_earth_t2: { id: 'staff_earth_t2', nameRu: 'Hardened Earth Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', icon: '🪨', statBonuses: {"intellect":2} },
  staff_earth_t3: { id: 'staff_earth_t3', nameRu: 'Master Earth Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect, +1 Mana', icon: '🪨', statBonuses: {"intellect":3,"mana":1} },
  staff_wind_t1: { id: 'staff_wind_t1', nameRu: 'Steel Storm Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', icon: '🌪', statBonuses: {"intellect":1} },
  staff_wind_t2: { id: 'staff_wind_t2', nameRu: 'Hardened Storm Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', icon: '🌪', statBonuses: {"intellect":2} },
  staff_wind_t3: { id: 'staff_wind_t3', nameRu: 'Master Storm Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect, +1 Mana', icon: '🌪', statBonuses: {"intellect":3,"mana":1} },
  staff_nature_t1: { id: 'staff_nature_t1', nameRu: 'Steel Nature Staff', rarity: 'common', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 10. +1 Intellect', icon: '🌿', statBonuses: {"intellect":1} },
  staff_nature_t2: { id: 'staff_nature_t2', nameRu: 'Hardened Nature Staff', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 11. +2 Intellect', icon: '🌿', statBonuses: {"intellect":2} },
  staff_nature_t3: { id: 'staff_nature_t3', nameRu: 'Master Nature Staff', rarity: 'rare', type: 'equipment', equipSlot: 'weapon', descRu: 'baseDmg 12. +3 Intellect, +1 Mana', icon: '🌿', statBonuses: {"intellect":3,"mana":1} },
  shield_t1: { id: 'shield_t1', nameRu: 'Steel Shield', rarity: 'common', type: 'equipment', equipSlot: 'shield', descRu: '+2 Armor, +1 Health', icon: '🛡', statBonuses: {"armor":2,"health":1} },
  shield_t2: { id: 'shield_t2', nameRu: 'Hardened Shield', rarity: 'uncommon', type: 'equipment', equipSlot: 'shield', descRu: '+4 Armor, +2 Health', icon: '🛡', statBonuses: {"armor":4,"health":2} },
    helmet_t1: { id: 'helmet_t1', nameRu: 'Steel Helmet', rarity: 'common', type: 'equipment', equipSlot: 'helmet', descRu: '+2 Armor. +1 Health', icon: '⛑', armorBonus: 2, statBonuses: {"health":1} },
  helmet_t2: { id: 'helmet_t2', nameRu: 'Hardened Helmet', rarity: 'uncommon', type: 'equipment', equipSlot: 'helmet', descRu: '+4 Armor. +2 Health', icon: '⛑', armorBonus: 4, statBonuses: {"health":2} },
  helmet_t3: { id: 'helmet_t3', nameRu: 'Master Helmet', rarity: 'rare', type: 'equipment', equipSlot: 'helmet', descRu: '+6 Armor. +3 Health, +1 Will', icon: '⛑', armorBonus: 6, statBonuses: {"health":3,"will":1} },
  chest_t1: { id: 'chest_t1', nameRu: 'Steel Chestplate', rarity: 'common', type: 'equipment', equipSlot: 'chest', descRu: '+5 Armor. +2 Health', icon: '🛡', armorBonus: 5, statBonuses: {"health":2} },
  chest_t2: { id: 'chest_t2', nameRu: 'Hardened Chestplate', rarity: 'uncommon', type: 'equipment', equipSlot: 'chest', descRu: '+8 Armor. +3 Health, +1 Armor', icon: '🛡', armorBonus: 8, statBonuses: {"health":3,"armor":1} },
  chest_t3: { id: 'chest_t3', nameRu: 'Master Chestplate', rarity: 'rare', type: 'equipment', equipSlot: 'chest', descRu: '+12 Armor. +4 Health, +2 Armor', icon: '🛡', armorBonus: 12, statBonuses: {"health":4,"armor":2} },
  gloves_t1: { id: 'gloves_t1', nameRu: 'Steel Gloves', rarity: 'common', type: 'equipment', equipSlot: 'gloves', descRu: '+1 Armor. +1 Accuracy', icon: '🧤', armorBonus: 1, statBonuses: {"accuracy":1} },
  gloves_t2: { id: 'gloves_t2', nameRu: 'Hardened Gloves', rarity: 'uncommon', type: 'equipment', equipSlot: 'gloves', descRu: '+2 Armor. +2 Accuracy', icon: '🧤', armorBonus: 2, statBonuses: {"accuracy":2} },
  gloves_t3: { id: 'gloves_t3', nameRu: 'Master Gloves', rarity: 'rare', type: 'equipment', equipSlot: 'gloves', descRu: '+4 Armor. +3 Accuracy, +1 Agility', icon: '🧤', armorBonus: 4, statBonuses: {"accuracy":3,"agility":1} },
  boots_t1: { id: 'boots_t1', nameRu: 'Steel Boots', rarity: 'common', type: 'equipment', equipSlot: 'boots', descRu: '+1 Armor. +1 Evasion', icon: '👢', armorBonus: 1, statBonuses: {"evasion":1} },
  boots_t2: { id: 'boots_t2', nameRu: 'Hardened Boots', rarity: 'uncommon', type: 'equipment', equipSlot: 'boots', descRu: '+3 Armor. +2 Evasion', icon: '👢', armorBonus: 3, statBonuses: {"evasion":2} },
  boots_t3: { id: 'boots_t3', nameRu: 'Master Boots', rarity: 'rare', type: 'equipment', equipSlot: 'boots', descRu: '+5 Armor. +3 Evasion, +1 Agility', icon: '👢', armorBonus: 5, statBonuses: {"evasion":3,"agility":1} },
  ring_t1: { id: 'ring_t1', nameRu: 'Steel Ring', rarity: 'common', type: 'equipment', equipSlot: 'ring', descRu: '+2 Luck, +1 Mana', icon: '💍', armorBonus: 0, statBonuses: {"luck":2,"mana":1} },
  ring_t2: { id: 'ring_t2', nameRu: 'Hardened Ring', rarity: 'uncommon', type: 'equipment', equipSlot: 'ring', descRu: '+3 Luck, +1 Mana', icon: '💍', armorBonus: 0, statBonuses: {"luck":3,"mana":1} },
  ring_t3: { id: 'ring_t3', nameRu: 'Master Ring', rarity: 'rare', type: 'equipment', equipSlot: 'ring', descRu: '+4 Luck, +2 Mana', icon: '💍', armorBonus: 0, statBonuses: {"luck":4,"mana":2} },
  amulet_t1: { id: 'amulet_t1', nameRu: 'Steel Amulet', rarity: 'common', type: 'equipment', equipSlot: 'amulet', descRu: '+1 Intellect, +1 Will', icon: '📿', armorBonus: 0, statBonuses: {"intellect":1,"will":1} },
  amulet_t2: { id: 'amulet_t2', nameRu: 'Hardened Amulet', rarity: 'uncommon', type: 'equipment', equipSlot: 'amulet', descRu: '+2 Intellect, +1 Will', icon: '📿', armorBonus: 0, statBonuses: {"intellect":2,"will":1} },
  amulet_t3: { id: 'amulet_t3', nameRu: 'Master Amulet', rarity: 'rare', type: 'equipment', equipSlot: 'amulet', descRu: '+3 Intellect, +2 Will', icon: '📿', armorBonus: 0, statBonuses: {"intellect":3,"will":2} },
  weapon_rune_t1: { id: 'weapon_rune_t1', nameRu: 'Steel Weapon Rune', rarity: 'common', type: 'equipment', equipSlot: 'weapon_rune', descRu: '+1 Strength, +1 Agility', icon: '🔮', armorBonus: 0, statBonuses: {"strength":1,"agility":1} },
  weapon_rune_t2: { id: 'weapon_rune_t2', nameRu: 'Hardened Weapon Rune', rarity: 'uncommon', type: 'equipment', equipSlot: 'weapon_rune', descRu: '+2 Strength, +2 Agility', icon: '🔮', armorBonus: 0, statBonuses: {"strength":2,"agility":2} },
  weapon_rune_t3: { id: 'weapon_rune_t3', nameRu: 'Master Weapon Rune', rarity: 'rare', type: 'equipment', equipSlot: 'weapon_rune', descRu: '+3 Strength, +3 Agility', icon: '🔮', armorBonus: 0, statBonuses: {"strength":3,"agility":3} },
  armor_rune_t1: { id: 'armor_rune_t1', nameRu: 'Steel Armor Rune', rarity: 'common', type: 'equipment', equipSlot: 'armor_rune', descRu: '+1 Armor, +1 Will', icon: '✦', armorBonus: 0, statBonuses: {"armor":1,"will":1} },
  armor_rune_t2: { id: 'armor_rune_t2', nameRu: 'Hardened Armor Rune', rarity: 'uncommon', type: 'equipment', equipSlot: 'armor_rune', descRu: '+2 Armor, +2 Will', icon: '✦', armorBonus: 0, statBonuses: {"armor":2,"will":2} },
  armor_rune_t3: { id: 'armor_rune_t3', nameRu: 'Master Armor Rune', rarity: 'rare', type: 'equipment', equipSlot: 'armor_rune', descRu: '+3 Armor, +3 Will', icon: '✦', armorBonus: 0, statBonuses: {"armor":3,"will":3} },
  shield_t3: { id: 'shield_t3', nameRu: 'Master Shield', rarity: 'rare', type: 'equipment', equipSlot: 'shield', descRu: '+6 Armor, +3 Health', icon: '🛡', statBonuses: {"armor":6,"health":3} },


  // ── Equipment T1 ───────────────────────────────────────────────────────────
  copper_helmet: {
    id: 'copper_helmet', nameRu: 'Copper Helmet', rarity: 'common', type: 'equipment',
    descRu: '+2 Armor', icon: '⛑', equipSlot: 'helmet', armorBonus: 2,
  },
  copper_chest: {
    id: 'copper_chest', nameRu: 'Copper Chest', rarity: 'common', type: 'equipment',
    descRu: '+5 Armor', icon: '🛡', equipSlot: 'chest', armorBonus: 5,
  },
  copper_ring: {
    id: 'copper_ring', nameRu: 'Copper Ring', rarity: 'common', type: 'equipment',
    descRu: '+3 Luck', icon: '💍', equipSlot: 'ring', statBonuses: { luck: 3 },
  },
  basic_rune: {
    id: 'basic_rune', nameRu: 'Basic Rune', rarity: 'common', type: 'equipment',
    descRu: '+1 Armor, +1 Will', icon: '✦', equipSlot: 'armor_rune', armorBonus: 1, statBonuses: { will: 1 },
  },

  // ── Quest Items ─────────────────────────────────────────────────────────────
  crystal_fire: {
    id: 'crystal_fire', nameRu: 'Fire Crystal', rarity: 'legendary', type: 'material',
    descRu: 'Crystallized essence of Ignis. Enables fire magic in the Steam World.', icon: '💎',
  },
  crystal_water: {
    id: 'crystal_water', nameRu: 'Water Crystal', rarity: 'legendary', type: 'material',
    descRu: 'Crystallized essence of Aquaris. Enables water magic in the Steam World.', icon: '💎',
  },
  crystal_earth: {
    id: 'crystal_earth', nameRu: 'Earth Crystal', rarity: 'legendary', type: 'material',
    descRu: 'Crystallized essence of Terra. Enables earth magic in the Steam World.', icon: '💎',
  },
  crystal_wind: {
    id: 'crystal_wind', nameRu: 'Wind Crystal', rarity: 'legendary', type: 'material',
    descRu: 'Crystallized essence of Aeros. Enables wind magic in the Steam World.', icon: '💎',
  },

  // Consumables
  health_potion: {
    id: 'health_potion', nameRu: 'Зелье здоровья', rarity: 'common', type: 'consumable',
    descRu: 'Восстанавливает 30 HP.',
    icon: '♥',
    hpRestore: 30,
  },
  mana_potion: {
    id: 'mana_potion', nameRu: 'Зелье маны', rarity: 'common', type: 'consumable',
    descRu: 'Восстанавливает 25 маны.',
    icon: '♦',
    manaRestore: 25,
  },
};

// ─── Loot tables per creature ─────────────────────────────────────────────────

export const LOOT_TABLES: Record<string, LootEntry[]> = {
  rabbit: [
    { itemId: 'rabbit_fur',    chance: 0.6, minQty: 1, maxQty: 2 },
    { itemId: 'health_potion', chance: 0.1, minQty: 1, maxQty: 1 },
  ],
  goblin: [
    { itemId: 'goblin_tooth',  chance: 0.7, minQty: 1, maxQty: 3 },
    { itemId: 'health_potion', chance: 0.15, minQty: 1, maxQty: 1 },
  ],
  wolf: [
    { itemId: 'wolf_pelt',     chance: 0.6, minQty: 1, maxQty: 1 },
    { itemId: 'health_potion', chance: 0.2, minQty: 1, maxQty: 1 },
  ],
  scout: [
    { itemId: 'scout_badge',   chance: 0.5, minQty: 1, maxQty: 1 },
    { itemId: 'mana_potion',   chance: 0.2, minQty: 1, maxQty: 1 },
  ],
  bear: [
    { itemId: 'bear_claw',     chance: 0.65, minQty: 1, maxQty: 2 },
    { itemId: 'health_potion', chance: 0.35, minQty: 1, maxQty: 2 },
  ],
  orc: [
    { itemId: 'orc_bone',      chance: 0.6, minQty: 1, maxQty: 2 },
    { itemId: 'health_potion', chance: 0.25, minQty: 1, maxQty: 1 },
  ],
  shaman: [
    { itemId: 'shaman_totem',  chance: 0.55, minQty: 1, maxQty: 1 },
    { itemId: 'mana_potion',   chance: 0.4,  minQty: 1, maxQty: 2 },
  ],
  forest_spirit: [
    { itemId: 'spirit_essence', chance: 0.5, minQty: 1, maxQty: 1 },
    { itemId: 'mana_potion',    chance: 0.3, minQty: 1, maxQty: 1 },
  ],
  bandit_archer: [
    { itemId: 'bandit_coin',   chance: 0.8, minQty: 1, maxQty: 3 },
    { itemId: 'bandit_quiver', chance: 0.4, minQty: 1, maxQty: 1 },
    { itemId: 'health_potion', chance: 0.15, minQty: 1, maxQty: 1 },
  ],
  bandit_crossbow: [
    { itemId: 'bandit_coin', chance: 0.8, minQty: 1, maxQty: 3 },
    { itemId: 'bandit_bolt', chance: 0.5, minQty: 1, maxQty: 2 },
    { itemId: 'mana_potion', chance: 0.15, minQty: 1, maxQty: 1 },
  ],
  bandit_spear: [
    { itemId: 'bandit_coin',   chance: 0.8, minQty: 1, maxQty: 3 },
    { itemId: 'health_potion', chance: 0.2,  minQty: 1, maxQty: 1 },
  ],
  bandit_brute: [
    { itemId: 'bandit_coin',   chance: 0.9, minQty: 2, maxQty: 5 },
    { itemId: 'health_potion', chance: 0.4,  minQty: 1, maxQty: 2 },
  ],
};

// ─── Recipes ─────────────────────────────────────────────────────────────────

export const RECIPES: RecipeDef[] = [
  { id: 'recipe_helmet_t1', nameRu: 'Steel Helmet', workbench: 'armorer', materials: {"copper_ore":4,"wolf_hide":2}, resultId: 'helmet_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_helmet_t2', nameRu: 'Hardened Helmet', workbench: 'armorer', materials: {"copper_ore":7,"wolf_hide":4}, resultId: 'helmet_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_helmet_t3', nameRu: 'Master Helmet', workbench: 'armorer', materials: {"copper_ore":10,"wolf_hide":6,"willow_branch":3}, resultId: 'helmet_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_chest_t1', nameRu: 'Steel Chestplate', workbench: 'armorer', materials: {"copper_ore":6,"wolf_hide":3}, resultId: 'chest_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_chest_t2', nameRu: 'Hardened Chestplate', workbench: 'armorer', materials: {"copper_ore":10,"wolf_hide":6}, resultId: 'chest_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_chest_t3', nameRu: 'Master Chestplate', workbench: 'armorer', materials: {"copper_ore":14,"wolf_hide":8,"willow_branch":4}, resultId: 'chest_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_gloves_t1', nameRu: 'Steel Gloves', workbench: 'armorer', materials: {"copper_ore":3,"wolf_hide":2}, resultId: 'gloves_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_gloves_t2', nameRu: 'Hardened Gloves', workbench: 'armorer', materials: {"copper_ore":5,"wolf_hide":3}, resultId: 'gloves_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_gloves_t3', nameRu: 'Master Gloves', workbench: 'armorer', materials: {"copper_ore":8,"wolf_hide":5,"willow_branch":2}, resultId: 'gloves_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_boots_t1', nameRu: 'Steel Boots', workbench: 'armorer', materials: {"copper_ore":3,"wolf_hide":2}, resultId: 'boots_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_boots_t2', nameRu: 'Hardened Boots', workbench: 'armorer', materials: {"copper_ore":5,"wolf_hide":4}, resultId: 'boots_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_boots_t3', nameRu: 'Master Boots', workbench: 'armorer', materials: {"copper_ore":8,"wolf_hide":6,"willow_branch":2}, resultId: 'boots_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_ring_t1', nameRu: 'Steel Ring', workbench: 'jeweler', materials: {"copper_ore":4,"wolf_hide":1}, resultId: 'ring_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_ring_t2', nameRu: 'Hardened Ring', workbench: 'jeweler', materials: {"copper_ore":7,"wolf_hide":2}, resultId: 'ring_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_ring_t3', nameRu: 'Master Ring', workbench: 'jeweler', materials: {"copper_ore":10,"wolf_hide":3,"willow_branch":3}, resultId: 'ring_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_amulet_t1', nameRu: 'Steel Amulet', workbench: 'jeweler', materials: {"copper_ore":4,"willow_branch":2}, resultId: 'amulet_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_amulet_t2', nameRu: 'Hardened Amulet', workbench: 'jeweler', materials: {"copper_ore":7,"willow_branch":4}, resultId: 'amulet_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_amulet_t3', nameRu: 'Master Amulet', workbench: 'jeweler', materials: {"copper_ore":10,"willow_branch":6,"wolf_hide":2}, resultId: 'amulet_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_weapon_rune_t1', nameRu: 'Steel Weapon Rune', workbench: 'runemaster', materials: {"willow_branch":4,"wolf_hide":2}, resultId: 'weapon_rune_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_weapon_rune_t2', nameRu: 'Hardened Weapon Rune', workbench: 'runemaster', materials: {"willow_branch":7,"wolf_hide":4}, resultId: 'weapon_rune_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_weapon_rune_t3', nameRu: 'Master Weapon Rune', workbench: 'runemaster', materials: {"willow_branch":10,"wolf_hide":6,"copper_ore":3}, resultId: 'weapon_rune_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_armor_rune_t1', nameRu: 'Steel Armor Rune', workbench: 'runemaster', materials: {"willow_branch":4,"wolf_hide":2}, resultId: 'armor_rune_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_armor_rune_t2', nameRu: 'Hardened Armor Rune', workbench: 'runemaster', materials: {"willow_branch":7,"wolf_hide":4}, resultId: 'armor_rune_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_armor_rune_t3', nameRu: 'Master Armor Rune', workbench: 'runemaster', materials: {"willow_branch":10,"wolf_hide":6,"copper_ore":3}, resultId: 'armor_rune_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_sword_t1', nameRu: 'Steel Sword', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'sword_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_sword_t2', nameRu: 'Hardened Sword', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'sword_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_sword_t3', nameRu: 'Master Sword', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'sword_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_mace_t1', nameRu: 'Steel Mace', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'mace_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_mace_t2', nameRu: 'Hardened Mace', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'mace_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_mace_t3', nameRu: 'Master Mace', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'mace_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_greatsword_t1', nameRu: 'Steel Greatsword', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'greatsword_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_greatsword_t2', nameRu: 'Hardened Greatsword', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'greatsword_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_greatsword_t3', nameRu: 'Master Greatsword', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'greatsword_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_spear_t1', nameRu: 'Steel Spear', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'spear_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_spear_t2', nameRu: 'Hardened Spear', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'spear_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_spear_t3', nameRu: 'Master Spear', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'spear_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_hammer_t1', nameRu: 'Steel Hammer', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'hammer_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_hammer_t2', nameRu: 'Hardened Hammer', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'hammer_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_hammer_t3', nameRu: 'Master Hammer', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'hammer_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_dagger_t1', nameRu: 'Steel Dagger', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'dagger_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_dagger_t2', nameRu: 'Hardened Dagger', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'dagger_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_dagger_t3', nameRu: 'Master Dagger', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'dagger_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_fists_t1', nameRu: 'Steel Fists', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'fists_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_fists_t2', nameRu: 'Hardened Fists', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'fists_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_fists_t3', nameRu: 'Master Fists', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'fists_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shortbow_t1', nameRu: 'Steel Short Bow', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'shortbow_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shortbow_t2', nameRu: 'Hardened Short Bow', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'shortbow_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shortbow_t3', nameRu: 'Master Short Bow', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'shortbow_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_longbow_t1', nameRu: 'Steel Long Bow', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'longbow_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_longbow_t2', nameRu: 'Hardened Long Bow', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'longbow_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_longbow_t3', nameRu: 'Master Long Bow', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'longbow_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_crossbow_t1', nameRu: 'Steel Crossbow', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'crossbow_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_crossbow_t2', nameRu: 'Hardened Crossbow', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'crossbow_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_crossbow_t3', nameRu: 'Master Crossbow', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'crossbow_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_fire_t1', nameRu: 'Steel Fire Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_fire_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_fire_t2', nameRu: 'Hardened Fire Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_fire_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_fire_t3', nameRu: 'Master Fire Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_fire_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_water_t1', nameRu: 'Steel Ice Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_water_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_water_t2', nameRu: 'Hardened Ice Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_water_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_water_t3', nameRu: 'Master Ice Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_water_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_earth_t1', nameRu: 'Steel Earth Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_earth_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_earth_t2', nameRu: 'Hardened Earth Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_earth_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_earth_t3', nameRu: 'Master Earth Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_earth_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_wind_t1', nameRu: 'Steel Storm Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_wind_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_wind_t2', nameRu: 'Hardened Storm Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_wind_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_wind_t3', nameRu: 'Master Storm Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_wind_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_nature_t1', nameRu: 'Steel Nature Staff', workbench: 'weaponsmith', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'staff_nature_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_nature_t2', nameRu: 'Hardened Nature Staff', workbench: 'weaponsmith', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'staff_nature_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_staff_nature_t3', nameRu: 'Master Nature Staff', workbench: 'weaponsmith', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'staff_nature_t3', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shield_t1', nameRu: 'Steel Shield', workbench: 'armorer', materials: {"copper_ore":5,"willow_branch":3}, resultId: 'shield_t1', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shield_t2', nameRu: 'Hardened Shield', workbench: 'armorer', materials: {"copper_ore":8,"willow_branch":5,"wolf_hide":2}, resultId: 'shield_t2', resultQty: 1, craftTime: 10 },
  { id: 'recipe_shield_t3', nameRu: 'Master Shield', workbench: 'armorer', materials: {"copper_ore":12,"willow_branch":8,"wolf_hide":5}, resultId: 'shield_t3', resultQty: 1, craftTime: 10 },

  // Armorer
  {
    id: 'recipe_copper_helmet', nameRu: 'Copper Helmet',
    workbench: 'armorer',
    materials: { copper_ore: 3, wolf_hide: 2 },
    resultId: 'copper_helmet', resultQty: 1, craftTime: 10,
  },
  {
    id: 'recipe_copper_chest', nameRu: 'Copper Chestplate',
    workbench: 'armorer',
    materials: { copper_ore: 5, wolf_hide: 3 },
    resultId: 'copper_chest', resultQty: 1, craftTime: 10,
  },
  // Jeweler
  {
    id: 'recipe_copper_ring', nameRu: 'Copper Ring',
    workbench: 'jeweler',
    materials: { copper_ore: 4, wolf_hide: 1 },
    resultId: 'copper_ring', resultQty: 1, craftTime: 10,
  },
  // Rune Master
  {
    id: 'recipe_basic_rune', nameRu: 'Basic Rune',
    workbench: 'runemaster',
    materials: { willow_branch: 3, wolf_hide: 2 },
    resultId: 'basic_rune', resultQty: 1, craftTime: 10,
  },
];

// ─── Resource Node Types ─────────────────────────────────────────────────────

export interface ResourceNodeDef {
  id: string;
  nameRu: string;
  profession: 'mining' | 'woodcutting' | 'trophy';
  itemId: string;
  gatherTime: number; // seconds
  minQty: number;
  maxQty: number;
  respawnTime: number; // seconds
  color: number;
  icon: string;
}

export const RESOURCE_NODES: Record<string, ResourceNodeDef> = {
  copper_vein: {
    id: 'copper_vein', nameRu: 'Copper Vein', profession: 'mining',
    itemId: 'copper_ore', gatherTime: 2, minQty: 1, maxQty: 3,
    respawnTime: 30, color: 0xcc8844, icon: '⛏',
  },
  willow_tree: {
    id: 'willow_tree', nameRu: 'Willow Tree', profession: 'woodcutting',
    itemId: 'willow_branch', gatherTime: 2, minQty: 1, maxQty: 3,
    respawnTime: 30, color: 0x558833, icon: '🪓',
  },
  hide_pile: {
    id: 'hide_pile', nameRu: 'Hide Pile', profession: 'trophy',
    itemId: 'wolf_hide', gatherTime: 2, minQty: 1, maxQty: 2,
    respawnTime: 30, color: 0x886644, icon: '🦴',
  },
};

/** Roll loot for a creature and return what dropped (may be empty). */
export function rollLoot(creatureId: string): { itemId: string; qty: number }[] {
  const table = LOOT_TABLES[creatureId];
  if (!table) return [];
  const result: { itemId: string; qty: number }[] = [];
  for (const entry of table) {
    if (Math.random() < entry.chance) {
      const qty = entry.minQty + Math.floor(Math.random() * (entry.maxQty - entry.minQty + 1));
      result.push({ itemId: entry.itemId, qty });
    }
  }
  return result;
}
