export interface AchievementDef {
  id: string;
  nameRu: string;
  descRu: string;
  /** Icon glyph shown in UI */
  icon: string;
  /** Category for grouping */
  category: 'kill' | 'capture' | 'spell' | 'explore';
  /** Для category:'spell' — реальный id заклинания, которое нужно выучить
   *  (id ачивки и id спелла различаются: spell_spark vs mob_fire_t1). */
  requiredSpellId?: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Kill achievements ─────────────────────────────────
  {
    id: 'kill_rabbit_1',
    nameRu: 'Rabbit Hunter',
    descRu: 'Убить 1 кролика',
    icon: '~',
    category: 'kill',
  },
  {
    id: 'kill_rabbit_10',
    nameRu: 'Rabbit Slayer',
    descRu: 'Убить 10 кроликов',
    icon: '~~',
    category: 'kill',
  },
  {
    id: 'kill_goblin_1',
    nameRu: 'First Goblin',
    descRu: 'Убить 1 гоблина',
    icon: '◇',
    category: 'kill',
  },
  {
    id: 'kill_goblin_5',
    nameRu: 'Goblin Slayer',
    descRu: 'Убить 5 гоблинов',
    icon: '◇◇',
    category: 'kill',
  },
  {
    id: 'kill_goblin_20',
    nameRu: 'Cleaner',
    descRu: 'Убить 20 гоблинов',
    icon: '◈',
    category: 'kill',
  },
  {
    id: 'kill_wolf_1',
    nameRu: 'Wolf Slayer',
    descRu: 'Убить 1 волка',
    icon: '◈',
    category: 'kill',
  },
  {
    id: 'kill_wolf_5',
    nameRu: 'Wolf Hunter',
    descRu: 'Убить 5 волков',
    icon: '◈◈',
    category: 'kill',
  },
  {
    id: 'kill_scout_3',
    nameRu: 'Counter-Scout',
    descRu: 'Убить 3 разведчиков',
    icon: '▲',
    category: 'kill',
  },
  {
    id: 'kill_bear_1',
    nameRu: 'Bear Hunt',
    descRu: 'Убить 1 медведя',
    icon: '⌖',
    category: 'kill',
  },
  {
    id: 'kill_bear_5',
    nameRu: 'Den Destroyer',
    descRu: 'Убить 5 медведей',
    icon: '⌖⌖',
    category: 'kill',
  },
  {
    id: 'kill_orc_1',
    nameRu: 'Orc Catcher',
    descRu: 'Убить 1 орка',
    icon: '✦',
    category: 'kill',
  },
  {
    id: 'kill_orc_5',
    nameRu: 'Devastator',
    descRu: 'Убить 5 орков',
    icon: '✦✦',
    category: 'kill',
  },
  {
    id: 'kill_shaman_1',
    nameRu: 'Anti-Mage',
    descRu: 'Убить 1 шамана',
    icon: '✺',
    category: 'kill',
  },
  {
    id: 'kill_shaman_3',
    nameRu: 'Coven Destroyer',
    descRu: 'Убить 3 шаманов',
    icon: '✺✺',
    category: 'kill',
  },
  {
    id: 'kill_all_types',
    nameRu: 'Full Bestiary',
    descRu: 'Убить хотя бы одно существо каждого вида',
    icon: '★',
    category: 'kill',
  },
  // ── Capture achievements ──────────────────────────────
  {
    id: 'capture_1',
    nameRu: 'First Body',
    descRu: 'Захватить любое существо',
    icon: '◉',
    category: 'capture',
  },
  {
    id: 'capture_5',
    nameRu: 'Capture Master',
    descRu: 'Захватить 5 тел',
    icon: '◉◉',
    category: 'capture',
  },
  // ── Spell achievements ────────────────────────────────
  {
    id: 'spell_spark',
    nameRu: 'Spark Slayer',
    descRu: 'Выучить заклинание Искра',
    icon: '⚡',
    category: 'spell',
    requiredSpellId: 'mob_fire_t1',
  },
  {
    id: 'spell_fireball',
    nameRu: 'Pyromancer',
    descRu: 'Выучить заклинание Огненный шар',
    icon: '🔥',
    category: 'spell',
    requiredSpellId: 'mob_fire_t4',
  },
];

/** Quick lookup: achievement id → def */
export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map(a => [a.id, a])
);
