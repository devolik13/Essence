/** Расстояние между двумя точками */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Случайное целое число в диапазоне [min, max] включительно */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Ограничить значение в диапазоне */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Линейная интерполяция */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
