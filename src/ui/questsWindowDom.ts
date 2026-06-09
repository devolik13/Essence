/**
 * DOM-based Quests window — brass/steampunk theme (reuses craftVendor.css cv-* styles).
 * Two collapsible sections: Активные (with objectives + track checkbox) и Завершённые (names).
 */
import { QuestProgress } from '../types/quests';
import { BodyQuestProgress } from '../systems/bodyQuestTracker';
import { openWindowShell, DOMWindowHandle, makeDraggable, restoreWindowPos } from './domWindowBase';
import { t } from '../i18n';

interface QuestsData {
  quests: QuestProgress[];
  trackedQuestIds: string[];
  /** Активный квест тела (★) — показывается в «Активные», если есть. */
  bodyQuest?: BodyQuestProgress | null;
}

interface QuestsCallbacks {
  onClose: () => void;
  onTrackToggle: (questId: string) => void;
}

let handle: (DOMWindowHandle & { stage: HTMLElement }) | null = null;
let root: HTMLElement | null = null;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function objectiveVerb(type: string): string {
  switch (type) {
    case 'kill':      return t('quest.kill');
    case 'capture':   return t('quest.capture');
    case 'talk':      return t('quest.talk');
    case 'craft_t3':  return t('quest.craft');
    case 'kill_boss': return t('quest.defeat');
    default:          return t('quest.learn');
  }
}

/** Активный квест — карточка с целями и чекбоксом отслеживания. */
function buildActiveQuest(q: QuestProgress, tracked: boolean, cb: QuestsCallbacks): HTMLElement {
  const card = el('div', 'cv-quest');

  const head = el('div', 'cv-item-row');
  head.appendChild(el('span', 'cv-item-icon', '📜'));
  head.appendChild(el('span', 'cv-item-name', q.def.nameRu));
  head.appendChild(el('span', 'cv-item-price', `+${q.def.xpReward} XP`));
  const trackBtn = el('button', 'cv-buy-btn', tracked ? '☑' : '☐');
  trackBtn.title = 'Отслеживать на HUD';
  trackBtn.addEventListener('click', () => cb.onTrackToggle(q.def.id));
  head.appendChild(trackBtn);
  card.appendChild(head);

  const objs = el('div', 'cv-quest-objs');
  for (let i = 0; i < q.def.objectives.length; i++) {
    const obj = q.def.objectives[i];
    const cur = q.counts[i] ?? 0;
    const done = cur >= obj.count;
    const line = el('span', 'cv-mat');
    line.appendChild(el('span', 'cv-mat-icon', objectiveVerb(obj.type)));
    line.appendChild(document.createTextNode(` ${obj.targetNameRu ?? obj.targetId ?? ''} `));
    line.appendChild(el('span', `cv-mat-count ${done ? 'ok' : 'short'}`, done ? '✓' : `${cur}/${obj.count}`));
    objs.appendChild(line);
  }
  card.appendChild(objs);
  return card;
}

/** Активный квест тела (★) — собственная карточка (не отслеживается чекбоксом). */
function buildBodyQuest(bq: BodyQuestProgress): HTMLElement {
  const card = el('div', 'cv-quest');

  const head = el('div', 'cv-item-row');
  head.appendChild(el('span', 'cv-item-icon', '★'));
  head.appendChild(el('span', 'cv-item-name', bq.def.nameRu));
  head.appendChild(el('span', 'cv-item-price', `+${bq.def.xpReward} XP`));
  card.appendChild(head);

  const objs = el('div', 'cv-quest-objs');
  for (let i = 0; i < bq.def.objectives.length; i++) {
    const obj = bq.def.objectives[i];
    const cur = bq.counts[i] ?? 0;
    const done = cur >= obj.count;
    const label = obj.description || obj.targetNameRu || obj.targetId || '';
    const line = el('span', 'cv-mat');

    let counter: string;
    if ((obj.type === 'survive' || obj.type === 'protect') && !done) {
      const secs = Math.ceil(obj.type === 'protect' ? bq.protectTimers[i] : bq.surviveTimers[i]);
      const reachDone = obj.type !== 'protect' || bq.def.objectives.some(
        (o, j) => o.type === 'reach' && o.targetId === obj.targetId && (bq.counts[j] ?? 0) >= o.count,
      );
      counter = reachDone ? `${secs}s` : '–';
    } else {
      counter = done ? '✓' : `${cur}/${obj.count}`;
    }

    line.appendChild(el('span', 'cv-mat-icon', '•'));
    line.appendChild(document.createTextNode(` ${label} `));
    line.appendChild(el('span', `cv-mat-count ${done ? 'ok' : 'short'}`, counter));
    objs.appendChild(line);
  }
  card.appendChild(objs);
  return card;
}

function buildSection(name: string, expanded: boolean, count: number, rows: HTMLElement[]): HTMLElement {
  const section = el('div', 'cv-vendor-section');
  const header = el('button', 'cv-section-header');
  header.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  const caret = el('span', 'cv-caret', expanded ? '▾' : '▸');
  header.appendChild(caret);
  header.appendChild(el('span', 'cv-section-name', name));
  header.appendChild(el('span', 'cv-section-count', String(count)));

  const body = el('div', `cv-section-body${expanded ? '' : ' is-collapsed'}`);
  for (const r of rows) body.appendChild(r);

  header.addEventListener('click', () => {
    const collapsed = body.classList.toggle('is-collapsed');
    header.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    caret.textContent = collapsed ? '▸' : '▾';
  });

  section.appendChild(header);
  section.appendChild(body);
  return section;
}

export function showQuestsDom(data: QuestsData, cb: QuestsCallbacks): void {
  hideQuestsDom();

  const completedIds = data.quests.filter(q => q.completed).map(q => q.def.id);
  // Активные: незавершённые с выполненными пререквизитами.
  const active = data.quests.filter(q => {
    if (q.completed) return false;
    const pre = q.def.prerequisiteIds;
    return !pre || pre.length === 0 || pre.every(pid => completedIds.includes(pid));
  });
  const done = data.quests.filter(q => q.completed);

  handle = openWindowShell('', 'cv-backdrop', cb.onClose);
  handle.root.id = 'cv-quests-root';
  root = handle.root;

  const stage = el('div', 'cv-stage');
  const win = el('section', 'cv-window cv-quests');
  const inner = el('div', 'cv-window-inner');
  inner.appendChild(el('span', 'cv-rivet tl'));
  inner.appendChild(el('span', 'cv-rivet tr'));

  // Header
  const header = el('header', 'cv-header');
  const title = el('h2', 'cv-title');
  title.appendChild(el('span', 'cv-glyph', '📜'));
  title.appendChild(document.createTextNode(' Квесты'));
  header.appendChild(title);
  header.appendChild(el('span', 'cv-header-spacer'));
  const close = el('button', 'cv-close', '×');
  close.addEventListener('click', cb.onClose);
  header.appendChild(close);
  inner.appendChild(header);

  // Body
  const body = el('div', 'cv-body');

  const activeRows: HTMLElement[] = [];
  // Активный квест тела (★) — первым, если есть и не завершён.
  const bq = data.bodyQuest;
  if (bq && !bq.completed) activeRows.push(buildBodyQuest(bq));
  for (const q of active) activeRows.push(buildActiveQuest(q, data.trackedQuestIds.includes(q.def.id), cb));

  const activeCount = active.length + (bq && !bq.completed ? 1 : 0);
  if (activeRows.length === 0) activeRows.push(el('div', 'cv-quest-empty', 'Все квесты выполнены!'));
  body.appendChild(buildSection('Активные', true, activeCount, activeRows));

  const doneRows = done.map(q => {
    const row = el('div', 'cv-item-row is-learned');
    row.appendChild(el('span', 'cv-item-icon', '✓'));
    row.appendChild(el('span', 'cv-item-name', q.def.nameRu));
    return row;
  });
  body.appendChild(buildSection('Завершённые', false, done.length, doneRows));

  inner.appendChild(body);
  win.appendChild(inner);
  stage.appendChild(win);
  handle.stage.appendChild(stage);

  makeDraggable(win, header, 'esswin-quests');
  restoreWindowPos(win, 'esswin-quests');
}

export function hideQuestsDom(): void {
  if (handle) {
    handle.destroy();
    handle = null;
    root = null;
  }
}

export function isQuestsDomOpen(): boolean {
  return root !== null;
}
