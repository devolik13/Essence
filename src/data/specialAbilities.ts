import { AbilityDef } from '../types/abilities';
import { WeaponType } from '../types/bodies';

// ─── Гоблин ────────────────────────────────────────────────────────────────

/** Укол — удар кинжалом от Ловкости, гарантированно 1 стак яда */
export const ABILITY_STING: AbilityDef = {
  id: 'sting',
  nameRu: 'Sting',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 5,
  range: 44,
  baseDamage: 12,
  requiredWeapons: [WeaponType.Dagger],
  description: 'Укол кинжалом (урон от Ловкости). Эффект оружия: яд.',
};

// ─── Одноручный меч (обучает Волк) ─────────────────────────────────────────

/** Удар мечом — урон от Силы + Замедление */
export const ABILITY_SWORD_STRIKE: AbilityDef = {
  id: 'sword_strike',
  nameRu: 'Sword Strike',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 5,
  range: 52,
  baseDamage: 12,
  requiredWeapons: [WeaponType.Sword],
  description: 'Удар мечом (урон от Силы). Эффект оружия: замедление.',
};

// ─── Кинжал T2 ─────────────────────────────────────────────────────────────

/** Бросок кинжала — дистанционный удар от Ловкости + гарантированный яд */
export const ABILITY_KNIFE_THROW: AbilityDef = {
  id: 'knife_throw',
  prerequisiteId: 'sting',
  nameRu: 'Knife Throw',
  damageType: 'ranged',
  cooldown: 2,
  castTime: 2,
  manaCost: 10,
  range: 160,
  baseDamage: 10,
  requiredWeapons: [WeaponType.Dagger],
  description: 'Бросок кинжала (урон от Ловкости, дальность 160). Эффект оружия: яд.',
};

// ─── Булава (обучает Медведь) ───────────────────────────────────────────────

/** Дробящий удар — урон от Силы + Укрепление (стаки брони) */
export const ABILITY_MACE_STRIKE: AbilityDef = {
  id: 'mace_strike',
  nameRu: 'Crushing Blow',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 5,
  range: 48,
  baseDamage: 12,
  requiredWeapons: [WeaponType.Mace],
  description: 'Удар булавой (урон от Силы). Эффект оружия: укрепление (+3 Armor/стак).',
};

// ─── Меч T2 ────────────────────────────────────────────────────────────────

/** Двойной удар — 2 удара, полный урон, замедление на каждый */
export const ABILITY_DOUBLE_STRIKE: AbilityDef = {
  id: 'double_strike',
  prerequisiteId: 'sword_strike',
  nameRu: 'Double Strike',
  damageType: 'melee',
  effectType: 'multi_hit',
  hitCount: 2,
  cooldown: 2,
  castTime: 1,
  manaCost: 10,
  range: 52,
  baseDamage: 12,
  requiredWeapons: [WeaponType.Sword],
  description: 'Два быстрых удара мечом (урон от Силы). Эффект оружия: замедление на каждый удар.',
};

// ─── Двуручный меч (обучает Орк) ───────────────────────────────────────────

/** Рубящий удар — урон от Силы + Кровотечение */
export const ABILITY_SLASH: AbilityDef = {
  id: 'slash',
  nameRu: 'Slash',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 5,
  range: 60,
  baseDamage: 20,
  requiredWeapons: [WeaponType.Greatsword],
  description: 'Рубящий удар двуручником (урон от Силы). Эффект оружия: кровотечение.',
};

// ─── Короткий лук (обучает Разведчик) ──────────────────────────────────────

/** Прицельный выстрел — урон от Ловкости + 20% Уязвимость */
export const ABILITY_BOW_SHOT: AbilityDef = {
  id: 'bow_shot',
  nameRu: 'Aimed Shot',
  damageType: 'ranged',
  requiredWeapons: [WeaponType.ShortBow],
  cooldown: 1,
  manaCost: 5,
  range: 240,
  baseDamage: 10,
  description: 'Прицельный выстрел (урон от Ловкости). Эффект оружия: уязвимость.',
};

// ─── Длинный лук (обучает bandit_archer) ──────────────────────────────────

/** Дальний выстрел — урон от Ловкости, 20% шанс сброса кулдауна */
export const ABILITY_LONGBOW_SHOT: AbilityDef = {
  id: 'longbow_shot',
  nameRu: 'Long Shot',
  damageType: 'ranged',
  effectType: 'reset_cooldown',
  resetCooldownChance: 0.2,
  cooldown: 1,
  manaCost: 5,
  range: 320,
  baseDamage: 10,
  requiredWeapons: [WeaponType.LongBow],
  description: 'Выстрел из длинного лука (урон от Ловкости). 20% шанс сброса кулдауна.',
};

// ─── Арбалет (обучает bandit_crossbow) ────────────────────────────────────

/** Пробивающий болт — урон от Ловкости, проходит сквозь до 3 целей, 20% Корни */
export const ABILITY_CROSSBOW_BOLT: AbilityDef = {
  id: 'crossbow_bolt',
  nameRu: 'Piercing Bolt',
  damageType: 'ranged',
  effectType: 'pierce',
  pierceCount: 3,
  cooldown: 1,
  manaCost: 5,
  range: 290,
  baseDamage: 10,
  requiredWeapons: [WeaponType.Crossbow],
  description: 'Болт из арбалета (урон от Ловкости). Пробивает до 3 целей. Эффект оружия: ослабление.',
};

// ─── Копьё (обучает bandit_spear) ─────────────────────────────────────────

/** Выпад — урон от Силы, 30% шанс Отбрасывания */
export const ABILITY_SPEAR_THRUST: AbilityDef = {
  id: 'spear_thrust',
  nameRu: 'Thrust',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 5,
  range: 80,
  baseDamage: 20,
  requiredWeapons: [WeaponType.Spear],
  description: 'Выпад копьём (урон от Силы). Эффект оружия: отбрасывание.',
};

// ─── Молот (обучает bandit_brute) ─────────────────────────────────────────

/** Сокрушительный удар — урон от Силы, AoE, 20% шанс Сокращения брони */
export const ABILITY_HAMMER_STRIKE: AbilityDef = {
  id: 'hammer_strike',
  nameRu: 'Crushing Strike',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 5,
  range: 56,
  baseDamage: 20,
  isAoe: true,
  aoeRadius: 60,
  requiredWeapons: [WeaponType.Hammer],
  description: 'Удар молотом (урон от Силы), AoE радиус 60. Эффект оружия: сокрушение брони.',
};

/** Сильный удар — одиночный мощный удар, 20% шанс Пробития брони */
export const ABILITY_HAMMER_SMASH: AbilityDef = {
  id: 'hammer_smash',
  prerequisiteId: 'hammer_strike',
  nameRu: 'Heavy Smash',
  damageType: 'melee',
  cooldown: 2,
  castTime: 1.5,
  manaCost: 10,
  range: 56,
  baseDamage: 20,
  statusEffect: 'armor_break',
  statusChance: 0.2,
  requiredWeapons: [WeaponType.Hammer],
  description: 'Мощный удар молотом (урон от Силы). 20% Пробитие брони −50% (перекрывает оружейный).',
};

// ─── Булава T2 ──────────────────────────────────────────────────────────────

/** Стойкий удар — урон + временные HP (щит) */
export const ABILITY_MACE_BASH: AbilityDef = {
  id: 'mace_bash',
  prerequisiteId: 'mace_strike',
  nameRu: 'Sturdy Strike',
  damageType: 'melee',
  cooldown: 2,
  castTime: 1,
  manaCost: 10,
  range: 48,
  baseDamage: 12,
  grantTempHP: 25,
  tempHPDuration: 6,
  requiredWeapons: [WeaponType.Mace],
  description: 'Удар булавой (урон от Силы) + щит 25 временных HP на 6 сек.',
};

// ─── Двуручник T2 ───────────────────────────────────────────────────────────

/** Размах — конус AoE 80px 90°, 20% шанс Кровотечения на каждую цель */
export const ABILITY_SLASH_SWEEP: AbilityDef = {
  id: 'slash_sweep',
  prerequisiteId: 'slash',
  nameRu: 'Sweep',
  damageType: 'melee',
  effectType: 'cone_aoe',
  coneAngle: 90,
  cooldown: 2,
  castTime: 1.5,
  manaCost: 10,
  range: 80,
  baseDamage: 20,
  requiredWeapons: [WeaponType.Greatsword],
  description: 'Размах двуручником (урон от Силы), конус 90°, радиус 80. Эффект оружия: кровотечение.',
};

// ─── Копьё T2 ───────────────────────────────────────────────────────────────

/** Удар древком — ближний удар, 100% Отбрасывание */
export const ABILITY_SPEAR_BUTT: AbilityDef = {
  id: 'spear_butt',
  prerequisiteId: 'spear_thrust',
  nameRu: 'Butt Strike',
  damageType: 'melee',
  cooldown: 2,
  castTime: 0.5,
  manaCost: 10,
  range: 44,
  baseDamage: 20,
  statusEffect: 'knockback',
  statusChance: 1.0,
  requiredWeapons: [WeaponType.Spear],
  description: 'Удар древком копья (урон от Силы), дальность 44. 100% Отбрасывание.',
};

// ─── Короткий лук T2 ────────────────────────────────────────────────────────

/** Выстрел с отскоком — выстрел + бросок назад 180px, 20% Уязвимость */
export const ABILITY_BOW_BACKSHOT: AbilityDef = {
  id: 'bow_backshot',
  prerequisiteId: 'bow_shot',
  nameRu: 'Backshot',
  damageType: 'ranged',
  effectType: 'dash_backward',
  dashDistance: 180,
  requiredWeapons: [WeaponType.ShortBow],
  cooldown: 2,
  castTime: 0.5,
  manaCost: 10,
  range: 240,
  baseDamage: 10,
  description: 'Выстрел (урон от Ловкости) + бросок назад 180px. Эффект оружия: уязвимость.',
};

// ─── Длинный лук T2 ─────────────────────────────────────────────────────────

/** Дождь стрел — AoE, 20% шанс сброса кулдауна */
export const ABILITY_ARROW_RAIN: AbilityDef = {
  id: 'arrow_rain',
  prerequisiteId: 'longbow_shot',
  nameRu: 'Arrow Rain',
  damageType: 'ranged',
  effectType: 'reset_cooldown',
  resetCooldownChance: 0.2,
  cooldown: 2,
  castTime: 2,
  manaCost: 10,
  range: 320,
  baseDamage: 10,
  isAoe: true,
  aoeRadius: 80,
  requiredWeapons: [WeaponType.LongBow],
  description: 'Дождь стрел (урон от Ловкости), AoE радиус 80. 20% шанс сброса кулдауна.',
};

// ─── Арбалет T2 ─────────────────────────────────────────────────────────────

/** Удерживающий болт — одиночный выстрел, корни (свой эффект) */
export const ABILITY_CROSSBOW_SNARE: AbilityDef = {
  id: 'crossbow_snare',
  prerequisiteId: 'crossbow_bolt',
  nameRu: 'Snare Bolt',
  damageType: 'ranged',
  cooldown: 2,
  castTime: 1.5,
  manaCost: 10,
  range: 290,
  baseDamage: 10,
  statusEffect: 'root',
  statusChance: 0.2,
  requiredWeapons: [WeaponType.Crossbow],
  description: 'Одиночный болт (урон от Ловкости). 20% шанс Корни (3 сек, блок движения).',
};

// ─── Кастеты (обучает Монах) ─────────────────────────────────────────────

/** Хук — удар кастетами, шанс ошеломления */
export const ABILITY_HOOK: AbilityDef = {
  id: 'hook',
  nameRu: 'Hook',
  damageType: 'melee',
  cooldown: 1,
  manaCost: 5,
  range: 36,
  baseDamage: 10,
  requiredWeapons: [WeaponType.Fists],
  description: 'Удар кастетами (урон от Ловкости). Эффект оружия: ошеломление.',
};

/** Сбивающий удар — одиночный + понижение точности + ошеломление */
export const ABILITY_FIST_STRIKE: AbilityDef = {
  id: 'fist_strike',
  prerequisiteId: 'hook',
  nameRu: 'Disorienting Blow',
  damageType: 'melee',
  cooldown: 2,
  castTime: 0.75,
  manaCost: 10,
  range: 36,
  baseDamage: 12,
  statusEffect: 'accuracy_reduce',
  statusChance: 0.25,
  requiredWeapons: [WeaponType.Fists],
  description: 'Сбивающий удар (урон от Ловкости). 25% понижение точности (−30%, 3 сек).',
};

// ═══════════════════════════════════════════════════════════════════════════════
// T3 ОРУЖЕЙНЫЕ СПОСОБНОСТИ (данные — механики требуют реализации в движке)
// ═══════════════════════════════════════════════════════════════════════════════

/** T3 Меч — Рассечение: если цель замедлена → +50% урона + следующий T1/T2 бесплатен */
export const ABILITY_SWORD_REND: AbilityDef = {
  id: 'sword_rend', prerequisiteId: 'double_strike',
  nameRu: 'Rend', damageType: 'melee',
  cooldown: 12, castTime: 1, manaCost: 15, range: 52, baseDamage: 28,
  conditionalBonusDmg: 1.5, conditionalOnStatus: 'slow', grantFreeNextCast: true,
  requiredWeapons: [WeaponType.Sword],
  description: 'Если цель замедлена → +50% урона + следующий T1/T2 бесплатен.',
};

/** T3 Булава — Сотрясение: следующий навык врага +10 сек КД */
export const ABILITY_MACE_CONCUSS: AbilityDef = {
  id: 'mace_concuss', prerequisiteId: 'mace_bash',
  nameRu: 'Concussion', damageType: 'melee',
  cooldown: 15, castTime: 1, manaCost: 15, range: 48, baseDamage: 24,
  statusEffect: 'concussion', statusChance: 1.0,
  requiredWeapons: [WeaponType.Mace],
  description: 'Урон + дебафф Сотрясение (5 сек): следующая абилка врага получает +10 сек КД.',
};

/** T3 Двуручник — Кровавый размах: кровотечение −75% хила + лечение 30% от урона */
export const ABILITY_BLOODY_SWEEP: AbilityDef = {
  id: 'bloody_sweep', prerequisiteId: 'slash_sweep',
  nameRu: 'Bloody Sweep', damageType: 'melee',
  effectType: 'cone_aoe', coneAngle: 90,
  cooldown: 12, castTime: 1.5, manaCost: 15, range: 80, baseDamage: 32,
  statusEffect: 'bleed', statusChance: 1.0,
  lifestealPercent: 0.3,
  requiredWeapons: [WeaponType.Greatsword],
  description: 'Конус 90°. Кровотечение −75% хила + лечение 30% от нанесённого урона.',
};

/** T3 Копьё — Бросок копья: отбрасывание 300px + доп урон при иммунитете */
export const ABILITY_SPEAR_THROW: AbilityDef = {
  id: 'spear_throw', prerequisiteId: 'spear_butt',
  nameRu: 'Spear Throw', damageType: 'ranged',
  cooldown: 12, castTime: 1, manaCost: 15, range: 200, baseDamage: 30,
  requiredWeapons: [WeaponType.Spear],
  description: 'Бросок копья (дальний, урон от Ловкости). Эффект оружия: отбрасывание.',
};

/** T3 Молот — Землетрясение: прыжок 200px, AoE, замедление 2 сек + оружейное сокрушение брони */
export const ABILITY_EARTHQUAKE: AbilityDef = {
  id: 'earthquake', prerequisiteId: 'hammer_smash',
  nameRu: 'Earthquake', damageType: 'melee',
  isAoe: true, aoeRadius: 80,
  leapDistance: 200,
  cooldown: 15, castTime: 1.5, manaCost: 15, range: 200, baseDamage: 28,
  statusEffect: 'slow', statusChance: 1.0,
  alsoApplyWeaponEffect: true,
  requiredWeapons: [WeaponType.Hammer],
  description: 'Прыжок 200px, AoE r80. Замедление 2 сек + сокрушение брони от оружия.',
};

/** T3 Кинжал — Смертельная доза: яд 10/сек + если 5 стаков → мгновенный урон 50 */
export const ABILITY_LETHAL_DOSE: AbilityDef = {
  id: 'lethal_dose', prerequisiteId: 'knife_throw',
  nameRu: 'Lethal Dose', damageType: 'melee',
  cooldown: 12, castTime: 0.5, manaCost: 15, range: 44, baseDamage: 22,
  statusEffect: 'poison', statusChance: 1.0,
  poisonBurstDamage: 50,
  requiredWeapons: [WeaponType.Dagger],
  description: 'Яд 10/сек. Если 5 стаков → мгновенный урон 50.',
};

/** T3 Кастеты — Очищающий удар: урон + снимает 1 случайный дебафф + 2 сек иммунитет */
export const ABILITY_CLEANSING_STRIKE: AbilityDef = {
  id: 'cleansing_strike', prerequisiteId: 'fist_strike',
  nameRu: 'Cleansing Strike', damageType: 'melee',
  cooldown: 12, castTime: 0.5, manaCost: 15, range: 36, baseDamage: 18,
  cleanseCount: 1, debuffImmunityDuration: 2,
  requiredWeapons: [WeaponType.Fists],
  description: 'Урон + снимает 1 случайный дебафф + 2 сек иммунитет к новым дебаффам.',
};

// ─── T3 Дальнобойные ─────────────────────────────────────────────────────────

/** T3 Кор. лук — Ловушка: ставит ловушку, при наступлении −80% скорости 5 сек + уязвимость 40% */
export const ABILITY_TRAP: AbilityDef = {
  id: 'trap', prerequisiteId: 'bow_backshot',
  nameRu: 'Trap', damageType: 'ranged',
  cooldown: 15, castTime: 1.5, manaCost: 15, range: 60, baseDamage: 0,
  isAoe: true, aoeRadius: 60,
  alsoApplyWeaponEffect: true, weaponEffectChanceMult: 2,
  requiredWeapons: [WeaponType.ShortBow],
  description: 'Ставит ловушку (4 сек). При наступлении: −80% скорость (5 сек), r60. Эффект оружия: уязвимость (×2 шанс = 40%).',
};

/** T3 Дл. лук — Мощный выстрел: игнорирует броню + сброс КД */
export const ABILITY_POWER_SHOT: AbilityDef = {
  id: 'power_shot', prerequisiteId: 'arrow_rain',
  nameRu: 'Power Shot', damageType: 'ranged',
  effectType: 'reset_cooldown', resetCooldownChance: 0.2,
  ignoreArmor: true,
  cooldown: 15, castTime: 2, manaCost: 15, range: 320, baseDamage: 24,
  requiredWeapons: [WeaponType.LongBow],
  description: 'Полностью игнорирует броню + 20% сброс КД.',
};

/** T3 Арбалет — Болт адреналина: ускорение КД умений от Ловкости союзников на 20% (6 сек) */
export const ABILITY_SUPPORT_BOLT: AbilityDef = {
  id: 'support_bolt', prerequisiteId: 'crossbow_snare',
  nameRu: 'Adrenaline Bolt', damageType: 'ranged',
  cooldown: 15, castTime: 1, manaCost: 15, range: 200, baseDamage: 0,
  isAoe: true, aoeRadius: 200,
  requiredWeapons: [WeaponType.Crossbow],
  description: 'Ускорение КД умений от Ловкости всех союзников в r200 на 20% (6 сек).',
};

// ─── Молот — дополнительные ─────────────────────────────────────────────────

/** Фокусировка: следующая атака 100% попадает */
export const ABILITY_FOCUS: AbilityDef = {
  id: 'focus',
  nameRu: 'Focus', damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'focus',
  cooldown: 10, manaCost: 5, range: 0, baseDamage: 0,
  requiredWeapons: [WeaponType.Hammer],
  description: 'Следующая атака 100% попадает (игнорирует блок и уклонение).',
};

/** Боевой марш: союзники в r200 +50% скорости на 5 сек */
export const ABILITY_BATTLE_MARCH: AbilityDef = {
  id: 'battle_march',
  nameRu: 'Battle March', damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 20, castTime: 1, manaCost: 10, range: 0, baseDamage: 0,
  isAoe: true, aoeRadius: 200,
  statusEffect: 'acceleration',
  requiredWeapons: [WeaponType.Hammer],
  description: 'Союзники в r200 получают +50% скорости на 5 сек.',
};

// ─── Двуручник — дополнительные ─────────────────────────────────────────────

/** Боевой клич: союзники в r200 +10% урона на 6 сек */
export const ABILITY_WAR_CRY: AbilityDef = {
  id: 'war_cry',
  nameRu: 'War Cry', damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'damage_boost',
  cooldown: 30, manaCost: 10, range: 0, baseDamage: 0,
  isAoe: true, aoeRadius: 200,
  requiredWeapons: [WeaponType.Greatsword],
  description: 'Союзники в r200 +10% урона на 6 сек.',
};

/** Кручение — зона урона вокруг себя 3 сек, следует за игроком */
export const ABILITY_WHIRLWIND: AbilityDef = {
  id: 'whirlwind',
  nameRu: 'Whirlwind', damageType: 'melee',
  effectType: 'ground_zone',
  cooldown: 15, castTime: 0, manaCost: 10, range: 0, baseDamage: 0,
  isAoe: true, aoeRadius: 60,
  zoneDuration: 3, zoneDps: 15,
  requiredWeapons: [WeaponType.Greatsword],
  description: 'Кручение двуручником 3 сек. Наносит урон всем врагам вокруг (r60).',
};

// ─── Меч — дополнительные ───────────────────────────────────────────────────

/** Прикрытие: союзники в r200 блокируют следующую 1 атаку */
export const ABILITY_COVER: AbilityDef = {
  id: 'cover',
  nameRu: 'Cover', damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 20, castTime: 1, manaCost: 10, range: 0, baseDamage: 0,
  isAoe: true, aoeRadius: 200,
  statusEffect: 'block_next',
  requiredWeapons: [WeaponType.Sword],
  description: 'Союзники в r200 блокируют следующую 1 атаку (10 сек).',
};

/** Щитовая стойка: −30% скорость + +15 Armor на 5 сек (только со щитом) */
export const ABILITY_SHIELD_STANCE: AbilityDef = {
  id: 'shield_stance',
  nameRu: 'Shield Stance', damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'shield_stance',
  cooldown: 15, manaCost: 10, range: 0, baseDamage: 0,
  requiredWeapons: [WeaponType.Sword],
  description: 'Замедление −30% на 5 сек, но +15 Armor. Только для меча (со щитом).',
};

// ─── Кинжал — дополнительные ────────────────────────────────────────────────

/** Бросок к цели: прыжок к врагу (макс 150px) */
export const ABILITY_SHADOW_STEP: AbilityDef = {
  id: 'shadow_step',
  nameRu: 'Shadow Step', damageType: 'melee',
  cooldown: 10, manaCost: 10, range: 300, baseDamage: 8,
  leapDistance: 150,
  requiredWeapons: [WeaponType.Dagger],
  description: 'Прыжок к цели (макс 150px).',
};

/** Fortune's Blessing: группа +20% удачи на 5 сек */
export const ABILITY_FORTUNE: AbilityDef = {
  id: 'fortune',
  nameRu: "Fortune's Blessing", damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'luck_group_buff',
  cooldown: 20, castTime: 1, manaCost: 10, range: 0, baseDamage: 0,
  targetParty: true,
  requiredWeapons: [WeaponType.Dagger],
  description: 'All party members gain +20% Luck for 5 sec.',
};

// ─── Булава — дополнительные ─────────────────────────────────────────────────

/** Твёрдая стойка: иммунитет к отбрасыванию на 5 сек */
export const ABILITY_FIRM_STANCE: AbilityDef = {
  id: 'firm_stance',
  nameRu: 'Firm Stance', damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'knockback_immune',
  cooldown: 15, manaCost: 5, range: 0, baseDamage: 0,
  requiredWeapons: [WeaponType.Mace],
  description: 'Иммунитет к отбрасыванию на 5 сек.',
};

/** Iron Skin: вся группа +10% Armor на 6 сек */
export const ABILITY_IRON_SKIN: AbilityDef = {
  id: 'iron_skin',
  nameRu: 'Iron Skin', damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'armor_group_buff',
  cooldown: 20, castTime: 1, manaCost: 10, range: 0, baseDamage: 0,
  targetParty: true,
  requiredWeapons: [WeaponType.Mace],
  description: 'All party members gain +10% Armor for 6 sec.',
};

// ─── Копьё — дополнительные ──────────────────────────────────────────────────

/** Непоколебимость: иммунитет к оглушению на 5 сек */
export const ABILITY_UNSHAKEABLE: AbilityDef = {
  id: 'unshakeable',
  nameRu: 'Unshakeable', damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'stun_immune',
  cooldown: 15, manaCost: 5, range: 0, baseDamage: 0,
  requiredWeapons: [WeaponType.Spear],
  description: 'Иммунитет к оглушению на 5 сек.',
};

/** Таран: рывок 200px вперёд, отталкивает врагов на пути */
export const ABILITY_RAM: AbilityDef = {
  id: 'ram',
  nameRu: 'Ram', damageType: 'melee',
  effectType: 'dash_forward',
  dashDistance: 200,
  cooldown: 12, manaCost: 10, range: 0, baseDamage: 0,
  statusEffect: 'knockback', statusChance: 1.0,
  requiredWeapons: [WeaponType.Spear],
  description: 'Рывок вперёд на 200px. Отталкивает всех врагов на пути без урона.',
};

// ─── Короткий лук — дополнительные ──────────────────────────────────────────

/** Чистый удар: +30% урона если нет зачарования */
export const ABILITY_PURE_STRIKE: AbilityDef = {
  id: 'pure_strike',
  nameRu: 'Pure Strike', damageType: 'melee',
  cooldown: 6, manaCost: 10, range: 60, baseDamage: 12,
  bonusDamageIfNoEnchant: 0.3,
  requiredWeapons: [WeaponType.ShortBow],
  description: 'Удар. +30% урона если нет активного зачарования.',
};

/** Огненная ловушка: зона r40, при попадании горение */
export const ABILITY_FIRE_TRAP: AbilityDef = {
  id: 'fire_trap',
  nameRu: 'Fire Trap', damageType: 'melee',
  effectType: 'ground_zone',
  cooldown: 15, castTime: 1, manaCost: 10, range: 150, baseDamage: 0,
  isAoe: true, aoeRadius: 40,
  zoneDuration: 10, zoneDps: 0,
  statusEffect: 'burn', statusChance: 1.0,
  requiredWeapons: [WeaponType.ShortBow],
  description: 'Ставит ловушку (r40, 10 сек). Враг наступив получает горение.',
};

/** Ядовитая ловушка: зона r40, при попадании яд */
export const ABILITY_POISON_TRAP: AbilityDef = {
  id: 'poison_trap',
  nameRu: 'Poison Trap', damageType: 'melee',
  effectType: 'ground_zone',
  cooldown: 15, castTime: 1, manaCost: 10, range: 150, baseDamage: 0,
  isAoe: true, aoeRadius: 40,
  zoneDuration: 10, zoneDps: 0,
  statusEffect: 'poison', statusChance: 1.0,
  requiredWeapons: [WeaponType.ShortBow],
  description: 'Ставит ловушку (r40, 10 сек). Враг наступив получает яд.',
};

// ─── Длинный лук — дополнительные ────────────────────────────────────────────

/** Разоблачение: +10% урона за каждый бафф на противнике */
export const ABILITY_EXPOSE: AbilityDef = {
  id: 'expose',
  nameRu: 'Expose', damageType: 'melee',
  cooldown: 8, manaCost: 10, range: 60, baseDamage: 12,
  bonusDamagePercentPerTargetBuff: 0.1,
  requiredWeapons: [WeaponType.LongBow],
  description: 'Удар. +10% урона за каждый бафф на противнике.',
};

/** Закалка: −30% входящего дальнего урона на 5 сек */
export const ABILITY_RANGED_RESIST: AbilityDef = {
  id: 'ranged_resist',
  nameRu: 'Hardening', damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'ranged_resist',
  cooldown: 12, manaCost: 10, range: 0, baseDamage: 0,
  requiredWeapons: [WeaponType.LongBow],
  description: '−30% входящего дальнего урона на 5 сек.',
};

// ─── Арбалет — дополнительные ────────────────────────────────────────────────

/** Добивание: +50% урона если у цели < 50% HP */
export const ABILITY_EXECUTE: AbilityDef = {
  id: 'execute',
  nameRu: 'Execute', damageType: 'melee',
  cooldown: 8, manaCost: 10, range: 60, baseDamage: 12,
  executeBonusPercent: 0.5,
  requiredWeapons: [WeaponType.Crossbow],
  description: 'Удар. +50% урона если у цели менее 50% HP.',
};

/** Рикошет: болт отскакивает к ближайшей цели в r150 */
export const ABILITY_RICOCHET: AbilityDef = {
  id: 'ricochet',
  nameRu: 'Ricochet', damageType: 'ranged',
  effectType: 'chain_lightning',
  chainRadius: 150, chainCount: 1,
  cooldown: 8, manaCost: 10, range: 280, baseDamage: 10,
  requiredWeapons: [WeaponType.Crossbow],
  description: 'Болт попадает в цель и отскакивает к ближайшему врагу в r150.',
};

// ─── Кастеты — дополнительные ────────────────────────────────────────────────

/** Манёвр: союзники в r200 +10 Уклонение на 3 сек */
export const ABILITY_MANEUVER: AbilityDef = {
  id: 'maneuver',
  nameRu: 'Maneuver', damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 15, castTime: 1, manaCost: 10, range: 0, baseDamage: 0,
  isAoe: true, aoeRadius: 200,
  statusEffect: 'evasion_boost',
  requiredWeapons: [WeaponType.Fists],
  description: 'Союзники в r200 получают +10 Уклонение на 3 сек.',
};

/** Серия ударов: 3 быстрых удара кастетами */
export const ABILITY_COMBO: AbilityDef = {
  id: 'combo',
  nameRu: 'Combo', damageType: 'melee',
  effectType: 'multi_hit',
  hitCount: 3,
  cooldown: 8, manaCost: 10, range: 36, baseDamage: 10,
  requiredWeapons: [WeaponType.Fists],
  description: 'Серия из 3 быстрых ударов кастетами. Эффект оружия на каждый удар.',
};

export const WEAPON_ABILITIES: AbilityDef[] = [
  // Кинжал
  ABILITY_STING, ABILITY_KNIFE_THROW, ABILITY_LETHAL_DOSE,
  ABILITY_SHADOW_STEP, ABILITY_FORTUNE,
  // Меч
  ABILITY_SWORD_STRIKE, ABILITY_DOUBLE_STRIKE, ABILITY_SWORD_REND,
  ABILITY_COVER, ABILITY_SHIELD_STANCE,
  // Булава
  ABILITY_MACE_STRIKE, ABILITY_MACE_BASH, ABILITY_MACE_CONCUSS,
  ABILITY_FIRM_STANCE, ABILITY_IRON_SKIN,
  // Двуручник
  ABILITY_SLASH, ABILITY_SLASH_SWEEP, ABILITY_BLOODY_SWEEP,
  ABILITY_WHIRLWIND, ABILITY_WAR_CRY,
  // Копьё
  ABILITY_SPEAR_THRUST, ABILITY_SPEAR_BUTT, ABILITY_SPEAR_THROW,
  ABILITY_UNSHAKEABLE, ABILITY_RAM,
  // Молот
  ABILITY_HAMMER_STRIKE, ABILITY_HAMMER_SMASH, ABILITY_EARTHQUAKE,
  ABILITY_FOCUS, ABILITY_BATTLE_MARCH,
  // Короткий лук
  ABILITY_BOW_SHOT, ABILITY_BOW_BACKSHOT, ABILITY_TRAP,
  ABILITY_PURE_STRIKE, ABILITY_FIRE_TRAP, ABILITY_POISON_TRAP,
  // Длинный лук
  ABILITY_LONGBOW_SHOT, ABILITY_ARROW_RAIN, ABILITY_POWER_SHOT,
  ABILITY_EXPOSE, ABILITY_RANGED_RESIST,
  // Арбалет
  ABILITY_CROSSBOW_BOLT, ABILITY_CROSSBOW_SNARE, ABILITY_SUPPORT_BOLT,
  ABILITY_EXECUTE, ABILITY_RICOCHET,
  // Кастеты
  ABILITY_HOOK, ABILITY_FIST_STRIKE, ABILITY_CLEANSING_STRIKE,
  ABILITY_MANEUVER, ABILITY_COMBO,
];
