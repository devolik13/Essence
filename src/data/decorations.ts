/**
 * Атлас декораций: 8 колонок × 6 строк, ячейки 48×48 px.
 * Спрайт внутри ячейки выровнен по низу-центру.
 *
 * Файл-источник: public/assets/decorations.png (384×288)
 * Пока файла нет — BootScene.generateDecorationAtlas() рисует процедурные
 * плейсхолдеры в тот же спрайтшит `decorations`.
 *
 * Чтобы подключить настоящий PNG — в BootScene.preload():
 *   this.load.spritesheet('decorations', 'assets/decorations.png',
 *     { frameWidth: DECO_CELL, frameHeight: DECO_CELL });
 * И закомментировать вызов generateDecorationAtlas().
 */

export const DECO_CELL = 48;
export const DECO_COLS = 8;
export const DECO_ROWS = 6;

/** Индексы кадров в атласе (row-major: frame = row * 8 + col). */
export const DECO = {
  // Row 0 — деревья и крупная растительность
  TREE:        0,
  TREE_PINE:   1,
  TREE_DEAD:   2,
  TREE_SNOW:   3,
  PALM:        4,
  BUSH_BIG:    5,
  STUMP:       6,
  LOG:         7,

  // Row 1 — камни и руда
  ROCK_SM:     8,
  ROCK_MD:     9,
  ROCK_LG:     10,
  ROCK_MOSSY:  11,
  BOULDER:     12,
  PEBBLES:     13,
  CRYSTAL:     14,
  ORE_VEIN:    15,

  // Row 2 — кусты, цветы, грибы
  BUSH_SM:     16,
  BUSH_MD:     17,
  FLOWER_RED:  18,
  FLOWER_BLUE: 19,
  MUSHROOM:    20,
  REEDS:       21,
  FERN:        22,
  GRASS_TUFT:  23,

  // Row 3 — постройки
  HOUSE_SM:    24,
  HOUSE_MD:    25,
  HOUSE_LG:    26,
  HUT:         27,
  TOWER:       28,
  SHACK:       29,
  RUIN:        30,
  BARN:        31,

  // Row 4 — объекты
  FENCE_H:     32,
  FENCE_V:     33,
  GATE:        34,
  WELL:        35,
  SIGNPOST:    36,
  CART:        37,
  BARREL:      38,
  CRATE:       39,

  // Row 5 — особые
  BRIDGE_H:    40,
  BRIDGE_V:    41,
  FIREPIT:     42,
  LANTERN:     43,
  TENT:        44,
  GRAVE:       45,
  STATUE:      46,
  SHRINE:      47,
} as const;

export type DecoFrame = typeof DECO[keyof typeof DECO];
