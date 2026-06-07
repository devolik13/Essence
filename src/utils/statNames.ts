import { StatName } from '../types/stats';

export const STAT_NAMES_SHORT: Record<StatName, string> = {
  [StatName.Strength]:  'Strength',
  [StatName.Agility]:   'Agility',
  [StatName.Health]:    'Health',
  [StatName.Armor]:     'Armor',
  [StatName.Intellect]: 'Intellect',
  [StatName.Will]:      'Will',
  [StatName.Mana]:      'Mana',
  [StatName.Luck]:      'Luck',
};
