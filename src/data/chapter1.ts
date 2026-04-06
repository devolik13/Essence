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
    bossId: null, // TODO: 'ignis'
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
    bossId: null, // TODO: 'aquaris'
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
    bossId: null, // TODO: 'terra'
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
    bossId: null, // TODO: 'aeros'
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
      { x: 700,  y: 1850, creatureId: 'wolf', count: 3 },
      { x: 900,  y: 1900, creatureId: 'wolf', count: 2 },
      { x: 800,  y: 2000, creatureId: 'bear', count: 2 },
      { x: 1050, y: 1880, creatureId: 'wolf', count: 2 },
      { x: 980,  y: 2050, creatureId: 'bear', count: 1 },
    ],
  },

  // Лагерь орков — глубокий юг, далеко от деревни
  {
    id: 'orc_camp',
    label: 'Лагерь орков',
    spawnGroups: [
      { x: 1850, y: 1900, creatureId: 'orc',    count: 3 },
      { x: 2050, y: 1930, creatureId: 'orc',    count: 2 },
      { x: 1950, y: 2020, creatureId: 'shaman', count: 2 },
      { x: 2150, y: 1950, creatureId: 'orc',    count: 2 },
      { x: 2000, y: 2080, creatureId: 'shaman', count: 1 },
    ],
  },

  // Крестьянский хутор — буфер север-восток, между деревней (y1=1056) и зоной воды (y2=896)
  // y ~ 920-1050, восточная сторона
  {
    id: 'farmstead',
    label: 'Крестьянский хутор',
    spawnGroups: [
      { x: 2650, y: 940,  creatureId: 'scout', count: 2 },
      { x: 2850, y: 970,  creatureId: 'scout', count: 3 },
      { x: 2750, y: 1020, creatureId: 'scout', count: 2 },
    ],
  },
];

// ─── Стартовая зона (вокруг деревни) ──────────────────────────────────────────

export const VILLAGE_STARTER_SPAWNS: SpawnGroup[] = [
  // Пассивные — строго внутри village bounds (x:1664-2176, y:1056-1504)
  // Кролики — юго-западный угол деревни, джиттер ±40px
  { x: 1720, y: 1440, creatureId: 'rabbit',        count: 4 },
  { x: 1820, y: 1460, creatureId: 'rabbit',        count: 3 },
  // Лесные духи — северо-западный угол деревни
  { x: 1700, y: 1120, creatureId: 'forest_spirit', count: 3 },
  { x: 1820, y: 1100, creatureId: 'forest_spirit', count: 3 },
  // Первые враги — чётко восточнее деревни (village x2=2176 + 300px зазор)
  // x=2500 гарантирует что с джиттером ±100px враги минимум на 224px от деревни
  { x: 2500, y: 1220, creatureId: 'goblin', count: 3 },
  { x: 2500, y: 1340, creatureId: 'goblin', count: 2 },
  { x: 2620, y: 1280, creatureId: 'wolf',   count: 3 },
];

/** Village Eshworth — safe zone, player start point */
export const VILLAGE_CENTER = { x: 1920, y: 1280 };

/** Pixel bounds of the safe village zone (no mob spawns) */
export const VILLAGE_BOUNDS = { x1: 1664, y1: 1056, x2: 2176, y2: 1504 };
