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
  // Несколько проходов: выталкивание из одного коллайдера может загнать в
  // соседний (углы/плотные группы). Повторяем, пока есть пересечения или до
  // лимита итераций — иначе сущность остаётся застрявшей.
  const MAX_ITER = 6;
  for (let iter = 0; iter < MAX_ITER; iter++) {
    let moved = false;
    for (const c of colliders) {
      const dx = x - c.x;
      const dy = y - c.y;
      const minDist = c.r + entityR;
      const distSq = dx * dx + dy * dy;
      if (distSq >= minDist * minDist) continue; // нет пересечения
      if (distSq > 0.0001) {
        const d = Math.sqrt(distSq);
        const push = (minDist - d) / d;
        x += dx * push;
        y += dy * push;
      } else {
        // Ровно в центре — детерминированное направление из координат
        // коллайдера (а не всегда +x, иначе толкали бы в соседа справа).
        const ang = (c.x * 0.7 + c.y * 1.3) % (Math.PI * 2);
        x += Math.cos(ang) * minDist;
        y += Math.sin(ang) * minDist;
      }
      moved = true;
    }
    if (!moved) break; // пересечений не осталось
  }
  return { x, y };
}
