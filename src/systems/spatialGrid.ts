/**
 * Равномерная пространственная сетка для запросов «соседи в радиусе».
 *
 * Перестраивается каждый кадр (clear + insert всех сущностей). Запрос
 * forEachNear сканирует только ячейки, попадающие в bounding box радиуса —
 * O(соседей) вместо O(всех). Заменяет линейные сканы по всем существам
 * (поиск вражеской фракции, проверка боя, ближайший враг волка).
 */
export class SpatialGrid<T extends { x: number; y: number }> {
  private cells = new Map<string, T[]>();

  constructor(private readonly cellSize: number) {}

  clear(): void {
    this.cells.clear();
  }

  insert(item: T): void {
    const k = this.cellKey(item.x, item.y);
    const arr = this.cells.get(k);
    if (arr) arr.push(item);
    else this.cells.set(k, [item]);
  }

  /**
   * Вызывает cb для каждого элемента в ячейках, пересекающих квадрат
   * (x±radius, y±radius). Может включать элементы чуть дальше radius —
   * вызывающий обязан проверить точную дистанцию.
   */
  forEachNear(x: number, y: number, radius: number, cb: (item: T) => void): void {
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const arr = this.cells.get(`${cx},${cy}`);
        if (arr) for (const item of arr) cb(item);
      }
    }
  }

  private cellKey(x: number, y: number): string {
    return `${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`;
  }
}
