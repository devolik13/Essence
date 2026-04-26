/**
 * Weapon SVG icon helpers — sources symbols from /weapons.svg sprite.
 * Maps weapon types and item IDs to <symbol id="icon_*"> entries.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const SPRITE_URL = '/weapons.svg';

const WEAPON_TYPES = [
  'sword', 'mace', 'greatsword', 'spear', 'hammer',
  'dagger', 'fists', 'shortbow', 'longbow', 'crossbow',
  'staff_fire', 'staff_water', 'staff_earth', 'staff_wind', 'staff_nature',
] as const;

/** Map a weapon-type string (sword, staff_fire, …) to its sprite symbol id, or null. */
export function spriteIdForWeapon(weapon: string): string | null {
  return (WEAPON_TYPES as readonly string[]).includes(weapon) ? `icon_${weapon}` : null;
}

/**
 * Map an item id (starter_sword, sword_t2, staff_fire_t1, …) to a weapon sprite symbol id.
 * Returns null if the item is not a weapon we can render.
 */
export function spriteIdForItem(itemId: string): string | null {
  let core = itemId;
  if (core.startsWith('starter_')) core = core.slice('starter_'.length);
  const tierMatch = core.match(/^(.*)_t\d+$/);
  if (tierMatch) core = tierMatch[1];
  return spriteIdForWeapon(core);
}

/** Build an inline <svg><use href="/weapons.svg#icon_*"/></svg> element. */
export function createWeaponSvg(spriteId: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 156 156');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('weapon-svg-icon');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `${SPRITE_URL}#${spriteId}`);
  svg.appendChild(use);
  return svg;
}
