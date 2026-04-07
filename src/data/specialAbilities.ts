import { AbilityDef } from '../types/abilities';

// ─── Кролик ────────────────────────────────────────────────────────────────

/** Рывок — резкое ускорение на 5 сек (+50% скорость) */
export const ABILITY_DASH: AbilityDef = {
  id: 'dash',
  nameRu: 'Рывок',
  damageType: 'melee',
  effectType: 'dash',
  cooldown: 10,
  manaCost: 0,
  range: 0,
  baseDamage: 0,
  description: 'Резкое ускорение на 5 сек. Скорость +50%',
};

// ─── Гоблин ────────────────────────────────────────────────────────────────

/** Укол — быстрый удар кинжалом, 20% шанс яда */
export const ABILITY_STING: AbilityDef = {
  id: 'sting',
  nameRu: 'Укол',
  damageType: 'melee',
  effectType: 'poison_strike',
  cooldown: 5,
  manaCost: 0,
  range: 44,
  baseDamage: 12,
  poisonDps: 2,
  poisonDuration: 5,
  description: 'Укол кинжалом. Урон: 12 × (1 + Сила/100). 20% шанс яда (2 урон/сек, 5 сек)',
};

// ─── Одноручный меч (обучает Волк) ─────────────────────────────────────────

/** Удар мечом — мощный одиночный удар */
export const ABILITY_SWORD_STRIKE: AbilityDef = {
  id: 'sword_strike',
  nameRu: 'Удар мечом',
  damageType: 'melee',
  cooldown: 5,
  manaCost: 0,
  range: 52,
  baseDamage: 18,
  description: 'Мощный удар мечом. Урон: 18 × (1 + Сила/100)',
};

// ─── Булава (обучает Медведь) ───────────────────────────────────────────────

/** Дробящий удар — тяжёлый удар булавой */
export const ABILITY_MACE_STRIKE: AbilityDef = {
  id: 'mace_strike',
  nameRu: 'Дробящий удар',
  damageType: 'melee',
  cooldown: 6,
  manaCost: 0,
  range: 48,
  baseDamage: 22,
  description: 'Дробящий удар булавой. Урон: 22 × (1 + Сила/100)',
};

// ─── Двуручный меч (обучает Орк) ───────────────────────────────────────────

/** Рубящий удар — мощный удар двуручником с кровотечением */
export const ABILITY_SLASH: AbilityDef = {
  id: 'slash',
  nameRu: 'Рубящий удар',
  damageType: 'melee',
  cooldown: 7,
  manaCost: 0,
  range: 60,
  baseDamage: 30,
  description: 'Рубящий удар двуручником. Урон: 30 × (1 + Сила/100)',
};

// ─── Короткий лук (обучает Разведчик) ──────────────────────────────────────

/** Прицельный выстрел — точный дальний выстрел */
export const ABILITY_BOW_SHOT: AbilityDef = {
  id: 'bow_shot',
  nameRu: 'Прицельный выстрел',
  damageType: 'ranged',
  cooldown: 4,
  manaCost: 0,
  range: 240,
  baseDamage: 16,
  description: 'Прицельный выстрел из лука. Урон: 16 × (1 + Точность/100)',
};
