import Phaser from 'phaser';
import { BodyDefinition } from '../types/bodies';
import { Stats, StatName } from '../types/stats';
import { AbilitySlot, createEmptySlots } from '../types/abilities';
import { StatusEffectId, ActiveStatusEffect, STATUS_DEFS } from '../types/statuses';
import { maxHP, maxMana, hpRegenPerSec, manaRegenPerSec } from '../systems/combat';
import { BODY_SPEED } from '../utils/constants';
import { WEAPONS, STRENGTH_WEAPONS, AGILITY_WEAPONS, getItemWeaponType } from '../data/weapons';
import { clamp } from '../utils/math';
import { pushOutOfColliders } from '../systems/mapColliders';
import { creatureSpriteId, creatureBaseSize } from './Creature';
import { WeaponType } from '../types/bodies';

type AnimType = 'idle' | 'walk' | 'atk';
type AnimDir  = 'up' | 'down' | 'left' | 'right';
type AnimCfg = { idle: (d: string) => string; walk: (d: string) => string; atk: (d: string) => string; displaySize: number };

/** Canonical animation key: `{prefix}_{type}_{dir}` */
function makeAnimKey(prefix: string, type: AnimType, dir: AnimDir | string): string {
  return `${prefix}_${type}_${dir}`;
}

/** Build AnimCfg for a sprite sheet body, with graceful fallback to idle when walk/atk missing */
function makeAnimCfg(scene: Phaser.Scene, id: string, displaySize: number): AnimCfg {
  return {
    idle: (d)  => makeAnimKey(id, 'idle', d),
    walk: (d)  => scene.anims.exists(makeAnimKey(id, 'walk', d)) ? makeAnimKey(id, 'walk', d) : makeAnimKey(id, 'idle', d),
    atk:  (d)  => scene.anims.exists(makeAnimKey(id, 'atk',  d)) ? makeAnimKey(id, 'atk',  d) : makeAnimKey(id, 'idle', d),
    displaySize,
  };
}

const SWORDSMAN_ANIM: AnimCfg = { idle: (d) => `swordsman_idle_${d}`, walk: (d) => `swordsman_walk_${d}`, atk: (d) => `swordsman_atk_${d}`, displaySize: 48 };
const ARCHER_ANIM: AnimCfg    = { idle: (d) => `archer_idle_${d}`,    walk: (d) => `archer_walk_${d}`,    atk: (d) => `archer_atk_${d}`,    displaySize: 48 };
const WIZARD_ANIM: AnimCfg    = { idle: (d) => `wizard_idle_${d}`,    walk: (d) => `wizard_walk_${d}`,    atk: (d) => `wizard_atk_${d}`,    displaySize: 48 };

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
  /** Двигался ли в этом кадре (WASD/клик) — для прерывания захвата тела. */
  public isMoving: boolean = false;
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
  /** Click-to-move destination. Cleared when target is reached or WASD is pressed. */
  private clickMoveTarget: { x: number; y: number } | null = null;

  setClickMoveTarget(x: number, y: number): void {
    this.clickMoveTarget = { x, y };
  }
  /** Resolved animation config (humanoid, animal, or null for static) */
  private resolvedAnim: AnimCfg | null = null;

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

    let animCfg = getAnimConfig(definition);

    if (!animCfg) {
      // Тот же резолв спрайта и размер, что и у NPC-существа (Creature), плюс
      // displaySizeMultiplier — иначе медведь «уменьшался» при захвате (30 vs 41).
      const spriteId = creatureSpriteId(definition.id);
      const idleKey = makeAnimKey(spriteId, 'idle', 'down');
      if (scene.anims.exists(idleKey)) {
        const sheetKey = scene.anims.get(idleKey).frames[0]?.textureKey ?? '';
        const size = creatureBaseSize(spriteId, sheetKey) * (definition.displaySizeMultiplier ?? 1);
        animCfg = makeAnimCfg(scene, spriteId, size);
      }
    }
    this.resolvedAnim = animCfg ?? null;

    if (animCfg) {
      const startAnim = animCfg.idle('down');
      this.bodySprite = scene.add.sprite(0, 0, startAnim);
      this.bodySprite.play(startAnim);
      this.bodySprite.setDisplaySize(animCfg.displaySize, animCfg.displaySize);
      this.bodySprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.isAttackPlaying = false;
        this.playAnim('idle');
      });
    } else {
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

  /** Временные HP (щит от Стойкого удара) */
  public tempHP: number = 0;
  public tempHPTimer: number = 0;

  /** Иммунитет к дебаффам (сек оставшихся, от Очищающего удара) */
  public debuffImmunity: number = 0;

  get maxHP(): number { return maxHP(this.sphereStats); }
  get maxMana(): number { return maxMana(this.sphereStats); }

  /**
   * Пересчёт статов тела при смене экипировки.
   * Принимает «экипировочные» статы (личные + бонусы предметов, БЕЗ статус-баффов).
   * Текущие HP/мана не масштабируются — просто клампятся к новому максимуму
   * (надел +ману → кап вырос, добиваешь регеном; снял → излишек срезается).
   */
  public refreshStats(newStats: Stats): void {
    this.sphereStats = newStats;
    this.currentHP = Math.min(this.currentHP, this.maxHP);
    this.currentMana = Math.min(this.currentMana, this.maxMana);
  }
  get isDead(): boolean { return this.currentHP <= 0; }
  get weapon() {
    // Гуманоид: оружие из активного слота Сферы. Если оружия НЕТ — кулаки/когти
    // (Fists, ближний, урон от макс-стата), а НЕ врождённое оружие тела (иначе
    // безоружная лучница «стреляла» бы луком). Зверь/элементаль — природное.
    if (this.definition.canUseAllSpells) {
      const id = this.equippedWeaponId();
      if (id) {
        const wt = getItemWeaponType(id);
        if (wt) return WEAPONS[wt];
      }
      return WEAPONS[WeaponType.Fists]; // безоружный гуманоид — когти/кулаки
    }
    return WEAPONS[this.definition.weapon];
  }

  /** id оружия в активном слоте Сферы (или undefined, если не надето). */
  private equippedWeaponId(): string | undefined {
    const sphere = (this.scene as unknown as { sphere?: { equipment?: { weapon?: string; weapon2?: string }; activeWeaponSlot?: number } }).sphere;
    if (!sphere?.equipment) return undefined;
    const slot = sphere.activeWeaponSlot ?? 0;
    return slot === 0 ? sphere.equipment.weapon : sphere.equipment.weapon2;
  }

  /** Бьёт «когтями» (нет выбранного оружия): зверь/элементаль ИЛИ безоружный
   *  гуманоид. В обоих случаях урон масштабируется от макс-стата. */
  get usesInnateAttack(): boolean {
    if (!this.definition.canUseAllSpells) return true;
    return !this.equippedWeaponId();
  }

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
    if (!this.resolvedAnim) return;
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
    if (!this.resolvedAnim || this.isAttackPlaying) return;
    // Skip if no real attack anim (key falls back to idle) — avoids isAttackPlaying stuck forever
    const atkKey = this.resolvedAnim.atk(this.facingDir);
    const idleKey = this.resolvedAnim.idle(this.facingDir);
    if (atkKey === idleKey) return;
    this.isAttackPlaying = true;
    this.playAnim('atk');
  }

  private playAnim(type: 'idle' | 'walk' | 'atk') {
    const animCfg = this.resolvedAnim;
    if (!animCfg) return;

    const nativeFn = type === 'atk' ? animCfg.atk
                   : type === 'walk' ? animCfg.walk
                   : animCfg.idle;
    const nativeKey = nativeFn(this.facingDir);
    let key = nativeKey;
    let flip = false;
    // For left direction, mirror right when:
    //  - left animation doesn't exist (front-only sheets), or
    //  - left and right animations share the same texture (iso 3-direction sheets).
    if (this.facingDir === 'left') {
      const scene = this.bodySprite.scene;
      const rightKey = nativeFn('right');
      const leftAnim  = scene.anims.get(nativeKey);
      const rightAnim = scene.anims.get(rightKey);
      const sameTexture = !!leftAnim && !!rightAnim &&
        leftAnim.frames[0]?.textureKey === rightAnim.frames[0]?.textureKey;
      if (!scene.anims.exists(nativeKey) || sameTexture) {
        key = rightKey;
        flip = true;
      }
    }
    this.bodySprite.setFlipX(flip);

    if (this.bodySprite.anims.currentAnim?.key !== key || type === 'atk') {
      this.bodySprite.play(key, type !== 'atk');
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

    // Cooldowns are stored per ability id on the Sphere so they persist across
    // weapon swaps (slot index alone would lose the CD when the slot's ability
    // changes). Slot.cooldownRemaining mirrors the map for the active ability.
    const sphere = (this.scene as unknown as { sphere?: { abilityCooldowns?: Record<string, number> } }).sphere;
    const cdMap = sphere?.abilityCooldowns;
    if (cdMap) {
      // Tick the entire map — same dt applied to slot.cooldownRemaining
      for (const id in cdMap) {
        if (cdMap[id] > 0) cdMap[id] = Math.max(0, cdMap[id] - dt);
      }
      // Mirror current slots from the map (also drives the visual CD swirl)
      for (const slot of this.abilitySlots) {
        slot.cooldownRemaining = slot.ability ? (cdMap[slot.ability.id] ?? 0) : 0;
      }
    } else {
      for (const slot of this.abilitySlots) {
        if (slot.cooldownRemaining > 0) {
          slot.cooldownRemaining = Math.max(0, slot.cooldownRemaining - dt);
        }
      }
    }

    // Таймер временных HP
    if (this.tempHP > 0) {
      this.tempHPTimer -= dt;
      if (this.tempHPTimer <= 0) this.tempHP = 0;
    }

    // Таймер иммунитета к дебаффам
    if (this.debuffImmunity > 0) {
      this.debuffImmunity -= dt;
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

      // WASD overrides click-to-move
      const hasWasd = vx !== 0 || vy !== 0;
      if (hasWasd) {
        this.clickMoveTarget = null;
        if (vx !== 0 && vy !== 0) {
          const norm = 1 / Math.SQRT2;
          vx *= norm;
          vy *= norm;
        }
      } else if (this.clickMoveTarget) {
        const dx = this.clickMoveTarget.x - this.x;
        const dy = this.clickMoveTarget.y - this.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 8) {
          this.clickMoveTarget = null;
        } else {
          vx = dx / dist;
          vy = dy / dist;
        }
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

    // Обновление направления по движению (для всех тел).
    // Compare absolute components so click-to-move with continuous vx/vy
    // doesn't always pick up/down whenever there's any vertical bias.
    const moving = vx !== 0 || vy !== 0;
    this.isMoving = moving; // для прерывания захвата тела при движении
    if (moving) {
      if (Math.abs(vx) > Math.abs(vy)) this.facingDir = vx > 0 ? 'right' : 'left';
      else                              this.facingDir = vy > 0 ? 'down'  : 'up';
    }

    // Обновление анимации тела (humanoid + animals со спрайтшитом)
    if (this.resolvedAnim && !this.isAttackPlaying) {
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
    if (this.debuffImmunity > 0) return;
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
