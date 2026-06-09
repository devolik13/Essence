/**
 * Общее состояние перетаскивания между окнами Сумка ↔ Экипировка.
 * `dataTransfer.getData` недоступен в dragover (только в drop), поэтому
 * id перетаскиваемого предмета храним здесь — для подсветки валидных слотов.
 */
let draggedItemId: string | null = null;

export function setDraggedItem(id: string | null): void {
  draggedItemId = id;
}

export function getDraggedItem(): string | null {
  return draggedItemId;
}
