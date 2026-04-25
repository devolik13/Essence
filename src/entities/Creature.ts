import Phaser from 'phaser';
import { BodyDefinition, BodyType } from '../types/bodies';
import { Stats, StatName, createDefaultStats } from '../types/stats';
import { AbilityDef } from '../types/abilities';
import { StatusEffectId, ActiveStatusEffect, STATUS_DEFS } from '../types/statuses';
import { maxHP } from '../systems/combat';
import { CREATURE_SPEED, AGGRO_RANGE, LEASH_RANGE } from '../utils/constants';
import { WEAPONS } from '../data/weapons';
import { distance } from '../utils/math';
import { clamp } from '../utils/math';
import { pushOutOfColliders } from '../systems/mapColliders';

export type CreatureAIState = 'idle' | 'wander' | 'chase' | 'attack' | 'return' | 'dead';

const CREATURE_SPRITE_MAP: Record<string, string> = {
  goblin_veteran: 'goblin',
  scout: 'ranger',
  scout_veteran: 'ranger',
  bandit_archer: 'ranger_archer',
  bandit_archer_veteran: 'ranger_archer',
  bandit_spear: 'ranger_pike',
  bandit_spear_veteran: 'ranger_pike',
};

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
  /** Кулдауны заклинаний моба (индекс соответствует npcSpells[i]) */
  public spellCooldowns: number[] = [];
  /** Таймер каста текущего заклинания (>0 = идёт каст) */
  public castTimer: number = 0;
  public castingSpell: AbilityDef | null = null;
  /** Активные статус-эффекты */
  public statusEffects: Map<StatusEffectId, ActiveStatusEffect> = new Map();
  /** Призванное существо (союзник игрока) */
  public isSummoned: boolean = false;
  /** Оставшееся время призыва (сек) */
  public summonTimer: number = 0;
  /**
   * Выбранный враг из другой фракции. Ставится GameScene каждый кадр
   * при наличии противников. Если не null — AI преследует/атакует это
   * существо вместо игрока.
   */
  public factionTarget: Creature | null = null;

  public spawnX: number;
  public spawnY: number;

  private bodySprite: Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpBarBg: Phaser.GameObjects.Rectangle;
  private statusText: Phaser.GameObjects.Text;
  private nameText: Phaser.GameObjects.Text;

  // Hit flash
  private hitFlashTimer: number = 0;

  // Animated sprite support
  private animPrefix: string | null = null;
  private facingDir: 'down' | 'up' | 'left' | 'right' = 'down';
  private animState: 'idle' | 'walk' | 'atk' | 'dying' = 'idle';

  /** Внешний callback для проверки блокировки движения стенами */
  public wallCheckFn?: (x: number, y: number) => boolean;
  /** Безопасные зоны — мобы не могут в них заходить */
  public safeBoundsArr: { x1: number; y1: number; x2: number; y2: number }[] = [];

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

    // Инициализация кулдаунов заклинаний
    if (definition.npcSpells) {
      this.spellCooldowns = new Array(definition.npcSpells.length).fill(0);
    }

    // Визуал — спрайт существа (анимированный или статический)
    const spriteId = CREATURE_SPRITE_MAP[definition.id] ?? definition.id;
    const animTestKey = `${spriteId}_idle_down`;
    if (scene.anims.exists(animTestKey)) {
      this.animPrefix = spriteId;
      const firstAnim = scene.anims.get(animTestKey);
      const sheetKey = firstAnim.frames[0]?.textureKey ?? '__DEFAULT';
      const isAnimal = sheetKey.startsWith('animal_');
      const spr = scene.add.sprite(0, 0, sheetKey, firstAnim.frames[0]?.textureFrame ?? 0);
      spr.setDisplaySize(isAnimal ? 30 : 34, isAnimal ? 30 : 34);
      spr.play(animTestKey);
      this.bodySprite = spr;
    } else {
      const textureKey = `body_${definition.id}`;
      const hasTexture = scene.textures.exists(textureKey);
      this.bodySprite = scene.add.image(0, 0, hasTexture ? textureKey : '__DEFAULT');
      this.bodySprite.setDisplaySize(24, 24);
      if (!hasTexture) this.bodySprite.setTint(definition.color);
    }
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

    // Иконки статусов под HP баром
    this.statusText = scene.add.text(0, -28, '', { fontSize: '8px', color: '#ffffff' }).setOrigin(0.5, 0.5);
    this.add(this.statusText);

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

    // Кулдауны
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    }
    for (let i = 0; i < this.spellCooldowns.length; i++) {
      if (this.spellCooldowns[i] > 0) this.spellCooldowns[i] = Math.max(0, this.spellCooldowns[i] - dt);
    }

    // Таймер каста
    if (this.castTimer > 0) {
      this.castTimer = Math.max(0, this.castTimer - dt);
    }

    // Статус-эффекты: тики и таймеры
    for (const [id, status] of this.statusEffects) {
      const def = STATUS_DEFS[id];
      // DoT урон по HP
      if (id === 'poison' && def.dotDpsPerStack) {
        this.currentHP = Math.max(0, this.currentHP - def.dotDpsPerStack * status.stacks * dt);
      } else if (id === 'burn' && def.dotPercentPerSec) {
        const dps = Math.min(this.maxHP * def.dotPercentPerSec, def.dotDpsCap ?? Infinity);
        this.currentHP = Math.max(0, this.currentHP - dps * dt);
      }
      // Декремент таймера, удаление истёкших
      status.timer -= dt;
      if (status.timer <= 0) this.statusEffects.delete(id);
    }
    if (this.currentHP <= 0 && this.aiState !== 'dead') {
      this.aiState = 'dead';
      this.setAlpha(0.3);
    }

    // AI (блокируется оглушением/сном)
    if (!this.isActionBlocked() && playerX !== undefined && playerY !== undefined) {
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
        if (dist < AGGRO_RANGE && this.definition.type === BodyType.Combat) {
          this.aiState = 'chase';
        }
        // Убегающие (Fleeing) — всегда убегают, никогда не дерутся
        if (dist < AGGRO_RANGE * 0.7 && this.definition.type === BodyType.Fleeing) {
          this.moveAwayFrom(playerX, playerY, CREATURE_SPEED * 1.5, dt);
        }
      }
    }

    // Передвижение по состоянию (с модификатором скорости от статусов)
    const speedMult = this.getSpeedMult();
    if (speedMult > 0) {
      switch (this.aiState) {
        case 'chase':
          if (playerX !== undefined && playerY !== undefined) {
            this.moveToward(playerX, playerY, CREATURE_SPEED * 1.2 * speedMult, dt);
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
                this.moveAwayFrom(playerX, playerY, CREATURE_SPEED * 0.9 * speedMult, dt);
              }
            }
          }
          break;
        case 'return':
          this.moveToward(this.spawnX, this.spawnY, CREATURE_SPEED * speedMult, dt);
          break;
        case 'idle':
          this.wanderTimer -= dt;
          if (this.wanderTimer <= 0) {
            this.wanderTimer = 2 + Math.random() * 3;
            this.wanderDirX = (Math.random() - 0.5) * 2;
            this.wanderDirY = (Math.random() - 0.5) * 2;
          }
          const wmx = this.wanderDirX * CREATURE_SPEED * 0.3 * speedMult * dt;
          const wmy = this.wanderDirY * CREATURE_SPEED * 0.3 * speedMult * dt;
          this.x += wmx;
          this.y += wmy;
          if (Math.abs(wmx) > 0.01 || Math.abs(wmy) > 0.01) this.updateFacing(wmx, wmy);
          break;
      }
    }

    // Push-out от установленных на карте непроходимых объектов
    const pushed = pushOutOfColliders(this.x, this.y, 14);
    this.x = pushed.x;
    this.y = pushed.y;

    // Мобы не заходят в сейф-зоны — выталкиваем
    for (const sb of this.safeBoundsArr) {
      const margin = 20;
      if (this.x > sb.x1 - margin && this.x < sb.x2 + margin &&
          this.y > sb.y1 - margin && this.y < sb.y2 + margin) {
        const dLeft = this.x - (sb.x1 - margin);
        const dRight = (sb.x2 + margin) - this.x;
        const dTop = this.y - (sb.y1 - margin);
        const dBottom = (sb.y2 + margin) - this.y;
        const minD = Math.min(dLeft, dRight, dTop, dBottom);
        if (minD === dLeft) this.x = sb.x1 - margin;
        else if (minD === dRight) this.x = sb.x2 + margin;
        else if (minD === dTop) this.y = sb.y1 - margin;
        else this.y = sb.y2 + margin;
      }
    }

    this.setDepth(this.y);

    // Animated sprite — update facing & animation
    if (this.animPrefix) {
      this.updateSpriteAnim();
    }

    // Hit flash
    if (this.hitFlashTimer > 0) {
      this.hitFlashTimer -= dt;
      if (this.hitFlashTimer <= 0) this.bodySprite.clearTint();
    }

    // HP-бар (заливка слева направо)
    const hpRatio = clamp(this.currentHP / this.maxHP, 0, 1);
    this.hpBar.width = 36 * hpRatio;
    this.hpBar.setFillStyle(hpRatio > 0.5 ? 0x44cc44 : hpRatio > 0.25 ? 0xddaa00 : 0xcc3333);

    // Иконки статусов
    this.updateStatusIcons();
  }

  private static STATUS_ICONS: Record<string, { icon: string; color: string }> = {
    poison:       { icon: '☠', color: '#66ff00' },
    bleed:        { icon: '🩸', color: '#ff4444' },
    burn:         { icon: '🔥', color: '#ff6600' },
    burn_mana:    { icon: '💧', color: '#6644ff' },
    slow:         { icon: '❄', color: '#88ccff' },
    root:         { icon: '⚓', color: '#cc8833' },
    stun:         { icon: '★', color: '#ffff00' },
    silence:      { icon: '✕', color: '#ff44ff' },
    chill:        { icon: '❅', color: '#aaddff' },
    freeze:       { icon: '❆', color: '#44aaff' },
    armor_reduce: { icon: '↓', color: '#aa8844' },
    armor_break:  { icon: '⇊', color: '#ff8800' },
    vulnerability:{ icon: '◇', color: '#ff6666' },
    daze:         { icon: '💫', color: '#ffcc44' },
    accuracy_reduce: { icon: '◎', color: '#ff8866' },
    acceleration: { icon: '»', color: '#ffff88' },
    bark_armor:   { icon: '🛡', color: '#886633' },
    leaf_regen:   { icon: '❤', color: '#44ff44' },
  };

  private updateStatusIcons() {
    if (this.statusEffects.size === 0) {
      this.statusText.setText('');
      return;
    }
    const parts: string[] = [];
    for (const [id, status] of this.statusEffects) {
      const info = Creature.STATUS_ICONS[id];
      if (info) {
        const stacks = status.stacks > 1 ? `${status.stacks}` : '';
        parts.push(`${info.icon}${stacks}`);
      }
    }
    this.statusText.setText(parts.join(' '));
  }

  private moveAwayFrom(tx: number, ty: number, speed: number, dt: number) {
    const dx = this.x - tx;
    const dy = this.y - ty;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;
    const mx = (dx / dist) * speed * dt;
    const my = (dy / dist) * speed * dt;
    this.x += mx;
    this.y += my;
    this.updateFacing(mx, my);
  }

  private moveToward(tx: number, ty: number, speed: number, dt: number) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 2) return;

    const mx = (dx / dist) * speed * dt;
    const my = (dy / dist) * speed * dt;
    const newX = this.x + mx;
    const newY = this.y + my;

    if (this.wallCheckFn && this.wallCheckFn(newX, newY)) return;

    this.x = newX;
    this.y = newY;
    this.updateFacing(mx, my);
  }

  private updateFacing(mx: number, my: number): void {
    if (Math.abs(mx) > Math.abs(my)) {
      this.facingDir = mx > 0 ? 'right' : 'left';
    } else {
      this.facingDir = my > 0 ? 'down' : 'up';
    }
  }

  private updateSpriteAnim(): void {
    const spr = this.bodySprite as Phaser.GameObjects.Sprite;
    let newState: 'idle' | 'walk' | 'atk' | 'dying' = 'idle';

    if (this.isDead) {
      newState = 'dying';
    } else if (this.aiState === 'attack' && this.attackCooldown <= 0) {
      newState = 'atk';
    } else if (this.aiState === 'chase' || this.aiState === 'return' || this.aiState === 'wander') {
      newState = 'walk';
    }

    const key = newState === 'dying'
      ? `${this.animPrefix}_dying`
      : `${this.animPrefix}_${newState}_${this.facingDir}`;

    if (spr.anims?.currentAnim?.key !== key && this.scene.anims.exists(key)) {
      spr.play(key);
    }
    this.animState = newState;
  }

  takeDamage(amount: number): number {
    const actual = Math.min(this.currentHP, amount);
    this.currentHP -= actual;
    // Сон снимается при получении урона
    if (actual > 0) this.statusEffects.delete('sleep');
    // Пассивные (type 1) дерутся в ответ при получении урона
    if (actual > 0 && this.definition.type === BodyType.Passive && (this.aiState === 'idle' || this.aiState === 'wander')) {
      this.aiState = 'chase';
    }
    // Убегающие (type 3) НЕ дерутся, только убегают быстрее
    // (их aiState остаётся idle/wander → они просто убегают в update)
    if (this.currentHP <= 0) {
      this.aiState = 'dead';
      this.setAlpha(0.3);
      this.bodySprite.clearTint();
    } else {
      this.bodySprite.setTint(0xff4444);
      this.hitFlashTimer = 0.12;
    }
    return actual;
  }

  // ── Статус-эффекты ─────────────────────────────────────────────────────────

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

  public applyStatus(id: StatusEffectId, stacks: number = 1): void {
    // Иммунитет к оглушению / отбрасыванию
    if (id === 'stun' && this.statusEffects.has('stun_immune')) return;
    if (id === 'knockback' && this.statusEffects.has('knockback_immune')) return;
    const def = STATUS_DEFS[id];
    if (!def || def.duration === 0) return; // Мгновенные эффекты обрабатываются снаружи
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

  /** Множитель скорости движения на основе активных статусов (0 = заблокировано) */
  private getSpeedMult(): number {
    if (this.hasStatus('stun') || this.hasStatus('sleep') || this.hasStatus('root')) return 0;
    let slow = 0;
    if (this.hasStatus('slow'))   slow = Math.max(slow, STATUS_DEFS.slow.moveSlow ?? 0);
    if (this.hasStatus('freeze')) slow = Math.max(slow, STATUS_DEFS.freeze.moveSlow ?? 0);
    return Math.max(0, 1 - slow);
  }

  /** Все действия заблокированы (оглушение/сон) */
  private isActionBlocked(): boolean {
    return this.hasStatus('stun') || this.hasStatus('sleep');
  }

  /**
   * Возвращает заклинание готовое к касту (кулдаун = 0, не идёт каст).
   * Если у заклинания есть castTime — запускает таймер и возвращает null
   * до завершения каста (GameScene должна опрашивать castingSpell когда castTimer = 0).
   * Если мгновенное — сразу возвращает spell и ставит кулдаун.
   */
  getReadySpell(): AbilityDef | null {
    const spells = this.definition.npcSpells;
    if (!spells || spells.length === 0) return null;
    if (this.castTimer > 0) return null; // идёт каст

    // Собираем готовые заклинания (кулдаун = 0)
    const ready = spells
      .map((s, i) => ({ spell: s, index: i }))
      .filter(({ index }) => this.spellCooldowns[index] <= 0);

    if (ready.length === 0) return null;

    // Случайный выбор из готовых
    const chosen = ready[Math.floor(Math.random() * ready.length)];
    let extraCD = 0;
    // Concussion: следующая абилка получает +КД, затем дебафф снимается
    if (this.statusEffects.has('concussion')) {
      const concDef = STATUS_DEFS['concussion'];
      extraCD = concDef.addCooldownToNextAbility ?? 10;
      this.statusEffects.delete('concussion');
    }
    this.spellCooldowns[chosen.index] = chosen.spell.cooldown + extraCD;

    if (chosen.spell.castTime && chosen.spell.castTime > 0) {
      // Начинаем каст — GameScene проверит castingSpell когда castTimer упадёт до 0
      this.castTimer = chosen.spell.castTime;
      this.castingSpell = chosen.spell;
      return null;
    }

    // Мгновенное заклинание — сразу к бою
    return chosen.spell;
  }

  /** Вызывается GameScene когда castTimer досчитал до 0 */
  consumeCastingSpell(): AbilityDef | null {
    const spell = this.castingSpell;
    this.castingSpell = null;
    return spell;
  }
}
