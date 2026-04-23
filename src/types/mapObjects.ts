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
  /** Блокирует движение (дом, забор, дерево). По умолчанию определяется по префиксу key. */
  solid?: boolean;
  /** Радиус коллайдера в пикселях (мировые), если не задан — вычисляется из спрайта */
  colliderRadius?: number;
}

/** Префиксы имён ассетов, которые по дефолту считаются непроходимыми. */
export const DEFAULT_SOLID_PREFIXES: string[] = [
  'cp_house', 'cp_castle', 'cp_tree', 'cp_rock', 'cp_bush',
  'cp_fence', 'cp_well', 'cp_windmill', 'cp_barrel', 'cp_crate',
  'cp_barn', 'cp_shrine', 'cp_altar', 'cp_lantern', 'cp_signpost',
  'cp_stump', 'cp_pillar', 'cp_statue',
];

export function isKeyDefaultSolid(key: string): boolean {
  return DEFAULT_SOLID_PREFIXES.some(p => key.startsWith(p));
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
