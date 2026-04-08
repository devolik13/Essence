import { AbilityDef } from '../types/abilities';

// ─── Гоблин ────────────────────────────────────────────────────────────────

/** Укол — удар кинжалом от Ловкости, гарантированно 1 стак яда */
export const ABILITY_STING: AbilityDef = {
  id: 'sting',
  nameRu: 'Укол',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 3,
  range: 44,
  baseDamage: 12,
  statusEffect: 'poison',
  statusChance: 0.2,
  description: 'Укол кинжалом (урон от Ловкости). 20% шанс 1 стака яда.',
};

// ─── Одноручный меч (обучает Волк) ─────────────────────────────────────────

/** Удар мечом — урон от Силы + Замедление */
export const ABILITY_SWORD_STRIKE: AbilityDef = {
  id: 'sword_strike',
  nameRu: 'Удар мечом',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 3,
  range: 52,
  baseDamage: 18,
  statusEffect: 'slow',
  statusChance: 0.2,
  description: 'Удар мечом (урон от Силы). 20% шанс Замедления.',
};

// ─── Кинжал T2 ─────────────────────────────────────────────────────────────

/** Бросок кинжала — дистанционный удар от Ловкости + гарантированный яд */
export const ABILITY_KNIFE_THROW: AbilityDef = {
  id: 'knife_throw',
  prerequisiteId: 'sting',
  nameRu: 'Бросок кинжала',
  damageType: 'ranged',
  cooldown: 2,
  manaCost: 6,
  range: 160,
  baseDamage: 12,
  statusEffect: 'poison',
  statusChance: 1.0,
  description: 'Бросок кинжала (урон от Ловкости, дальность 160). 20% шанс 1 стака яда.',
};

// ─── Булава (обучает Медведь) ───────────────────────────────────────────────

/** Дробящий удар — урон от Силы + Сбитие концентрации */
export const ABILITY_MACE_STRIKE: AbilityDef = {
  id: 'mace_strike',
  nameRu: 'Дробящий удар',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 3,
  range: 48,
  baseDamage: 22,
  statusEffect: 'interrupt',
  statusChance: 1.0,
  description: 'Удар булавой (урон от Силы). Сбивает каст (без кулдауна).',
};

// ─── Меч T2 ────────────────────────────────────────────────────────────────

/** Двойной удар — 2 удара, полный урон, замедление на каждый */
export const ABILITY_DOUBLE_STRIKE: AbilityDef = {
  id: 'double_strike',
  prerequisiteId: 'sword_strike',
  nameRu: 'Двойной удар',
  damageType: 'melee',
  effectType: 'multi_hit',
  hitCount: 2,
  cooldown: 2,
  manaCost: 0,
  range: 52,
  baseDamage: 18,
  statusEffect: 'slow',
  statusChance: 0.2,
  description: 'Два быстрых удара мечом (урон от Силы). 20% шанс Замедления на каждый удар.',
};

// ─── Двуручный меч (обучает Орк) ───────────────────────────────────────────

/** Рубящий удар — урон от Силы + Кровотечение */
export const ABILITY_SLASH: AbilityDef = {
  id: 'slash',
  nameRu: 'Рубящий удар',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 3,
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

/** Прицельный выстрел — урон от Ловкости + 20% Уязвимость */
export const ABILITY_BOW_SHOT: AbilityDef = {
  id: 'bow_shot',
  nameRu: 'Прицельный выстрел',
  damageType: 'ranged',
  cooldown: 1,
  manaCost: 3,
  range: 240,
  baseDamage: 16,
  statusEffect: 'vulnerability',
  statusChance: 0.2,
  description: 'Прицельный выстрел (урон от Ловкости). 20% шанс Уязвимости (+5% урон по цели).',
};

// ─── Длинный лук (обучает bandit_archer) ──────────────────────────────────

/** Дальний выстрел — урон от Ловкости, 20% шанс сброса кулдауна */
export const ABILITY_LONGBOW_SHOT: AbilityDef = {
  id: 'longbow_shot',
  nameRu: 'Дальний выстрел',
  damageType: 'ranged',
  effectType: 'reset_cooldown',
  resetCooldownChance: 0.2,
  cooldown: 1,
  manaCost: 0,
  range: 320,
  baseDamage: 20,
  description: 'Выстрел из длинного лука (урон от Ловкости). 50% шанс сброса кулдауна.',
};

// ─── Арбалет (обучает bandit_crossbow) ────────────────────────────────────

/** Пробивающий болт — урон от Ловкости, проходит сквозь до 3 целей, 20% Корни */
export const ABILITY_CROSSBOW_BOLT: AbilityDef = {
  id: 'crossbow_bolt',
  nameRu: 'Пробивающий болт',
  damageType: 'ranged',
  effectType: 'pierce',
  pierceCount: 3,
  cooldown: 1,
  manaCost: 0,
  range: 290,
  baseDamage: 24,
  statusEffect: 'root',
  statusChance: 0.2,
  description: 'Болт из арбалета (урон от Ловкости). Пробивает до 3 целей насквозь. 20% Корни.',
};

// ─── Копьё (обучает bandit_spear) ─────────────────────────────────────────

/** Выпад — урон от Силы, 30% шанс Отбрасывания */
export const ABILITY_SPEAR_THRUST: AbilityDef = {
  id: 'spear_thrust',
  nameRu: 'Выпад',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 3,
  range: 80,
  baseDamage: 20,
  statusEffect: 'knockback',
  statusChance: 0.3,
  description: 'Выпад копьём (урон от Силы). 30% шанс Отбрасывания на 180px.',
};

// ─── Молот (обучает bandit_brute) ─────────────────────────────────────────

/** Сокрушительный удар — урон от Силы, AoE, 20% шанс Сокращения брони */
export const ABILITY_HAMMER_STRIKE: AbilityDef = {
  id: 'hammer_strike',
  nameRu: 'Сокрушительный удар',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 3,
  range: 56,
  baseDamage: 36,
  isAoe: true,
  aoeRadius: 60,
  statusEffect: 'armor_reduce',
  statusChance: 0.2,
  description: 'Удар молотом (урон от Силы), AoE радиус 60. 20% шанс Сокрушения брони (-20%).',
};

/** Сильный удар — одиночный мощный удар, 20% шанс Пробития брони */
export const ABILITY_HAMMER_SMASH: AbilityDef = {
  id: 'hammer_smash',
  prerequisiteId: 'hammer_strike',
  nameRu: 'Сильный удар',
  damageType: 'melee',
  cooldown: 2,
  manaCost: 6,
  range: 56,
  baseDamage: 36,
  statusEffect: 'armor_break',
  statusChance: 0.2,
  description: 'Мощный удар молотом (урон от Силы). 20% шанс Пробития брони (-50%).',
};

// ─── Булава T2 ──────────────────────────────────────────────────────────────

/** Удар плашмя — 50% шанс Сбития концентрации */
export const ABILITY_MACE_BASH: AbilityDef = {
  id: 'mace_bash',
  prerequisiteId: 'mace_strike',
  nameRu: 'Удар плашмя',
  damageType: 'melee',
  cooldown: 2,
  manaCost: 0,
  range: 48,
  baseDamage: 22,
  statusEffect: 'interrupt',
  statusChance: 0.5,
  description: 'Удар плашмя (урон от Силы). 50% шанс Сбития концентрации.',
};

// ─── Двуручник T2 ───────────────────────────────────────────────────────────

/** Размах — конус AoE 80px 90°, 20% шанс Кровотечения на каждую цель */
export const ABILITY_SLASH_SWEEP: AbilityDef = {
  id: 'slash_sweep',
  prerequisiteId: 'slash',
  nameRu: 'Размах',
  damageType: 'melee',
  effectType: 'cone_aoe',
  coneAngle: 90,
  cooldown: 2,
  manaCost: 0,
  range: 80,
  baseDamage: 30,
  statusEffect: 'bleed',
  statusChance: 0.2,
  description: 'Размах двуручником (урон от Силы), конус 90°, радиус 80. 20% шанс Кровотечения на каждую цель.',
};

// ─── Копьё T2 ───────────────────────────────────────────────────────────────

/** Удар древком — ближний удар, 100% Отбрасывание */
export const ABILITY_SPEAR_BUTT: AbilityDef = {
  id: 'spear_butt',
  prerequisiteId: 'spear_thrust',
  nameRu: 'Удар древком',
  damageType: 'melee',
  cooldown: 2,
  manaCost: 0,
  range: 44,
  baseDamage: 20,
  statusEffect: 'knockback',
  statusChance: 1.0,
  description: 'Удар древком копья (урон от Силы), дальность 44. 100% Отбрасывание.',
};

// ─── Короткий лук T2 ────────────────────────────────────────────────────────

/** Выстрел с отскоком — выстрел + бросок назад 180px, 20% Уязвимость */
export const ABILITY_BOW_BACKSHOT: AbilityDef = {
  id: 'bow_backshot',
  prerequisiteId: 'bow_shot',
  nameRu: 'Выстрел с отскоком',
  damageType: 'ranged',
  effectType: 'dash_backward',
  dashDistance: 180,
  cooldown: 2,
  manaCost: 0,
  range: 240,
  baseDamage: 16,
  statusEffect: 'vulnerability',
  statusChance: 0.2,
  description: 'Выстрел (урон от Ловкости) + бросок назад 180px. 20% шанс Уязвимости.',
};

// ─── Длинный лук T2 ─────────────────────────────────────────────────────────

/** Дождь стрел — AoE, 20% шанс сброса кулдауна */
export const ABILITY_ARROW_RAIN: AbilityDef = {
  id: 'arrow_rain',
  prerequisiteId: 'longbow_shot',
  nameRu: 'Дождь стрел',
  damageType: 'ranged',
  effectType: 'reset_cooldown',
  resetCooldownChance: 0.2,
  cooldown: 2,
  manaCost: 0,
  range: 320,
  baseDamage: 20,
  isAoe: true,
  aoeRadius: 80,
  description: 'Дождь стрел (урон от Ловкости), AoE радиус 80. 20% шанс сброса кулдауна.',
};

// ─── Арбалет T2 ─────────────────────────────────────────────────────────────

/** Удерживающий болт — одиночный выстрел, 20% Корни */
export const ABILITY_CROSSBOW_SNARE: AbilityDef = {
  id: 'crossbow_snare',
  prerequisiteId: 'crossbow_bolt',
  nameRu: 'Удерживающий болт',
  damageType: 'ranged',
  cooldown: 2,
  manaCost: 6,
  range: 290,
  baseDamage: 24,
  statusEffect: 'root',
  statusChance: 0.2,
  description: 'Одиночный болт (урон от Ловкости). 20% шанс Корней (3 сек).',
};
