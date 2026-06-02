/**
 * DOM-based inventory overlay — ported from Claude Design prototype.
 * Renders above the Phaser canvas using absolute-positioned HTML.
 */
import './inventory.css';
import { ITEMS } from '../data/itemDB';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { StatName } from '../types/stats';
import { ItemDef, InventoryItem } from '../types/items';
import { calcRank } from '../systems/progression';
import { spriteForItem, createSpriteSvg } from './weaponIcon';
import { openWindowShell, DOMWindowHandle } from './domWindowBase';

type FilterKind = 'all' | 'equipment' | 'material' | 'consumable';

interface InvCallbacks {
  onEquip: (itemId: string, slot: string) => void;
  onUnequip: (slot: string) => void;
  onUseConsumable: (itemId: string) => void;
  onSwitchWeapon: (idx: 0 | 1) => void;
  onClose: () => void;
}

interface RenderArgs {
  sphere: Sphere;
  body: Body | null;
  cb: InvCallbacks;
}

const BAG_CAPACITY = 64;
const BAG_PAGE_SIZE = 16;
const BAG_PAGES = Math.ceil(BAG_CAPACITY / BAG_PAGE_SIZE);

let handle: (DOMWindowHandle & { stage: HTMLElement }) | null = null;
let root: HTMLElement | null = null;
let currentFilter: FilterKind = 'all';
let currentPage = 0;
let currentArgs: RenderArgs | null = null;
let currentTooltip: HTMLElement | null = null;

const EQUIP_SLOTS: { id: keyof import('../types/items').Equipment; cls: string; label: string }[] = [
  { id: 'helmet',      cls: 'eq-helmet',  label: 'Helmet' },
  { id: 'amulet',      cls: 'eq-amulet',  label: 'Amulet' },
  { id: 'chest',       cls: 'eq-chest',   label: 'Chest' },
  { id: 'gloves',      cls: 'eq-gloves',  label: 'Gloves' },
  { id: 'ring',        cls: 'eq-ring',    label: 'Ring' },
  { id: 'boots',       cls: 'eq-boots',   label: 'Boots' },
  { id: 'weapon',      cls: 'eq-weapon1', label: 'Weapon I' },
  { id: 'weapon2',     cls: 'eq-weapon2', label: 'Weapon II' },
  { id: 'shield',      cls: 'eq-shield',  label: 'Shield' },
  { id: 'weapon_rune', cls: 'eq-wrune',   label: 'Wpn Rune' },
  { id: 'armor_rune',  cls: 'eq-arune',   label: 'Arm Rune' },
];

const STAT_ORDER: { id: StatName; short: string }[] = [
  { id: StatName.Strength,  short: 'STR' },
  { id: StatName.Agility,   short: 'AGI' },
  { id: StatName.Accuracy,  short: 'ACC' },
  { id: StatName.Evasion,   short: 'EVA' },
  { id: StatName.Health,    short: 'HP'  },
  { id: StatName.Armor,     short: 'ARM' },
  { id: StatName.Intellect, short: 'INT' },
  { id: StatName.Will,      short: 'WIL' },
  { id: StatName.Mana,      short: 'MNA' },
  { id: StatName.Luck,      short: 'LCK' },
];

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function computeBonuses(sphere: Sphere): Record<string, number> {
  const bonuses: Record<string, number> = {};
  for (const sn of Object.values(StatName)) bonuses[sn] = 0;
  const equip = sphere.equipment as Record<string, string | undefined>;
  for (const slotKey of Object.keys(equip)) {
    const iid = equip[slotKey];
    if (!iid) continue;
    const def = ITEMS[iid];
    if (!def) continue;
    if (def.statBonuses) {
      for (const [stat, val] of Object.entries(def.statBonuses)) {
        if (val) bonuses[stat] = (bonuses[stat] || 0) + val;
      }
    }
    if (def.armorBonus) bonuses[StatName.Armor] = (bonuses[StatName.Armor] || 0) + def.armorBonus;
    if (def.manaBonus) bonuses[StatName.Mana] = (bonuses[StatName.Mana] || 0) + def.manaBonus;
  }
  return bonuses;
}

function rarityOrType(item: ItemDef): string {
  return item.rarity;
}

function buildSphereSvg(): SVGSVGElement {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 480');
  svg.setAttribute('fill', 'none');
  svg.innerHTML = `
    <defs>
      <radialGradient id="essSphereCore" cx="40%" cy="35%" r="65%">
        <stop offset="0%"  stop-color="#f0f6ff" stop-opacity="1"/>
        <stop offset="18%" stop-color="#d8e8f8" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="#8ab8e0" stop-opacity="0.85"/>
        <stop offset="75%" stop-color="#2a4a74" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="#1a2840" stop-opacity="0.6"/>
      </radialGradient>
      <radialGradient id="essSphereHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0%"  stop-color="#8ab8e0" stop-opacity="0.5"/>
        <stop offset="60%" stop-color="#5a8fc4" stop-opacity="0.12"/>
        <stop offset="100%" stop-color="#1a2840" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="essBodyAura" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"  stop-color="#8ab8e0" stop-opacity="0.28"/>
        <stop offset="45%" stop-color="#5a8fc4" stop-opacity="0.2"/>
        <stop offset="100%" stop-color="#2a4a74" stop-opacity="0.02"/>
      </linearGradient>
      <filter id="essAuraBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6"/>
      </filter>
    </defs>
    <g filter="url(#essAuraBlur)" opacity="0.9">
      <path d="M 100 60 C 118 62 128 76 126 96 C 138 106 148 130 150 158 C 152 190 144 232 138 268 C 150 292 156 328 152 372 C 148 410 140 438 132 458 L 112 466 L 108 424 L 104 390 L 100 416 L 96 390 L 92 424 L 88 466 L 68 458 C 60 438 52 410 48 372 C 44 328 50 292 62 268 C 56 232 48 190 50 158 C 52 130 62 106 74 96 C 72 76 82 62 100 60 Z"
        fill="url(#essBodyAura)"/>
    </g>
    <g opacity="0.45" stroke="#8ab8e0" stroke-width="0.6" fill="none" stroke-linecap="round">
      <path d="M74 96 Q66 72 72 48" stroke-dasharray="1 4">
        <animate attributeName="stroke-dashoffset" from="0" to="10" dur="4s" repeatCount="indefinite"/>
      </path>
      <path d="M126 96 Q134 72 128 48" stroke-dasharray="1 4">
        <animate attributeName="stroke-dashoffset" from="10" to="0" dur="5s" repeatCount="indefinite"/>
      </path>
      <path d="M100 62 Q104 46 100 30" stroke-dasharray="1 3"/>
    </g>
    <circle cx="100" cy="40" r="46" fill="url(#essSphereHalo)">
      <animate attributeName="r" values="42;52;42" dur="6s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.8;1;0.8" dur="6s" repeatCount="indefinite"/>
    </circle>
    <circle cx="100" cy="40" r="22" fill="url(#essSphereCore)"/>
    <circle cx="100" cy="40" r="22" fill="none" stroke="#d8e8f8" stroke-width="0.5" opacity="0.6"/>
    <ellipse cx="92" cy="32" rx="6" ry="4" fill="#ffffff" opacity="0.55"/>
    <circle cx="100" cy="40" r="30" fill="none" stroke="#8ab8e0" stroke-width="0.4" opacity="0.35" stroke-dasharray="2 4">
      <animateTransform attributeName="transform" type="rotate" from="0 100 40" to="360 100 40" dur="28s" repeatCount="indefinite"/>
    </circle>
  `;
  return svg;
}

function buildSlot(
  itemDef: ItemDef | null,
  qty: number | undefined,
  onClick: (() => void) | null,
  emptyHint = '◇',
): HTMLElement {
  const slot = el('div', 'ess-slot');
  if (itemDef) {
    slot.setAttribute('data-rarity', rarityOrType(itemDef));
    const icon = el('span', 'icon');
    const sprite = spriteForItem(itemDef.id);
    if (sprite) {
      icon.classList.add('icon-svg');
      icon.appendChild(createSpriteSvg(sprite, 'weapon-svg-icon'));
    } else {
      icon.textContent = itemDef.icon || '?';
    }
    slot.appendChild(icon);
    if (qty && qty > 1) {
      const q = el('span', 'qty', String(qty));
      slot.appendChild(q);
    }
  } else {
    slot.classList.add('empty');
    const hint = el('span', 'hint', emptyHint);
    slot.appendChild(hint);
  }
  if (onClick) {
    slot.addEventListener('click', onClick);
  } else {
    slot.style.cursor = 'default';
  }
  if (itemDef) wireTooltip(slot, itemDef);
  return slot;
}

function wireTooltip(target: HTMLElement, itemDef: ItemDef) {
  target.addEventListener('mouseenter', () => showTooltip(target, itemDef));
  target.addEventListener('mousemove', (e) => positionTooltip(e.clientX, e.clientY));
  target.addEventListener('mouseleave', hideTooltip);
}

function showTooltip(target: HTMLElement, itemDef: ItemDef) {
  hideTooltip();
  const tt = el('div', 'ess-tooltip');
  tt.setAttribute('data-rarity', itemDef.rarity);

  const head = el('div', 'tt-head');
  head.appendChild(el('span', 'tt-name', itemDef.nameRu));
  head.appendChild(el('span', 'tt-rarity', itemDef.rarity.toUpperCase()));
  tt.appendChild(head);

  const typeLine = el('div', 'tt-type');
  typeLine.textContent = itemDef.type.toUpperCase() + (itemDef.equipSlot ? ` · ${itemDef.equipSlot}` : '');
  tt.appendChild(typeLine);

  const entries: [string, string][] = [];
  if (itemDef.armorBonus)  entries.push(['Armor',  '+' + itemDef.armorBonus]);
  if (itemDef.hpRestore)   entries.push(['HP',     '+' + itemDef.hpRestore]);
  if (itemDef.manaRestore) entries.push(['Mana',   '+' + itemDef.manaRestore]);
  if (itemDef.manaBonus)   entries.push(['Mana',   '+' + itemDef.manaBonus]);
  if (itemDef.statBonuses) {
    for (const [k, v] of Object.entries(itemDef.statBonuses)) {
      if (v) entries.push([k, '+' + v]);
    }
  }
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

  if (itemDef.descRu) {
    tt.appendChild(el('div', 'tt-desc', itemDef.descRu));
  }

  const foot = el('div', 'tt-foot');
  if (itemDef.type === 'equipment')  foot.textContent = 'ЛКМ · Надеть';
  else if (itemDef.type === 'consumable') foot.textContent = 'ЛКМ · Использовать';
  else foot.textContent = 'Материал';
  tt.appendChild(foot);

  (root ?? document.body).appendChild(tt);
  currentTooltip = tt;
  const r = target.getBoundingClientRect();
  positionTooltip(r.left + r.width / 2, r.top);
}

function positionTooltip(px: number, py: number) {
  if (!currentTooltip) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const rect = currentTooltip.getBoundingClientRect();
  let left = px + 16;
  let top = py + 12;
  if (left + rect.width > vw - 10) left = px - rect.width - 16;
  if (top + rect.height > vh - 10) top = vh - rect.height - 10;
  if (top < 10) top = 10;
  currentTooltip.style.left = left + 'px';
  currentTooltip.style.top = top + 'px';
}

function hideTooltip() {
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

function renderHeader(args: RenderArgs): HTMLElement {
  const { sphere, body, cb } = args;
  const header = el('div', 'ess-header');

  const left = el('div', 'ess-header-left');
  const badge = el('div', 'ess-sphere-badge');
  badge.appendChild(el('span', 'dot'));
  badge.appendChild(el('span', 'name', sphere.characterName || 'Sphere'));
  left.appendChild(badge);
  if (body) {
    const chip = el('div', 'ess-body-chip');
    chip.appendChild(el('span', 'pulse'));
    chip.appendChild(el('span', 'label', 'BODY'));
    chip.appendChild(el('span', 'name', body.definition.nameRu));
    left.appendChild(chip);
  }

  const title = el('div', 'ess-title');
  title.textContent = 'Inventory';
  title.appendChild(el('span', 'sub', 'ESSENCE · CH.I'));

  const right = el('div', 'ess-header-right');
  right.appendChild(buildCurrency(sphere.copper ?? 0));
  const close = el('div', 'ess-close-btn', '×');
  close.addEventListener('click', cb.onClose);
  right.appendChild(close);

  header.appendChild(left);
  header.appendChild(title);
  header.appendChild(right);
  return header;
}

function buildCurrency(copper: number): HTMLElement {
  const gold = Math.floor(copper / 10000);
  const silver = Math.floor((copper % 10000) / 100);
  const cop = copper % 100;
  const wrap = el('div', 'ess-currency');
  const addCoin = (kind: 'gold' | 'silver' | 'copper', val: number) => {
    const c = el('div', `ess-coin ${kind}`);
    const mark = el('span', 'mark');
    mark.appendChild(createSpriteSvg({ file: 'currency.svg', id: `icon_coin_${kind}` }));
    c.appendChild(mark);
    c.appendChild(el('span', 'v', String(val)));
    wrap.appendChild(c);
  };
  if (gold > 0) addCoin('gold', gold);
  if (silver > 0 || gold > 0) addCoin('silver', silver);
  addCoin('copper', cop);
  return wrap;
}

function renderEquipColumn(args: RenderArgs): HTMLElement {
  const { sphere, cb } = args;
  const section = el('section', 'ess-figure-col');

  const head = el('div', 'ess-section-head');
  head.appendChild(el('span', 't', 'Equipment'));
  head.appendChild(el('span', 's', 'Sphere Vessel'));
  section.appendChild(head);

  const stage = el('div', 'ess-figure-stage');
  stage.appendChild(el('div', 'ess-spirit'));

  const layout = el('div', 'ess-equip-layout');
  const silh = el('div', 'ess-silhouette');
  silh.appendChild(buildSphereSvg());
  layout.appendChild(silh);

  const equip = sphere.equipment as Record<string, string | undefined>;
  const activeWpn = sphere.activeWeaponSlot ?? 0;

  for (const slotDef of EQUIP_SLOTS) {
    const wrap = el('div', `ess-equip-slot ${slotDef.cls}`);
    if ((slotDef.id === 'weapon' && activeWpn === 1) ||
        (slotDef.id === 'weapon2' && activeWpn === 0)) {
      wrap.style.opacity = '0.55';
    }
    const itemId = equip[slotDef.id];
    const itemDef = itemId ? ITEMS[itemId] : null;
    const slot = buildSlot(itemDef, undefined, itemDef ? () => cb.onUnequip(slotDef.id) : null);
    wrap.appendChild(slot);
    wrap.appendChild(el('span', 'tag', slotDef.label));
    layout.appendChild(wrap);
  }

  stage.appendChild(layout);
  section.appendChild(stage);

  section.appendChild(renderWeaponStrip(args));
  return section;
}

function renderWeaponStrip(args: RenderArgs): HTMLElement {
  const { sphere, cb } = args;
  const strip = el('div', 'ess-weapon-strip');
  const activeWpn = sphere.activeWeaponSlot ?? 0;

  const makeCard = (slot: 0 | 1, letter: string, itemId: string | undefined) => {
    const def = itemId ? ITEMS[itemId] : null;
    const card = el('div', `ess-weapon-card${activeWpn === slot ? ' active' : ''}`);
    card.addEventListener('click', () => cb.onSwitchWeapon(slot));

    const headDiv = el('div', 'wc-head');
    headDiv.appendChild(el('span', 'wc-slot', `WEAPON ${letter}`));
    if (activeWpn === slot) headDiv.appendChild(el('span', 'wc-tab', 'TAB'));
    card.appendChild(headDiv);

    const nameDiv = el('div', 'wc-name', def ? def.nameRu : '— пусто —');
    if (def) nameDiv.style.color = `var(--r-${def.rarity})`;
    else nameDiv.style.color = 'var(--text-3)';
    card.appendChild(nameDiv);

    if (def) {
      card.appendChild(el('div', 'wc-meta', def.rarity.toUpperCase()));
    }
    return card;
  };

  strip.appendChild(makeCard(0, 'I', sphere.equipment.weapon));
  strip.appendChild(makeCard(1, 'II', sphere.equipment.weapon2));
  return strip;
}

function renderBagColumn(args: RenderArgs): HTMLElement {
  const { sphere, cb } = args;
  const section = el('section', 'ess-bag-col');

  const head = el('div', 'ess-section-head');
  head.appendChild(el('span', 't', 'Bag'));
  head.appendChild(el('span', 's', `${sphere.inventory.length} / 64`));
  section.appendChild(head);

  const inv = sphere.inventory;
  const counts: Record<string, number> = { all: inv.length, equipment: 0, material: 0, consumable: 0 };
  for (const it of inv) {
    const d = ITEMS[it.itemId];
    if (!d) continue;
    if (counts[d.type] !== undefined) counts[d.type] = (counts[d.type] ?? 0) + 1;
  }

  const chips = el('div', 'ess-filter-chips');
  const chipDefs: { id: FilterKind; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'equipment', label: 'Equipment' },
    { id: 'material', label: 'Materials' },
    { id: 'consumable', label: 'Consumables' },
  ];
  for (const c of chipDefs) {
    const btn = el('button', `ess-chip${currentFilter === c.id ? ' active' : ''}`);
    btn.appendChild(document.createTextNode(c.label));
    btn.appendChild(el('span', 'count', String(counts[c.id] ?? 0)));
    btn.addEventListener('click', () => {
      currentFilter = c.id;
      currentPage = 0;
      rerender();
    });
    chips.appendChild(btn);
  }
  section.appendChild(chips);

  const visibleInv: InventoryItem[] = currentFilter === 'all'
    ? inv.slice()
    : inv.filter(it => ITEMS[it.itemId]?.type === currentFilter);

  if (currentPage >= BAG_PAGES) currentPage = BAG_PAGES - 1;
  if (currentPage < 0) currentPage = 0;
  const pageStart = currentPage * BAG_PAGE_SIZE;

  const grid = el('div', 'ess-bag-grid');
  for (let i = 0; i < BAG_PAGE_SIZE; i++) {
    const cell = el('div');
    const item = visibleInv[pageStart + i];
    const itemDef = item ? ITEMS[item.itemId] : null;
    const onClick = item && itemDef ? () => {
      if (itemDef.type === 'equipment' && itemDef.equipSlot) {
        let target: string = itemDef.equipSlot;
        if (target === 'weapon' && sphere.equipment.weapon && !sphere.equipment.weapon2) {
          target = 'weapon2';
        }
        cb.onEquip(item.itemId, target);
      } else if (itemDef.type === 'consumable') {
        cb.onUseConsumable(item.itemId);
      }
    } : null;
    cell.appendChild(buildSlot(itemDef, item?.quantity, onClick));
    grid.appendChild(cell);
  }
  section.appendChild(grid);

  // Page navigation bar
  const pageBar = el('div', 'ess-page-bar');
  const prevBtn = el('button', 'arrow', '◂');
  if (currentPage === 0) prevBtn.setAttribute('disabled', 'true');
  prevBtn.addEventListener('click', () => {
    if (currentPage > 0) { currentPage--; rerender(); }
  });
  pageBar.appendChild(prevBtn);

  const pageNum = el('span', 'page-num', `${currentPage + 1} / ${BAG_PAGES}`);
  pageBar.appendChild(pageNum);

  const dots = el('div', 'dots');
  for (let p = 0; p < BAG_PAGES; p++) {
    const dot = el('button', `d${p === currentPage ? ' active' : ''}`);
    dot.addEventListener('click', () => { currentPage = p; rerender(); });
    dots.appendChild(dot);
  }
  pageBar.appendChild(dots);

  const nextBtn = el('button', 'arrow', '▸');
  if (currentPage >= BAG_PAGES - 1) nextBtn.setAttribute('disabled', 'true');
  nextBtn.addEventListener('click', () => {
    if (currentPage < BAG_PAGES - 1) { currentPage++; rerender(); }
  });
  pageBar.appendChild(nextBtn);
  section.appendChild(pageBar);

  const footer = el('div', 'ess-bag-footer');
  const cap = el('span', 'cap');
  cap.innerHTML = `Slots: <b>${inv.length}</b> / <b>${BAG_CAPACITY}</b>`;
  footer.appendChild(cap);
  section.appendChild(footer);

  return section;
}

function renderStatbar(args: RenderArgs): HTMLElement {
  const { sphere, body } = args;
  const bar = el('footer', 'ess-statbar');

  const bonuses = computeBonuses(sphere);
  const makeCluster = (stats: typeof STAT_ORDER) => {
    const cluster = el('div', 'ess-stat-cluster');
    for (const s of stats) {
      const item = el('div', 'ess-stat-item');
      item.appendChild(el('span', 'lbl', s.short));
      const val = el('span', 'val');
      val.textContent = String((sphere.stats[s.id] ?? 0) + (bonuses[s.id] ?? 0));
      if (bonuses[s.id]) {
        const b = el('span', 'bonus', `+${bonuses[s.id]}`);
        val.appendChild(b);
      }
      item.appendChild(val);
      cluster.appendChild(item);
    }
    return cluster;
  };

  bar.appendChild(makeCluster(STAT_ORDER.slice(0, 5)));

  // Vitals center
  const vitalWrap = el('div');
  vitalWrap.style.display = 'grid';
  vitalWrap.style.gap = '6px';

  const maxHP = 50 + sphere.stats[StatName.Health] * 5;
  const curHP = body ? body.currentHP : maxHP;
  const hpDiv = el('div', 'ess-vital hp');
  const hpHead = el('div', 'head');
  hpHead.appendChild(el('span', '', 'HP'));
  const hpB = el('b'); hpB.textContent = `${Math.floor(curHP)} / ${maxHP}`;
  hpHead.appendChild(hpB);
  hpDiv.appendChild(hpHead);
  const hpBar = el('div', 'bar');
  const hpFill = el('div', 'fill');
  hpFill.style.width = Math.max(0, Math.min(100, (curHP / maxHP) * 100)) + '%';
  hpBar.appendChild(hpFill);
  hpDiv.appendChild(hpBar);
  vitalWrap.appendChild(hpDiv);

  const maxMana = Math.min(50 + sphere.stats[StatName.Mana] * 0.1, 150);
  const curMana = body ? body.currentMana : maxMana;
  const manaDiv = el('div', 'ess-vital mana');
  const manaHead = el('div', 'head');
  manaHead.appendChild(el('span', '', 'Mana'));
  const manaB = el('b'); manaB.textContent = `${Math.floor(curMana)} / ${Math.floor(maxMana)}`;
  manaHead.appendChild(manaB);
  manaDiv.appendChild(manaHead);
  const manaBar = el('div', 'bar');
  const manaFill = el('div', 'fill');
  manaFill.style.width = Math.max(0, Math.min(100, (curMana / maxMana) * 100)) + '%';
  manaBar.appendChild(manaFill);
  manaDiv.appendChild(manaBar);
  vitalWrap.appendChild(manaDiv);

  bar.appendChild(vitalWrap);

  // Right cluster + rank
  const rightWrap = el('div', 'ess-stat-cluster');
  const cluster2 = makeCluster(STAT_ORDER.slice(5));
  while (cluster2.firstChild) rightWrap.appendChild(cluster2.firstChild);
  const rankBadge = el('div', 'ess-rank-badge');
  rankBadge.appendChild(el('span', 'lbl', 'Rank'));
  const rank = calcRank(sphere.stats);
  rankBadge.appendChild(el('span', 'n', rank.toFixed(1)));
  rightWrap.appendChild(rankBadge);
  bar.appendChild(rightWrap);

  return bar;
}

/** Build static shell via DOMWindowBase: backdrop, stage, window with corners. */
function renderShell(onClose: () => void): { win: HTMLElement } {
  handle = openWindowShell('', 'ess-backdrop', onClose, ['i', 'I', 'ш', 'Ш']);
  handle.root.id = 'ess-inv-root';
  root = handle.root;

  const stage = el('div', 'ess-stage');
  const win = el('div', 'ess-window');
  for (const c of ['tl', 'tr', 'bl', 'br']) win.appendChild(el('div', `corner ${c}`));
  stage.appendChild(win);
  handle.stage.appendChild(stage);

  return { win };
}

/** Populate (or repopulate) the window with header / main / statbar. Keeps corners. */
function renderContent(args: RenderArgs, win: HTMLElement): void {
  // Keep ornamental corner divs; remove everything after them.
  const cornerCount = 4;
  while (win.children.length > cornerCount) {
    win.removeChild(win.lastChild!);
  }
  win.appendChild(renderHeader(args));
  const main = el('div', 'ess-main');
  main.appendChild(renderEquipColumn(args));
  main.appendChild(renderBagColumn(args));
  win.appendChild(main);
  win.appendChild(renderStatbar(args));
}

let cachedWin: HTMLElement | null = null;

function rerender() {
  if (!currentArgs || !cachedWin) return;
  hideTooltip();
  renderContent(currentArgs, cachedWin);
}

/** Public API: show inventory overlay. Returns cleanup fn. */
export function showInventoryDom(args: RenderArgs): () => void {
  currentArgs = args;
  currentFilter = 'all';
  currentPage = 0;
  const { win } = renderShell(args.cb.onClose);
  cachedWin = win;
  renderContent(args, win);

  return () => hideInventoryDom();
}

/** Re-render with updated data (call after equip/use to refresh UI). */
export function refreshInventoryDom(args: RenderArgs): void {
  currentArgs = args;
  rerender();
}

export function hideInventoryDom(): void {
  hideTooltip();
  if (handle) { handle.destroy(); handle = null; }
  root = null;
  cachedWin = null;
  currentArgs = null;
}

export function isInventoryDomOpen(): boolean {
  return root !== null;
}
