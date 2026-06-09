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
  | 'knockdown'        // Сбитие с ног (отдельно от стана)
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
  | 'luck_group_buff'  // Групповой бафф удачи (+20%)
  | 'mana_flow'        // Групповой бафф регена маны (+20%)
  | 'mana_link_self'   // Mana Link: дебафф кастера (−10% реген маны)
  | 'mana_link_target' // Mana Link: бафф цели (+15% реген маны)
  | 'magic_vulnerability' // Метеокинез (+50% входящего магического урона)
  | 'focus'            // Фокусировка (следующая атака 100% попадает)
  | 'damage_boost'     // Боевой клич (+10% исходящего урона)
  // Баффы
  | 'mana_regen_boost'  // Усиление регена маны
  | 'mana_regen_block'  // Блок регена маны
  | 'hp_regen_boost';   // Регенерация HP

export interface StatusEffectDef {
  id: StatusEffectId;
  nameRu: string;
  nameEn?: string;
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
  /** Увеличение получаемого стихийного урона (fire/water/earth/wind only) */
  elementalDamageIncrease?: number;
  /** Снижение получаемого урона (0.2 = −20%) */
  incomingDamageReduction?: number;
  /** Снижение брони цели (0.5 = −50%) */
  armorReduction?: number;
  /** Снижение силы (0.2 = −20%) */
  strengthReduction?: number;
  /** Снижение ловкости (0.2 = −20%) */
  agilityReduction?: number;
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
  /** Бонус к Удаче в процентах (0.2 = +20%) */
  luckBonusPercent?: number;
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
    id: 'poison', nameRu: 'Яд', nameEn: 'Poison',
    maxStacks: 5, duration: 5, stackBehavior: 'refresh',
    dotDpsPerStack: 5,
  },
  bleed: {
    id: 'bleed', nameRu: 'Кровотечение', nameEn: 'Bleed',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    healReduction: 0.5,
  },
  burn: {
    id: 'burn', nameRu: 'Горение', nameEn: 'Burn',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    dotPercentPerSec: 0.05,
    dotDpsCap: 100,
  },
  burn_mana: {
    id: 'burn_mana', nameRu: 'Горение маны', nameEn: 'Mana Burn',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    dotPercentPerSec: 0.05,
    dotDpsCap: 100,
    dotTargetMana: true,
  },

  // Контроль движения
  slow: {
    id: 'slow', nameRu: 'Замедление', nameEn: 'Slow',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    moveSlow: 0.3,
  },
  knockback: {
    id: 'knockback', nameRu: 'Отбрасывание', nameEn: 'Knockback',
    maxStacks: 1, duration: 0, stackBehavior: 'refresh',
    knockbackDistance: 180,
    knockbackStunDuration: 0.5,
  },
  root: {
    id: 'root', nameRu: 'Корни', nameEn: 'Root',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    blockMovement: true,
  },

  // Контроль действий
  stun: {
    id: 'stun', nameRu: 'Оглушение', nameEn: 'Stun',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    blockAll: true,
  },
  knockdown: {
    id: 'knockdown', nameRu: 'Нокдаун', nameEn: 'Knockdown',
    maxStacks: 1, duration: 1, stackBehavior: 'refresh',
    blockAll: true,
  },
  sleep: {
    id: 'sleep', nameRu: 'Сон', nameEn: 'Sleep',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    blockAll: true,
    breakOnDamage: true,
  },
  silence: {
    id: 'silence', nameRu: 'Немота', nameEn: 'Silence',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    blockSpells: true,
  },
  fear: {
    id: 'fear', nameRu: 'Страх', nameEn: 'Fear',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    castTimeIncrease: 0.5,
  },
  interrupt: {
    id: 'interrupt', nameRu: 'Прерывание', nameEn: 'Interrupt',
    maxStacks: 1, duration: 0, stackBehavior: 'refresh',
    interruptCast: true,
  },

  // Дебаффы
  chill: {
    id: 'chill', nameRu: 'Охлаждение', nameEn: 'Chill',
    maxStacks: 1, duration: 2, stackBehavior: 'refresh',
    outgoingDamageReduction: 0.2,
  },
  freeze: {
    id: 'freeze', nameRu: 'Заморозка', nameEn: 'Freeze',
    maxStacks: 1, duration: 1, stackBehavior: 'refresh',
    outgoingDamageReduction: 0.2,
    moveSlow: 0.7,
  },
  armor_reduce: {
    id: 'armor_reduce', nameRu: 'Сокрушение брони', nameEn: 'Armor Crush',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    armorReduction: 0.2,
  },
  armor_break: {
    id: 'armor_break', nameRu: 'Пробитие брони', nameEn: 'Armor Break',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    armorReduction: 0.5,
  },
  weaken: {
    id: 'weaken', nameRu: 'Ослабление', nameEn: 'Weaken',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    strengthReduction: 0.2,
  },
  drain: {
    id: 'drain', nameRu: 'Иссушение', nameEn: 'Drain',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    agilityReduction: 0.2,
  },
  // Инертный плейсхолдер: acc/eva удалены, переработать в dodge-скилл позже
  blind: {
    id: 'blind', nameRu: 'Ослепление', nameEn: 'Blind',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
  },
  vulnerability: {
    id: 'vulnerability', nameRu: 'Уязвимость', nameEn: 'Vulnerability',
    maxStacks: 1, duration: 4, stackBehavior: 'refresh',
    incomingDamageIncrease: 0.10,
  },
  stagger: {
    id: 'stagger', nameRu: 'Ошеломление', nameEn: 'Stagger',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    maxManaReduction: 0.5,
  },
  curse: {
    id: 'curse', nameRu: 'Проклятие', nameEn: 'Curse',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    hpCostMultiplier: 2,
  },

  // Баффы
  mana_regen_boost: {
    id: 'mana_regen_boost', nameRu: 'Усиление регена маны', nameEn: 'Mana Regen Boost',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenManaBonus: 0.5,
  },
  mana_regen_block: {
    id: 'mana_regen_block', nameRu: 'Блок регена маны', nameEn: 'Mana Regen Block',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenManaBonus: -0.5, // −50% реген маны
  },
  hp_regen_boost: {
    id: 'hp_regen_boost', nameRu: 'Регенерация HP', nameEn: 'HP Regen',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    regenHpBonus: 1.0,
  },
  leaf_regen: {
    id: 'leaf_regen', nameRu: 'Покров листвы', nameEn: 'Leaf Canopy',
    maxStacks: 1, duration: 10, stackBehavior: 'refresh',
    regenHpBonus: 1.0, // +100% реген HP (≈5% HP/2 сек при 60 сек полного бара)
  },
  bark_armor: {
    id: 'bark_armor', nameRu: 'Древесная кора', nameEn: 'Bark Armor',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    armorBonusPercent: 0.15, // +15% от текущего Armor
  },
  daze: {
    id: 'daze', nameRu: 'Ошеломление', nameEn: 'Daze',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    castTimeIncrease: 0.3, // +30% время каста
  },
  // Инертный плейсхолдер: acc/eva удалены, переработать в dodge-скилл позже
  accuracy_reduce: {
    id: 'accuracy_reduce', nameRu: 'Понижение точности', nameEn: 'Accuracy Down',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
  },
  fortify: {
    id: 'fortify', nameRu: 'Укрепление', nameEn: 'Fortify',
    maxStacks: 5, duration: 5, stackBehavior: 'refresh',
    armorBonusPercent: 0.05, // +5% за стак, макс +25%
  },
  concussion: {
    id: 'concussion', nameRu: 'Сотрясение', nameEn: 'Concussion',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    addCooldownToNextAbility: 10, // следующая абилка +10 сек КД
  },
  // Инертный плейсхолдер: acc/eva удалены, переработать в dodge-скилл позже
  evasion_boost: {
    id: 'evasion_boost', nameRu: 'Манёвр', nameEn: 'Maneuver',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
  },
  block_next: {
    id: 'block_next', nameRu: 'Прикрытие', nameEn: 'Cover',
    maxStacks: 5, duration: 10, stackBehavior: 'refresh',
    blockNextAttack: true, // поглощает melee/ranged атаки, 1 стак = 1 блок
  },
  shield_stance: {
    id: 'shield_stance', nameRu: 'Щитовая стойка', nameEn: 'Shield Stance',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    moveSlow: 0.3, // −30% скорость
    armorBonusPercent: 0.20, // +20% от текущего Armor
  },
  stun_immune: {
    id: 'stun_immune', nameRu: 'Непоколебимость', nameEn: 'Unshakeable',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    stunImmune: true,
  },
  knockback_immune: {
    id: 'knockback_immune', nameRu: 'Твёрдая стойка', nameEn: 'Firm Stance',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    knockbackImmune: true,
  },
  ranged_resist: {
    id: 'ranged_resist', nameRu: 'Закалка', nameEn: 'Hardening',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    rangedDamageReduction: 0.3, // −30% входящего дальнего урона
  },
  regen_per_buff: {
    id: 'regen_per_buff', nameRu: 'Подпитка', nameEn: 'Sustain',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    regenPerBuff: 3, // +3 HP/сек за каждый бафф
  },
  regen_per_debuff: {
    id: 'regen_per_debuff', nameRu: 'Стойкость духа', nameEn: 'Spirit Resilience',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    regenPerDebuff: 3, // +3 HP/сек за каждый дебафф
  },
  armor_group_buff: {
    id: 'armor_group_buff', nameRu: 'Железная кожа', nameEn: 'Iron Skin',
    maxStacks: 1, duration: 6, stackBehavior: 'refresh',
    armorBonusPercent: 0.10,
  },
  luck_group_buff: {
    id: 'luck_group_buff', nameRu: 'Благословение фортуны', nameEn: "Fortune's Blessing",
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    luckBonusPercent: 0.20, // +20% Luck
  },
  mana_flow: {
    id: 'mana_flow', nameRu: 'Поток маны', nameEn: 'Mana Flow',
    maxStacks: 1, duration: 10, stackBehavior: 'refresh',
    regenManaBonus: 0.20, // +20% реген маны
  },
  mana_link_self: {
    id: 'mana_link_self', nameRu: 'Связь маны (цена)', nameEn: 'Mana Link (cost)',
    maxStacks: 1, duration: 9999, stackBehavior: 'refresh', // toggle — бессрочный
    regenManaBonus: -0.10,
  },
  mana_link_target: {
    id: 'mana_link_target', nameRu: 'Связь маны', nameEn: 'Mana Link',
    maxStacks: 1, duration: 9999, stackBehavior: 'refresh', // toggle — бессрочный
    regenManaBonus: 0.15,
  },
  magic_vulnerability: {
    id: 'magic_vulnerability', nameRu: 'Метеокинез', nameEn: 'Meteorokinesis',
    maxStacks: 1, duration: 8, stackBehavior: 'refresh',
    elementalDamageIncrease: 0.5, // +50% incoming elemental (fire/water/earth/wind) damage ONLY
  },
  focus: {
    id: 'focus', nameRu: 'Фокусировка', nameEn: 'Focus',
    maxStacks: 1, duration: 10, stackBehavior: 'refresh',
  },
  damage_boost: {
    id: 'damage_boost', nameRu: 'Боевой клич', nameEn: 'War Cry',
    maxStacks: 1, duration: 6, stackBehavior: 'refresh',
    outgoingDamageIncrease: 0.1, // +10% исходящего урона
  },
  acceleration: {
    id: 'acceleration', nameRu: 'Ускорение', nameEn: 'Acceleration',
    maxStacks: 1, duration: 5, stackBehavior: 'refresh',
    moveSlow: -0.5, // отрицательное = ускорение (+50% скорость)
  },
  inspiration: {
    id: 'inspiration', nameRu: 'Вдохновение', nameEn: 'Inspiration',
    maxStacks: 1, duration: 3, stackBehavior: 'refresh',
    castTimeIncrease: -0.3, // отрицательное = ускорение каста (-30% время каста)
  },
};

/**
 * Единый источник истины: какие статусы — баффы (положительные/нейтральные
 * эффекты на себя/союзников). Всё, чего здесь НЕТ, считается дебаффом.
 * Используется для подсчёта баффов/дебаффов и для очищения (cleanse не снимает
 * баффы). Раньше эти списки были захардкожены в 3 местах и расходились.
 */
export const BUFF_STATUS_IDS: ReadonlySet<StatusEffectId> = new Set<StatusEffectId>([
  'acceleration', 'inspiration', 'bark_armor', 'leaf_regen', 'fortify',
  'evasion_boost', 'block_next', 'shield_stance', 'stun_immune', 'knockback_immune',
  'ranged_resist', 'regen_per_buff', 'regen_per_debuff', 'armor_group_buff',
  'luck_group_buff', 'mana_flow', 'mana_link_self', 'mana_link_target',
  'focus', 'damage_boost', 'mana_regen_boost', 'hp_regen_boost',
]);

/** true если статус — бафф; всё остальное считается дебаффом. */
export function isBuffStatus(id: StatusEffectId): boolean {
  return BUFF_STATUS_IDS.has(id);
}
