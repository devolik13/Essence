/**
 * VFX система — визуальные эффекты заклинаний и атак.
 * Использует Phaser ParticleEmitter + Graphics tweens.
 * Текстуры: particle_circle (16px), particle_spark (4px), particle_dot (2px)
 */
import Phaser from 'phaser';

// ── Цвета школ магии ─────────────────────────────────────────────────────────
export const SCHOOL_COLORS: Record<string, number> = {
  fire:    0xff5500,
  water:   0x4499ff,
  earth:   0xaa7733,
  wind:    0x88ddaa,
  nature:  0x44cc44,
  poison:  0x66bb00,
  darkness:0x7733aa,
  neutral: 0xcccccc,
};

export const SCHOOL_COLORS_LIGHT: Record<string, number> = {
  fire:    0xffaa44,
  water:   0xaaddff,
  earth:   0xddbb88,
  wind:    0xccffdd,
  nature:  0x88ff88,
  poison:  0xaaff44,
  darkness:0xbb77ee,
  neutral: 0xffffff,
};

// ── Снаряд с хвостом частиц ──────────────────────────────────────────────────

export function spawnProjectileVFX(
  scene: Phaser.Scene,
  fromX: number, fromY: number,
  toX: number, toY: number,
  school: string,
) {
  const color = SCHOOL_COLORS[school] ?? 0xcccccc;
  const colorLight = SCHOOL_COLORS_LIGHT[school] ?? 0xffffff;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const dist = Math.sqrt(dx * dx + dy * dy);
  const speed = 420;
  const dur = Math.min(600, (dist / speed) * 1000);

  // Яркое ядро снаряда
  const core = scene.add.circle(fromX, fromY, 5, colorLight, 1).setDepth(53);
  const glow = scene.add.circle(fromX, fromY, 10, color, 0.3).setDepth(52).setBlendMode(Phaser.BlendModes.ADD);

  // Хвост из частиц
  const emitter = scene.add.particles(fromX, fromY, 'particle_spark', {
    speed: { min: 10, max: 40 },
    angle: { min: Phaser.Math.RadToDeg(angle) + 150, max: Phaser.Math.RadToDeg(angle) + 210 },
    scale: { start: 1.5, end: 0 },
    alpha: { start: 0.8, end: 0 },
    tint: color,
    lifespan: 200,
    frequency: 15,
    blendMode: Phaser.BlendModes.ADD,
    emitting: true,
  }).setDepth(51);

  // Анимация полёта
  scene.tweens.add({
    targets: [core, glow, emitter],
    x: toX, y: toY,
    duration: dur,
    ease: 'Linear',
    onComplete: () => {
      emitter.stop();
      scene.time.delayedCall(250, () => { emitter.destroy(); });
      core.destroy();
      glow.destroy();
    },
  });
}

// ── Эффект попадания (взрыв частиц) ─────────────────────────────────────────

export function spawnHitVFX(
  scene: Phaser.Scene,
  x: number, y: number,
  school: string,
  isCrit: boolean = false,
) {
  const color = SCHOOL_COLORS[school] ?? 0xffffff;
  const colorLight = SCHOOL_COLORS_LIGHT[school] ?? 0xffffff;
  const count = isCrit ? 16 : 8;
  const lifespan = isCrit ? 400 : 250;

  // Взрыв частиц
  const emitter = scene.add.particles(x, y, 'particle_circle', {
    speed: { min: 40, max: isCrit ? 120 : 80 },
    angle: { min: 0, max: 360 },
    scale: { start: isCrit ? 0.8 : 0.5, end: 0 },
    alpha: { start: 1, end: 0 },
    tint: [color, colorLight],
    lifespan,
    blendMode: Phaser.BlendModes.ADD,
    emitting: false,
  }).setDepth(54);
  emitter.explode(count);
  scene.time.delayedCall(lifespan + 50, () => emitter.destroy());

  // Вспышка
  const flash = scene.add.circle(x, y, isCrit ? 20 : 12, colorLight, 0.6)
    .setDepth(54).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    scaleX: 2, scaleY: 2,
    duration: 200,
    ease: 'Power2',
    onComplete: () => flash.destroy(),
  });
}

// ── Эффект ближнего удара (дуга/полумесяц) ───────────────────────────────────

export function spawnMeleeSwingVFX(
  scene: Phaser.Scene,
  attackerX: number, attackerY: number,
  targetX: number, targetY: number,
  color: number = 0xffffff,
) {
  const angle = Math.atan2(targetY - attackerY, targetX - attackerX);
  const dist = 30;
  const cx = attackerX + Math.cos(angle) * dist;
  const cy = attackerY + Math.sin(angle) * dist;

  // Дуга из частиц
  const emitter = scene.add.particles(cx, cy, 'particle_spark', {
    speed: { min: 60, max: 120 },
    angle: { min: Phaser.Math.RadToDeg(angle) - 45, max: Phaser.Math.RadToDeg(angle) + 45 },
    scale: { start: 2, end: 0 },
    alpha: { start: 0.9, end: 0 },
    tint: color,
    lifespan: 180,
    blendMode: Phaser.BlendModes.ADD,
    emitting: false,
  }).setDepth(54);
  emitter.explode(6);
  scene.time.delayedCall(230, () => emitter.destroy());
}

// ── Эффект каста (кольцо вокруг кастера) ─────────────────────────────────────

export function spawnCastVFX(
  scene: Phaser.Scene,
  x: number, y: number,
  school: string,
  duration: number = 500,
) {
  const color = SCHOOL_COLORS[school] ?? 0xcccccc;

  // Расширяющееся кольцо
  const ring = scene.add.circle(x, y, 10, color, 0)
    .setStrokeStyle(2, color, 0.8)
    .setDepth(3).setBlendMode(Phaser.BlendModes.ADD);

  scene.tweens.add({
    targets: ring,
    scaleX: 3, scaleY: 3,
    alpha: 0,
    duration,
    ease: 'Power1',
    onComplete: () => ring.destroy(),
  });
}

// ── Эффект лечения (восходящие частицы) ──────────────────────────────────────

export function spawnHealVFX(
  scene: Phaser.Scene,
  x: number, y: number,
) {
  const emitter = scene.add.particles(x, y, 'particle_circle', {
    speed: { min: 20, max: 50 },
    angle: { min: 250, max: 290 }, // вверх
    scale: { start: 0.5, end: 0 },
    alpha: { start: 0.9, end: 0 },
    tint: [0x44ff44, 0x88ff88, 0xaaffaa],
    lifespan: 600,
    blendMode: Phaser.BlendModes.ADD,
    emitting: false,
  }).setDepth(54);
  emitter.explode(10);
  scene.time.delayedCall(650, () => emitter.destroy());
}

// ── Эффект AoE (расходящееся кольцо + частицы) ──────────────────────────────

export function spawnAoeVFX(
  scene: Phaser.Scene,
  x: number, y: number,
  radius: number,
  school: string,
) {
  const color = SCHOOL_COLORS[school] ?? 0xff6600;
  const colorLight = SCHOOL_COLORS_LIGHT[school] ?? 0xffaa44;

  // Расширяющееся кольцо
  const ring = scene.add.circle(x, y, radius * 0.3, color, 0)
    .setStrokeStyle(3, colorLight, 0.8)
    .setDepth(55).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: ring,
    scaleX: 3.3, scaleY: 3.3,
    alpha: 0,
    duration: 400,
    ease: 'Power2',
    onComplete: () => ring.destroy(),
  });

  // Частицы по краю
  const emitter = scene.add.particles(x, y, 'particle_circle', {
    speed: { min: 30, max: 80 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.6, end: 0 },
    alpha: { start: 0.8, end: 0 },
    tint: [color, colorLight],
    lifespan: 350,
    blendMode: Phaser.BlendModes.ADD,
    emitting: false,
  }).setDepth(55);
  emitter.explode(12);
  scene.time.delayedCall(400, () => emitter.destroy());
}

// ── Эффект статуса на теле (мелкие частицы вокруг) ───────────────────────────

export function spawnStatusVFX(
  scene: Phaser.Scene,
  x: number, y: number,
  color: number,
): Phaser.GameObjects.Particles.ParticleEmitter {
  return scene.add.particles(x, y, 'particle_dot', {
    speed: { min: 5, max: 15 },
    angle: { min: 0, max: 360 },
    scale: { start: 1, end: 0 },
    alpha: { start: 0.6, end: 0 },
    tint: color,
    lifespan: 800,
    frequency: 200,
    blendMode: Phaser.BlendModes.ADD,
    emitting: true,
  }).setDepth(2);
}
