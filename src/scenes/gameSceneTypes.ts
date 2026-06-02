/**
 * Internal types used by GameScene and its sub-systems.
 * Split out to keep GameScene.ts focused on logic rather than declarations.
 */
import Phaser from 'phaser';
import { AbilityDef } from '../types/abilities';
import { Stats } from '../types/stats';
import { MagicSchool } from '../data/magicSchools';
import { StatusEffectId } from '../types/statuses';
import { Creature } from '../entities/Creature';

// ── Summoned Ent (wolf, etc.) ─────────────────────────────────────────────────
export interface SummonedEnt {
  x: number; y: number;
  hp: number; maxHP: number;
  radius: number;
  remaining: number;
  sprite: Phaser.GameObjects.Sprite | null;
  hpBar: Phaser.GameObjects.Rectangle;
  hpBarBg: Phaser.GameObjects.Rectangle;
  gfx?: Phaser.GameObjects.Graphics;
}

// ── Fire Tsunami ──────────────────────────────────────────────────────────────
export interface FireTsunami {
  x: number; y: number;
  angle: number;
  width: number; depth: number;
  waveProgress: number;
  waveDuration: number;
  waveHit: Set<Creature>;
  baseDamage: number;
  burnRemaining: number;
  burnDps: number;
  burnTickTimer: number;
  school: string;
  casterStats: Stats;
  ownerIsPlayer: boolean;
  waveSprite: Phaser.GameObjects.Sprite | null;
  burnSprites: Phaser.GameObjects.Sprite[];
  gfx: Phaser.GameObjects.Graphics;
}

// ── Ground Zone (ground_zone effect) ─────────────────────────────────────────
export interface GroundZone {
  x: number; y: number;
  radius: number;
  dps: number;
  remaining: number;
  tickTimer: number;
  school?: MagicSchool;
  statusEffect?: StatusEffectId;
  statusChance?: number;
  spellId: string;
  casterStats: Stats;
  ownerIsPlayer: boolean;
  followPlayer?: boolean;
  isWall: boolean;
  wallWidth: number;
  wallThickness: number;
  angle: number;
  gfx: Phaser.GameObjects.Graphics;
  sprite?: Phaser.GameObjects.Sprite;
}

// ── Summoned Wall (summon_wall) ───────────────────────────────────────────────
export interface SummonedWall {
  x: number; y: number;
  halfW: number; halfT: number;
  angle: number;
  hp: number; maxHP: number;
  remaining: number;
  spellId: string;
  ownerIsPlayer: boolean;
  gfx: Phaser.GameObjects.Graphics;
  hpBar: Phaser.GameObjects.Rectangle;
  hpBarBg: Phaser.GameObjects.Rectangle;
}

// ── Wind Barrier (wind_barrier) ───────────────────────────────────────────────
export interface WindBarrier {
  x: number; y: number;
  radius: number;
  damageReduction: number;
  remaining: number;
  spellId: string;
  ownerIsPlayer: boolean;
  isWall: boolean;
  halfW: number; halfT: number;
  angle: number;
  gfx: Phaser.GameObjects.Graphics;
}

/** Check if a point lies inside a rotated rectangle */
export function pointInRotatedRect(
  px: number, py: number,
  cx: number, cy: number,
  halfW: number, halfT: number,
  angle: number,
): boolean {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const dx = px - cx;
  const dy = py - cy;
  const lx = Math.abs(dx * cos - dy * sin);
  const ly = Math.abs(dx * sin + dy * cos);
  return lx <= halfW && ly <= halfT;
}

// ── Basic attacks per body type ───────────────────────────────────────────────
/** Slot-0 auto-attack definitions. baseDamage = 0 uses weapon.baseDamage at runtime. */
export const BASIC_ATTACKS: Record<string, AbilityDef> = {
  default:      { id: 'basic_melee', nameRu: 'Strike',       damageType: 'melee',  cooldown: 1.2, manaCost: 0, range: 48,  baseDamage: 0, description: 'Basic attack'    },
  human_warrior:{ id: 'basic_sword', nameRu: 'Sword Strike',  damageType: 'melee',  cooldown: 1.2, manaCost: 0, range: 48,  baseDamage: 0, description: 'Sword attack'    },
  human_archer: { id: 'basic_bow',   nameRu: 'Shot',          damageType: 'ranged', cooldown: 1.0, manaCost: 0, range: 200, baseDamage: 0, description: 'Bow shot'        },
  human_mage:   { id: 'basic_staff', nameRu: 'Staff Strike',  damageType: 'magic',  cooldown: 1.5, manaCost: 2, range: 180, baseDamage: 0, description: 'Magic shot'      },
  rabbit:       { id: 'basic_paw',   nameRu: 'Paw Strike',    damageType: 'melee',  cooldown: 0.8, manaCost: 0, range: 36,  baseDamage: 0, description: 'Quick paw strike'},
  goblin:       { id: 'basic_dagger',nameRu: 'Dagger Stab',   damageType: 'melee',  cooldown: 0.8, manaCost: 0, range: 40,  baseDamage: 0, description: 'Dagger stab'    },
  wolf:         { id: 'basic_bite',  nameRu: 'Bite',          damageType: 'melee',  cooldown: 0.8, manaCost: 0, range: 38,  baseDamage: 0, description: 'Wolf bite'       },
};

// ── Death penalty constants ───────────────────────────────────────────────────
export const DEATH_XP_LOSS_PCT     = 0.10;
export const DEATH_DEBUFF_DURATION = 30;
export const DEATH_DEBUFF_MULT     = 0.85;
