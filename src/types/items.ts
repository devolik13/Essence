export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ItemDef {
  id: string;
  nameRu: string;
  descRu: string;
  rarity: ItemRarity;
  type: 'material' | 'consumable' | 'equipment' | 'recipe';
  /** For consumables */
  hpRestore?: number;
  manaRestore?: number;
  /** For equipment: which slot */
  equipSlot?: EquipSlot;
  /** For equipment: stat bonuses */
  statBonuses?: Partial<Record<string, number>>;
  /** For equipment: armor bonus */
  armorBonus?: number;
  /** For equipment: mana bonus */
  manaBonus?: number;
  /** Icon glyph */
  icon: string;
}

export type EquipSlot = 'weapon' | 'shield' | 'helmet' | 'chest' | 'gloves' | 'boots' | 'ring' | 'amulet' | 'weapon_rune' | 'armor_rune';

export interface RecipeDef {
  id: string;
  nameRu: string;
  /** Which workbench type */
  workbench: 'armorer' | 'weaponsmith' | 'jeweler' | 'runemaster';
  /** Required materials: itemId → quantity */
  materials: Record<string, number>;
  /** Result item id */
  resultId: string;
  resultQty: number;
  /** Crafting time in seconds */
  craftTime: number;
  /** Price in copper to buy recipe (0 = free) */
  price?: number;
}

export interface LootEntry {
  itemId: string;
  chance: number;
  minQty: number;
  maxQty: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface Equipment {
  weapon?: string;
  weapon2?: string;  // second weapon slot (Tab to switch)
  shield?: string;
  helmet?: string;
  chest?: string;
  gloves?: string;
  boots?: string;
  ring?: string;
  amulet?: string;
  weapon_rune?: string;
  armor_rune?: string;
}
