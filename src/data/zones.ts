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

export interface ZoneConfig {
  id: string;
  nameRu: string;
  widthTiles: number;
  heightTiles: number;
  baseTile: string;
  tint?: number;
  safeBounds?: { x1: number; y1: number; x2: number; y2: number };
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
const ZONE_W = 120; // тайлов
const ZONE_H = 100; // тайлов
const T = 32;       // размер тайла
const PW = ZONE_W * T; // 3840 px
const PH = ZONE_H * T; // 3200 px

// ── 1. Деревня (центр) ──────────────────────────────────────────────────────

export const ZONE_VILLAGE: ZoneConfig = {
  id: 'village',
  nameRu: 'Eshworth Village',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  respawnPoint: { x: PW / 2, y: PH / 2 },
  safeBounds: { x1: PW / 2 - 256, y1: PH / 2 - 224, x2: PW / 2 + 256, y2: PH / 2 + 224 },
  spawnGroups: [
    // Пассивные — внутри деревни
    { x: PW / 2 - 200, y: PH / 2 + 160, creatureId: 'rabbit', count: 4 },
    { x: PW / 2 - 100, y: PH / 2 + 180, creatureId: 'rabbit', count: 3 },
    // Духи — рядом с деревней
    { x: PW / 2 + 350, y: PH / 2 - 300, creatureId: 'spirit', count: 2 },
    { x: PW / 2 - 400, y: PH / 2 - 250, creatureId: 'spirit', count: 1 },

    // ── Тренировочные манекены (рядом с деревней, слева) ────
    { x: PW / 2 - 350, y: PH / 2 + 50,  creatureId: 'dummy_xp', count: 5 },
    { x: PW / 2 - 350, y: PH / 2 + 150, creatureId: 'dummy_xp', count: 5 },
    // Обучатели заклинаниям (ниже манекенов)
    { x: PW / 2 - 200, y: PH / 2 + 300, creatureId: 'dummy_fire_t1', count: 1 },
    { x: PW / 2 - 300, y: PH / 2 + 300, creatureId: 'dummy_fire_arrow', count: 1 },
    { x: PW / 2 - 400, y: PH / 2 + 300, creatureId: 'dummy_fire_wall', count: 1 },
    { x: PW / 2 - 500, y: PH / 2 + 300, creatureId: 'dummy_arrow_rain', count: 1 },
    { x: PW / 2 - 600, y: PH / 2 + 300, creatureId: 'dummy_sweep', count: 1 },
    { x: PW / 2 - 700, y: PH / 2 + 300, creatureId: 'dummy_fireball', count: 1 },
    { x: PW / 2 - 800, y: PH / 2 + 300, creatureId: 'dummy_bark', count: 1 },

    // ── Боевые мобы (далеко от респауна) ─────────────────
    // Гоблины — далеко восток (T1 кинжал)
    { x: PW / 2 + 900, y: PH / 2 - 100, creatureId: 'goblin', count: 3 },
    { x: PW / 2 + 900, y: PH / 2 + 100, creatureId: 'goblin', count: 3 },
    { x: PW / 2 + 1100, y: PH / 2,      creatureId: 'goblin', count: 2 },
    // Волки — далеко юго-восток (T1 меч)
    { x: PW / 2 + 800, y: PH / 2 + 500, creatureId: 'wolf', count: 3 },
    { x: PW / 2 + 700, y: PH / 2 + 650, creatureId: 'wolf', count: 2 },
    // Медведи — далеко запад (T1 булава)
    { x: PW / 2 - 900, y: PH / 2 + 300, creatureId: 'bear', count: 2 },
    { x: PW / 2 - 1000, y: PH / 2 + 450, creatureId: 'bear', count: 2 },
    // Орки — далеко юг (T1 двуручник)
    { x: PW / 2 + 200, y: PH / 2 + 900, creatureId: 'orc', count: 3 },
    { x: PW / 2 + 350, y: PH / 2 + 1000, creatureId: 'orc', count: 2 },
    // Разведчики — далеко северо-восток (T1 кор.лук)
    { x: PW / 2 + 1000, y: PH / 2 - 500, creatureId: 'scout', count: 3 },
    { x: PW / 2 + 1150, y: PH / 2 - 550, creatureId: 'scout', count: 2 },
  ],
  exits: [
    { edge: 'north', targetZone: 'water',  spawnX: PW / 2, spawnY: PH - 80 },
    { edge: 'south', targetZone: 'fire',   spawnX: PW / 2, spawnY: 80 },
    { edge: 'east',  targetZone: 'wind',   spawnX: 80,     spawnY: PH / 2 },
    { edge: 'west',  targetZone: 'earth',  spawnX: PW - 80, spawnY: PH / 2 },
  ],

  // Resource nodes — near exits, outside safe zone
  resourceNodes: [
    // Mining (copper) — north-east
    { x: PW / 2 + 400, y: PH / 2 - 400, nodeId: 'copper_vein' },
    { x: PW / 2 + 450, y: PH / 2 - 350, nodeId: 'copper_vein' },
    { x: PW / 2 + 500, y: PH / 2 - 430, nodeId: 'copper_vein' },
    // Woodcutting (willow) — north-west
    { x: PW / 2 - 400, y: PH / 2 - 400, nodeId: 'willow_tree' },
    { x: PW / 2 - 450, y: PH / 2 - 350, nodeId: 'willow_tree' },
    { x: PW / 2 - 500, y: PH / 2 - 430, nodeId: 'willow_tree' },
    // Trophy (hide) — south
    { x: PW / 2 - 100, y: PH / 2 + 400, nodeId: 'hide_pile' },
    { x: PW / 2 + 50,  y: PH / 2 + 450, nodeId: 'hide_pile' },
    { x: PW / 2 - 50,  y: PH / 2 + 500, nodeId: 'hide_pile' },
  ],

  // Workbenches — inside safe zone
  workbenches: [
    { x: PW / 2 - 180, y: PH / 2 - 120, type: 'armorer',      nameRu: 'Armorer' },
    { x: PW / 2 - 100, y: PH / 2 - 120, type: 'weaponsmith',  nameRu: 'Weaponsmith' },
    { x: PW / 2 + 100, y: PH / 2 - 120, type: 'jeweler',      nameRu: 'Jeweler' },
    { x: PW / 2 + 180, y: PH / 2 - 120, type: 'runemaster',   nameRu: 'Runemaster' },
  ],

  // NPCs
  npcs: [
    { x: PW / 2, y: PH / 2 - 160, id: 'vendor', nameRu: 'Merchant', role: 'vendor' },
    { x: PW / 2 - 150, y: PH / 2 - 80, id: 'aldric', nameRu: 'Aldric', role: 'npc' },
    { x: PW / 2 + 150, y: PH / 2 - 80, id: 'pol', nameRu: 'Pol', role: 'npc' },
    { x: PW / 2 + 200, y: PH / 2 + 100, id: 'mira', nameRu: 'Mira', role: 'npc' },
    { x: PW / 2 - 200, y: PH / 2 + 100, id: 'bert', nameRu: 'Bert', role: 'npc' },
    { x: PW / 2 - 200, y: PH / 2 - 160, id: 'stranger', nameRu: '???', role: 'npc' },
    { x: PW / 2 + 200, y: PH / 2 - 160, id: 'weapon_vendor', nameRu: 'Arms Dealer', role: 'weapon_vendor' },
  ],
  questObjects: [
    // Rabbit quest: burrow
    { x: PW / 2 - 350, y: PH / 2 + 300, objectId: 'burrow', nameRu: 'Burrow', type: 'waypoint', icon: '🕳', color: 0x886644 },
    // Scout quest: 3 checkpoints along trade road
    { x: PW / 2 + 600, y: PH / 2 - 200, objectId: 'checkpoint', nameRu: 'Checkpoint', type: 'waypoint', icon: '🚩', color: 0xddaa33 },
    { x: PW / 2 + 400, y: PH / 2 + 400, objectId: 'checkpoint', nameRu: 'Checkpoint', type: 'waypoint', icon: '🚩', color: 0xddaa33 },
    { x: PW / 2 - 500, y: PH / 2 + 600, objectId: 'checkpoint', nameRu: 'Checkpoint', type: 'waypoint', icon: '🚩', color: 0xddaa33 },
    // Goblin quest: camp supplies to steal
    { x: PW / 2 + 1000, y: PH / 2 - 200, objectId: 'camp_supplies', nameRu: 'Supplies', type: 'collectible', icon: '📦', color: 0xaa8855 },
    { x: PW / 2 + 1050, y: PH / 2 - 120, objectId: 'camp_supplies', nameRu: 'Supplies', type: 'collectible', icon: '📦', color: 0xaa8855 },
    { x: PW / 2 + 950,  y: PH / 2 - 50,  objectId: 'camp_supplies', nameRu: 'Supplies', type: 'collectible', icon: '📦', color: 0xaa8855 },
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
    { x: PW / 2 - 600, y: 400, creatureId: 'wolf_veteran', count: 1 },
    { x: PW / 2 + 600, y: 450, creatureId: 'bear_veteran', count: 1 },
    // Босс Акварис (центр-север)
    { x: PW / 2, y: 300, creatureId: 'aquaris', count: 1 },
  ],
  exits: [
    { edge: 'south', targetZone: 'village', spawnX: PW / 2, spawnY: 80 },
  ],
  questObjects: [
    // Fogger quest: 4 fog nodes
    { x: PW / 2 - 400, y: 800, objectId: 'fog_node', nameRu: 'Fog Node', type: 'waypoint', icon: '🌫', color: 0x6699cc },
    { x: PW / 2 + 300, y: 600, objectId: 'fog_node', nameRu: 'Fog Node', type: 'waypoint', icon: '🌫', color: 0x6699cc },
    { x: PW / 2 - 200, y: 400, objectId: 'fog_node', nameRu: 'Fog Node', type: 'waypoint', icon: '🌫', color: 0x6699cc },
    { x: PW / 2 + 500, y: 350, objectId: 'fog_node', nameRu: 'Fog Node', type: 'waypoint', icon: '🌫', color: 0x6699cc },
    // Spirit wolf quest: wounded human
    { x: PW / 2 - 500, y: PH / 2 + 200, objectId: 'wounded_human', nameRu: 'Wounded Human', type: 'waypoint', icon: '💔', color: 0xcc4444 },
  ],
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
    // Дом ведьмы (восток)
    { x: PW / 2 + 700, y: PH / 2 + 400, creatureId: 'goblin', count: 3 },
    { x: PW / 2 + 800, y: PH / 2 + 450, creatureId: 'goblin_veteran', count: 1 },
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
    { x: PW / 2 + 500, y: PH - 400, creatureId: 'goblin_veteran', count: 1 },
    // Босс Игнис (центр-юг)
    { x: PW / 2, y: PH - 300, creatureId: 'ignis', count: 1 },
  ],
  exits: [
    { edge: 'north', targetZone: 'village', spawnX: PW / 2, spawnY: PH - 80 },
  ],
  questObjects: [
    // Spark quest: 3 lost sparks to collect
    { x: PW / 2 - 400, y: PH / 2 - 200, objectId: 'lost_spark', nameRu: 'Lost Spark', type: 'collectible', icon: '✨', color: 0xff6633 },
    { x: PW / 2 + 300, y: PH / 2 + 100, objectId: 'lost_spark', nameRu: 'Lost Spark', type: 'collectible', icon: '✨', color: 0xff6633 },
    { x: PW / 2 + 600, y: PH - 700,     objectId: 'lost_spark', nameRu: 'Lost Spark', type: 'collectible', icon: '✨', color: 0xff6633 },
    // Asher quest: 3 border marks
    { x: PW / 2 - 600, y: 800,  objectId: 'border_mark', nameRu: 'Border', type: 'waypoint', icon: '🔥', color: 0xff4422 },
    { x: PW / 2,       y: 500,  objectId: 'border_mark', nameRu: 'Border', type: 'waypoint', icon: '🔥', color: 0xff4422 },
    { x: PW / 2 + 600, y: 700,  objectId: 'border_mark', nameRu: 'Border', type: 'waypoint', icon: '🔥', color: 0xff4422 },
  ],
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
    { x: PW / 2 - 300, y: PH - 600, creatureId: 'spirit', count: 2 },
    { x: PW / 2,       y: PH - 500, creatureId: 'spirit', count: 2 },
    { x: PW / 2 + 300, y: PH - 650, creatureId: 'spirit', count: 1 },
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
    { edge: 'south', targetZone: 'trade_road', spawnX: PW / 2, spawnY: 80 },
  ],
  questObjects: [
    // Gusty quest: summit
    { x: PW - 400, y: 300, objectId: 'summit', nameRu: 'Summit', type: 'waypoint', icon: '⛰', color: 0xaaddcc },
    // Whistler quest: wind blocker
    { x: PW / 2 + 200, y: PH - 400, objectId: 'wind_blocker', nameRu: 'Obstruction', type: 'destructible', icon: '🪨', color: 0x776655 },
  ],
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
  questObjects: [
    // Pebble quest: cave breach
    { x: 500, y: PH - 400, objectId: 'cave_breach', nameRu: 'Breach', type: 'waypoint', icon: '🕳', color: 0x554433 },
    // Mudder quest: 3 rock walls to break + water source
    { x: 800, y: PH / 2 + 300, objectId: 'rock_wall', nameRu: 'Rock Wall', type: 'destructible', icon: '🧱', color: 0x665544 },
    { x: 600, y: PH / 2,       objectId: 'rock_wall', nameRu: 'Rock Wall', type: 'destructible', icon: '🧱', color: 0x665544 },
    { x: 400, y: PH / 2 - 200, objectId: 'rock_wall', nameRu: 'Rock Wall', type: 'destructible', icon: '🧱', color: 0x665544 },
    { x: 300, y: PH / 2 - 400, objectId: 'water_source', nameRu: 'Water Source', type: 'waypoint', icon: '💧', color: 0x4488cc },
    // Shaman quest: spirit clearing
    { x: PW / 2, y: 500, objectId: 'spirit_clearing', nameRu: 'Spirit Clearing', type: 'waypoint', icon: '🌿', color: 0x44aa44 },
  ],
};

// ── 6. Пещера (юг от Stone Hills) ───────────────────────────────────────────

export const ZONE_CAVE: ZoneConfig = {
  id: 'cave',
  nameRu: 'Deep Mines',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x443322,
  respawnPoint: { x: PW / 2, y: 200 },
  safeBounds: { x1: PW / 2 - 150, y1: 80, x2: PW / 2 + 150, y2: 320 },
  spawnGroups: [
    // Entry — pebbles and mudders
    { x: PW / 2 - 300, y: 500, creatureId: 'pebble', count: 3 },
    { x: PW / 2 + 300, y: 500, creatureId: 'mudder', count: 2 },
    // Abandoned tunnels — wolves hiding in the dark
    { x: PW / 2 - 600, y: PH / 2 - 300, creatureId: 'wolf', count: 3 },
    { x: PW / 2 + 500, y: PH / 2 - 200, creatureId: 'wolf_veteran', count: 1 },
    // Mid-cave — earth elementals + bears
    { x: PW / 2, y: PH / 2, creatureId: 'pebble', count: 4 },
    { x: PW / 2 - 400, y: PH / 2, creatureId: 'mudder', count: 3 },
    { x: PW / 2 + 400, y: PH / 2 + 200, creatureId: 'bear', count: 2 },
    { x: PW / 2 - 200, y: PH / 2 + 400, creatureId: 'bear_veteran', count: 1 },
    // Deep mine — tough creatures
    { x: PW / 2 - 500, y: PH - 600, creatureId: 'mudder', count: 3 },
    { x: PW / 2, y: PH - 500, creatureId: 'pebble', count: 3 },
    { x: PW / 2 + 500, y: PH - 600, creatureId: 'mudder', count: 2 },
    // Veterans guarding ore deposits
    { x: PW / 2 - 300, y: PH - 400, creatureId: 'orc_veteran', count: 1 },
    { x: PW / 2 + 300, y: PH - 400, creatureId: 'bandit_brute_veteran', count: 1 },
  ],
  exits: [
    { edge: 'north', targetZone: 'earth', spawnX: PW / 2, spawnY: PH - 80 },
  ],
  resourceNodes: [
    // Rich mining deposits
    { x: PW / 2 - 600, y: PH - 500, nodeId: 'copper_vein' },
    { x: PW / 2 - 500, y: PH - 550, nodeId: 'copper_vein' },
    { x: PW / 2 + 600, y: PH - 500, nodeId: 'copper_vein' },
    { x: PW / 2 + 500, y: PH - 450, nodeId: 'copper_vein' },
    { x: PW / 2,       y: PH - 700, nodeId: 'copper_vein' },
  ],
  questObjects: [
    // Bandit crossbow quest: fort lock + guards approach from south
    { x: PW / 2, y: PH - 300, objectId: 'fort_lock', nameRu: 'Fort Lock', type: 'destructible', icon: '🔒', color: 0x888888 },
    // Bandit brute quest: watchtower to destroy
    { x: PW / 2 + 700, y: PH / 2, objectId: 'watchtower', nameRu: 'Watchtower', type: 'destructible', icon: '🗼', color: 0x996633 },
  ],
};

// ── 7. Торговый тракт (между деревнями) ─────────────────────────────────────

export const ZONE_TRADE_ROAD: ZoneConfig = {
  id: 'trade_road',
  nameRu: 'Trade Road',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x77aa55,
  respawnPoint: { x: PW / 2, y: 200 },
  safeBounds: { x1: PW / 2 - 150, y1: 80, x2: PW / 2 + 150, y2: 320 },
  spawnGroups: [
    // Bandits along the road — ambush points
    { x: PW / 2 - 600, y: PH / 2 - 200, creatureId: 'bandit_archer', count: 3 },
    { x: PW / 2 - 400, y: PH / 2 + 300, creatureId: 'bandit_crossbow', count: 2 },
    { x: PW / 2, y: PH / 2 - 400, creatureId: 'bandit_spear', count: 3 },
    { x: PW / 2 + 300, y: PH / 2 + 200, creatureId: 'bandit_brute', count: 2 },
    // Road patrols — scouts and orcs
    { x: PW / 2 + 600, y: PH / 2 - 100, creatureId: 'scout', count: 3 },
    { x: PW / 2 + 800, y: PH / 2 + 100, creatureId: 'orc', count: 3 },
    // Forest creatures — wolves, bears in woods off the road
    { x: PW / 2 - 800, y: 600, creatureId: 'wolf', count: 4 },
    { x: PW / 2 + 700, y: PH - 600, creatureId: 'bear', count: 3 },
    { x: PW / 2 - 300, y: PH - 500, creatureId: 'wolf', count: 3 },
    // Veterans — deeper in forests
    { x: PW / 2 - 700, y: PH - 400, creatureId: 'bandit_spear_veteran', count: 1 },
    { x: PW / 2 + 900, y: 500, creatureId: 'bandit_archer_veteran', count: 1 },
    // Goblin camp off the road
    { x: PW / 2 + 400, y: 400, creatureId: 'goblin', count: 4 },
    { x: PW / 2 + 500, y: 500, creatureId: 'goblin_veteran', count: 1 },
  ],
  exits: [
    { edge: 'north', targetZone: 'wind', spawnX: PW / 2, spawnY: PH - 80 },
    { edge: 'east', targetZone: 'waldmar', spawnX: 80, spawnY: PH / 2 },
  ],
  resourceNodes: [
    // Scattered nodes along the road
    { x: PW / 2 - 500, y: PH / 2 - 500, nodeId: 'willow_tree' },
    { x: PW / 2 + 200, y: PH / 2 - 600, nodeId: 'willow_tree' },
    { x: PW / 2 + 600, y: PH / 2 + 500, nodeId: 'hide_pile' },
    { x: PW / 2 - 300, y: PH / 2 + 600, nodeId: 'hide_pile' },
  ],
  questObjects: [
    // Caravan quest objects — cargo to steal/protect
    { x: PW / 2, y: PH / 2, objectId: 'caravan_cargo', nameRu: 'Cargo', type: 'collectible', icon: '🏷', color: 0xddbb44 },
    // Ambush waypoints
    { x: PW / 2 - 400, y: PH / 2 - 100, objectId: 'ambush_point', nameRu: 'Ambush Point', type: 'waypoint', icon: '⚔', color: 0xcc3333 },
    { x: PW / 2 + 400, y: PH / 2 + 100, objectId: 'ambush_point', nameRu: 'Ambush Point', type: 'waypoint', icon: '⚔', color: 0xcc3333 },
  ],
};

// ── 8. Вальдмар (вторая деревня, восточнее) ─────────────────────────────────

export const ZONE_WALDMAR: ZoneConfig = {
  id: 'waldmar',
  nameRu: 'Waldmar',
  widthTiles: ZONE_W,
  heightTiles: ZONE_H,
  baseTile: 'tile_grass',
  tint: 0x667755,
  respawnPoint: { x: PW / 2, y: PH / 2 },
  safeBounds: { x1: PW / 2 - 256, y1: PH / 2 - 224, x2: PW / 2 + 256, y2: PH / 2 + 224 },
  spawnGroups: [
    // Passive — near town
    { x: PW / 2 - 200, y: PH / 2 + 200, creatureId: 'rabbit', count: 5 },
    { x: PW / 2 + 300, y: PH / 2 + 300, creatureId: 'rabbit', count: 3 },
    // Spirits near the graveyard (north)
    { x: PW / 2 - 400, y: PH / 2 - 500, creatureId: 'spirit', count: 3 },
    { x: PW / 2 + 200, y: PH / 2 - 600, creatureId: 'spirit', count: 2 },
    // Guards patrol outside (south) — scouts
    { x: PW / 2 - 500, y: PH / 2 + 500, creatureId: 'scout', count: 3 },
    { x: PW / 2 + 500, y: PH / 2 + 500, creatureId: 'scout', count: 3 },
    // Wolves in the forest (east)
    { x: PW / 2 + 800, y: PH / 2 - 200, creatureId: 'wolf', count: 3 },
    { x: PW / 2 + 900, y: PH / 2 + 100, creatureId: 'wolf_veteran', count: 1 },
    // Bears in the forest (west)
    { x: PW / 2 - 800, y: PH / 2 + 200, creatureId: 'bear', count: 2 },
    { x: PW / 2 - 900, y: PH / 2 - 100, creatureId: 'bear_veteran', count: 1 },
    // Orcs raiding from north
    { x: PW / 2 + 600, y: 400, creatureId: 'orc', count: 3 },
    { x: PW / 2 + 700, y: 300, creatureId: 'orc_veteran', count: 1 },
    // Bandit camp south-east
    { x: PW / 2 + 700, y: PH - 500, creatureId: 'bandit_archer', count: 2 },
    { x: PW / 2 + 800, y: PH - 400, creatureId: 'bandit_crossbow', count: 2 },
    { x: PW / 2 + 750, y: PH - 600, creatureId: 'bandit_spear', count: 2 },
  ],
  exits: [
    { edge: 'west', targetZone: 'trade_road', spawnX: PW - 80, spawnY: PH / 2 },
  ],
  npcs: [
    { x: PW / 2, y: PH / 2 - 160, id: 'waldmar_vendor', nameRu: 'Merchant', role: 'vendor' },
    { x: PW / 2 - 150, y: PH / 2 - 80, id: 'captain', nameRu: 'Captain Vern', role: 'npc' },
    { x: PW / 2 + 150, y: PH / 2 - 80, id: 'healer', nameRu: 'Healer Lena', role: 'npc' },
    { x: PW / 2 - 200, y: PH / 2 + 100, id: 'blacksmith', nameRu: 'Blacksmith Gorm', role: 'npc' },
    { x: PW / 2 + 200, y: PH / 2 - 160, id: 'waldmar_arms', nameRu: 'Arms Dealer', role: 'weapon_vendor' },
  ],
  workbenches: [
    { x: PW / 2 - 180, y: PH / 2 - 120, type: 'armorer', nameRu: 'Armorer' },
    { x: PW / 2 - 100, y: PH / 2 - 120, type: 'weaponsmith', nameRu: 'Weaponsmith' },
    { x: PW / 2 + 100, y: PH / 2 - 120, type: 'jeweler', nameRu: 'Jeweler' },
    { x: PW / 2 + 180, y: PH / 2 - 120, type: 'runemaster', nameRu: 'Runemaster' },
  ],
  resourceNodes: [
    // Mining (copper) — north
    { x: PW / 2 + 400, y: PH / 2 - 400, nodeId: 'copper_vein' },
    { x: PW / 2 + 450, y: PH / 2 - 350, nodeId: 'copper_vein' },
    // Woodcutting — south-west
    { x: PW / 2 - 400, y: PH / 2 + 400, nodeId: 'willow_tree' },
    { x: PW / 2 - 450, y: PH / 2 + 450, nodeId: 'willow_tree' },
    // Trophy — south-east
    { x: PW / 2 + 300, y: PH / 2 + 400, nodeId: 'hide_pile' },
    { x: PW / 2 + 350, y: PH / 2 + 450, nodeId: 'hide_pile' },
  ],
};

// ── Реестр зон ───────────────────────────────────────────────────────────────

export const ALL_ZONES: Record<string, ZoneConfig> = {
  village:    ZONE_VILLAGE,
  water:      ZONE_WATER,
  fire:       ZONE_FIRE,
  wind:       ZONE_WIND,
  earth:      ZONE_EARTH,
  cave:       ZONE_CAVE,
  trade_road: ZONE_TRADE_ROAD,
  waldmar:    ZONE_WALDMAR,
};
