import Phaser from 'phaser';
import { BodyDefinition } from '../types/bodies';
import { Stats, StatName } from '../types/stats';
import { AbilitySlot, createEmptySlots } from '../types/abilities';
import { maxHP, maxMana, hpRegenPerSec, manaRegenPerSec } from '../systems/combat';
import { BODY_SPEED, MAP_WIDTH, MAP_HEIGHT } from '../utils/constants';
import { WEAPONS } from '../data/weapons';
import { clamp } from '../utils/math';

/** Тела с поддержкой анимированных спрайтов */
const ANIMATED_BODIES: Record<string, {
  idle: (dir: string) => string;
  walk: (dir: string) => string;
  atk:  (dir: string) => string;
  displaySize: number;
}> = {
  human_warrior: {
    idle: dir => `warrior_idle_${dir}`,
    walk: dir => `warrior_walk_${dir}`,
    atk:  dir => `warrior_atk_${dir}`,
    displaySize: 80,
  },
};

/**
 * Тело — физическая оболочка, которой управляет игрок.
 * Имеет HP, Mana, оружие, слоты умений.
 */
export class Body extends Phaser.GameObjects.Container {
  public definition: BodyDefinition;
  public currentHP: number;
  public currentMana: number;
  public abilitySlots: AbilitySlot[];
  public isPlayerControlled: boolean = false;
  public isCasting: boolean = false;
  public attackCooldown: number = 0;
  /** Оставшееся время рывка (сек); > 0 → скорость ×1.5 */
  public dashTimer: number = 0;

  private bodySprite: Phaser.GameObjects.Sprite;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private hitFlashTimer: number = 0;

  /** Текущее направление для анимации */
  private facingDir: 'down' | 'right' | 'up' | 'left' = 'down';
  /** Флаг воспроизведения атаки */
  private isAttackPlaying: boolean = false;

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
    this.abilitySlots = createEmptySlots();

    this.currentHP = maxHP(sphereStats);
    this.currentMana = maxMana(sphereStats);

    const animCfg = ANIMATED_BODIES[definition.id];

    if (animCfg) {
      // Анимированный спрайт
      this.bodySprite = scene.add.sprite(0, 0, `warrior_idle_down`);
      this.bodySprite.setDisplaySize(animCfg.displaySize, animCfg.displaySize);
      this.bodySprite.play('warrior_idle_down');
      // По завершении атаки — вернуться в idle
      this.bodySprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.isAttackPlaying = false;
        this.playAnim('idle');
      });
    } else {
      // Статичный сгенерированный спрайт
      const textureKey = `body_${definition.id}`;
      const hasTexture = scene.textures.exists(textureKey);
      this.bodySprite = scene.add.sprite(0, 0, hasTexture ? textureKey : '__DEFAULT');
      if (!hasTexture) this.bodySprite.setTint(definition.color);
    }

    this.add(this.bodySprite);

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

  release() {
    this.isPlayerControlled = false;
    this.keys = undefined;
  }

  /**
   * Повернуть спрайт к цели по координатам.
   * Определяет направление (down/up/left/right) по углу к цели.
   */
  faceToward(tx: number, ty: number) {
    if (!ANIMATED_BODIES[this.definition.id]) return;
    const dx = tx - this.x;
    const dy = ty - this.y;
    // Вертикальная ось важнее если угол крутой (> 45°)
    if (Math.abs(dy) >= Math.abs(dx)) {
      this.facingDir = dy >= 0 ? 'down' : 'up';
    } else {
      this.facingDir = dx >= 0 ? 'right' : 'left';
    }
  }

  /** Запустить анимацию атаки (вызывается из GameScene при ударе) */
  playAttackAnim() {
    const animCfg = ANIMATED_BODIES[this.definition.id];
    if (!animCfg || this.isAttackPlaying) return;
    this.isAttackPlaying = true;
    this.playAnim('atk');
  }

  private playAnim(type: 'idle' | 'walk' | 'atk') {
    const animCfg = ANIMATED_BODIES[this.definition.id];
    if (!animCfg) return;

    // Для left — зеркалим right
    const dir = this.facingDir === 'left' ? 'right' : this.facingDir;
    this.bodySprite.setFlipX(this.facingDir === 'left');

    const key = type === 'atk' ? animCfg.atk(dir)
              : type === 'walk' ? animCfg.walk(dir)
              : animCfg.idle(dir);

    if (this.bodySprite.anims.currentAnim?.key !== key || type === 'atk') {
      this.bodySprite.play(key, type !== 'atk'); // ignoreIfPlaying для idle/walk
    }
  }

  update(_time: number, delta: number) {
    const dt = delta / 1000;

    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    }
    if (this.dashTimer > 0) {
      this.dashTimer = Math.max(0, this.dashTimer - dt);
    }

    for (const slot of this.abilitySlots) {
      if (slot.cooldownRemaining > 0) {
        slot.cooldownRemaining = Math.max(0, slot.cooldownRemaining - dt);
      }
    }

    if (!this.isDead) {
      this.currentHP = clamp(this.currentHP + hpRegenPerSec(this.sphereStats) * dt, 0, this.maxHP);
      this.currentMana = clamp(this.currentMana + manaRegenPerSec(this.sphereStats) * dt, 0, this.maxMana);
    }

    let vx = 0;
    let vy = 0;

    if (this.isPlayerControlled && this.keys && !this.isCasting) {
      if (this.keys.A.isDown) vx = -1;
      if (this.keys.D.isDown) vx = 1;
      if (this.keys.W.isDown) vy = -1;
      if (this.keys.S.isDown) vy = 1;

      if (vx !== 0 && vy !== 0) {
        const norm = 1 / Math.SQRT2;
        vx *= norm;
        vy *= norm;
      }

      const speedMult = this.dashTimer > 0 ? 1.5 : 1.0;
      this.x = Math.max(16, Math.min(MAP_WIDTH  - 16, this.x + vx * BODY_SPEED * speedMult * dt));
      this.y = Math.max(16, Math.min(MAP_HEIGHT - 16, this.y + vy * BODY_SPEED * speedMult * dt));
    }

    // Обновление анимации воина
    if (ANIMATED_BODIES[this.definition.id] && !this.isAttackPlaying) {
      const moving = vx !== 0 || vy !== 0;
      // Определяем направление по движению
      if (moving) {
        if      (vy > 0)  this.facingDir = 'down';
        else if (vy < 0)  this.facingDir = 'up';
        else if (vx < 0)  this.facingDir = 'left';
        else if (vx > 0)  this.facingDir = 'right';
      }
      this.playAnim(moving ? 'walk' : 'idle');
    }

    // Hit flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.hitFlashTimer <= 0) this.bodySprite.clearTint();
    }

    // HP-бар
    const hpRatio = this.currentHP / this.maxHP;
    this.hpBar.width = 32 * hpRatio;
    if (hpRatio > 0.5)       this.hpBar.setFillStyle(0x33cc33);
    else if (hpRatio > 0.25) this.hpBar.setFillStyle(0xcccc33);
    else                     this.hpBar.setFillStyle(0xcc3333);
  }

  takeDamage(amount: number): number {
    const actual = Math.min(this.currentHP, amount);
    this.currentHP -= actual;
    this.bodySprite.setTint(0xff4444);
    this.hitFlashTimer = 0.15;
    return actual;
  }
}
