/**
 * DOM-based Vendor window — brass/steampunk theme.
 * Recipes grouped by workbench into collapsible sections + a materials section.
 */
import { RECIPES, VENDOR_MATERIALS, ITEMS } from '../data/itemDB';
import { RecipeDef } from '../types/items';
import { openWindowShell, DOMWindowHandle, makeDraggable, restoreWindowPos } from './domWindowBase';
import { wireItemTooltip } from './itemTooltip';
import { lt } from '../i18n';

interface VendorData {
  copper: number;
  learnedRecipes: string[];
}

interface VendorCallbacks {
  onClose: () => void;
  onBuyRecipe: (recipeId: string, price: number) => void;
  onBuyMaterial: (itemId: string, qty: number, price: number) => void;
}

let handle: (DOMWindowHandle & { stage: HTMLElement }) | null = null;
let root: HTMLElement | null = null;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function recipeTier(recipe: RecipeDef): number {
  const r = recipe.resultId;
  return r.includes('_t3') ? 3 : r.includes('_t2') ? 2 : 1;
}

function recipePrice(recipe: RecipeDef): number {
  const tier = recipeTier(recipe);
  return tier === 3 ? 200 : tier === 2 ? 50 : 0;
}

/** Классифицирует оружейный рецепт по типу результата. */
function weaponCategory(resultId: string): 'melee' | 'staff' | 'ranged' {
  if (resultId.startsWith('staff_')) return 'staff';
  if (/^(shortbow|longbow|crossbow)_/.test(resultId)) return 'ranged';
  return 'melee';
}

/** Section definitions: vendor sections keyed by workbench + special materials.
 *  `match` переопределяет фильтр рецептов (для разбивки оружейника на 3 отдела). */
interface SectionDef {
  key: string;
  name: string;
  nameEn: string;
  expanded: boolean;
  match?: (r: RecipeDef) => boolean;
}
const SECTIONS: SectionDef[] = [
  { key: 'armorer',       name: 'Броня',       nameEn: 'Armor',      expanded: true  },
  { key: 'weapon_melee',  name: 'Ближний бой', nameEn: 'Melee',      expanded: true,  match: r => r.workbench === 'weaponsmith' && weaponCategory(r.resultId) === 'melee'  },
  { key: 'weapon_staff',  name: 'Посохи',      nameEn: 'Staffs',     expanded: false, match: r => r.workbench === 'weaponsmith' && weaponCategory(r.resultId) === 'staff'  },
  { key: 'weapon_ranged', name: 'Дальний бой', nameEn: 'Ranged',     expanded: false, match: r => r.workbench === 'weaponsmith' && weaponCategory(r.resultId) === 'ranged' },
  { key: 'jeweler',       name: 'Украшения',   nameEn: 'Jewelry',    expanded: false },
  { key: 'runemaster',    name: 'Руны',        nameEn: 'Runes',      expanded: false },
  { key: 'materials',     name: 'Материалы',   nameEn: 'Materials',  expanded: true  },
];

function buildBalance(copper: number): HTMLElement {
  const span = el('span', 'cv-balance');
  span.appendChild(el('span', 'coin', '💰'));
  span.appendChild(document.createTextNode(`${copper}c`));
  return span;
}

function buildRecipeRow(recipe: RecipeDef, data: VendorData, cb: VendorCallbacks): HTMLElement {
  const learned = data.learnedRecipes.includes(recipe.id);
  const price = recipePrice(recipe);
  const canAfford = data.copper >= price;

  const row = el('div', `cv-item-row${learned ? ' is-learned' : ''}`);
  row.appendChild(el('span', 'cv-item-icon', ITEMS[recipe.resultId]?.icon ?? '?'));
  row.appendChild(el('span', 'cv-item-name', lt(recipe.nameRu, recipe.nameEn)));

  let priceCls = 'cv-item-price';
  if (price === 0) priceCls += ' is-free';
  else if (!canAfford) priceCls += ' is-short';
  row.appendChild(el('span', priceCls, price === 0 ? 'Free' : `${price}c`));

  if (learned) {
    const tag = el('span', 'cv-learned-tag');
    tag.appendChild(el('span', 'check', '✓'));
    tag.appendChild(document.createTextNode(' ' + lt('Изучено', 'Learned')));
    row.appendChild(tag);
  } else {
    const btn = el('button', 'cv-buy-btn', lt('Купить', 'Buy'));
    if (!canAfford) btn.setAttribute('disabled', 'true');
    else btn.addEventListener('click', () => cb.onBuyRecipe(recipe.id, price));
    row.appendChild(btn);
  }
  // Hover tooltip describing what the recipe produces (name + stat bonuses).
  const result = ITEMS[recipe.resultId];
  if (result) wireItemTooltip(row, result);
  return row;
}

function buildMaterialRow(mat: { itemId: string; price: number; qty: number }, data: VendorData, cb: VendorCallbacks): HTMLElement {
  const def = ITEMS[mat.itemId];
  const canAfford = data.copper >= mat.price;

  const row = el('div', 'cv-item-row');
  row.appendChild(el('span', 'cv-item-icon', def?.icon ?? '?'));
  row.appendChild(el('span', 'cv-item-name', `${def ? lt(def.nameRu, def.nameEn) : mat.itemId} ×${mat.qty}`));
  row.appendChild(el('span', `cv-item-price${canAfford ? '' : ' is-short'}`, `${mat.price}c`));

  const btn = el('button', 'cv-buy-btn', lt('Купить', 'Buy'));
  if (!canAfford) btn.setAttribute('disabled', 'true');
  else btn.addEventListener('click', () => cb.onBuyMaterial(mat.itemId, mat.qty, mat.price));
  row.appendChild(btn);
  if (def) wireItemTooltip(row, def);
  return row;
}

function buildSection(def: SectionDef, data: VendorData, cb: VendorCallbacks): HTMLElement | null {
  const section = el('div', 'cv-vendor-section');
  section.setAttribute('data-section', def.key);

  const header = el('button', 'cv-section-header');
  header.setAttribute('aria-expanded', def.expanded ? 'true' : 'false');
  const caret = el('span', 'cv-caret', def.expanded ? '▾' : '▸');
  header.appendChild(caret);
  header.appendChild(el('span', 'cv-section-name', lt(def.name, def.nameEn)));

  const body = el('div', `cv-section-body${def.expanded ? '' : ' is-collapsed'}`);

  let count = 0;
  if (def.key === 'materials') {
    for (const mat of VENDOR_MATERIALS) { body.appendChild(buildMaterialRow(mat, data, cb)); count++; }
  } else {
    const recipes = def.match
      ? RECIPES.filter(def.match)
      : RECIPES.filter(r => r.workbench === def.key);
    for (const r of recipes) { body.appendChild(buildRecipeRow(r, data, cb)); count++; }
  }
  if (count === 0) return null;

  header.appendChild(el('span', 'cv-section-count', String(count)));
  header.addEventListener('click', () => {
    const collapsed = body.classList.toggle('is-collapsed');
    header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    caret.textContent = collapsed ? '▸' : '▾';
  });

  section.appendChild(header);
  section.appendChild(body);
  return section;
}

export function showVendorDom(data: VendorData, cb: VendorCallbacks): void {
  hideVendorDom();

  handle = openWindowShell('', 'cv-backdrop', cb.onClose);
  handle.root.id = 'cv-vendor-root';
  root = handle.root;

  const stage = el('div', 'cv-stage');
  const win = el('section', 'cv-window cv-vendor');
  const inner = el('div', 'cv-window-inner');
  inner.appendChild(el('span', 'cv-rivet tl'));
  inner.appendChild(el('span', 'cv-rivet tr'));

  // Header
  const header = el('header', 'cv-header');
  const title = el('h2', 'cv-title');
  title.appendChild(el('span', 'cv-glyph', '🏪'));
  title.appendChild(document.createTextNode(' ' + lt('Торговец', 'Vendor')));
  header.appendChild(title);
  header.appendChild(el('span', 'cv-header-spacer'));
  header.appendChild(buildBalance(data.copper));
  const close = el('button', 'cv-close', '×');
  close.addEventListener('click', cb.onClose);
  header.appendChild(close);
  inner.appendChild(header);

  // Body
  const body = el('div', 'cv-body');
  for (const def of SECTIONS) {
    const sec = buildSection(def, data, cb);
    if (sec) body.appendChild(sec);
  }
  inner.appendChild(body);

  // Footer
  const footer = el('footer', 'cv-footer');
  footer.appendChild(el('span', 'cv-footer-label', lt('Баланс', 'Balance')));
  footer.appendChild(buildBalance(data.copper));
  inner.appendChild(footer);

  win.appendChild(inner);
  stage.appendChild(win);
  handle.stage.appendChild(stage);

  makeDraggable(win, header, 'esswin-vendor');
  restoreWindowPos(win, 'esswin-vendor');
}

export function hideVendorDom(): void {
  if (handle) {
    handle.destroy();
    handle = null;
    root = null;
  }
}

export function isVendorDomOpen(): boolean {
  return root !== null;
}
