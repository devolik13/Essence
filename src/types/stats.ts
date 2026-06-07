/** 9 базовых параметров Сущности (Сферы).
 *  Симметрия: 3 атаки (Сила/Ловкость/Интеллект) × 3 защиты (Стойкость/Уклонение/Воля)
 *  по типам урона (ближний/дальний/магия) + 3 универсальных (Здоровье/Мана/Удача). */
export enum StatName {
  Strength = 'strength',       // Сила — урон ближний
  Agility = 'agility',         // Ловкость — урон дальний
  Health = 'health',            // Здоровье — макс HP
  Armor = 'armor',             // Стойкость — защита от ближнего урона
  Evasion = 'evasion',         // Уклонение — защита от дальнего урона (снижение, не промах)
  Intellect = 'intellect',     // Интеллект — магурон
  Will = 'will',               // Воля — защита от магического урона
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
    [StatName.Health]: 1,
    [StatName.Armor]: 1,
    [StatName.Evasion]: 1,
    [StatName.Intellect]: 1,
    [StatName.Will]: 1,
    [StatName.Mana]: 1,
    [StatName.Luck]: 1,
  };
}
