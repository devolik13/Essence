/**
 * DOM-based Bestiary window — book-spread layout.
 * Reads creature data directly from CREATURE_DB; reveal state from bestiaryProgress.
 */
import { BodyDefinition, BodyType } from '../types/bodies';
import { StatName } from '../types/stats';
import { CREATURE_DB } from '../data/creatureDB';
import { BESTIARY_GROUPS, bestiaryTotalCount } from '../data/bestiaryGroups';
import { loadProgress, isRevealed, BestiaryProgress } from '../data/bestiaryProgress';
import { STAT_NAMES_SHORT } from '../utils/statNames';
import { t, getLang } from '../i18n';

const FRAMES_FILE = 'ui/frames.svg';
const SVG_NS = 'http://www.w3.org/2000/svg';

let root: HTMLElement | null = null;
let frameSpriteInjected = false;

type Filter = 'all' | 'revealed' | 'locked';

interface State {
  filter: Filter;
  selectedId: string | null;
  progress: BestiaryProgress;
}

let state: State = { filter: 'all', selectedId: null, progress: {} };

// ─── DOM helpers ────────────────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function sym(id: string, w = 32, h?: number): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('width', String(w));
  svg.setAttribute('height', String(h ?? w));
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('bf-icon');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `/${FRAMES_FILE}#${id}`);
  svg.appendChild(use);
  return svg;
}

function colorHex(c: number): string {
  return '#' + c.toString(16).padStart(6, '0');
}

// ─── Card helpers ───────────────────────────────────────────────────────────

function elementOf(def: BodyDefinition): 'fire' | 'water' | 'earth' | 'wind' | 'nature' | 'neutral' {
  if (def.element) return def.element;
  // Nature shamans have no element field; use damageType + weapon hints.
  if (def.weapon === 'staff_nature') return 'nature';
  return 'neutral';
}

function behaviorBadge(def: BodyDefinition): { id: string; label: string } {
  if (def.isBoss) return { id: 'bf_b_boss', label: t('bestiary.behavior.boss') };
  switch (def.type) {
    case BodyType.Combat:  return { id: 'bf_b_combat', label: t('bestiary.behavior.combat') };
    case BodyType.Passive: return { id: 'bf_b_passive', label: t('bestiary.behavior.passive') };
    case BodyType.Fleeing: return { id: 'bf_b_fleeing', label: t('bestiary.behavior.fleeing') };
  }
}

function damageBadge(def: BodyDefinition): { id: string; label: string } {
  switch (def.damageType) {
    case 'melee':  return { id: 'bf_dmg_melee',  label: t('bestiary.dmg.melee')  };
    case 'ranged': return { id: 'bf_dmg_ranged', label: t('bestiary.dmg.ranged') };
    case 'magic':  return { id: 'bf_dmg_magic',  label: t('bestiary.dmg.magic')  };
  }
}

function buildBadge(symId: string, label: string): HTMLElement {
  const b = el('span', 'bf-badge');
  b.appendChild(sym(symId, 28));
  b.appendChild(el('span', 'bf-badge-label', label));
  return b;
}

function statRow(label: string, value: number, max = 50): HTMLElement {
  const row = el('div', 'bf-stat-row');
  row.appendChild(el('span', 'bf-stat-label', label));
  row.appendChild(el('span', 'bf-stat-value', String(value)));
  const bar = el('div', 'bf-stat-bar');
  const fill = el('div', 'bf-stat-bar-fill');
  fill.style.width = `${Math.min(100, (value / max) * 100)}%`;
  bar.appendChild(fill);
  row.appendChild(bar);
  return row;
}

// ─── Left panel (groups + tiles) ────────────────────────────────────────────

function buildSidebar(): HTMLElement {
  const side = el('aside', 'bf-side');

  const lang = getLang();
  for (const g of BESTIARY_GROUPS) {
    const groupEntries = g.ids
      .map(id => CREATURE_DB[id])
      .filter((d): d is BodyDefinition => !!d);
    if (!groupEntries.length) continue;

    // Filter check: skip group if no entries match
    const visible = groupEntries.filter(d => filterMatches(d.id));
    if (!visible.length) continue;

    const groupBox = el('div', 'bf-group');
    const head = el('div', 'bf-group-head');
    head.textContent = lang === 'ru' ? g.titleRu : g.titleEn;
    const counts = el('span', 'bf-group-count');
    const revealed = groupEntries.filter(d => isRevealed(state.progress, d.id)).length;
    counts.textContent = `${revealed}/${groupEntries.length}`;
    head.appendChild(counts);
    groupBox.appendChild(head);

    const grid = el('div', 'bf-tile-grid');
    for (const def of visible) {
      const tile = el('div', `bf-tile${state.selectedId === def.id ? ' selected' : ''}`);
      const isRev = isRevealed(state.progress, def.id);
      tile.classList.add(isRev ? 'revealed' : 'locked');
      tile.style.setProperty('--accent', colorHex(def.color));

      const dot = el('div', 'bf-tile-dot');
      if (!isRev) {
        dot.appendChild(sym('bf_lock', 24));
      } else {
        // Coloured token + first letter as glyph fallback (no creature art yet)
        dot.style.background = colorHex(def.color);
        const letter = el('span', 'bf-tile-letter', def.nameRu.charAt(0));
        dot.appendChild(letter);
      }
      tile.appendChild(dot);

      const label = el('span', 'bf-tile-label', isRev ? def.nameRu : '???');
      tile.appendChild(label);

      tile.addEventListener('click', () => {
        state.selectedId = def.id;
        rerender();
      });

      grid.appendChild(tile);
    }
    groupBox.appendChild(grid);
    side.appendChild(groupBox);
  }

  return side;
}

function filterMatches(id: string): boolean {
  const rev = isRevealed(state.progress, id);
  if (state.filter === 'revealed') return rev;
  if (state.filter === 'locked') return !rev;
  return true;
}

// ─── Right page (creature card) ─────────────────────────────────────────────

function buildLockedCard(def: BodyDefinition): HTMLElement {
  const card = el('article', 'bf-card locked');

  const art = el('div', 'bf-art');
  art.appendChild(sym('bf_unknown', 220));
  card.appendChild(art);

  const title = el('h2', 'bf-card-title', t('bestiary.locked.title'));
  card.appendChild(title);

  const lockRow = el('div', 'bf-lock-row');
  lockRow.appendChild(sym('bf_lock', 24));
  lockRow.appendChild(el('span', 'bf-lock-hint', t('bestiary.locked.hint')));
  card.appendChild(lockRow);

  // Hint at colour so the player can guess what they saw.
  const swatch = el('div', 'bf-color-swatch');
  swatch.style.background = colorHex(def.color);
  card.appendChild(swatch);

  return card;
}

function buildRevealedCard(def: BodyDefinition): HTMLElement {
  const card = el('article', 'bf-card revealed');
  card.style.setProperty('--accent', colorHex(def.color));

  // Header
  const header = el('header', 'bf-card-head');
  const titles = el('div', 'bf-card-titles');
  titles.appendChild(el('h2', 'bf-card-title', def.nameRu));
  if (def.nameRu !== def.name) {
    titles.appendChild(el('div', 'bf-card-subtitle', def.name));
  }
  header.appendChild(titles);

  const elem = elementOf(def);
  const seal = sym(`bf_seal_${elem}`, 64);
  seal.classList.add('bf-seal');
  header.appendChild(seal);
  card.appendChild(header);

  // Badges row
  const badges = el('div', 'bf-badges');
  const beh = behaviorBadge(def);
  const dmg = damageBadge(def);
  badges.appendChild(buildBadge(beh.id, beh.label));
  badges.appendChild(buildBadge(dmg.id, dmg.label));
  badges.appendChild(buildBadge(`bf_seal_${elem}`, t(`bestiary.element.${elem}`)));
  card.appendChild(badges);

  // Art slot — placeholder swatch with first letter
  const art = el('div', 'bf-art revealed');
  art.style.background = `radial-gradient(circle at 50% 40%, ${colorHex(def.color)} 0%, #1a1208 80%)`;
  art.appendChild(el('div', 'bf-art-letter', def.nameRu.charAt(0)));
  card.appendChild(art);

  // Divider — keep symbol's 320x24 ratio
  const divider = sym('bf_divider', 600, 24);
  divider.style.width = '100%';
  card.appendChild(divider);

  // Body — two columns
  const body = el('div', 'bf-card-body');

  // Left col: combat stats
  const left = el('div', 'bf-col');
  left.appendChild(el('h3', 'bf-section-title', t('bestiary.field.stats')));
  if (def.npcStats) {
    for (const sk of Object.keys(def.npcStats) as StatName[]) {
      const v = def.npcStats[sk] ?? 0;
      if (v > 0) left.appendChild(statRow(STAT_NAMES_SHORT[sk], v, 40));
    }
  }
  body.appendChild(left);

  // Right col: caps (teaches) + ability + signature
  const right = el('div', 'bf-col');
  right.appendChild(el('h3', 'bf-section-title', t('bestiary.field.teaches')));
  for (const sk of Object.keys(def.caps) as StatName[]) {
    const cap = def.caps[sk];
    if (!cap) continue;
    const row = el('div', 'bf-cap-row');
    row.appendChild(el('span', 'bf-cap-label', STAT_NAMES_SHORT[sk]));
    row.appendChild(el('span', 'bf-cap-arrow', '→'));
    row.appendChild(el('span', 'bf-cap-value', String(cap)));
    right.appendChild(row);
  }
  body.appendChild(right);
  card.appendChild(body);

  // Footer rows
  const footer = el('div', 'bf-card-footer');

  const abilityRow = el('div', 'bf-foot-row');
  abilityRow.appendChild(el('span', 'bf-foot-key', t('bestiary.field.ability')));
  abilityRow.appendChild(el('span', 'bf-foot-val', def.abilityName));
  footer.appendChild(abilityRow);

  if (def.signatureSpell) {
    const spellRow = el('div', 'bf-foot-row');
    spellRow.appendChild(el('span', 'bf-foot-key', t('bestiary.field.spell')));
    const val = el('span', 'bf-foot-val', def.signatureSpell.nameRu);
    if (def.spellXPThreshold) {
      const gem = el('span', 'bf-xp-gem');
      gem.appendChild(sym('bf_xp_gem', 18));
      gem.appendChild(el('span', undefined, `${def.spellXPThreshold} XP`));
      val.appendChild(gem);
    }
    spellRow.appendChild(val);
    footer.appendChild(spellRow);
  }

  const weaponRow = el('div', 'bf-foot-row');
  weaponRow.appendChild(el('span', 'bf-foot-key', t('bestiary.field.weapon')));
  weaponRow.appendChild(el('span', 'bf-foot-val', def.weapon));
  footer.appendChild(weaponRow);

  const xpRow = el('div', 'bf-foot-row');
  xpRow.appendChild(el('span', 'bf-foot-key', t('bestiary.field.xp')));
  xpRow.appendChild(el('span', 'bf-foot-val', String(def.xpReward)));
  footer.appendChild(xpRow);

  // Personal counters
  const entry = state.progress[def.id];
  if (entry) {
    if (entry.killCount > 0) {
      const r = el('div', 'bf-foot-row dim');
      r.appendChild(el('span', 'bf-foot-key', t('bestiary.field.kills')));
      r.appendChild(el('span', 'bf-foot-val', String(entry.killCount)));
      footer.appendChild(r);
    }
    if (entry.sphereCount > 0) {
      const r = el('div', 'bf-foot-row dim');
      r.appendChild(el('span', 'bf-foot-key', t('bestiary.field.spheres')));
      r.appendChild(el('span', 'bf-foot-val', String(entry.sphereCount)));
      footer.appendChild(r);
    }
  }

  // TBD rows
  const dropRow = el('div', 'bf-foot-row dim');
  dropRow.appendChild(el('span', 'bf-foot-key', t('bestiary.field.drop')));
  dropRow.appendChild(el('span', 'bf-foot-val', t('bestiary.drop.locked')));
  footer.appendChild(dropRow);

  card.appendChild(footer);

  return card;
}

function buildEmptyCard(): HTMLElement {
  const card = el('article', 'bf-card empty');
  card.appendChild(sym('bf_unknown', 220));
  card.appendChild(el('div', 'bf-empty-text', t('bestiary.locked.hint')));
  return card;
}

// ─── Top header ─────────────────────────────────────────────────────────────

function buildHeader(onClose: () => void): HTMLElement {
  const head = el('header', 'bf-header');

  const left = el('div', 'bf-header-left');
  const titleWrap = el('div', 'bf-title-wrap');
  titleWrap.appendChild(el('span', 'bf-glyph', '⌬'));
  titleWrap.appendChild(el('h1', 'bf-title', t('bestiary.title')));
  left.appendChild(titleWrap);
  head.appendChild(left);

  // Filters
  const filters = el('div', 'bf-filters');
  const filterDefs: { id: Filter; label: string }[] = [
    { id: 'all',      label: t('bestiary.tab.all') },
    { id: 'revealed', label: t('bestiary.tab.revealed') },
    { id: 'locked',   label: t('bestiary.tab.locked') },
  ];
  for (const f of filterDefs) {
    const btn = el('button', `bf-filter${state.filter === f.id ? ' active' : ''}`, f.label);
    btn.addEventListener('click', () => {
      state.filter = f.id;
      rerender();
    });
    filters.appendChild(btn);
  }
  head.appendChild(filters);

  // Counter + close
  const right = el('div', 'bf-header-right');
  const total = bestiaryTotalCount();
  const seenCount = Object.keys(state.progress).filter(id =>
    BESTIARY_GROUPS.some(g => g.ids.includes(id))).length;
  const counter = el('span', 'bf-counter', `${seenCount}/${total}`);
  right.appendChild(counter);
  const close = el('button', 'bf-close', '×');
  close.addEventListener('click', onClose);
  right.appendChild(close);
  head.appendChild(right);

  return head;
}

// ─── Render orchestration ───────────────────────────────────────────────────

let cachedOnClose: (() => void) | null = null;

function rerender(): void {
  if (!root || !cachedOnClose) return;
  const stage = root.querySelector('.bf-stage') as HTMLElement | null;
  if (!stage) return;
  stage.innerHTML = '';
  stage.appendChild(buildHeader(cachedOnClose));

  const layout = el('div', 'bf-layout');
  layout.appendChild(buildSidebar());

  const spine = el('div', 'bf-spine');
  const spineSvg = sym('bf_spine', 24, 600);
  spineSvg.style.height = '100%';
  spine.appendChild(spineSvg);
  layout.appendChild(spine);

  const right = el('section', 'bf-page');
  let card: HTMLElement;
  if (!state.selectedId) {
    card = buildEmptyCard();
  } else {
    const def = CREATURE_DB[state.selectedId];
    if (!def) card = buildEmptyCard();
    else if (isRevealed(state.progress, def.id)) card = buildRevealedCard(def);
    else card = buildLockedCard(def);
  }
  right.appendChild(card);
  layout.appendChild(right);

  stage.appendChild(layout);
}

function ensureFrameSpriteInjected(): void {
  if (frameSpriteInjected) return;
  // Inject hidden <svg> with a master <use> from the file so the browser pre-fetches
  // it once and subsequent <use href="..."> resolve faster. Actual symbols are
  // referenced directly via `<use href="/ui/frames.svg#bf_*">`.
  frameSpriteInjected = true;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function showBestiaryWindowDom(onClose: () => void): void {
  hideBestiaryWindowDom();
  ensureFrameSpriteInjected();
  cachedOnClose = onClose;
  state.progress = loadProgress();
  if (!state.selectedId) {
    // Auto-select first revealed creature so the right page is not blank.
    for (const g of BESTIARY_GROUPS) {
      const found = g.ids.find(id => isRevealed(state.progress, id));
      if (found) { state.selectedId = found; break; }
    }
  }

  const container = el('div');
  container.id = 'bf-root';
  container.appendChild(el('div', 'bf-backdrop'));
  const stage = el('div', 'bf-stage');
  container.appendChild(stage);

  container.querySelector('.bf-backdrop')?.addEventListener('click', onClose);

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  window.addEventListener('keydown', keyHandler);
  (container as any)._keyHandler = keyHandler;

  document.body.appendChild(container);
  root = container;
  rerender();
}

export function hideBestiaryWindowDom(): void {
  if (root) {
    const kh = (root as any)._keyHandler;
    if (kh) window.removeEventListener('keydown', kh);
    root.remove();
    root = null;
  }
  cachedOnClose = null;
}

export function isBestiaryWindowDomOpen(): boolean {
  return root !== null;
}

/** Force a redraw if the window is open (e.g. when a new creature is revealed). */
export function refreshBestiaryWindowDom(): void {
  if (!root) return;
  state.progress = loadProgress();
  rerender();
}
