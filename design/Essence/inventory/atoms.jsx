// atoms.jsx — Slot, Silhouette SVG, small UI atoms
// ---------------------------------------------------------------

const { useState, useRef, useEffect, useMemo, useCallback } = React;

// ─── Essence figure — Sphere + ghostly body aura, not anatomy
function Silhouette() {
  return (
    <svg viewBox="0 0 200 480" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="sphereCore" cx="40%" cy="35%" r="65%">
          <stop offset="0%"  stopColor="#f0f6ff" stopOpacity="1" />
          <stop offset="18%" stopColor="#d8e8f8" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#8ab8e0" stopOpacity="0.85" />
          <stop offset="75%" stopColor="#2a4a74" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#1a2840" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="sphereHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#8ab8e0" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#5a8fc4" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#1a2840" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bodyAura" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#8ab8e0" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#5a8fc4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2a4a74" stopOpacity="0.02" />
        </linearGradient>
        <filter id="auraBlur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Ghostly body aura — loose silhouette hinting at inhabited vessel */}
      <g filter="url(#auraBlur)" opacity="0.9">
        <path
          d="
            M 100 60
            C 118 62  128 76  126 96
            C 138 106 148 130 150 158
            C 152 190 144 232 138 268
            C 150 292 156 328 152 372
            C 148 410 140 438 132 458
            L 112 466
            L 108 424
            L 104 390
            L 100 416
            L 96 390
            L 92 424
            L 88 466
            L 68 458
            C 60 438  52 410  48 372
            C 44 328  50 292  62 268
            C 56 232  48 190  50 158
            C 52 130  62 106  74 96
            C 72 76  82 62  100 60
            Z"
          fill="url(#bodyAura)"
        />
      </g>

      {/* Wispy trails rising from body */}
      <g opacity="0.45" stroke="#8ab8e0" strokeWidth="0.6" fill="none" strokeLinecap="round">
        <path d="M74 96  Q66 72  72 48" strokeDasharray="1 4">
          <animate attributeName="stroke-dashoffset" from="0" to="10" dur="4s" repeatCount="indefinite"/>
        </path>
        <path d="M126 96 Q134 72  128 48" strokeDasharray="1 4">
          <animate attributeName="stroke-dashoffset" from="10" to="0" dur="5s" repeatCount="indefinite"/>
        </path>
        <path d="M100 62 Q104 46 100 30" strokeDasharray="1 3" />
      </g>

      {/* Sphere halo */}
      <circle cx="100" cy="40" r="46" fill="url(#sphereHalo)">
        <animate attributeName="r" values="42;52;42" dur="6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="6s" repeatCount="indefinite"/>
      </circle>

      {/* Sphere core */}
      <circle cx="100" cy="40" r="22" fill="url(#sphereCore)"/>
      <circle cx="100" cy="40" r="22" fill="none" stroke="#d8e8f8" strokeWidth="0.5" opacity="0.6"/>
      {/* Specular highlight */}
      <ellipse cx="92" cy="32" rx="6" ry="4" fill="#ffffff" opacity="0.55"/>

      {/* Outer ring */}
      <circle cx="100" cy="40" r="30" fill="none" stroke="#8ab8e0" strokeWidth="0.4" opacity="0.35"
              strokeDasharray="2 4">
        <animateTransform attributeName="transform" type="rotate" from="0 100 40" to="360 100 40"
                          dur="28s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// ─── Slot ───────────────────────────────────────────────────────
function Slot({
  itemId, qty, equipped, locked, empty, onClick, onContextMenu,
  onMouseEnter, onMouseLeave, onMouseMove, onDragStart, onDragEnd,
  onDragOver, onDrop, draggable = true, dragOver = false, extraClass = '',
  lang, hint,
}) {
  const item = itemId ? ITEMS[itemId] : null;
  const rarity = item?.rarity;
  const cls = [
    'slot',
    locked ? 'locked' : '',
    !item && !locked ? 'empty' : '',
    dragOver ? 'drag-over' : '',
    extraClass,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cls}
      data-rarity={rarity || undefined}
      data-item-id={itemId || undefined}
      draggable={!!item && !locked && draggable}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={onMouseMove}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {locked && <span className="lock">⚿</span>}
      {!locked && !item && hint && <span className="hint">{hint}</span>}
      {item && <span className="icon">{item.icon}</span>}
      {item && qty > 1 && <span className="qty">{qty}</span>}
      {equipped && <span className="equipped-mark">●</span>}
    </div>
  );
}

// Coin row
function Coin({ kind, value }) {
  return (
    <div className={`coin ${kind}`}>
      <span className="mark">
        {kind === 'gold' ? 'G' : kind === 'silver' ? 'S' : 'C'}
      </span>
      <span className="v">{value}</span>
    </div>
  );
}

Object.assign(window, { Silhouette, Slot, Coin });
