/**
 * Neutral school spells — утилита без элемента.
 * T1: 5 маны | T2: 10 маны
 */
import { AbilityDef } from '../types/abilities';
import { WeaponType } from '../types/bodies';

// ─── NEUTRAL SCHOOL ────────────────────────────────────────────────────────────

/** T1 — Ускорение: самобафф +50% скорости на 5 сек */
export const MOB_NEUTRAL_T1: AbilityDef = {
  id: 'acceleration',
  nameRu: 'Acceleration',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'acceleration',
  castTime: 1,
  cooldown: 15,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенно даёт +50% скорости на 5 сек.',
};

/** T2 — Лечение: исцеляет себя, зависит от Интеллекта */
export const MOB_NEUTRAL_HEAL: AbilityDef = {
  id: 'neutral_heal',
  nameRu: 'Heal',
  school: 'neutral',
  damageType: 'magic',
  effectType: 'self_heal',
  castTime: 1.5,
  cooldown: 8,
  manaCost: 10,
  range: 0,
  baseDamage: 20,
  description: 'Лечит себя на 20 × (1 + Интеллект/100) HP. Каст 1.5 сек.',
};

/** T2 — Рывок: мгновенный бросок вперёд на 180px */
export const MOB_NEUTRAL_T2: AbilityDef = {
  id: 'dash',
  prerequisiteId: 'acceleration',
  nameRu: 'Dash',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'dash_forward',
  dashDistance: 180,
  cooldown: 10,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: 'Мгновенный бросок вперёд на 180px. Требует Ускорение.',
};

// ─── НОВЫЕ НЕЙТРАЛЬНЫЕ ───────────────────────────────────────────────────────

/** Маневр — групповой бонус к уклонению на 3 сек */
export const ABILITY_MANEUVER: AbilityDef = {
  id: 'maneuver',
  nameRu: 'Maneuver',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 15,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 200,
  statusEffect: 'evasion_boost',
  requiredWeapons: [WeaponType.Fists],
  description: 'Союзники в r200 получают +10 Уклонение на 3 сек.',
};

/** Прикрытие — групповой блок следующей 1 атаки */
export const ABILITY_COVER: AbilityDef = {
  id: 'cover',
  nameRu: 'Cover',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 20,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 200,
  statusEffect: 'block_next',
  requiredWeapons: [WeaponType.Sword],
  description: 'Союзники в r200 блокируют следующую 1 атаку (10 сек).',
};

/** Щитовая стойка — замедление + броня, только для меча/булавы (со щитом) */
export const ABILITY_SHIELD_STANCE: AbilityDef = {
  id: 'shield_stance',
  nameRu: 'Shield Stance',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'shield_stance',
  cooldown: 15,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  requiredWeapons: [WeaponType.Sword],
  description: 'Замедление −30% на 5 сек, но +15 Armor. Только для меча (со щитом).',
};

/** Отчаяние — удар с +10 урона за каждый дебафф на себе. Только ближний бой */
export const ABILITY_DESPERATION: AbilityDef = {
  id: 'desperation',
  nameRu: 'Desperation',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 8,
  manaCost: 10,
  range: 60,
  baseDamage: 12,
  bonusDamagePerSelfDebuff: 10,
  description: 'Удар ближнего боя. +10 урона за каждый дебафф на себе.',
};

/** Разоблачение — удар с +10% урона за каждый бафф на противнике */
export const ABILITY_EXPOSE: AbilityDef = {
  id: 'expose',
  nameRu: 'Expose',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 8,
  manaCost: 10,
  range: 60,
  baseDamage: 12,
  bonusDamagePercentPerTargetBuff: 0.1,
  requiredWeapons: [WeaponType.LongBow],
  description: 'Удар. +10% урона за каждый бафф на противнике.',
};

/** Адаптация — при смене оружия следующий навык бесплатный */
export const ABILITY_ADAPTATION: AbilityDef = {
  id: 'adaptation',
  nameRu: 'Adaptation',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 15,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  grantFreeNextCast: true,
  description: 'Следующий навык не тратит ману. Идеально после смены оружия/тела.',
};

/** Подпитка — реген HP за каждый бафф на себе */
export const ABILITY_SUSTAIN: AbilityDef = {
  id: 'sustain',
  nameRu: 'Sustain',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'regen_per_buff',
  cooldown: 15,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: '+3 HP/сек за каждый активный бафф на себе (8 сек).',
};

/** Стойкость духа — реген HP за каждый дебафф на себе */
export const ABILITY_SPIRIT_RESILIENCE: AbilityDef = {
  id: 'spirit_resilience',
  nameRu: 'Spirit Resilience',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'regen_per_debuff',
  cooldown: 15,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  description: '+3 HP/сек за каждый активный дебафф на себе (8 сек).',
};

/** Закалка — защита от дальних атак */
export const ABILITY_RANGED_RESIST: AbilityDef = {
  id: 'ranged_resist',
  nameRu: 'Hardening',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'ranged_resist',
  cooldown: 12,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  requiredWeapons: [WeaponType.LongBow],
  description: '−30% входящего дальнего урона на 5 сек.',
};

/** Очищение — лечение за каждый статус на себе */
export const ABILITY_PURIFY: AbilityDef = {
  id: 'purify',
  nameRu: 'Purify',
  school: 'neutral',
  damageType: 'magic',
  effectType: 'self_heal',
  cooldown: 10,
  castTime: 1.5,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  healPerStatusEffect: 10,
  description: 'Лечит 10 HP за каждый активный статус (бафф или дебафф) на себе.',
};

/** Непоколебимость — иммунитет к оглушению */
export const ABILITY_UNSHAKEABLE: AbilityDef = {
  id: 'unshakeable',
  nameRu: 'Unshakeable',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'stun_immune',
  cooldown: 15,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  requiredWeapons: [WeaponType.Spear],
  description: 'Иммунитет к оглушению на 5 сек.',
};

/** Твёрдая стойка — иммунитет к отбрасыванию */
export const ABILITY_FIRM_STANCE: AbilityDef = {
  id: 'firm_stance',
  nameRu: 'Firm Stance',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'knockback_immune',
  cooldown: 15,
  manaCost: 5,
  range: 0,
  baseDamage: 0,
  requiredWeapons: [WeaponType.Mace],
  description: 'Иммунитет к отбрасыванию на 5 сек.',
};

/** Iron Skin — бафф группы (party) +10% брони, не по радиусу */
export const ABILITY_IRON_SKIN: AbilityDef = {
  id: 'iron_skin',
  nameRu: 'Iron Skin',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'armor_group_buff',
  cooldown: 20,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  targetParty: true, // применяется на всю группу (party), не по радиусу
  requiredWeapons: [WeaponType.Mace],
  description: 'All party members gain +10% Armor for 6 sec.',
};

/** Fortune's Blessing — группа +20% удачи */
export const ABILITY_FORTUNE: AbilityDef = {
  id: 'fortune',
  nameRu: "Fortune's Blessing",
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'luck_group_buff',
  cooldown: 20,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  targetParty: true,
  requiredWeapons: [WeaponType.Dagger],
  description: 'All party members gain +20% Luck for 5 sec.',
};

/** Mana Flow — группа +20% реген маны */
export const ABILITY_MANA_FLOW: AbilityDef = {
  id: 'mana_flow',
  nameRu: 'Mana Flow',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  statusEffect: 'mana_flow',
  cooldown: 30,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  targetParty: true,
  description: 'All party members gain +20% mana regen for 10 sec.',
};

/** Mana Link — toggle-аура, постоянная передача регена маны сопартийцу */
export const ABILITY_MANA_LINK: AbilityDef = {
  id: 'mana_link',
  nameRu: 'Mana Link',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  isToggle: true, // toggle-аура как enchantment
  cooldown: 0,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  targetParty: true, // выбирает сопартийца
  description: 'Toggle: Self -10% mana regen, target ally +15% mana regen. Active until cancelled.',
};

/** Боевой марш — ускорение союзников */
export const ABILITY_BATTLE_MARCH: AbilityDef = {
  id: 'battle_march',
  nameRu: 'Battle March',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'self_buff',
  cooldown: 20,
  castTime: 1,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 200,
  statusEffect: 'acceleration',
  requiredWeapons: [WeaponType.Hammer],
  description: 'Союзники в r200 получают +50% скорости на 5 сек.',
};

/** Добивание — бонус урон если у цели < 50% HP */
export const ABILITY_EXECUTE: AbilityDef = {
  id: 'execute',
  nameRu: 'Execute',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 8,
  manaCost: 10,
  range: 60,
  baseDamage: 12,
  executeBonusPercent: 0.5,
  requiredWeapons: [WeaponType.Crossbow],
  description: 'Удар. +50% урона если у цели менее 50% HP.',
};

/** Чистый удар — бонус урон если нет зачарования */
export const ABILITY_PURE_STRIKE: AbilityDef = {
  id: 'pure_strike',
  nameRu: 'Pure Strike',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 6,
  manaCost: 10,
  range: 60,
  baseDamage: 12,
  bonusDamageIfNoEnchant: 0.3,
  requiredWeapons: [WeaponType.ShortBow],
  description: 'Удар. +30% урона если нет активного зачарования.',
};

/** Огненная ловушка — зона на земле, при наступлении горение */
export const ABILITY_FIRE_TRAP: AbilityDef = {
  id: 'fire_trap',
  nameRu: 'Fire Trap',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'ground_zone',
  cooldown: 15,
  castTime: 1,
  manaCost: 10,
  range: 150,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 40,
  zoneDuration: 10,
  zoneDps: 0,
  statusEffect: 'burn',
  statusChance: 1.0,
  requiredWeapons: [WeaponType.ShortBow],
  description: 'Ставит ловушку (r40, 10 сек). Враг наступив получает горение.',
};

/** Ядовитая ловушка — зона на земле, при наступлении яд */
export const ABILITY_POISON_TRAP: AbilityDef = {
  id: 'poison_trap',
  nameRu: 'Poison Trap',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'ground_zone',
  cooldown: 15,
  castTime: 1,
  manaCost: 10,
  range: 150,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 40,
  zoneDuration: 10,
  zoneDps: 0,
  statusEffect: 'poison',
  statusChance: 1.0,
  requiredWeapons: [WeaponType.ShortBow],
  description: 'Ставит ловушку (r40, 10 сек). Враг наступив получает яд.',
};

/** Кручение — вращение двуручником, урон вокруг себя 3 сек */
export const ABILITY_WHIRLWIND: AbilityDef = {
  id: 'whirlwind',
  nameRu: 'Whirlwind',
  school: 'neutral',
  damageType: 'melee',
  effectType: 'ground_zone',
  cooldown: 15,
  castTime: 0,
  manaCost: 10,
  range: 0,
  baseDamage: 0,
  isAoe: true,
  aoeRadius: 60,
  zoneDuration: 3,
  zoneDps: 15,
  requiredWeapons: [WeaponType.Greatsword],
  description: 'Кручение двуручником 3 сек. Наносит урон всем врагам вокруг (r60).',
};

/** Бросок к цели — кинжальщик прыгает к выбранной цели */
export const ABILITY_SHADOW_STEP: AbilityDef = {
  id: 'shadow_step',
  nameRu: 'Shadow Step',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 10,
  manaCost: 10,
  range: 300,
  baseDamage: 8,
  leapDistance: 150,
  requiredWeapons: [WeaponType.Dagger],
  description: 'Прыжок к цели (макс 150px). Если цель дальше — не достанет.',
};

/** Сбитие с ног — копьё сбивает врага, оглушение */
export const ABILITY_KNOCKDOWN: AbilityDef = {
  id: 'knockdown',
  nameRu: 'Knockdown',
  school: 'neutral',
  damageType: 'melee',
  cooldown: 12,
  manaCost: 10,
  range: 64,
  baseDamage: 12,
  statusEffect: 'knockdown',
  statusChance: 1.0,
  requiredWeapons: [WeaponType.Spear],
  description: 'Подсечка копьём. Сбивает врага с ног (1 сек).',
};

/** Исцеление союзника — лечит выбранного союзника */
export const ABILITY_ALLY_HEAL: AbilityDef = {
  id: 'ally_heal',
  nameRu: 'Ally Heal',
  school: 'neutral',
  damageType: 'magic',
  effectType: 'self_heal',
  targetAlly: true,
  cooldown: 8,
  castTime: 1.5,
  manaCost: 10,
  range: 150,
  baseDamage: 20,
  description: 'Лечит выбранного союзника на 20 × (1 + Интеллект/100) HP. Дальность 150.',
};
