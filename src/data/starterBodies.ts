import { STARTER_BODIES } from '../types/bodies';

/** Стартовые тела — реэкспорт для удобства из data-слоя */
export { STARTER_BODIES };

/** Получить стартовое тело по id */
export function getStarterBody(id: string) {
  return STARTER_BODIES.find(b => b.id === id);
}
