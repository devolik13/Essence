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
    descRu: 'Убить 1 кролика',
    icon: '~',
    category: 'kill',
  },
  {
    id: 'kill_rabbit_10',
    nameRu: 'Истребитель зайцев',
    descRu: 'Убить 10 кроликов',
    icon: '~~',
    category: 'kill',
  },
  {
    id: 'kill_goblin_1',
    nameRu: 'Первый гоблин',
    descRu: 'Убить 1 гоблина',
    icon: '◇',
    category: 'kill',
  },
  {
    id: 'kill_goblin_5',
    nameRu: 'Истребитель гоблинов',
    descRu: 'Убить 5 гоблинов',
    icon: '◇◇',
    category: 'kill',
  },
  {
    id: 'kill_goblin_20',
    nameRu: 'Чистильщик',
    descRu: 'Убить 20 гоблинов',
    icon: '◈',
    category: 'kill',
  },
  {
    id: 'kill_wolf_1',
    nameRu: 'Истребитель волков',
    descRu: 'Убить 1 волка',
    icon: '◈',
    category: 'kill',
  },
  {
    id: 'kill_wolf_5',
    nameRu: 'Охотник на волков',
    descRu: 'Убить 5 волков',
    icon: '◈◈',
    category: 'kill',
  },
  {
    id: 'kill_scout_3',
    nameRu: 'Контрразведчик',
    descRu: 'Убить 3 разведчиков',
    icon: '▲',
    category: 'kill',
  },
  {
    id: 'kill_bear_1',
    nameRu: 'Охота на медведя',
    descRu: 'Убить 1 медведя',
    icon: '⌖',
    category: 'kill',
  },
  {
    id: 'kill_bear_5',
    nameRu: 'Разоритель логова',
    descRu: 'Убить 5 медведей',
    icon: '⌖⌖',
    category: 'kill',
  },
  {
    id: 'kill_orc_1',
    nameRu: 'Ловец орков',
    descRu: 'Убить 1 орка',
    icon: '✦',
    category: 'kill',
  },
  {
    id: 'kill_orc_5',
    nameRu: 'Опустошитель',
    descRu: 'Убить 5 орков',
    icon: '✦✦',
    category: 'kill',
  },
  {
    id: 'kill_shaman_1',
    nameRu: 'Антимаг',
    descRu: 'Убить 1 шамана',
    icon: '✺',
    category: 'kill',
  },
  {
    id: 'kill_shaman_3',
    nameRu: 'Разрушитель ковена',
    descRu: 'Убить 3 шаманов',
    icon: '✺✺',
    category: 'kill',
  },
  {
    id: 'kill_all_types',
    nameRu: 'Полный бестиарий',
    descRu: 'Убить хотя бы одно существо каждого вида',
    icon: '★',
    category: 'kill',
  },
  // ── Capture achievements ──────────────────────────────
  {
    id: 'capture_1',
    nameRu: 'Первое тело',
    descRu: 'Захватить любое существо',
    icon: '◉',
    category: 'capture',
  },
  {
    id: 'capture_5',
    nameRu: 'Мастер захвата',
    descRu: 'Захватить 5 тел',
    icon: '◉◉',
    category: 'capture',
  },
  // ── Spell achievements ────────────────────────────────
  {
    id: 'spell_spark',
    nameRu: 'Покоритель искр',
    descRu: 'Выучить заклинание Искра',
    icon: '⚡',
    category: 'spell',
    requiredSpellId: 'mob_fire_spark',
  },
  {
    id: 'spell_fireball',
    nameRu: 'Пиромант',
    descRu: 'Выучить заклинание Огненный шар',
    icon: '🔥',
    category: 'spell',
    requiredSpellId: 'mob_fireball',
  },
];

/** Quick lookup: achievement id → def */
export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.id, a])
);
