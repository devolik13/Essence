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
  | 'stagger'          // Ошеломление (макс мана)
  | 'curse'            // Проклятие
  | 'daze'             // Ошеломление кастетов (+30% каст)
  | 'accuracy_reduce'  // Понижение точности
  | 'fortify'          // Укрепление (стаки брони от булавы)
  | 'concussion'       // Сотрясение (следующая абилка врага +КД)
  | 'evasion_boost'    // Бонус уклонения (групповой)
  | 'block_next'       // Блок следующей атаки
  | 'shield_stance'    // Щитовая стойка (замедление + броня)
  | 'stun_immune'      // Иммунитет к оглушению
  | 'knockback_immune' // Иммунитет к отбрасыванию
  | 'ranged_resist'    // Защита от стрелков
  | 'regen_per_buff'   // Реген за каждый бафф
  | 'regen_per_debuff' // Реген за каждый дебафф
  | 'armor_group_buff' // Групповой бафф брони (+10%)
  | 'focus'            // Фокусировка (следующая атака 100% попадает)
  | 'damage_boost'     // Боевой клич (+10% исходящего урона)
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
  /** Увеличение исходящего урона (0.1 = +10%) */
  outgoingDamageIncrease?: number;
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
  /** Снижение точности (0.2 = −20%) */
  accuracyReduction?: number;
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
  /** Бонус к Стойкости в процентах от текущего Armor (0.15 = +15%) */
  armorBonusPercent?: number;
  /** Бонус к Уклонению (абсолютное значение, напр. 10 = +10 Evasion) */
  evasionBonus?: number;
  /** Блокирует следующую 1 атаку полностью (снимается при попадании) */
  blockNextAttack?: boolean;
  /** Иммунитет к оглушению */
  stunImmune?: boolean;
  /** Иммунитет к отбрасыванию */
  knockbackImmune?: boolean;
  /** Снижение входящего дальнего урона (0.3 = −30%) */
  rangedDamageReduction?: number;
  /** Реген HP/сек за каждый активный бафф на себе */
  regenPerBuff?: number;
  /** Реген HP/сек за каждый активный дебафф на себе */
  regenPerDebuff?: number;
  /** Добавить КД к следующей абилке цели (concussion: 10 сек) */
  addCooldownToNextAbility?: number;
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
    id: 'poison', nameRu: 'Poison',
    maxStacks: 5, duration: 5, stackBehavior: 'refresh',
    dotDpsPerStack: 5,
  },
  bleed: {
    id: 'bleed', nameRu: 'Bleed',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    healReduction: 0.5,
  },
  burn: {
    id: 'burn', nameRu: 'Burn',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    dotPercentPerSec: 0.05,
    dotDpsCap: 100,
  },
  burn_mana: {
    id: 'burn_mana', nameRu: 'Mana Burn',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    dotPercentPerSec: 0.05,
    dotDpsCap: 100,
    dotTargetMana: true,
  },

  // Контроль движения
  slow: {
    id: 'slow', nameRu: 'Slow',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    moveSlow: 0.3,
  },
  knockback: {
    id: 'knockback', nameRu: 'Knockback',
    maxStacks: 1, duration: 0, stackBehavior: 'refresh',
    knockbackDistance: 180,
    knockbackStunDuration: 0.5,
  },
  root: {
    id: 'root', nameRu: 'Root',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    blockMovement: true,
  },

  // Контроль действий
  stun: {
    id: 'stun', nameRu: 'Stun',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    blockAll: true,
  },
  sleep: {
    id: 'sleep', nameRu: 'Sleep',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    blockAll: true,
    breakOnDamage: true,
  },
  silence: {
    id: 'silence', nameRu: 'Silence',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    blockSpells: true,
  },
  fear: {
    id: 'fear', nameRu: 'Fear',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    castTimeIncrease: 0.5,
  },
  interrupt: {
    id: 'interrupt', nameRu: 'Interrupt',
    maxStacks: 1, duration: 0, stackBehavior: 'refresh',
    interruptCast: true,
  },

  // Дебаффы
  chill: {
    id: 'chill', nameRu: 'Chill',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    outgoingDamageReduction: 0.2,
  },
  freeze: {
    id: 'freeze', nameRu: 'Freeze',
    maxStacks: 1, duration: 1, stackBehavior: 'refresh',
    outgoingDamageReduction: 0.2,
    moveSlow: 0.7,
  },
  armor_reduce: {
    id: 'armor_reduce', nameRu: 'Armor Crush',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    armorReduction: 0.2,
  },
  armor_break: {
    id: 'armor_break', nameRu: 'Armor Break',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    armorReduction: 0.5,
  },
  weaken: {
    id: 'weaken', nameRu: 'Weaken',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    strengthReduction: 0.2,
  },
  drain: {
    id: 'drain', nameRu: 'Drain',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    agilityReduction: 0.2,
  },
  blind: {
    id: 'blind', nameRu: 'Blind',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    meleeMissChance: 0.5,
  },
  vulnerability: {
    id: 'vulnerability', nameRu: 'Vulnerability',
    maxStacks: 1, duration: 4, stackBehavior: 'refresh',
    incomingDamageIncrease: 0.10,
  },
  stagger: {
    id: 'stagger', nameRu: 'Stagger',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    maxManaReduction: 0.5,
  },
  curse: {
    id: 'curse', nameRu: 'Curse',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    hpCostMultiplier: 2,
  },

  // Баффы
  mana_regen_boost: {
    id: 'mana_regen_boost', nameRu: 'Mana Regen Boost',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenManaBonus: 0.5,
  },
  mana_regen_block: {
    id: 'mana_regen_block', nameRu: 'Mana Regen Block',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenManaBonus: -0.5, // −50% реген маны
  },
  hp_regen_boost: {
    id: 'hp_regen_boost', nameRu: 'HP Regen',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenHpBonus: 1.0,
  },
  leaf_regen: {
    id: 'leaf_regen', nameRu: 'Leaf Canopy',
    maxStacks: 1, duration: 10, stackBehavior: 'refresh',
    regenHpBonus: 1.0, // +100% реген HP (≈5% HP/2 сек при 60 сек полного бара)
  },
  bark_armor: {
    id: 'bark_armor', nameRu: 'Bark Armor',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    armorBonusPercent: 0.15, // +15% от текущего Armor
  },
  daze: {
    id: 'daze', nameRu: 'Stagger',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    castTimeIncrease: 0.3, // +30% время каста
  },
  accuracy_reduce: {
    id: 'accuracy_reduce', nameRu: 'Accuracy Down',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    accuracyReduction: 0.3, // −30% точность
  },
  fortify: {
    id: 'fortify', nameRu: 'Fortify',
    maxStacks: 5, duration: 5, stackBehavior: 'refresh',
    armorBonusPercent: 0.05, // +5% за стак, макс +25%
  },
  concussion: {
    id: 'concussion', nameRu: 'Concussion',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    addCooldownToNextAbility: 10, // следующая абилка +10 сек КД
  },
  evasion_boost: {
    id: 'evasion_boost', nameRu: 'Maneuver',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    evasionBonus: 10, // +10 Evasion
  },
  block_next: {
    id: 'block_next', nameRu: 'Cover',
    maxStacks: 5, duration: 10, stackBehavior: 'refresh',
    blockNextAttack: true, // поглощает melee/ranged атаки, 1 стак = 1 блок
  },
  shield_stance: {
    id: 'shield_stance', nameRu: 'Shield Stance',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    moveSlow: 0.3, // −30% скорость
    armorBonusPercent: 0.20, // +20% от текущего Armor
  },
  stun_immune: {
    id: 'stun_immune', nameRu: 'Unshakeable',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    stunImmune: true,
  },
  knockback_immune: {
    id: 'knockback_immune', nameRu: 'Firm Stance',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    knockbackImmune: true,
  },
  ranged_resist: {
    id: 'ranged_resist', nameRu: 'Hardening',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    rangedDamageReduction: 0.3, // −30% входящего дальнего урона
  },
  regen_per_buff: {
    id: 'regen_per_buff', nameRu: 'Sustain',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    regenPerBuff: 3, // +3 HP/сек за каждый бафф
  },
  regen_per_debuff: {
    id: 'regen_per_debuff', nameRu: 'Spirit Resilience',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    regenPerDebuff: 3, // +3 HP/сек за каждый дебафф
  },
  armor_group_buff: {
    id: 'armor_group_buff', nameRu: 'Iron Skin',
    maxStacks: 1, duration: 6, stackBehavior: 'refresh',
    armorBonusPercent: 0.10, // +10% от текущего Armor (групповой)
  },
  focus: {
    id: 'focus', nameRu: 'Focus',
    maxStacks: 1, duration: 10, stackBehavior: 'refresh',
  },
  damage_boost: {
    id: 'damage_boost', nameRu: 'War Cry',
    maxStacks: 1, duration: 6, stackBehavior: 'refresh',
    outgoingDamageIncrease: 0.1, // +10% исходящего урона
  },
  acceleration: {
    id: 'acceleration', nameRu: 'Acceleration',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    moveSlow: -0.5, // отрицательное = ускорение (+50% скорость)
  },
  inspiration: {
    id: 'inspiration', nameRu: 'Inspiration',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    castTimeIncrease: -0.3, // отрицательное = ускорение каста (-30% время каста)
  },
};
