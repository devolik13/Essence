import Phaser from 'phaser';
import { BodyDefinition } from '../types/bodies';
import { Stats, StatName, createDefaultStats } from '../types/stats';
import { maxHP } from '../systems/combat';
import { CREATURE_SPEED, AGGRO_RANGE, LEASH_RANGE } from '../utils/constants';
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

  // Wander
  private wanderTimer: number = 0;
  private wanderDirX: number = 0;
  private wanderDirY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, definition: BodyDefinition) {
    super(scene, x, y);

    this.definition = definition;
    this.spawnX = x;
    this.spawnY = y;

    // Статы моба = его капы (или дефолт 1 где нет капа)
    this.stats = createDefaultStats();
    for (const [stat, cap] of Object.entries(definition.caps)) {
      this.stats[stat as StatName] = cap as number;
    }

    this.currentHP = maxHP(this.stats);

    // Визуал
    this.bodySprite = scene.add.arc(0, 0, 12, 0, 360, false, definition.color, 1);
    this.add(this.bodySprite);

    // HP-бар
    this.hpBarBg = scene.add.rectangle(0, -20, 28, 3, 0x333333);
    this.add(this.hpBarBg);
    this.hpBar = scene.add.rectangle(0, -20, 28, 3, 0xcc3333);
    this.add(this.hpBar);

    // Имя
    this.nameText = scene.add.text(0, -28, definition.nameRu, {
      fontSize: '10px',
      color: '#cccccc',
      align: 'center',
    }).setOrigin(0.5);
    this.add(this.nameText);

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

      if (this.aiState === 'chase' || this.aiState === 'attack') {
        // Поводок — слишком далеко от спавна
        if (distFromSpawn > LEASH_RANGE) {
          this.aiState = 'return';
        } else if (dist < 40) {
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

    // HP-бар
    const hpRatio = this.currentHP / this.maxHP;
    this.hpBar.width = 28 * hpRatio;
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
    }
    return actual;
  }
}
