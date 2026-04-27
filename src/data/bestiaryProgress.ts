/**
 * Bestiary progress — what creatures the player has discovered.
 * Persisted in localStorage. Will move to server profile when PvP backend lands.
 */

export type BestiaryRevealReason = 'killed' | 'sphered' | 'purchased' | 'gifted';

export interface BestiaryEntry {
  reason: BestiaryRevealReason;
  firstSeenAt: number;
  killCount: number;
  sphereCount: number;
}

export type BestiaryProgress = Record<string, BestiaryEntry>;

const STORAGE_KEY = 'essence.bestiary.progress.v1';

let cache: BestiaryProgress | null = null;

export function loadProgress(): BestiaryProgress {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) as BestiaryProgress : {};
  } catch {
    cache = {};
  }
  return cache!;
}

export function saveProgress(p: BestiaryProgress): void {
  cache = p;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* quota or disabled storage — ignore */
  }
}

export function isRevealed(p: BestiaryProgress, id: string): boolean {
  return !!p[id];
}

export function reveal(id: string, reason: BestiaryRevealReason): { progress: BestiaryProgress; newlyRevealed: boolean } {
  const p = loadProgress();
  const existing = p[id];
  const newlyRevealed = !existing;
  const entry: BestiaryEntry = existing ?? {
    reason,
    firstSeenAt: Date.now(),
    killCount: 0,
    sphereCount: 0,
  };
  if (reason === 'killed') entry.killCount += 1;
  if (reason === 'sphered') entry.sphereCount += 1;
  p[id] = entry;
  saveProgress(p);
  return { progress: p, newlyRevealed };
}
