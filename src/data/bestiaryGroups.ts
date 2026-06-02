/**
 * Bestiary grouping — which creature ids appear in which section of the bestiary UI.
 * Test/dummy creatures (dummy_*, t_*) are intentionally excluded.
 */

export interface BestiaryGroup {
  id: string;
  titleRu: string;
  titleEn: string;
  ids: string[];
}

export const BESTIARY_GROUPS: BestiaryGroup[] = [
  { id: 'starters',  titleRu: 'Стартовые тела',   titleEn: 'Starter bodies',
    ids: ['human_warrior', 'human_archer', 'human_mage'] },
  { id: 'beasts',    titleRu: 'Лесные звери',     titleEn: 'Forest beasts',
    ids: ['hare', 'deer', 'fox', 'grouse', 'boar', 'wolf', 'bear'] },
  { id: 'humanoids', titleRu: 'Гуманоиды',        titleEn: 'Humanoids',
    ids: ['goblin', 'orc', 'scout'] },
  { id: 'shamans',   titleRu: 'Шаманы природы',   titleEn: 'Nature shamans',
    ids: ['shaman', 'spirit_wolf'] },
  { id: 'fire_e',    titleRu: 'Элементали огня',  titleEn: 'Fire elementals',
    ids: ['spark', 'asher'] },
  { id: 'water_e',   titleRu: 'Элементали воды',  titleEn: 'Water elementals',
    ids: ['splasher', 'fogger'] },
  { id: 'earth_e',   titleRu: 'Элементали земли', titleEn: 'Earth elementals',
    ids: ['pebble', 'mudder'] },
  { id: 'wind_e',    titleRu: 'Элементали воздуха', titleEn: 'Wind elementals',
    ids: ['gusty', 'whistler'] },
  { id: 'bandits',   titleRu: 'Лагерь разбойников', titleEn: 'Bandits',
    ids: ['bandit_archer', 'bandit_crossbow', 'bandit_spear', 'bandit_brute'] },
  { id: 'veterans',  titleRu: 'Ветераны',         titleEn: 'Veterans',
    ids: ['goblin_veteran', 'wolf_veteran', 'bear_veteran', 'orc_veteran', 'scout_veteran',
          'bandit_archer_veteran', 'bandit_crossbow_veteran', 'bandit_brute_veteran'] },
  { id: 'guardians', titleRu: 'Стражи стихий',    titleEn: 'Element guardians',
    ids: ['ignis', 'aquaris', 'terra', 'aeros'] },
  { id: 'caravan',   titleRu: 'Караван',          titleEn: 'Caravan',
    ids: ['caravan_guard', 'ambusher', 'caravan_merchant'] },
];

/** Total creature count across all groups. */
export function bestiaryTotalCount(): number {
  return BESTIARY_GROUPS.reduce((acc, g) => acc + g.ids.length, 0);
}
