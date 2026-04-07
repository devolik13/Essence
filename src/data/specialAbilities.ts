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

// ─── Шаман (призыв) ────────────────────────────────────────────────────────

/** Призыв волка — вызывает волка-союзника на 30 сек */
export const ABILITY_SUMMON_WOLF: AbilityDef = {
  id: 'summon_wolf',
  nameRu: 'Призыв волка',
  damageType: 'magic',
  effectType: 'summon_wolf',
  cooldown: 45,
  manaCost: 20,
  range: 0,
  baseDamage: 0,
  description: 'Призывает волка-союзника на 30 сек. Волк атакует ближайшего врага.',
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

// ─── Длинный лук (не реализован на моб-учителе) ───────────────────────────

/** Дальний выстрел — мощный выстрел на предельную дистанцию */
export const ABILITY_LONGBOW_SHOT: AbilityDef = {
  id: 'longbow_shot',
  nameRu: 'Дальний выстрел',
  damageType: 'ranged',
  cooldown: 5,
  manaCost: 0,
  range: 320,
  baseDamage: 20,
  description: 'Мощный выстрел из длинного лука. Урон: 20 × (1 + Точность/100)',
};

// ─── Арбалет (не реализован на моб-учителе) ───────────────────────────────

/** Болт — пробивающий выстрел из арбалета */
export const ABILITY_CROSSBOW_BOLT: AbilityDef = {
  id: 'crossbow_bolt',
  nameRu: 'Пробивающий болт',
  damageType: 'ranged',
  cooldown: 6,
  manaCost: 0,
  range: 290,
  baseDamage: 24,
  description: 'Пробивающий выстрел из арбалета. Урон: 24 × (1 + Точность/100)',
};

// ─── Копьё (не реализован на моб-учителе) ─────────────────────────────────

/** Выпад — дистанционный колющий удар копьём */
export const ABILITY_SPEAR_THRUST: AbilityDef = {
  id: 'spear_thrust',
  nameRu: 'Выпад',
  damageType: 'melee',
  cooldown: 5,
  manaCost: 0,
  range: 80,
  baseDamage: 20,
  description: 'Выпад копьём с увеличенной дистанцией. Урон: 20 × (1 + Сила/100)',
};

// ─── Молот (не реализован на моб-учителе) ─────────────────────────────────

/** Сокрушительный удар — мощный удар молотом с AoE */
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
  description: 'Удар молотом по земле. Урон: 36 × (1 + Сила/100), AoE радиус 60',
};
