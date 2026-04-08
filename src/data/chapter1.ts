/**
 * Chapter 1 — Пробуждение
 * Spawn configuration for elemental zones and mini-event locations.
 * Map: 120×80 tiles, 32px/tile → 3840×2560 px
 * Village Eshworth center: (1920, 1280)
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
    bounds: { x1: 2304, y1: 896, x2: 3776, y2: 1664 },
    tint: 0xff7733,
    spawnGroups: [
      { x: 2500, y: 1000, creatureId: 'spark',  count: 3 },
      { x: 2800, y: 1100, creatureId: 'asher',  count: 2 },
      { x: 3000, y: 1000, creatureId: 'spark',  count: 2 },
      { x: 3000, y: 1050, creatureId: 'asher',  count: 1 },
      { x: 2600, y: 1200, creatureId: 'asher',  count: 3 },
      { x: 3100, y: 1300, creatureId: 'spark',  count: 3 },
      { x: 2900, y: 1400, creatureId: 'asher',  count: 2 },
      { x: 2900, y: 1450, creatureId: 'spark',  count: 1 },
      { x: 3200, y: 1100, creatureId: 'spark',  count: 2 },
      { x: 3000, y: 1500, creatureId: 'asher',  count: 2 },
    ],
    bossId: 'ignis',
    bossX: 3456, bossY: 1472,
  },

  // Вода (Туманное озеро) — север
  {
    id: 'water',
    element: 'water',
    bounds: { x1: 320, y1: 64, x2: 3520, y2: 896 },
    tint: 0x3377cc,
    spawnGroups: [
      { x: 500,  y: 300,  creatureId: 'splasher', count: 2 },
      { x: 800,  y: 200,  creatureId: 'fogger',   count: 2 },
      { x: 1200, y: 250,  creatureId: 'splasher', count: 2 },
      { x: 1200, y: 300,  creatureId: 'fogger',   count: 1 },
      { x: 1600, y: 180,  creatureId: 'fogger',   count: 3 },
      { x: 2200, y: 300,  creatureId: 'splasher', count: 3 },
      { x: 2700, y: 200,  creatureId: 'fogger',   count: 2 },
      { x: 2700, y: 250,  creatureId: 'splasher', count: 1 },
      { x: 3200, y: 300,  creatureId: 'splasher', count: 2 },
      { x: 1900, y: 500,  creatureId: 'fogger',   count: 2 },
    ],
    bossId: 'aquaris',
    bossX: 1920, bossY: 320,
  },

  // Земля (Каменные холмы) — запад
  {
    id: 'earth',
    element: 'earth',
    bounds: { x1: 64, y1: 896, x2: 1536, y2: 1664 },
    tint: 0x886633,
    spawnGroups: [
      { x: 250,  y: 1000, creatureId: 'pebble', count: 2 },
      { x: 400,  y: 1100, creatureId: 'mudder', count: 2 },
      { x: 600,  y: 1000, creatureId: 'pebble', count: 1 },
      { x: 600,  y: 1050, creatureId: 'mudder', count: 2 },
      { x: 800,  y: 1200, creatureId: 'pebble', count: 3 },
      { x: 500,  y: 1300, creatureId: 'mudder', count: 3 },
      { x: 700,  y: 1400, creatureId: 'pebble', count: 2 },
      { x: 700,  y: 1450, creatureId: 'mudder', count: 1 },
      { x: 300,  y: 1500, creatureId: 'mudder', count: 2 },
      { x: 900,  y: 1100, creatureId: 'pebble', count: 2 },
    ],
    bossId: 'terra',
    bossX: 384, bossY: 1472,
  },

  // Ветер (Вершины ветров) — юг
  {
    id: 'wind',
    element: 'wind',
    bounds: { x1: 320, y1: 1664, x2: 3520, y2: 2496 },
    tint: 0x99ddbb,
    spawnGroups: [
      { x: 600,  y: 1800, creatureId: 'gusty',    count: 3 },
      { x: 900,  y: 1900, creatureId: 'whistler', count: 2 },
      { x: 1300, y: 1800, creatureId: 'gusty',    count: 2 },
      { x: 1300, y: 1850, creatureId: 'whistler', count: 1 },
      { x: 1700, y: 1900, creatureId: 'whistler', count: 3 },
      { x: 2200, y: 1800, creatureId: 'gusty',    count: 3 },
      { x: 2700, y: 1900, creatureId: 'whistler', count: 2 },
      { x: 2700, y: 1950, creatureId: 'gusty',    count: 1 },
      { x: 3200, y: 1800, creatureId: 'gusty',    count: 2 },
      { x: 1900, y: 2100, creatureId: 'whistler', count: 2 },
    ],
    bossId: 'aeros',
    bossX: 1920, bossY: 2240,
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
      { x: 700,  y: 1850, creatureId: 'wolf',         count: 3 },
      { x: 900,  y: 1900, creatureId: 'wolf',         count: 2 },
      { x: 800,  y: 2000, creatureId: 'bear',         count: 2 },
      { x: 1050, y: 1880, creatureId: 'wolf',         count: 2 },
      { x: 980,  y: 2050, creatureId: 'bear',         count: 1 },
      // Ветераны — глубже в лесу
      { x: 620,  y: 2100, creatureId: 'wolf_veteran', count: 1 },
      { x: 750,  y: 2200, creatureId: 'bear_veteran', count: 1 },
    ],
  },

  // Лагерь орков — глубокий юг, далеко от деревни
  {
    id: 'orc_camp',
    label: 'Лагерь орков',
    spawnGroups: [
      { x: 1850, y: 1900, creatureId: 'orc',         count: 3 },
      { x: 2050, y: 1930, creatureId: 'orc',         count: 2 },
      { x: 1950, y: 2020, creatureId: 'shaman',      count: 2 },
      { x: 2150, y: 1950, creatureId: 'orc',         count: 2 },
      { x: 2000, y: 2080, creatureId: 'shaman',      count: 1 },
      // Военачальник — в центре лагеря
      { x: 1970, y: 2000, creatureId: 'orc_veteran', count: 1 },
    ],
  },

  // Крестьянский хутор — буфер север-восток, между деревней (y1=1056) и зоной воды (y2=896)
  // y ~ 920-1050, восточная сторона
  {
    id: 'farmstead',
    label: 'Крестьянский хутор',
    spawnGroups: [
      { x: 2650, y: 940,  creatureId: 'scout',         count: 2 },
      { x: 2850, y: 970,  creatureId: 'scout',         count: 3 },
      { x: 2750, y: 1020, creatureId: 'scout',         count: 2 },
      // Капитан — командует разведчиками
      { x: 2950, y: 990,  creatureId: 'scout_veteran', count: 1 },
    ],
  },

  // Одинокая могила — глубокий юго-восток, вдали от всех локаций
  {
    id: 'lonely_grave',
    label: 'Одинокая могила',
    spawnGroups: [
      { x: 3400, y: 2200, creatureId: 'spirit', count: 1 },
    ],
  },

  // Старая башня мага — север, буфер между деревней и зоной воды
  // Концепт: x:48-56, y:10-22 → пиксели: x:1536-1792, y:320-704
  {
    id: 'mage_tower',
    label: 'Старая башня мага',
    spawnGroups: [
      { x: 1600, y: 420,  creatureId: 'shaman',       count: 2 },
      { x: 1720, y: 480,  creatureId: 'spirit_wolf',  count: 2 },
      { x: 1660, y: 560,  creatureId: 'shaman',       count: 1 },
      { x: 1750, y: 600,  creatureId: 'spirit_wolf',  count: 1 },
    ],
  },

  // Дом ведьмы — юго-восток, буфер между зоной огня и зоной ветра
  // Концепт: x:72-82, y:52-62 → пиксели: x:2304-2624, y:1664-1984
  {
    id: 'witch_house',
    label: 'Дом ведьмы',
    spawnGroups: [
      { x: 2380, y: 1750, creatureId: 'goblin',          count: 3 },
      { x: 2500, y: 1800, creatureId: 'goblin',          count: 2 },
      { x: 2450, y: 1880, creatureId: 'goblin_veteran',  count: 1 },
    ],
  },

  // Заброшенная шахта — юго-запад, рядом с зоной земли
  // Концепт: x:10-24, y:52-65 → пиксели: x:320-768, y:1664-2080
  {
    id: 'abandoned_mine',
    label: 'Заброшенная шахта',
    spawnGroups: [
      { x: 400,  y: 1720, creatureId: 'pebble',   count: 3 },
      { x: 550,  y: 1780, creatureId: 'mudder',   count: 2 },
      { x: 450,  y: 1860, creatureId: 'pebble',   count: 2 },
      { x: 600,  y: 1920, creatureId: 'mudder',   count: 2 },
      { x: 500,  y: 2000, creatureId: 'pebble',   count: 2 },
      { x: 650,  y: 1980, creatureId: 'mudder',   count: 1 },
    ],
  },

  // Разрушенный мост — севернее деревни, переход к Туманному озеру
  // Концепт: x:52-68, y:26-34 → отодвинуты подальше от village (y1=1056)
  {
    id: 'broken_bridge',
    label: 'Разрушенный мост',
    spawnGroups: [
      { x: 1750, y: 700,  creatureId: 'splasher',  count: 2 },
      { x: 1900, y: 680,  creatureId: 'fogger',    count: 2 },
      { x: 2050, y: 710,  creatureId: 'splasher',  count: 2 },
      { x: 1850, y: 750,  creatureId: 'fogger',    count: 1 },
    ],
  },

  // Поляна духов — юго-запад, между землёй и ветром, лор Пустоты
  // Концепт: x:48-56, y:55-65 → пиксели: x:1536-1792, y:1760-2080
  {
    id: 'spirit_meadow',
    label: 'Поляна духов',
    spawnGroups: [
      { x: 1580, y: 1820, creatureId: 'spirit',  count: 2 },
      { x: 1700, y: 1900, creatureId: 'spirit',  count: 2 },
      { x: 1640, y: 2000, creatureId: 'spirit',  count: 1 },
    ],
  },

  // Лагерь разбойников — северо-запад, далеко от деревни (village x1=1664, y1=1056)
  // Центр ~(900, 780), безопасный разрыв ~764px на запад и ~276px на север
  {
    id: 'bandit_camp',
    label: 'Лагерь разбойников',
    spawnGroups: [
      // Громилы — ближняя охрана лагеря
      { x: 860,  y: 800,  creatureId: 'bandit_brute',           count: 2 },
      { x: 950,  y: 760,  creatureId: 'bandit_brute',           count: 1 },
      // Копейщики — средний периметр
      { x: 760,  y: 720,  creatureId: 'bandit_spear',           count: 2 },
      { x: 1000, y: 740,  creatureId: 'bandit_spear',           count: 2 },
      // Лучники — дальний периметр / вышки
      { x: 700,  y: 660,  creatureId: 'bandit_archer',          count: 2 },
      { x: 1060, y: 670,  creatureId: 'bandit_archer',          count: 2 },
      // Арбалетчики — с укрытий
      { x: 830,  y: 640,  creatureId: 'bandit_crossbow',        count: 2 },
      { x: 970,  y: 650,  creatureId: 'bandit_crossbow',        count: 1 },
      // Ветераны — элита лагеря, у штабного шатра
      { x: 880,  y: 700,  creatureId: 'bandit_brute_veteran',   count: 1 },
      { x: 840,  y: 680,  creatureId: 'bandit_spear_veteran',   count: 1 },
      { x: 920,  y: 690,  creatureId: 'bandit_archer_veteran',  count: 1 },
      { x: 900,  y: 660,  creatureId: 'bandit_crossbow_veteran',count: 1 },
    ],
  },
];

// ─── Стартовая зона (вокруг деревни) ──────────────────────────────────────────

export const VILLAGE_STARTER_SPAWNS: SpawnGroup[] = [
  // Пассивные — строго внутри village bounds (x:1664-2176, y:1056-1504)
  // Кролики — юго-западный угол деревни, джиттер ±40px
  { x: 1720, y: 1440, creatureId: 'rabbit',        count: 4 },
  { x: 1820, y: 1460, creatureId: 'rabbit',        count: 3 },
  // Первые враги — чётко восточнее деревни (village x2=2176 + 300px зазор)
  { x: 2500, y: 1220, creatureId: 'goblin',         count: 3 },
  { x: 2500, y: 1340, creatureId: 'goblin',         count: 2 },
  { x: 2620, y: 1280, creatureId: 'wolf',           count: 3 },
  // Гоблин-ветеран — чуть дальше от деревни
  { x: 2750, y: 1280, creatureId: 'goblin_veteran', count: 1 },
  // Волки-духи — восточнее деревни, рядом с гоблинами
  { x: 2400, y: 1100, creatureId: 'spirit_wolf', count: 2 },
  { x: 2400, y: 1400, creatureId: 'spirit_wolf', count: 2 },
];

// ─── Тестовые сферы (по кругу вокруг деревни, радиус ~350px) ──────────────────

export const TEST_SPELL_SPAWNS: SpawnGroup[] = [
  // Стихии T1 (север)
  // Стихии T2 (северо-восток)
  { x: 2300, y: 1050, creatureId: 't_water_t2', count: 1 },
  // Природа (восток)
  { x: 2340, y: 1290, creatureId: 't_nature_t1', count: 1 },
  { x: 2330, y: 1370, creatureId: 't_nature_t2', count: 1 },
  { x: 2300, y: 1440, creatureId: 't_nature_t3', count: 1 },
  // Нейтральная (юго-восток)
  { x: 2070, y: 1590, creatureId: 't_heal',  count: 1 },
  // Зачарования (юг)
  { x: 1970, y: 1600, creatureId: 't_ench_fire',  count: 1 },
  { x: 1870, y: 1600, creatureId: 't_ench_water', count: 1 },
  { x: 1770, y: 1590, creatureId: 't_ench_earth', count: 1 },
  { x: 1670, y: 1560, creatureId: 't_ench_wind',  count: 1 },
  // Оружейные T1 (юго-запад → запад)
  // T3 тестовые (южнее деревни)
  { x: 1720, y: 1620, creatureId: 't_fire_t3',    count: 1 },
  { x: 1820, y: 1640, creatureId: 't_water_t3',   count: 1 },
  { x: 1920, y: 1650, creatureId: 't_earth_t3',   count: 1 },
  { x: 2020, y: 1640, creatureId: 't_wind_t3',    count: 1 },
  { x: 2120, y: 1620, creatureId: 't_nature_t3b', count: 1 },
  // Остальные
  { x: 1670, y: 930,  creatureId: 't_xbow_t1',    count: 1 },
  // Оружейные T2 (внутренний круг, радиус ~250px)
  { x: 1720, y: 1460, creatureId: 't_xbow_t2',    count: 1 },
];

/** Village Eshworth — safe zone, player start point */
export const VILLAGE_CENTER = { x: 1920, y: 1280 };

/** Pixel bounds of the safe village zone (no mob spawns) */
export const VILLAGE_BOUNDS = { x1: 1664, y1: 1056, x2: 2176, y2: 1504 };
