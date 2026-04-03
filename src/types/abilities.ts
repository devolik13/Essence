export const MAX_ABILITY_SLOTS = 8;

export type DamageType = 'melee' | 'ranged' | 'magic';

export interface AbilityDef {
  id: string;
  nameRu: string;
  damageType: DamageType;
  cooldown: number;       // сек (после выстрела)
  castTime?: number;      // сек (время каста; 0/undefined = мгновенно)
  manaCost: number;
  range: number;          // пикс — макс. дальность броска
  baseDamage: number;
  isAoe?: boolean;
  aoeRadius?: number;
  description: string;
}

/** Слот умения у игрока */
export interface AbilitySlot {
  index: number;          // 0-7
  ability: AbilityDef | null;
  cooldownRemaining: number; // сек (0 = готово)
}

export function createEmptySlots(): AbilitySlot[] {
  return Array.from({ length: MAX_ABILITY_SLOTS }, (_, i) => ({
    index: i,
    ability: null,
    cooldownRemaining: 0,
  }));
}
