/**
 * Chapter 1 — Пробуждение
 * Spawn configuration for elemental zones and mini-event locations.
 * Map: 240×160 tiles, 32px/tile → 7680×5120 px
 * Village Eshworth center: (3840, 2560)
 */

export interface SpawnGroup {
  x: number;
  y: number;
  creatureId: string;
  count: number;
}

export interface ZoneConfig {
  id: string;
  element: 'fire' | 'water' | 'earth' | 'wind';
  /** Pixel bounds for tile tint */
  bounds: { x1: number; y1: number; x2: number; y2: number };
  tint: number;
  spawnGroups: SpawnGroup[];
  /** null = boss not yet implemented, placeholder skipped */
  bossId: string | null;
  bossX: number;
  bossY: number;
}

export interface MiniEventLocation {
  id: string;
  label: string;
  spawnGroups: SpawnGroup[];
}

// ─── Элементальные зоны ────────────────────────────────────────────────────────

export const CHAPTER1_ZONES: ZoneConfig[] = [
  // Огонь (Пепельная роща) — восток
  {
    id: 'fire',
    element: 'fire',
    bounds: { x1: 4608, y1: 1792, x2: 7552, y2: 3328 },
    tint: 0xff7733,
    spawnGroups: [
      { x: 5000, y: 2000, creatureId: 'spark',  count: 3 },
      { x: 5600, y: 2200, creatureId: 'asher',  count: 2 },
      { x: 6000, y: 2000, creatureId: 'spark',  count: 2 },
      { x: 6000, y: 2100, creatureId: 'asher',  count: 1 },
      { x: 5200, y: 2400, creatureId: 'asher',  count: 3 },
      { x: 6200, y: 2600, creatureId: 'spark',  count: 3 },
      { x: 5800, y: 2800, creatureId: 'asher',  count: 2 },
      { x: 5800, y: 2900, creatureId: 'spark',  count: 1 },
      { x: 6400, y: 2200, creatureId: 'spark',  count: 2 },
      { x: 6000, y: 3000, creatureId: 'asher',  count: 2 },
    ],
    bossId: 'ignis',
    bossX: 6912, bossY: 2944,
  },

  // Вода (Туманное озеро) — север
  {
    id: 'water',
    element: 'water',
    bounds: { x1: 640, y1: 128, x2: 7040, y2: 1792 },
    tint: 0x3377cc,
    spawnGroups: [
      { x: 1000,  y: 600,  creatureId: 'splasher', count: 2 },
      { x: 1600,  y: 400,  creatureId: 'fogger',   count: 2 },
      { x: 2400, y: 500,  creatureId: 'splasher', count: 2 },
      { x: 2400, y: 600,  creatureId: 'fogger',   count: 1 },
      { x: 3200, y: 360,  creatureId: 'fogger',   count: 3 },
      { x: 4400, y: 600,  creatureId: 'splasher', count: 3 },
      { x: 5400, y: 400,  creatureId: 'fogger',   count: 2 },
      { x: 5400, y: 500,  creatureId: 'splasher', count: 1 },
      { x: 6400, y: 600,  creatureId: 'splasher', count: 2 },
      { x: 3800, y: 1000,  creatureId: 'fogger',   count: 2 },
    ],
    bossId: 'aquaris',
    bossX: 3840, bossY: 640,
  },

  // Земля (Каменные холмы) — запад
  {
    id: 'earth',
    element: 'earth',
    bounds: { x1: 128, y1: 1792, x2: 3072, y2: 3328 },
    tint: 0x886633,
    spawnGroups: [
      { x: 500,  y: 2000, creatureId: 'pebble', count: 2 },
      { x: 800,  y: 2200, creatureId: 'mudder', count: 2 },
      { x: 1200,  y: 2000, creatureId: 'pebble', count: 1 },
      { x: 1200,  y: 2100, creatureId: 'mudder', count: 2 },
      { x: 1600,  y: 2400, creatureId: 'pebble', count: 3 },
      { x: 1000,  y: 2600, creatureId: 'mudder', count: 3 },
      { x: 1400,  y: 2800, creatureId: 'pebble', count: 2 },
      { x: 1400,  y: 2900, creatureId: 'mudder', count: 1 },
      { x: 600,  y: 3000, creatureId: 'mudder', count: 2 },
      { x: 1800,  y: 2200, creatureId: 'pebble', count: 2 },
    ],
    bossId: 'terra',
    bossX: 768, bossY: 2944,
  },

  // Ветер (Вершины ветров) — юг
  {
    id: 'wind',
    element: 'wind',
    bounds: { x1: 640, y1: 3328, x2: 7040, y2: 4992 },
    tint: 0x99ddbb,
    spawnGroups: [
      { x: 1200,  y: 3600, creatureId: 'gusty',    count: 3 },
      { x: 1800,  y: 3800, creatureId: 'whistler', count: 2 },
      { x: 2600, y: 3600, creatureId: 'gusty',    count: 2 },
      { x: 2600, y: 3700, creatureId: 'whistler', count: 1 },
      { x: 3400, y: 3800, creatureId: 'whistler', count: 3 },
      { x: 4400, y: 3600, creatureId: 'gusty',    count: 3 },
      { x: 5400, y: 3800, creatureId: 'whistler', count: 2 },
      { x: 5400, y: 3900, creatureId: 'gusty',    count: 1 },
      { x: 6400, y: 3600, creatureId: 'gusty',    count: 2 },
      { x: 3800, y: 4200, creatureId: 'whistler', count: 2 },
    ],
    bossId: 'aeros',
    bossX: 3840, bossY: 4480,
  },
];

// ─── Мини-ивент локации ────────────────────────────────────────────────────────

export const MINI_EVENT_LOCATIONS: MiniEventLocation[] = [
  // Серый лес — квест «пропавший скот»
  // Глубокий юго-запад, далеко от деревни
  {
    id: 'grey_forest',
    label: 'Серый лес',
    spawnGroups: [
      { x: 1400,  y: 3700, creatureId: 'wolf',         count: 3 },
      { x: 1800,  y: 3800, creatureId: 'wolf',         count: 2 },
      { x: 1600,  y: 4000, creatureId: 'bear',         count: 2 },
      { x: 2100, y: 3760, creatureId: 'wolf',         count: 2 },
      { x: 1960,  y: 4100, creatureId: 'bear',         count: 1 },
      // Ветераны — глубже в лесу
      { x: 1240,  y: 4200, creatureId: 'wolf_veteran', count: 1 },
      { x: 1500,  y: 4400, creatureId: 'bear_veteran', count: 1 },
    ],
  },

  // Лагерь орков — глубокий юг, далеко от деревни
  {
    id: 'orc_camp',
    label: 'Лагерь орков',
    spawnGroups: [
      { x: 3700, y: 3800, creatureId: 'orc',         count: 3 },
      { x: 4100, y: 3860, creatureId: 'orc',         count: 2 },
      { x: 3900, y: 4040, creatureId: 'shaman',      count: 2 },
      { x: 4300, y: 3900, creatureId: 'orc',         count: 2 },
      { x: 4000, y: 4160, creatureId: 'shaman',      count: 1 },
      // Военачальник — в центре лагеря
      { x: 3940, y: 4000, creatureId: 'orc_veteran', count: 1 },
    ],
  },

  // Крестьянский хутор — буфер север-восток, между деревней (y1=1056) и зоной воды (y2=896)
  // y ~ 920-1050, восточная сторона
  {
    id: 'farmstead',
    label: 'Крестьянский хутор',
    spawnGroups: [
      { x: 5300, y: 1880,  creatureId: 'scout',         count: 2 },
      { x: 5700, y: 1940,  creatureId: 'scout',         count: 3 },
      { x: 5500, y: 2040, creatureId: 'scout',         count: 2 },
      // Капитан — командует разведчиками
      { x: 5900, y: 1980,  creatureId: 'scout_veteran', count: 1 },
    ],
  },

  // Одинокая могила — глубокий юго-восток, вдали от всех локаций
  {
    id: 'lonely_grave',
    label: 'Одинокая могила',
    spawnGroups: [
      { x: 6800, y: 4400, creatureId: 'spirit', count: 1 },
    ],
  },

  // Старая башня мага — север, буфер между деревней и зоной воды
  // Концепт: x:96-56, y:20-22 → пиксели: x:3072-1792, y:640-704
  {
    id: 'mage_tower',
    label: 'Старая башня мага',
    spawnGroups: [
      { x: 3200, y: 840,  creatureId: 'shaman',       count: 2 },
      { x: 3440, y: 960,  creatureId: 'spirit_wolf',  count: 2 },
      { x: 3320, y: 1120,  creatureId: 'shaman',       count: 1 },
      { x: 3500, y: 1200,  creatureId: 'spirit_wolf',  count: 1 },
    ],
  },

  // Дом ведьмы — юго-восток, буфер между зоной огня и зоной ветра
  // Концепт: x:144-82, y:104-62 → пиксели: x:4608-2624, y:3328-1984
  {
    id: 'witch_house',
    label: 'Дом ведьмы',
    spawnGroups: [
      { x: 4760, y: 3500, creatureId: 'goblin',          count: 3 },
      { x: 5000, y: 3600, creatureId: 'goblin',          count: 2 },
      { x: 4900, y: 3760, creatureId: 'goblin_veteran',  count: 1 },
    ],
  },

  // Заброшенная шахта — юго-запад, рядом с зоной земли
  // Концепт: x:20-24, y:104-65 → пиксели: x:640-768, y:3328-2080
  {
    id: 'abandoned_mine',
    label: 'Заброшенная шахта',
    spawnGroups: [
      { x: 800,  y: 3440, creatureId: 'pebble',   count: 3 },
      { x: 1100,  y: 3560, creatureId: 'mudder',   count: 2 },
      { x: 900,  y: 3720, creatureId: 'pebble',   count: 2 },
      { x: 1200,  y: 3840, creatureId: 'mudder',   count: 2 },
      { x: 1000,  y: 4000, creatureId: 'pebble',   count: 2 },
      { x: 1300,  y: 3960, creatureId: 'mudder',   count: 1 },
    ],
  },

  // Разрушенный мост — севернее деревни, переход к Туманному озеру
  // Концепт: x:104-68, y:52-34 → отодвинуты подальше от village (y1=1056)
  {
    id: 'broken_bridge',
    label: 'Разрушенный мост',
    spawnGroups: [
      { x: 3500, y: 1400,  creatureId: 'splasher',  count: 2 },
      { x: 3800, y: 1360,  creatureId: 'fogger',    count: 2 },
      { x: 4100, y: 1420,  creatureId: 'splasher',  count: 2 },
      { x: 3700, y: 1500,  creatureId: 'fogger',    count: 1 },
    ],
  },

  // Поляна духов — юго-запад, между землёй и ветром, лор Пустоты
  // Концепт: x:96-56, y:110-65 → пиксели: x:3072-1792, y:3520-2080
  {
    id: 'spirit_meadow',
    label: 'Поляна духов',
    spawnGroups: [
      { x: 3160, y: 3640, creatureId: 'spirit',  count: 2 },
      { x: 3400, y: 3800, creatureId: 'spirit',  count: 2 },
      { x: 3280, y: 4000, creatureId: 'spirit',  count: 1 },
    ],
  },

  // Лагерь разбойников — северо-запад, далеко от деревни (village x1=1664, y1=1056)
  // Центр ~(900, 780), безопасный разрыв ~764px на запад и ~276px на север
  {
    id: 'bandit_camp',
    label: 'Лагерь разбойников',
    spawnGroups: [
      // Громилы — ближняя охрана лагеря
      { x: 1720,  y: 1600,  creatureId: 'bandit_brute',           count: 2 },
      { x: 1900,  y: 1520,  creatureId: 'bandit_brute',           count: 1 },
      // Копейщики — средний периметр
      { x: 1520,  y: 1440,  creatureId: 'bandit_spear',           count: 2 },
      { x: 2000, y: 1480,  creatureId: 'bandit_spear',           count: 2 },
      // Лучники — дальний периметр / вышки
      { x: 1400,  y: 1320,  creatureId: 'bandit_archer',          count: 2 },
      { x: 2120, y: 1340,  creatureId: 'bandit_archer',          count: 2 },
      // Арбалетчики — с укрытий
      { x: 1660,  y: 1280,  creatureId: 'bandit_crossbow',        count: 2 },
      { x: 1940,  y: 1300,  creatureId: 'bandit_crossbow',        count: 1 },
      // Ветераны — элита лагеря, у штабного шатра
      { x: 1760,  y: 1400,  creatureId: 'bandit_brute_veteran',   count: 1 },
      { x: 1680,  y: 1360,  creatureId: 'bandit_spear_veteran',   count: 1 },
      { x: 1840,  y: 1380,  creatureId: 'bandit_archer_veteran',  count: 1 },
      { x: 1800,  y: 1320,  creatureId: 'bandit_crossbow_veteran',count: 1 },
    ],
  },
];

// ─── Стартовая зона (вокруг деревни) ──────────────────────────────────────────

export const VILLAGE_STARTER_SPAWNS: SpawnGroup[] = [
  // Пассивные — строго внутри village bounds (x:3328-2176, y:2112-1504)
  // Кролики — юго-западный угол деревни, джиттер ±40px
  { x: 3440, y: 2880, creatureId: 'rabbit',        count: 4 },
  { x: 3640, y: 2920, creatureId: 'rabbit',        count: 3 },
  // Первые враги — чётко восточнее деревни (village x2=2176 + 300px зазор)
  { x: 5000, y: 2440, creatureId: 'goblin',         count: 3 },
  { x: 5000, y: 2680, creatureId: 'goblin',         count: 2 },
  { x: 5240, y: 2560, creatureId: 'wolf',           count: 3 },
  // Гоблин-ветеран — чуть дальше от деревни
  { x: 5500, y: 2560, creatureId: 'goblin_veteran', count: 1 },
  // Волки-духи — восточнее деревни, рядом с гоблинами
  { x: 4800, y: 2200, creatureId: 'spirit_wolf', count: 2 },
  { x: 4800, y: 2800, creatureId: 'spirit_wolf', count: 2 },
];

// ─── Тестовые сферы (по кругу вокруг деревни, радиус ~350px) ──────────────────

export const TEST_SPELL_SPAWNS: SpawnGroup[] = [
  // Стихии T1 (север)
  // Стихии T2 (северо-восток)
  // Природа (восток)
  { x: 4660, y: 2740, creatureId: 't_nature_t2', count: 1 },
  { x: 4600, y: 2880, creatureId: 't_nature_t3', count: 1 },
  // Нейтральная (юго-восток)
  { x: 4140, y: 3180, creatureId: 't_heal',  count: 1 },
  // Оружейные T1 (юго-запад → запад)
  // T3 тестовые (южнее деревни)
  { x: 3440, y: 3240, creatureId: 't_fire_t3',    count: 1 },
  { x: 3640, y: 3280, creatureId: 't_water_t3',   count: 1 },
  { x: 3840, y: 3300, creatureId: 't_earth_t3',   count: 1 },
  { x: 4040, y: 3280, creatureId: 't_wind_t3',    count: 1 },
  { x: 4240, y: 3240, creatureId: 't_nature_t3b', count: 1 },
  // Остальные
  // Оружейные T2 (внутренний круг, радиус ~250px)
  { x: 3440, y: 2920, creatureId: 't_xbow_t2',    count: 1 },
];

/** Village Eshworth — safe zone, player start point */
export const VILLAGE_CENTER = { x: 3840, y: 2560 };

/** Pixel bounds of the safe village zone (no mob spawns) */
export const VILLAGE_BOUNDS = { x1: 3328, y1: 2112, x2: 4352, y2: 3008 };
