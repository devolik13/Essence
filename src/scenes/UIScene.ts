import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { StatName } from '../types/stats';
import { CaptureProcess, CaptureState } from '../systems/capture';
import { calcRank, xpToNextLevel } from '../systems/progression';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';

interface UIData {
  sphere: Sphere;
  body: Body | null;
  capture: CaptureProcess | null;
}

const SKILL_SLOT_SIZE = 48;
const SKILL_SLOT_GAP = 6;
const SKILL_SLOTS_COUNT = 8;

export class UIScene extends Phaser.Scene {
  private statsText!: Phaser.GameObjects.Text;
  private resourceText!: Phaser.GameObjects.Text;
  private bodyInfoText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private captureBar!: Phaser.GameObjects.Rectangle;
  private captureBarBg!: Phaser.GameObjects.Rectangle;

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
      lineSpacing: 5,
      backgroundColor: '#000000bb',
      padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(1000);

    // Ресурсы тела (нижний центр, над панелью умений)
    this.resourceText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 72, '', {
      fontSize: '13px',
      color: '#ffffff',
      align: 'center',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1000);

    // Инфо о теле (правый верхний)
    this.bodyInfoText = this.add.text(GAME_WIDTH - 10, 10, '', {
      fontSize: '11px',
      color: '#cccccc',
      align: 'right',
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 4 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    // Подсказки (нижний левый)
    this.hintText = this.add.text(10, GAME_HEIGHT - 12, '', {
      fontSize: '11px',
      color: '#666677',
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(1000);

    // Лог событий
    this.logText = this.add.text(10, GAME_HEIGHT - 130, '', {
      fontSize: '10px',
      color: '#aaaaaa',
      lineSpacing: 3,
    }).setScrollFactor(0).setDepth(1000);

    // Полоска захвата
    this.captureBarBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 140, 10, 0x333333)
      .setScrollFactor(0).setDepth(1001).setVisible(false);
    this.captureBar = this.add.rectangle(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 40, 0, 10, 0x66ccff)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 26, 'Захват...', {
      fontSize: '11px', color: '#66ccff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Панель умений
    this.buildSkillBar();

    // События от GameScene
    const gs = this.scene.get('GameScene');
    gs.events.on('update-ui', (data: UIData) => this.updateUI(data));
    gs.events.on('stat-up', (data: { stat: StatName; newValue: number }) => {
      this.addLog(`▲ ${STAT_NAMES_RU[data.stat]} → ${data.newValue}`);
    });
    gs.events.on('creature-killed', (data: { name: string; xp: number; stats: StatName[] }) => {
      const statStr = data.stats.map(s => STAT_NAMES_RU[s]).join(', ');
      this.addLog(`${data.name} убит  +${data.xp} XP → [${statStr}]`);
    });
    gs.events.on('player-died', () => this.addLog('⚠ Тело погибло. Вы в астрале.'));
    gs.events.on('body-captured', (name: string) => this.addLog(`✦ Захвачено: ${name}`));
    gs.events.on('capture-available', (name: string) => this.addLog(`${name} — нажми [E] для захвата`));
    gs.events.on('capture-start', (name: string) => this.addLog(`Захват ${name}...`));
    gs.events.on('spell-progress', (d: { spell: import('../types/abilities').AbilityDef; current: number; threshold: number }) => {
      const bar = buildXPBar(d.current, d.threshold, 8);
      this.addLog(`✧ Заклинание "${d.spell.nameRu}" ${bar} ${d.current}/${d.threshold}`);
    });
    gs.events.on('spell-learned', (spell: import('../types/abilities').AbilityDef) => {
      this.addLog(`★ ИЗУЧЕНО заклинание: ${spell.nameRu}! (слот 2)`);
    });
  }

  private updateUI(data: UIData) {
    const { sphere, body, capture } = data;

    // ── Статы сферы с XP-прогрессом ──────────────────
    const rank = calcRank(sphere.stats);
    const caps = body?.definition.caps ?? {};
    const xpTracker = sphere.xpTracker;

    const lines: string[] = [`── Сфера  Ранг ${rank.toFixed(1)} ──`];

    for (const stat of STAT_ORDER) {
      const val = sphere.stats[stat];
      const cap = caps[stat];
      const isActive = cap !== undefined; // этот стат прокачивается в текущем теле
      const isCapped = cap !== undefined && val >= cap;

      let line = `${STAT_NAMES_RU[stat]}: ${val}`;

      if (isActive && xpTracker) {
        if (isCapped) {
          line += ` [КАП]`;
        } else {
          const currentXP = xpTracker[stat];
          const needed = xpToNextLevel(val);
          const pips = buildXPBar(currentXP, needed, 8);
          line += ` ${pips} ${currentXP}/${needed}`;
        }
      }

      if (cap !== undefined) {
        line = `► ${line}  (кап ${cap})`;
      }

      lines.push(line);
    }

    this.statsText.setText(lines.join('\n'));

    // ── Ресурсы тела ──────────────────────────────────
    if (body) {
      const hpPct = Math.round((body.currentHP / body.maxHP) * 100);
      const manaPct = Math.round((body.currentMana / body.maxMana) * 100);
      this.resourceText.setText(
        `HP ${Math.round(body.currentHP)}/${body.maxHP} (${hpPct}%)   Мана ${Math.round(body.currentMana)}/${body.maxMana} (${manaPct}%)`
      );
      this.resourceText.setVisible(true);

      this.bodyInfoText.setText(
        `── ${body.definition.nameRu} ──\n` +
        `Оружие: ${body.weapon.nameRu}  КД: ${body.weapon.cooldown}с`
      );
      this.bodyInfoText.setVisible(true);
      this.hintText.setText('[1] Атака  [Q] Выйти из тела  [E] Захват');
    } else {
      this.resourceText.setVisible(false);
      this.bodyInfoText.setVisible(false);
      this.hintText.setText('[WASD] Движение  [E] Захватить тело');
    }

    // ── Полоска захвата ───────────────────────────────
    if (capture?.state === CaptureState.Casting) {
      const p = capture.elapsed / capture.duration;
      this.captureBarBg.setVisible(true);
      this.captureBar.setVisible(true);
      this.captureBar.width = 140 * p;
    } else {
      this.captureBarBg.setVisible(false);
      this.captureBar.setVisible(false);
    }

    // ── Панель умений ─────────────────────────────────
    this.updateSkillBar(body);
  }

  private buildSkillBar() {
    const totalW = SKILL_SLOTS_COUNT * SKILL_SLOT_SIZE + (SKILL_SLOTS_COUNT - 1) * SKILL_SLOT_GAP;
    const startX = (GAME_WIDTH - totalW) / 2;
    const y = GAME_HEIGHT - SKILL_SLOT_SIZE / 2 - 8;

    for (let i = 0; i < SKILL_SLOTS_COUNT; i++) {
      const x = startX + i * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP) + SKILL_SLOT_SIZE / 2;

      const bg = this.add.rectangle(x, y, SKILL_SLOT_SIZE, SKILL_SLOT_SIZE, 0x1a1a2e, 0.9)
        .setScrollFactor(0).setDepth(1000);
      this.add.rectangle(x, y, SKILL_SLOT_SIZE, SKILL_SLOT_SIZE)
        .setStrokeStyle(1, 0x4455aa, 0.7).setFillStyle(0, 0)
        .setScrollFactor(0).setDepth(1001);
      this.skillSlotsBg.push(bg);

      const icon = this.add.text(x, y - 4, '', {
        fontSize: '11px', color: '#ffffff', align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
      this.skillSlotsIcon.push(icon);

      const key = this.add.text(x - SKILL_SLOT_SIZE / 2 + 3, y - SKILL_SLOT_SIZE / 2 + 2, `${i + 1}`, {
        fontSize: '9px', color: '#555577',
      }).setScrollFactor(0).setDepth(1003);
      this.skillSlotsKey.push(key);

      const cd = this.add.rectangle(x, y + SKILL_SLOT_SIZE / 2, SKILL_SLOT_SIZE, 0, 0x000000, 0.65)
        .setOrigin(0.5, 1).setScrollFactor(0).setDepth(1004);
      this.skillSlotsCd.push(cd);
    }
  }

  private updateSkillBar(body: Body | null) {
    for (let i = 0; i < SKILL_SLOTS_COUNT; i++) {
      const slot = body?.abilitySlots[i];
      const ability = slot?.ability ?? null;

      this.skillSlotsBg[i].setFillStyle(ability ? 0x1e2244 : 0x1a1a2e, 0.9);

      if (i === 0 && body) {
        this.skillSlotsIcon[i].setText('⚔').setColor('#ffdd66').setFontSize('16px');
      } else if (ability) {
        this.skillSlotsIcon[i].setText(ability.nameRu.slice(0, 6)).setColor('#aaccff').setFontSize('10px');
      } else {
        this.skillSlotsIcon[i].setText('');
      }

      if (slot && slot.cooldownRemaining > 0) {
        const ratio = Math.min(slot.cooldownRemaining / (slot.ability?.cooldown ?? 1), 1);
        this.skillSlotsCd[i].height = SKILL_SLOT_SIZE * ratio;
      } else {
        this.skillSlotsCd[i].height = 0;
      }
    }
  }

  private addLog(msg: string) {
    this.logMessages.push(msg);
    if (this.logMessages.length > 6) this.logMessages.shift();
    this.logText.setText(this.logMessages.join('\n'));
  }
}

/** Строит мини-бар XP из символов */
function buildXPBar(current: number, needed: number, width: number): string {
  const filled = Math.round((current / needed) * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

const STAT_ORDER: StatName[] = [
  StatName.Strength, StatName.Agility, StatName.Accuracy, StatName.Evasion,
  StatName.Health, StatName.Armor, StatName.Intellect, StatName.Will,
  StatName.Mana, StatName.Luck,
];

const STAT_NAMES_RU: Record<StatName, string> = {
  [StatName.Strength]:  'Сила   ',
  [StatName.Agility]:   'Ловкость',
  [StatName.Accuracy]:  'Точность',
  [StatName.Evasion]:   'Уклон  ',
  [StatName.Health]:    'Здоровье',
  [StatName.Armor]:     'Стойкость',
  [StatName.Intellect]: 'Интеллект',
  [StatName.Will]:      'Воля   ',
  [StatName.Mana]:      'Мана   ',
  [StatName.Luck]:      'Удача  ',
};
