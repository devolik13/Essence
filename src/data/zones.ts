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
}

export interface NPCSpawn {
  x: number; y: number;
  id: string;
  nameRu: string;
  role: 'vendor' | 'quest' | 'npc' | 'weapon_vendor';
}

export interface QuestObjectSpawn {
  x: number; y: number;
  objectId: string;
  nameRu: string;
  type: 'waypoint' | 'collectible' | 'destructible';
  icon: string;
  color: number;
}

export interface BiomeRegion {
  id: string;
  nameRu: string;
  bounds: { x1: number; y1: number; x2: number; y2: number };
  tint?: number;
}

export interface SafeZone {
  x1: number; y1: number; x2: number; y2: number;
  respawnPoint: { x: number; y: number };
  nameRu?: string;
}

export interface ZoneConfig {
  id: string;
  nameRu: string;
  widthTiles: number;
  heightTiles: number;
  baseTile: string;
  tint?: number;
  safeBounds?: { x1: number; y1: number; x2: number; y2: number };
  safeZones?: SafeZone[];
  biomes?: BiomeRegion[];
  respawnPoint: { x: number; y: number };
  spawnGroups: SpawnGroup[];
  exits: ZoneExit[];
  /** Resource gathering nodes */
  resourceNodes?: ResourceNodeSpawn[];
  /** Crafting workbenches */
  workbenches?: WorkbenchSpawn[];
  /** NPCs */
  npcs?: NPCSpawn[];
  /** Quest-related world objects (waypoints, collectibles, destructibles) */
  questObjects?: QuestObjectSpawn[];
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
const CAVE_X     = 2000;  // юго-запад
const CAVE_Y     = 5800;
const ROAD_MID_X = 6000;  // середина дороги
const ROAD_MID_Y = 2800;

// ── 1. Главная карта (Eshworth + Road + Waldmar + Cave) ─────────────────────
// 360×240 тайлов = 11520×7680 px
// Eshworth ~(3200, 2800), Waldmar ~(8800, 2800), Cave ~(2000, 5800)

const EX = ESHWORTH_X, EY = ESHWORTH_Y;
const WX = WALDMAR_X, WY = WALDMAR_Y;
const CX = CAVE_X, CY = CAVE_Y;

export const ZONE_VILLAGE: ZoneConfig = {
  id: 'village',
  nameRu: 'Eshworth Region',
  widthTiles: BIG_W,
  heightTiles: BIG_H,
  baseTile: 'tile_grass',
  respawnPoint: { x: EX, y: EY },
  safeBounds: { x1: EX - 256, y1: EY - 224, x2: EX + 256, y2: EY + 224 },

  safeZones: [
    { x1: EX - 256, y1: EY - 224, x2: EX + 256, y2: EY + 224,
      respawnPoint: { x: EX, y: EY }, nameRu: 'Eshworth' },
    { x1: WX - 256, y1: WY - 224, x2: WX + 256, y2: WY + 224,
      respawnPoint: { x: WX, y: WY }, nameRu: 'Waldmar' },
  ],

  biomes: [
    { id: 'eshworth', nameRu: 'Eshworth Village',
      bounds: { x1: EX - 1600, y1: EY - 1400, x2: EX + 1600, y2: EY + 1400 } },
    { id: 'trade_road', nameRu: 'Trade Road', tint: 0x77aa55,
      bounds: { x1: EX + 1600, y1: EY - 800, x2: WX - 1600, y2: EY + 800 } },
    { id: 'waldmar', nameRu: 'Waldmar', tint: 0x667755,
      bounds: { x1: WX - 1600, y1: WY - 1400, x2: WX + 1600, y2: WY + 1400 } },
    { id: 'cave', nameRu: 'Deep Mines', tint: 0x443322,
      bounds: { x1: CX - 1200, y1: CY - 1000, x2: CX + 1200, y2: CY + 1000 } },
  ],

  spawnGroups: [
    // ═══ ESHWORTH AREA ═══
    // Orcs — south
    { x: EX + 200,  y: EY + 900, creatureId: 'orc', count: 3 },
    { x: EX + 350,  y: EY + 1000, creatureId: 'orc', count: 2 },
    // Scouts — north-east
    { x: EX + 1000, y: EY - 500, creatureId: 'scout', count: 3 },
    { x: EX + 1150, y: EY - 550, creatureId: 'scout', count: 2 },

    // ═══ TRADE ROAD (between villages) ═══
    { x: ROAD_MID_X - 600, y: ROAD_MID_Y - 200, creatureId: 'bandit_archer', count: 3 },
    { x: ROAD_MID_X - 400, y: ROAD_MID_Y + 300, creatureId: 'bandit_crossbow', count: 2 },
    { x: ROAD_MID_X,       y: ROAD_MID_Y - 400, creatureId: 'bandit_spear', count: 3 },
    { x: ROAD_MID_X + 300, y: ROAD_MID_Y + 200, creatureId: 'bandit_brute', count: 2 },
    { x: ROAD_MID_X + 600, y: ROAD_MID_Y - 100, creatureId: 'scout', count: 3 },
    { x: ROAD_MID_X + 800, y: ROAD_MID_Y + 100, creatureId: 'orc', count: 3 },
    { x: ROAD_MID_X - 700, y: ROAD_MID_Y + 400, creatureId: 'bandit_spear_veteran', count: 1 },
    { x: ROAD_MID_X + 900, y: ROAD_MID_Y - 500, creatureId: 'bandit_archer_veteran', count: 1 },
    // ─── The Caravan (conflict_caravan) ───
    // Merchant + 4 guards parked at the cargo location.
    { x: ROAD_MID_X - 40,  y: ROAD_MID_Y - 10, creatureId: 'caravan_merchant', count: 1 },
    { x: ROAD_MID_X + 60,  y: ROAD_MID_Y - 50, creatureId: 'caravan_guard', count: 2 },
    { x: ROAD_MID_X - 80,  y: ROAD_MID_Y + 60, creatureId: 'caravan_guard', count: 2 },
    // 4 ambushers waiting in the treeline at the marked ambush points.
    { x: ROAD_MID_X - 400, y: ROAD_MID_Y - 100, creatureId: 'ambusher', count: 2 },
    { x: ROAD_MID_X + 400, y: ROAD_MID_Y + 100, creatureId: 'ambusher', count: 2 },

    // ═══ WALDMAR AREA ═══
    { x: WX - 500, y: WY + 500, creatureId: 'scout', count: 3 },
    { x: WX + 500, y: WY + 500, creatureId: 'scout', count: 3 },
    { x: WX + 600, y: WY - 800, creatureId: 'orc', count: 3 },
    { x: WX + 700, y: WY - 900, creatureId: 'orc_veteran', count: 1 },
    { x: WX + 700, y: WY + 700, creatureId: 'bandit_archer', count: 2 },
    { x: WX + 800, y: WY + 800, creatureId: 'bandit_crossbow', count: 2 },
    { x: WX + 750, y: WY + 600, creatureId: 'bandit_spear', count: 2 },

    // ═══ CAVE AREA (south-west) ═══
    { x: CX - 300, y: CY - 500, creatureId: 'pebble', count: 3 },
    { x: CX + 300, y: CY - 500, creatureId: 'mudder', count: 2 },
    { x: CX,       y: CY,       creatureId: 'pebble', count: 4 },
    { x: CX - 400, y: CY,       creatureId: 'mudder', count: 3 },
    { x: CX - 500, y: CY + 600, creatureId: 'mudder', count: 3 },
    { x: CX,       y: CY + 500, creatureId: 'pebble', count: 3 },
    { x: CX + 500, y: CY + 600, creatureId: 'mudder', count: 2 },
    { x: CX - 300, y: CY + 800, creatureId: 'orc_veteran', count: 1 },
    { x: CX + 300, y: CY + 800, creatureId: 'bandit_brute_veteran', count: 1 },
  ],

  exits: [
    { edge: 'north', targetZone: 'water',  spawnX: PW / 2, spawnY: PH - 80 },
    { edge: 'south', targetZone: 'fire',   spawnX: PW / 2, spawnY: 80 },
    { edge: 'west',  targetZone: 'earth',  spawnX: PW - 80, spawnY: PH / 2 },
  ],

  resourceNodes: [
    // Eshworth area
    { x: EX + 400, y: EY - 400, nodeId: 'copper_vein' },
    { x: EX + 450, y: EY - 350, nodeId: 'copper_vein' },
    { x: EX + 500, y: EY - 430, nodeId: 'copper_vein' },
    { x: EX - 400, y: EY - 400, nodeId: 'willow_tree' },
    { x: EX - 450, y: EY - 350, nodeId: 'willow_tree' },
    { x: EX - 500, y: EY - 430, nodeId: 'willow_tree' },
    { x: EX - 100, y: EY + 400, nodeId: 'hide_pile' },
    { x: EX + 50,  y: EY + 450, nodeId: 'hide_pile' },
    { x: EX - 50,  y: EY + 500, nodeId: 'hide_pile' },
    // Trade road
    { x: ROAD_MID_X - 500, y: ROAD_MID_Y - 500, nodeId: 'willow_tree' },
    { x: ROAD_MID_X + 200, y: ROAD_MID_Y - 600, nodeId: 'willow_tree' },
    { x: ROAD_MID_X + 600, y: ROAD_MID_Y + 500, nodeId: 'hide_pile' },
    { x: ROAD_MID_X - 300, y: ROAD_MID_Y + 600, nodeId: 'hide_pile' },
    // Waldmar area
    { x: WX + 400, y: WY - 400, nodeId: 'copper_vein' },
    { x: WX + 450, y: WY - 350, nodeId: 'copper_vein' },
    { x: WX - 400, y: WY + 400, nodeId: 'willow_tree' },
    { x: WX - 450, y: WY + 450, nodeId: 'willow_tree' },
    { x: WX + 300, y: WY + 400, nodeId: 'hide_pile' },
    { x: WX + 350, y: WY + 450, nodeId: 'hide_pile' },
    // Cave — rich mining
    { x: CX - 600, y: CY + 500, nodeId: 'copper_vein' },
    { x: CX - 500, y: CY + 550, nodeId: 'copper_vein' },
    { x: CX + 600, y: CY + 500, nodeId: 'copper_vein' },
    { x: CX + 500, y: CY + 450, nodeId: 'copper_vein' },
    { x: CX,       y: CY + 700, nodeId: 'copper_vein' },
  ],

  workbenches: [
    // Eshworth
    { x: EX - 180, y: EY - 120, type: 'armorer',     nameRu: 'Armorer' },
    { x: EX - 100, y: EY - 120, type: 'weaponsmith', nameRu: 'Weaponsmith' },
    { x: EX + 100, y: EY - 120, type: 'jeweler',     nameRu: 'Jeweler' },
    { x: EX + 180, y: EY - 120, type: 'runemaster',  nameRu: 'Runemaster' },
    // Waldmar
    { x: WX - 180, y: WY - 120, type: 'armorer',     nameRu: 'Armorer' },
    { x: WX - 100, y: WY - 120, type: 'weaponsmith', nameRu: 'Weaponsmith' },
    { x: WX + 100, y: WY - 120, type: 'jeweler',     nameRu: 'Jeweler' },
    { x: WX + 180, y: WY - 120, type: 'runemaster',  nameRu: 'Runemaster' },
  ],

  npcs: [
    // Temporarily removed — will add back after map layout is finalized
  ],

  questObjects: [
    // Temporarily removed — will add back after map layout is finalized
  ],
};

// ── 2. Ледяная зона (север) ─────────────────────────────────────────────────

export const ZONE_WATER: ZoneConfig = {
  id: 'water',
  nameRu: 'Misty Lake',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x3377cc,
  respawnPoint: { x: PW / 2, y: PH - 200 },
  safeBounds: { x1: PW / 2 - 150, y1: PH - 320, x2: PW / 2 + 150, y2: PH - 80 },
  spawnGroups: [
    // Начало зоны (юг — вход из деревни)
    { x: PW / 2 - 300, y: PH - 500, creatureId: 'splasher', count: 3 },
    { x: PW / 2 + 300, y: PH - 500, creatureId: 'fogger',   count: 2 },
    // Середина
    { x: PW / 2 - 500, y: PH / 2,   creatureId: 'splasher', count: 3 },
    { x: PW / 2,       y: PH / 2,   creatureId: 'fogger',   count: 3 },
    { x: PW / 2 + 500, y: PH / 2,   creatureId: 'splasher', count: 2 },
    { x: PW / 2 + 200, y: PH / 2 - 200, creatureId: 'fogger', count: 2 },
    // Разрушенный мост (центр-восток)
    { x: PW / 2 + 600, y: PH / 2 + 200, creatureId: 'splasher', count: 2 },
    { x: PW / 2 + 700, y: PH / 2 + 150, creatureId: 'fogger',   count: 2 },
    // Башня мага (запад)
    { x: PW / 2 - 700, y: PH / 2 - 200, creatureId: 'shaman',      count: 2 },
    { x: PW / 2 - 600, y: PH / 2 - 100, creatureId: 'spirit_wolf', count: 2 },
    // Глубже (север) — усиленные группы
    { x: PW / 2 - 400, y: 600, creatureId: 'splasher', count: 3 },
    { x: PW / 2,       y: 500, creatureId: 'fogger',   count: 3 },
    { x: PW / 2 + 400, y: 600, creatureId: 'splasher', count: 2 },
    { x: PW / 2 + 200, y: 400, creatureId: 'fogger',   count: 2 },
    // Ветераны T2 — глубже в зоне
    // Босс Акварис (центр-север)
    { x: PW / 2, y: 300, creatureId: 'aquaris', count: 1 },
  ],
  exits: [
    { edge: 'south', targetZone: 'village', spawnX: PW / 2, spawnY: 80 },
  ],
  questObjects: [],
};

// ── 3. Огненная зона (юг) ───────────────────────────────────────────────────

export const ZONE_FIRE: ZoneConfig = {
  id: 'fire',
  nameRu: 'Ashen Grove',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0xff7733,
  respawnPoint: { x: PW / 2, y: 200 },
  safeBounds: { x1: PW / 2 - 150, y1: 80, x2: PW / 2 + 150, y2: 320 },
  spawnGroups: [
    // Вход (север)
    { x: PW / 2 - 300, y: 500,  creatureId: 'spark', count: 3 },
    { x: PW / 2 + 300, y: 500,  creatureId: 'asher', count: 2 },
    // Середина
    { x: PW / 2 - 500, y: PH / 2,       creatureId: 'spark', count: 3 },
    { x: PW / 2,       y: PH / 2,       creatureId: 'asher', count: 3 },
    { x: PW / 2 + 500, y: PH / 2,       creatureId: 'spark', count: 2 },
    { x: PW / 2 + 200, y: PH / 2 + 200, creatureId: 'asher', count: 2 },
    // Глубже (юг)
    { x: PW / 2 - 400, y: PH - 600, creatureId: 'spark', count: 3 },
    { x: PW / 2,       y: PH - 500, creatureId: 'asher', count: 3 },
    { x: PW / 2 + 400, y: PH - 600, creatureId: 'spark', count: 2 },
    { x: PW / 2 + 200, y: PH - 700, creatureId: 'asher', count: 2 },
    // Лагерь разбойников (T1 молот, копьё, дл.лук, арбалет)
    { x: PW / 2 - 700, y: PH / 2 + 500, creatureId: 'bandit_brute', count: 2 },
    { x: PW / 2 - 600, y: PH / 2 + 550, creatureId: 'bandit_spear', count: 2 },
    { x: PW / 2 - 500, y: PH / 2 + 500, creatureId: 'bandit_archer', count: 2 },
    { x: PW / 2 - 650, y: PH / 2 + 600, creatureId: 'bandit_crossbow', count: 2 },
    // Ветераны T2 — глубже
    { x: PW / 2 - 600, y: PH - 400, creatureId: 'bandit_brute_veteran', count: 1 },
    { x: PW / 2 - 500, y: PH - 350, creatureId: 'bandit_spear_veteran', count: 1 },
    // Босс Игнис (центр-юг)
    { x: PW / 2, y: PH - 300, creatureId: 'ignis', count: 1 },
  ],
  exits: [
    { edge: 'north', targetZone: 'village', spawnX: PW / 2, spawnY: PH - 80 },
  ],
  questObjects: [],
};

// ── 4. Ветряная зона (восток) ───────────────────────────────────────────────

export const ZONE_WIND: ZoneConfig = {
  id: 'wind',
  nameRu: 'Wind Peaks',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x99ddbb,
  respawnPoint: { x: 200, y: PH / 2 },
  safeBounds: { x1: 80, y1: PH / 2 - 150, x2: 320, y2: PH / 2 + 150 },
  spawnGroups: [
    // Вход (запад)
    { x: 500,  y: PH / 2 - 200, creatureId: 'gusty',    count: 3 },
    { x: 500,  y: PH / 2 + 200, creatureId: 'whistler', count: 2 },
    // Середина
    { x: PW / 2 - 200, y: PH / 2 - 300, creatureId: 'gusty',    count: 3 },
    { x: PW / 2,       y: PH / 2,       creatureId: 'whistler', count: 3 },
    { x: PW / 2 + 200, y: PH / 2 + 300, creatureId: 'gusty',    count: 2 },
    { x: PW / 2,       y: PH / 2 - 500, creatureId: 'whistler', count: 2 },
    // Поляна духов (юг)
    // Глубже (восток)
    { x: PW - 600, y: PH / 2 - 300, creatureId: 'gusty',    count: 3 },
    { x: PW - 500, y: PH / 2,       creatureId: 'whistler', count: 3 },
    { x: PW - 600, y: PH / 2 + 300, creatureId: 'gusty',    count: 2 },
    // Ветераны T2 — глубже
    { x: PW - 400, y: PH / 2 - 100, creatureId: 'scout_veteran', count: 1 },
    { x: PW - 400, y: PH / 2 + 100, creatureId: 'orc_veteran',  count: 1 },
    // Шаманы
    { x: PW / 2 + 300, y: 400, creatureId: 'shaman', count: 2 },
    // Босс Аэрос (дальний восток)
    { x: PW - 300, y: PH / 2, creatureId: 'aeros', count: 1 },
  ],
  exits: [
    { edge: 'west', targetZone: 'village', spawnX: PW - 80, spawnY: PH / 2 },
  ],
  questObjects: [],
};

// ── 5. Земляная зона (запад) ────────────────────────────────────────────────

export const ZONE_EARTH: ZoneConfig = {
  id: 'earth',
  nameRu: 'Stone Hills',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x886633,
  respawnPoint: { x: PW - 200, y: PH / 2 },
  safeBounds: { x1: PW - 320, y1: PH / 2 - 150, x2: PW - 80, y2: PH / 2 + 150 },
  spawnGroups: [
    // Вход (восток)
    { x: PW - 500, y: PH / 2 - 200, creatureId: 'pebble', count: 3 },
    { x: PW - 500, y: PH / 2 + 200, creatureId: 'mudder', count: 2 },
    // Середина
    { x: PW / 2 + 200, y: PH / 2 - 300, creatureId: 'pebble', count: 3 },
    { x: PW / 2,       y: PH / 2,       creatureId: 'mudder', count: 3 },
    { x: PW / 2 - 200, y: PH / 2 + 300, creatureId: 'pebble', count: 2 },
    { x: PW / 2,       y: PH / 2 + 500, creatureId: 'mudder', count: 2 },
    // Заброшенная шахта (юго-запад)
    { x: 600,  y: PH - 600, creatureId: 'pebble', count: 3 },
    { x: 700,  y: PH - 500, creatureId: 'mudder', count: 2 },
    { x: 500,  y: PH - 450, creatureId: 'pebble', count: 2 },
    // Глубже (запад)
    { x: 600,  y: PH / 2 - 300, creatureId: 'pebble', count: 3 },
    { x: 500,  y: PH / 2,       creatureId: 'mudder', count: 3 },
    { x: 600,  y: PH / 2 + 300, creatureId: 'pebble', count: 2 },
    // Ветераны T2
    { x: 400,  y: PH / 2 - 100, creatureId: 'bandit_archer_veteran',   count: 1 },
    { x: 400,  y: PH / 2 + 100, creatureId: 'bandit_crossbow_veteran', count: 1 },
    // Волки-духи
    { x: 500,  y: 600,  creatureId: 'spirit_wolf', count: 2 },
    { x: 600,  y: 700,  creatureId: 'spirit_wolf', count: 2 },
    // Босс Терра (дальний запад)
    { x: 300, y: PH / 2, creatureId: 'terra', count: 1 },
  ],
  exits: [
    { edge: 'east', targetZone: 'village', spawnX: 80, spawnY: PH / 2 },
    { edge: 'south', targetZone: 'cave', spawnX: PW / 2, spawnY: 80 },
  ],
  questObjects: [],
};

// ── Реестр зон ───────────────────────────────────────────────────────────────

export const ALL_ZONES: Record<string, ZoneConfig> = {
  village:    ZONE_VILLAGE,
  water:      ZONE_WATER,
  fire:       ZONE_FIRE,
  wind:       ZONE_WIND,
  earth:      ZONE_EARTH,
};
