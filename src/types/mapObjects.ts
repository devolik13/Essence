/**
 * Объект, расставленный в мире через встроенный редактор карт.
 * Хранится в localStorage per-zone.
 */
export interface PlacedMapObject {
  /** ID текстуры (из CP_ASSETS), напр. 'cp_tree_lg' */
  key: string;
  /** Мировые координаты (центр спрайта) */
  x: number;
  y: number;
  /** Масштаб */
  scale: number;
  /** Угол поворота в градусах */
  angle?: number;
}

export const MAP_OBJECTS_STORAGE_PREFIX = 'essence_map_';
