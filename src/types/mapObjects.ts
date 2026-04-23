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
  /** Цветной тинт в формате 0xRRGGBB (undefined = без тинта) */
  tint?: number;
}

export const MAP_OBJECTS_STORAGE_PREFIX = 'essence_map_';

/** Палитра тинтов для циклирования клавишей T. */
export const TINT_PALETTE: number[] = [
  0xffffff, // белый (сброс, норм)
  0xddffaa, // светло-зелёный (свежий)
  0xaaddff, // голубой (холод)
  0xffddaa, // песочный
  0xff9988, // розовый (закат)
  0x99aa77, // оливковый
  0xccaa88, // коричневый
  0x7788aa, // сине-серый (туман)
  0xffcc55, // золотой
  0xaa88cc, // фиолетовый (магия)
  0x555555, // тёмный (тень/ночь)
];
