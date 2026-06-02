/**
 * Круговые коллайдеры для расставленных объектов карты.
 * Обновляется редактором при placement/drag/delete/solid-toggle.
 * Читается Body.update() и Creature.update() для отталкивания.
 */
export interface MapCollider {
  x: number;
  y: number;
  r: number;
}

const colliders: MapCollider[] = [];

export function clearMapColliders(): void {
  colliders.length = 0;
}

export function addMapCollider(c: MapCollider): void {
  colliders.push(c);
}

export function removeMapColliderAt(x: number, y: number, r: number): void {
  for (let i = colliders.length - 1; i >= 0; i--) {
    const c = colliders[i];
    if (c.x === x && c.y === y && c.r === r) {
      colliders.splice(i, 1);
      return;
    }
  }
}

export function getMapColliders(): readonly MapCollider[] {
  return colliders;
}

/**
 * Отталкивает точку (ex, ey) с радиусом entityR от всех коллайдеров.
 * Возвращает скорректированные {x, y}.
 */
export function pushOutOfColliders(
  ex: number, ey: number, entityR: number,
): { x: number; y: number } {
  let x = ex, y = ey;
  for (const c of colliders) {
    const dx = x - c.x;
    const dy = y - c.y;
    const minDist = c.r + entityR;
    const distSq = dx * dx + dy * dy;
    if (distSq < minDist * minDist && distSq > 0.0001) {
      const d = Math.sqrt(distSq);
      const push = (minDist - d) / d;
      x += dx * push;
      y += dy * push;
    } else if (distSq <= 0.0001) {
      // ровно в центре — толкаем в случайном направлении
      x += minDist;
    }
  }
  return { x, y };
}
