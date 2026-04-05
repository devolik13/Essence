import Phaser from 'phaser';
import { BodyDefinition } from '../types/bodies';
import { Stats, StatName, createDefaultStats } from '../types/stats';
import { maxHP } from '../systems/combat';
import { CREATURE_SPEED, AGGRO_RANGE, LEASH_RANGE } from '../utils/constants';
import { WEAPONS } from '../data/weapons';
import { distance } from '../utils/math';
import { clamp } from '../utils/math';

export type CreatureAIState = 'idle' | 'wander' | 'chase' | 'attack' | 'return' | 'dead';

/**
 * Существо (NPC/моб) — враг или пассивное существо в мире.
 * Имеет свой набор статов (на основе капов тела).
 */
export class Creature extends Phaser.GameObjects.Container {
  public definition: BodyDefinition;
  public stats: Stats;
  public currentHP: number;
  public aiState: CreatureAIState = 'idle';
  public attackCooldown: number = 0;

  public spawnX: number;
  public spawnY: number;

  private bodySprite: Phaser.GameObjects.Arc;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;

  // Hit flash
  private hitFlashTimer: number = 0;

  // Wander
  private wanderTimer: number = 0;
  private wanderDirX: number = 0;
  private wanderDirY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, definition: BodyDefinition) {
    super(scene, x, y);

    this.definition = definition;
    this.spawnX = x;
    this.spawnY = y;

    // Статы моба: npcStats если заданы, иначе капы
    this.stats = createDefaultStats();
    const source = definition.npcStats ?? definition.caps;
    for (const [stat, val] of Object.entries(source)) {
      if (val !== undefined) this.stats[stat as StatName] = val;
    }

    this.currentHP = maxHP(this.stats);

    // Визуал
    this.bodySprite = scene.add.arc(0, 0, 12, 0, 360, false, definition.color, 1);
    this.add(this.bodySprite);

    // Имя
    this.nameText = scene.add.text(0, -30, definition.nameRu, {
      fontSize: '10px',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);
    this.add(this.nameText);

    // HP-бар (фон + заливка, левый край = -18)
    this.hpBarBg = scene.add.rectangle(0, -20, 36, 5, 0x222222).setOrigin(0.5, 0.5);
    this.add(this.hpBarBg);
    this.hpBar = scene.add.rectangle(-18, -20, 36, 5, 0xcc3333).setOrigin(0, 0.5);
    this.add(this.hpBar);

    scene.add.existing(this);
  }

  get maxHP(): number { return maxHP(this.stats); }
  get isDead(): boolean { return this.currentHP <= 0; }

  update(_time: number, delta: number, playerX?: number, playerY?: number) {
    if (this.isDead) {
      this.aiState = 'dead';
      this.setAlpha(0.3);
      return;
    }

    const dt = delta / 1000;

    // Кулдаун
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    }

    // AI
    if (playerX !== undefined && playerY !== undefined) {
      const dist = distance(this.x, this.y, playerX, playerY);
      const distFromSpawn = distance(this.x, this.y, this.spawnX, this.spawnY);

      const weapon = WEAPONS[this.definition.weapon];
      const attackRange = weapon.isMelee ? 44 : weapon.range * 0.85; // дальнобойные чуть не дотягиваются до max
      const preferredDist = weapon.isMelee ? 0 : weapon.range * 0.6; // дистанция удержания для ranged

      if (this.aiState === 'chase' || this.aiState === 'attack') {
        if (distFromSpawn > LEASH_RANGE) {
          this.aiState = 'return';
        } else if (dist <= attackRange) {
          this.aiState = 'attack';
        } else {
          this.aiState = 'chase';
        }
      } else if (this.aiState === 'return') {
        if (distFromSpawn < 20) {
          this.aiState = 'idle';
          this.currentHP = this.maxHP; // восстановление при возврате
        }
      } else {
        // idle / wander — проверяем агро
        if (dist < AGGRO_RANGE && this.definition.type === 2) {
          this.aiState = 'chase';
        }
      }
    }

    // Передвижение по состоянию
    switch (this.aiState) {
      case 'chase':
        if (playerX !== undefined && playerY !== undefined) {
          this.moveToward(playerX, playerY, CREATURE_SPEED * 1.2, dt);
        }
        break;
      case 'attack':
        // Дальнобойные: держат дистанцию — отходят если игрок подошёл слишком близко
        if (playerX !== undefined && playerY !== undefined) {
          const weapon = WEAPONS[this.definition.weapon];
          if (!weapon.isMelee) {
            const dist2 = distance(this.x, this.y, playerX, playerY);
            const preferred = weapon.range * 0.6;
            if (dist2 < preferred * 0.7) {
              // Отходим от игрока
              this.moveAwayFrom(playerX, playerY, CREATURE_SPEED * 0.9, dt);
            }
          }
        }
        break;
      case 'return':
        this.moveToward(this.spawnX, this.spawnY, CREATURE_SPEED, dt);
        break;
      case 'idle':
        this.wanderTimer -= dt;
        if (this.wanderTimer <= 0) {
          this.wanderTimer = 2 + Math.random() * 3;
          this.wanderDirX = (Math.random() - 0.5) * 2;
          this.wanderDirY = (Math.random() - 0.5) * 2;
        }
        this.x += this.wanderDirX * CREATURE_SPEED * 0.3 * dt;
        this.y += this.wanderDirY * CREATURE_SPEED * 0.3 * dt;
        break;
    }

    // Hit flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.hitFlashTimer <= 0) this.bodySprite.setFillStyle(this.definition.color);
    }

    // HP-бар (заливка слева направо)
    const hpRatio = clamp(this.currentHP / this.maxHP, 0, 1);
    this.hpBar.width = 36 * hpRatio;
    this.hpBar.setFillStyle(hpRatio > 0.5 ? 0x44cc44 : hpRatio > 0.25 ? 0xddaa00 : 0xcc3333);
  }

  private moveAwayFrom(tx: number, ty: number, speed: number, dt: number) {
    const dx = this.x - tx;
    const dy = this.y - ty;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;
    this.x += (dx / dist) * speed * dt;
    this.y += (dy / dist) * speed * dt;
  }

  private moveToward(tx: number, ty: number, speed: number, dt: number) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) return;

    this.x += (dx / dist) * speed * dt;
    this.y += (dy / dist) * speed * dt;
  }

  takeDamage(amount: number): number {
    const actual = Math.min(this.currentHP, amount);
    this.currentHP -= actual;
    if (this.currentHP <= 0) {
      this.aiState = 'dead';
      this.setAlpha(0.3);
      this.bodySprite.setFillStyle(this.definition.color);
    } else {
      this.bodySprite.setFillStyle(0xff3333);
      this.hitFlashTimer = 0.12;
    }
    return actual;
  }
}
