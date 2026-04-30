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
  ],

  spawnGroups: [
    // Wolves scattered across the map (~30 total, in 6 packs of 5).
    // Coordinates pick wide-open forest/wilderness, away from safe zones.
    { x: 5000, y: 1500, creatureId: 'wolf', count: 5 },  // North forest, east of Eshworth
    { x: 2000, y: 1200, creatureId: 'wolf', count: 5 },  // Far NW wilderness
    { x: 6500, y: 4500, creatureId: 'wolf', count: 5 },  // East-central woods
    { x: 7000, y: 6500, creatureId: 'wolf', count: 5 },  // South-east clearing
    { x: 3500, y: 5000, creatureId: 'wolf', count: 5 },  // South of Eshworth
    { x: 8000, y: 1500, creatureId: 'wolf', count: 5 },  // North of Waldmar
  ],

  exits: [
    { edge: 'north', targetZone: 'water',  spawnX: PW / 2, spawnY: PH - 80 },
    { edge: 'south', targetZone: 'fire',   spawnX: PW / 2, spawnY: 80 },
    { edge: 'west',  targetZone: 'earth',  spawnX: PW - 80, spawnY: PH / 2 },
  ],

  caravans: [
    // Cleared along with all other map mobs. Will be re-added under the
    // "skills first" design pass once caravan_guard / caravan_merchant
    // teach distinct, undisputed abilities.
  ],

  resourceNodes: [],

  workbenches: [],

  npcs: [
    // ═══ ESHWORTH NPCs ═══
    { x: EX - 80,  y: EY - 60,  id: 'bert',     nameRu: 'Bert',    role: 'npc' },
    { x: EX + 60,  y: EY - 40,  id: 'aldric',   nameRu: 'Aldric',  role: 'npc' },
    { x: EX - 40,  y: EY + 60,  id: 'mira',     nameRu: 'Mira',    role: 'npc' },
    { x: EX + 90,  y: EY + 80,  id: 'pol',      nameRu: 'Pol',     role: 'npc' },
    { x: EX - 120, y: EY + 100, id: 'stranger', nameRu: '???',     role: 'npc' },
    { x: EX + 20,  y: EY + 40,  id: 'merchant', nameRu: 'Shop',    role: 'vendor' },
    // ═══ WALDMAR NPCs ═══
    { x: WX - 60,  y: WY - 60,  id: 'captain',    nameRu: 'Vern',   role: 'npc' },
    { x: WX + 60,  y: WY - 40,  id: 'healer',     nameRu: 'Lena',   role: 'npc' },
    { x: WX - 40,  y: WY + 60,  id: 'blacksmith', nameRu: 'Gorm',   role: 'npc' },
    { x: WX + 80,  y: WY + 40,  id: 'arms_dealer',nameRu: 'Arms',   role: 'weapon_vendor' },
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
  spawnGroups: [],
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
  spawnGroups: [],
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
  spawnGroups: [],
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
  spawnGroups: [],
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
