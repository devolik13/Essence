import Phaser from 'phaser';
import { BodyDefinition } from '../types/bodies';
import { Stats, StatName } from '../types/stats';
import { AbilitySlot, createEmptySlots } from '../types/abilities';
import { StatusEffectId, ActiveStatusEffect, STATUS_DEFS } from '../types/statuses';
import { maxHP, maxMana, hpRegenPerSec, manaRegenPerSec } from '../systems/combat';
import { BODY_SPEED } from '../utils/constants';
import { WEAPONS, STRENGTH_WEAPONS, AGILITY_WEAPONS } from '../data/weapons';
import { clamp } from '../utils/math';
import { pushOutOfColliders } from '../systems/mapColliders';
import { WeaponType } from '../types/bodies';

type AnimCfg = { idle: (d: string) => string; walk: (d: string) => string; atk: (d: string) => string; displaySize: number };

const SWORDSMAN_ANIM: AnimCfg = { idle: () => 'swordsman_idle_down', walk: () => 'swordsman_walk_down', atk: () => 'swordsman_atk_down', displaySize: 48 };
const ARCHER_ANIM: AnimCfg    = { idle: () => 'archer_idle_down',    walk: () => 'archer_walk_down',    atk: () => 'archer_atk_down',    displaySize: 48 };
const WIZARD_ANIM: AnimCfg    = { idle: () => 'wizard_idle_down',    walk: () => 'wizard_walk_down',    atk: () => 'wizard_atk_down',    displaySize: 48 };

const ANIMATED_BODIES: Record<string, AnimCfg> = {
  human_warrior: SWORDSMAN_ANIM,
  human_archer:  ARCHER_ANIM,
  human_mage:    WIZARD_ANIM,
};

function getAnimConfig(def: { id: string; weapon?: WeaponType }): AnimCfg | undefined {
  if (ANIMATED_BODIES[def.id]) return ANIMATED_BODIES[def.id];
  if (!def.id.startsWith('starter_') || !def.weapon) return undefined;
  if (STRENGTH_WEAPONS.includes(def.weapon)) return SWORDSMAN_ANIM;
  if (AGILITY_WEAPONS.includes(def.weapon)) return ARCHER_ANIM;
  return WIZARD_ANIM;
}

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
  /** Активные статус-эффекты игрока */
  public statusEffects: Map<StatusEffectId, ActiveStatusEffect> = new Map();
  /** Штраф регена маны от зачарования (0.3 = −30%) */
  public enchantRegenPenalty: number = 0;
  /** Внешний callback для проверки блокировки стенами */
  public wallCheckFn?: (x: number, y: number) => boolean;
  public mapW = 3840;
  public mapH = 3200;

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

    const animCfg = getAnimConfig(definition);

    if (animCfg) {
      // Анимированный спрайт
      const startAnim = animCfg.idle('down');
      this.bodySprite = scene.add.sprite(0, 0, startAnim);
      this.bodySprite.setDisplaySize(animCfg.displaySize, animCfg.displaySize);
      this.bodySprite.play(startAnim);
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

  /** Бонус к Armor от статусов (процентные + плоские, не стакаются кроме fortify) */
  get armorBonus(): number {
    const baseArmor = this.sphereStats[StatName.Armor] ?? 0;
    let flatBonus = 0;
    let percentBonus = 0;

    // Fortify (от оружия) — стакается отдельно
    const fortify = this.statusEffects.get('fortify');
    if (fortify) {
      const def = STATUS_DEFS['fortify'];
      percentBonus += (def.armorBonusPercent ?? 0) * fortify.stacks;
    }

    // Заклинания брони — НЕ стакаются, берём максимальный
    // (bark_armor, shield_stance, armor_group_buff)
    const armorSpells: StatusEffectId[] = ['bark_armor', 'shield_stance', 'armor_group_buff'];
    let bestSpellPercent = 0;
    for (const spellId of armorSpells) {
      if (this.statusEffects.has(spellId)) {
        const def = STATUS_DEFS[spellId];
        bestSpellPercent = Math.max(bestSpellPercent, def.armorBonusPercent ?? 0);
      }
    }
    percentBonus += bestSpellPercent;

    // Плоские бонусы от экипировки и прочего
    for (const [id, status] of this.statusEffects) {
      const def = STATUS_DEFS[id];
      if (def.armorBonus && !['fortify', 'bark_armor', 'shield_stance', 'armor_group_buff'].includes(id)) {
        flatBonus += def.armorBonus * status.stacks;
      }
    }

    return Math.round(baseArmor * percentBonus) + flatBonus;
  }

  /** Бонус к Evasion от статусов (evasion_boost) */
  get evasionBonus(): number {
    let bonus = 0;
    for (const [id, status] of this.statusEffects) {
      const def = STATUS_DEFS[id];
      if (def.evasionBonus) bonus += def.evasionBonus * status.stacks;
    }
    return bonus;
  }

  /** Временные HP (щит от Стойкого удара) */
  public tempHP: number = 0;
  public tempHPTimer: number = 0;

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

  /** Вектор направления взгляда (для рывка вперёд) */
  getFacingVector(): { x: number; y: number } {
    switch (this.facingDir) {
      case 'right': return { x: 1,  y: 0 };
      case 'left':  return { x: -1, y: 0 };
      case 'up':    return { x: 0,  y: -1 };
      default:      return { x: 0,  y: 1 };  // down
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
    const animCfg = getAnimConfig(this.definition);
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
    this.setDepth(this.y);

    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    }

    // Статус-эффекты: тики и таймеры
    for (const [id, status] of this.statusEffects) {
      const def = STATUS_DEFS[id];
      if (id === 'poison' && def.dotDpsPerStack) {
        this.currentHP = Math.max(0, this.currentHP - def.dotDpsPerStack * status.stacks * dt);
      } else if (id === 'burn' && def.dotPercentPerSec) {
        const dps = Math.min(this.maxHP * def.dotPercentPerSec, def.dotDpsCap ?? Infinity);
        this.currentHP = Math.max(0, this.currentHP - dps * dt);
      } else if (id === 'burn_mana' && def.dotPercentPerSec) {
        const dps = Math.min(this.maxMana * def.dotPercentPerSec, def.dotDpsCap ?? Infinity);
        this.currentMana = Math.max(0, this.currentMana - dps * dt);
      }
      status.timer -= dt;
      if (status.timer <= 0) this.statusEffects.delete(id);
    }

    for (const slot of this.abilitySlots) {
      if (slot.cooldownRemaining > 0) {
        slot.cooldownRemaining = Math.max(0, slot.cooldownRemaining - dt);
      }
    }

    // Таймер временных HP
    if (this.tempHP > 0) {
      this.tempHPTimer -= dt;
      if (this.tempHPTimer <= 0) this.tempHP = 0;
    }

    // Таймер иммунитета к дебаффам
    if ((this as any)._debuffImmunity > 0) {
      (this as any)._debuffImmunity -= dt;
    }

    if (!this.isDead) {
      // Реген HP (с учётом кровотечения и бафа регена)
      const healMult = this.hasStatus('bleed') ? (1 - (STATUS_DEFS.bleed.healReduction ?? 0)) : 1;
      const hpRegenBonus = this.hasStatus('hp_regen_boost') ? (1 + (STATUS_DEFS.hp_regen_boost.regenHpBonus ?? 0)) : 1;
      this.currentHP = clamp(this.currentHP + hpRegenPerSec(this.sphereStats) * healMult * hpRegenBonus * dt, 0, this.maxHP);
      // Реген маны (с учётом блока и бафа)
      let manaRegenMult = 1 - this.enchantRegenPenalty; // enchant: −30%
      if (this.hasStatus('mana_regen_block')) manaRegenMult += STATUS_DEFS.mana_regen_block.regenManaBonus ?? 0;
      if (this.hasStatus('mana_regen_boost')) manaRegenMult += STATUS_DEFS.mana_regen_boost.regenManaBonus ?? 0;
      this.currentMana = clamp(this.currentMana + manaRegenPerSec(this.sphereStats) * Math.max(0, manaRegenMult) * dt, 0, this.maxMana);

      // Подпитка: +3 HP/сек за каждый бафф
      if (this.hasStatus('regen_per_buff')) {
        const buffList = ['acceleration', 'inspiration', 'bark_armor', 'leaf_regen', 'fortify',
          'evasion_boost', 'block_next', 'shield_stance', 'hp_regen_boost',
          'mana_regen_boost', 'stun_immune', 'knockback_immune',
          'regen_per_buff', 'regen_per_debuff', 'ranged_resist', 'focus', 'damage_boost'];
        const buffCount = [...this.statusEffects.keys()].filter(id => buffList.includes(id)).length;
        const regen = (STATUS_DEFS.regen_per_buff.regenPerBuff ?? 3) * buffCount;
        this.currentHP = clamp(this.currentHP + regen * dt, 0, this.maxHP);
      }
      // Стойкость духа: +3 HP/сек за каждый дебафф
      if (this.hasStatus('regen_per_debuff')) {
        const buffList = ['acceleration', 'inspiration', 'bark_armor', 'leaf_regen', 'fortify',
          'evasion_boost', 'block_next', 'shield_stance', 'hp_regen_boost',
          'mana_regen_boost', 'stun_immune', 'knockback_immune',
          'regen_per_buff', 'regen_per_debuff', 'ranged_resist', 'focus', 'damage_boost'];
        const debuffCount = [...this.statusEffects.keys()].filter(id => !buffList.includes(id)).length;
        const regen = (STATUS_DEFS.regen_per_debuff.regenPerDebuff ?? 3) * debuffCount;
        this.currentHP = clamp(this.currentHP + regen * dt, 0, this.maxHP);
      }
    }

    let vx = 0;
    let vy = 0;

    const movementBlocked = this.hasStatus('stun') || this.hasStatus('sleep') || this.hasStatus('root');
    // Все касты можно делать в движении — isCasting НЕ блокирует WASD
    if (this.isPlayerControlled && this.keys && !movementBlocked) {
      if (this.keys.A.isDown) vx = -1;
      if (this.keys.D.isDown) vx = 1;
      if (this.keys.W.isDown) vy = -1;
      if (this.keys.S.isDown) vy = 1;

      if (vx !== 0 && vy !== 0) {
        const norm = 1 / Math.SQRT2;
        vx *= norm;
        vy *= norm;
      }

      const speedMult = this.getSpeedMult();
      const newX = Math.max(16, Math.min(this.mapW - 16, this.x + vx * BODY_SPEED * speedMult * dt));
      const newY = Math.max(16, Math.min(this.mapH - 16, this.y + vy * BODY_SPEED * speedMult * dt));
      if (!(this.wallCheckFn && this.wallCheckFn(newX, newY))) {
        const pushed = pushOutOfColliders(newX, newY, 16);
        this.x = pushed.x;
        this.y = pushed.y;
      }
    }

    // Обновление направления по движению (для всех тел)
    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      if      (vy > 0)  this.facingDir = 'down';
      else if (vy < 0)  this.facingDir = 'up';
      else if (vx < 0)  this.facingDir = 'left';
      else if (vx > 0)  this.facingDir = 'right';
    }

    // Обновление анимации воина
    if (ANIMATED_BODIES[this.definition.id] && !this.isAttackPlaying) {
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

  /** Проверяет и потребляет 1 стак блока (только melee/ranged). true = атака заблокирована */
  public tryBlock(): boolean {
    const block = this.statusEffects.get('block_next');
    if (block) {
      block.stacks -= 1;
      if (block.stacks <= 0) this.statusEffects.delete('block_next');
      return true;
    }
    return false;
  }

  takeDamage(amount: number): number {
    let remaining = amount;
    // Сначала поглощается временными HP
    if (this.tempHP > 0) {
      const absorbed = Math.min(this.tempHP, remaining);
      this.tempHP -= absorbed;
      remaining -= absorbed;
    }
    const actual = Math.min(this.currentHP, remaining);
    this.currentHP -= actual;
    // Сон снимается при получении урона
    if (amount > 0) this.statusEffects.delete('sleep');
    this.bodySprite.setTint(0xff4444);
    this.hitFlashTimer = 0.15;
    return actual;
  }

  // ── Статус-эффекты ─────────────────────────────────────────────────────────

  public applyStatus(id: StatusEffectId, stacks: number = 1): void {
    // Иммунитет к дебаффам (от Очищающего удара)
    if ((this as any)._debuffImmunity > 0) return;
    // Иммунитет к оглушению
    if (id === 'stun' && this.hasStatus('stun_immune')) return;
    // Иммунитет к отбрасыванию
    if (id === 'knockback' && this.hasStatus('knockback_immune')) return;
    const def = STATUS_DEFS[id];
    if (!def || def.duration === 0) return;
    const existing = this.statusEffects.get(id);
    if (existing) {
      existing.timer = def.duration;
      existing.stacks = Math.min(existing.stacks + stacks, def.maxStacks);
    } else {
      this.statusEffects.set(id, { id, stacks: Math.min(stacks, def.maxStacks), timer: def.duration });
    }
  }

  public hasStatus(id: StatusEffectId): boolean {
    return this.statusEffects.has(id);
  }

  public clearStatus(id: StatusEffectId): void {
    this.statusEffects.delete(id);
  }

  private getSpeedMult(): number {
    if (this.hasStatus('acceleration')) return 1 + Math.abs(STATUS_DEFS.acceleration.moveSlow ?? 0.5);
    let slow = 0;
    if (this.hasStatus('slow'))   slow = Math.max(slow, STATUS_DEFS.slow.moveSlow ?? 0);
    if (this.hasStatus('freeze')) slow = Math.max(slow, STATUS_DEFS.freeze.moveSlow ?? 0);
    return Math.max(0, 1 - slow);
  }
}
