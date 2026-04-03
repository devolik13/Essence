import Phaser from 'phaser';
import { BodyDefinition } from '../types/bodies';
import { Stats, StatName } from '../types/stats';
import { AbilitySlot, createEmptySlots } from '../types/abilities';
import { StatXP, createEmptyXP } from '../systems/progression';
import { maxHP, maxMana, hpRegenPerSec, manaRegenPerSec } from '../systems/combat';
import { BODY_SPEED } from '../utils/constants';
import { WEAPONS } from '../data/weapons';
import { clamp } from '../utils/math';

/**
 * Тело — физическая оболочка, которой управляет игрок.
 * Имеет HP, Mana, оружие, слоты умений.
 */
export class Body extends Phaser.GameObjects.Container {
  public definition: BodyDefinition;
  public currentHP: number;
  public currentMana: number;
  public abilitySlots: AbilitySlot[];
  public xpTracker: StatXP;
  public isPlayerControlled: boolean = false;
  public attackCooldown: number = 0; // сек до следующей атаки

  private bodySprite: Phaser.GameObjects.Arc;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;

  private keys?: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    definition: BodyDefinition,
    private sphereStats: Stats,
  ) {
    super(scene, x, y);

    this.definition = definition;
    this.xpTracker = createEmptyXP();
    this.abilitySlots = createEmptySlots();

    // Ресурсы на макс
    this.currentHP = maxHP(sphereStats);
    this.currentMana = maxMana(sphereStats);

    // Визуал — цветной круг (пока без спрайтов)
    this.bodySprite = scene.add.arc(0, 0, 14, 0, 360, false, definition.color, 1);
    this.add(this.bodySprite);

    // HP-бар
    this.hpBarBg = scene.add.rectangle(0, -22, 32, 4, 0x333333);
    this.add(this.hpBarBg);
    this.hpBar = scene.add.rectangle(0, -22, 32, 4, 0x33cc33);
    this.add(this.hpBar);

    scene.add.existing(this);
  }

  get maxHP(): number { return maxHP(this.sphereStats); }
  get maxMana(): number { return maxMana(this.sphereStats); }
  get isDead(): boolean { return this.currentHP <= 0; }
  get weapon() { return WEAPONS[this.definition.weapon]; }

  /** Передать управление игроку */
  possess(scene: Phaser.Scene) {
    this.isPlayerControlled = true;
    if (scene.input.keyboard) {
      this.keys = {
        W: scene.input.keyboard.addKey('W'),
        A: scene.input.keyboard.addKey('A'),
        S: scene.input.keyboard.addKey('S'),
        D: scene.input.keyboard.addKey('D'),
      };
    }
  }

  /** Снять управление */
  release() {
    this.isPlayerControlled = false;
    this.keys = undefined;
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000;

    // Кулдаун атаки
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    }

    // Реген
    if (!this.isDead) {
      this.currentHP = clamp(this.currentHP + hpRegenPerSec(this.sphereStats) * dt, 0, this.maxHP);
      this.currentMana = clamp(this.currentMana + manaRegenPerSec(this.sphereStats) * dt, 0, this.maxMana);
    }

    // Движение
    if (this.isPlayerControlled && this.keys) {
      let vx = 0;
      let vy = 0;

      if (this.keys.A.isDown) vx = -1;
      if (this.keys.D.isDown) vx = 1;
      if (this.keys.W.isDown) vy = -1;
      if (this.keys.S.isDown) vy = 1;

      if (vx !== 0 && vy !== 0) {
        const norm = 1 / Math.SQRT2;
        vx *= norm;
        vy *= norm;
      }

      this.x += vx * BODY_SPEED * dt;
      this.y += vy * BODY_SPEED * dt;
    }

    // HP-бар обновление
    const hpRatio = this.currentHP / this.maxHP;
    this.hpBar.width = 32 * hpRatio;
    // Цвет: зелёный → жёлтый → красный
    if (hpRatio > 0.5) {
      this.hpBar.setFillStyle(0x33cc33);
    } else if (hpRatio > 0.25) {
      this.hpBar.setFillStyle(0xcccc33);
    } else {
      this.hpBar.setFillStyle(0xcc3333);
    }
  }

  takeDamage(amount: number): number {
    const actual = Math.min(this.currentHP, amount);
    this.currentHP -= actual;
    return actual;
  }
}
