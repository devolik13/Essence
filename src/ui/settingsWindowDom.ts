/**
 * DOM-based Settings window — brass/steampunk theme (reuses craftVendor.css cv-* styles).
 * Пока одна секция — язык интерфейса (EN/RU). Расширяется новыми секциями
 * (звук, управление и т.д.) по мере надобности.
 */
import { openWindowShell, DOMWindowHandle, makeDraggable, restoreWindowPos } from './domWindowBase';
import { t, lt, getLang, setLang, Lang } from '../i18n';
import { getMusicVolume, setMusicVolume } from '../systems/music';

interface SettingsCallbacks {
  onClose: () => void;
  /** Вызывается после смены языка — UIScene обновляет статичные тексты HUD. */
  onLangChange: (lang: Lang) => void;
}

let handle: (DOMWindowHandle & { stage: HTMLElement }) | null = null;
let root: HTMLElement | null = null;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function buildLangRow(lang: Lang, label: string, cb: SettingsCallbacks): HTMLElement {
  const row = el('div', 'cv-item-row');
  row.appendChild(el('span', 'cv-item-icon', lang === 'ru' ? '🇷🇺' : '🇬🇧'));
  row.appendChild(el('span', 'cv-item-name', label));

  const active = getLang() === lang;
  const btn = el('button', 'cv-buy-btn', active ? '✓' : ' ');
  btn.disabled = active;
  btn.addEventListener('click', () => {
    if (getLang() === lang) return;
    setLang(lang);
    cb.onLangChange(lang);
    // Перерисовываем само окно на новом языке (позиция сохраняется в localStorage)
    showSettingsDom(cb);
  });
  row.appendChild(btn);
  return row;
}

export function showSettingsDom(cb: SettingsCallbacks): void {
  hideSettingsDom();

  handle = openWindowShell('', 'cv-backdrop', cb.onClose);
  handle.root.id = 'cv-settings-root';
  root = handle.root;

  const stage = el('div', 'cv-stage');
  const win = el('section', 'cv-window cv-settings');
  win.style.maxWidth = '360px';
  const inner = el('div', 'cv-window-inner');
  inner.appendChild(el('span', 'cv-rivet tl'));
  inner.appendChild(el('span', 'cv-rivet tr'));

  // Header
  const header = el('header', 'cv-header');
  const title = el('h2', 'cv-title');
  title.appendChild(el('span', 'cv-glyph', '⚙'));
  title.appendChild(document.createTextNode(' ' + t('settings.title')));
  header.appendChild(title);
  header.appendChild(el('span', 'cv-header-spacer'));
  const close = el('button', 'cv-close', '×');
  close.addEventListener('click', cb.onClose);
  header.appendChild(close);
  inner.appendChild(header);

  // Body — секция «Язык»
  const body = el('div', 'cv-body');

  const section = el('div', 'cv-vendor-section');
  const secHeader = el('button', 'cv-section-header');
  secHeader.setAttribute('aria-expanded', 'true');
  const caret = el('span', 'cv-caret', '▾');
  secHeader.appendChild(caret);
  secHeader.appendChild(el('span', 'cv-section-name', t('settings.language')));
  const secBody = el('div', 'cv-section-body');
  secBody.appendChild(buildLangRow('en', t('settings.lang.en'), cb));
  secBody.appendChild(buildLangRow('ru', t('settings.lang.ru'), cb));
  const hint = el('div', 'cv-quest-empty', t('settings.lang.hint'));
  secBody.appendChild(hint);
  secHeader.addEventListener('click', () => {
    const collapsed = secBody.classList.toggle('is-collapsed');
    secHeader.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    caret.textContent = collapsed ? '▸' : '▾';
  });
  section.appendChild(secHeader);
  section.appendChild(secBody);
  body.appendChild(section);

  // Body — секция «Звук» (громкость музыки)
  const sndSection = el('div', 'cv-vendor-section');
  const sndHeader = el('button', 'cv-section-header');
  sndHeader.setAttribute('aria-expanded', 'true');
  const sndCaret = el('span', 'cv-caret', '▾');
  sndHeader.appendChild(sndCaret);
  sndHeader.appendChild(el('span', 'cv-section-name', lt('Звук', 'Sound')));
  const sndBody = el('div', 'cv-section-body');

  const volRow = el('div', 'cv-item-row');
  volRow.appendChild(el('span', 'cv-item-icon', '🎵'));
  volRow.appendChild(el('span', 'cv-item-name', lt('Музыка', 'Music')));
  const pct = el('span', 'cv-item-name', Math.round(getMusicVolume() * 100) + '%');
  pct.style.minWidth = '44px';
  pct.style.textAlign = 'right';
  const slider = el('input') as HTMLInputElement;
  slider.type = 'range';
  slider.min = '0'; slider.max = '100'; slider.step = '5';
  slider.value = String(Math.round(getMusicVolume() * 100));
  slider.style.flex = '1';
  slider.style.margin = '0 8px';
  slider.addEventListener('input', () => {
    const v = Number(slider.value) / 100;
    setMusicVolume(v);
    pct.textContent = slider.value + '%';
  });
  volRow.appendChild(slider);
  volRow.appendChild(pct);
  sndBody.appendChild(volRow);

  sndHeader.addEventListener('click', () => {
    const collapsed = sndBody.classList.toggle('is-collapsed');
    sndHeader.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    sndCaret.textContent = collapsed ? '▸' : '▾';
  });
  sndSection.appendChild(sndHeader);
  sndSection.appendChild(sndBody);
  body.appendChild(sndSection);

  inner.appendChild(body);
  win.appendChild(inner);
  stage.appendChild(win);
  handle.stage.appendChild(stage);

  makeDraggable(win, header, 'esswin-settings');
  restoreWindowPos(win, 'esswin-settings');
}

export function hideSettingsDom(): void {
  if (handle) {
    handle.destroy();
    handle = null;
    root = null;
  }
}

export function isSettingsDomOpen(): boolean {
  return root !== null;
}
