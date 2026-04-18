import Phaser from 'phaser';

/**
 * Design tokens, adapted from the inventory Claude Design prototype
 * (design/Essence/inventory/tokens.css). Steampunk + ethereal: aged
 * brass on void-black, with ether-blue accents for Sphere glow.
 */

export const THEME = {
  // Ink — void / panel backgrounds
  ink0: 0x0d0b08,
  ink1: 0x14110c,
  ink2: 0x1d1811,
  ink3: 0x2a2218,
  ink4: 0x3a2f21,

  // Brass — primary accent
  brass0: 0x6b4e1f,
  brass1: 0x8a6a2f,
  brass2: 0xb48a42,
  brass3: 0xd9b46a,
  brass4: 0xf0d896,

  // Ether — Sphere glow
  ether0: 0x1a2840,
  ether1: 0x2a4a74,
  ether2: 0x5a8fc4,
  ether3: 0x8ab8e0,

  // Paper / text
  paper0: 0xe8dcc0,
  paper1: 0xd4c69c,
  paper2: 0xb8a878,
  text0:  0xf4e9cf,
  text1:  0xd8c9a4,
  text2:  0x9c8c6a,
  text3:  0x6a5c42,

  // Rarity
  rCommon:    0x8a8172,
  rUncommon:  0x6d9a5a,
  rRare:      0x5a88c4,
  rEpic:      0xa76fc4,
  rLegendary: 0xd9a44a,
} as const;

/** Hex string versions for Phaser text colors */
export const TC = {
  paper0: '#e8dcc0',
  paper1: '#d4c69c',
  brass1: '#8a6a2f',
  brass2: '#b48a42',
  brass3: '#d9b46a',
  brass4: '#f0d896',
  ether2: '#5a8fc4',
  ether3: '#8ab8e0',
  text1:  '#d8c9a4',
  text2:  '#9c8c6a',
  text3:  '#6a5c42',
  ink0:   '#0d0b08',
} as const;

/**
 * Draw a brass L-shaped corner ornament, mirroring the `.corner` blocks
 * in the inventory CSS. Returns the graphics object so caller can depth/scroll.
 */
export function drawCorner(
  scene: Phaser.Scene, x: number, y: number, size: number,
  pos: 'tl' | 'tr' | 'bl' | 'br', color = THEME.brass2, alpha = 0.85,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  g.lineStyle(1, color, alpha);
  // Two perpendicular lines forming an L at the given corner.
  if (pos === 'tl') { g.lineBetween(x, y, x + size, y); g.lineBetween(x, y, x, y + size); }
  if (pos === 'tr') { g.lineBetween(x, y, x - size, y); g.lineBetween(x, y, x, y + size); }
  if (pos === 'bl') { g.lineBetween(x, y, x + size, y); g.lineBetween(x, y, x, y - size); }
  if (pos === 'br') { g.lineBetween(x, y, x - size, y); g.lineBetween(x, y, x, y - size); }
  return g;
}

/**
 * Draw a horizontal brass gradient line, like the header separator.
 * Approximated with 3 segments (faint-solid-faint) since Phaser
 * doesn't do CSS-style gradients on stroke.
 */
export function drawBrassLine(
  scene: Phaser.Scene, x: number, y: number, w: number,
  color = THEME.brass2,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const seg = w / 3;
  g.lineStyle(1, color, 0.15).lineBetween(x, y, x + seg, y);
  g.lineStyle(1, color, 0.55).lineBetween(x + seg, y, x + seg * 2, y);
  g.lineStyle(1, color, 0.15).lineBetween(x + seg * 2, y, x + w, y);
  return g;
}

/** Same, but vertical (for dividers between slot groups). */
export function drawBrassLineV(
  scene: Phaser.Scene, x: number, y: number, h: number,
  color = THEME.brass2,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const seg = h / 3;
  g.lineStyle(1, color, 0.15).lineBetween(x, y, x, y + seg);
  g.lineStyle(1, color, 0.55).lineBetween(x, y + seg, x, y + seg * 2);
  g.lineStyle(1, color, 0.15).lineBetween(x, y + seg * 2, x, y + h);
  return g;
}

/**
 * Brass-framed panel: dark gradient-ish backdrop + 1px brass border +
 * inner hairline, optional corner ornaments. Returns all created
 * objects in creation order so caller can attach to a container.
 */
export function drawBrassPanel(
  scene: Phaser.Scene, cx: number, cy: number, w: number, h: number,
  opts: { corners?: boolean; cornerSize?: number; fill?: number; border?: number } = {},
): Phaser.GameObjects.GameObject[] {
  const fill = opts.fill ?? THEME.ink1;
  const border = opts.border ?? THEME.brass1;
  const cornerSize = opts.cornerSize ?? 10;
  const objs: Phaser.GameObjects.GameObject[] = [];

  const bg = scene.add.rectangle(cx, cy, w, h, fill, 0.96);
  objs.push(bg);

  const outline = scene.add.rectangle(cx, cy, w, h).setStrokeStyle(1, border, 1).setFillStyle(0, 0);
  objs.push(outline);

  // Inner hairline (1px in from border), thin brass at low alpha
  const inner = scene.add.rectangle(cx, cy, w - 4, h - 4).setStrokeStyle(1, THEME.brass2, 0.2).setFillStyle(0, 0);
  objs.push(inner);

  if (opts.corners) {
    const x1 = cx - w / 2 + 4, x2 = cx + w / 2 - 4;
    const y1 = cy - h / 2 + 4, y2 = cy + h / 2 - 4;
    objs.push(drawCorner(scene, x1, y1, cornerSize, 'tl'));
    objs.push(drawCorner(scene, x2, y1, cornerSize, 'tr'));
    objs.push(drawCorner(scene, x1, y2, cornerSize, 'bl'));
    objs.push(drawCorner(scene, x2, y2, cornerSize, 'br'));
  }

  return objs;
}

/** Style presets for common text flavors in the design. */
export const TEXT = {
  /** Small mechanical label (SPECIAL ELITE analog) — uppercase, spaced, faded */
  mech: (color = TC.text3): Phaser.Types.GameObjects.Text.TextStyle => ({
    fontSize: '9px', fontFamily: 'monospace', color,
  }),
  /** Display serif-ish (Cormorant analog) — larger, paper color */
  display: (size = '16px', color = TC.paper0): Phaser.Types.GameObjects.Text.TextStyle => ({
    fontSize: size, fontFamily: 'serif', color, fontStyle: '600',
  }),
  /** Monospace numeric */
  mono: (size = '11px', color = TC.text1): Phaser.Types.GameObjects.Text.TextStyle => ({
    fontSize: size, fontFamily: 'monospace', color,
  }),
} as const;
