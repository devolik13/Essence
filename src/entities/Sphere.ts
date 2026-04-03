import Phaser from 'phaser';
import { Stats, StatName, createDefaultStats } from '../types/stats';
import { SPHERE_SPEED } from '../utils/constants';
import { calcRank, StatXP, createEmptyXP } from '../systems/progression';
import { AbilityDef } from '../types/abilities';

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
  /** Сохранённые назначения слотов: индекс → spell.id или null */
  public savedSlotIds: (string | null)[] = Array(8).fill(null);

  // Штраф смерти
  public deathDebuffRemaining: number = 0;  // сек осталось

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

    this.x += vx * speed * dt;
    this.y += vy * speed * dt;

    // Пульсация свечения
    const pulse = 0.3 + Math.sin(_time / 300) * 0.1;
    this.glow.setAlpha(pulse);
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
