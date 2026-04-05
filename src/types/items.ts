export type ItemRarity = 'common' | 'uncommon' | 'rare';

export interface ItemDef {
  id: string;
  nameRu: string;
  /** Brief description shown in inventory tooltip */
  descRu: string;
  rarity: ItemRarity;
  /** 'material' = craft/quest ingredient; 'consumable' = single-use effect */
  type: 'material' | 'consumable';
  /** For consumables: restores this much HP */
  hpRestore?: number;
  /** For consumables: restores this much Mana */
  manaRestore?: number;
  /** Icon glyph shown in the inventory cell */
  icon: string;
}

export interface LootEntry {
  itemId: string;
  /** Drop probability 0–1 */
  chance: number;
  /** Minimum quantity dropped */
  minQty: number;
  /** Maximum quantity dropped */
  maxQty: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}
