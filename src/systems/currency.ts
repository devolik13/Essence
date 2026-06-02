/**
 * Currency utility — all amounts stored as copper coins.
 * 100 copper = 1 silver, 100 silver = 1 gold, 100 gold = 1 platinum
 */

export function formatCurrency(copper: number): string {
  if (copper < 100) return `${copper}c`;
  if (copper < 10000) {
    const s = Math.floor(copper / 100);
    const c = copper % 100;
    return c > 0 ? `${s}s ${c}c` : `${s}s`;
  }
  if (copper < 1000000) {
    const g = Math.floor(copper / 10000);
    const s = Math.floor((copper % 10000) / 100);
    return s > 0 ? `${g}g ${s}s` : `${g}g`;
  }
  const p = Math.floor(copper / 1000000);
  const g = Math.floor((copper % 1000000) / 10000);
  return g > 0 ? `${p}p ${g}g` : `${p}p`;
}

/** Copper rewards per creature tier */
export const MOB_COPPER_DROPS: Record<string, { min: number; max: number }> = {
  // Village T1 — животные
  hare:    { min: 1, max: 3 },
  grouse:  { min: 1, max: 3 },
  fox:     { min: 3, max: 8 },
  deer:    { min: 5, max: 10 },
  boar:    { min: 5, max: 12 },
  // Village T1 — гуманоиды / NPC
  goblin:  { min: 3, max: 8 },
  wolf:    { min: 5, max: 10 },
  bear:    { min: 8, max: 15 },
  orc:     { min: 8, max: 15 },
  scout:   { min: 5, max: 10 },
  monk:    { min: 5, max: 12 },
  shaman:  { min: 8, max: 15 },
  elder:   { min: 8, max: 15 },
  caravan_merchant: { min: 3, max: 8 },
  spirit_wolf: { min: 10, max: 20 },
  // Elementals T1
  spark:    { min: 5, max: 12 },
  asher:    { min: 8, max: 15 },
  splasher: { min: 5, max: 12 },
  fogger:   { min: 8, max: 15 },
  pebble:   { min: 5, max: 12 },
  mudder:   { min: 8, max: 15 },
  gusty:    { min: 5, max: 12 },
  whistler: { min: 8, max: 15 },
  // Veterans T2
  goblin_veteran: { min: 15, max: 30 },
  wolf_veteran:   { min: 20, max: 35 },
  bear_veteran:   { min: 25, max: 40 },
  orc_veteran:    { min: 25, max: 40 },
  scout_veteran:  { min: 20, max: 35 },
  // Bandits
  bandit_archer:   { min: 10, max: 20 },
  bandit_crossbow: { min: 10, max: 20 },
  bandit_spear:    { min: 10, max: 20 },
  bandit_brute:    { min: 15, max: 25 },
  bandit_archer_veteran:   { min: 25, max: 45 },
  bandit_crossbow_veteran: { min: 25, max: 45 },
  bandit_brute_veteran:    { min: 30, max: 50 },
  // Guards / ambushers
  caravan_guard: { min: 10, max: 20 },
  ambusher:      { min: 10, max: 20 },
  fort_guard:    { min: 10, max: 20 },
  // Bosses
  ignis:   { min: 200, max: 300 },
  aquaris: { min: 200, max: 300 },
  terra:   { min: 200, max: 300 },
  aeros:   { min: 200, max: 300 },
};
