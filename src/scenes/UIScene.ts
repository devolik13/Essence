import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { StatName } from '../types/stats';
import { CaptureProcess, CaptureState } from '../systems/capture';
import { calcRank } from '../systems/progression';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

interface UIData {
  sphere: Sphere;
  body: Body | null;
  capture: CaptureProcess | null;
}

/**
 * UIScene — оверлей поверх игровой сцены.
 * Показывает статы, HP/Mana, слоты умений.
 */
const SKILL_SLOT_SIZE = 48;
const SKILL_SLOT_GAP = 6;
const SKILL_SLOTS_COUNT = 8;

export class UIScene extends Phaser.Scene {
  // Панели
  private statsText!: Phaser.GameObjects.Text;
  private resourceText!: Phaser.GameObjects.Text;
  private bodyInfoText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private captureBar!: Phaser.GameObjects.Rectangle;
  private captureBarBg!: Phaser.GameObjects.Rectangle;

  // Панель умений
  private skillSlotsBg: Phaser.GameObjects.Rectangle[] = [];
  private skillSlotsIcon: Phaser.GameObjects.Text[] = [];
  private skillSlotsKey: Phaser.GameObjects.Text[] = [];
  private skillSlotsCd: Phaser.GameObjects.Rectangle[] = [];

  private logMessages: string[] = [];

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Статы сферы (левый верхний угол)
    this.statsText = this.add.text(10, 10, '', {
      fontSize: '12px',
      color: '#aaeeff',
      lineSpacing: 4,
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setDepth(1000);

    // Ресурсы тела (нижний центр)
    this.resourceText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, '', {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

    // Инфо о теле (правый верхний)
    this.bodyInfoText = this.add.text(GAME_WIDTH - 10, 10, '', {
      fontSize: '11px',
      color: '#cccccc',
      align: 'right',
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 4 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    // Подсказки (нижний левый)
    this.hintText = this.add.text(10, GAME_HEIGHT - 30, '', {
      fontSize: '11px',
      color: '#888888',
    }).setScrollFactor(0).setDepth(1000);

    // Лог событий (левый нижний, над подсказками)
    this.logText = this.add.text(10, GAME_HEIGHT - 120, '', {
      fontSize: '10px',
      color: '#aaaaaa',
      lineSpacing: 2,
    }).setScrollFactor(0).setDepth(1000);

    // Полоска захвата
    this.captureBarBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 120, 8, 0x333333)
      .setScrollFactor(0).setDepth(1001).setVisible(false);
    this.captureBar = this.add.rectangle(GAME_WIDTH / 2 - 60, GAME_HEIGHT / 2 + 40, 0, 8, 0x66ccff)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);

    // Панель умений — 8 слотов внизу по центру
    this.buildSkillBar();

    // Слушаем события GameScene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('update-ui', (data: UIData) => this.updateUI(data));
    gameScene.events.on('stat-up', (data: { stat: StatName; newValue: number }) => {
      this.addLog(`${STAT_NAMES_RU[data.stat]} повышен до ${data.newValue}!`);
    });
    gameScene.events.on('creature-killed', (name: string) => {
      this.addLog(`${name} убит!`);
    });
    gameScene.events.on('player-died', () => {
      this.addLog('Тело погибло. Вы в астрале.');
    });
    gameScene.events.on('body-captured', (name: string) => {
      this.addLog(`Захвачено тело: ${name}`);
    });
    gameScene.events.on('capture-available', (name: string) => {
      this.addLog(`Тело "${name}" доступно для захвата [E]`);
    });
    gameScene.events.on('capture-start', (name: string) => {
      this.addLog(`Захват "${name}"...`);
    });
  }

  private updateUI(data: UIData) {
    const { sphere, body, capture } = data;

    // Статы сферы
    const rank = calcRank(sphere.stats);
    this.statsText.setText(
      `── Сфера  Ранг ${rank.toFixed(1)} ──\n` +
      `Сила: ${sphere.stats[StatName.Strength]}  Ловк: ${sphere.stats[StatName.Agility]}\n` +
      `Точн: ${sphere.stats[StatName.Accuracy]}  Укл: ${sphere.stats[StatName.Evasion]}\n` +
      `Здор: ${sphere.stats[StatName.Health]}  Стойк: ${sphere.stats[StatName.Armor]}\n` +
      `Инт: ${sphere.stats[StatName.Intellect]}  Воля: ${sphere.stats[StatName.Will]}\n` +
      `Мана: ${sphere.stats[StatName.Mana]}  Удача: ${sphere.stats[StatName.Luck]}`
    );

    // Ресурсы тела
    if (body) {
      const hpPct = Math.round((body.currentHP / body.maxHP) * 100);
      const manaPct = Math.round((body.currentMana / body.maxMana) * 100);
      this.resourceText.setText(
        `HP: ${Math.round(body.currentHP)} / ${body.maxHP} (${hpPct}%)  |  ` +
        `Мана: ${Math.round(body.currentMana)} / ${body.maxMana} (${manaPct}%)`
      );
      this.resourceText.setVisible(true);

      this.bodyInfoText.setText(
        `── ${body.definition.nameRu} ──\n` +
        `Оружие: ${body.weapon.nameRu}\n` +
        `КД: ${body.weapon.cooldown}с  Дальность: ${body.weapon.range}`
      );
      this.bodyInfoText.setVisible(true);

      this.hintText.setText('[ЛКМ] Атака  [Q] Выход из тела');
    } else {
      this.resourceText.setVisible(false);
      this.bodyInfoText.setVisible(false);
      this.hintText.setText('[WASD] Движение  [E] Захватить тело');
    }

    // Панель умений
    this.updateSkillBar(body);

    // Полоска захвата
    if (capture && capture.state === CaptureState.Casting) {
      const progress = capture.elapsed / capture.duration;
      this.captureBarBg.setVisible(true);
      this.captureBar.setVisible(true);
      this.captureBar.width = 120 * progress;
    } else {
      this.captureBarBg.setVisible(false);
      this.captureBar.setVisible(false);
    }
  }

  private buildSkillBar() {
    const totalW = SKILL_SLOTS_COUNT * SKILL_SLOT_SIZE + (SKILL_SLOTS_COUNT - 1) * SKILL_SLOT_GAP;
    const startX = (GAME_WIDTH - totalW) / 2;
    const y = GAME_HEIGHT - SKILL_SLOT_SIZE / 2 - 8;

    for (let i = 0; i < SKILL_SLOTS_COUNT; i++) {
      const x = startX + i * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP) + SKILL_SLOT_SIZE / 2;

      // Фон слота
      const bg = this.add.rectangle(x, y, SKILL_SLOT_SIZE, SKILL_SLOT_SIZE, 0x222233, 0.85)
        .setScrollFactor(0).setDepth(1000);
      // Рамка
      this.add.rectangle(x, y, SKILL_SLOT_SIZE, SKILL_SLOT_SIZE)
        .setScrollFactor(0).setDepth(1001)
        .setStrokeStyle(1, 0x5566aa, 0.8)
        .setFillStyle(0, 0);
      this.skillSlotsBg.push(bg);

      // Иконка умения (текст-заглушка)
      const icon = this.add.text(x, y - 4, '', {
        fontSize: '11px', color: '#ffffff', align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
      this.skillSlotsIcon.push(icon);

      // Цифра клавиши
      const key = this.add.text(x - SKILL_SLOT_SIZE / 2 + 4, y - SKILL_SLOT_SIZE / 2 + 3, `${i + 1}`, {
        fontSize: '9px', color: '#888899',
      }).setScrollFactor(0).setDepth(1003);
      this.skillSlotsKey.push(key);

      // Оверлей кулдауна
      const cd = this.add.rectangle(x, y + SKILL_SLOT_SIZE / 2, SKILL_SLOT_SIZE, 0, 0x000000, 0.6)
        .setOrigin(0.5, 1).setScrollFactor(0).setDepth(1004);
      this.skillSlotsCd.push(cd);
    }
  }

  private updateSkillBar(body: Body | null) {
    for (let i = 0; i < SKILL_SLOTS_COUNT; i++) {
      const slot = body?.abilitySlots[i];
      const ability = slot?.ability ?? null;

      // Подсветка занятых слотов
      this.skillSlotsBg[i].setFillStyle(ability ? 0x2a2a44 : 0x222233, 0.85);

      // Иконка
      if (i === 0 && body) {
        // Слот 1 — базовая атака, всегда активна
        this.skillSlotsIcon[i].setText('⚔').setColor('#ffcc44');
      } else if (ability) {
        this.skillSlotsIcon[i].setText(ability.nameRu.slice(0, 4)).setColor('#ccddff');
      } else {
        this.skillSlotsIcon[i].setText('');
      }

      // Кулдаун
      if (slot && slot.cooldownRemaining > 0) {
        const ratio = slot.cooldownRemaining / (slot.ability?.cooldown ?? 1);
        this.skillSlotsCd[i].height = SKILL_SLOT_SIZE * Math.min(ratio, 1);
      } else {
        this.skillSlotsCd[i].height = 0;
      }
    }
  }

  private addLog(msg: string) {
    this.logMessages.push(msg);
    if (this.logMessages.length > 6) {
      this.logMessages.shift();
    }
    this.logText.setText(this.logMessages.join('\n'));
  }
}

const STAT_NAMES_RU: Record<StatName, string> = {
  [StatName.Strength]: 'Сила',
  [StatName.Agility]: 'Ловкость',
  [StatName.Accuracy]: 'Точность',
  [StatName.Evasion]: 'Уклонение',
  [StatName.Health]: 'Здоровье',
  [StatName.Armor]: 'Стойкость',
  [StatName.Intellect]: 'Интеллект',
  [StatName.Will]: 'Воля',
  [StatName.Mana]: 'Мана',
  [StatName.Luck]: 'Удача',
};
