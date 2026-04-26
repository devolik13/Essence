/**
 * Sprite-icon helpers — pulls SVG <symbol>s from /public/*.svg sheets.
 * Supports four sheets: weapons, armor, spells, weapon-abilities, neutral-abilities.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

export interface SpriteRef { file: string; id: string; }

const WEAPON_TYPES = [
  'sword', 'mace', 'greatsword', 'spear', 'hammer',
  'dagger', 'fists', 'shortbow', 'longbow', 'crossbow',
  'staff_fire', 'staff_water', 'staff_earth', 'staff_wind', 'staff_nature',
] as const;

const ARMOR_TYPES = ['heavy', 'leather', 'robe'] as const;
const ARMOR_SLOTS = ['helmet', 'chest', 'gloves', 'boots'] as const;

/** Map a weapon-type string (sword, staff_fire, …) to its sprite symbol id, or null. */
export function spriteIdForWeapon(weapon: string): string | null {
  return (WEAPON_TYPES as readonly string[]).includes(weapon) ? `icon_${weapon}` : null;
}

/**
 * Map an item id (starter_sword, sword_t2, heavy_chest_t1, …) to a sprite ref.
 * Returns null if the item is not a weapon/armor we can render.
 */
export function spriteForItem(itemId: string): SpriteRef | null {
  let core = itemId;
  if (core.startsWith('starter_')) core = core.slice('starter_'.length);
  const tierMatch = core.match(/^(.*)_t\d+$/);
  if (tierMatch) core = tierMatch[1];
  if ((WEAPON_TYPES as readonly string[]).includes(core)) {
    return { file: 'weapons.svg', id: `icon_${core}` };
  }
  const armor = core.match(/^(heavy|leather|robe)_(helmet|chest|gloves|boots)$/);
  if (armor && (ARMOR_TYPES as readonly string[]).includes(armor[1]) &&
      (ARMOR_SLOTS as readonly string[]).includes(armor[2])) {
    return { file: 'armor.svg', id: `icon_${armor[1]}_${armor[2]}` };
  }
  return null;
}

/** @deprecated Use spriteForItem; kept for callers that only want weapon ids. */
export function spriteIdForItem(itemId: string): string | null {
  const ref = spriteForItem(itemId);
  return ref && ref.file === 'weapons.svg' ? ref.id : null;
}

// ─── Spells & abilities ──────────────────────────────────────────────────────

/** Explicit spell-id → sprite mapping (weapon abilities + neutral abilities). */
const ABILITY_SPRITES: Record<string, SpriteRef> = {
  // ── Weapon abilities (weapon-abilities.svg) ──
  // Sword
  sword_strike: { file: 'weapon-abilities.svg', id: 'wa_sword_t1' },
  double_strike: { file: 'weapon-abilities.svg', id: 'wa_sword_t2' },
  sword_rend: { file: 'weapon-abilities.svg', id: 'wa_sword_t3' },
  // Dagger
  sting: { file: 'weapon-abilities.svg', id: 'wa_dagger_t1' },
  knife_throw: { file: 'weapon-abilities.svg', id: 'wa_dagger_t2' },
  lethal_dose: { file: 'weapon-abilities.svg', id: 'wa_dagger_t3' },
  // Mace
  mace_strike: { file: 'weapon-abilities.svg', id: 'wa_mace_t1' },
  mace_bash: { file: 'weapon-abilities.svg', id: 'wa_mace_t2' },
  mace_concuss: { file: 'weapon-abilities.svg', id: 'wa_mace_t3' },
  // Greatsword
  slash: { file: 'weapon-abilities.svg', id: 'wa_greatsword_t1' },
  slash_sweep: { file: 'weapon-abilities.svg', id: 'wa_greatsword_t2' },
  bloody_sweep: { file: 'weapon-abilities.svg', id: 'wa_greatsword_t3' },
  war_cry: { file: 'weapon-abilities.svg', id: 'wa_greatsword_warcry' },
  // Spear
  spear_thrust: { file: 'weapon-abilities.svg', id: 'wa_spear_t1' },
  spear_butt: { file: 'weapon-abilities.svg', id: 'wa_spear_t2' },
  spear_throw: { file: 'weapon-abilities.svg', id: 'wa_spear_t3' },
  // Hammer
  hammer_strike: { file: 'weapon-abilities.svg', id: 'wa_hammer_t1' },
  hammer_smash: { file: 'weapon-abilities.svg', id: 'wa_hammer_t2' },
  earthquake: { file: 'weapon-abilities.svg', id: 'wa_hammer_t3' },
  focus: { file: 'weapon-abilities.svg', id: 'wa_hammer_focus' },
  // Short bow
  bow_shot: { file: 'weapon-abilities.svg', id: 'wa_shortbow_t1' },
  bow_backshot: { file: 'weapon-abilities.svg', id: 'wa_shortbow_t2' },
  trap: { file: 'weapon-abilities.svg', id: 'wa_shortbow_t3' },
  // Long bow
  longbow_shot: { file: 'weapon-abilities.svg', id: 'wa_longbow_t1' },
  arrow_rain: { file: 'weapon-abilities.svg', id: 'wa_longbow_t2' },
  power_shot: { file: 'weapon-abilities.svg', id: 'wa_longbow_t3' },
  // Crossbow
  crossbow_bolt: { file: 'weapon-abilities.svg', id: 'wa_crossbow_t1' },
  crossbow_snare: { file: 'weapon-abilities.svg', id: 'wa_crossbow_t2' },
  support_bolt: { file: 'weapon-abilities.svg', id: 'wa_crossbow_t3' },
  // Fists
  hook: { file: 'weapon-abilities.svg', id: 'wa_fists_t1' },
  fist_strike: { file: 'weapon-abilities.svg', id: 'wa_fists_t2' },
  cleansing_strike: { file: 'weapon-abilities.svg', id: 'wa_fists_t3' },

  // ── Neutral abilities (neutral-abilities.svg) ──
  acceleration: { file: 'neutral-abilities.svg', id: 'ab_acceleration' },
  adaptation: { file: 'neutral-abilities.svg', id: 'ab_adaptation' },
  ally_heal: { file: 'neutral-abilities.svg', id: 'ab_ally_heal' },
  battle_march: { file: 'neutral-abilities.svg', id: 'ab_battle_march' },
  combo: { file: 'neutral-abilities.svg', id: 'ab_combo' },
  cover: { file: 'neutral-abilities.svg', id: 'ab_cover' },
  dash: { file: 'neutral-abilities.svg', id: 'ab_dash' },
  desperation: { file: 'neutral-abilities.svg', id: 'ab_desperation' },
  execute: { file: 'neutral-abilities.svg', id: 'ab_execute' },
  expose: { file: 'neutral-abilities.svg', id: 'ab_expose' },
  fire_trap: { file: 'neutral-abilities.svg', id: 'ab_fire_trap' },
  firm_stance: { file: 'neutral-abilities.svg', id: 'ab_firm_stance' },
  fortune: { file: 'neutral-abilities.svg', id: 'ab_fortune' },
  neutral_heal: { file: 'neutral-abilities.svg', id: 'ab_heal' },
  iron_skin: { file: 'neutral-abilities.svg', id: 'ab_iron_skin' },
  mana_flow: { file: 'neutral-abilities.svg', id: 'ab_mana_flow' },
  mana_link: { file: 'neutral-abilities.svg', id: 'ab_mana_link' },
  maneuver: { file: 'neutral-abilities.svg', id: 'ab_maneuver' },
  poison_trap: { file: 'neutral-abilities.svg', id: 'ab_poison_trap' },
  pure_strike: { file: 'neutral-abilities.svg', id: 'ab_pure_strike' },
  purify: { file: 'neutral-abilities.svg', id: 'ab_purify' },
  ram: { file: 'neutral-abilities.svg', id: 'ab_ram' },
  ranged_resist: { file: 'neutral-abilities.svg', id: 'ab_ranged_resist' },
  ricochet: { file: 'neutral-abilities.svg', id: 'ab_ricochet' },
  shadow_step: { file: 'neutral-abilities.svg', id: 'ab_shadow_step' },
  shield_stance: { file: 'neutral-abilities.svg', id: 'ab_shield_stance' },
  spirit_resilience: { file: 'neutral-abilities.svg', id: 'ab_spirit_resilience' },
  sustain: { file: 'neutral-abilities.svg', id: 'ab_sustain' },
  unshakeable: { file: 'neutral-abilities.svg', id: 'ab_unshakeable' },
  whirlwind: { file: 'neutral-abilities.svg', id: 'ab_whirlwind' },
};

/**
 * Map a spell/ability id to a sprite ref.
 * - Elemental (mob_<element>_t<N>) → spells.svg#spell_<element>_t<N>
 * - Weapon/neutral abilities → explicit ABILITY_SPRITES table
 */
export function spriteForSpell(spellId: string): SpriteRef | null {
  const elem = spellId.match(/^mob_(fire|water|earth|wind|nature)_t([1-5])$/);
  if (elem) return { file: 'spells.svg', id: `spell_${elem[1]}_t${elem[2]}` };
  return ABILITY_SPRITES[spellId] ?? null;
}

// ─── DOM construction ────────────────────────────────────────────────────────

/** Build an inline <svg><use href="/<file>#<id>"/></svg> element. */
export function createSpriteSvg(ref: SpriteRef, extraClass = ''): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 156 156');
  svg.setAttribute('aria-hidden', 'true');
  svg.classList.add('sprite-svg-icon');
  if (extraClass) svg.classList.add(extraClass);
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `/${ref.file}#${ref.id}`);
  svg.appendChild(use);
  return svg;
}

/** Convenience for callers that already have a weapons.svg symbol id. */
export function createWeaponSvg(spriteId: string): SVGSVGElement {
  return createSpriteSvg({ file: 'weapons.svg', id: spriteId }, 'weapon-svg-icon');
}
