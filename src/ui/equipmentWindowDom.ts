/**
 * DOM Equipment window — paperdoll. Ported from Claude Design
 * "Essence Equipment & Bag" (window I). Independent, draggable, non-modal.
 */
import './equipBag.css';
import { ITEMS } from '../data/itemDB';
import { ItemDef, Equipment } from '../types/items';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { openWindowShell, DOMWindowHandle, makeDraggable, restoreWindowPos } from './domWindowBase';
import { spriteForItem, createSpriteSvg } from './weaponIcon';
import { wireItemTooltip, hideItemTooltip } from './itemTooltip';
import { getDraggedItem, setDraggedItem } from './dragState';

const STORAGE_KEY = 'esswin-equipment';

export interface EquipData { sphere: Sphere; body: Body | null; }
export interface EquipCallbacks {
  onUnequip: (slot: string) => void;
  onEquip: (itemId: string, slot: string) => void;
  onSwitchWeapon: (idx: 0 | 1) => void;
  onClose: () => void;
}

/** Можно ли надеть предмет в этот слот (оружие принимается и в weapon, и в weapon2). */
function canDropOn(itemId: string, slotId: string): boolean {
  const def = ITEMS[itemId];
  if (!def || def.type !== 'equipment' || !def.equipSlot) return false;
  if (def.equipSlot === slotId) return true;
  if (def.equipSlot === 'weapon' && slotId === 'weapon2') return true;
  return false;
}

interface SlotDef { id: keyof Equipment; label: string; rune?: boolean; }

const LEFT_COL:   SlotDef[] = [
  { id: 'weapon',      label: 'Оружие I' },
  { id: 'shield',      label: 'Щит' },
  { id: 'ring',        label: 'Кольцо' },
  { id: 'weapon_rune', label: 'Руна оружия', rune: true },
];
const CENTER_COL: SlotDef[] = [
  { id: 'helmet', label: 'Шлем' },
  { id: 'amulet', label: 'Амулет' },
  { id: 'chest',  label: 'Нагрудник' },
  { id: 'gloves', label: 'Перчатки' },
  { id: 'boots',  label: 'Сапоги' },
];
const RIGHT_COL:  SlotDef[] = [
  { id: 'weapon2',    label: 'Оружие II' },
  { id: 'armor_rune', label: 'Руна брони', rune: true },
];

let handle: (DOMWindowHandle & { stage: HTMLElement }) | null = null;
let root: HTMLElement | null = null;
let data: EquipData | null = null;
let cb: EquipCallbacks | null = null;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function setIcon(host: HTMLElement, item: ItemDef) {
  const sprite = spriteForItem(item.id);
  if (sprite) {
    const svg = createSpriteSvg(sprite, 'eb-svg-icon');
    host.appendChild(svg);
  } else {
    host.textContent = item.icon || '?';
  }
}

function buildSlot(def: SlotDef, dimmed: boolean): HTMLElement {
  const sphere = data!.sphere;
  const equip = sphere.equipment as Record<string, string | undefined>;
  const itemId = equip[def.id as string];
  const item = itemId ? ITEMS[itemId] : null;

  const wrap = el('div', 'eb-slot-wrap');
  wrap.appendChild(el('span', 'eb-slot-label', def.label));

  let cls = 'eb-slot';
  if (def.rune) cls += ' is-rune';
  cls += item ? ' is-filled' : ' is-empty';
  if (dimmed) cls += ' is-dim';
  const slot = el('div', cls);

  if (item) {
    setIcon(slot, item);
    wireItemTooltip(slot, item);
    slot.addEventListener('click', () => cb!.onUnequip(def.id as string));
  } else {
    slot.textContent = '◇';
  }

  // Слот — цель для перетаскивания предмета из сумки (надеть в конкретный слот).
  const slotId = def.id as string;
  slot.addEventListener('dragover', (e) => {
    const id = getDraggedItem();
    if (id && canDropOn(id, slotId)) { e.preventDefault(); slot.classList.add('is-drop'); }
  });
  slot.addEventListener('dragleave', () => slot.classList.remove('is-drop'));
  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    slot.classList.remove('is-drop');
    const id = getDraggedItem() || e.dataTransfer?.getData('text/plain') || '';
    setDraggedItem(null);
    if (id && canDropOn(id, slotId)) cb!.onEquip(id, slotId);
  });

  wrap.appendChild(slot);
  return wrap;
}

function buildColumn(cls: string, slots: SlotDef[], activeWpn: number, silhouette = false): HTMLElement {
  const col = el('div', `eb-col ${cls}`);
  if (silhouette) col.appendChild(el('span', 'eb-silhouette'));
  for (const def of slots) {
    const dimmed = (def.id === 'weapon' && activeWpn === 1) ||
                   (def.id === 'weapon2' && activeWpn === 0);
    col.appendChild(buildSlot(def, dimmed));
  }
  return col;
}

function buildFooter(): HTMLElement {
  const sphere = data!.sphere;
  const activeWpn = sphere.activeWeaponSlot ?? 0;
  const activeId = activeWpn === 0 ? sphere.equipment.weapon : sphere.equipment.weapon2;
  const item = activeId ? ITEMS[activeId] : null;

  const footer = el('footer', 'eb-footer');
  footer.title = 'Сменить активное оружие (Tab)';
  footer.appendChild(el('span', 'eb-tab-key', 'Tab'));

  const icon = el('span', 'eb-active-icon');
  if (item) setIcon(icon, item); else icon.textContent = '—';
  footer.appendChild(icon);

  footer.appendChild(el('span', 'eb-active-name', item ? item.nameRu : '— пусто —'));
  footer.appendChild(el('span', 'eb-active-label', 'Активно'));

  footer.addEventListener('click', () => cb!.onSwitchWeapon(activeWpn === 0 ? 1 : 0));
  return footer;
}

function render() {
  if (!handle || !data) return;
  hideItemTooltip();
  handle.stage.innerHTML = '';

  const stage = el('div', 'eb-stage');
  const win = el('section', 'eb-window eb-equipment');
  const inner = el('div', 'eb-window-inner');
  for (const c of ['tl', 'tr', 'bl', 'br']) inner.appendChild(el('span', `eb-rivet ${c}`));

  const header = el('header', 'eb-header');
  const title = el('h2', 'eb-title');
  title.appendChild(el('span', 'eb-glyph', '⬡'));
  title.appendChild(document.createTextNode(' Экипировка'));
  header.appendChild(title);
  header.appendChild(el('span', 'eb-header-spacer'));
  const close = el('button', 'eb-close', '×');
  close.addEventListener('click', () => cb!.onClose());
  header.appendChild(close);
  inner.appendChild(header);

  const body = el('div', 'eb-body');
  const doll = el('div', 'eb-doll');
  const activeWpn = data.sphere.activeWeaponSlot ?? 0;
  doll.appendChild(buildColumn('left', LEFT_COL, activeWpn));
  doll.appendChild(buildColumn('center', CENTER_COL, activeWpn, true));
  doll.appendChild(buildColumn('right', RIGHT_COL, activeWpn));
  body.appendChild(doll);
  inner.appendChild(body);

  inner.appendChild(buildFooter());

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
    // Default: left of screen centre so it doesn't overlap the Bag window.
    const rect = win.getBoundingClientRect();
    win.style.position = 'fixed';
    win.style.right = 'auto';
    win.style.bottom = 'auto';
    win.style.margin = '0';
    win.style.left = Math.max(20, window.innerWidth / 2 - rect.width - 16) + 'px';
    win.style.top = '70px';
  }
}

export function showEquipmentDom(d: EquipData, callbacks: EquipCallbacks) {
  hideEquipmentDom();
  data = d;
  cb = callbacks;
  handle = openWindowShell('', 'eb-backdrop', callbacks.onClose);
  handle.root.id = 'eb-equipment-root';
  root = handle.root;
  render();
}

export function refreshEquipmentDom(d: EquipData, callbacks: EquipCallbacks) {
  if (!handle) return;
  data = d;
  cb = callbacks;
  render();
}

export function hideEquipmentDom() {
  hideItemTooltip();
  if (handle) { handle.destroy(); handle = null; }
  root = null;
  data = null;
  cb = null;
}

export function isEquipmentDomOpen(): boolean {
  return root !== null;
}
