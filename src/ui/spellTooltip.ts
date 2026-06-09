/**
 * Shared DOM tooltip for spells/abilities — matches inventory tooltip style.
 * Reuses .ess-tooltip CSS from inventory.css.
 */
import { AbilityDef } from '../types/abilities';
import { lt } from '../i18n';

let activeTooltip: HTMLElement | null = null;

const SCHOOL_COLORS: Record<string, string> = {
  fire:    '#c86a3a',
  water:   '#5a88c4',
  earth:   '#a07840',
  wind:    '#98d2b4',
  nature:  '#6d9a5a',
  neutral: '#a78fc4',
};

const SCHOOL_ICONS: Record<string, string> = {
  fire: '🔥', water: '💧', earth: '🪨', wind: '🌀', nature: '🌿', neutral: '✦',
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function buildSpellTooltipDom(spell: AbilityDef): HTMLElement {
  const tt = el('div', 'ess-tooltip');
  // Визуальная редкость рамки по стоимости маны (без ярлыка «тира» — умения
  // не пронумерованы и не упорядочены, школа показана ниже).
  const rarity = spell.manaCost >= 15 ? 'epic' : spell.manaCost >= 10 ? 'rare' : 'uncommon';
  tt.setAttribute('data-rarity', rarity);

  const head = el('div', 'tt-head');
  const nameSpan = el('span', 'tt-name', lt(spell.nameRu, spell.nameEn));
  const school = spell.school ?? 'neutral';
  nameSpan.style.color = SCHOOL_COLORS[school] ?? '#d8c9a4';
  head.appendChild(nameSpan);
  head.appendChild(el('span', 'tt-rarity', SCHOOL_ICONS[school] ?? ''));
  tt.appendChild(head);

  const typeLine = el('div', 'tt-type');
  typeLine.textContent = `${SCHOOL_ICONS[school] ?? ''} ${school.toUpperCase()} · ${spell.damageType.toUpperCase()}`;
  tt.appendChild(typeLine);

  const entries: [string, string][] = [];
  entries.push(['Mana', String(spell.manaCost)]);
  entries.push(['Cooldown', spell.cooldown + 's']);
  entries.push(['Cast', spell.castTime ? spell.castTime + 's' : 'instant']);
  if (spell.baseDamage > 0) entries.push(['Damage', String(spell.baseDamage)]);
  if (spell.range > 0) entries.push(['Range', String(spell.range)]);
  if (spell.aoeRadius) entries.push(['AoE radius', String(spell.aoeRadius)]);
  if (spell.zoneDps) entries.push(['Zone DPS', String(spell.zoneDps)]);
  if (spell.zoneDuration) entries.push(['Duration', spell.zoneDuration + 's']);
  if (spell.statusEffect) {
    const chance = spell.statusChance ? Math.round(spell.statusChance * 100) + '%' : '100%';
    entries.push(['Effect', `${spell.statusEffect} (${chance})`]);
  }
  if (spell.hitCount) entries.push(['Hits', String(spell.hitCount)]);
  if (spell.pierceCount) entries.push(['Pierce', String(spell.pierceCount)]);
  if (spell.projectileCount) entries.push(['Projectiles', String(spell.projectileCount)]);
  if (spell.chainCount) entries.push(['Chain jumps', String(spell.chainCount)]);

  if (entries.length) {
    const stats = el('div', 'tt-stats');
    for (const [k, v] of entries) {
      const row = el('div', 'tt-stat');
      row.appendChild(el('span', 'k', k));
      row.appendChild(el('span', 'v', v));
      stats.appendChild(row);
    }
    tt.appendChild(stats);
  }

  const desc = lt(spell.description, spell.descriptionEn);
  if (desc) {
    tt.appendChild(el('div', 'tt-desc', desc));
  }

  return tt;
}

function clampPosition(tt: HTMLElement, px: number, py: number) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const r = tt.getBoundingClientRect();
  let left = px + 16;
  let top = py - r.height - 12; // prefer above cursor
  if (top < 10) top = py + 16;
  if (left + r.width > vw - 10) left = px - r.width - 16;
  if (left < 10) left = 10;
  if (top + r.height > vh - 10) top = vh - r.height - 10;
  tt.style.left = left + 'px';
  tt.style.top = top + 'px';
}

export function showSpellTooltip(spell: AbilityDef, pageX: number, pageY: number): void {
  hideSpellTooltip();
  const tt = buildSpellTooltipDom(spell);
  document.body.appendChild(tt);
  activeTooltip = tt;
  clampPosition(tt, pageX, pageY);
}

export function moveSpellTooltip(pageX: number, pageY: number): void {
  if (!activeTooltip) return;
  clampPosition(activeTooltip, pageX, pageY);
}

export function hideSpellTooltip(): void {
  if (activeTooltip) {
    activeTooltip.remove();
    activeTooltip = null;
  }
}
