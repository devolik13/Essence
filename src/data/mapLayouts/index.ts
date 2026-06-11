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
