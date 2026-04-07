import { AbilityDef } from '../types/abilities';

// ─── Кролик ────────────────────────────────────────────────────────────────

/** Рывок — мгновенный бросок вперёд на 180px */
export const ABILITY_DASH: AbilityDef = {
  id: 'dash',
  nameRu: 'Рывок',
  damageType: 'melee',
  effectType: 'dash_forward',
  dashDistance: 180,
  cooldown: 10,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенный бросок вперёд на 180px.',
};

// ─── Гоблин ────────────────────────────────────────────────────────────────

/** Укол — удар кинжалом от Ловкости, гарантированно 1 стак яда */
export const ABILITY_STING: AbilityDef = {
  id: 'sting',
  nameRu: 'Укол',
  damageType: 'melee',
  cooldown: 5,
  manaCost: 0,
  range: 44,
  baseDamage: 12,
  statusEffect: 'poison',
  statusChance: 1.0,
  description: 'Укол кинжалом (урон от Ловкости). Гарантированно 1 стак яда.',
};

// ─── Одноручный меч (обучает Волк) ─────────────────────────────────────────

/** Удар мечом — урон от Силы + Замедление */
export const ABILITY_SWORD_STRIKE: AbilityDef = {
  id: 'sword_strike',
  nameRu: 'Удар мечом',
  damageType: 'melee',
  cooldown: 5,
  manaCost: 0,
  range: 52,
  baseDamage: 18,
  statusEffect: 'slow',
  statusChance: 1.0,
  description: 'Удар мечом (урон от Силы). Накладывает Замедление.',
};

// ─── Булава (обучает Медведь) ───────────────────────────────────────────────

/** Дробящий удар — урон от Силы + Сбитие концентрации */
export const ABILITY_MACE_STRIKE: AbilityDef = {
  id: 'mace_strike',
  nameRu: 'Дробящий удар',
  damageType: 'melee',
  cooldown: 6,
  manaCost: 0,
  range: 48,
  baseDamage: 22,
  statusEffect: 'interrupt',
  statusChance: 1.0,
  description: 'Удар булавой (урон от Силы). Сбивает каст (без кулдауна).',
};

// ─── Двуручный меч (обучает Орк) ───────────────────────────────────────────

/** Рубящий удар — урон от Силы + Кровотечение */
export const ABILITY_SLASH: AbilityDef = {
  id: 'slash',
  nameRu: 'Рубящий удар',
  damageType: 'melee',
  cooldown: 7,
  manaCost: 0,
  range: 60,
  baseDamage: 30,
  statusEffect: 'bleed',
  statusChance: 1.0,
  description: 'Рубящий удар двуручником (урон от Силы). Накладывает Кровотечение.',
};

// ─── Шаман (призыв) ────────────────────────────────────────────────────────

/** Призыв волка — вызывает волка-союзника на 30 сек */
export const ABILITY_SUMMON_WOLF: AbilityDef = {
  id: 'summon_wolf',
  nameRu: 'Призыв волка',
  damageType: 'magic',
  effectType: 'summon_wolf',
  cooldown: 5,   // кулдаун после смерти волка; пока жив — блокируется логикой
  manaCost: 20,
  range: 0,
  baseDamage: 0,
  description: 'Призывает волка-союзника на 30 сек. HP и атака волка масштабируются от Интеллекта. Пока волк жив — повторный призыв невозможен.',
};

// ─── Короткий лук (обучает Разведчик) ──────────────────────────────────────

/** Прицельный выстрел — урон от Ловкости + Уязвимость */
export const ABILITY_BOW_SHOT: AbilityDef = {
  id: 'bow_shot',
  nameRu: 'Прицельный выстрел',
  damageType: 'ranged',
  cooldown: 4,
  manaCost: 0,
  range: 240,
  baseDamage: 16,
  statusEffect: 'vulnerability',
  statusChance: 1.0,
  description: 'Прицельный выстрел (урон от Ловкости). Накладывает Уязвимость (+5% урон по цели).',
};

// ─── Длинный лук (обучает bandit_archer) ──────────────────────────────────

/** Дальний выстрел — урон от Ловкости, 50% шанс сброса кулдауна */
export const ABILITY_LONGBOW_SHOT: AbilityDef = {
  id: 'longbow_shot',
  nameRu: 'Дальний выстрел',
  damageType: 'ranged',
  effectType: 'reset_cooldown',
  resetCooldownChance: 0.5,
  cooldown: 5,
  manaCost: 0,
  range: 320,
  baseDamage: 20,
  description: 'Выстрел из длинного лука (урон от Ловкости). 50% шанс сброса кулдауна.',
};

// ─── Арбалет (обучает bandit_crossbow) ────────────────────────────────────

/** Пробивающий болт — урон от Ловкости, проходит сквозь до 3 целей */
export const ABILITY_CROSSBOW_BOLT: AbilityDef = {
  id: 'crossbow_bolt',
  nameRu: 'Пробивающий болт',
  damageType: 'ranged',
  effectType: 'pierce',
  pierceCount: 3,
  cooldown: 6,
  manaCost: 0,
  range: 290,
  baseDamage: 24,
  description: 'Болт из арбалета (урон от Ловкости). Пробивает до 3 целей насквозь.',
};

// ─── Копьё (обучает bandit_spear) ─────────────────────────────────────────

/** Выпад — урон от Силы, 30% шанс Отбрасывания */
export const ABILITY_SPEAR_THRUST: AbilityDef = {
  id: 'spear_thrust',
  nameRu: 'Выпад',
  damageType: 'melee',
  cooldown: 5,
  manaCost: 0,
  range: 80,
  baseDamage: 20,
  statusEffect: 'knockback',
  statusChance: 0.3,
  description: 'Выпад копьём (урон от Силы). 30% шанс Отбрасывания на 180px.',
};

// ─── Молот (обучает bandit_brute) ─────────────────────────────────────────

/** Сокрушительный удар — урон от Силы, AoE, 50% шанс Пробития брони */
export const ABILITY_HAMMER_STRIKE: AbilityDef = {
  id: 'hammer_strike',
  nameRu: 'Сокрушительный удар',
  damageType: 'melee',
  cooldown: 8,
  manaCost: 0,
  range: 56,
  baseDamage: 36,
  isAoe: true,
  aoeRadius: 60,
  statusEffect: 'armor_break',
  statusChance: 0.5,
  description: 'Удар молотом (урон от Силы), AoE радиус 60. 50% шанс Пробития брони.',
};
