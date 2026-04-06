/**
 * Chapter 1 — Пробуждение
 * Spawn configuration for all elemental zones.
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
  bossId: string;
  bossX: number;
  bossY: number;
}

export const CHAPTER1_ZONES: ZoneConfig[] = [
  // ─── Огонь (Пепельная роща) — восток ───────────────────────────────────────
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
    bossId: 'orc',    // TODO: replace with 'ignis' boss when implemented
    bossX: 3456, bossY: 1472,
  },

  // ─── Вода (Туманное озеро) — север ─────────────────────────────────────────
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
    bossId: 'shaman', // TODO: replace with 'aquaris' boss when implemented
    bossX: 1920, bossY: 320,
  },

  // ─── Земля (Каменные холмы) — запад ────────────────────────────────────────
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
    bossId: 'bear',   // TODO: replace with 'terra' boss when implemented
    bossX: 384, bossY: 1472,
  },

  // ─── Ветер (Вершины ветров) — юг ───────────────────────────────────────────
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
    bossId: 'wolf',   // TODO: replace with 'aeros' boss when implemented
    bossX: 1920, bossY: 2240,
  },
];

/** Village Eshworth — safe zone, player start point */
export const VILLAGE_CENTER = { x: 1920, y: 1280 };

/** Pixel bounds of the safe village zone (no mob spawns) */
export const VILLAGE_BOUNDS = { x1: 1664, y1: 1056, x2: 2176, y2: 1504 };
