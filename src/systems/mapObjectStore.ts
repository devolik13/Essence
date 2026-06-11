import { PlacedMapObject, MAP_OBJECTS_STORAGE_PREFIX } from '../types/mapObjects';
import { getBundledLayout, getLayoutVersion } from '../data/mapLayouts';

const VER_SUFFIX = '_basever';

/**
 * Загрузка раскладки зоны.
 * Приоритет: localStorage (рабочая копия) > bundled JSON из git > пустой массив.
 * АВТОСИНК: если рабочая копия была сохранена против ДРУГОЙ версии bundled
 * (Claude обновил JSON в git), она устарела и сбрасывается — иначе пол/зона
 * и мебель расходятся («у тебя и у меня разные данные»).
 */
export function loadMapObjects(zoneId: string): PlacedMapObject[] {
  try {
    const raw = localStorage.getItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId);
    if (raw) {
      const savedVer = Number(localStorage.getItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId + VER_SUFFIX) ?? '0');
      if (savedVer !== getLayoutVersion(zoneId)) {
        // Бандл обновился — локальная копия устарела, сбрасываем.
        localStorage.removeItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId);
      } else {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return [...getBundledLayout(zoneId)];
}

export function saveMapObjects(zoneId: string, objects: PlacedMapObject[]): void {
  localStorage.setItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId, JSON.stringify(objects));
  // Запоминаем, против какой версии bundled сделана эта рабочая копия
  localStorage.setItem(MAP_OBJECTS_STORAGE_PREFIX + zoneId + VER_SUFFIX, String(getLayoutVersion(zoneId)));
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
