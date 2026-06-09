/**
 * DOM Bag window — inventory grid with filters + pagination.
 * Ported from Claude Design "Essence Equipment & Bag" (window II).
 * Independent, draggable, non-modal.
 */
import './equipBag.css';
import { ITEMS } from '../data/itemDB';
import { ItemDef, InventoryItem } from '../types/items';
import { Sphere } from '../entities/Sphere';
import { openWindowShell, DOMWindowHandle, makeDraggable, restoreWindowPos } from './domWindowBase';
import { spriteForItem, createSpriteSvg } from './weaponIcon';
import { wireItemTooltip, hideItemTooltip } from './itemTooltip';
import { setDraggedItem } from './dragState';

const STORAGE_KEY = 'esswin-bag';
const BAG_CAPACITY = 64;
const PAGE_SIZE = 16;
const PAGES = Math.ceil(BAG_CAPACITY / PAGE_SIZE);

type Filter = 'all' | 'equipment' | 'material' | 'consumable';

export interface BagData { sphere: Sphere; }
export interface BagCallbacks {
  onEquip: (itemId: string, slot: string) => void;
  onUseConsumable: (itemId: string) => void;
  onClose: () => void;
}

const TABS: { id: Filter; label: string }[] = [
  { id: 'all',         label: 'Все' },
  { id: 'equipment',   label: 'Экипировка' },
  { id: 'material',    label: 'Материалы' },
  { id: 'consumable',  label: 'Расходники' },
];

let handle: (DOMWindowHandle & { stage: HTMLElement }) | null = null;
let root: HTMLElement | null = null;
let data: BagData | null = null;
let cb: BagCallbacks | null = null;
let filter: Filter = 'all';
let page = 0;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function setIcon(host: HTMLElement, item: ItemDef) {
  const sprite = spriteForItem(item.id);
  if (sprite) host.appendChild(createSpriteSvg(sprite, 'eb-svg-icon'));
  else host.textContent = item.icon || '?';
}

/** Resolve which equipment slot a bag item should go to (weapon → weapon2 fallback). */
function targetSlotFor(item: ItemDef, sphere: Sphere): string | null {
  if (item.type !== 'equipment' || !item.equipSlot) return null;
  let target: string = item.equipSlot;
  if (target === 'weapon' && sphere.equipment.weapon && !sphere.equipment.weapon2) target = 'weapon2';
  return target;
}

function buildCell(item: InventoryItem | undefined): HTMLElement {
  if (!item) return el('div', 'eb-cell is-empty');
  const def = ITEMS[item.itemId];
  if (!def) return el('div', 'eb-cell is-empty');

  const cell = el('div', 'eb-cell is-filled');
  cell.appendChild(el('span', `eb-cell-rarity ${def.rarity}`));
  setIcon(cell, def);
  if (item.quantity > 1) cell.appendChild(el('span', 'eb-cell-count', '×' + item.quantity));
  wireItemTooltip(cell, def);

  // Перетаскивание предмета на слот экипировки (можно положить именно в нужный слот).
  if (def.type === 'equipment') {
    cell.setAttribute('draggable', 'true');
    cell.addEventListener('dragstart', (e) => {
      setDraggedItem(item.itemId);
      e.dataTransfer?.setData('text/plain', item.itemId);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      hideItemTooltip();
    });
    cell.addEventListener('dragend', () => setDraggedItem(null));
  }

  const sphere = data!.sphere;
  cell.addEventListener('click', () => {
    const slot = targetSlotFor(def, sphere);
    if (slot) cb!.onEquip(item.itemId, slot);
    else if (def.type === 'consumable') cb!.onUseConsumable(item.itemId);
  });
  return cell;
}

function render() {
  if (!handle || !data) return;
  hideItemTooltip();
  handle.stage.innerHTML = '';

  const inv = data.sphere.inventory;
  const visible: InventoryItem[] = filter === 'all'
    ? inv.slice()
    : inv.filter(it => ITEMS[it.itemId]?.type === filter);

  if (page >= PAGES) page = PAGES - 1;
  if (page < 0) page = 0;

  const stage = el('div', 'eb-stage');
  const win = el('section', 'eb-window eb-bag');
  const inner = el('div', 'eb-window-inner');
  for (const c of ['tl', 'tr', 'bl', 'br']) inner.appendChild(el('span', `eb-rivet ${c}`));

  // Header
  const header = el('header', 'eb-header');
  const title = el('h2', 'eb-title');
  title.appendChild(el('span', 'eb-glyph', '🎒'));
  title.appendChild(document.createTextNode(' Сумка'));
  header.appendChild(title);
  header.appendChild(el('span', 'eb-header-spacer'));
  header.appendChild(el('span', 'eb-counter', `${inv.length} / ${BAG_CAPACITY}`));
  const close = el('button', 'eb-close', '×');
  close.addEventListener('click', () => cb!.onClose());
  header.appendChild(close);
  inner.appendChild(header);

  // Tabs
  const tabs = el('div', 'eb-tabs');
  for (const tDef of TABS) {
    const btn = el('button', `eb-tab${filter === tDef.id ? ' is-active' : ''}`, tDef.label);
    btn.addEventListener('click', () => { filter = tDef.id; page = 0; render(); });
    tabs.appendChild(btn);
  }
  inner.appendChild(tabs);

  // Grid
  const grid = el('div', 'eb-grid');
  const start = page * PAGE_SIZE;
  for (let i = 0; i < PAGE_SIZE; i++) grid.appendChild(buildCell(visible[start + i]));
  inner.appendChild(grid);

  // Footer
  const footer = el('footer', 'eb-bag-footer');
  const pager = el('div', 'eb-pager');
  const prev = el('button', 'eb-page-btn', '‹');
  if (page === 0) prev.setAttribute('disabled', 'true');
  prev.addEventListener('click', () => { if (page > 0) { page--; render(); } });
  pager.appendChild(prev);
  pager.appendChild(el('span', 'eb-page-num', `${page + 1} / ${PAGES}`));
  const next = el('button', 'eb-page-btn', '›');
  if (page >= PAGES - 1) next.setAttribute('disabled', 'true');
  next.addEventListener('click', () => { if (page < PAGES - 1) { page++; render(); } });
  pager.appendChild(next);
  footer.appendChild(pager);

  const slots = el('span', 'eb-slots-label');
  slots.appendChild(document.createTextNode('Ячейки: '));
  slots.appendChild(el('b', undefined, `${inv.length} / ${BAG_CAPACITY}`));
  footer.appendChild(slots);
  inner.appendChild(footer);

  win.appendChild(inner);
  stage.appendChild(win);
  handle.stage.appendChild(stage);

  makeDraggable(win, header, STORAGE_KEY);
  applyPosition(win);
}

function applyPosition(win: HTMLElement) {
  let hasSaved = false;
  try { hasSaved = !!localStorage.getItem(STORAGE_KEY); } catch { /* ignore */ }
  if (hasSaved) {
    restoreWindowPos(win, STORAGE_KEY);
  } else {
    // Default: right of screen centre so it doesn't overlap the Equipment window.
    win.style.position = 'fixed';
    win.style.right = 'auto';
    win.style.bottom = 'auto';
    win.style.margin = '0';
    win.style.left = Math.min(window.innerWidth - 320, window.innerWidth / 2 + 16) + 'px';
    win.style.top = '70px';
  }
}

export function showBagDom(d: BagData, callbacks: BagCallbacks) {
  hideBagDom();
  data = d;
  cb = callbacks;
  filter = 'all';
  page = 0;
  handle = openWindowShell('', 'eb-backdrop', callbacks.onClose);
  handle.root.id = 'eb-bag-root';
  root = handle.root;
  render();
}

export function refreshBagDom(d: BagData, callbacks: BagCallbacks) {
  if (!handle) return;
  data = d;
  cb = callbacks;
  render();
}

export function hideBagDom() {
  hideItemTooltip();
  if (handle) { handle.destroy(); handle = null; }
  root = null;
  data = null;
  cb = null;
}

export function isBagDomOpen(): boolean {
  return root !== null;
}
