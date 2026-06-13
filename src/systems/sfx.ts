/**
 * Procedural sound effects — no audio files needed.
 * Uses Web Audio API to generate sounds in real-time.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** Resume audio context on first user interaction (browser policy) */
export function resumeAudio() {
  if (audioCtx?.state === 'suspended') audioCtx.resume();
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function noise(ctx: AudioContext, duration: number, volume: number): AudioBufferSourceNode {
  const bufSize = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * volume;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

function tone(ctx: AudioContext, freq: number, type: OscillatorType = 'sine'): OscillatorNode {
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  return osc;
}

function envelope(ctx: AudioContext, attack: number, decay: number, volume: number = 0.3): GainNode {
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);
  return gain;
}

// ── Sound Effects ────────────────────────────────────────────────────────────

/** Melee hit — short noise burst */
export function sfxMeleeHit() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.005, 0.08, 0.25);
  const src = noise(ctx, 0.1, 1);
  src.connect(env).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + 0.1);
}

/** Ranged shot — quick snap */
export function sfxRangedShot() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.002, 0.1, 0.15);
  const osc = tone(ctx, 800, 'square');
  osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

/** Magic cast — rising sine sweep */
export function sfxMagicCast() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.05, 0.3, 0.15);
  const osc = tone(ctx, 300, 'sine');
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.25);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.35);
}

/** Magic hit — bright impact */
export function sfxMagicHit() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.005, 0.15, 0.2);
  const osc = tone(ctx, 600, 'triangle');
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}

/** Critical hit — louder, with extra punch */
export function sfxCritHit() {
  const ctx = getCtx();
  // Low punch
  const env1 = envelope(ctx, 0.003, 0.1, 0.35);
  const osc1 = tone(ctx, 150, 'sawtooth');
  osc1.connect(env1).connect(ctx.destination);
  osc1.start();
  osc1.stop(ctx.currentTime + 0.12);
  // High snap
  const env2 = envelope(ctx, 0.002, 0.06, 0.2);
  const n = noise(ctx, 0.08, 1);
  n.connect(env2).connect(ctx.destination);
  n.start();
  n.stop(ctx.currentTime + 0.08);
}

/** Death — low descending tone */
export function sfxDeath() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.01, 0.5, 0.2);
  const osc = tone(ctx, 250, 'sawtooth');
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.4);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.55);
}

/** Capture / possess — ascending chord */
export function sfxCapture() {
  const ctx = getCtx();
  const freqs = [400, 500, 650, 800];
  freqs.forEach((f, i) => {
    const delay = i * 0.06;
    const env = envelope(ctx, 0.02, 0.25, 0.1);
    env.gain.setValueAtTime(0, ctx.currentTime + delay);
    env.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
    const osc = tone(ctx, f, 'sine');
    osc.connect(env).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.35);
  });
}

/** Soul rip — тёмный whoosh вытяжки души при захвате тела (слоумо-момент):
 *  низкий суб-тон скользит вниз + фильтрованный шум нарастает вверх. */
export function sfxSoulRip() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Суб-тон: 160 → 45 Гц
  const env = envelope(ctx, 0.03, 0.55, 0.22);
  const osc = tone(ctx, 160, 'sine');
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.5);
  osc.connect(env).connect(ctx.destination);
  osc.start(); osc.stop(now + 0.6);
  // Восходящий шум через band-pass (свист "втягивания")
  const n = noise(ctx, 0.55, 0.7);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.Q.value = 6;
  bp.frequency.setValueAtTime(300, now);
  bp.frequency.exponentialRampToValueAtTime(2400, now + 0.45);
  const nEnv = envelope(ctx, 0.12, 0.4, 0.16);
  n.connect(bp).connect(nEnv).connect(ctx.destination);
  n.start(); n.stop(now + 0.55);
}

/** Heal — soft high shimmer */
export function sfxHeal() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.05, 0.4, 0.12);
  const osc = tone(ctx, 700, 'sine');
  osc.frequency.setValueAtTime(700, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.2);
  osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.4);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.5);
}

/** Buff applied — quick ascending blip */
export function sfxBuff() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.01, 0.15, 0.1);
  const osc = tone(ctx, 500, 'sine');
  osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.18);
}

/** Block — metallic clang */
export function sfxBlock() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.002, 0.12, 0.2);
  const osc = tone(ctx, 1200, 'square');
  osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

/** Miss / dodge — quick whoosh */
export function sfxMiss() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.01, 0.1, 0.08);
  const src = noise(ctx, 0.12, 0.5);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2000;
  filter.Q.value = 0.5;
  src.connect(filter).connect(env).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + 0.12);
}

/** Level up / spell learned — triumphant chord */
export function sfxLevelUp() {
  const ctx = getCtx();
  const freqs = [523, 659, 784, 1047]; // C5-E5-G5-C6
  freqs.forEach((f, i) => {
    const delay = i * 0.08;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime + delay);
    g.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.6);
    const osc = tone(ctx, f, 'sine');
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.65);
  });
}

/** Zone transition — deep whoosh */
export function sfxZoneTransition() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.1, 0.6, 0.15);
  const src = noise(ctx, 0.8, 0.6);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.3);
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.7);
  src.connect(filter).connect(env).connect(ctx.destination);
  src.start();
  src.stop(ctx.currentTime + 0.8);
}

/** UI click — короткий мягкий щелчок (кнопки меню, окна) */
export function sfxUiClick() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.002, 0.05, 0.07);
  const osc = tone(ctx, 660, 'triangle');
  osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
  osc.connect(env).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.07);
}

/** Dialog advance — тихий «бумажный» тычок (листание реплик) */
export function sfxUiPage() {
  const ctx = getCtx();
  const env = envelope(ctx, 0.002, 0.04, 0.05);
  const n = noise(ctx, 0.05, 0.5);
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 1.2;
  n.connect(bp).connect(env).connect(ctx.destination);
  n.start();
  n.stop(ctx.currentTime + 0.05);
}

/** Loot pickup — приятный двойной «дзынь» (предмет/монеты) */
export function sfxPickup() {
  const ctx = getCtx();
  const freqs = [880, 1320];
  freqs.forEach((f, i) => {
    const delay = i * 0.06;
    const env = envelope(ctx, 0.005, 0.18, 0.09);
    env.gain.setValueAtTime(0, ctx.currentTime + delay);
    env.gain.linearRampToValueAtTime(0.09, ctx.currentTime + delay + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
    const osc = tone(ctx, f, 'sine');
    osc.connect(env).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.22);
  });
}

/** Quest complete — триумфальный восходящий арпеджио-аккорд */
export function sfxQuestComplete() {
  const ctx = getCtx();
  const freqs = [523, 659, 784, 1047]; // C-E-G-C мажор
  freqs.forEach((f, i) => {
    const delay = i * 0.09;
    const env = envelope(ctx, 0.01, 0.4, 0.1);
    env.gain.setValueAtTime(0, ctx.currentTime + delay);
    env.gain.linearRampToValueAtTime(0.1, ctx.currentTime + delay + 0.02);
    env.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.45);
    const osc = tone(ctx, f, 'triangle');
    osc.connect(env).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.5);
  });
}

/** Rift seal — мощный «схлоп» закрытия разрыва (финал данжа): сабтон вниз +
 *  обрыв шумового хвоста, как будто пространство схлопнулось. */
export function sfxRiftSeal() {
  const ctx = getCtx();
  const now = ctx.currentTime;
  // Гул, обрывающийся резким спадом
  const env = envelope(ctx, 0.02, 1.1, 0.28);
  const osc = tone(ctx, 220, 'sawtooth');
  osc.frequency.exponentialRampToValueAtTime(38, now + 0.9);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(1800, now);
  lp.frequency.exponentialRampToValueAtTime(120, now + 1.0);
  osc.connect(lp).connect(env).connect(ctx.destination);
  osc.start(); osc.stop(now + 1.15);
  // Финальный «щелчок» схлопа на ~0.9с
  const cEnv = envelope(ctx, 0.001, 0.12, 0.22);
  cEnv.gain.setValueAtTime(0, now + 0.85);
  cEnv.gain.linearRampToValueAtTime(0.22, now + 0.87);
  cEnv.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
  const cN = noise(ctx, 0.15, 0.8);
  cN.connect(cEnv).connect(ctx.destination);
  cN.start(now + 0.85); cN.stop(now + 1.0);
}
