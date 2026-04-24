import { Sphere } from '../entities/Sphere';
import { ACHIEVEMENTS, ACHIEVEMENT_MAP, AchievementDef } from '../data/achievementDB';

/** Returns list of newly unlocked achievement defs */
export function checkAchievements(sphere: Sphere): AchievementDef[] {
  const newly: AchievementDef[] = [];

  function tryUnlock(id: string) {
    if (sphere.unlockedAchievements.includes(id)) return;
    if (!ACHIEVEMENT_MAP[id]) return;
    sphere.unlockedAchievements.push(id);
    newly.push(ACHIEVEMENT_MAP[id]);
  }

  const kc = sphere.killCounts;

  // ── Kill thresholds ──────────────────────────────────────────────────────
  if ((kc['hare'] ?? 0) >= 1)  tryUnlock('kill_rabbit_1');
  if ((kc['hare'] ?? 0) >= 10) tryUnlock('kill_rabbit_10');
  if ((kc['goblin'] ?? 0) >= 1)  tryUnlock('kill_goblin_1');
  if ((kc['goblin'] ?? 0) >= 5)  tryUnlock('kill_goblin_5');
  if ((kc['goblin'] ?? 0) >= 20) tryUnlock('kill_goblin_20');
  if ((kc['wolf']   ?? 0) >= 1)  tryUnlock('kill_wolf_1');
  if ((kc['wolf']   ?? 0) >= 5)  tryUnlock('kill_wolf_5');
  if ((kc['scout']  ?? 0) >= 3)  tryUnlock('kill_scout_3');
  if ((kc['bear']   ?? 0) >= 1)  tryUnlock('kill_bear_1');
  if ((kc['bear']   ?? 0) >= 5)  tryUnlock('kill_bear_5');
  if ((kc['orc']    ?? 0) >= 1)  tryUnlock('kill_orc_1');
  if ((kc['orc']    ?? 0) >= 5)  tryUnlock('kill_orc_5');
  if ((kc['shaman'] ?? 0) >= 1)  tryUnlock('kill_shaman_1');
  if ((kc['shaman'] ?? 0) >= 3)  tryUnlock('kill_shaman_3');

  // Kill every type (7 combat creature types, excluding forest_spirit)
  const killTypes = ['hare','goblin','wolf','scout','bear','orc','shaman'];
  if (killTypes.every(t => (kc[t] ?? 0) >= 1)) tryUnlock('kill_all_types');

  // ── Capture ────────────────────────────────────────────────────────────
  const totalCaptures = sphere.unlockedAchievements.filter(id =>
    id === 'capture_1' || id === 'capture_5'
  ).length; // not right — use dedicated counter
  // We use a hidden counter stored in killCounts with key '__captures'
  const caps = kc['__captures'] ?? 0;
  if (caps >= 1) tryUnlock('capture_1');
  if (caps >= 5) tryUnlock('capture_5');

  // ── Spells ─────────────────────────────────────────────────────────────
  if (sphere.learnedSpells.some(s => s.id === 'spell_spark'))    tryUnlock('spell_spark');
  if (sphere.learnedSpells.some(s => s.id === 'spell_fireball')) tryUnlock('spell_fireball');

  return newly;
}

/** Get all achievements with unlock status for display */
export function getAllAchievementStatus(sphere: Sphere): { def: AchievementDef; unlocked: boolean }[] {
  return ACHIEVEMENTS.map(def => ({
    def,
    unlocked: sphere.unlockedAchievements.includes(def.id),
  }));
}
