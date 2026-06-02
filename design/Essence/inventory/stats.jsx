// stats.jsx — bottom bar with 10 stats + vitals + rank
// ---------------------------------------------------------------

function computeStats(equipment) {
  const total = { ...BASE_STATS };
  const bonus = {};
  for (const slotId of Object.keys(equipment)) {
    const itemId = equipment[slotId];
    if (!itemId) continue;
    const item = ITEMS[itemId];
    if (!item?.stats) continue;
    for (const k of Object.keys(item.stats)) {
      const v = item.stats[k];
      total[k] = (total[k] || 0) + v;
      bonus[k] = (bonus[k] || 0) + v;
    }
  }
  return { total, bonus };
}

function StatBar({ lang, equipment, sphere }) {
  const { total, bonus } = useMemo(() => computeStats(equipment), [equipment]);

  // Split into two clusters of 5 for rhythm
  const leftStats = STATS.slice(0, 5);
  const rightStats = STATS.slice(5);

  return (
    <footer className="statbar">
      <div className="stat-cluster">
        <span className="stat-group-title">Corpus</span>
        {leftStats.map(s => (
          <div className="stat-item" key={s.id}>
            <span className="lbl">{s.label[lang]}</span>
            <span className="val">
              {total[s.id]}
              {bonus[s.id] ? <span className="bonus">+{bonus[s.id]}</span> : null}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        <div className="vital hp">
          <div className="head">
            <span>{t('hp', lang)}</span>
            <b>{sphere.hp.cur} / {sphere.hp.max}</b>
          </div>
          <div className="bar"><div className="fill" style={{ width: (sphere.hp.cur / sphere.hp.max * 100) + '%' }} /></div>
        </div>
        <div className="vital mana">
          <div className="head">
            <span>{t('mana', lang)}</span>
            <b>{sphere.mana.cur} / {sphere.mana.max}</b>
          </div>
          <div className="bar"><div className="fill" style={{ width: (sphere.mana.cur / sphere.mana.max * 100) + '%' }} /></div>
        </div>
      </div>

      <div className="stat-cluster">
        {rightStats.map(s => (
          <div className="stat-item" key={s.id}>
            <span className="lbl">{s.label[lang]}</span>
            <span className="val">
              {total[s.id]}
              {bonus[s.id] ? <span className="bonus">+{bonus[s.id]}</span> : null}
            </span>
          </div>
        ))}
        <span className="stat-group-title">Anima</span>

        <div className="rank-badge">
          <span className="lbl">{t('rank', lang)}</span>
          <span className="n">{sphere.rank.toFixed(1)}</span>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { StatBar, computeStats });
