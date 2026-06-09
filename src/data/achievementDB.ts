export interface AchievementDef {
  id: string;
  nameRu: string;
  nameEn?: string;
  descRu: string;
  descEn?: string;
  /** Icon glyph shown in UI */
  icon: string;
  /** Category for grouping */
  category: 'kill' | 'capture' | 'spell' | 'explore';
  /** Для category:'spell' — реальный id заклинания, которое нужно выучить
   *  (id ачивки и id спелла различаются: spell_spark vs mob_fire_spark). */
  requiredSpellId?: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Kill achievements ─────────────────────────────────
  {
    id: 'kill_rabbit_1',
    nameRu: 'Охотник на зайцев',
    nameEn: 'Hare Hunter',
    descRu: 'Убить 1 кролика',
    descEn: 'Kill 1 hare',
    icon: '~',
    category: 'kill',
  },
  {
    id: 'kill_rabbit_10',
    nameRu: 'Истребитель зайцев',
    nameEn: 'Hare Exterminator',
    descRu: 'Убить 10 кроликов',
    descEn: 'Kill 10 hares',
    icon: '~~',
    category: 'kill',
  },
  {
    id: 'kill_goblin_1',
    nameRu: 'Первый гоблин',
    nameEn: 'First Goblin',
    descRu: 'Убить 1 гоблина',
    descEn: 'Kill 1 goblin',
    icon: '◇',
    category: 'kill',
  },
  {
    id: 'kill_goblin_5',
    nameRu: 'Истребитель гоблинов',
    nameEn: 'Goblin Slayer',
    descRu: 'Убить 5 гоблинов',
    descEn: 'Kill 5 goblins',
    icon: '◇◇',
    category: 'kill',
  },
  {
    id: 'kill_goblin_20',
    nameRu: 'Чистильщик',
    nameEn: 'Cleaner',
    descRu: 'Убить 20 гоблинов',
    descEn: 'Kill 20 goblins',
    icon: '◈',
    category: 'kill',
  },
  {
    id: 'kill_wolf_1',
    nameRu: 'Истребитель волков',
    nameEn: 'Wolf Slayer',
    descRu: 'Убить 1 волка',
    descEn: 'Kill 1 wolf',
    icon: '◈',
    category: 'kill',
  },
  {
    id: 'kill_wolf_5',
    nameRu: 'Охотник на волков',
    nameEn: 'Wolf Hunter',
    descRu: 'Убить 5 волков',
    descEn: 'Kill 5 wolves',
    icon: '◈◈',
    category: 'kill',
  },
  {
    id: 'kill_scout_3',
    nameRu: 'Контрразведчик',
    nameEn: 'Counter-Scout',
    descRu: 'Убить 3 разведчиков',
    descEn: 'Kill 3 scouts',
    icon: '▲',
    category: 'kill',
  },
  {
    id: 'kill_bear_1',
    nameRu: 'Охота на медведя',
    nameEn: 'Bear Hunt',
    descRu: 'Убить 1 медведя',
    descEn: 'Kill 1 bear',
    icon: '⌖',
    category: 'kill',
  },
  {
    id: 'kill_bear_5',
    nameRu: 'Разоритель логова',
    nameEn: 'Den Raider',
    descRu: 'Убить 5 медведей',
    descEn: 'Kill 5 bears',
    icon: '⌖⌖',
    category: 'kill',
  },
  {
    id: 'kill_orc_1',
    nameRu: 'Ловец орков',
    nameEn: 'Orc Catcher',
    descRu: 'Убить 1 орка',
    descEn: 'Kill 1 orc',
    icon: '✦',
    category: 'kill',
  },
  {
    id: 'kill_orc_5',
    nameRu: 'Опустошитель',
    nameEn: 'Ravager',
    descRu: 'Убить 5 орков',
    descEn: 'Kill 5 orcs',
    icon: '✦✦',
    category: 'kill',
  },
  {
    id: 'kill_shaman_1',
    nameRu: 'Антимаг',
    nameEn: 'Antimage',
    descRu: 'Убить 1 шамана',
    descEn: 'Kill 1 shaman',
    icon: '✺',
    category: 'kill',
  },
  {
    id: 'kill_shaman_3',
    nameRu: 'Разрушитель ковена',
    nameEn: 'Coven Breaker',
    descRu: 'Убить 3 шаманов',
    descEn: 'Kill 3 shamans',
    icon: '✺✺',
    category: 'kill',
  },
  {
    id: 'kill_all_types',
    nameRu: 'Полный бестиарий',
    nameEn: 'Full Bestiary',
    descRu: 'Убить хотя бы одно существо каждого вида',
    descEn: 'Kill at least one creature of every type',
    icon: '★',
    category: 'kill',
  },
  // ── Capture achievements ──────────────────────────────
  {
    id: 'capture_1',
    nameRu: 'Первое тело',
    nameEn: 'First Body',
    descRu: 'Захватить любое существо',
    descEn: 'Capture any creature',
    icon: '◉',
    category: 'capture',
  },
  {
    id: 'capture_5',
    nameRu: 'Мастер захвата',
    nameEn: 'Capture Master',
    descRu: 'Захватить 5 тел',
    descEn: 'Capture 5 bodies',
    icon: '◉◉',
    category: 'capture',
  },
  // ── Spell achievements ────────────────────────────────
  {
    id: 'spell_spark',
    nameRu: 'Покоритель искр',
    nameEn: 'Spark Tamer',
    descRu: 'Выучить заклинание Искра',
    descEn: 'Learn the Spark spell',
    icon: '⚡',
    category: 'spell',
    requiredSpellId: 'mob_fire_spark',
  },
  {
    id: 'spell_fireball',
    nameRu: 'Пиромант',
    nameEn: 'Pyromancer',
    descRu: 'Выучить заклинание Огненный шар',
    descEn: 'Learn the Fireball spell',
    icon: '🔥',
    category: 'spell',
    requiredSpellId: 'mob_fireball',
  },
];

/** Quick lookup: achievement id → def */
export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.id, a])
);
