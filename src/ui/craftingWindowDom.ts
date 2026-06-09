/**
 * DOM-based Crafting window — brass/steampunk theme.
 * Recipes for one workbench, grouped by tier into collapsible sections.
 */
import { RECIPES, ITEMS } from '../data/itemDB';
import { RecipeDef } from '../types/items';
import { WORKBENCH_NAMES_RU } from '../data/craftpixAssets';
import { openWindowShell, DOMWindowHandle, makeDraggable, restoreWindowPos } from './domWindowBase';
import { wireItemTooltip } from './itemTooltip';

interface CraftingData {
  inventory: { itemId: string; quantity: number }[];
  learnedRecipes: string[];
}

interface CraftingCallbacks {
  onClose: () => void;
  onCraft: (recipeId: string) => void;
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

function buildRecipeRow(recipe: RecipeDef, data: CraftingData, cb: CraftingCallbacks): HTMLElement {
  const learned = data.learnedRecipes.includes(recipe.id);

  let anyShort = false;
  const mats = el('div', 'cv-mats');
  const entries = Object.entries(recipe.materials);
  entries.forEach(([matId, need], i) => {
    const have = data.inventory.find(it => it.itemId === matId)?.quantity ?? 0;
    const ok = have >= need;
    if (!ok) anyShort = true;
    const mat = el('span', 'cv-mat');
    mat.appendChild(el('span', 'cv-mat-icon', ITEMS[matId]?.icon ?? '?'));
    mat.appendChild(el('span', `cv-mat-count ${ok ? 'ok' : 'short'}`, `${have}/${need}`));
    mats.appendChild(mat);
    if (i < entries.length - 1) mats.appendChild(el('span', 'cv-mat-sep', '·'));
  });

  const locked = !learned;
  const row = el('div', `cv-recipe-row${locked ? ' is-locked' : ''}`);
  row.setAttribute('data-recipe', recipe.id);

  const top = el('div', 'cv-recipe-top');
  top.appendChild(el('span', 'cv-recipe-icon', ITEMS[recipe.resultId]?.icon ?? '?'));
  top.appendChild(el('span', 'cv-recipe-name', recipe.nameRu));
  top.appendChild(el('span', 'cv-recipe-time', `${recipe.craftTime}s`));
  row.appendChild(top);

  const bottom = el('div', 'cv-recipe-bottom');
  bottom.appendChild(mats);

  const btn = el('button', 'cv-craft-btn');
  if (locked) {
    btn.textContent = '🔒 Не изучено';
    btn.setAttribute('disabled', 'true');
  } else if (anyShort) {
    btn.textContent = 'Ковать';
    btn.setAttribute('disabled', 'true');
  } else {
    btn.textContent = 'Ковать';
    btn.addEventListener('click', () => cb.onCraft(recipe.id));
  }
  bottom.appendChild(btn);
  row.appendChild(bottom);

  // Hover tooltip describing the crafted result (name + stat bonuses).
  const result = ITEMS[recipe.resultId];
  if (result) wireItemTooltip(row, result);

  return row;
}

function buildTierSection(tier: number, recipes: RecipeDef[], expanded: boolean, data: CraftingData, cb: CraftingCallbacks): HTMLElement | null {
  if (recipes.length === 0) return null;

  const section = el('div', 'cv-recipe-section');
  section.setAttribute('data-tier', String(tier));

  const header = el('button', 'cv-section-header');
  header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const caret = el('span', 'cv-caret', expanded ? '▾' : '▸');
  header.appendChild(caret);
  header.appendChild(el('span', 'cv-section-name', `Тир ${tier}`));
  header.appendChild(el('span', 'cv-section-count', String(recipes.length)));

  const body = el('div', `cv-section-body${expanded ? '' : ' is-collapsed'}`);
  for (const r of recipes) body.appendChild(buildRecipeRow(r, data, cb));

  header.addEventListener('click', () => {
    const collapsed = body.classList.toggle('is-collapsed');
    header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    caret.textContent = collapsed ? '▸' : '▾';
  });

  section.appendChild(header);
  section.appendChild(body);
  return section;
}

export function showCraftingDom(workbenchType: string, data: CraftingData, cb: CraftingCallbacks): void {
  hideCraftingDom();

  handle = openWindowShell('', 'cv-backdrop', cb.onClose);
  handle.root.id = 'cv-crafting-root';
  root = handle.root;

  const stage = el('div', 'cv-stage');
  const win = el('section', 'cv-window cv-crafting');
  const inner = el('div', 'cv-window-inner');
  inner.appendChild(el('span', 'cv-rivet tl'));
  inner.appendChild(el('span', 'cv-rivet tr'));

  // Header
  const header = el('header', 'cv-header');
  const title = el('h2', 'cv-title');
  title.appendChild(el('span', 'cv-glyph', '⚒'));
  title.appendChild(document.createTextNode(` ${WORKBENCH_NAMES_RU[workbenchType] ?? workbenchType}`));
  header.appendChild(title);
  header.appendChild(el('span', 'cv-header-spacer'));
  const close = el('button', 'cv-close', '×');
  close.addEventListener('click', cb.onClose);
  header.appendChild(close);
  inner.appendChild(header);

  // Body — recipes grouped by tier
  const recipes = RECIPES.filter(r => r.workbench === workbenchType);
  const byTier: Record<number, RecipeDef[]> = { 1: [], 2: [], 3: [] };
  for (const r of recipes) byTier[recipeTier(r)].push(r);

  const body = el('div', 'cv-body');
  const t1 = buildTierSection(1, byTier[1], true, data, cb);
  const t2 = buildTierSection(2, byTier[2], false, data, cb);
  const t3 = buildTierSection(3, byTier[3], false, data, cb);
  if (t1) body.appendChild(t1);
  if (t2) body.appendChild(t2);
  if (t3) body.appendChild(t3);
  inner.appendChild(body);

  // Footer: craft progress (hidden — game shows its own center cast-bar)
  const footer = el('footer', 'cv-craft-progress');
  footer.style.display = 'none';
  const label = el('div', 'cv-craft-progress-label');
  label.appendChild(el('span', undefined, 'Идёт ковка…'));
  label.appendChild(el('span', 'pct', '0%'));
  footer.appendChild(label);
  const track = el('div', 'cv-progress-track');
  track.appendChild(el('div', 'cv-progress-fill'));
  footer.appendChild(track);
  inner.appendChild(footer);

  win.appendChild(inner);
  stage.appendChild(win);
  handle.stage.appendChild(stage);

  makeDraggable(win, header, 'esswin-crafting');
  restoreWindowPos(win, 'esswin-crafting');
}

export function hideCraftingDom(): void {
  if (handle) {
    handle.destroy();
    handle = null;
    root = null;
  }
}

export function isCraftingDomOpen(): boolean {
  return root !== null;
}
