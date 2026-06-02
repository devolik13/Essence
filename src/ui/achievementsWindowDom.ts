/**
 * DOM-based Achievements window — brass/ether theme, progress bars.
 */
import { Sphere } from '../entities/Sphere';
import { ACHIEVEMENTS, AchievementDef } from '../data/achievementDB';
import { openWindowShell, DOMWindowHandle } from './domWindowBase';

let handle: (DOMWindowHandle & { stage: HTMLElement }) | null = null;
// Legacy alias used by isAchievementsWindowDomOpen
let root: HTMLElement | null = null;

const CATEGORY_ORDER: AchievementDef['category'][] = ['kill', 'capture', 'spell', 'explore'];
const CATEGORY_LABELS: Record<string, string> = {
  kill: 'COMBAT', capture: 'CAPTURE', spell: 'MAGIC', explore: 'EXPLORATION',
};
const CATEGORY_ICONS: Record<string, string> = {
  kill: '⚔', capture: '◉', spell: '✦', explore: '🗺',
};
const CATEGORY_COLORS: Record<string, string> = {
  kill: '#c86a3a', capture: '#5a88c4', spell: '#a78fc4', explore: '#6d9a5a',
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

interface AchProgress { current: number; target: number; }

const KILL_TYPES_ALL = ['hare', 'goblin', 'wolf', 'scout', 'bear', 'orc', 'shaman'];

function getProgress(def: AchievementDef, sphere: Sphere): AchProgress {
  const kc = sphere.killCounts;

  if (def.id.startsWith('kill_') && def.id !== 'kill_all_types') {
    const parts = def.id.split('_');
    const target = parseInt(parts[parts.length - 1], 10);
    const creature = parts.slice(1, parts.length - 1).join('_');
    const current = Math.min(kc[creature] ?? 0, target);
    return { current, target };
  }

  if (def.id === 'kill_all_types') {
    const killed = KILL_TYPES_ALL.filter(t => (kc[t] ?? 0) >= 1).length;
    return { current: killed, target: KILL_TYPES_ALL.length };
  }

  if (def.id.startsWith('capture_')) {
    const target = parseInt(def.id.split('_')[1], 10);
    const current = Math.min(kc['__captures'] ?? 0, target);
    return { current, target };
  }

  if (def.category === 'spell') {
    const has = def.requiredSpellId &&
      sphere.learnedSpells.some(s => s.id === def.requiredSpellId) ? 1 : 0;
    return { current: has, target: 1 };
  }

  return { current: sphere.unlockedAchievements.includes(def.id) ? 1 : 0, target: 1 };
}

function buildAchievementCard(def: AchievementDef, unlocked: boolean, progress: AchProgress): HTMLElement {
  const card = el('div', `ess-ach-card${unlocked ? ' completed' : ''}`);
  const cat = def.category;
  card.style.setProperty('--cat-color', CATEGORY_COLORS[cat] ?? '#d8c9a4');

  const left = el('div', 'ach-icon');
  left.textContent = def.icon;
  card.appendChild(left);

  const body = el('div', 'ach-body');

  const nameRow = el('div', 'ach-name');
  nameRow.textContent = def.nameRu;
  if (unlocked) nameRow.style.color = CATEGORY_COLORS[cat] ?? '#d8c9a4';
  body.appendChild(nameRow);

  const desc = el('div', 'ach-desc', def.descRu);
  body.appendChild(desc);

  const barWrap = el('div', 'ach-bar-wrap');
  const barFill = el('div', 'ach-bar-fill');
  const pct = progress.target > 0 ? Math.min(progress.current / progress.target, 1) : 0;
  barFill.style.width = (pct * 100) + '%';
  barFill.style.backgroundColor = unlocked ? (CATEGORY_COLORS[cat] ?? '#d8c9a4') : '#5a6a7a';
  barWrap.appendChild(barFill);
  body.appendChild(barWrap);

  const count = el('div', 'ach-progress-text', `${progress.current} / ${progress.target}`);
  if (unlocked) count.classList.add('done');
  body.appendChild(count);

  card.appendChild(body);
  return card;
}

const collapsedCategories: Set<string> = new Set();

function buildCategoryGroup(catId: string, achievements: AchievementDef[], sphere: Sphere): HTMLElement {
  const group = el('div', 'ess-ach-group');
  const unlocked = achievements.filter(a => sphere.unlockedAchievements.includes(a.id));
  const collapsed = collapsedCategories.has(catId);
  if (collapsed) group.classList.add('collapsed');

  const header = el('div', 'ag-head');
  const chevron = el('span', 'ag-chevron', collapsed ? '▸' : '▾');
  const icon = el('span', 'ag-icon', CATEGORY_ICONS[catId] ?? '');
  const label = el('span', 'ag-label', CATEGORY_LABELS[catId] ?? catId.toUpperCase());
  label.style.color = CATEGORY_COLORS[catId] ?? '#d8c9a4';
  const count = el('span', 'sg-count', `${unlocked.length} / ${achievements.length}`);
  header.appendChild(chevron);
  header.appendChild(icon);
  header.appendChild(label);
  header.appendChild(count);
  group.appendChild(header);

  const grid = el('div', 'ag-grid');
  const sorted = [...achievements].sort((a, b) => {
    const ua = sphere.unlockedAchievements.includes(a.id) ? 0 : 1;
    const ub = sphere.unlockedAchievements.includes(b.id) ? 0 : 1;
    return ua - ub;
  });
  for (const ach of sorted) {
    const unl = sphere.unlockedAchievements.includes(ach.id);
    const prog = getProgress(ach, sphere);
    grid.appendChild(buildAchievementCard(ach, unl, prog));
  }
  group.appendChild(grid);

  header.addEventListener('click', () => {
    if (collapsedCategories.has(catId)) {
      collapsedCategories.delete(catId);
      group.classList.remove('collapsed');
      chevron.textContent = '▾';
    } else {
      collapsedCategories.add(catId);
      group.classList.add('collapsed');
      chevron.textContent = '▸';
    }
  });

  return group;
}

export function showAchievementsWindowDom(sphere: Sphere, onClose: () => void): void {
  hideAchievementsWindowDom();

  handle = openWindowShell('', 'ess-backdrop', onClose);
  handle.root.id = 'ess-achievements-root';
  root = handle.root;

  const stage = el('div', 'ess-stage');
  const win = el('div', 'ess-window ess-achievements-window');
  for (const c of ['tl', 'tr', 'bl', 'br']) win.appendChild(el('div', `corner ${c}`));

  // Header
  const header = el('div', 'ess-header');
  const left = el('div', 'ess-header-left');
  const unlockedCount = sphere.unlockedAchievements.length;
  const badge = el('span', 'sg-count', `${unlockedCount} / ${ACHIEVEMENTS.length}`);
  badge.style.marginLeft = '6px';
  left.appendChild(el('span', undefined, 'Unlocked'));
  left.appendChild(badge);

  const title = el('div', 'ess-title');
  title.textContent = 'Achievements';
  title.appendChild(el('span', 'sub', 'GLORY · PROGRESS'));

  const right = el('div', 'ess-header-right');
  const close = el('div', 'ess-close-btn', '×');
  close.addEventListener('click', () => onClose());
  right.appendChild(close);

  header.appendChild(left);
  header.appendChild(title);
  header.appendChild(right);
  win.appendChild(header);

  // Body
  const body = el('div', 'ess-achievements-body');
  if (ACHIEVEMENTS.length === 0) {
    body.appendChild(el('div', 'ess-empty', 'No achievements yet.'));
  } else {
    for (const cat of CATEGORY_ORDER) {
      const catAchs = ACHIEVEMENTS.filter(a => a.category === cat);
      if (catAchs.length) body.appendChild(buildCategoryGroup(cat, catAchs, sphere));
    }
  }
  win.appendChild(body);

  stage.appendChild(win);
  handle.stage.appendChild(stage);
}

export function hideAchievementsWindowDom(): void {
  if (handle) {
    handle.destroy();
    handle = null;
    root = null;
  }
}

export function isAchievementsWindowDomOpen(): boolean {
  return root !== null;
}
