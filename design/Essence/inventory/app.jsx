// app.jsx — root component, state, DnD, hotkeys, render
// ---------------------------------------------------------------

function App() {
  // ─── Tweaks state (synced to window.TWEAKS and disk)
  const [tweaks, setTweaks] = useState(() => ({ ...window.TWEAKS }));
  const setTweak = useCallback((k, v) => {
    setTweaks(prev => {
      const next = { ...prev, [k]: v };
      try {
        window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
      } catch (e) {}
      return next;
    });
  }, []);
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [editModeActive, setEditModeActive] = useState(false);

  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === '__activate_edit_mode')   { setEditModeActive(true); setTweaksOpen(true); }
      if (d.type === '__deactivate_edit_mode') { setEditModeActive(false); setTweaksOpen(false); }
    };
    window.addEventListener('message', onMsg);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // ─── Core state
  const [state, setState] = useState(INITIAL_STATE);
  const { sphere, equipment, activeWeapon, currency, bag } = state;
  const lang = tweaks.language === 'en' ? 'en' : 'ru';

  // ─── Hover tooltip + compare
  const [hover, setHover] = useState(null); // { itemId, pos, compareItemId }
  const hoverHandlers = useCallback((zone, slotKey, itemId) => ({
    onMouseEnter: (e) => {
      if (!itemId) return;
      const item = ITEMS[itemId];
      let compareItemId = null;
      if (zone === 'bag' && item?.equipSlot) {
        compareItemId = equipment[item.equipSlot] || null;
        if (compareItemId === itemId) compareItemId = null;
      }
      setHover({ itemId, pos: { x: e.clientX, y: e.clientY }, compareItemId });
    },
    onMouseMove: (e) => {
      setHover(h => h ? { ...h, pos: { x: e.clientX, y: e.clientY } } : null);
    },
    onMouseLeave: () => setHover(null),
  }), [equipment]);

  // ─── Context menu
  const [ctxMenu, setCtxMenu] = useState(null); // { x, y, zone, slotKey, itemId }
  const onSlotContext = useCallback((e, zone, slotKey, itemId) => {
    e.preventDefault();
    if (!itemId) return;
    setCtxMenu({ x: e.clientX, y: e.clientY, zone, slotKey, itemId });
    setHover(null);
  }, []);

  const onContextAction = useCallback((action) => {
    if (!ctxMenu) return;
    const { zone, slotKey, itemId } = ctxMenu;
    const item = ITEMS[itemId];
    if (!item) return;
    setState(prev => {
      const next = structuredClone(prev);
      if (action === 'equip' && zone === 'bag' && item.equipSlot) {
        // Swap: equip → bag slot receives previously-equipped item
        const prevItemId = next.equipment[item.equipSlot];
        next.equipment[item.equipSlot] = itemId;
        // Remove from bag
        const bagEntry = next.bag.items.find(x => x.slot === slotKey);
        if (bagEntry) {
          if (prevItemId) { bagEntry.itemId = prevItemId; bagEntry.qty = 1; }
          else { next.bag.items = next.bag.items.filter(x => x.slot !== slotKey); }
        }
      }
      if (action === 'unequip' && zone === 'equip') {
        next.equipment[slotKey] = null;
        // Find first empty unlocked slot in bag
        const used = new Set(next.bag.items.map(x => x.slot));
        for (let i = 0; i < next.bag.unlocked; i++) {
          if (!used.has(i)) { next.bag.items.push({ slot: i, itemId, qty: 1 }); break; }
        }
      }
      if (action === 'drop' && zone === 'bag') {
        next.bag.items = next.bag.items.filter(x => x.slot !== slotKey);
      }
      if (action === 'salvage' && zone === 'bag') {
        next.bag.items = next.bag.items.filter(x => x.slot !== slotKey);
        // Pretend this yields some copper
        next.currency.copper += 15;
      }
      if (action === 'use' && zone === 'bag') {
        const entry = next.bag.items.find(x => x.slot === slotKey);
        if (entry) {
          if (item.hpRestore) next.sphere.hp.cur = Math.min(next.sphere.hp.max, next.sphere.hp.cur + item.hpRestore);
          if (item.manaRestore) next.sphere.mana.cur = Math.min(next.sphere.mana.max, next.sphere.mana.cur + item.manaRestore);
          entry.qty -= 1;
          if (entry.qty <= 0) next.bag.items = next.bag.items.filter(x => x !== entry);
        }
      }
      return next;
    });
  }, [ctxMenu]);

  // ─── Drag and drop
  const dragRef = useRef(null); // { zone, slotKey, itemId }
  const [dragOverKey, setDragOverKey] = useState(null);
  const dragHandlers = useCallback((zone, slotKey, itemId) => ({
    onDragStart: (e) => {
      if (!itemId) { e.preventDefault(); return; }
      dragRef.current = { zone, slotKey, itemId };
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', itemId); } catch (_) {}
      setHover(null);
    },
    onDragEnd: () => { dragRef.current = null; setDragOverKey(null); },
    onDragOver: (e) => {
      if (!dragRef.current) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverKey(zone + ':' + slotKey);
    },
    onDrop: (e) => {
      e.preventDefault();
      const src = dragRef.current;
      dragRef.current = null;
      setDragOverKey(null);
      if (!src) return;
      if (src.zone === zone && src.slotKey === slotKey) return;
      setState(prev => {
        const next = structuredClone(prev);
        const srcItem = ITEMS[src.itemId];
        const dstItemId = (zone === 'equip') ? next.equipment[slotKey]
                                             : (next.bag.items.find(x => x.slot === slotKey)?.itemId || null);

        // bag → bag: swap
        if (src.zone === 'bag' && zone === 'bag') {
          const srcEntry = next.bag.items.find(x => x.slot === src.slotKey);
          const dstEntry = next.bag.items.find(x => x.slot === slotKey);
          if (dstEntry) { [srcEntry.slot, dstEntry.slot] = [dstEntry.slot, srcEntry.slot]; }
          else if (srcEntry) { srcEntry.slot = slotKey; }
        }
        // bag → equip: only if compatible slot
        if (src.zone === 'bag' && zone === 'equip') {
          if (!srcItem?.equipSlot) return prev;
          // Special: weapon items can go to weapon or weapon2
          const compat =
            slotKey === srcItem.equipSlot ||
            (srcItem.equipSlot === 'weapon' && (slotKey === 'weapon' || slotKey === 'weapon2'));
          if (!compat) return prev;
          const srcEntry = next.bag.items.find(x => x.slot === src.slotKey);
          next.equipment[slotKey] = src.itemId;
          if (srcEntry) {
            if (dstItemId) { srcEntry.itemId = dstItemId; srcEntry.qty = 1; }
            else { next.bag.items = next.bag.items.filter(x => x !== srcEntry); }
          }
        }
        // equip → bag
        if (src.zone === 'equip' && zone === 'bag') {
          next.equipment[src.slotKey] = dstItemId || null;
          const dstEntry = next.bag.items.find(x => x.slot === slotKey);
          if (dstEntry) { dstEntry.itemId = src.itemId; dstEntry.qty = 1; }
          else          { next.bag.items.push({ slot: slotKey, itemId: src.itemId, qty: 1 }); }
        }
        // equip → equip (swap between weapon & weapon2)
        if (src.zone === 'equip' && zone === 'equip') {
          const a = next.equipment[src.slotKey];
          const b = next.equipment[slotKey];
          const aItem = ITEMS[a];
          const bItem = ITEMS[b];
          // Allow only if both slots accept both items or are same
          const compat = src.slotKey === slotKey
            || (aItem?.equipSlot === 'weapon' && (slotKey === 'weapon' || slotKey === 'weapon2'));
          if (!compat) return prev;
          next.equipment[src.slotKey] = b || null;
          next.equipment[slotKey] = a || null;
        }
        return next;
      });
    },
  }), []);

  // ─── Weapon switch
  const onWeaponSwitch = useCallback((n) => {
    setState(prev => ({ ...prev, activeWeapon: n }));
  }, []);

  // ─── Expand bag (buy unlock)
  const onExpand = useCallback(() => {
    setState(prev => {
      if (prev.bag.unlocked >= prev.bag.capacity) return prev;
      if (prev.currency.gold < 1) return prev;
      return {
        ...prev,
        bag: { ...prev.bag, unlocked: Math.min(prev.bag.capacity, prev.bag.unlocked + 16) },
        currency: { ...prev.currency, gold: prev.currency.gold - 1 },
      };
    });
  }, []);

  // ─── Filter / search / sort
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rarity');

  // ─── Hotkeys: Tab swaps weapon, Esc closes menus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Tab' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setState(prev => ({ ...prev, activeWeapon: prev.activeWeapon === 1 ? 2 : 1 }));
      }
      if (e.key === 'Escape') { setCtxMenu(null); setHover(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ─── Overlay data with dragOverKey
  const applyDragOver = useCallback((handlers, zone, slotKey) => ({
    ...handlers,
    dragOver: dragOverKey === (zone + ':' + slotKey),
  }), [dragOverKey]);

  // We wrap dragHandlers to also emit dragOver on Slot prop
  const wrappedDragHandlers = useCallback((zone, slotKey, itemId) => {
    const dh = dragHandlers(zone, slotKey, itemId);
    return dh; // dragOver passed separately via Slot prop if needed; left simple here
  }, [dragHandlers]);

  const hoverItem = hover ? ITEMS[hover.itemId] : null;
  const compareItem = hover?.compareItemId ? ITEMS[hover.compareItemId] : null;

  // ─── Auto-scale stage to viewport
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const BASE_W = 1280, BASE_H = 780, PAD = 24;
    const recalc = () => {
      const sx = (window.innerWidth  - PAD) / BASE_W;
      const sy = (window.innerHeight - PAD) / BASE_H;
      setScale(Math.min(1, sx, sy));
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  return (
    <div
      className="app"
      data-density={tweaks.density}
      data-accent={tweaks.accent}
      data-ethereal={String(tweaks.etherealBackdrop)}
      data-rarity-glow={String(tweaks.rarityGlow)}
    >
      <div className="stage">
      <div className="window" style={{ transform: `scale(${scale})` }}>
        <span className="corner tl" /><span className="corner tr" />
        <span className="corner bl" /><span className="corner br" />

        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="sphere-badge">
              <span className="dot" />
              <span>
                <span className="name">{sphere.name[lang]}</span>
              </span>
            </div>
            <div className="body-chip">
              <span className="pulse" />
              <span className="label">{t('body', lang)} · {t('active', lang)}</span>
              <span style={{ color: 'var(--brass-3)' }}>{sphere.body[lang]}</span>
            </div>
          </div>

          <div className="title">
            {t('title_main', lang)}
            <span className="sub">{t('title_sub', lang)}</span>
          </div>

          <div className="header-right">
            <div className="currency">
              <Coin kind="gold" value={currency.gold} />
              <Coin kind="silver" value={currency.silver} />
              <Coin kind="copper" value={currency.copper} />
            </div>
            <div className="lang-toggle">
              <button className={lang === 'ru' ? 'active' : ''} onClick={() => setTweak('language', 'ru')}>RU</button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setTweak('language', 'en')}>EN</button>
            </div>
            <button className="icon-btn" title="Close">×</button>
          </div>
        </header>

        {/* Main */}
        <main className="main">
          <EquipmentColumn
            lang={lang}
            equipment={equipment}
            activeWeapon={activeWeapon}
            onWeaponSwitch={onWeaponSwitch}
            hoverHandlers={hoverHandlers}
            dragHandlers={wrappedDragHandlers}
            onSlotContext={onSlotContext}
            sphere={sphere}
          />

          <BagColumn
            lang={lang}
            bag={bag}
            search={search} setSearch={setSearch}
            filter={filter} setFilter={setFilter}
            sortBy={sortBy} setSortBy={setSortBy}
            hoverHandlers={hoverHandlers}
            dragHandlers={wrappedDragHandlers}
            onSlotContext={onSlotContext}
            onExpand={onExpand}
          />
        </main>

        {/* Stats footer */}
        <StatBar lang={lang} equipment={equipment} sphere={sphere} />
      </div>
      </div>

      {/* Overlays */}
      {hoverItem && !ctxMenu && (
        <Tooltip item={hoverItem} compareItem={compareItem} lang={lang} pos={hover.pos} />
      )}

      {ctxMenu && (
        <ContextMenu
          ctx={ctxMenu}
          lang={lang}
          onAction={onContextAction}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Tweaks */}
      {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweak={setTweak} lang={lang} onClose={() => setTweaksOpen(false)} />}
      {!editModeActive && (
        <button className="tweaks-toggle" onClick={() => setTweaksOpen(o => !o)}>
          ⚙ {t('tweaks', lang)}
        </button>
      )}
    </div>
  );
}

// ─── Middle column — vessel chronicle
function ChroniclePanel({ lang, sphere, equipment }) {
  const weapon1 = equipment.weapon ? ITEMS[equipment.weapon] : null;
  const weapon2 = equipment.weapon2 ? ITEMS[equipment.weapon2] : null;

  return (
    <section style={{ padding: '20px 24px', display: 'grid', gridTemplateRows: 'auto 1fr auto', minHeight: 0 }}>
      <div className="section-head">
        <span className="t">{lang === 'ru' ? 'Сосуд' : 'Vessel'}</span>
        <span className="s">{lang === 'ru' ? 'Паспорт тела' : 'Body dossier'}</span>
      </div>

      <div style={{ position: 'relative', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
        {/* Decorative engraved circle */}
        <svg width="280" height="280" viewBox="0 0 280 280" style={{ position: 'absolute' }}>
          <defs>
            <radialGradient id="chronicleBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#5a8fc4" stopOpacity="0.12" />
              <stop offset="70%" stopColor="#1a2840" stopOpacity="0.02" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="140" cy="140" r="135" fill="url(#chronicleBg)" />
          <circle cx="140" cy="140" r="130" fill="none" stroke="#8a6a2f" strokeWidth="1" opacity="0.5" />
          <circle cx="140" cy="140" r="120" fill="none" stroke="#8a6a2f" strokeWidth="0.5" opacity="0.35" strokeDasharray="2 3" />
          <circle cx="140" cy="140" r="88"  fill="none" stroke="#d9b46a" strokeWidth="0.5" opacity="0.4" />
          {/* Cardinal ornaments */}
          {[0, 90, 180, 270].map(a => (
            <g key={a} transform={`rotate(${a} 140 140)`}>
              <path d="M140 10 L136 22 L140 26 L144 22 Z" fill="#d9b46a" opacity="0.55" />
            </g>
          ))}
          {/* Zodiacal ticks */}
          {Array.from({ length: 48 }).map((_, i) => (
            <line
              key={i}
              x1="140" y1="15"
              x2="140" y2={i % 4 === 0 ? 22 : 19}
              stroke="#8a6a2f" strokeWidth="0.6" opacity="0.5"
              transform={`rotate(${i * 360 / 48} 140 140)`}
            />
          ))}
        </svg>

        {/* Central seal */}
        <div style={{
          position: 'relative',
          width: 180, height: 180,
          display: 'grid', placeItems: 'center',
          textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle, rgba(138,184,224,0.12) 0%, transparent 70%)',
            filter: 'blur(4px)',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{
              fontFamily: 'var(--font-mech)',
              fontSize: 9, letterSpacing: '0.4em',
              color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4,
            }}>{T.body[lang]}</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22, fontWeight: 600,
              color: 'var(--paper-0)', letterSpacing: '0.08em',
              textShadow: '0 0 14px rgba(138,184,224,0.25)',
            }}>{sphere.body[lang]}</div>
            <div style={{
              marginTop: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-2)',
            }}>
              {sphere.hp.cur}/{sphere.hp.max} HP · {sphere.mana.cur}/{sphere.mana.max} MP
            </div>
            <div style={{
              marginTop: 14,
              padding: '6px 12px',
              border: '1px solid var(--brass-0)',
              display: 'inline-block',
              fontFamily: 'var(--font-mech)',
              fontSize: 9, letterSpacing: '0.25em',
              color: 'var(--brass-3)', textTransform: 'uppercase',
            }}>{lang === 'ru' ? 'Сфера вселена' : 'Sphere inhabits'}</div>
          </div>
        </div>
      </div>

      {/* Active weapon strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        padding: 10,
        border: '1px solid var(--ink-4)',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.1))',
      }}>
        {[{ w: weapon1, n: 'I', id: 'weapon' }, { w: weapon2, n: 'II', id: 'weapon2' }].map(({ w, n, id }) => (
          <div key={id} style={{ display: 'grid', gap: 2 }}>
            <div style={{
              fontFamily: 'var(--font-mech)', fontSize: 8, letterSpacing: '0.3em',
              color: 'var(--text-3)', textTransform: 'uppercase',
            }}>
              {T.slot_name_weapon[lang]} {n}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600,
              color: w ? `var(--r-${w.rarity})` : 'var(--text-3)',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
            }}>
              {w ? w.name[lang] : (lang === 'ru' ? '— пусто —' : '— empty —')}
            </div>
            {w && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)' }}>
                {w.baseDmg ? `${w.baseDmg} dmg · ${w.cooldown}s` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
