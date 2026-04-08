/**
 * Система статусов — протокол эффектов
 * Все параметры соответствуют concept/16_statuses.md
 */

export type StatusEffectId =
  // DoT
  | 'poison'           // Отравление
  | 'bleed'            // Кровотечение
  | 'burn'             // Горение
  | 'burn_mana'        // Горение маны
  // Контроль движения
  | 'slow'             // Замедление
  | 'knockback'        // Отбрасывание (мгновенно)
  | 'root'             // Корни
  // Баффы движения/каста
  | 'acceleration'     // Ускорение
  | 'inspiration'      // Вдохновение
  | 'bark_armor'       // Древесная кора (бафф брони)
  | 'wind_shield'      // Ветряная стена (снижение входящего урона)
  | 'leaf_regen'       // Покров листвы (реген HP аура)
  // Контроль действий
  | 'stun'             // Оглушение
  | 'sleep'            // Сон
  | 'silence'          // Немота
  | 'fear'             // Страх
  | 'interrupt'        // Сбитие концентрации (мгновенно)
  // Дебаффы
  | 'chill'            // Охлаждение
  | 'freeze'           // Заморозка
  | 'armor_reduce'     // Сокращение брони
  | 'armor_break'      // Пробитие брони
  | 'weaken'           // Ослабление
  | 'drain'            // Иссушение
  | 'blind'            // Ослепление
  | 'vulnerability'    // Уязвимость
  | 'stagger'          // Ошеломление
  | 'curse'            // Проклятие
  // Баффы
  | 'mana_regen_boost'  // Усиление регена маны
  | 'mana_regen_block'  // Блок регена маны
  | 'hp_regen_boost';   // Регенерация HP

export interface StatusEffectDef {
  id: StatusEffectId;
  nameRu: string;
  /** Максимальное количество стаков (1 = без стаков) */
  maxStacks: number;
  /** Базовая длительность в секундах (0 = мгновенно) */
  duration: number;
  /** Поведение при повторном применении: refresh = сброс таймера */
  stackBehavior: 'refresh';

  // --- DoT параметры ---
  /** Урон/сек за один стак (poison: 5, burn: % от maxHP) */
  dotDpsPerStack?: number;
  /** Горение: урон в % от maxHP цели (0.05 = 5%) */
  dotPercentPerSec?: number;
  /** Кап урона в сек (горение: 100) */
  dotDpsCap?: number;
  /** true = урон идёт по мане, не по HP (burn_mana) */
  dotTargetMana?: boolean;

  // --- Движение ---
  /** Снижение скорости (0.3 = −30%) */
  moveSlow?: number;
  /** Блокировать движение полностью */
  blockMovement?: boolean;
  /** Дальность отбрасывания в пикселях */
  knockbackDistance?: number;
  /** Длительность потери контроля при отбрасывании */
  knockbackStunDuration?: number;

  // --- Блокировка действий ---
  /** Блокировать всё (stun, sleep) */
  blockAll?: boolean;
  /** Блокировать заклинания (silence) */
  blockSpells?: boolean;
  /** Прервать текущий каст и запустить кулдаун (interrupt) */
  interruptCast?: boolean;
  /** Снимается при получении урона (sleep) */
  breakOnDamage?: boolean;
  /** Увеличение времени каста (0.5 = +50%) */
  castTimeIncrease?: number;

  // --- Дебаффы ---
  /** Снижение исходящего урона (0.2 = −20%) */
  outgoingDamageReduction?: number;
  /** Увеличение получаемого урона (0.05 = +5%) */
  incomingDamageIncrease?: number;
  /** Снижение получаемого урона (0.2 = −20%) */
  incomingDamageReduction?: number;
  /** Снижение брони цели (0.5 = −50%) */
  armorReduction?: number;
  /** Снижение силы (0.2 = −20%) */
  strengthReduction?: number;
  /** Снижение ловкости (0.2 = −20%) */
  agilityReduction?: number;
  /** Шанс промаха в ближнем бою (0.5 = 50%) */
  meleeMissChance?: number;
  /** Снижение максимальной маны (0.5 = −50%) */
  maxManaReduction?: number;
  /** Снижение получаемого лечения/регена HP (0.5 = −50%) */
  healReduction?: number;
  /** HP тратится вместо маны с множителем (curse: 2) */
  hpCostMultiplier?: number;

  // --- Баффы ---
  /** Бонус регена маны (0.5 = +50%) */
  regenManaBonus?: number;
  /** Бонус регена HP (1.0 = +100%) */
  regenHpBonus?: number;
  /** Бонус к Стойкости (абсолютное значение, напр. 20 = +20 Armor) */
  armorBonus?: number;
}

/** Активный статус на существе/игроке */
export interface ActiveStatusEffect {
  id: StatusEffectId;
  stacks: number;
  /** Оставшееся время в секундах */
  timer: number;
}

// ─── Таблица всех статусов ───────────────────────────────────────────────────

export const STATUS_DEFS: Record<StatusEffectId, StatusEffectDef> = {
  // DoT
  poison: {
    id: 'poison', nameRu: 'Отравление',
    maxStacks: 5, duration: 5, stackBehavior: 'refresh',
    dotDpsPerStack: 5,
  },
  bleed: {
    id: 'bleed', nameRu: 'Кровотечение',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    healReduction: 0.5,
  },
  burn: {
    id: 'burn', nameRu: 'Горение',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    dotPercentPerSec: 0.05,
    dotDpsCap: 100,
  },
  burn_mana: {
    id: 'burn_mana', nameRu: 'Горение маны',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    dotPercentPerSec: 0.05,
    dotDpsCap: 100,
    dotTargetMana: true,
  },

  // Контроль движения
  slow: {
    id: 'slow', nameRu: 'Замедление',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    moveSlow: 0.3,
  },
  knockback: {
    id: 'knockback', nameRu: 'Отбрасывание',
    maxStacks: 1, duration: 0, stackBehavior: 'refresh',
    knockbackDistance: 180,
    knockbackStunDuration: 0.5,
  },
  root: {
    id: 'root', nameRu: 'Корни',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    blockMovement: true,
  },

  // Контроль действий
  stun: {
    id: 'stun', nameRu: 'Оглушение',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    blockAll: true,
  },
  sleep: {
    id: 'sleep', nameRu: 'Сон',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    blockAll: true,
    breakOnDamage: true,
  },
  silence: {
    id: 'silence', nameRu: 'Немота',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    blockSpells: true,
  },
  fear: {
    id: 'fear', nameRu: 'Страх',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    castTimeIncrease: 0.5,
  },
  interrupt: {
    id: 'interrupt', nameRu: 'Сбитие концентрации',
    maxStacks: 1, duration: 0, stackBehavior: 'refresh',
    interruptCast: true,
  },

  // Дебаффы
  chill: {
    id: 'chill', nameRu: 'Охлаждение',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    outgoingDamageReduction: 0.2,
  },
  freeze: {
    id: 'freeze', nameRu: 'Заморозка',
    maxStacks: 1, duration: 1, stackBehavior: 'refresh',
    outgoingDamageReduction: 0.2,
    moveSlow: 0.7,
  },
  armor_reduce: {
    id: 'armor_reduce', nameRu: 'Сокрушение брони',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    armorReduction: 0.2,
  },
  armor_break: {
    id: 'armor_break', nameRu: 'Пробитие брони',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    armorReduction: 0.5,
  },
  weaken: {
    id: 'weaken', nameRu: 'Ослабление',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    strengthReduction: 0.2,
  },
  drain: {
    id: 'drain', nameRu: 'Иссушение',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    agilityReduction: 0.2,
  },
  blind: {
    id: 'blind', nameRu: 'Ослепление',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    meleeMissChance: 0.5,
  },
  vulnerability: {
    id: 'vulnerability', nameRu: 'Уязвимость',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    incomingDamageIncrease: 0.05,
  },
  stagger: {
    id: 'stagger', nameRu: 'Ошеломление',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    maxManaReduction: 0.5,
  },
  curse: {
    id: 'curse', nameRu: 'Проклятие',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    hpCostMultiplier: 2,
  },

  // Баффы
  mana_regen_boost: {
    id: 'mana_regen_boost', nameRu: 'Усиление регена маны',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenManaBonus: 0.5,
  },
  mana_regen_block: {
    id: 'mana_regen_block', nameRu: 'Блок регена маны',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenManaBonus: -0.5, // −50% реген маны
  },
  hp_regen_boost: {
    id: 'hp_regen_boost', nameRu: 'Регенерация HP',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenHpBonus: 1.0,
  },
  leaf_regen: {
    id: 'leaf_regen', nameRu: 'Покров листвы',
    maxStacks: 1, duration: 10, stackBehavior: 'refresh',
    regenHpBonus: 1.0, // +100% реген HP (≈5% HP/2 сек при 60 сек полного бара)
  },
  wind_shield: {
    id: 'wind_shield', nameRu: 'Ветряная стена',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    incomingDamageReduction: 0.25,
  },
  bark_armor: {
    id: 'bark_armor', nameRu: 'Древесная кора',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    armorBonus: 20,
  },
  acceleration: {
    id: 'acceleration', nameRu: 'Ускорение',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    moveSlow: -0.5, // отрицательное = ускорение (+50% скорость)
  },
  inspiration: {
    id: 'inspiration', nameRu: 'Вдохновение',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    castTimeIncrease: -0.3, // отрицательное = ускорение каста (-30% время каста)
  },
};
