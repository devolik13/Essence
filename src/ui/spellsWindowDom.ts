/**
 * DOM-based Spells window — brass/ether theme, spells grouped by school.
 * Hover shows spellTooltip.
 */
import { AbilityDef } from '../types/abilities';
import { showSpellTooltip, moveSpellTooltip, hideSpellTooltip } from './spellTooltip';

let root: HTMLElement | null = null;
let onCloseHandler: (() => void) | null = null;

const SCHOOL_ORDER = ['fire', 'water', 'earth', 'wind', 'nature', 'neutral'];
const SCHOOL_LABELS: Record<string, string> = {
  fire: 'FIRE', water: 'WATER', earth: 'EARTH',
  wind: 'WIND', nature: 'NATURE', neutral: 'NEUTRAL',
};
const SCHOOL_ICONS: Record<string, string> = {
  fire: '🔥', water: '💧', earth: '🪨',
  wind: '🌀', nature: '🌿', neutral: '✦',
};
const SCHOOL_COLORS: Record<string, string> = {
  fire: '#c86a3a', water: '#5a88c4', earth: '#a07840',
  wind: '#98d2b4', nature: '#6d9a5a', neutral: '#a78fc4',
};
const WEAPON_LABELS: Record<string, string> = {
  dagger: 'DAGGER', sword: 'SWORD', greatsword: 'GREATSWORD',
  spear: 'SPEAR', mace: 'MACE', hammer: 'HAMMER',
  shortbow: 'SHORT BOW', longbow: 'LONG BOW', crossbow: 'CROSSBOW',
  fists: 'FISTS',
  staff_fire: 'FIRE STAFF', staff_water: 'WATER STAFF',
  staff_earth: 'EARTH STAFF', staff_wind: 'WIND STAFF', staff_nature: 'NATURE STAFF',
};
const WEAPON_ICONS: Record<string, string> = {
  dagger: '🗡', sword: '⚔', greatsword: '🗡', spear: '🔱',
  mace: '🔨', hammer: '⚒', shortbow: '🏹', longbow: '🏹',
  crossbow: '🎯', fists: '🥊',
  staff_fire: '🔥', staff_water: '💧', staff_earth: '🪨',
  staff_wind: '🌀', staff_nature: '🌿',
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function tier(sp: AbilityDef): string {
  return sp.manaCost >= 15 ? 'T3' : sp.manaCost >= 10 ? 'T2' : 'T1';
}

function buildSpellCard(spell: AbilityDef, learned: boolean): HTMLElement {
  const card = el('div', `ess-spell-card${learned ? '' : ' locked'}`);
  const school = spell.school ?? 'neutral';
  card.style.setProperty('--school-color', SCHOOL_COLORS[school] ?? '#a78fc4');

  const name = el('div', 'sp-name', spell.nameRu);
  if (learned) name.style.color = SCHOOL_COLORS[school] ?? '#d8c9a4';
  card.appendChild(name);

  const meta = el('div', 'sp-meta');
  meta.textContent = `${spell.manaCost}mp · ${spell.cooldown}s`;
  card.appendChild(meta);

  card.addEventListener('mouseenter', (e) => showSpellTooltip(spell, e.clientX, e.clientY));
  card.addEventListener('mousemove', (e) => moveSpellTooltip(e.clientX, e.clientY));
  card.addEventListener('mouseleave', hideSpellTooltip);

  return card;
}

function buildSchoolGroup(schoolId: string, spells: AbilityDef[], learnedIds: Set<string>): HTMLElement {
  const group = el('div', 'ess-school-group');
  const learnedCount = spells.filter(sp => learnedIds.has(sp.id)).length;

  const header = el('div', 'sg-head');
  const icon = el('span', 'sg-icon', SCHOOL_ICONS[schoolId] ?? '');
  const label = el('span', 'sg-label', SCHOOL_LABELS[schoolId] ?? schoolId.toUpperCase());
  label.style.color = SCHOOL_COLORS[schoolId] ?? '#d8c9a4';
  const count = el('span', 'sg-count', `${learnedCount} / ${spells.length}`);
  header.appendChild(icon);
  header.appendChild(label);
  header.appendChild(count);
  group.appendChild(header);

  const grid = el('div', 'sg-grid');
  // Sort: learned first, then locked
  const sorted = [...spells].sort((a, b) => {
    const la = learnedIds.has(a.id) ? 0 : 1;
    const lb = learnedIds.has(b.id) ? 0 : 1;
    return la - lb;
  });
  for (const sp of sorted) grid.appendChild(buildSpellCard(sp, learnedIds.has(sp.id)));
  group.appendChild(grid);

  return group;
}

export function showSpellsWindowDom(allSpells: AbilityDef[], learnedIds: Set<string>, onClose: () => void): void {
  hideSpellsWindowDom();
  onCloseHandler = onClose;
  const spells = allSpells;

  const container = el('div');
  container.id = 'ess-spells-root';

  container.appendChild(el('div', 'ess-backdrop'));

  const stage = el('div', 'ess-stage');
  const win = el('div', 'ess-window ess-spells-window');
  for (const c of ['tl', 'tr', 'bl', 'br']) win.appendChild(el('div', `corner ${c}`));

  // Header
  const header = el('div', 'ess-header');
  const left = el('div', 'ess-header-left');
  const badge = el('span', 'sg-count', `${learnedIds.size} / ${spells.length}`);
  badge.style.marginLeft = '6px';
  left.appendChild(el('span', undefined, 'Learned'));
  left.appendChild(badge);

  const title = el('div', 'ess-title');
  title.textContent = 'Spells';
  title.appendChild(el('span', 'sub', 'GRIMOIRE · MEMORY'));

  const right = el('div', 'ess-header-right');
  const close = el('div', 'ess-close-btn', '×');
  close.addEventListener('click', () => onClose());
  right.appendChild(close);

  header.appendChild(left);
  header.appendChild(title);
  header.appendChild(right);
  win.appendChild(header);

  // Body
  const body = el('div', 'ess-spells-body');
  if (spells.length === 0) {
    body.appendChild(el('div', 'ess-empty', 'No spells known.'));
  } else {
    // Group schools
    const nonWeapon = spells.filter(s => !s.requiredWeapons?.length);
    const byWeapon: Record<string, AbilityDef[]> = {};
    for (const s of spells) {
      if (s.requiredWeapons?.length) {
        const w = s.requiredWeapons[0];
        if (!byWeapon[w]) byWeapon[w] = [];
        byWeapon[w].push(s);
      }
    }

    for (const sch of SCHOOL_ORDER) {
      const schSpells = nonWeapon.filter(s => (s.school ?? 'neutral') === sch);
      if (schSpells.length) body.appendChild(buildSchoolGroup(sch, schSpells, learnedIds));
    }

    const weaponOrder = ['sword', 'dagger', 'mace', 'greatsword', 'spear', 'hammer', 'shortbow', 'longbow', 'crossbow', 'fists', 'staff_fire', 'staff_water', 'staff_earth', 'staff_wind', 'staff_nature'];
    const sortedWeapons = Object.entries(byWeapon).sort(([a], [b]) => {
      const ia = weaponOrder.indexOf(a); const ib = weaponOrder.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    for (const [weapon, wSpells] of sortedWeapons) {
      const group = el('div', 'ess-school-group');
      const head = el('div', 'sg-head');
      head.appendChild(el('span', 'sg-icon', WEAPON_ICONS[weapon] ?? '⚔'));
      const label = el('span', 'sg-label', WEAPON_LABELS[weapon] ?? weapon.toUpperCase());
      label.style.color = '#d9b46a';
      head.appendChild(label);
      const lCount = wSpells.filter(sp => learnedIds.has(sp.id)).length;
      head.appendChild(el('span', 'sg-count', `${lCount} / ${wSpells.length}`));
      group.appendChild(head);
      const grid = el('div', 'sg-grid');
      const sorted = [...wSpells].sort((a, b) => {
        const la = learnedIds.has(a.id) ? 0 : 1;
        const lb = learnedIds.has(b.id) ? 0 : 1;
        return la - lb;
      });
      for (const sp of sorted) grid.appendChild(buildSpellCard(sp, learnedIds.has(sp.id)));
      group.appendChild(grid);
      body.appendChild(group);
    }
  }
  win.appendChild(body);

  stage.appendChild(win);
  container.appendChild(stage);

  container.querySelector('.ess-backdrop')?.addEventListener('click', () => onClose());

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', keyHandler);
  (container as any)._keyHandler = keyHandler;

  document.body.appendChild(container);
  root = container;
}

export function hideSpellsWindowDom(): void {
  hideSpellTooltip();
  if (root) {
    const kh = (root as any)._keyHandler;
    if (kh) window.removeEventListener('keydown', kh);
    root.remove();
    root = null;
  }
  onCloseHandler = null;
}

export function isSpellsWindowDomOpen(): boolean {
  return root !== null;
}
