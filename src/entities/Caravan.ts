import Phaser from 'phaser';
import { Creature } from './Creature';
import { CREATURE_DB } from '../data/creatureDB';

/**
 * A traveling caravan: animated cart + escort creatures (guards + merchant).
 *
 * The cart moves linearly from `start` to `end` along the road. Escort
 * creatures (regular Creature instances stored in scene.creatures) are kept
 * in formation around the cart whenever they have no aggro/faction target.
 * When ambushers in 'raider' faction enter the FACTION_SIGHT range, the
 * escort engages naturally via the existing faction combat logic, the cart
 * pauses while any escort is in chase/attack, then resumes once the road is
 * clear.
 */
export class Caravan {
  public x: number;
  public y: number;
  public hp = 200;
  public readonly maxHp = 200;
  public destroyed = false;
  public arrived = false;

  private sprite: Phaser.GameObjects.Sprite;
  private hpBar?: Phaser.GameObjects.Graphics;
  private dirX = 1;
  private dirY = 0;
  private facing: 'down' | 'up' | 'right' | 'left' = 'right';

  /** Current creatures escorting this caravan (filtered alive each frame). */
  private guards: Creature[] = [];
  private merchant: Creature | null = null;

  constructor(
    private scene: Phaser.Scene,
    public readonly startX: number,
    public readonly startY: number,
    public readonly endX: number,
    public readonly endY: number,
    public readonly speed: number,
    guardCount: number,
    private allCreatures: Creature[],
  ) {
    this.x = startX;
    this.y = startY;

    const startKey = 'cart_move_right';
    this.sprite = scene.add.sprite(this.x, this.y, startKey);
    if (scene.anims.exists(startKey)) this.sprite.play(startKey);
    this.sprite.setDisplaySize(72, 72);
    this.sprite.setDepth(this.y);

    // Spawn merchant (1) and guards (guardCount), add them to scene's creature list
    const merchantDef = CREATURE_DB['caravan_merchant'];
    if (merchantDef) {
      this.merchant = new Creature(scene, this.x - 30, this.y, merchantDef);
      allCreatures.push(this.merchant);
    }
    const guardDef = CREATURE_DB['caravan_guard'];
    if (guardDef) {
      for (let i = 0; i < guardCount; i++) {
        const slot = this.guardOffset(i, guardCount);
        const g = new Creature(scene, this.x + slot.x, this.y + slot.y, guardDef);
        allCreatures.push(g);
        this.guards.push(g);
      }
    }
  }

  /** Formation offset from cart center for each guard slot. */
  private guardOffset(idx: number, total: number): { x: number; y: number } {
    if (total === 1) return { x: 40, y: 0 };
    if (total === 2) return idx === 0 ? { x: 50, y: -25 } : { x: -50, y: 25 };
    if (total === 3) {
      if (idx === 0) return { x: 50, y: 0 };
      if (idx === 1) return { x: -50, y: -25 };
      return { x: -50, y: 25 };
    }
    // 4+: ring around cart
    const angle = (idx / total) * Math.PI * 2;
    return { x: Math.cos(angle) * 50, y: Math.sin(angle) * 30 };
  }

  /** Direction-name from velocity vector for sprite anim selection. */
  private dirFromVec(dx: number, dy: number): 'down' | 'up' | 'right' | 'left' {
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }

  /** True when any guard/merchant is fighting (has faction target or is in chase/attack). */
  private isUnderAttack(): boolean {
    const fighting = (c: Creature | null) =>
      c != null && !c.isDead && (c.factionTarget != null ||
        c.aiState === 'chase' || c.aiState === 'attack');
    if (fighting(this.merchant)) return true;
    return this.guards.some(g => fighting(g));
  }

  /** Returns alive escorts for formation following. */
  private aliveGuards(): Creature[] {
    return this.guards.filter(g => !g.isDead);
  }

  update(_time: number, delta: number) {
    if (this.destroyed || this.arrived) return;
    const dt = delta / 1000;

    // 1. Move cart toward destination (only when no combat)
    const dx = this.endX - this.x;
    const dy = this.endY - this.y;
    const distLeft = Math.hypot(dx, dy);

    if (distLeft < 8) {
      this.arrived = true;
      // On arrival, fade out cart + remove escorts gracefully
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        duration: 1000,
        onComplete: () => this.sprite.destroy(),
      });
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

    // 2. Update sprite direction + animation
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

    // 3. Pull idle escorts toward formation slot. Combat-engaged escorts
    //    are left to their existing AI (chase/attack/return).
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
          const sgnX = (tx - g.x) / gd;
          const sgnY = (ty - g.y) / gd;
          // Use a fraction of cart speed so they don't outrun cart
          const followSpeed = this.speed * 1.2;
          g.x += sgnX * followSpeed * dt;
          g.y += sgnY * followSpeed * dt;
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

    // 4. HP bar above cart (only if damaged)
    if (this.hp < this.maxHp) {
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
  }

  takeDamage(amount: number) {
    if (this.destroyed) return;
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) {
      this.destroyed = true;
      this.sprite.destroy();
      this.hpBar?.destroy();
    }
  }

  destroy() {
    this.destroyed = true;
    this.sprite.destroy();
    this.hpBar?.destroy();
  }
}
