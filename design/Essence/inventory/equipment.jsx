// equipment.jsx — left column: figure + slots around it
// ---------------------------------------------------------------

function EquipmentColumn({
  lang, equipment, activeWeapon, onWeaponSwitch,
  hoverHandlers, dragHandlers, onSlotContext, sphere,
}) {
  const w1 = equipment.weapon  ? ITEMS[equipment.weapon]  : null;
  const w2 = equipment.weapon2 ? ITEMS[equipment.weapon2] : null;

  return (
    <section className="figure-col">
      <div className="section-head">
        <span className="t">{t('equipment', lang)}</span>
        <span className="s">{sphere ? sphere.body[lang] : t('equipment_sub', lang)}</span>
      </div>

      <div className="figure-stage">
        <div className="spirit" />

        <div className="equip-layout">
          <div className="silhouette">
            <Silhouette />
          </div>

          {EQUIP_SLOTS.map(slotDef => {
            const itemId = equipment[slotDef.id];
            const dimmed =
              (slotDef.id === 'weapon'  && activeWeapon === 2) ||
              (slotDef.id === 'weapon2' && activeWeapon === 1);
            return (
              <div
                key={slotDef.id}
                className={`equip-slot ${slotDef.className}`}
                style={dimmed ? { opacity: 0.55 } : {}}
              >
                <Slot
                  itemId={itemId}
                  lang={lang}
                  {...hoverHandlers('equip', slotDef.id, itemId)}
                  {...dragHandlers('equip', slotDef.id, itemId)}
                  onContextMenu={e => onSlotContext(e, 'equip', slotDef.id, itemId)}
                />
                <span className="tag">{slotDef.label[lang]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active weapon strip + Tab switcher */}
      <div className="weapon-strip">
        {[
          { w: w1, n: 'I',  idx: 1 },
          { w: w2, n: 'II', idx: 2 },
        ].map(({ w, n, idx }) => (
          <div
            key={n}
            className={`weapon-card ${activeWeapon === idx ? 'active' : ''}`}
            onClick={() => onWeaponSwitch(idx)}
          >
            <div className="wc-head">
              <span className="wc-slot">{T.slot_name_weapon[lang]} {n}</span>
              {activeWeapon === idx && <span className="wc-tab">TAB</span>}
            </div>
            <div className="wc-name" style={{ color: w ? `var(--r-${w.rarity})` : 'var(--text-3)' }}>
              {w ? w.name[lang] : (lang === 'ru' ? '— пусто —' : '— empty —')}
            </div>
            {w && (
              <div className="wc-meta">
                {w.baseDmg ? `${w.baseDmg} dmg · ${w.cooldown}s` : '—'}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { EquipmentColumn });
