import { StatName } from '../types/stats';

export const STAT_NAMES_SHORT: Record<StatName, string> = {
  [StatName.Strength]:  'Сила',
  [StatName.Agility]:   'Ловкость',
  [StatName.Accuracy]:  'Точность',
  [StatName.Evasion]:   'Уклонение',
  [StatName.Health]:    'Здоровье',
  [StatName.Armor]:     'Стойкость',
  [StatName.Intellect]: 'Интеллект',
  [StatName.Will]:      'Воля',
  [StatName.Mana]:      'Мана',
  [StatName.Luck]:      'Удача',
};
