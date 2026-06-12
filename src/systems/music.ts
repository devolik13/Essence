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
 *
 * ВАЖНО: кроссфейд ведёт учёт ВСЕХ живых элементов (`live`) и глушит все,
 * кроме целевого. Иначе смена трека во время незаконченного фейда оставляла
 * «осиротевший» элемент играть вечно — наложение двух треков.
 */

export type MusicKey = 'village' | 'water' | 'battle' | 'lab';

// Safari не играет OGG Vorbis → выбираем расширение по поддержке браузера.
// Каждый трек лежит в двух форматах: .ogg (основной) + .mp3 (фоллбек).
const OGG_OK = typeof Audio !== 'undefined'
  && new Audio().canPlayType('audio/ogg; codecs="vorbis"') !== '';
const EXT = OGG_OK ? 'ogg' : 'mp3';

const SRC: Record<MusicKey, string> = {
  village: `assets/music/water_glistening_ripples.${EXT}`,
  water: `assets/music/water_glistening_ripples.${EXT}`,
  battle: `assets/music/battle_eleuxelier.${EXT}`,
  lab: `assets/music/lab_era_machine.${EXT}`,
};

const VOLUME = 0.32;
const FADE_MS = 1200;
const STEP_MS = 50;

/** Все ещё звучащие элементы (включая затухающие). */
const live = new Set<HTMLAudioElement>();
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

/** Целевой элемент — к VOLUME, все остальные живые — к нулю и pause.
 *  Прогресс — по реальному времени (performance.now), а не по числу тиков:
 *  браузер троттлит setInterval у фоновых вкладок, и тиковый фейд замерзал
 *  на полпути (трек оставался играть на половинной громкости). */
function crossfadeTo(next: HTMLAudioElement | null): void {
  cur = next;
  if (next) live.add(next);
  if (fading !== null) { clearInterval(fading); fading = null; }
  // Стартовые громкости — для плавного продолжения прерванного фейда
  const start = new Map<HTMLAudioElement, number>();
  for (const el of live) start.set(el, el.volume);
  const t0 = performance.now();
  fading = window.setInterval(() => {
    const t = Math.min(1, (performance.now() - t0) / FADE_MS);
    for (const el of [...live]) {
      const s = start.get(el) ?? 0;
      if (el === next) {
        el.volume = Math.min(VOLUME, s + (VOLUME - s) * t);
      } else {
        el.volume = Math.max(0, s * (1 - t));
        if (t >= 1) {
          el.pause();
          el.src = '';
          live.delete(el);
        }
      }
    }
    if (t >= 1 && fading !== null) {
      clearInterval(fading);
      fading = null;
    }
  }, STEP_MS);
}

/** Сменить трек (с кроссфейдом). Тот же ключ — no-op. '' — затихнуть. */
export function playMusic(key: MusicKey | ''): void {
  if (key === curKey && (key === '' || cur)) return;
  // Один и тот же файл под разными ключами (village/water) — не перезапускаем
  if (key !== '' && curKey !== '' && cur && SRC[key] === SRC[curKey as MusicKey]) {
    curKey = key;
    return;
  }
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
    live.delete(el);
    listenForUnlock();
  });
  crossfadeTo(el);
}

export function stopMusic(): void {
  playMusic('');
}

/** Dev-хук для автотестов: сколько элементов реально звучит. */
export function getLiveMusicCount(): number {
  let n = 0;
  for (const el of live) { if (!el.paused) n++; }
  return n;
}
/** Dev-хук: подробное состояние всех живых элементов. */
export function getMusicDebug(): { src: string; paused: boolean; volume: number }[] {
  return [...live].map(el => ({
    src: el.src.split('/').pop() ?? '', paused: el.paused, volume: Math.round(el.volume * 100) / 100,
  }));
}
if (typeof window !== 'undefined') {
  (window as any).__music = { playMusic, getLiveMusicCount, getMusicDebug };
}
