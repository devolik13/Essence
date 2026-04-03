// ─── Размеры мира ──────────────────────────────────────
export const TILE_SIZE = 32;
export const MAP_WIDTH_TILES = 60;
export const MAP_HEIGHT_TILES = 40;
export const MAP_WIDTH = MAP_WIDTH_TILES * TILE_SIZE;
export const MAP_HEIGHT = MAP_HEIGHT_TILES * TILE_SIZE;

// ─── Игровой экран ─────────────────────────────────────
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

// ─── Движение ──────────────────────────────────────────
export const SPHERE_SPEED = 200;       // пикс/сек в астрале
export const BODY_SPEED = 150;         // пикс/сек в теле
export const CREATURE_SPEED = 80;      // пикс/сек мобы

// ─── Боевые константы ──────────────────────────────────
export const CRIT_MULTIPLIER = 1.5;
export const ARMOR_CONSTANT = 125;     // Стойкость / (Стойкость + 125)
export const WILL_CONSTANT = 125;      // Воля / (Воля + 125)
export const LUCK_CONSTANT = 50;       // Удача / (Удача + 50)
export const MAX_REDUCTION = 0.8;      // макс 80% снижения
export const HP_REGEN_TIME = 60;       // секунд до полного HP
export const MANA_REGEN_TIME = 30;     // секунд до полной маны

// ─── Захват ────────────────────────────────────────────
export const CAPTURE_CAST_TIME = 1500; // мс
export const CAPTURE_RANGE = 48;       // пикс

// ─── XP ────────────────────────────────────────────────
export const XP_PER_HIT = 2;
export const XP_PER_SPELL = 2;
export const XP_GOBLIN_KILL = 25;

// ─── Агро ──────────────────────────────────────────────
export const AGGRO_RANGE = 200;        // пикс — дальность агра моба
export const LEASH_RANGE = 400;        // пикс — макс расстояние от точки спавна

// ─── UI ────────────────────────────────────────────────
export const UI_DEPTH = 1000;
export const DAMAGE_TEXT_DURATION = 800; // мс
