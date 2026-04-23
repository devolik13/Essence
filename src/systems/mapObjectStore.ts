import { PlacedMapObject, MAP_OBJECTS_STORAGE_PREFIX } from '../types/mapObjects';
import { getBundledLayout } from '../data/mapLayouts';

/**
 * Загрузка раскладки зоны.
 * Приоритет: localStorage (рабочая копия) > bundled JSON из git > пустой массив.
 */
export function loadMapObjects(zoneId: string): PlacedMapObject[] {
  try {
    const raw = localStorage.getItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [...getBundledLayout(zoneId)];
}

export function saveMapObjects(zoneId: string, objects: PlacedMapObject[]): void {
  localStorage.setItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId, JSON.stringify(objects));
}

/** Экспорт в JSON-строку (красиво отформатированную). */
export function exportMapObjects(zoneId: string): string {
  return JSON.stringify(loadMapObjects(zoneId), null, 2);
}

/** Импорт из JSON — перезаписывает рабочую копию зоны. */
export function importMapObjects(zoneId: string, json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return false;
    saveMapObjects(zoneId, parsed);
    return true;
  } catch {
    return false;
  }
}

/** Сбрасывает рабочую копию — при следующей загрузке/sceneren'е подтянется bundled. */
export function resetToBundled(zoneId: string): PlacedMapObject[] {
  localStorage.removeItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId);
  return [...getBundledLayout(zoneId)];
}

/** Есть ли несохранённые изменения относительно bundled-файла. */
export function hasUnsavedChanges(zoneId: string, current: PlacedMapObject[]): boolean {
  const bundled = getBundledLayout(zoneId);
  return JSON.stringify(current) !== JSON.stringify(bundled);
}
