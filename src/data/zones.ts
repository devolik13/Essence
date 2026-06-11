/**
 * Зоны мира — каждая отдельная карта с мобами и переходами.
 * GameScene загружает одну зону за раз.
 */
import { SpawnGroup } from './chapter1';

export interface ZoneExit {
  /** Направление выхода (край карты) */
  edge: 'north' | 'south' | 'east' | 'west';
  /** ID зоны назначения */
  targetZone: string;
  /** Координаты спавна в целевой зоне */
  spawnX: number;
  spawnY: number;
}

export interface ResourceNodeSpawn {
  x: number; y: number;
  nodeId: string; // copper_vein, willow_tree, hide_pile
}

export interface WorkbenchSpawn {
  x: number; y: number;
  type: 'armorer' | 'weaponsmith' | 'jeweler' | 'runemaster';
  nameRu: string;
  nameEn?: string;
}

export interface NPCSpawn {
  x: number; y: number;
  id: string;
  nameRu: string;
  nameEn?: string;
  role: 'vendor' | 'quest' | 'npc' | 'weapon_vendor';
}

export interface QuestObjectSpawn {
  x: number; y: number;
  objectId: string;
  nameRu: string;
  nameEn?: string;
  type: 'waypoint' | 'collectible' | 'destructible';
  icon: string;
  color: number;
}

export interface BiomeRegion {
  id: string;
  nameRu: string;
  nameEn?: string;
  bounds: { x1: number; y1: number; x2: number; y2: number };
  tint?: number;
}

export interface SafeZone {
  x1: number; y1: number; x2: number; y2: number;
  respawnPoint: { x: number; y: number };
  nameRu?: string;
  nameEn?: string;
}

/** Live caravan: cart + guards + merchant traveling along a route. */
export interface CaravanSpawn {
  /** Starting position (e.g., gate of origin city) */
  start: { x: number; y: number };
  /** Final destination (gate of target city) */
  end: { x: number; y: number };
  /** Cart speed in px/sec while moving */
  speed?: number;
  /** Number of caravan_guard escorts (positioned around cart) */
  guardCount?: number;
  /** Spawn this caravan only after this body-quest id is started/known */
  requiresQuestId?: string;
}

export interface ZoneConfig {
  id: string;
  nameRu: string;
  nameEn?: string;
  widthTiles: number;
  heightTiles: number;
  baseTile: string;
  tint?: number;
  safeBounds?: { x1: number; y1: number; x2: number; y2: number };
  safeZones?: SafeZone[];
  biomes?: BiomeRegion[];
  respawnPoint: { x: number; y: number };
  spawnGroups: SpawnGroup[];
  /** Существа, разбросанные рандомно по всей карте (мимо сейф-зон). */
  scatterSpawns?: { creatureId: string; count: number }[];
  exits: ZoneExit[];
  /** Resource gathering nodes */
  resourceNodes?: ResourceNodeSpawn[];
  /** Crafting workbenches */
  workbenches?: WorkbenchSpawn[];
  /** NPCs */
  npcs?: NPCSpawn[];
  /** Quest-related world objects (waypoints, collectibles, destructibles) */
  questObjects?: QuestObjectSpawn[];
  /** Live caravans traveling between cities */
  caravans?: CaravanSpawn[];
}

// ── Размеры зон ──────────────────────────────────────────────────────────────
const ZONE_W = 120; // тайлов (стандартная зона)
const ZONE_H = 100;
const T = 32;       // размер тайла
const PW = ZONE_W * T; // 3840 px
const PH = ZONE_H * T; // 3200 px

// ── Большая карта (village + cave + trade road + waldmar) ────────────────────
const BIG_W = 360; // тайлов
const BIG_H = 240;
const BPW = BIG_W * T; // 11520 px
const BPH = BIG_H * T; // 7680 px

// Ключевые точки на большой карте (в пикселях)
const ESHWORTH_X = 3200;  // левая треть
const ESHWORTH_Y = 2800;  // центр по вертикали
const WALDMAR_X  = 8800;  // правая треть
const WALDMAR_Y  = 2800;
const ROAD_MID_X = 6000;  // середина дороги
const ROAD_MID_Y = 2800;

// ── 1. Главная карта (Eshworth + Road + Waldmar + Cave) ─────────────────────
// 360×240 тайлов = 11520×7680 px
// Eshworth ~(3200, 2800), Waldmar ~(8800, 2800), Cave ~(2000, 5800)

const EX = ESHWORTH_X, EY = ESHWORTH_Y;
const WX = WALDMAR_X, WY = WALDMAR_Y;

export const ZONE_VILLAGE: ZoneConfig = {
  id: 'village',
  nameRu: 'Регион Эшворт',
  nameEn: 'Eshworth Region',
  widthTiles: BIG_W,
  heightTiles: BIG_H,
  baseTile: 'tile_grass',
  respawnPoint: { x: EX, y: EY },
  // Сейф-зона Эшворта расширена под перенесённый игроком забор (x 2930..3874).
  safeBounds: { x1: 2920, y1: 2570, x2: 3880, y2: 3030 },

  safeZones: [
    { x1: 2920, y1: 2570, x2: 3880, y2: 3030,
      respawnPoint: { x: EX, y: EY }, nameRu: 'Эшворт', nameEn: 'Eshworth' },
    { x1: WX - 256, y1: WY - 224, x2: WX + 256, y2: WY + 224,
      respawnPoint: { x: WX, y: WY }, nameRu: 'Вальдмар', nameEn: 'Waldmar' },
  ],

  biomes: [
    { id: 'eshworth', nameRu: 'Деревня Эшворт', nameEn: 'Eshworth Village',
      bounds: { x1: EX - 1600, y1: EY - 1400, x2: EX + 1600, y2: EY + 1400 } },
    { id: 'trade_road', nameRu: 'Торговый тракт', nameEn: 'Trade Road', tint: 0x77aa55,
      bounds: { x1: EX + 1600, y1: EY - 800, x2: WX - 1600, y2: EY + 800 } },
    { id: 'waldmar', nameRu: 'Вальдмар', nameEn: 'Waldmar', tint: 0x667755,
      bounds: { x1: WX - 1600, y1: WY - 1400, x2: WX + 1600, y2: WY + 1400 } },
  ],

  spawnGroups: [
    // Wolves — 30 spawned individually so packs don't shred the player.
    { x: 1100,  y: 1300, creatureId: 'wolf', count: 1 },
    { x: 2700,  y: 800,  creatureId: 'wolf', count: 1 },
    { x: 4200,  y: 1500, creatureId: 'wolf', count: 1 },
    { x: 5500,  y: 600,  creatureId: 'wolf', count: 1 },
    { x: 6900,  y: 1300, creatureId: 'wolf', count: 1 },
    { x: 8500,  y: 700,  creatureId: 'wolf', count: 1 },
    { x: 10100, y: 1400, creatureId: 'wolf', count: 1 },
    { x: 11200, y: 800,  creatureId: 'wolf', count: 1 },
    { x: 1500,  y: 2700, creatureId: 'wolf', count: 1 },
    { x: 3700,  y: 2300, creatureId: 'wolf', count: 1 },
    { x: 5300,  y: 2700, creatureId: 'wolf', count: 1 },
    { x: 7100,  y: 2300, creatureId: 'wolf', count: 1 },
    { x: 9000,  y: 2700, creatureId: 'wolf', count: 1 },
    { x: 10900, y: 2400, creatureId: 'wolf', count: 1 },
    { x: 600,   y: 4300, creatureId: 'wolf', count: 1 },
    { x: 2400,  y: 4500, creatureId: 'wolf', count: 1 },
    { x: 3900,  y: 4100, creatureId: 'wolf', count: 1 },
    { x: 6100,  y: 4500, creatureId: 'wolf', count: 1 },
    { x: 7800,  y: 4100, creatureId: 'wolf', count: 1 },
    { x: 9700,  y: 4500, creatureId: 'wolf', count: 1 },
    { x: 11200, y: 4300, creatureId: 'wolf', count: 1 },
    { x: 1700,  y: 5700, creatureId: 'wolf', count: 1 },
    { x: 3500,  y: 5500, creatureId: 'wolf', count: 1 },
    { x: 5500,  y: 5800, creatureId: 'wolf', count: 1 },
    { x: 7300,  y: 5500, creatureId: 'wolf', count: 1 },
    { x: 9100,  y: 5800, creatureId: 'wolf', count: 1 },
    { x: 10800, y: 5500, creatureId: 'wolf', count: 1 },
    { x: 2100,  y: 6700, creatureId: 'wolf', count: 1 },
    { x: 6300,  y: 6700, creatureId: 'wolf', count: 1 },
    { x: 8800,  y: 6700, creatureId: 'wolf', count: 1 },

    // Deer — 30 spawned individually so the player can engage one at a time.
    { x: 1200,  y: 800,  creatureId: 'deer', count: 1 },
    { x: 2400,  y: 1200, creatureId: 'deer', count: 1 },
    { x: 4500,  y: 700,  creatureId: 'deer', count: 1 },
    { x: 6500,  y: 1100, creatureId: 'deer', count: 1 },
    { x: 7800,  y: 600,  creatureId: 'deer', count: 1 },
    { x: 10500, y: 900,  creatureId: 'deer', count: 1 },
    { x: 800,   y: 1900, creatureId: 'deer', count: 1 },
    { x: 3000,  y: 2200, creatureId: 'deer', count: 1 },
    { x: 4900,  y: 1700, creatureId: 'deer', count: 1 },
    { x: 6800,  y: 2400, creatureId: 'deer', count: 1 },
    { x: 8200,  y: 2100, creatureId: 'deer', count: 1 },
    { x: 10800, y: 1800, creatureId: 'deer', count: 1 },
    { x: 1500,  y: 3700, creatureId: 'deer', count: 1 },
    { x: 2700,  y: 4100, creatureId: 'deer', count: 1 },
    { x: 5000,  y: 3600, creatureId: 'deer', count: 1 },
    { x: 6300,  y: 4300, creatureId: 'deer', count: 1 },
    { x: 8100,  y: 3700, creatureId: 'deer', count: 1 },
    { x: 10300, y: 4200, creatureId: 'deer', count: 1 },
    { x: 2200,  y: 4900, creatureId: 'deer', count: 1 },
    { x: 3800,  y: 5300, creatureId: 'deer', count: 1 },
    { x: 5500,  y: 4900, creatureId: 'deer', count: 1 },
    { x: 6900,  y: 5400, creatureId: 'deer', count: 1 },
    { x: 9300,  y: 5100, creatureId: 'deer', count: 1 },
    { x: 10700, y: 5500, creatureId: 'deer', count: 1 },
    { x: 1800,  y: 6200, creatureId: 'deer', count: 1 },
    { x: 4200,  y: 6500, creatureId: 'deer', count: 1 },
    { x: 5800,  y: 6100, creatureId: 'deer', count: 1 },
    { x: 7200,  y: 6700, creatureId: 'deer', count: 1 },
    { x: 8800,  y: 6200, creatureId: 'deer', count: 1 },
    { x: 10200, y: 6800, creatureId: 'deer', count: 1 },

    // Hares — 30 spawned individually, scattered across the map.
    // Passive (no fleeing), used for bq_hare carrot quest (acceleration).
    { x: 900,   y: 600,  creatureId: 'hare', count: 1 },
    { x: 2100,  y: 1500, creatureId: 'hare', count: 1 },
    { x: 3700,  y: 900,  creatureId: 'hare', count: 1 },
    { x: 5300,  y: 1400, creatureId: 'hare', count: 1 },
    { x: 7100,  y: 800,  creatureId: 'hare', count: 1 },
    { x: 9100,  y: 1300, creatureId: 'hare', count: 1 },
    { x: 1700,  y: 2200, creatureId: 'hare', count: 1 },
    { x: 4100,  y: 2400, creatureId: 'hare', count: 1 },
    { x: 5900,  y: 1900, creatureId: 'hare', count: 1 },
    { x: 7600,  y: 2300, creatureId: 'hare', count: 1 },
    { x: 9700,  y: 2000, creatureId: 'hare', count: 1 },
    { x: 11000, y: 1500, creatureId: 'hare', count: 1 },
    { x: 700,   y: 3500, creatureId: 'hare', count: 1 },
    { x: 2500,  y: 3900, creatureId: 'hare', count: 1 },
    { x: 4400,  y: 3500, creatureId: 'hare', count: 1 },
    { x: 5800,  y: 4100, creatureId: 'hare', count: 1 },
    { x: 7500,  y: 3500, creatureId: 'hare', count: 1 },
    { x: 9500,  y: 4000, creatureId: 'hare', count: 1 },
    { x: 11000, y: 3700, creatureId: 'hare', count: 1 },
    { x: 1300,  y: 5200, creatureId: 'hare', count: 1 },
    { x: 3300,  y: 4700, creatureId: 'hare', count: 1 },
    { x: 5100,  y: 5300, creatureId: 'hare', count: 1 },
    { x: 6600,  y: 4800, creatureId: 'hare', count: 1 },
    { x: 8500,  y: 5300, creatureId: 'hare', count: 1 },
    { x: 10100, y: 4900, creatureId: 'hare', count: 1 },
    { x: 2800,  y: 6300, creatureId: 'hare', count: 1 },
    { x: 4900,  y: 6700, creatureId: 'hare', count: 1 },
    { x: 6500,  y: 6300, creatureId: 'hare', count: 1 },
    { x: 8200,  y: 6800, creatureId: 'hare', count: 1 },
    { x: 9800,  y: 6300, creatureId: 'hare', count: 1 },

    // Foxes — 15 scattered for bq_fox quest (kill 3 hares → hook).
    // Combat type, hunts hares; spread thin so player faces one at a time.
    { x: 1500,  y: 1100, creatureId: 'fox', count: 1 },
    { x: 4000,  y: 1300, creatureId: 'fox', count: 1 },
    { x: 6200,  y: 700,  creatureId: 'fox', count: 1 },
    { x: 9400,  y: 1100, creatureId: 'fox', count: 1 },
    { x: 2400,  y: 2700, creatureId: 'fox', count: 1 },
    { x: 5500,  y: 2500, creatureId: 'fox', count: 1 },
    { x: 8500,  y: 2700, creatureId: 'fox', count: 1 },
    { x: 1800,  y: 4400, creatureId: 'fox', count: 1 },
    { x: 4800,  y: 4400, creatureId: 'fox', count: 1 },
    { x: 7700,  y: 4500, creatureId: 'fox', count: 1 },
    { x: 10500, y: 4500, creatureId: 'fox', count: 1 },
    { x: 3100,  y: 5700, creatureId: 'fox', count: 1 },
    { x: 6100,  y: 5800, creatureId: 'fox', count: 1 },
    { x: 8800,  y: 5700, creatureId: 'fox', count: 1 },
    { x: 5400,  y: 6800, creatureId: 'fox', count: 1 },

    // Bears — 10 scattered for bq_bear quest (kill 2 sparks → mace_strike).
    // Combat type, large/dangerous; placed in deeper forest areas.
    { x: 2700,  y: 1700, creatureId: 'bear', count: 1 },
    { x: 5800,  y: 1100, creatureId: 'bear', count: 1 },
    { x: 9900,  y: 1700, creatureId: 'bear', count: 1 },
    { x: 4300,  y: 3100, creatureId: 'bear', count: 1 },
    { x: 7400,  y: 3100, creatureId: 'bear', count: 1 },
    { x: 1100,  y: 4500, creatureId: 'bear', count: 1 },
    { x: 5300,  y: 4600, creatureId: 'bear', count: 1 },
    { x: 8300,  y: 4500, creatureId: 'bear', count: 1 },
    { x: 3500,  y: 6100, creatureId: 'bear', count: 1 },
    { x: 9500,  y: 6500, creatureId: 'bear', count: 1 },

    // Sparks (fire slimes) — 2 per bear, ~150px offset, for bq_bear targets.
    // Note: kept in village zone only; other zones (fire/water/etc.) untouched.
    { x: 2550,  y: 1850, creatureId: 'spark', count: 1 },
    { x: 2850,  y: 1550, creatureId: 'spark', count: 1 },
    { x: 5650,  y: 1250, creatureId: 'spark', count: 1 },
    { x: 5950,  y: 950,  creatureId: 'spark', count: 1 },
    { x: 9750,  y: 1850, creatureId: 'spark', count: 1 },
    { x: 10050, y: 1550, creatureId: 'spark', count: 1 },
    { x: 4150,  y: 3250, creatureId: 'spark', count: 1 },
    { x: 4450,  y: 2950, creatureId: 'spark', count: 1 },
    { x: 7250,  y: 3250, creatureId: 'spark', count: 1 },
    { x: 7550,  y: 2950, creatureId: 'spark', count: 1 },
    { x: 950,   y: 4650, creatureId: 'spark', count: 1 },
    { x: 1250,  y: 4350, creatureId: 'spark', count: 1 },
    { x: 5150,  y: 4750, creatureId: 'spark', count: 1 },
    { x: 5450,  y: 4450, creatureId: 'spark', count: 1 },
    { x: 8150,  y: 4650, creatureId: 'spark', count: 1 },
    { x: 8450,  y: 4350, creatureId: 'spark', count: 1 },
    { x: 3350,  y: 6250, creatureId: 'spark', count: 1 },
    { x: 3650,  y: 5950, creatureId: 'spark', count: 1 },
    { x: 9350,  y: 6650, creatureId: 'spark', count: 1 },
    { x: 9650,  y: 6350, creatureId: 'spark', count: 1 },
    // Extra 10 sparks scattered randomly (not bound to bears) → 30 total.
    { x: 1900,  y: 1500, creatureId: 'spark', count: 1 },
    { x: 4700,  y: 950,  creatureId: 'spark', count: 1 },
    { x: 7200,  y: 2100, creatureId: 'spark', count: 1 },
    { x: 10800, y: 2700, creatureId: 'spark', count: 1 },
    { x: 600,   y: 3700, creatureId: 'spark', count: 1 },
    { x: 6100,  y: 3900, creatureId: 'spark', count: 1 },
    { x: 9100,  y: 4400, creatureId: 'spark', count: 1 },
    { x: 11200, y: 5500, creatureId: 'spark', count: 1 },
    { x: 4500,  y: 6300, creatureId: 'spark', count: 1 },
    { x: 7600,  y: 6900, creatureId: 'spark', count: 1 },

    // Splashers — 30 (water T1, learns Ice Drop / mob_ice_shard)
    { x: 1100,  y: 1700, creatureId: 'splasher', count: 1 },
    { x: 2900,  y: 900,  creatureId: 'splasher', count: 1 },
    { x: 4900,  y: 1700, creatureId: 'splasher', count: 1 },
    { x: 6700,  y: 900,  creatureId: 'splasher', count: 1 },
    { x: 8400,  y: 1500, creatureId: 'splasher', count: 1 },
    { x: 10000, y: 700,  creatureId: 'splasher', count: 1 },
    { x: 11200, y: 1700, creatureId: 'splasher', count: 1 },
    { x: 800,   y: 2700, creatureId: 'splasher', count: 1 },
    { x: 2300,  y: 3100, creatureId: 'splasher', count: 1 },
    { x: 4100,  y: 3300, creatureId: 'splasher', count: 1 },
    { x: 5900,  y: 3100, creatureId: 'splasher', count: 1 },
    { x: 7900,  y: 3300, creatureId: 'splasher', count: 1 },
    { x: 9700,  y: 3100, creatureId: 'splasher', count: 1 },
    { x: 11100, y: 3300, creatureId: 'splasher', count: 1 },
    { x: 1500,  y: 4500, creatureId: 'splasher', count: 1 },
    { x: 3500,  y: 4300, creatureId: 'splasher', count: 1 },
    { x: 5300,  y: 4500, creatureId: 'splasher', count: 1 },
    { x: 7100,  y: 4300, creatureId: 'splasher', count: 1 },
    { x: 8900,  y: 4500, creatureId: 'splasher', count: 1 },
    { x: 10500, y: 4300, creatureId: 'splasher', count: 1 },
    { x: 1900,  y: 5700, creatureId: 'splasher', count: 1 },
    { x: 3900,  y: 5500, creatureId: 'splasher', count: 1 },
    { x: 5700,  y: 5700, creatureId: 'splasher', count: 1 },
    { x: 7500,  y: 5500, creatureId: 'splasher', count: 1 },
    { x: 9300,  y: 5700, creatureId: 'splasher', count: 1 },
    { x: 10900, y: 5300, creatureId: 'splasher', count: 1 },
    { x: 2500,  y: 6900, creatureId: 'splasher', count: 1 },
    { x: 5100,  y: 6700, creatureId: 'splasher', count: 1 },
    { x: 7800,  y: 6700, creatureId: 'splasher', count: 1 },
    { x: 10100, y: 6900, creatureId: 'splasher', count: 1 },

    // Pebbles — 30 (earth T1, learns Pebble / mob_pebble_shot)
    { x: 700,   y: 800,  creatureId: 'pebble', count: 1 },
    { x: 2300,  y: 1100, creatureId: 'pebble', count: 1 },
    { x: 4300,  y: 1700, creatureId: 'pebble', count: 1 },
    { x: 6300,  y: 1500, creatureId: 'pebble', count: 1 },
    { x: 8200,  y: 1100, creatureId: 'pebble', count: 1 },
    { x: 9700,  y: 1700, creatureId: 'pebble', count: 1 },
    { x: 11100, y: 1100, creatureId: 'pebble', count: 1 },
    { x: 1300,  y: 2700, creatureId: 'pebble', count: 1 },
    { x: 3300,  y: 2500, creatureId: 'pebble', count: 1 },
    { x: 5500,  y: 2900, creatureId: 'pebble', count: 1 },
    { x: 7500,  y: 2700, creatureId: 'pebble', count: 1 },
    { x: 9300,  y: 2500, creatureId: 'pebble', count: 1 },
    { x: 10700, y: 2900, creatureId: 'pebble', count: 1 },
    { x: 1900,  y: 4100, creatureId: 'pebble', count: 1 },
    { x: 3700,  y: 3700, creatureId: 'pebble', count: 1 },
    { x: 5500,  y: 4100, creatureId: 'pebble', count: 1 },
    { x: 7300,  y: 3900, creatureId: 'pebble', count: 1 },
    { x: 9100,  y: 4100, creatureId: 'pebble', count: 1 },
    { x: 10900, y: 3700, creatureId: 'pebble', count: 1 },
    { x: 1100,  y: 5300, creatureId: 'pebble', count: 1 },
    { x: 3100,  y: 5100, creatureId: 'pebble', count: 1 },
    { x: 4900,  y: 5300, creatureId: 'pebble', count: 1 },
    { x: 6700,  y: 5100, creatureId: 'pebble', count: 1 },
    { x: 8500,  y: 5300, creatureId: 'pebble', count: 1 },
    { x: 10300, y: 5100, creatureId: 'pebble', count: 1 },
    { x: 11200, y: 4700, creatureId: 'pebble', count: 1 },
    { x: 1700,  y: 6500, creatureId: 'pebble', count: 1 },
    { x: 4500,  y: 6900, creatureId: 'pebble', count: 1 },
    { x: 6900,  y: 6500, creatureId: 'pebble', count: 1 },
    { x: 9700,  y: 6700, creatureId: 'pebble', count: 1 },

    // Gusties — 30 (wind T1, learns Gust / mob_gust)
    { x: 1500,  y: 700,  creatureId: 'gusty', count: 1 },
    { x: 3500,  y: 1300, creatureId: 'gusty', count: 1 },
    { x: 5500,  y: 900,  creatureId: 'gusty', count: 1 },
    { x: 7500,  y: 1500, creatureId: 'gusty', count: 1 },
    { x: 9500,  y: 900,  creatureId: 'gusty', count: 1 },
    { x: 11200, y: 1300, creatureId: 'gusty', count: 1 },
    { x: 600,   y: 2100, creatureId: 'gusty', count: 1 },
    { x: 2700,  y: 2300, creatureId: 'gusty', count: 1 },
    { x: 4700,  y: 2700, creatureId: 'gusty', count: 1 },
    { x: 6700,  y: 2300, creatureId: 'gusty', count: 1 },
    { x: 8700,  y: 2500, creatureId: 'gusty', count: 1 },
    { x: 10500, y: 2300, creatureId: 'gusty', count: 1 },
    { x: 1700,  y: 3500, creatureId: 'gusty', count: 1 },
    { x: 4500,  y: 3700, creatureId: 'gusty', count: 1 },
    { x: 6500,  y: 3500, creatureId: 'gusty', count: 1 },
    { x: 8500,  y: 3700, creatureId: 'gusty', count: 1 },
    { x: 10300, y: 3500, creatureId: 'gusty', count: 1 },
    { x: 700,   y: 4900, creatureId: 'gusty', count: 1 },
    { x: 2700,  y: 4500, creatureId: 'gusty', count: 1 },
    { x: 4500,  y: 4900, creatureId: 'gusty', count: 1 },
    { x: 6300,  y: 4700, creatureId: 'gusty', count: 1 },
    { x: 8100,  y: 4900, creatureId: 'gusty', count: 1 },
    { x: 9900,  y: 4700, creatureId: 'gusty', count: 1 },
    { x: 11200, y: 5100, creatureId: 'gusty', count: 1 },
    { x: 1300,  y: 5900, creatureId: 'gusty', count: 1 },
    { x: 3300,  y: 6100, creatureId: 'gusty', count: 1 },
    { x: 5300,  y: 5900, creatureId: 'gusty', count: 1 },
    { x: 7100,  y: 6100, creatureId: 'gusty', count: 1 },
    { x: 9500,  y: 6100, creatureId: 'gusty', count: 1 },
    { x: 11000, y: 6900, creatureId: 'gusty', count: 1 },

    // Goblins — 20 (T1 dagger, learns Sting)
    { x: 1300,  y: 1000, creatureId: 'goblin', count: 1 },
    { x: 4100,  y: 1100, creatureId: 'goblin', count: 1 },
    { x: 6900,  y: 1500, creatureId: 'goblin', count: 1 },
    { x: 9700,  y: 1300, creatureId: 'goblin', count: 1 },
    { x: 11200, y: 2500, creatureId: 'goblin', count: 1 },
    { x: 600,   y: 2500, creatureId: 'goblin', count: 1 },
    { x: 2500,  y: 3500, creatureId: 'goblin', count: 1 },
    { x: 4900,  y: 3500, creatureId: 'goblin', count: 1 },
    { x: 7700,  y: 3300, creatureId: 'goblin', count: 1 },
    { x: 10200, y: 3700, creatureId: 'goblin', count: 1 },
    { x: 1100,  y: 4700, creatureId: 'goblin', count: 1 },
    { x: 3700,  y: 4700, creatureId: 'goblin', count: 1 },
    { x: 6100,  y: 4900, creatureId: 'goblin', count: 1 },
    { x: 8900,  y: 4900, creatureId: 'goblin', count: 1 },
    { x: 11100, y: 4500, creatureId: 'goblin', count: 1 },
    { x: 2100,  y: 6300, creatureId: 'goblin', count: 1 },
    { x: 4700,  y: 6500, creatureId: 'goblin', count: 1 },
    { x: 7300,  y: 6500, creatureId: 'goblin', count: 1 },
    { x: 9900,  y: 6300, creatureId: 'goblin', count: 1 },
    { x: 11200, y: 6500, creatureId: 'goblin', count: 1 },

    // Orcs — 15 scattered (regular Combat orcs; chief is in editor layout)
    { x: 1700,  y: 800,  creatureId: 'orc', count: 1 },
    { x: 5300,  y: 1100, creatureId: 'orc', count: 1 },
    { x: 8100,  y: 700,  creatureId: 'orc', count: 1 },
    { x: 10700, y: 1100, creatureId: 'orc', count: 1 },
    { x: 600,   y: 2900, creatureId: 'orc', count: 1 },
    { x: 3700,  y: 2700, creatureId: 'orc', count: 1 },
    { x: 6500,  y: 2900, creatureId: 'orc', count: 1 },
    { x: 9500,  y: 2700, creatureId: 'orc', count: 1 },
    { x: 11100, y: 3300, creatureId: 'orc', count: 1 },
    { x: 2300,  y: 4300, creatureId: 'orc', count: 1 },
    { x: 5700,  y: 4500, creatureId: 'orc', count: 1 },
    { x: 8700,  y: 4300, creatureId: 'orc', count: 1 },
    { x: 4100,  y: 5500, creatureId: 'orc', count: 1 },
    { x: 7700,  y: 5700, creatureId: 'orc', count: 1 },
    { x: 10500, y: 5500, creatureId: 'orc', count: 1 },

    // Scouts — 20 (T1 short bow, learns Bow Shot)
    { x: 1000,  y: 1400, creatureId: 'scout', count: 1 },
    { x: 3500,  y: 1700, creatureId: 'scout', count: 1 },
    { x: 5900,  y: 1500, creatureId: 'scout', count: 1 },
    { x: 8700,  y: 1300, creatureId: 'scout', count: 1 },
    { x: 11000, y: 1900, creatureId: 'scout', count: 1 },
    { x: 1500,  y: 3100, creatureId: 'scout', count: 1 },
    { x: 3900,  y: 3300, creatureId: 'scout', count: 1 },
    { x: 6900,  y: 3100, creatureId: 'scout', count: 1 },
    { x: 9500,  y: 3300, creatureId: 'scout', count: 1 },
    { x: 11200, y: 3900, creatureId: 'scout', count: 1 },
    { x: 700,   y: 4500, creatureId: 'scout', count: 1 },
    { x: 3100,  y: 4700, creatureId: 'scout', count: 1 },
    { x: 5500,  y: 4500, creatureId: 'scout', count: 1 },
    { x: 8300,  y: 4700, creatureId: 'scout', count: 1 },
    { x: 10300, y: 4700, creatureId: 'scout', count: 1 },
    { x: 1900,  y: 6300, creatureId: 'scout', count: 1 },
    { x: 4900,  y: 6100, creatureId: 'scout', count: 1 },
    { x: 7100,  y: 6300, creatureId: 'scout', count: 1 },
    { x: 9300,  y: 6100, creatureId: 'scout', count: 1 },
    { x: 11200, y: 6300, creatureId: 'scout', count: 1 },

    // Shamans — 20 (T1 nature, learns Summon Wolf)
    { x: 1200,  y: 700,  creatureId: 'shaman', count: 1 },
    { x: 4300,  y: 1500, creatureId: 'shaman', count: 1 },
    { x: 6700,  y: 700,  creatureId: 'shaman', count: 1 },
    { x: 9300,  y: 1500, creatureId: 'shaman', count: 1 },
    { x: 11000, y: 700,  creatureId: 'shaman', count: 1 },
    { x: 600,   y: 3300, creatureId: 'shaman', count: 1 },
    { x: 2900,  y: 3300, creatureId: 'shaman', count: 1 },
    { x: 5300,  y: 2700, creatureId: 'shaman', count: 1 },
    { x: 7900,  y: 3300, creatureId: 'shaman', count: 1 },
    { x: 10500, y: 2700, creatureId: 'shaman', count: 1 },
    { x: 1700,  y: 4900, creatureId: 'shaman', count: 1 },
    { x: 4500,  y: 4100, creatureId: 'shaman', count: 1 },
    { x: 6700,  y: 4900, creatureId: 'shaman', count: 1 },
    { x: 9100,  y: 4100, creatureId: 'shaman', count: 1 },
    { x: 11000, y: 4900, creatureId: 'shaman', count: 1 },
    { x: 2300,  y: 6500, creatureId: 'shaman', count: 1 },
    { x: 5500,  y: 6300, creatureId: 'shaman', count: 1 },
    { x: 7900,  y: 6500, creatureId: 'shaman', count: 1 },
    { x: 10100, y: 6300, creatureId: 'shaman', count: 1 },
    { x: 11200, y: 6700, creatureId: 'shaman', count: 1 },

    // Boars — 20 scattered for bq_boar quest (kill 3 wolves → ram).
    // Combat type, individual spawns; positions interleave with wolf packs.
    { x: 1100,  y: 900,  creatureId: 'boar', count: 1 },
    { x: 3300,  y: 1400, creatureId: 'boar', count: 1 },
    { x: 5500,  y: 700,  creatureId: 'boar', count: 1 },
    { x: 8400,  y: 900,  creatureId: 'boar', count: 1 },
    { x: 10700, y: 1400, creatureId: 'boar', count: 1 },
    { x: 1900,  y: 2500, creatureId: 'boar', count: 1 },
    { x: 4500,  y: 2700, creatureId: 'boar', count: 1 },
    { x: 7300,  y: 2500, creatureId: 'boar', count: 1 },
    { x: 9500,  y: 2700, creatureId: 'boar', count: 1 },
    { x: 2300,  y: 3900, creatureId: 'boar', count: 1 },
    { x: 5700,  y: 3700, creatureId: 'boar', count: 1 },
    { x: 7900,  y: 3900, creatureId: 'boar', count: 1 },
    { x: 10800, y: 3500, creatureId: 'boar', count: 1 },
    { x: 1500,  y: 5500, creatureId: 'boar', count: 1 },
    { x: 4100,  y: 5400, creatureId: 'boar', count: 1 },
    { x: 6700,  y: 5500, creatureId: 'boar', count: 1 },
    { x: 9000,  y: 5400, creatureId: 'boar', count: 1 },
    { x: 2900,  y: 6700, creatureId: 'boar', count: 1 },
    { x: 7000,  y: 6500, creatureId: 'boar', count: 1 },
    { x: 10500, y: 6700, creatureId: 'boar', count: 1 },

    // Grouse — 30 scattered for bq_grouse quest (survive 30s → neutral_heal).
    // Passive type. Placed far from safe zones (>1500px from Eshworth/Waldmar)
    // and near predators (foxes/wolves/bears) so the timer is meaningful.
    { x: 700,   y: 700,  creatureId: 'grouse', count: 1 },
    { x: 1900,  y: 1700, creatureId: 'grouse', count: 1 },
    { x: 3900,  y: 800,  creatureId: 'grouse', count: 1 },
    { x: 5700,  y: 1300, creatureId: 'grouse', count: 1 },
    { x: 7700,  y: 700,  creatureId: 'grouse', count: 1 },
    { x: 10000, y: 1100, creatureId: 'grouse', count: 1 },
    { x: 11200, y: 600,  creatureId: 'grouse', count: 1 },
    { x: 600,   y: 2300, creatureId: 'grouse', count: 1 },
    { x: 4700,  y: 1900, creatureId: 'grouse', count: 1 },
    { x: 6700,  y: 1700, creatureId: 'grouse', count: 1 },
    { x: 11200, y: 2100, creatureId: 'grouse', count: 1 },
    { x: 800,   y: 4100, creatureId: 'grouse', count: 1 },
    { x: 5400,  y: 4200, creatureId: 'grouse', count: 1 },
    { x: 7800,  y: 4300, creatureId: 'grouse', count: 1 },
    { x: 11100, y: 4100, creatureId: 'grouse', count: 1 },
    { x: 1400,  y: 5800, creatureId: 'grouse', count: 1 },
    { x: 3000,  y: 5500, creatureId: 'grouse', count: 1 },
    { x: 4400,  y: 5900, creatureId: 'grouse', count: 1 },
    { x: 6300,  y: 5700, creatureId: 'grouse', count: 1 },
    { x: 8400,  y: 5800, creatureId: 'grouse', count: 1 },
    { x: 9700,  y: 5500, creatureId: 'grouse', count: 1 },
    { x: 11100, y: 5900, creatureId: 'grouse', count: 1 },
    { x: 600,   y: 6900, creatureId: 'grouse', count: 1 },
    { x: 2200,  y: 6700, creatureId: 'grouse', count: 1 },
    { x: 3700,  y: 6900, creatureId: 'grouse', count: 1 },
    { x: 5200,  y: 6700, creatureId: 'grouse', count: 1 },
    { x: 6800,  y: 6900, creatureId: 'grouse', count: 1 },
    { x: 8500,  y: 6700, creatureId: 'grouse', count: 1 },
    { x: 9900,  y: 6900, creatureId: 'grouse', count: 1 },
    { x: 11200, y: 6700, creatureId: 'grouse', count: 1 },
  ],

  // Не-каравановые ветераны — рандомный разброс по карте (по 30 каждого).
  // orc_veteran НЕ здесь — он один (Вождь в орочьем лагере, через village.json).
  // Каравановые (scout/bandit_*_veteran) спавнятся у обоза/лагеря, не здесь.
  scatterSpawns: [
    { creatureId: 'goblin_veteran', count: 30 },
    { creatureId: 'wolf_veteran',   count: 30 },
    { creatureId: 'bear_veteran',   count: 30 },
  ],

  exits: [
    { edge: 'north', targetZone: 'water',  spawnX: PW / 2, spawnY: PH - 80 },
    { edge: 'south', targetZone: 'fire',   spawnX: PW / 2, spawnY: 80 },
    { edge: 'west',  targetZone: 'earth',  spawnX: PW - 80, spawnY: PH / 2 },
  ],

  caravans: [
    // Looping caravan event: departs Waldmar (A) → Eshworth (B), past the
    // raider camp (~5550,2350, hardcoded in Caravan.ts). Roster respawns every
    // cycle. WAIT_START=120s at A, WAIT_END=30s at B.
    // guardCount=15 balances the escort (15 guards + merchant-healer + scout_vet)
    // against the raid (7 base + 3 veterans). Sim puts the tossup around 15-18
    // guards — tune after playtest.
    {
      start: { x: WX, y: WY },   // Waldmar — departure (not player start)
      end:   { x: EX, y: EY },   // Eshworth — destination
      speed: 36,
      guardCount: 15,
    },
  ],

  resourceNodes: [],

  workbenches: [],

  npcs: [
    // Eshworth + Waldmar NPCs (Bert/Aldric/Mira/Pol/Stranger/Captain/Healer/Blacksmith)
    // temporarily removed — will return when each one has a proper sprite/role.
    // Vendors kept so the player can still buy/sell while testing.
    { x: EX + 20,  y: EY + 40,  id: 'merchant', nameRu: 'Лавка', nameEn: 'Shop', role: 'vendor' },
    { x: WX + 80,  y: WY + 40,  id: 'arms_dealer',nameRu: 'Оружие', nameEn: 'Arms', role: 'weapon_vendor' },
  ],

  questObjects: [
    // Temporarily removed — will add back after map layout is finalized
  ],
};

// ── 2. Ледяная зона (север) ─────────────────────────────────────────────────

export const ZONE_WATER: ZoneConfig = {
  id: 'water',
  nameRu: 'Туманное озеро',
  nameEn: 'Misty Lake',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x3377cc,
  respawnPoint: { x: PW / 2, y: PH - 200 },
  safeBounds: { x1: PW / 2 - 150, y1: PH - 320, x2: PW / 2 + 150, y2: PH - 80 },
  spawnGroups: [],
  exits: [
    { edge: 'south', targetZone: 'village', spawnX: PW / 2, spawnY: 80 },
  ],
  questObjects: [],
};

// ── 3. Огненная зона (юг) ───────────────────────────────────────────────────

export const ZONE_FIRE: ZoneConfig = {
  id: 'fire',
  nameRu: 'Пепельная роща',
  nameEn: 'Ashen Grove',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0xff7733,
  respawnPoint: { x: PW / 2, y: 200 },
  safeBounds: { x1: PW / 2 - 150, y1: 80, x2: PW / 2 + 150, y2: 320 },
  spawnGroups: [
    // Босс Игнис — в глубине рощи (юг). isBoss: HP-баннер, частота Печати.
    { x: PW / 2, y: PH - 500, creatureId: 'ignis', count: 1 },
    // Искры — малые огненные элементали (учитель Искры через квест тела)
    { x: 700,  y: 900,  creatureId: 'spark', count: 1 },
    { x: 1600, y: 1200, creatureId: 'spark', count: 1 },
    { x: 2600, y: 800,  creatureId: 'spark', count: 1 },
    { x: 3200, y: 1500, creatureId: 'spark', count: 1 },
    { x: 1100, y: 2000, creatureId: 'spark', count: 1 },
    { x: 2300, y: 2200, creatureId: 'spark', count: 1 },
    // Золовики — T2 огня
    { x: 900,  y: 2700, creatureId: 'asher', count: 1 },
    { x: 2000, y: 2900, creatureId: 'asher', count: 1 },
    { x: 3000, y: 2600, creatureId: 'asher', count: 1 },
  ],
  exits: [
    { edge: 'north', targetZone: 'village', spawnX: PW / 2, spawnY: PH - 80 },
  ],
  questObjects: [],
};

// ── 4. Ветряная зона (восток) ───────────────────────────────────────────────

export const ZONE_WIND: ZoneConfig = {
  id: 'wind',
  nameRu: 'Вершины ветров',
  nameEn: 'Wind Peaks',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x99ddbb,
  respawnPoint: { x: 200, y: PH / 2 },
  safeBounds: { x1: 80, y1: PH / 2 - 150, x2: 320, y2: PH / 2 + 150 },
  spawnGroups: [],
  exits: [
    { edge: 'west', targetZone: 'village', spawnX: PW - 80, spawnY: PH / 2 },
  ],
  questObjects: [],
};

// ── 5. Земляная зона (запад) ────────────────────────────────────────────────

export const ZONE_EARTH: ZoneConfig = {
  id: 'earth',
  nameRu: 'Каменные холмы',
  nameEn: 'Stone Hills',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x886633,
  respawnPoint: { x: PW - 200, y: PH / 2 },
  safeBounds: { x1: PW - 320, y1: PH / 2 - 150, x2: PW - 80, y2: PH / 2 + 150 },
  spawnGroups: [],
  exits: [
    { edge: 'east', targetZone: 'village', spawnX: 80, spawnY: PH / 2 },
    { edge: 'south', targetZone: 'cave', spawnX: PW / 2, spawnY: 80 },
  ],
  questObjects: [],
};

// ── 6. Лаборатория (паровой мир) — данж «Защита лаборатории» ────────────────
// Маленькая арена: Машина Переноса в центре, разрыв Пустоты на севере.
// Волны тварей спавнятся скриптом данжа в GameScene (labDungeon).

// Размер обрезан под мебель игрока (src/data/mapLayouts/lab.json). Машина и
// портал спозиционированы относительно мебели (динамо/катушка обрамляют Машину).
// Ландшафтная комната-арена (30×17 ≈ 16:9) — камера показывает всю целиком.
const LAB_W = 30;
const LAB_H = 17;
const LAB_MACHINE_X = 546;  // середина динамо/катушки (см. mapLayouts/lab.json)
const LAB_MACHINE_Y = 275;

export const ZONE_LAB: ZoneConfig = {
  id: 'lab',
  nameRu: 'Лаборатория — паровой мир',
  nameEn: 'The Laboratory — Steam World',
  widthTiles: LAB_W,
  heightTiles: LAB_H,
  baseTile: 'tile_stone',
  tint: 0x55585f, // холодный металл/камень
  // Игрок просыпается ВОЗЛЕ Машины (учёные будят его)
  respawnPoint: { x: LAB_MACHINE_X, y: LAB_MACHINE_Y + 110 },
  spawnGroups: [
    // Машина Переноса — защищаемый объект (immobile, фракция 'lab')
    { x: LAB_MACHINE_X, y: LAB_MACHINE_Y, creatureId: 'transfer_machine', count: 1 },
  ],
  exits: [], // выход — скриптом по победе/поражению
  questObjects: [],
};

// ── Реестр зон ───────────────────────────────────────────────────────────────

export const ALL_ZONES: Record<string, ZoneConfig> = {
  village:    ZONE_VILLAGE,
  water:      ZONE_WATER,
  fire:       ZONE_FIRE,
  wind:       ZONE_WIND,
  earth:      ZONE_EARTH,
  lab:        ZONE_LAB,
};
