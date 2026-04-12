import { ItemDef, LootEntry, RecipeDef } from '../types/items';

// ─── Item definitions ─────────────────────────────────────────────────────────

export const ITEMS: Record<string, ItemDef> = {
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
