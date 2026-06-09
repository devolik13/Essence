import { StatusEffectId } from './statuses';
import { MagicSchool } from '../data/magicSchools';

export const MAX_ABILITY_SLOTS = 8;

export type DamageType = 'melee' | 'ranged' | 'magic';

export interface AbilityDef {
  id: string;
  nameRu: string;
  nameEn?: string;
  /** Школа магии — бонус школы применяется автоматически движком */
  school?: MagicSchool;
  damageType: DamageType;
  cooldown: number;       // сек (после выстрела)
  castTime?: number;      // сек (время каста; 0/undefined = мгновенно)
  manaCost: number;
  range: number;          // пикс — макс. дальность броска
  baseDamage: number;
  isAoe?: boolean;
  aoeRadius?: number;
  /** Урон от AoE взрыва (projectile_aoe) — если отличается от baseDamage */
  splashDamage?: number;

  /** Особый механический эффект умения */
  effectType?: 'dash_forward' | 'dash_backward' | 'summon_wolf' | 'summon_wall' | 'wind_barrier' | 'reset_cooldown' | 'pierce' | 'multi_hit' | 'cone_aoe' | 'multi_projectile' | 'cross_aoe' | 'cone_projectiles' | 'self_buff' | 'self_heal' | 'weapon_enchant' | 'ground_zone' | 'projectile_aoe' | 'fire_tsunami' | 'chain_lightning' | 'summon_ent';
  /** Chain lightning: jump radius between targets */
  chainRadius?: number;
  /** Chain lightning: number of jumps */
  chainCount?: number;
  /** Дальность броска вперёд (dash_forward), пикс */
  dashDistance?: number;
  /** Количество целей насквозь (pierce) */
  pierceCount?: number;
  /** Шанс сбросить кулдаун (reset_cooldown), 0-1 */
  resetCooldownChance?: number;
  /** Количество ударов (multi_hit) */
  hitCount?: number;
  /** Угол конуса в градусах (cone_aoe, cone_projectiles) */
  coneAngle?: number;
  /** Количество снарядов/смерчей (multi_projectile, cone_projectiles) */
  projectileCount?: number;
  /** Радиус поиска целей (multi_projectile) */
  projectileRadius?: number;
  /** Ширина луча крестового AoE (cross_aoe) */
  crossArmWidth?: number;
  /** Длина луча крестового AoE (cross_aoe) */
  crossArmLength?: number;

  // --- Ground Zone (ground_zone) ---
  /** Длительность зоны в секундах */
  zoneDuration?: number;
  /** Урон в секунду для стоящих в зоне */
  zoneDps?: number;
  /** true = зона-полоса (стена), false/undefined = круг */
  isWallShape?: boolean;
  /** Ширина полосы (длина стены) в пикселях */
  wallWidth?: number;
  /** Толщина полосы в пикселях */
  wallThickness?: number;

  // --- Summon Wall (summon_wall) ---
  /** HP стены-призыва (масштабируется: wallHP × (1 + Int/100)) */
  wallHP?: number;

  // --- Wind Barrier (wind_barrier) ---
  /** Снижение урона снарядов, пролетающих через барьер (0.25 = −25%) */
  barrierDamageReduction?: number;
  /** Длительность барьера в секундах */
  barrierDuration?: number;

  /** Статус-эффект накладываемый на цель */
  statusEffect?: StatusEffectId;
  /** Шанс наложить статус (0-1, default 1.0 = гарантированно) */
  statusChance?: number;

  /** Применить оружейный эффект в дополнение к собственному statusEffect */
  alsoApplyWeaponEffect?: boolean;
  /** Множитель шанса оружейного эффекта (2 = двойной шанс) */
  weaponEffectChanceMult?: number;
  /** Шанс нанести двойной урон (крит школы ветра), 0-1 */
  doubleDamageChance?: number;

  // --- T3 механики ---
  /** Условный бонус урона (1.5 = +50%) если цель имеет определённый статус */
  conditionalBonusDmg?: number;
  /** Статус цели для условного бонуса */
  conditionalOnStatus?: string;
  /** Следующий T1/T2 бесплатен (без маны) */
  grantFreeNextCast?: boolean;
  /** Игнорирует броню/защиту */
  ignoreArmor?: boolean;
  /** Лайфстил: % от нанесённого урона лечит кастера (0.3 = 30%) */
  lifestealPercent?: number;
  /** Расстояние прыжка к цели перед ударом (пикс) */
  leapDistance?: number;
  /** Снимает все дебаффы с кастера (устарело, использовать cleanseCount) */
  cleanseSelf?: boolean;
  /** Количество случайных дебаффов снимаемых с кастера */
  cleanseCount?: number;
  /** Длительность иммунитета к дебаффам (сек) */
  debuffImmunityDuration?: number;
  /** Доп. КД который навешивается на следующий навык врага */
  addEnemyCooldown?: number;
  /** Бурст урон при макс стаках яда */
  poisonBurstDamage?: number;
  /** Временные HP при попадании (щит на кастера) */
  grantTempHP?: number;
  /** Длительность временных HP (сек) */
  tempHPDuration?: number;

  // --- Weapon Enchant (toggle aura) ---
  /** true = это переключаемая аура (toggle), не расходует ману за каст */
  isToggle?: boolean;
  /** Снижение регена маны пока аура активна (0.3 = −30%) */
  regenPenalty?: number;
  /** Базовый доп. урон стихией при атаке оружием */
  enchantDamage?: number;
  /** ID умения-prerequisite (нельзя выучить без него) */
  prerequisiteId?: string;
  /** Ограничение по оружию — доступно только с указанными типами */
  requiredWeapons?: string[];
  /** Бонус плоского урона за каждый дебафф на кастере */
  bonusDamagePerSelfDebuff?: number;
  /** Бонус % урона за каждый бафф на цели (0.1 = +10%) */
  bonusDamagePercentPerTargetBuff?: number;
  /** Бонус % урона если у цели < 50% HP (0.5 = +50%) */
  executeBonusPercent?: number;
  /** Бонус % урона если нет активного зачарования (0.3 = +30%) */
  bonusDamageIfNoEnchant?: number;
  /** Исцеление за каждый активный статус-эффект на себе (HP) */
  healPerStatusEffect?: number;
  /** Целится в союзника вместо врага */
  targetAlly?: boolean;
  /** Применяется на всю группу (party), без проверки радиуса */
  targetParty?: boolean;

  description: string;
  descriptionEn?: string;
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
