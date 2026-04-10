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
  baseDamage: 12,
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
  castTime: 2,
  manaCost: 6,
  range: 160,
  baseDamage: 10,
  statusEffect: 'poison',
  statusChance: 0.2,
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
  baseDamage: 12,
  statusEffect: 'interrupt',
  statusChance: 0.2,
  description: 'Удар булавой (урон от Силы). 20% шанс Сбития концентрации.',
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
  castTime: 1,
  manaCost: 6,
  range: 52,
  baseDamage: 12,
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
  baseDamage: 20,
  statusEffect: 'bleed',
  statusChance: 0.2,
  description: 'Рубящий удар двуручником (урон от Силы). 20% шанс Кровотечения.',
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
  baseDamage: 10,
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
  manaCost: 3,
  range: 320,
  baseDamage: 10,
  description: 'Выстрел из длинного лука (урон от Ловкости). 20% шанс сброса кулдауна.',
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
  manaCost: 3,
  range: 290,
  baseDamage: 10,
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
  baseDamage: 20,
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
  castTime: 1.5,
  manaCost: 6,
  range: 56,
  baseDamage: 20,
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
  castTime: 1,
  manaCost: 6,
  range: 48,
  baseDamage: 12,
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
  castTime: 1.5,
  manaCost: 6,
  range: 80,
  baseDamage: 20,
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
  castTime: 0.5,
  manaCost: 6,
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
  castTime: 0.5,
  manaCost: 6,
  range: 240,
  baseDamage: 10,
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
  castTime: 2,
  manaCost: 6,
  range: 320,
  baseDamage: 10,
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
  castTime: 1.5,
  manaCost: 6,
  range: 290,
  baseDamage: 10,
  statusEffect: 'root',
  statusChance: 0.2,
  description: 'Одиночный болт (урон от Ловкости). 20% шанс Корней (3 сек).',
};

// ─── Кастеты (обучает Монах) ─────────────────────────────────────────────

/** Хук — удар кастетами, шанс ошеломления */
export const ABILITY_HOOK: AbilityDef = {
  id: 'hook',
  nameRu: 'Хук',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 3,
  range: 36,
  baseDamage: 10,
  statusEffect: 'daze',
  statusChance: 0.2,
  description: 'Удар кастетами (урон от Ловкости). 20% ошеломление (+30% каст врага, 3 сек).',
};

/** Сбивающий удар — одиночный + понижение точности + ошеломление */
export const ABILITY_FIST_STRIKE: AbilityDef = {
  id: 'fist_strike',
  prerequisiteId: 'hook',
  nameRu: 'Сбивающий удар',
  damageType: 'melee',
  cooldown: 2,
  castTime: 0.75,
  manaCost: 6,
  range: 36,
  baseDamage: 12,
  statusEffect: 'accuracy_reduce',
  statusChance: 0.25,
  description: 'Сбивающий удар (урон от Ловкости). 25% понижение точности (−30%, 3 сек).',
};

// ═══════════════════════════════════════════════════════════════════════════════
// T3 ОРУЖЕЙНЫЕ СПОСОБНОСТИ (данные — механики требуют реализации в движке)
// ═══════════════════════════════════════════════════════════════════════════════

/** T3 Меч — Рассечение: если цель замедлена → +50% урона + следующий T1/T2 бесплатен */
export const ABILITY_SWORD_REND: AbilityDef = {
  id: 'sword_rend', prerequisiteId: 'double_strike',
  nameRu: 'Рассечение', damageType: 'melee',
  cooldown: 12, castTime: 1, manaCost: 8, range: 52, baseDamage: 28,
  conditionalBonusDmg: 1.5, conditionalOnStatus: 'slow', grantFreeNextCast: true,
  description: 'Если цель замедлена → +50% урона + следующий T1/T2 бесплатен.',
};

/** T3 Булава — Сотрясение: прерывание + следующий навык врага +10 сек КД */
export const ABILITY_MACE_CONCUSS: AbilityDef = {
  id: 'mace_concuss', prerequisiteId: 'mace_bash',
  nameRu: 'Сотрясение', damageType: 'melee',
  cooldown: 15, castTime: 1, manaCost: 8, range: 48, baseDamage: 24,
  statusEffect: 'interrupt', statusChance: 1.0,
  addEnemyCooldown: 10,
  description: 'Прерывание + следующий навык врага получает +10 сек КД.',
};

/** T3 Двуручник — Кровавый размах: кровотечение −75% хила + лечение 30% от урона */
export const ABILITY_BLOODY_SWEEP: AbilityDef = {
  id: 'bloody_sweep', prerequisiteId: 'slash_sweep',
  nameRu: 'Кровавый размах', damageType: 'melee',
  effectType: 'cone_aoe', coneAngle: 90,
  cooldown: 12, castTime: 1.5, manaCost: 10, range: 80, baseDamage: 32,
  statusEffect: 'bleed', statusChance: 1.0,
  lifestealPercent: 0.3,
  description: 'Конус 90°. Кровотечение −75% хила + лечение 30% от нанесённого урона.',
};

/** T3 Копьё — Бросок копья: отбрасывание 300px + доп урон при иммунитете */
export const ABILITY_SPEAR_THROW: AbilityDef = {
  id: 'spear_throw', prerequisiteId: 'spear_butt',
  nameRu: 'Бросок копья', damageType: 'ranged',
  cooldown: 12, castTime: 1, manaCost: 8, range: 200, baseDamage: 30,
  statusEffect: 'knockback', statusChance: 1.0,
  description: 'Бросок копья (дальний). Отбрасывание 300px. Доп урон если цель иммунна к отбросу.',
};

/** T3 Молот — Землетрясение: прыжок 200px, AoE, замедление + сокрушение брони */
export const ABILITY_EARTHQUAKE: AbilityDef = {
  id: 'earthquake', prerequisiteId: 'hammer_smash',
  nameRu: 'Землетрясение', damageType: 'melee',
  isAoe: true, aoeRadius: 80,
  leapDistance: 200,
  cooldown: 15, castTime: 1.5, manaCost: 10, range: 200, baseDamage: 28,
  statusEffect: 'slow', statusChance: 1.0,
  description: 'Прыжок 200px, AoE r80. 100% замедление + 30% сокрушение брони.',
};

/** T3 Кинжал — Смертельная доза: яд 10/сек + если 5 стаков → мгновенный урон 50 */
export const ABILITY_LETHAL_DOSE: AbilityDef = {
  id: 'lethal_dose', prerequisiteId: 'knife_throw',
  nameRu: 'Смертельная доза', damageType: 'melee',
  cooldown: 12, castTime: 0.5, manaCost: 8, range: 44, baseDamage: 22,
  statusEffect: 'poison', statusChance: 1.0,
  poisonBurstDamage: 50,
  description: 'Яд 10/сек. Если 5 стаков → мгновенный урон 50.',
};

/** T3 Кастеты — Очищающий удар: урон + 2 сек иммунитет к дебаффам */
export const ABILITY_CLEANSING_STRIKE: AbilityDef = {
  id: 'cleansing_strike', prerequisiteId: 'fist_strike',
  nameRu: 'Очищающий удар', damageType: 'melee',
  cooldown: 12, castTime: 0.5, manaCost: 6, range: 36, baseDamage: 18,
  cleanseSelf: true, debuffImmunityDuration: 2,
  description: 'Урон + снимает все дебаффы + 2 сек иммунитет к дебаффам.',
};

// ─── T3 Дальнобойные ─────────────────────────────────────────────────────────

/** T3 Кор. лук — Ловушка: ставит ловушку, при наступлении −80% скорости 5 сек */
export const ABILITY_TRAP: AbilityDef = {
  id: 'trap', prerequisiteId: 'bow_backshot',
  nameRu: 'Ловушка', damageType: 'ranged',
  cooldown: 15, castTime: 1.5, manaCost: 8, range: 60, baseDamage: 0,
  isAoe: true, aoeRadius: 60,
  description: 'Ставит ловушку (4 сек). При наступлении: −80% скорость (5 сек), r60.',
};

/** T3 Дл. лук — Мощный выстрел: игнорирует броню + сброс КД */
export const ABILITY_POWER_SHOT: AbilityDef = {
  id: 'power_shot', prerequisiteId: 'arrow_rain',
  nameRu: 'Мощный выстрел', damageType: 'ranged',
  effectType: 'reset_cooldown', resetCooldownChance: 0.2,
  ignoreArmor: true,
  cooldown: 15, castTime: 2, manaCost: 10, range: 320, baseDamage: 24,
  description: 'Полностью игнорирует броню + 20% сброс КД.',
};

/** T3 Арбалет — Болт адреналина: ускорение КД умений от Ловкости союзников на 20% (6 сек) */
export const ABILITY_SUPPORT_BOLT: AbilityDef = {
  id: 'support_bolt', prerequisiteId: 'crossbow_snare',
  nameRu: 'Болт адреналина', damageType: 'ranged',
  cooldown: 15, castTime: 1, manaCost: 12, range: 200, baseDamage: 0,
  isAoe: true, aoeRadius: 200,
  description: 'Ускорение КД умений от Ловкости всех союзников в r200 на 20% (6 сек).',
};

// ─── Универсальные навыки ────────────────────────────────────────────────────

/** Фокусировка: следующая атака не может быть заблокирована */
export const ABILITY_FOCUS: AbilityDef = {
  id: 'focus',
  nameRu: 'Фокусировка', school: 'neutral', damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 10, manaCost: 3, range: 0, baseDamage: 0,
  description: 'Следующая атака не может быть заблокирована.',
};

/** Боевой клич: союзники рядом +10% урона на 6 сек */
export const ABILITY_WAR_CRY: AbilityDef = {
  id: 'war_cry',
  nameRu: 'Боевой клич', school: 'neutral', damageType: 'melee',
  cooldown: 30, manaCost: 6, range: 0, baseDamage: 0,
  isAoe: true, aoeRadius: 200,
  description: 'Союзники в r200 +10% урона на 6 сек.',
};
