import { PlacedMapObject, MAP_OBJECTS_STORAGE_PREFIX } from '../types/mapObjects';

/**
 * Хранение расставленных на карте объектов в localStorage (per-zone).
 * Сохраняется автоматически после каждого изменения в редакторе.
 */
export function loadMapObjects(zoneId: string): PlacedMapObject[] {
  try {
    const raw = localStorage.getItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMapObjects(zoneId: string, objects: PlacedMapObject[]): void {
  localStorage.setItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId, JSON.stringify(objects));
}

/** Экспорт в JSON-строку (для скачивания через консоль: copy(exportMapObjects('village'))) */
export function exportMapObjects(zoneId: string): string {
  return JSON.stringify(loadMapObjects(zoneId), null, 2);
}

/** Импорт из JSON — перезаписывает текущие объекты зоны */
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
