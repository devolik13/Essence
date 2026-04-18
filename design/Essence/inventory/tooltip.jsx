// tooltip.jsx — item tooltip + compare pair + context menu
// ---------------------------------------------------------------

function Tooltip({ item, lang, compareItem, pos }) {
  if (!item) return null;
  const vp = { w: window.innerWidth, h: window.innerHeight };
  const width = 280;
  const compareW = compareItem ? width + 16 : 0;
  let left = pos.x + 16;
  let top = pos.y + 12;
  if (left + width + compareW > vp.w - 10) left = pos.x - width - 16;
  if (top + 280 > vp.h - 10) top = vp.h - 290;

  return (
    <div className="tooltip-layer" style={{ left, top }}>
      <ItemCard item={item} lang={lang} compareAgainst={null} />
      {compareItem && (
        <div style={{ position: 'absolute', left: width + 16, top: 0 }}>
          <ItemCard item={compareItem} lang={lang} isEquipped />
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, lang, isEquipped }) {
  const rarityLabel = T['rarity_' + item.rarity]?.[lang] || item.rarity;
  const typeLabel   = T['type_' + item.type]?.[lang]     || item.type;
  const slotLabel   = item.equipSlot ? (T['slot_name_' + item.equipSlot]?.[lang]) : null;

  const entries = [];
  if (item.baseDmg)     entries.push([lang === 'ru' ? 'Урон' : 'Damage',   item.baseDmg]);
  if (item.cooldown)    entries.push([lang === 'ru' ? 'Кулдаун' : 'Cooldown', item.cooldown + 's']);
  if (item.armorBonus)  entries.push([lang === 'ru' ? 'Броня' : 'Armor',  '+' + item.armorBonus]);
  if (item.hpRestore)   entries.push(['HP',                              '+' + item.hpRestore]);
  if (item.manaRestore) entries.push([lang === 'ru' ? 'Мана' : 'Mana',   '+' + item.manaRestore]);
  if (item.stats) {
    for (const k of Object.keys(item.stats)) {
      const stat = STATS.find(s => s.id === k);
      entries.push([stat ? stat.label[lang] : k, '+' + item.stats[k]]);
    }
  }

  return (
    <div className={`tooltip ${isEquipped ? 'compare' : ''}`} data-rarity={item.rarity}>
      <div className="tt-head">
        <span className="tt-name">{item.name[lang]}</span>
        <span className="tt-rarity">{rarityLabel}</span>
      </div>
      <div className="tt-type">
        {typeLabel}{slotLabel ? ' · ' + slotLabel : ''}
      </div>
      {entries.length > 0 && (
        <div className="tt-stats">
          {entries.map(([k, v], i) => (
            <div className="tt-stat" key={i}>
              <span className="k">{k}</span>
              <span className="v">{v}</span>
            </div>
          ))}
        </div>
      )}
      <div className="tt-desc">
        {item.legendary && <span className="legend-tag">{T.rarity_legendary[lang]}</span>}
        {item.desc?.[lang]}
      </div>
      <div className="tt-foot">
        <span>{T.rmb_hint[lang]}</span>
        <span className="hint-key">{T.drag_hint[lang]}</span>
      </div>
    </div>
  );
}

// Context menu
function ContextMenu({ ctx, lang, onAction, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('contextmenu', onDoc);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('contextmenu', onDoc);
    };
  }, [onClose]);

  if (!ctx) return null;
  const { x, y, zone, itemId } = ctx;
  const item = ITEMS[itemId];
  if (!item) return null;

  const actions = [];
  if (zone === 'bag') {
    if (item.type === 'equipment')  actions.push({ id: 'equip',   label: t('equip',   lang), kb: '2×LMB' });
    if (item.type === 'consumable') actions.push({ id: 'use',     label: t('use',     lang), kb: '2×LMB' });
    actions.push({ id: 'inspect', label: t('inspect', lang) });
    if (item.type !== 'quest') {
      actions.push({ id: 'sep' });
      if (item.type === 'equipment' || item.type === 'material') {
        actions.push({ id: 'salvage', label: t('salvage', lang) });
      }
      actions.push({ id: 'drop', label: t('drop', lang), danger: true, kb: 'Del' });
    }
  } else if (zone === 'equip') {
    actions.push({ id: 'unequip', label: t('unequip', lang) });
    actions.push({ id: 'inspect', label: t('inspect', lang) });
  }

  const vp = { w: window.innerWidth, h: window.innerHeight };
  const menuW = 200, menuH = actions.length * 32 + 10;
  const left = Math.min(x, vp.w - menuW - 10);
  const top = Math.min(y, vp.h - menuH - 10);

  return (
    <div ref={ref} className="context-menu" style={{ left, top }}>
      {actions.map((a, i) => a.id === 'sep'
        ? <div key={i} className="sep" />
        : <button
            key={a.id}
            className={a.danger ? 'danger' : ''}
            onClick={() => { onAction(a.id); onClose(); }}
          >
            <span>{a.label}</span>
            {a.kb && <span className="kb">{a.kb}</span>}
          </button>
      )}
    </div>
  );
}

Object.assign(window, { Tooltip, ItemCard, ContextMenu });
