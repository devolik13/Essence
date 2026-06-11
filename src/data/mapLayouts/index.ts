import { PlacedMapObject } from '../../types/mapObjects';
import villageLayout from './village.json';
import labLayout from './lab.json';

/**
 * Встроенные (bundled) раскладки карты — по одной на зону.
 * Это исходные данные в git. Редактор хранит рабочую копию в localStorage;
 * при экспорте (Ctrl+E) генерируется JSON для ручной подкладки в этот файл.
 *
 * При старте игры: localStorage > bundled > пустой массив.
 * "Reset from file" в редакторе сбрасывает localStorage → грузится bundled.
 */
export const BUNDLED_LAYOUTS: Record<string, PlacedMapObject[]> = {
  village: villageLayout as PlacedMapObject[],
  lab: labLayout as PlacedMapObject[],
};

export function getBundledLayout(zoneId: string): PlacedMapObject[] {
  return BUNDLED_LAYOUTS[zoneId] ?? [];
}

/**
 * Версия bundled-раскладки. УВЕЛИЧИВАТЬ при каждом изменении JSON в git!
 * localStorage-копия, сохранённая против другой версии, автоматически
 * сбрасывается (lazy-sync: «Load from file» больше не нужен после pull).
 */
export const LAYOUT_VERSIONS: Record<string, number> = {
  village: 1,
  lab: 3,
};

export function getLayoutVersion(zoneId: string): number {
  return LAYOUT_VERSIONS[zoneId] ?? 0;
}
