export const MAX_ABILITY_SLOTS = 8;

export type DamageType = 'melee' | 'ranged' | 'magic';

export interface AbilityDef {
  id: string;
  nameRu: string;
  damageType: DamageType;
  cooldown: number;       // сек
  manaCost: number;
  range: number;          // пикс — макс. дальность броска
  baseDamage: number;     // базовый урон способности
  isAoe?: boolean;        // требует режима прицеливания
  aoeRadius?: number;     // радиус поражения (пикс)
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
