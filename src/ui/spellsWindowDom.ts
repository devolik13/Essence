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

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function tier(sp: AbilityDef): string {
  return sp.manaCost >= 15 ? 'T3' : sp.manaCost >= 10 ? 'T2' : 'T1';
}

function buildSpellCard(spell: AbilityDef): HTMLElement {
  const card = el('div', 'ess-spell-card');
  const school = spell.school ?? 'neutral';
  card.style.setProperty('--school-color', SCHOOL_COLORS[school] ?? '#a78fc4');

  const tierBadge = el('span', 'sp-tier', tier(spell));
  card.appendChild(tierBadge);

  const body = el('div', 'sp-body');
  const name = el('div', 'sp-name', spell.nameRu);
  name.style.color = SCHOOL_COLORS[school] ?? '#d8c9a4';
  body.appendChild(name);

  const meta = el('div', 'sp-meta');
  const cast = spell.castTime ? `${spell.castTime}s` : 'instant';
  meta.textContent = `${spell.manaCost}mp · ${spell.cooldown}s cd · ${cast}`;
  body.appendChild(meta);

  card.appendChild(body);

  card.addEventListener('mouseenter', (e) => showSpellTooltip(spell, e.clientX, e.clientY));
  card.addEventListener('mousemove', (e) => moveSpellTooltip(e.clientX, e.clientY));
  card.addEventListener('mouseleave', hideSpellTooltip);

  return card;
}

function buildSchoolGroup(schoolId: string, spells: AbilityDef[]): HTMLElement {
  const group = el('div', 'ess-school-group');

  const header = el('div', 'sg-head');
  const icon = el('span', 'sg-icon', SCHOOL_ICONS[schoolId] ?? '');
  const label = el('span', 'sg-label', SCHOOL_LABELS[schoolId] ?? schoolId.toUpperCase());
  label.style.color = SCHOOL_COLORS[schoolId] ?? '#d8c9a4';
  const count = el('span', 'sg-count', `${spells.length}`);
  header.appendChild(icon);
  header.appendChild(label);
  header.appendChild(count);
  group.appendChild(header);

  const grid = el('div', 'sg-grid');
  for (const sp of spells) grid.appendChild(buildSpellCard(sp));
  group.appendChild(grid);

  return group;
}

export function showSpellsWindowDom(spells: AbilityDef[], onClose: () => void): void {
  hideSpellsWindowDom();
  onCloseHandler = onClose;

  const container = el('div');
  container.id = 'ess-spells-root';

  container.appendChild(el('div', 'ess-backdrop'));

  const stage = el('div', 'ess-stage');
  const win = el('div', 'ess-window ess-spells-window');
  for (const c of ['tl', 'tr', 'bl', 'br']) win.appendChild(el('div', `corner ${c}`));

  // Header
  const header = el('div', 'ess-header');
  const left = el('div', 'ess-header-left');
  const badge = el('span', 'sg-count', `${spells.length}`);
  badge.style.marginLeft = '6px';
  left.appendChild(el('span', undefined, 'Spellbook'));
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
    body.appendChild(el('div', 'ess-empty', 'No spells learned yet.'));
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
      if (schSpells.length) body.appendChild(buildSchoolGroup(sch, schSpells));
    }

    for (const [weapon, wSpells] of Object.entries(byWeapon)) {
      const group = el('div', 'ess-school-group');
      const head = el('div', 'sg-head');
      head.appendChild(el('span', 'sg-icon', '⚔'));
      const label = el('span', 'sg-label', weapon.toUpperCase());
      label.style.color = '#d9b46a';
      head.appendChild(label);
      head.appendChild(el('span', 'sg-count', `${wSpells.length}`));
      group.appendChild(head);
      const grid = el('div', 'sg-grid');
      for (const sp of wSpells) grid.appendChild(buildSpellCard(sp));
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
