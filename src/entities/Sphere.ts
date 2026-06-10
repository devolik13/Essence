import Phaser from 'phaser';
import { Stats, StatName, createDefaultStats } from '../types/stats';
import { SPHERE_SPEED } from '../utils/constants';
import { calcRank, StatXP, createEmptyXP } from '../systems/progression';
import { AbilityDef } from '../types/abilities';
import { InventoryItem } from '../types/items';

/**
 * Сфера — бессмертная сущность игрока.
 * В астральном режиме это светящийся шар, который парит по миру
 * и может захватывать тела.
 */
export class Sphere extends Phaser.GameObjects.Container {
  public stats: Stats;
  public xpTracker: StatXP;
  public spellProgress: Record<string, number> = {};
  public learnedSpells: AbilityDef[] = [];
  public inBody: boolean = false;
  public learnedAbilities: string[] = [];
  /** Сохранённые назначения нейтральных слотов 6-8: spell.id или null */
  public savedSlotIds: (string | null)[] = Array(8).fill(null);

  /** Активный слот оружия (0 = первое, 1 = второе) */
  public activeWeaponSlot: number = 0;

  /** Сохранённые раскладки слотов 1-5 для каждого оружия: weaponItemId → [slot1..slot5 spell ids] */
  public weaponSlotConfigs: Record<string, (string | null)[]> = {};

  /** Cooldown remaining per ability id (seconds) — persists across weapon swaps. */
  public abilityCooldowns: Record<string, number> = {};

  // Инвентарь
  public inventory: InventoryItem[] = [];
  /** Кол-во убитых существ по типу (для ачивок и статистики) */
  public killCounts: Record<string, number> = {};
  /** Разблокированные ачивки */
  public unlockedAchievements: string[] = [];
  /** Квесты, которые отслеживаются на экране */
  public trackedQuestIds: string[] = [];

  // Штраф смерти
  public deathDebuffRemaining: number = 0;  // сек осталось

  /** Следующий каст бесплатный (от Рассечения / Адаптации) */
  public freeNextCast: boolean = false;

  // Зачарование оружия (toggle-аура)
  public activeEnchant: AbilityDef | null = null;

  /** ID последнего тела (для восстановления при переходе между зонами) */
  public lastBodyId: string | null = null;

  /** Тело, в которое вернуться после данжа лаборатории ('' = был в астрале).
   *  null = не в данже. Не персистится (v1). */
  public labReturnBodyId: string | null = null;

  /** Экипированные предметы */
  public equipment: import('../types/items').Equipment = {};

  /** Currency in copper coins (100 copper = 1 silver, 100 silver = 1 gold, 100 gold = 1 platinum) */
  public copper: number = 0;

  /** Изученные рецепты */
  public learnedRecipes: string[] = [];

  public characterName: string = '';

  /** Seal of Elements — 4 frequencies collected from Guardian bosses */
  public sealFrequencies: Record<string, boolean> = {
    fire: false, water: false, earth: false, wind: false,
  };

  /** Body quest IDs that have been triggered (shown intro dialog) */
  public triggeredBodyQuests: string[] = [];

  public mapW = 3840;
  public mapH = 3200;

  private glow: Phaser.GameObjects.Arc;
  private innerOrb: Phaser.GameObjects.Arc;
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene, x: number, y: number, stats?: Stats) {
    super(scene, x, y);

    this.stats = stats ?? createDefaultStats();
    this.xpTracker = createEmptyXP();

    // Внешнее свечение
    this.glow = scene.add.arc(0, 0, 20, 0, 360, false, 0x66ccff, 0.3);
    this.add(this.glow);

    // Внутренний шар
    this.innerOrb = scene.add.arc(0, 0, 10, 0, 360, false, 0xaaeeff, 0.9);
    this.add(this.innerOrb);

    scene.add.existing(this);

    // Клавиатура
    if (scene.input.keyboard) {
      this.keys = {
        W: scene.input.keyboard.addKey('W'),
        A: scene.input.keyboard.addKey('A'),
        S: scene.input.keyboard.addKey('S'),
        D: scene.input.keyboard.addKey('D'),
      };
    }
  }

  get rank(): number {
    return calcRank(this.stats);
  }

  update(_time: number, delta: number) {
    this.setDepth(this.y);
    if (this.inBody) {
      this.setVisible(false);
      return;
    }

    this.setVisible(true);
    const speed = SPHERE_SPEED;
    const dt = delta / 1000;

    let vx = 0;
    let vy = 0;

    if (this.keys.A.isDown) vx = -1;
    if (this.keys.D.isDown) vx = 1;
    if (this.keys.W.isDown) vy = -1;
    if (this.keys.S.isDown) vy = 1;

    // Нормализация диагонали
    if (vx !== 0 && vy !== 0) {
      const norm = 1 / Math.SQRT2;
      vx *= norm;
      vy *= norm;
    }

    this.x = Math.max(16, Math.min(this.mapW - 16, this.x + vx * speed * dt));
    this.y = Math.max(16, Math.min(this.mapH - 16, this.y + vy * speed * dt));

    // Пульсация свечения
    const pulse = 0.3 + Math.sin(_time / 300) * 0.1;
    this.glow.setAlpha(pulse);
  }

  /** Добавить предмет в инвентарь (стакается) */
  addItem(itemId: string, qty: number) {
    const existing = this.inventory.find(i => i.itemId === itemId);
    if (existing) {
      existing.quantity += qty;
    } else {
      this.inventory.push({ itemId, quantity: qty });
    }
  }

  /** Использовать предмет (consumable): возвращает true если использован */
  useItem(itemId: string): boolean {
    const slot = this.inventory.find(i => i.itemId === itemId);
    if (!slot || slot.quantity <= 0) return false;
    slot.quantity -= 1;
    if (slot.quantity === 0) {
      this.inventory = this.inventory.filter(i => i.itemId !== itemId);
    }
    return true;
  }

  /** Показать сферу (выход из тела) */
  enterAstral(x: number, y: number) {
    this.inBody = false;
    this.setPosition(x, y);
    this.setVisible(true);
  }

  /** Скрыть сферу (вход в тело) */
  enterBody() {
    this.inBody = true;
    this.setVisible(false);
  }
}
