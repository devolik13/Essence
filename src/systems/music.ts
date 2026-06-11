/**
 * Фоновая музыка: зональные треки + боевой слой, кроссфейд.
 * HTMLAudio со стримингом — НЕ грузим мегабайты в BootScene.
 *
 * Раскладка (треки в public/assets/music/, лицензии — LICENSES.md там же):
 *  - village  — спокойный мир/старт (ВРЕМЕННО PeriTune Glistening Ripples:
 *               First Light (Megollyen) убран — автор требует личного
 *               разрешения на использование в проектах, ждём ответа)
 *  - water    — Туманное озеро (PeriTune — Glistening Ripples)
 *  - battle   — бой в фэнтези-мире (Eclipzodiac — Eleuxelier)
 *  - lab      — лаборатория/данж (Eclipzodiac — Era Machine)
 */

export type MusicKey = 'village' | 'water' | 'battle' | 'lab';

const SRC: Record<MusicKey, string> = {
  village: 'assets/music/water_glistening_ripples.ogg',
  water: 'assets/music/water_glistening_ripples.ogg',
  battle: 'assets/music/battle_eleuxelier.ogg',
  lab: 'assets/music/lab_era_machine.ogg',
};

const VOLUME = 0.32;
const FADE_MS = 1200;
const STEP_MS = 50;

let cur: HTMLAudioElement | null = null;
let curKey: MusicKey | '' = '';
let fading: number | null = null;
let pendingKey: MusicKey | '' = '';
let unlocked = false;
let unlockListening = false;

/** Браузер разрешает звук только после жеста пользователя — ждём его. */
function listenForUnlock(): void {
  if (unlockListening) return;
  unlockListening = true;
  const unlock = () => {
    unlocked = true;
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    if (pendingKey) {
      const k = pendingKey;
      pendingKey = '';
      playMusic(k);
    }
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
}

function crossfadeTo(next: HTMLAudioElement | null): void {
  const prev = cur;
  cur = next;
  if (fading !== null) { clearInterval(fading); fading = null; }
  const steps = Math.max(1, Math.round(FADE_MS / STEP_MS));
  let i = 0;
  fading = window.setInterval(() => {
    i++;
    const t = i / steps;
    if (prev) prev.volume = Math.max(0, VOLUME * (1 - t));
    if (next) next.volume = Math.min(VOLUME, VOLUME * t);
    if (i >= steps) {
      if (fading !== null) { clearInterval(fading); fading = null; }
      if (prev) { prev.pause(); prev.src = ''; }
    }
  }, STEP_MS);
}

/** Сменить трек (с кроссфейдом). Тот же ключ — no-op. '' — затихнуть. */
export function playMusic(key: MusicKey | ''): void {
  if (key === curKey && (key === '' || cur)) return;
  curKey = key;
  if (key === '') { crossfadeTo(null); return; }
  if (!unlocked) { pendingKey = key; listenForUnlock(); return; }
  const el = new Audio(SRC[key]);
  el.loop = true;
  el.volume = 0;
  el.play().catch(() => {
    // жест «протух» (редко) — ждём следующий
    unlocked = false;
    pendingKey = key;
    curKey = '';
    listenForUnlock();
  });
  crossfadeTo(el);
}

export function stopMusic(): void {
  playMusic('');
}
