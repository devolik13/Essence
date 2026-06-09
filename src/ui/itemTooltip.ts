/**
 * Shared hover tooltip for items (equipment slots, bag cells, vendor rows).
 * Renders a single floating panel that follows the cursor. Styling lives in
 * equipBag.css (.eb-tooltip*). Self-contained: import and call wireItemTooltip.
 */
import { ItemDef } from '../types/items';

const STAT_LABELS: Record<string, string> = {
  Strength: 'STR', Agility: 'AGI', Accuracy: 'ACC', Evasion: 'EVA',
  Health: 'HP', Armor: 'ARM', Intellect: 'INT', Will: 'WIL',
  Mana: 'MNA', Luck: 'LCK',
};

let tip: HTMLElement | null = null;

function el(tag: string, cls?: string, text?: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function statLabel(key: string): string {
  return STAT_LABELS[key] ?? key.toUpperCase();
}

function buildTooltip(item: ItemDef, note?: string): HTMLElement {
  const t = el('div', 'eb-tooltip');
  t.appendChild(el('div', 'eb-tt-name', item.nameRu));
  t.appendChild(el('div', 'eb-tt-type',
    item.type.toUpperCase() + (item.equipSlot ? ` · ${item.equipSlot}` : '')));
  if (note) t.appendChild(el('div', 'eb-tt-note', note));

  const entries: [string, string][] = [];
  if (item.armorBonus)  entries.push(['ARM',  '+' + item.armorBonus]);
  if (item.hpRestore)   entries.push(['HP',   '+' + item.hpRestore]);
  if (item.manaRestore) entries.push(['MNA',  '+' + item.manaRestore]);
  if (item.manaBonus)   entries.push(['MNA',  '+' + item.manaBonus]);
  if (item.statBonuses) {
    for (const [k, v] of Object.entries(item.statBonuses)) {
      if (v) entries.push([statLabel(k), '+' + v]);
    }
  }
  if (entries.length) {
    const stats = el('div', 'eb-tt-stats');
    for (const [k, v] of entries) {
      const row = el('div', 'eb-tt-stat');
      row.appendChild(el('span', 'k', k));
      row.appendChild(el('span', 'v', v));
      stats.appendChild(row);
    }
    t.appendChild(stats);
  }

  if (item.descRu) t.appendChild(el('div', 'eb-tt-desc', item.descRu));

  let foot = 'ПКМ — действие';
  if (item.type === 'equipment') foot = 'Клик — надеть / снять';
  else if (item.type === 'consumable') foot = 'Клик — использовать';
  else if (item.type === 'material') foot = 'Материал';
  t.appendChild(el('div', 'eb-tt-foot', foot));
  return t;
}

function position(px: number, py: number) {
  if (!tip) return;
  const r = tip.getBoundingClientRect();
  let left = px + 16;
  let top = py + 12;
  if (left + r.width > window.innerWidth - 10) left = px - r.width - 16;
  if (top + r.height > window.innerHeight - 10) top = window.innerHeight - r.height - 10;
  if (top < 10) top = 10;
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
}

export function hideItemTooltip() {
  if (tip) { tip.remove(); tip = null; }
}

/** Attach hover tooltip behaviour to a target element for the given item.
 *  `note` — необязательная строка (напр. «Нужно: 0/3» для ингредиентов крафта). */
export function wireItemTooltip(target: HTMLElement, item: ItemDef, note?: string) {
  target.addEventListener('mouseenter', () => {
    hideItemTooltip();
    tip = buildTooltip(item, note);
    document.body.appendChild(tip);
    const r = target.getBoundingClientRect();
    position(r.left + r.width / 2, r.top);
  });
  target.addEventListener('mousemove', (e) => position(e.clientX, e.clientY));
  target.addEventListener('mouseleave', hideItemTooltip);
}
