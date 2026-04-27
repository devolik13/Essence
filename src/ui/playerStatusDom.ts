/**
 * DOM-based player status bar (top center of screen).
 * Uses statuses.svg sprite sheet for icons. Updated from UIScene every frame
 * via syncPlayerStatusDom().
 */
import { createSpriteSvg, SpriteRef } from './weaponIcon';

const SVG_NS = 'http://www.w3.org/2000/svg';

const STATUS_SPRITE: Record<string, string> = {
  poison: 'st_poison',
  bleed: 'st_bleed',
  burn: 'st_burn',
  burn_mana: 'st_burn_mana',
  slow: 'st_slow',
  chill: 'st_chill',
  freeze: 'st_freeze',
  root: 'st_root',
  stun: 'st_stun',
  silence: 'st_silence',
  sleep: 'st_sleep',
  daze: 'st_daze',
  armor_reduce: 'st_armor_reduce',
  armor_break: 'st_armor_break',
  vulnerability: 'st_vulnerability',
  weaken: 'st_weaken',
  acceleration: 'st_acceleration',
  fortify: 'st_fortify',
  bark_armor: 'st_bark_armor',
  leaf_regen: 'st_leaf_regen',
  hp_regen_boost: 'st_leaf_regen',
  mana_regen_boost: 'st_mana_regen',
};

export interface StatusEntry {
  id: string;
  stacks: number;
  /** Remaining time in seconds, or -1 for permanent */
  timer: number;
}

let root: HTMLElement | null = null;
const pool: HTMLElement[] = [];

function ensureRoot(): HTMLElement {
  if (root) return root;
  const r = document.createElement('div');
  r.id = 'ess-player-status-bar';
  document.body.appendChild(r);
  root = r;
  return r;
}

function getOrCreatePill(idx: number): HTMLElement {
  let pill = pool[idx];
  if (pill) return pill;
  pill = document.createElement('div');
  pill.className = 'ess-status-pill';
  const iconWrap = document.createElement('div');
  iconWrap.className = 'ess-status-pill-icon';
  pill.appendChild(iconWrap);
  const timerEl = document.createElement('div');
  timerEl.className = 'ess-status-pill-timer';
  pill.appendChild(timerEl);
  pool[idx] = pill;
  return pill;
}

/** Render the status pills. Called from UIScene update. */
export function syncPlayerStatusDom(entries: StatusEntry[]): void {
  const r = ensureRoot();

  // Hide pills that are no longer needed
  for (let i = entries.length; i < pool.length; i++) {
    const p = pool[i];
    if (p && p.parentElement) p.parentElement.removeChild(p);
  }

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const pill = getOrCreatePill(i);
    if (pill.parentElement !== r) r.appendChild(pill);

    const symId = STATUS_SPRITE[e.id];
    pill.dataset.kind = e.id;

    // Icon: build SVG only when status id changed (avoid pointless DOM work)
    if (pill.dataset.lastSym !== symId) {
      const iconWrap = pill.firstElementChild as HTMLElement;
      iconWrap.innerHTML = '';
      if (symId) {
        const ref: SpriteRef = { file: 'statuses.svg', id: symId };
        const svg = createSpriteSvg(ref);
        svg.setAttribute('width', '32');
        svg.setAttribute('height', '32');
        iconWrap.appendChild(svg);
      } else {
        // fallback: text glyph
        iconWrap.textContent = '✦';
      }
      pill.dataset.lastSym = symId ?? 'fallback';
    }

    // Stacks badge — append number to icon area if >1
    const iconWrap = pill.firstElementChild as HTMLElement;
    let stackBadge = iconWrap.querySelector('.ess-status-stacks') as HTMLElement | null;
    if (e.stacks > 1) {
      if (!stackBadge) {
        stackBadge = document.createElement('span');
        stackBadge.className = 'ess-status-stacks';
        iconWrap.appendChild(stackBadge);
      }
      stackBadge.textContent = `×${e.stacks}`;
    } else if (stackBadge) {
      stackBadge.remove();
    }

    // Timer text
    const timerEl = pill.lastElementChild as HTMLElement;
    const wantTimer = e.timer < 0 ? 'ON' : e.timer > 0 ? e.timer.toFixed(1) : '';
    if (timerEl.textContent !== wantTimer) timerEl.textContent = wantTimer;
  }
}

/** Hide the bar entirely (e.g. when no body is possessed). */
export function clearPlayerStatusDom(): void {
  if (!root) return;
  while (root.firstChild) root.removeChild(root.firstChild);
  pool.length = 0;
}
