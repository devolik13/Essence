import { StatusEffectId } from './statuses';

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

  /** Особый механический эффект умения */
  effectType?: 'dash_forward' | 'dash_backward' | 'summon_wolf' | 'reset_cooldown' | 'pierce' | 'multi_hit' | 'cone_aoe';
  /** Дальность броска вперёд (dash_forward), пикс */
  dashDistance?: number;
  /** Количество целей насквозь (pierce) */
  pierceCount?: number;
  /** Шанс сбросить кулдаун (reset_cooldown), 0-1 */
  resetCooldownChance?: number;
  /** Количество ударов (multi_hit) */
  hitCount?: number;
  /** Угол конуса в градусах (cone_aoe) */
  coneAngle?: number;

  /** Статус-эффект накладываемый на цель */
  statusEffect?: StatusEffectId;
  /** Шанс наложить статус (0-1, default 1.0 = гарантированно) */
  statusChance?: number;

  /** Шанс нанести двойной урон (крит школы ветра), 0-1 */
  doubleDamageChance?: number;

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
