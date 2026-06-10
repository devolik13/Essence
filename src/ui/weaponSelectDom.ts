/**
 * DOM Weapon Select window — character creation screen.
 * Ported from Claude Design "Essence Weapon Select" (pixel-perfect recreation).
 * Used by CharCreateScene instead of Phaser-drawn UI. Centered, non-modal shell.
 */
import './weaponSelect.css';
import { WeaponType } from '../types/bodies';
import { WEAPONS, STRENGTH_WEAPONS, AGILITY_WEAPONS, INTELLECT_WEAPONS } from '../data/weapons';
import { openWindowShell, DOMWindowHandle } from './domWindowBase';
import { t, lt } from '../i18n';

const MAX_NAME_LENGTH = 16;
const NAME_CHAR = /[\w\sЀ-ӿ-]/; // same charset as the old Phaser screen

export interface WeaponSelectCallbacks {
  onBack: () => void;
  onCreate: (name: string, weapon1: WeaponType, weapon2: WeaponType) => void;
}

// ── Static per-group data (design: group heads + scaling chips) ──

interface GroupDef {
  cls: 'str' | 'agi' | 'int';
  nameRu: string; nameEn: string;
  tag: string;
  hintRu: string; hintEn: string;
  statsRu: string; statsEn: string;
  /** Scaling chips: [ruName, enName] — first is the main (+3) stat */
  chips: [string, string][];
  weapons: WeaponType[];
}

const GROUP_DEFS: GroupDef[] = [
  {
    cls: 'str', nameRu: 'Сила', nameEn: 'Strength', tag: 'STR',
    hintRu: 'Тяжёлый ближний бой', hintEn: 'Heavy melee',
    statsRu: 'Сила · Броня · HP', statsEn: 'Strength · Armor · HP',
    chips: [['Сила', 'Strength'], ['Броня', 'Armor'], ['HP', 'HP']],
    weapons: STRENGTH_WEAPONS,
  },
  {
    cls: 'agi', nameRu: 'Ловкость', nameEn: 'Agility', tag: 'AGI',
    hintRu: 'Лёгкий / дальний бой', hintEn: 'Light / ranged combat',
    statsRu: 'Ловкость · Точность · Уклонение', statsEn: 'Agility · Accuracy · Evasion',
    chips: [['Ловкость', 'Agility'], ['Точность', 'Accuracy'], ['Уклонение', 'Evasion']],
    weapons: AGILITY_WEAPONS,
  },
  {
    cls: 'int', nameRu: 'Интеллект', nameEn: 'Intellect', tag: 'INT',
    hintRu: 'Посохи · магия', hintEn: 'Staffs · magic',
    statsRu: 'Интеллект · Мана · Воля', statsEn: 'Intellect · Mana · Will',
    chips: [['Интеллект', 'Intellect'], ['Мана', 'Mana'], ['Воля', 'Will']],
    weapons: INTELLECT_WEAPONS,
  },
];

// ── Static per-weapon data: emoji icon, effect sentence, flavor ──

interface WeaponMeta {
  icon: string;
  /** For staffs only: microlabel («школа Огня» / 'Fire school') */
  schoolRu?: string; schoolEn?: string;
  effectRu: string; effectEn: string;
  flavorRu: string; flavorEn: string;
}

const META: Record<WeaponType, WeaponMeta> = {
  [WeaponType.Sword]: {
    icon: '⚔',
    effectRu: 'Удар замедляет врага', effectEn: 'Strikes slow the enemy',
    flavorRu: '«Прямая сталь для прямой воли. Первый клинок, что помнит каждое тело.»',
    flavorEn: '“Straight steel for a straight will. The first blade every body remembers.”',
  },
  [WeaponType.Mace]: {
    icon: '🔨',
    effectRu: 'Удары укрепляют твою броню', effectEn: 'Blows fortify your armor',
    flavorRu: '«Тяжесть — тоже аргумент.»',
    flavorEn: '“Weight is an argument of its own.”',
  },
  [WeaponType.Greatsword]: {
    icon: '⚔',
    effectRu: 'Раны истекают кровью', effectEn: 'Wounds keep bleeding',
    flavorRu: '«Два метра стали не задают вопросов.»',
    flavorEn: '“Two metres of steel ask no questions.”',
  },
  [WeaponType.Spear]: {
    icon: '🗡',
    effectRu: 'Выпад отбрасывает врага', effectEn: 'Thrusts knock the enemy back',
    flavorRu: '«Держи смерть на расстоянии древка.»',
    flavorEn: '“Keep death a shaft’s length away.”',
  },
  [WeaponType.Hammer]: {
    icon: '🔨',
    effectRu: 'Удар сокрушает броню врага', effectEn: 'Blows crush enemy armor',
    flavorRu: '«Там, где прошёл молот, брони больше нет.»',
    flavorEn: '“Where the hammer falls, armor ends.”',
  },
  [WeaponType.Dagger]: {
    icon: '🗡',
    effectRu: 'Клинок отравляет цель', effectEn: 'The blade poisons the target',
    flavorRu: '«Короткий клинок — длинный список имён.»',
    flavorEn: '“A short blade with a long list of names.”',
  },
  [WeaponType.Fists]: {
    icon: '✊',
    effectRu: 'Удар ошеломляет врага', effectEn: 'Hits daze the enemy',
    flavorRu: '«Оружие, которое нельзя выбить из рук.»',
    flavorEn: '“The one weapon that can’t be knocked from your hands.”',
  },
  [WeaponType.ShortBow]: {
    icon: '🏹',
    effectRu: 'Стрела делает цель уязвимой', effectEn: 'Arrows leave the target vulnerable',
    flavorRu: '«Быстрая стрела находит щель в любом доспехе.»',
    flavorEn: '“A quick arrow finds the gap in any armor.”',
  },
  [WeaponType.LongBow]: {
    icon: '🏹',
    effectRu: 'Выстрел может сбросить кулдауны', effectEn: 'Shots may reset your cooldowns',
    flavorRu: '«Терпение, дыхание, выстрел.»',
    flavorEn: '“Patience, breath, release.”',
  },
  [WeaponType.Crossbow]: {
    icon: '🏹',
    effectRu: 'Болт ослабляет силу врага', effectEn: 'Bolts weaken the enemy’s strength',
    flavorRu: '«Механика делает то, что не под силу мышцам.»',
    flavorEn: '“Mechanism does what muscle cannot.”',
  },
  [WeaponType.StaffFire]: {
    icon: '🔥', schoolRu: 'школа Огня', schoolEn: 'Fire school',
    effectRu: 'Открывает заклинания школы Огня', effectEn: 'Unlocks the Fire school of magic',
    flavorRu: '«Искра помнит пожар, которым хочет стать.»',
    flavorEn: '“Every spark remembers the fire it longs to become.”',
  },
  [WeaponType.StaffWater]: {
    icon: '❄', schoolRu: 'школа Воды', schoolEn: 'Water school',
    effectRu: 'Открывает заклинания школы Воды', effectEn: 'Unlocks the Water school of magic',
    flavorRu: '«Холод терпелив. Холод дождётся.»',
    flavorEn: '“The cold is patient. The cold will wait.”',
  },
  [WeaponType.StaffEarth]: {
    icon: '🪨', schoolRu: 'школа Земли', schoolEn: 'Earth school',
    effectRu: 'Открывает заклинания школы Земли', effectEn: 'Unlocks the Earth school of magic',
    flavorRu: '«Камень молчит, но бьёт последним.»',
    flavorEn: '“Stone is silent, but it strikes last.”',
  },
  [WeaponType.StaffWind]: {
    icon: '🌪', schoolRu: 'школа Ветра', schoolEn: 'Wind school',
    effectRu: 'Открывает заклинания школы Ветра', effectEn: 'Unlocks the Wind school of magic',
    flavorRu: '«Ветер не спрашивает дорогу.»',
    flavorEn: '“The wind asks no directions.”',
  },
  [WeaponType.StaffNature]: {
    icon: '🌿', schoolRu: 'школа Природы', schoolEn: 'Nature school',
    effectRu: 'Открывает заклинания школы Природы', effectEn: 'Unlocks the Nature school of magic',
    flavorRu: '«Всё, что растёт, умеет и защищать.»',
    flavorEn: '“All that grows knows how to guard.”',
  },
};

// ── Module state ──────────────────────────────────────────────

let handle: (DOMWindowHandle & { stage: HTMLElement }) | null = null;
let cb: WeaponSelectCallbacks | null = null;

/** slots[0] = weapon I (primary, determines starter body), slots[1] = weapon II */
let slots: (WeaponType | null)[] = [null, null];
let lastPicked: WeaponType | null = null;
let hovered: WeaponType | null = null;
let playerName = '';

// element refs (rebuilt on render)
let tileEls = new Map<WeaponType, HTMLElement>();
let badgeEls = new Map<WeaponType, HTMLElement>();
let asideEl: HTMLElement | null = null;
let counterEl: HTMLElement | null = null;
let createBtnEl: HTMLElement | null = null;
let pickEls: HTMLElement[] = [];
let nameInputEl: HTMLInputElement | null = null;

// ── Helpers ───────────────────────────────────────────────────

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function groupOf(wt: WeaponType): GroupDef {
  return GROUP_DEFS.find(g => g.weapons.includes(wt)) ?? GROUP_DEFS[0];
}

/** Tile microlabel: signature effect name or magic school (existing i18n keys). */
function microLabel(wt: WeaponType): string {
  const meta = META[wt];
  if (meta.schoolRu) return lt(meta.schoolRu, meta.schoolEn);
  const w = WEAPONS[wt];
  if (w.weaponEffect) return t('effect.' + w.weaponEffect);
  if (w.weaponResetCooldownChance) return t('effect.reset_cd');
  if (w.weaponDoubleDamageChance) return t('effect.double_damage');
  if (w.weaponSelfHealChance) return t('effect.self_heal');
  return '—';
}

function detailWeapon(): WeaponType {
  return hovered ?? lastPicked ?? slots[0] ?? slots[1] ?? WeaponType.Sword;
}

function isValid(): boolean {
  return playerName.trim().length > 0 && slots[0] !== null && slots[1] !== null;
}

// ── Actions ───────────────────────────────────────────────────

function pick(wt: WeaponType) {
  const i = slots.indexOf(wt);
  if (i >= 0) {
    // click on selected tile = deselect
    slots[i] = null;
    if (lastPicked === wt) lastPicked = slots[0] ?? slots[1];
  } else if (slots[0] === null) {
    slots[0] = wt;
    lastPicked = wt;
  } else if (slots[1] === null) {
    slots[1] = wt;
    lastPicked = wt;
  } else {
    // both set — replace weapon II (historic behavior)
    slots[1] = wt;
    lastPicked = wt;
  }
  updateSelection();
}

function clearSlot(idx: number) {
  const wt = slots[idx];
  slots[idx] = null;
  if (wt !== null && lastPicked === wt) lastPicked = slots[0] ?? slots[1];
  updateSelection();
}

function swapSlots() {
  [slots[0], slots[1]] = [slots[1], slots[0]];
  updateSelection();
}

function tryCreate() {
  if (!isValid() || !cb) return;
  cb.onCreate(playerName.trim(), slots[0]!, slots[1]!);
}

// ── Render: detail panel (right) ──────────────────────────────

function renderDetail() {
  if (!asideEl) return;
  const wt = detailWeapon();
  const meta = META[wt];
  const w = WEAPONS[wt];
  const g = groupOf(wt);

  asideEl.className = 'ws-detail ' + g.cls;
  asideEl.innerHTML = '';

  asideEl.appendChild(el('div', 'ws-detail-emblem', meta.icon));

  const head = el('div', 'ws-detail-head');
  head.appendChild(el('h3', 'ws-detail-name', t(`weapon.${wt}`)));
  const badge = el('span', 'ws-detail-badge');
  badge.appendChild(el('span', 'dot'));
  badge.appendChild(document.createTextNode(`${lt(g.nameRu, g.nameEn)} · ${g.tag}`));
  head.appendChild(badge);
  asideEl.appendChild(head);

  // stat rows
  const rows = el('div', 'ws-stat-rows');
  const addRow = (label: string, value: string, unit?: string) => {
    const row = el('div', 'ws-stat-row');
    row.appendChild(el('span', 'lbl', label));
    const val = el('span', 'val', value);
    if (unit) val.appendChild(el('span', 'unit', ' ' + unit));
    row.appendChild(val);
    rows.appendChild(row);
  };
  // Starter weapons historically all show base damage 10 on this screen.
  addRow(lt('Базовый урон', 'Base damage'), '10');
  addRow(lt('Скорость (КД)', 'Speed (CD)'), `${w.cooldown}`, lt('с', 's'));
  addRow(lt('Дальность', 'Range'), `${w.range}`, 'px');
  asideEl.appendChild(rows);

  // signature effect / magic school
  const eff = el('div', 'ws-effect');
  eff.appendChild(el('span', 'ws-effect-label',
    meta.schoolRu ? lt('Школа магии', 'Magic school') : lt('Фирменный эффект', 'Signature effect')));
  eff.appendChild(el('span', 'ws-effect-text', lt(meta.effectRu, meta.effectEn)));
  asideEl.appendChild(eff);

  // scaling chips
  const scaling = el('div', 'ws-scaling');
  scaling.appendChild(el('span', 'ws-scaling-label', lt('Прокачка статов', 'Stat growth')));
  const chips = el('div', 'ws-scaling-chips');
  g.chips.forEach(([ru, en], i) => {
    const chip = el('div', i === 0 ? 'ws-chip is-main' : 'ws-chip');
    chip.appendChild(el('span', 'name', lt(ru, en)));
    chip.appendChild(el('span', 'plus', i === 0 ? '+3' : '+1'));
    chips.appendChild(chip);
  });
  scaling.appendChild(chips);
  asideEl.appendChild(scaling);

  asideEl.appendChild(el('p', 'ws-flavor', lt(meta.flavorRu, meta.flavorEn)));

  // focus glow on the tile currently shown in detail (if selected)
  const focusWt = detailWeapon();
  for (const [twt, tile] of tileEls) {
    tile.classList.toggle('is-focused', twt === focusWt && slots.includes(twt));
  }
}

// ── Render: selection-dependent bits ──────────────────────────

function renderPick(idx: number) {
  const pickEl = pickEls[idx];
  if (!pickEl) return;
  const wt = slots[idx];
  pickEl.innerHTML = '';
  pickEl.classList.toggle('is-set', wt !== null);

  pickEl.appendChild(el('span', 'ws-pick-slot', idx === 0 ? 'I' : 'II'));

  const role = idx === 0
    ? lt('Оружие I · основное', 'Weapon I · primary')
    : lt('Оружие II · второе', 'Weapon II · secondary');

  if (wt !== null) {
    pickEl.appendChild(el('span', 'ws-pick-icon', META[wt].icon));
    const text = el('span', 'ws-pick-text');
    text.appendChild(el('span', 'ws-pick-role', role));
    text.appendChild(el('span', 'ws-pick-name', t(`weapon.${wt}`)));
    pickEl.appendChild(text);
    const clear = el('button', 'ws-pick-clear', '×');
    clear.title = lt('Сбросить', 'Clear');
    clear.addEventListener('click', () => clearSlot(idx));
    pickEl.appendChild(clear);
  } else {
    const text = el('span', 'ws-pick-text');
    text.appendChild(el('span', 'ws-pick-role', role));
    text.appendChild(el('span', 'ws-pick-name empty', lt('не выбрано', 'not chosen')));
    pickEl.appendChild(text);
  }
}

function updateSelection() {
  // tiles: selected state + badges I/II
  for (const [wt, tile] of tileEls) {
    const idx = slots.indexOf(wt);
    tile.classList.toggle('is-selected', idx >= 0);
    const badge = badgeEls.get(wt)!;
    if (idx >= 0) {
      badge.style.display = '';
      badge.textContent = idx === 0 ? 'I' : 'II';
    } else {
      badge.style.display = 'none';
    }
  }

  // counter
  if (counterEl) {
    const n = slots.filter(s => s !== null).length;
    counterEl.innerHTML = '';
    if (n === 2) counterEl.appendChild(el('span', 'ok', '✓'));
    counterEl.appendChild(document.createTextNode(` ${n} / 2 ${lt('выбрано', 'chosen')}`));
  }

  renderPick(0);
  renderPick(1);
  updateCreateBtn();
  renderDetail();
}

function updateCreateBtn() {
  if (createBtnEl) createBtnEl.classList.toggle('is-disabled', !isValid());
}

// ── Render: full window skeleton ──────────────────────────────

function render() {
  if (!handle) return;
  handle.stage.innerHTML = '';
  tileEls = new Map();
  badgeEls = new Map();
  pickEls = [];

  const stage = el('div', 'ws-stage');
  const col = el('div', 'ws-col');
  col.appendChild(el('p', 'ws-caption', lt('Создание персонажа · Сущность', 'Character Creation · Essence')));

  const win = el('section', 'ws-window');
  const inner = el('div', 'ws-window-inner');
  for (const c of ['tl', 'tr', 'bl', 'br']) inner.appendChild(el('span', `ws-rivet ${c}`));

  // ── Header ──
  const header = el('header', 'ws-header');
  const titles = el('div', 'ws-titles');
  const title = el('h2', 'ws-title');
  title.appendChild(el('span', 'glyph', '⬡'));
  title.appendChild(document.createTextNode(' ' + lt('Выбор оружия', 'Weapon Select')));
  titles.appendChild(title);
  titles.appendChild(el('p', 'ws-subtitle', lt('Кем ты станешь?', 'Who will you become?')));
  header.appendChild(titles);
  header.appendChild(el('span', 'ws-header-spacer'));
  counterEl = el('span', 'ws-counter');
  header.appendChild(counterEl);
  const close = el('button', 'ws-close', '×');
  close.title = lt('Назад', 'Back');
  close.addEventListener('click', () => cb?.onBack());
  header.appendChild(close);
  inner.appendChild(header);

  // ── Body: groups (left) + detail (right) ──
  const body = el('div', 'ws-body');
  const groupsHost = el('div', 'ws-groups');

  for (const g of GROUP_DEFS) {
    const groupEl = el('div', `ws-group ${g.cls}`);

    const head = el('div', 'ws-group-head');
    head.appendChild(el('span', 'ws-group-name', lt(g.nameRu, g.nameEn)));
    head.appendChild(el('span', 'ws-group-tag', g.tag));
    const stats = el('span', 'ws-group-stats');
    stats.appendChild(document.createTextNode(lt(g.hintRu, g.hintEn) + ' · '));
    stats.appendChild(el('b', undefined, lt(g.statsRu, g.statsEn)));
    head.appendChild(stats);
    groupEl.appendChild(head);

    const tiles = el('div', 'ws-tiles');
    for (const wt of g.weapons) {
      const tile = el('div', 'ws-tile');
      tile.tabIndex = 0;
      const badge = el('span', 'ws-badge');
      badge.style.display = 'none';
      tile.appendChild(badge);
      tile.appendChild(el('span', 'ws-tile-icon', META[wt].icon));
      tile.appendChild(el('span', 'ws-tile-name', t(`weapon.${wt}`)));
      const fx = el('span', 'ws-tile-fx');
      fx.appendChild(el('span', 'dot'));
      fx.appendChild(document.createTextNode(microLabel(wt)));
      tile.appendChild(fx);

      tile.addEventListener('click', () => pick(wt));
      tile.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(wt); }
      });
      tile.addEventListener('mouseenter', () => { hovered = wt; renderDetail(); });
      tile.addEventListener('mouseleave', () => {
        if (hovered === wt) hovered = null;
        renderDetail();
      });

      tileEls.set(wt, tile);
      badgeEls.set(wt, badge);
      tiles.appendChild(tile);
    }
    groupEl.appendChild(tiles);
    groupsHost.appendChild(groupEl);
  }
  body.appendChild(groupsHost);

  asideEl = el('aside', 'ws-detail');
  body.appendChild(asideEl);
  inner.appendChild(body);

  // ── Name row (addition: the flow needs a character name) ──
  const nameRow = el('div', 'ws-name-row');
  const nameLabel = el('label', 'ws-name-label', lt('Имя', 'Name'));
  nameLabel.htmlFor = 'ws-name-input';
  nameRow.appendChild(nameLabel);
  nameInputEl = el('input', 'ws-name-input') as HTMLInputElement;
  nameInputEl.id = 'ws-name-input';
  nameInputEl.type = 'text';
  nameInputEl.maxLength = MAX_NAME_LENGTH;
  nameInputEl.placeholder = lt('Как зовут твоё первое тело?', 'What is your first body called?');
  nameInputEl.value = playerName;
  nameInputEl.autocomplete = 'off';
  nameInputEl.spellcheck = false;
  nameInputEl.addEventListener('input', () => {
    const cleaned = Array.from(nameInputEl!.value)
      .filter(ch => NAME_CHAR.test(ch))
      .join('')
      .slice(0, MAX_NAME_LENGTH);
    if (cleaned !== nameInputEl!.value) nameInputEl!.value = cleaned;
    playerName = cleaned;
    updateCreateBtn();
  });
  nameInputEl.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); tryCreate(); }
  });
  nameRow.appendChild(nameInputEl);
  inner.appendChild(nameRow);

  // ── Selection bar ──
  const bar = el('div', 'ws-select-bar');
  const pickA = el('div', 'ws-pick');
  pickEls.push(pickA);
  bar.appendChild(pickA);
  const swap = el('button', 'ws-swap', '⇄');
  swap.title = lt('Поменять I и II', 'Swap I and II');
  swap.addEventListener('click', () => swapSlots());
  bar.appendChild(swap);
  const pickB = el('div', 'ws-pick');
  pickEls.push(pickB);
  bar.appendChild(pickB);
  inner.appendChild(bar);

  // ── Footer ──
  const footer = el('footer', 'ws-footer');
  const note = el('span', 'ws-footer-note');
  note.appendChild(el('span', 'glyph', '⬡'));
  note.appendChild(document.createTextNode(' ' + lt(
    'Основное оружие определит твоё стартовое тело',
    'Your primary weapon determines your starting body',
  )));
  footer.appendChild(note);
  footer.appendChild(el('span', 'ws-footer-spacer'));
  const back = el('button', 'ws-btn secondary', t('title.back'));
  back.addEventListener('click', () => cb?.onBack());
  footer.appendChild(back);
  createBtnEl = el('button', 'ws-btn primary');
  createBtnEl.appendChild(el('span', 'glyph', '⬡'));
  createBtnEl.appendChild(document.createTextNode(' ' + lt('Создать персонажа', 'Create Character')));
  createBtnEl.addEventListener('click', () => tryCreate());
  footer.appendChild(createBtnEl);
  inner.appendChild(footer);

  win.appendChild(inner);
  col.appendChild(win);
  stage.appendChild(col);
  handle.stage.appendChild(stage);

  updateSelection();
  nameInputEl.focus();
}

// ── Public API ────────────────────────────────────────────────

export function showWeaponSelectDom(callbacks: WeaponSelectCallbacks) {
  hideWeaponSelectDom();
  cb = callbacks;
  slots = [null, null];
  lastPicked = null;
  hovered = null;
  playerName = '';
  handle = openWindowShell('', 'ws-backdrop', () => cb?.onBack());
  handle.root.id = 'ws-weapon-select-root';
  render();
}

export function hideWeaponSelectDom() {
  if (handle) { handle.destroy(); handle = null; }
  cb = null;
  asideEl = null;
  counterEl = null;
  createBtnEl = null;
  nameInputEl = null;
  tileEls = new Map();
  badgeEls = new Map();
  pickEls = [];
}

export function isWeaponSelectDomOpen(): boolean {
  return handle !== null;
}
