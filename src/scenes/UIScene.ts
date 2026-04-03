import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { Creature } from '../entities/Creature';
import { StatName } from '../types/stats';
import { CaptureProcess, CaptureState } from '../systems/capture';
import { calcRank, xpToNextLevel } from '../systems/progression';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { STAT_NAMES_SHORT } from '../utils/statNames';
import { QuestProgress } from '../types/quests';

interface UIData {
  sphere: Sphere;
  body: Body | null;
  capture: CaptureProcess | null;
  target: Creature | null;
  quests: QuestProgress[];
  deathDebuff: number;
  inCombat: boolean;
  aoeCast: { elapsed: number; duration: number; name: string } | null;
}

const SKILL_SLOT_SIZE = 48;
const SKILL_SLOT_GAP = 6;
const SKILL_SLOTS_COUNT = 8;

export class UIScene extends Phaser.Scene {
  private statsText!: Phaser.GameObjects.Text;
  private spellText!: Phaser.GameObjects.Text;
  private targetPanel!: Phaser.GameObjects.Text;
  private questPanel!: Phaser.GameObjects.Text;
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
  private skillSlotsCdText: Phaser.GameObjects.Text[] = [];
  private skillBarLocked: boolean = false;
  private lockBtn!: Phaser.GameObjects.Text;

  // Spell picker
  private spellPickerContainer!: Phaser.GameObjects.Container;
  private spellPickerSlot: number = -1;
  private cachedLearnedSpells: import('../types/abilities').AbilityDef[] = [];
  private cachedInCombat: boolean = false;

  private castBarBg!: Phaser.GameObjects.Rectangle;
  private castBar!: Phaser.GameObjects.Rectangle;
  private castLabel!: Phaser.GameObjects.Text;

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

    // Прогресс заклинания (под statsText, позиция обновляется динамически)
    this.spellText = this.add.text(10, 200, '', {
      fontSize: '11px',
      color: '#ddaaff',
      lineSpacing: 3,
      backgroundColor: '#000000bb',
      padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(1000).setVisible(false);

    // Панель цели (правый верхний угол, под bodyInfoText)
    this.targetPanel = this.add.text(GAME_WIDTH - 10, 90, '', {
      fontSize: '11px',
      color: '#ffddaa',
      align: 'right',
      lineSpacing: 4,
      backgroundColor: '#000000bb',
      padding: { x: 8, y: 6 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000).setVisible(false);

    // Панель квестов (левая сторона, под статами — позиция обновляется динамически)
    this.questPanel = this.add.text(10, 300, '', {
      fontSize: '11px',
      color: '#ffeeaa',
      lineSpacing: 3,
      backgroundColor: '#000000bb',
      padding: { x: 8, y: 6 },
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(1000).setVisible(false);

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

    // Полоска каста заклинания (над skill bar)
    const castY = GAME_HEIGHT - 72;
    this.castBarBg = this.add.rectangle(GAME_WIDTH / 2, castY, 160, 10, 0x222222)
      .setScrollFactor(0).setDepth(1001).setVisible(false);
    this.castBar = this.add.rectangle(GAME_WIDTH / 2 - 80, castY, 0, 10, 0xff8800)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);
    this.castLabel = this.add.text(GAME_WIDTH / 2, castY - 14, '', {
      fontSize: '11px', color: '#ff8800',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setVisible(false);

    // Панель умений
    this.buildSkillBar();

    // События от GameScene
    const gs = this.scene.get('GameScene');
    gs.events.on('update-ui', (data: UIData) => this.updateUI(data));
    gs.events.on('stat-up', (data: { stat: StatName; newValue: number }) => {
      this.addLog(`▲ ${STAT_NAMES_SHORT[data.stat]} → ${data.newValue}`);
    });
    gs.events.on('creature-killed', (data: { name: string; xp: number; stats: StatName[] }) => {
      const statStr = data.stats.map(s => STAT_NAMES_SHORT[s]).join(', ');
      this.addLog(`${data.name} убит  +${data.xp} XP → [${statStr}]`);
    });
    gs.events.on('player-died', (data: { xpLost: number; debuffDuration: number }) => {
      this.addLog(`⚠ Тело погибло. Вы в астрале.`);
      if (data?.xpLost > 0) this.addLog(`  ↓ Потеряно ${data.xpLost} XP (штраф смерти)`);
      this.addLog(`  ✦ Слабость астрала: −15% урон на ${data?.debuffDuration ?? 30}с`);
    });
    gs.events.on('body-captured', (name: string) => this.addLog(`✦ Захвачено: ${name}`));
    gs.events.on('capture-available', (name: string) => this.addLog(`${name} — нажми [E] для захвата`));
    gs.events.on('capture-start', (name: string) => this.addLog(`Захват ${name}...`));
    gs.events.on('spell-learned', (spell: import('../types/abilities').AbilityDef) => {
      this.addLog(`★ Изучено: ${spell.nameRu} → слот 2`);
    });
    gs.events.on('quest-complete', (data: { name: string; xp: number }) => {
      this.addLog(`✦ КВЕСТ ВЫПОЛНЕН: ${data.name}  +${data.xp} XP`);
    });
    gs.events.on('save-loaded', () => {
      this.addLog('↺ Прогресс загружен из сохранения');
    });
    gs.events.on('aoe-targeting', (name: string) => {
      this.addLog(`◎ Прицеливание: ${name}  [ЛКМ] выстрел  [ПКМ/ESC] отмена`);
    });
    gs.events.on('spell-out-of-range', () => {
      this.addLog('✗ Слишком далеко для заклинания');
    });
  }

  private updateUI(data: UIData) {
    const { sphere, body, capture } = data;

    // Кэш для spell picker
    this.cachedLearnedSpells = sphere.learnedSpells;
    this.cachedInCombat = data.inCombat ?? false;
    if (this.cachedInCombat && this.spellPickerSlot >= 0) this.closeSpellPicker();

    // ── Статы сферы с XP-прогрессом ──────────────────
    const rank = calcRank(sphere.stats);
    const caps = body?.definition.caps ?? {};
    const xpTracker = sphere.xpTracker;

    const debuffSecs = Math.ceil(data.deathDebuff ?? 0);
    const debuffStr = debuffSecs > 0 ? `  ⚠ Слабость ${debuffSecs}с` : '';
    const lines: string[] = [`── Сфера  Ранг ${rank.toFixed(1)} ──${debuffStr}`];

    for (const stat of STAT_ORDER) {
      const val = sphere.stats[stat];
      const cap = caps[stat];
      const isActive = cap !== undefined; // этот стат прокачивается в текущем теле
      const isCapped = cap !== undefined && val >= cap;

      let line = `${STAT_NAMES_SHORT[stat]}: ${val}`;

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

    // ── Прогресс заклинания под статами ──────────────
    const sig = body?.definition.signatureSpell;
    const threshold = body?.definition.spellXPThreshold;
    if (sig && threshold) {
      const alreadyLearned = sphere.learnedSpells.some(s => s.id === sig.id);
      if (alreadyLearned) {
        this.spellText.setText(`✦ ${sig.nameRu} — ИЗУЧЕНО`).setVisible(true);
      } else {
        const current = sphere.spellProgress[sig.id] ?? 0;
        const bar = buildXPBar(current, threshold, 10);
        this.spellText.setText(
          `✧ Заклинание: ${sig.nameRu}\n${bar}  ${current} / ${threshold} XP`
        ).setVisible(true);
      }
      // Позиционируем прямо под панелью статов
      const statsBounds = this.statsText.getBounds();
      this.spellText.setPosition(10, statsBounds.bottom + 4);
    } else {
      this.spellText.setVisible(false);
    }

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

    // ── Полоска каста ─────────────────────────────────
    if (data.aoeCast) {
      const p = Math.min(data.aoeCast.elapsed / data.aoeCast.duration, 1);
      this.castBarBg.setVisible(true);
      this.castBar.setVisible(true);
      this.castBar.width = 160 * p;
      this.castLabel.setText(`◎ ${data.aoeCast.name}  ${data.aoeCast.elapsed.toFixed(1)} / ${data.aoeCast.duration.toFixed(0)}с`).setVisible(true);
    } else {
      this.castBarBg.setVisible(false);
      this.castBar.setVisible(false);
      this.castLabel.setVisible(false);
    }

    // ── Панель выбранной цели ─────────────────────────
    this.updateTargetPanel(data.target);

    // ── Панель квестов ────────────────────────────────
    this.updateQuestPanel(data.quests);
  }

  private updateTargetPanel(target: Creature | null) {
    if (!target || target.isDead) {
      this.targetPanel.setVisible(false);
      return;
    }

    const def = target.definition;
    const lines: string[] = [];

    // Имя и тип урона
    const dmgLabel = def.damageType === 'magic' ? '✦ Магия' : def.damageType === 'ranged' ? '➶ Дальний' : '⚔ Ближний';
    lines.push(`── ${def.nameRu} ──`);
    lines.push(`${dmgLabel}  HP: ${Math.round(target.currentHP)}/${target.maxHP}`);
    lines.push('');

    // Боевые статы
    lines.push('Боевые статы:');
    const npc = def.npcStats ?? {};
    for (const [stat, val] of Object.entries(npc)) {
      if ((val ?? 0) > 0) {
        lines.push(`  ${STAT_NAMES_SHORT[stat as StatName]}: ${val}`);
      }
    }
    lines.push('');

    // Капы (что тело даст Сфере)
    lines.push('Обучает Сферу:');
    for (const [stat, cap] of Object.entries(def.caps)) {
      lines.push(`  ${STAT_NAMES_SHORT[stat as StatName]} → кап ${cap}`);
    }

    // Умение
    lines.push('');
    lines.push(`Умение: ${def.abilityName}`);

    // Заклинание (если есть)
    if (def.signatureSpell) {
      lines.push(`Заклинание: ${def.signatureSpell.nameRu}`);
      lines.push(`  (нужно ${def.spellXPThreshold} XP)`);
    }

    this.targetPanel.setText(lines.join('\n')).setVisible(true);
  }

  private updateQuestPanel(quests: QuestProgress[]) {
    const active = quests.filter(q => !q.completed);
    if (active.length === 0) {
      this.questPanel.setVisible(false);
      return;
    }

    const lines: string[] = ['── Квесты ──'];
    for (const q of active) {
      lines.push(`▸ ${q.def.nameRu}  (+${q.def.xpReward} XP)`);
      for (let i = 0; i < q.def.objectives.length; i++) {
        const obj = q.def.objectives[i];
        const cur = q.counts[i];
        const done = cur >= obj.count ? '✓' : `${cur}/${obj.count}`;
        const verb = obj.type === 'kill'    ? 'Убить'
                   : obj.type === 'capture' ? 'Захватить'
                   :                         'Изучить';
        const name = obj.targetNameRu ?? obj.targetId ?? '';
        lines.push(`  ${verb} ${name}: ${done}`);
      }
    }

    // Позиция: под панелью статов + под заклинанием если видно
    const anchor = this.spellText.visible
      ? this.spellText.getBounds().bottom
      : this.statsText.getBounds().bottom;
    this.questPanel.setPosition(10, anchor + 6);

    this.questPanel.setText(lines.join('\n')).setVisible(true);
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

      const cdText = this.add.text(x, y, '', {
        fontSize: '12px', color: '#ffffff', align: 'center',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1005);
      this.skillSlotsCdText.push(cdText);

      // Клик по слоту 2–8 — открыть пикер
      if (i >= 1) {
        bg.setInteractive({ useHandCursor: true })
          .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
            ptr.event.stopPropagation();
            if (this.skillBarLocked) {
              this.addLog('🔒 Панель заблокирована');
              return;
            }
            if (this.cachedInCombat) {
              this.addLog('⚔ Нельзя менять заклинания в бою');
              return;
            }
            if (this.spellPickerSlot === i) {
              this.closeSpellPicker();
            } else {
              this.openSpellPicker(i);
            }
          });
      }
    }

    // Общий замок — слева от слот-бара
    const barStartX = (GAME_WIDTH - totalW) / 2;
    this.lockBtn = this.add.text(barStartX - 20, GAME_HEIGHT - SKILL_SLOT_SIZE / 2 - 8, '🔓', {
      fontSize: '18px',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1006)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.skillBarLocked = !this.skillBarLocked;
        this.lockBtn.setText(this.skillBarLocked ? '🔒' : '🔓');
        if (this.skillBarLocked) this.closeSpellPicker();
      });

    // Spell picker container (скрыт по умолчанию)
    this.spellPickerContainer = this.add.container(0, 0).setDepth(1100).setVisible(false);
  }

  private openSpellPicker(slotIndex: number) {
    this.spellPickerSlot = slotIndex;
    const spells = this.cachedLearnedSpells;

    // Чистим старое содержимое
    this.spellPickerContainer.removeAll(true);

    const itemSize = SKILL_SLOT_SIZE;
    const gap = SKILL_SLOT_GAP;
    const cols = spells.length + 1; // +1 = "очистить"
    const panelW = cols * itemSize + (cols - 1) * gap + 16;
    const panelH = itemSize + 32;

    const totalSlotW = SKILL_SLOTS_COUNT * SKILL_SLOT_SIZE + (SKILL_SLOTS_COUNT - 1) * SKILL_SLOT_GAP;
    const barStartX = (GAME_WIDTH - totalSlotW) / 2;
    const slotX = barStartX + slotIndex * (itemSize + gap) + itemSize / 2;
    const panelX = Math.min(Math.max(slotX - panelW / 2, 8), GAME_WIDTH - panelW - 8);
    const panelY = GAME_HEIGHT - SKILL_SLOT_SIZE - 8 - panelH - 6;

    // Фон панели
    const bg = this.add.rectangle(panelW / 2, panelH / 2, panelW, panelH, 0x0a0a1a, 0.95)
      .setStrokeStyle(1, 0x4455aa, 0.8);
    this.spellPickerContainer.add(bg);

    // Заголовок
    const label = this.add.text(panelW / 2, 6, `Слот ${slotIndex + 1} — выбери заклинание`, {
      fontSize: '10px', color: '#aaaacc',
    }).setOrigin(0.5, 0);
    this.spellPickerContainer.add(label);

    const itemsY = panelH / 2 + 6;

    // Иконки заклинаний
    spells.forEach((spell, idx) => {
      const ix = 8 + idx * (itemSize + gap) + itemSize / 2;
      const itemBg = this.add.rectangle(ix, itemsY, itemSize, itemSize, 0x1e2244)
        .setStrokeStyle(1, 0x6677cc).setInteractive({ useHandCursor: true })
        .on('pointerover', () => itemBg.setFillStyle(0x2e3466))
        .on('pointerout',  () => itemBg.setFillStyle(0x1e2244))
        .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          ptr.event.stopPropagation();
          this.scene.get('GameScene').events.emit('assign-spell', { slotIndex, spell });
          this.closeSpellPicker();
        });
      const itemText = this.add.text(ix, itemsY, spell.nameRu.slice(0, 7), {
        fontSize: '9px', color: '#aaccff', align: 'center',
      }).setOrigin(0.5);
      const aoeTag = spell.isAoe ? this.add.text(ix, itemsY + 14, 'AoE', {
        fontSize: '8px', color: '#ff9944',
      }).setOrigin(0.5) : null;
      this.spellPickerContainer.add(itemBg);
      this.spellPickerContainer.add(itemText);
      if (aoeTag) this.spellPickerContainer.add(aoeTag);
    });

    // Кнопка "очистить слот"
    const clearIdx = spells.length;
    const cx = 8 + clearIdx * (itemSize + gap) + itemSize / 2;
    const clearBg = this.add.rectangle(cx, itemsY, itemSize, itemSize, 0x221111)
      .setStrokeStyle(1, 0x774444).setInteractive({ useHandCursor: true })
      .on('pointerover', () => clearBg.setFillStyle(0x331111))
      .on('pointerout',  () => clearBg.setFillStyle(0x221111))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.scene.get('GameScene').events.emit('assign-spell', { slotIndex, spell: null });
        this.closeSpellPicker();
      });
    const clearText = this.add.text(cx, itemsY, '✕\nочист.', {
      fontSize: '9px', color: '#ff6666', align: 'center',
    }).setOrigin(0.5);
    this.spellPickerContainer.add(clearBg);
    this.spellPickerContainer.add(clearText);

    this.spellPickerContainer.setPosition(panelX, panelY).setVisible(true);
  }

  private closeSpellPicker() {
    this.spellPickerSlot = -1;
    this.spellPickerContainer.setVisible(false);
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
        this.skillSlotsCdText[i].setText(slot.cooldownRemaining.toFixed(1));
      } else {
        this.skillSlotsCd[i].height = 0;
        this.skillSlotsCdText[i].setText('');
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
  if (needed <= 0) return '[' + '█'.repeat(width) + ']';
  const filled = Math.min(width, Math.max(0, Math.round((current / needed) * width)));
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

const STAT_ORDER: StatName[] = [
  StatName.Strength, StatName.Agility, StatName.Accuracy, StatName.Evasion,
  StatName.Health, StatName.Armor, StatName.Intellect, StatName.Will,
  StatName.Mana, StatName.Luck,
];

