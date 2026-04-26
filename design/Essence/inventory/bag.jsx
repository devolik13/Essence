// bag.jsx — right column: search, filters, paged 4×4 grid
// ---------------------------------------------------------------

const BAG_PAGE_SIZE = 16;   // 4×4

function BagColumn({
  lang, bag, search, setSearch, filter, setFilter, sortBy, setSortBy,
  hoverHandlers, dragHandlers, onSlotContext, onExpand,
}) {
  const totalPages = Math.ceil(bag.capacity / BAG_PAGE_SIZE);   // 4
  const unlockedPages = Math.ceil(bag.unlocked / BAG_PAGE_SIZE);

  const [page, setPage] = useState(0);
  // Keep page in range if capacity shrinks
  useEffect(() => {
    if (page >= totalPages) setPage(totalPages - 1);
  }, [totalPages, page]);

  // Full cell map across all pages
  const cells = useMemo(() => {
    const arr = new Array(bag.capacity).fill(null);
    for (const it of bag.items) arr[it.slot] = it;
    return arr;
  }, [bag.items, bag.capacity]);

  const activeFilter = FILTERS.find(f => f.id === filter);
  const q = search.trim().toLowerCase();
  const match = (cell) => {
    if (!cell) return false;
    const it = ITEMS[cell.itemId];
    if (!it) return false;
    if (activeFilter && !activeFilter.test(it)) return false;
    if (q) {
      const n = (it.name[lang] || '').toLowerCase();
      if (!n.includes(q)) return false;
    }
    return true;
  };

  // View for current page, with sort + filter applied within page
  const displayed = useMemo(() => {
    const startIdx = page * BAG_PAGE_SIZE;
    const pageCells = cells.slice(startIdx, startIdx + BAG_PAGE_SIZE);
    const baseIndexed = pageCells.map((cell, i) => ({ idx: startIdx + i, cell }));

    // If any filter or sort is active, reorder visible items to the front of this page
    if (search || filter !== 'all' || sortBy !== 'none') {
      const visibleCells = baseIndexed.filter(x => match(x.cell)).map(x => x.cell);
      const sortedCells = sortItems(visibleCells, sortBy, lang);
      const restCells = baseIndexed.filter(x => !match(x.cell)).map(x => x.cell);
      const filled = [...sortedCells, ...restCells];
      while (filled.length < BAG_PAGE_SIZE) filled.push(null);
      return filled.map((cell, i) => ({
        idx: startIdx + i,
        cell,
        matched: i < sortedCells.length,
      }));
    }
    return baseIndexed.map(x => ({ ...x, matched: match(x.cell) }));
  }, [cells, page, filter, search, sortBy, lang]);

  // Counts (across whole bag, not just page)
  const counts = useMemo(() => {
    const result = {};
    for (const f of FILTERS) {
      result[f.id] = cells.reduce((acc, c) => {
        if (!c) return acc;
        const it = ITEMS[c.itemId];
        return it && f.test(it) ? acc + 1 : acc;
      }, 0);
    }
    return result;
  }, [cells]);

  // Per-page item count (for footer)
  const pageOccupancy = useMemo(() => {
    const start = page * BAG_PAGE_SIZE;
    return cells.slice(start, start + BAG_PAGE_SIZE).filter(c => !!c).length;
  }, [cells, page]);

  const totalItems = bag.items.length;
  const [sortOpen, setSortOpen] = useState(false);

  const isPageUnlocked = (p) => p < unlockedPages;

  return (
    <section className="bag-col">
      <div className="section-head">
        <span className="t">{t('bag', lang)}</span>
        <span className="s">{t('bag_sub', lang)}</span>
      </div>

      <div className="bag-tools">
        <div className="search">
          <span className="glass">⌕</span>
          <input
            placeholder={t('search_ph', lang)}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="select" onClick={() => setSortOpen(s => !s)} style={{ position: 'relative' }}>
          <span>{t('sort_by', lang)}</span>
          <span style={{ color: 'var(--brass-3)' }}>
            {SORTS.find(s => s.id === sortBy)?.label[lang] || ''}
          </span>
          <span className="chev">▼</span>
          {sortOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4,
              background: 'var(--ink-2)', border: '1px solid var(--brass-1)',
              zIndex: 10, minWidth: 120,
            }}>
              {SORTS.map(s => (
                <div
                  key={s.id}
                  style={{
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mech)', fontSize: 10,
                    letterSpacing: '0.15em', color: 'var(--text-1)',
                    cursor: 'pointer', textTransform: 'uppercase',
                    background: s.id === sortBy ? 'var(--brass-1)' : 'transparent',
                  }}
                  onClick={(e) => { e.stopPropagation(); setSortBy(s.id); setSortOpen(false); }}
                >{s.label[lang]}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="filter-chips">
        {FILTERS.map(f => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label[lang]}
            <span className="count">{counts[f.id]}</span>
          </button>
        ))}
      </div>

      <div className="bag-grid" onDragOver={e => e.preventDefault()}>
        {displayed.map(({ idx, cell, matched }) => {
          const dim = (search || filter !== 'all') && cell && !matched ? 0.3 : 1;
          return (
            <div key={idx} style={{ opacity: dim }}>
              <Slot
                itemId={cell?.itemId}
                qty={cell?.qty}
                locked={false}
                lang={lang}
                {...hoverHandlers('bag', idx, cell?.itemId)}
                {...dragHandlers('bag', idx, cell?.itemId)}
                onContextMenu={e => onSlotContext(e, 'bag', idx, cell?.itemId)}
              />
            </div>
          );
        })}
      </div>

      {/* Page bar */}
      <div className="page-bar">
        <button
          className="arrow"
          disabled={page === 0}
          onClick={() => setPage(p => Math.max(0, p - 1))}
          aria-label="prev page"
        >◂</button>
        <span className="page-num">
          {page + 1}/{totalPages}
        </span>
        <div className="dots" role="tablist">
          {Array.from({ length: totalPages }).map((_, i) => {
            const unlocked = isPageUnlocked(i);
            return (
              <button
                key={i}
                className={`d ${page === i ? 'active' : ''} ${!unlocked ? 'locked' : ''}`}
                disabled={!unlocked}
                onClick={() => unlocked && setPage(i)}
                title={unlocked
                  ? `${lang === 'ru' ? 'Страница' : 'Page'} ${i + 1}`
                  : (lang === 'ru' ? 'Заблокировано — купите расширение' : 'Locked — expand to unlock')}
              />
            );
          })}
        </div>
        <button
          className="arrow"
          disabled={page >= unlockedPages - 1}
          onClick={() => setPage(p => Math.min(unlockedPages - 1, p + 1))}
          aria-label="next page"
        >▸</button>
      </div>

      <div className="bag-footer">
        <span className="cap">
          {t('slots', lang)}: <b>{totalItems}</b> / <b>{bag.unlocked}</b>
          <span style={{ opacity: 0.6 }}> ({bag.capacity})</span>
          <span style={{ marginLeft: 10, opacity: 0.6, fontSize: 9 }}>
            · {lang === 'ru' ? 'стр.' : 'pg'} {pageOccupancy}/{BAG_PAGE_SIZE}
          </span>
        </span>
        <button
          className="expand-btn"
          onClick={onExpand}
          disabled={bag.unlocked >= bag.capacity}
          style={bag.unlocked >= bag.capacity ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
        >
          + {t('expand', lang)}
        </button>
      </div>
    </section>
  );
}

Object.assign(window, { BagColumn });
