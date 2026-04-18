// tweaks.jsx — tweaks panel + language toggle + edit-mode wiring
// ---------------------------------------------------------------

function TweaksPanel({ tweaks, setTweak, lang, onClose }) {
  return (
    <div className="tweaks-panel">
      <h4>{t('tweaks', lang)}</h4>

      <div className="tweaks-row">
        <span className="lbl">{t('density', lang)}</span>
        <div className="opts">
          <button
            className={tweaks.density === 'compact' ? 'active' : ''}
            onClick={() => setTweak('density', 'compact')}
          >{t('compact', lang)}</button>
          <button
            className={tweaks.density === 'comfortable' ? 'active' : ''}
            onClick={() => setTweak('density', 'comfortable')}
          >{t('comfortable', lang)}</button>
        </div>
      </div>

      <div className="tweaks-row">
        <span className="lbl">{t('accent', lang)}</span>
        <div className="opts">
          <button
            className={tweaks.accent === 'brass' ? 'active' : ''}
            onClick={() => setTweak('accent', 'brass')}
          >{t('brass', lang)}</button>
          <button
            className={tweaks.accent === 'copper' ? 'active' : ''}
            onClick={() => setTweak('accent', 'copper')}
          >{t('copper', lang)}</button>
          <button
            className={tweaks.accent === 'steel' ? 'active' : ''}
            onClick={() => setTweak('accent', 'steel')}
          >{t('steel', lang)}</button>
        </div>
      </div>

      <div className="tweaks-row">
        <div
          className={`swap ${tweaks.etherealBackdrop ? 'on' : ''}`}
          onClick={() => setTweak('etherealBackdrop', !tweaks.etherealBackdrop)}
        >
          <span>{t('ethereal', lang)}</span>
          <span className="track"><span className="thumb" /></span>
        </div>
        <div
          className={`swap ${tweaks.rarityGlow ? 'on' : ''}`}
          onClick={() => setTweak('rarityGlow', !tweaks.rarityGlow)}
          style={{ marginTop: 4 }}
        >
          <span>{t('rarity_glow', lang)}</span>
          <span className="track"><span className="thumb" /></span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TweaksPanel });
