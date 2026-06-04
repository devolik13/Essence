import Phaser from 'phaser';
import { Creature } from './Creature';
import { CREATURE_DB } from '../data/creatureDB';

/** Caravan lifecycle phases. */
type CaravanPhase = 'WAIT_START' | 'TRAVEL' | 'WAIT_END';

// ── Cycle timings (seconds) ─────────────────────────────────────────────────
const WAIT_START_SEC = 120; // idle at A (departure window for the player)
const WAIT_END_SEC = 30;    // idle at B before full respawn back at A

// ── Raider camp + roster ────────────────────────────────────────────────────
const RAIDER_CAMP_X = 5550;
const RAIDER_CAMP_Y = 2350;
/** Full raider roster spawned at the camp every cycle. */
const RAIDER_ROSTER: string[] = [
  'bandit_spear', 'bandit_spear', 'bandit_spear',
  'bandit_archer', 'bandit_archer',
  'bandit_brute',
  'bandit_crossbow',
  // По одному ветерану-рейдеру (чтобы их квесты были достижимы в событии).
  'bandit_archer_veteran',
  'bandit_brute_veteran',
  'bandit_crossbow_veteran',
];

// ── Cart-vs-raider damage (once all escort dead) ────────────────────────────
const CART_DAMAGE_RADIUS = 50;   // raider must be within this of cart to damage it
const CART_DAMAGE_RATE = 12;     // hp/sec dealt by each adjacent raider

/**
 * A looping caravan event: animated cart + escort (merchant + guards) that
 * travels from A (Waldmar) to B (Eshworth) past a raider camp, then waits and
 * respawns the entire roster, forever.
 *
 * State machine:
 *   WAIT_START — cart idle at A for {@link WAIT_START_SEC}s. Player may possess
 *                an escort/raider body during this window.
 *   TRAVEL     — cart moves A→B. Escort follows in formation; movement pauses
 *                while any escort is fighting (faction war with raiders). The
 *                raider camp ambushes naturally via faction-sight as the cart
 *                passes. The cart is invulnerable until ALL escort are dead;
 *                after that, adjacent raiders chip the cart down.
 *   WAIT_END   — reached B (or cart destroyed) → idle {@link WAIT_END_SEC}s,
 *                then despawn ALL escort + raiders, reset cart to A at full HP,
 *                spawn a fresh full roster, and loop back to WAIT_START.
 *
 * The player's body is a separate `Body`, never one of these Creatures, so
 * despawning escort/raiders never removes the player ("only the player stays").
 */
export class Caravan {
  public x: number;
  public y: number;
  public hp = 200;
  public readonly maxHp = 200;
  /** Permanently destroyed (zone change / scene teardown). Not used by the loop. */
  public destroyed = false;

  private phase: CaravanPhase = 'WAIT_START';
  private phaseTimer = 0; // seconds elapsed in current timed phase

  private sprite: Phaser.GameObjects.Sprite;
  private hpBar?: Phaser.GameObjects.Graphics;
  private dirX = 1;
  private dirY = 0;
  private facing: 'down' | 'up' | 'right' | 'left' = 'right';

  private guards: Creature[] = [];
  private merchant: Creature | null = null;
  private raiders: Creature[] = [];

  constructor(
    private scene: Phaser.Scene,
    public readonly startX: number,
    public readonly startY: number,
    public readonly endX: number,
    public readonly endY: number,
    public readonly speed: number,
    private readonly guardCount: number,
    /** Adds a creature to the scene's CURRENT creatures array. */
    private addCreature: (c: Creature) => void,
    /** Removes a creature from the scene's CURRENT creatures array. */
    private removeCreature: (c: Creature) => void,
  ) {
    this.x = startX;
    this.y = startY;

    const startKey = 'cart_move_right';
    this.sprite = scene.add.sprite(this.x, this.y, startKey);
    if (scene.anims.exists(startKey)) this.sprite.play(startKey);
    this.sprite.setDisplaySize(72, 72);
    this.sprite.setDepth(this.y);

    this.spawnRoster();
  }

  /** Spawn the full escort (at A) + raiders (at the camp). */
  private spawnRoster() {
    const merchantDef = CREATURE_DB['caravan_merchant'];
    if (merchantDef) {
      this.merchant = new Creature(this.scene, this.x - 30, this.y, merchantDef);
      this.addCreature(this.merchant);
    }
    const guardDef = CREATURE_DB['caravan_guard'];
    if (guardDef) {
      for (let i = 0; i < this.guardCount; i++) {
        const slot = this.guardOffset(i, this.guardCount);
        const g = new Creature(this.scene, this.x + slot.x, this.y + slot.y, guardDef);
        this.addCreature(g);
        this.guards.push(g);
      }
    }
    // Один ветеран-разведчик в эскорте (его квест «Контрмера» достижим в событии).
    const scoutVetDef = CREATURE_DB['scout_veteran'];
    if (scoutVetDef) {
      const sv = new Creature(this.scene, this.x + 60, this.y - 30, scoutVetDef);
      this.addCreature(sv);
      this.guards.push(sv); // считается частью эскорта (формация, escort-first, isUnderAttack)
    }
    // Raiders at the camp. They leash to their spawn (camp) via LEASH_RANGE and
    // engage the escort by faction-sight as the cart passes.
    for (let i = 0; i < RAIDER_ROSTER.length; i++) {
      const def = CREATURE_DB[RAIDER_ROSTER[i]];
      if (!def) continue;
      const angle = (i / RAIDER_ROSTER.length) * Math.PI * 2;
      const rx = RAIDER_CAMP_X + Math.cos(angle) * 40;
      const ry = RAIDER_CAMP_Y + Math.sin(angle) * 30;
      const r = new Creature(this.scene, rx, ry, def);
      this.addCreature(r);
      this.raiders.push(r);
    }
  }

  /** Remove all escort + raiders from the scene and clear local tracking. */
  private despawnRoster() {
    for (const c of [this.merchant, ...this.guards, ...this.raiders]) {
      if (!c) continue;
      c.destroy();
      this.removeCreature(c);
    }
    this.merchant = null;
    this.guards = [];
    this.raiders = [];
  }

  /** Formation offset from cart center for each guard slot. */
  private guardOffset(idx: number, total: number): { x: number; y: number } {
    if (total <= 1) return { x: 40, y: 0 };
    if (total === 2) return idx === 0 ? { x: 50, y: -25 } : { x: -50, y: 25 };
    if (total === 3) {
      if (idx === 0) return { x: 50, y: 0 };
      if (idx === 1) return { x: -50, y: -25 };
      return { x: -50, y: 25 };
    }
    const angle = (idx / total) * Math.PI * 2;
    return { x: Math.cos(angle) * 50, y: Math.sin(angle) * 30 };
  }

  /** Direction-name from velocity vector for sprite anim selection. */
  private dirFromVec(dx: number, dy: number): 'down' | 'up' | 'right' | 'left' {
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }

  /** True when any guard/merchant is fighting (has faction target or chasing/attacking). */
  private isUnderAttack(): boolean {
    const fighting = (c: Creature | null) =>
      c != null && !c.isDead && (c.factionTarget != null ||
        c.aiState === 'chase' || c.aiState === 'attack');
    if (fighting(this.merchant)) return true;
    return this.guards.some(g => fighting(g));
  }

  private aliveGuards(): Creature[] {
    return this.guards.filter(g => !g.isDead);
  }

  /** True while any escort (merchant or guard) is still alive. */
  private escortAlive(): boolean {
    if (this.merchant && !this.merchant.isDead) return true;
    return this.guards.some(g => !g.isDead);
  }

  /** Live escort (merchant + guards) — used by the scene/destroy cleanup. */
  getEscorts(): Creature[] {
    const all = this.merchant ? [this.merchant, ...this.guards] : [...this.guards];
    return all.filter(c => !c.isDead);
  }

  update(_time: number, delta: number) {
    if (this.destroyed) return;
    const dt = delta / 1000;

    switch (this.phase) {
      case 'WAIT_START':
        this.phaseTimer += dt;
        this.drawHpBar();
        if (this.phaseTimer >= WAIT_START_SEC) {
          this.phase = 'TRAVEL';
          this.phaseTimer = 0;
        }
        return;

      case 'WAIT_END':
        this.phaseTimer += dt;
        if (this.phaseTimer >= WAIT_END_SEC) this.respawnCycle();
        return;

      case 'TRAVEL':
        this.updateTravel(dt);
        return;
    }
  }

  /** Reset cart to A, full HP, fresh full roster, back to WAIT_START. */
  private respawnCycle() {
    this.despawnRoster();
    this.x = this.startX;
    this.y = this.startY;
    this.hp = this.maxHp;
    this.dirX = 1;
    this.dirY = 0;
    this.facing = 'right';
    if (!this.sprite.active) {
      // Cart sprite was destroyed when the cart was wrecked — recreate it.
      this.sprite = this.scene.add.sprite(this.x, this.y, 'cart_move_right');
      if (this.scene.anims.exists('cart_move_right')) this.sprite.play('cart_move_right');
      this.sprite.setDisplaySize(72, 72);
    }
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setAlpha(1);
    this.sprite.setFlipX(false);
    this.sprite.setDepth(this.y);
    this.hpBar?.clear();
    this.spawnRoster();
    this.phase = 'WAIT_START';
    this.phaseTimer = 0;
  }

  private updateTravel(dt: number) {
    // 1. Move cart toward destination (only when not fighting).
    const dx = this.endX - this.x;
    const dy = this.endY - this.y;
    const distLeft = Math.hypot(dx, dy);

    // Arrived OR cart wrecked → wait at B, then respawn.
    if (distLeft < 8 || this.hp <= 0) {
      this.enterWaitEnd();
      return;
    }

    let moved = false;
    if (!this.isUnderAttack()) {
      this.dirX = dx / distLeft;
      this.dirY = dy / distLeft;
      this.x += this.dirX * this.speed * dt;
      this.y += this.dirY * this.speed * dt;
      moved = true;
    }

    // 2. Sprite direction + animation.
    const newFacing = this.dirFromVec(this.dirX, this.dirY);
    if (newFacing !== this.facing) {
      this.facing = newFacing;
      const animKey =
        newFacing === 'down' ? 'cart_move_down'
        : newFacing === 'up' ? 'cart_move_up'
        : 'cart_move_right';
      const flip = newFacing === 'left';
      if (this.scene.anims.exists(animKey) &&
          this.sprite.anims.currentAnim?.key !== animKey) {
        this.sprite.play(animKey);
      }
      this.sprite.setFlipX(flip);
    }
    this.sprite.setPosition(this.x, this.y);
    this.sprite.setDepth(this.y);

    // 3. Pull idle escort toward formation slots.
    const guardsAlive = this.aliveGuards();
    guardsAlive.forEach((g, i) => {
      const slot = this.guardOffset(i, guardsAlive.length);
      const tx = this.x + slot.x;
      const ty = this.y + slot.y;
      const isBusy = g.factionTarget != null ||
        g.aiState === 'chase' || g.aiState === 'attack';
      if (!isBusy && moved) {
        const gd = Math.hypot(tx - g.x, ty - g.y);
        if (gd > 6) {
          const followSpeed = this.speed * 1.2;
          g.x += ((tx - g.x) / gd) * followSpeed * dt;
          g.y += ((ty - g.y) / gd) * followSpeed * dt;
        }
      }
    });

    if (this.merchant && !this.merchant.isDead) {
      const isBusy = this.merchant.factionTarget != null ||
        this.merchant.aiState === 'chase' || this.merchant.aiState === 'attack';
      if (!isBusy && moved) {
        const tx = this.x - 38;
        const ty = this.y + 6;
        const md = Math.hypot(tx - this.merchant.x, ty - this.merchant.y);
        if (md > 6) {
          this.merchant.x += ((tx - this.merchant.x) / md) * this.speed * 1.2 * dt;
          this.merchant.y += ((ty - this.merchant.y) / md) * this.speed * 1.2 * dt;
        }
      }
    }

    // 4. Once all escort are dead, adjacent raiders chip the cart down.
    if (!this.escortAlive() && this.hp > 0) {
      for (const r of this.raiders) {
        if (r.isDead) continue;
        if (Math.hypot(r.x - this.x, r.y - this.y) <= CART_DAMAGE_RADIUS) {
          this.takeDamage(CART_DAMAGE_RATE * dt);
        }
      }
    }

    // 5. HP bar.
    this.drawHpBar();
  }

  private enterWaitEnd() {
    this.phase = 'WAIT_END';
    this.phaseTimer = 0;
    // Fade out the cart sprite; it is recreated/reset on respawn.
    if (this.sprite.active) {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        duration: 1000,
      });
    }
    this.hpBar?.clear();
  }

  private drawHpBar() {
    if (this.hp >= this.maxHp) { this.hpBar?.clear(); return; }
    if (!this.hpBar) this.hpBar = this.scene.add.graphics();
    this.hpBar.clear();
    const barW = 40;
    const ratio = Math.max(0, this.hp / this.maxHp);
    this.hpBar.fillStyle(0x000000, 0.6);
    this.hpBar.fillRect(this.x - barW / 2 - 1, this.y - 38, barW + 2, 5);
    this.hpBar.fillStyle(0xff4444, 1);
    this.hpBar.fillRect(this.x - barW / 2, this.y - 37, barW * ratio, 3);
    this.hpBar.setDepth(this.y + 1);
  }

  /** The cart is invulnerable until ALL escort are dead. */
  takeDamage(amount: number) {
    if (this.destroyed || this.hp <= 0) return;
    if (this.escortAlive()) return; // escort-first rule
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0 && this.sprite.active) {
      this.sprite.destroy();
      this.hpBar?.destroy();
      this.hpBar = undefined;
    }
  }

  /** Permanent teardown (zone change / scene init). Stops the loop. */
  destroy() {
    this.destroyed = true;
    if (this.sprite.active) this.sprite.destroy();
    this.hpBar?.destroy();
    this.hpBar = undefined;
    this.despawnRoster();
  }
}
