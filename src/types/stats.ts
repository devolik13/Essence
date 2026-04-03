/** 10 базовых параметров Сущности (Сферы) */
export enum StatName {
  Strength = 'strength',       // Сила — урон ближний
  Agility = 'agility',         // Ловкость — урон дальний
  Accuracy = 'accuracy',       // Точность — шанс попасть
  Evasion = 'evasion',         // Уклонение — шанс уклониться
  Health = 'health',            // Здоровье — макс HP
  Armor = 'armor',             // Стойкость — физзащита
  Intellect = 'intellect',     // Интеллект — магурон
  Will = 'will',               // Воля — магзащита
  Mana = 'mana',               // Мана — макс мана
  Luck = 'luck',               // Удача — крит
}

export type Stats = Record<StatName, number>;

/** Капы параметров для конкретного тела */
export type StatCaps = Partial<Record<StatName, number>>;

export function createDefaultStats(): Stats {
  return {
    [StatName.Strength]: 1,
    [StatName.Agility]: 1,
    [StatName.Accuracy]: 1,
    [StatName.Evasion]: 1,
    [StatName.Health]: 1,
    [StatName.Armor]: 1,
    [StatName.Intellect]: 1,
    [StatName.Will]: 1,
    [StatName.Mana]: 1,
    [StatName.Luck]: 1,
  };
}
