import Phaser from "phaser";
import { Sphere } from "../entities/Sphere";
import { Body } from "../entities/Body";
import { Creature } from "../entities/Creature";
import { StatName } from "../types/stats";
import { CaptureProcess, CaptureState } from "../systems/capture";
import { calcRank, xpToNextLevel } from "../systems/progression";
import { GAME_WIDTH, GAME_HEIGHT, MAP_WIDTH, MAP_HEIGHT } from "../utils/constants";
import { STAT_NAMES_SHORT } from "../utils/statNames";
import { QuestProgress } from "../types/quests";

interface CreatureMapDot {
  x: number; y: number;
  isDead: boolean; isPassive: boolean; isAggro: boolean;
}

interface UIData {
  sphere: Sphere;
  body: Body | null;
  capture: CaptureProcess | null;
  target: Creature | null;
  quests: QuestProgress[];
  deathDebuff: number;
  inCombat: boolean;
  aoeCast: { elapsed: number; duration: number; name: string } | null;
  creatures: CreatureMapDot[];
  playerPos: { x: number; y: number } | null;
}

const SKILL_SLOT_SIZE = 48;
const SKILL_SLOT_GAP = 6;
const SKILL_SLOTS_COUNT = 8;
const HEADER_H = 18;
const PANEL_LEFT_W = 145;
const PANEL_RIGHT_W = 170;
const MM_W = 150;
const MM_H = 100;
const MM_LEFT = GAME_WIDTH - MM_W - 6;
const MM_TOP  = GAME_HEIGHT - MM_H - 74;
const MAP_SCALE_X = MM_W / MAP_WIDTH;
const MAP_SCALE_Y = MM_H / MAP_HEIGHT;

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

  private spellPickerContainer!: Phaser.GameObjects.Container;
  private spellPickerSlot: number = -1;
  private cachedLearnedSpells: import("../types/abilities").AbilityDef[] = [];
  private cachedInCombat: boolean = false;
  private cachedBody: Body | null = null;

  private castBarBg!: Phaser.GameObjects.Rectangle;
  private castBar!: Phaser.GameObjects.Rectangle;
  private castLabel!: Phaser.GameObjects.Text;

  private logMessages: string[] = [];

  // Collapsible panel state
  private collapsed: Record<string, boolean> = {
    sphere: false, spells: false, quests: false,
    body: false, target: false, log: false, minimap: false,
  };
  // Panel headers (Container: [0]=bg rect, [1]=label text, [2]=arrow text)
  private hdrSphere!: Phaser.GameObjects.Container;
  private hdrSpells!: Phaser.GameObjects.Container;
  private hdrQuests!: Phaser.GameObjects.Container;
  private hdrBody!: Phaser.GameObjects.Container;
  private hdrTarget!: Phaser.GameObjects.Container;
  private hdrLog!: Phaser.GameObjects.Container;
  private hdrMinimap!: Phaser.GameObjects.Container;

  // Mini-map
  private minimapBorder!: Phaser.GameObjects.Rectangle;
  private minimapGfx!: Phaser.GameObjects.Graphics;

  constructor() { super({ key: "UIScene" }); }

  create() {
    // Stats text (left, under sphere header)
    this.statsText = this.add.text(10, 10 + HEADER_H, '', {
      fontSize: '12px', color: '#aaeeff', lineSpacing: 5,
      backgroundColor: '#000000bb', padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(1000);

    // Spell progress text
    this.spellText = this.add.text(10, 200, '', {
      fontSize: '11px', color: '#ddaaff', lineSpacing: 3,
      backgroundColor: '#000000bb', padding: { x: 8, y: 5 },
    }).setScrollFactor(0).setDepth(1000).setVisible(false);

    // Target panel (right side)
    this.targetPanel = this.add.text(GAME_WIDTH - 10, 90, '', {
      fontSize: '11px', color: '#ffddaa', align: 'right', lineSpacing: 4,
      backgroundColor: '#000000bb', padding: { x: 8, y: 6 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000).setVisible(false);

    // Quest panel (left side)
    this.questPanel = this.add.text(10, 300, '', {
      fontSize: '11px', color: '#ffeeaa', lineSpacing: 3,
      backgroundColor: '#000000bb', padding: { x: 8, y: 6 },
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(1000).setVisible(false);

    // Resources (bottom center, above skill bar)
    this.resourceText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 72, '', {
      fontSize: '13px', color: '#ffffff', align: 'center',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1000);

    // Body info (right top)
    this.bodyInfoText = this.add.text(GAME_WIDTH - 10, 10 + HEADER_H, '', {
      fontSize: '11px', color: '#cccccc', align: 'right',
      backgroundColor: '#000000aa', padding: { x: 6, y: 4 },
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    // Hint text
    this.hintText = this.add.text(10, GAME_HEIGHT - 12, '', {
      fontSize: '11px', color: '#666677',
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(1000);

    // Log text (bottom left)
    this.logText = this.add.text(10, GAME_HEIGHT - 130, '', {
      fontSize: '10px', color: '#aaaaaa', lineSpacing: 3,
    }).setScrollFactor(0).setDepth(1000);

    // Capture bar
    this.captureBarBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 140, 10, 0x333333)
      .setScrollFactor(0).setDepth(1001).setVisible(false);
    this.captureBar = this.add.rectangle(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 40, 0, 10, 0x66ccff)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 26, 'Захват...', {
      fontSize: '11px', color: '#66ccff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Cast bar (above skill bar)
    const castY = GAME_HEIGHT - 72;
    this.castBarBg = this.add.rectangle(GAME_WIDTH / 2, castY, 160, 10, 0x222222)
      .setScrollFactor(0).setDepth(1001).setVisible(false);
    this.castBar = this.add.rectangle(GAME_WIDTH / 2 - 80, castY, 0, 10, 0xff8800)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);
    this.castLabel = this.add.text(GAME_WIDTH / 2, castY - 14, '', {
      fontSize: '11px', color: '#ff8800',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setVisible(false);

    // Skill bar
    this.buildSkillBar();

    // Panel headers
    this.hdrSphere  = this.makeHeader('sphere',  10,                        10, PANEL_LEFT_W);
    this.hdrSpells  = this.makeHeader('spells',  10,                       200, PANEL_LEFT_W);
    this.hdrQuests  = this.makeHeader('quests',  10,                       300, PANEL_LEFT_W);
    this.hdrBody    = this.makeHeader('body',    GAME_WIDTH - 10 - PANEL_RIGHT_W, 10,  PANEL_RIGHT_W);
    this.hdrTarget  = this.makeHeader('target',  GAME_WIDTH - 10 - PANEL_RIGHT_W, 90,  PANEL_RIGHT_W);
    this.hdrLog     = this.makeHeader('log',     10, GAME_HEIGHT - 130 - HEADER_H, PANEL_LEFT_W);
    this.hdrMinimap = this.makeHeader('minimap', MM_LEFT, MM_TOP - HEADER_H - 2, MM_W);

    // Mini-map background border
    this.minimapBorder = this.add.rectangle(MM_LEFT, MM_TOP, MM_W, MM_H, 0x0a0f1a, 0.88)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1008)
      .setStrokeStyle(1, 0x334466, 0.9);

    // Mini-map graphics
    this.minimapGfx = this.add.graphics().setScrollFactor(0).setDepth(1009);

    // Events from GameScene
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
    gs.events.on('save-loaded', () => this.addLog('↺ Прогресс загружен из сохранения'));
    gs.events.on('aoe-targeting', (name: string) => {
      this.addLog(`◎ Прицеливание: ${name}  [ЛКМ] выстрел  [ПКМ/ESC] отмена`);
    });
    gs.events.on('spell-out-of-range', () => this.addLog('✗ Слишком далеко для заклинания'));
  }

  // ── Header helper ──────────────────────────────────────

  private makeHeader(panelId: string, x: number, y: number, width: number): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(0, 0, width, HEADER_H, 0x0e1020, 0.93)
      .setOrigin(0, 0).setStrokeStyle(1, 0x2d3a55, 0.8);
    const label = this.add.text(7, 3, '', {
      fontSize: '11px', color: '#8899bb',
    }).setOrigin(0, 0);
    const arrow = this.add.text(width - 5, 3, '▼', {
      fontSize: '9px', color: '#445566',
    }).setOrigin(1, 0);

    const container = this.add.container(x, y, [bg, label, arrow])
      .setScrollFactor(0).setDepth(1010)
      .setSize(width, HEADER_H)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => (bg as Phaser.GameObjects.Rectangle).setFillStyle(0x182038, 0.98))
      .on('pointerout',  () => (bg as Phaser.GameObjects.Rectangle).setFillStyle(0x0e1020, 0.93))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.collapsed[panelId] = !this.collapsed[panelId];
        (arrow as Phaser.GameObjects.Text).setText(this.collapsed[panelId] ? '▶' : '▼');
      });
    return container;
  }

  private setHeaderLabel(hdr: Phaser.GameObjects.Container, text: string) {
    (hdr.getAt(1) as Phaser.GameObjects.Text).setText(text);
  }

  // ── updateUI ──────────────────────────────────────────

  private updateUI(data: UIData) {
    const { sphere, body, capture } = data;

    // Cache for spell picker
    this.cachedLearnedSpells = sphere.learnedSpells;
    this.cachedInCombat = data.inCombat ?? false;
    this.cachedBody = body;
    if (this.cachedInCombat && this.spellPickerSlot >= 0) this.closeSpellPicker();

    // ── Sphere panel ────────────────────────────────────
    const rank = calcRank(sphere.stats);
    const caps = body?.definition.caps ?? {};
    const xpTracker = sphere.xpTracker;
    const debuffSecs = Math.ceil(data.deathDebuff ?? 0);
    const debuffStr = debuffSecs > 0 ? `  ⚠ ${debuffSecs}с` : '';

    const statLines: string[] = [];
    for (const stat of STAT_ORDER) {
      const val = sphere.stats[stat];
      const cap = caps[stat];
      const isActive = cap !== undefined;
      const isCapped = cap !== undefined && val >= cap;
      let line = `${STAT_NAMES_SHORT[stat]}: ${val}`;
      if (isActive && xpTracker) {
        if (isCapped) {
          line += ' [КАП]';
        } else {
          const currentXP = xpTracker[stat];
          const needed = xpToNextLevel(val);
          line += ` ${buildXPBar(currentXP, needed, 8)} ${currentXP}/${needed}`;
        }
      }
      if (cap !== undefined) line = `► ${line}  (кап ${cap})`;
      statLines.push(line);
    }

    const sphereHeaderY = 10;
    this.hdrSphere.setY(sphereHeaderY);
    this.setHeaderLabel(this.hdrSphere, `Сфера  Ранг ${rank.toFixed(1)}${debuffStr}`);
    this.statsText.setY(sphereHeaderY + HEADER_H);
    this.statsText.setText(statLines.join('\n')).setVisible(!this.collapsed.sphere);

    const sphereBottom = this.collapsed.sphere
      ? sphereHeaderY + HEADER_H
      : this.statsText.getBounds().bottom;

    // ── Spells panel ────────────────────────────────────
    const sig = body?.definition.signatureSpell;
    const threshold = body?.definition.spellXPThreshold;
    const hasSpell = !!(sig && threshold);
    const spellsHeaderY = sphereBottom + 4;
    this.hdrSpells.setY(spellsHeaderY).setVisible(hasSpell);

    if (hasSpell && sig && threshold) {
      const alreadyLearned = sphere.learnedSpells.some(s => s.id === sig.id);
      this.setHeaderLabel(this.hdrSpells,
        alreadyLearned ? `✦ ${sig.nameRu} — ИЗУЧЕНО` : `✧ ${sig.nameRu}`);

      if (!this.collapsed.spells) {
        this.spellText.setPosition(10, spellsHeaderY + HEADER_H).setVisible(true);
        if (alreadyLearned) {
          this.spellText.setText(`✦ ${sig.nameRu} — ИЗУЧЕНО`);
        } else {
          const current = sphere.spellProgress[sig.id] ?? 0;
          this.spellText.setText(
            `✧ Заклинание: ${sig.nameRu}\n${buildXPBar(current, threshold, 10)}  ${current} / ${threshold} XP`
          );
        }
      } else {
        this.spellText.setVisible(false);
      }
    } else {
      this.spellText.setVisible(false);
    }

    const spellsBottom = !hasSpell
      ? spellsHeaderY
      : this.collapsed.spells
        ? spellsHeaderY + HEADER_H
        : this.spellText.getBounds().bottom;

    // ── Quests panel ────────────────────────────────────
    const activeQuests = data.quests.filter(q => !q.completed);
    const questsHeaderY = spellsBottom + (hasSpell ? 4 : 0);
    this.hdrQuests.setY(questsHeaderY).setVisible(activeQuests.length > 0);

    if (activeQuests.length > 0) {
      this.setHeaderLabel(this.hdrQuests, `Квесты (${activeQuests.length})`);
      if (!this.collapsed.quests) {
        const qLines: string[] = [];
        for (const q of activeQuests) {
          qLines.push(`▸ ${q.def.nameRu}  (+${q.def.xpReward} XP)`);
          for (let i = 0; i < q.def.objectives.length; i++) {
            const obj = q.def.objectives[i];
            const cur = q.counts[i];
            const done = cur >= obj.count ? '✓' : `${cur}/${obj.count}`;
            const verb = obj.type === 'kill'    ? 'Убить'
                       : obj.type === 'capture' ? 'Захватить'
                       :                         'Изучить';
            const name = obj.targetNameRu ?? obj.targetId ?? '';
            qLines.push(`  ${verb} ${name}: ${done}`);
          }
        }
        this.questPanel.setPosition(10, questsHeaderY + HEADER_H)
          .setText(qLines.join('\n')).setVisible(true);
      } else {
        this.questPanel.setVisible(false);
      }
    } else {
      this.questPanel.setVisible(false);
    }

    // ── Resources (always visible when in body) ─────────
    if (body) {
      const hpPct  = Math.round((body.currentHP   / body.maxHP)   * 100);
      const manaPct = Math.round((body.currentMana / body.maxMana) * 100);
      this.resourceText.setText(
        `HP ${Math.round(body.currentHP)}/${body.maxHP} (${hpPct}%)   Мана ${Math.round(body.currentMana)}/${body.maxMana} (${manaPct}%)`
      ).setVisible(true);
      this.hintText.setText('[1] Атака  [Q] Выйти из тела  [E] Захват');
    } else {
      this.resourceText.setVisible(false);
      this.hintText.setText('[WASD] Движение  [E] Захватить тело');
    }

    // ── Capture bar ─────────────────────────────────────
    if (capture?.state === CaptureState.Casting) {
      const p = capture.elapsed / capture.duration;
      this.captureBarBg.setVisible(true);
      this.captureBar.setVisible(true);
      this.captureBar.width = 140 * p;
    } else {
      this.captureBarBg.setVisible(false);
      this.captureBar.setVisible(false);
    }

    // ── Skill bar ────────────────────────────────────────
    this.updateSkillBar(body);

    // ── Cast bar ─────────────────────────────────────────
    if (data.aoeCast) {
      const p = Math.min(data.aoeCast.elapsed / data.aoeCast.duration, 1);
      this.castBarBg.setVisible(true);
      this.castBar.setVisible(true);
      this.castBar.width = 160 * p;
      this.castLabel.setText(
        `◎ ${data.aoeCast.name}  ${data.aoeCast.elapsed.toFixed(1)} / ${data.aoeCast.duration.toFixed(0)}с`
      ).setVisible(true);
    } else {
      this.castBarBg.setVisible(false);
      this.castBar.setVisible(false);
      this.castLabel.setVisible(false);
    }

    // ── Body panel (right) ───────────────────────────────
    const bodyHeaderY = 10;
    this.hdrBody.setY(bodyHeaderY).setVisible(!!body);
    if (body) {
      this.setHeaderLabel(this.hdrBody, body.definition.nameRu);
      this.bodyInfoText.setY(bodyHeaderY + HEADER_H);
      if (!this.collapsed.body) {
        this.bodyInfoText.setText(
          `── ${body.definition.nameRu} ──\n` +
          `Оружие: ${body.weapon.nameRu}  КД: ${body.weapon.cooldown}с`
        ).setVisible(true);
      } else {
        this.bodyInfoText.setVisible(false);
      }
    } else {
      this.bodyInfoText.setVisible(false);
    }

    const bodyBottom = (!body)
      ? bodyHeaderY
      : this.collapsed.body
        ? bodyHeaderY + HEADER_H
        : this.bodyInfoText.getBounds().bottom;

    // ── Target panel (right) ─────────────────────────────
    const targetHeaderY = body ? bodyBottom + 4 : bodyHeaderY;
    this.hdrTarget.setY(targetHeaderY);

    const target = data.target;
    if (target && !target.isDead) {
      const hpPct = Math.round((target.currentHP / target.maxHP) * 100);
      this.setHeaderLabel(this.hdrTarget, `${target.definition.nameRu}  ${hpPct}%`);
      this.hdrTarget.setVisible(true);

      if (!this.collapsed.target) {
        const def = target.definition;
        const dmgLabel = def.damageType === 'magic'  ? '✦ Магия'
                       : def.damageType === 'ranged' ? '➶ Дальний' : '⚔ Ближний';
        const tLines: string[] = [
          `── ${def.nameRu} ──`,
          `${dmgLabel}  HP: ${Math.round(target.currentHP)}/${target.maxHP}`,
          '',
          'Боевые статы:',
        ];
        const npc = def.npcStats ?? {};
        for (const [stat, val] of Object.entries(npc)) {
          if ((val ?? 0) > 0) tLines.push(`  ${STAT_NAMES_SHORT[stat as StatName]}: ${val}`);
        }
        tLines.push('', 'Обучает Сферу:');
        for (const [stat, cap] of Object.entries(def.caps)) {
          tLines.push(`  ${STAT_NAMES_SHORT[stat as StatName]} → кап ${cap}`);
        }
        tLines.push('', `Умение: ${def.abilityName}`);
        if (def.signatureSpell) {
          tLines.push(`Заклинание: ${def.signatureSpell.nameRu}`);
          tLines.push(`  (нужно ${def.spellXPThreshold} XP)`);
        }
        this.targetPanel.setY(targetHeaderY + HEADER_H)
          .setText(tLines.join('\n')).setVisible(true);
      } else {
        this.targetPanel.setVisible(false);
      }
    } else {
      this.hdrTarget.setVisible(false);
      this.targetPanel.setVisible(false);
    }

    // ── Log panel ────────────────────────────────────────
    this.logText.setVisible(!this.collapsed.log);

    // ── Mini-map ─────────────────────────────────────────
    this.drawMinimap(data);
  }

  // ── Mini-map renderer ─────────────────────────────────

  private drawMinimap(data: UIData) {
    const collapsed = this.collapsed.minimap;
    this.minimapBorder.setVisible(!collapsed);
    this.minimapGfx.clear();
    if (collapsed) return;

    const g = this.minimapGfx;

    // Safe zone tint (world x:224-480, y:256-448)
    g.fillStyle(0x2244aa, 0.22);
    g.fillRect(
      MM_LEFT + 224 * MAP_SCALE_X,
      MM_TOP  + 256 * MAP_SCALE_Y,
      256 * MAP_SCALE_X,
      192 * MAP_SCALE_Y,
    );

    // Zone tints
    // Bear zone: x1200-1520, y210-420
    g.fillStyle(0x664422, 0.18);
    g.fillRect(MM_LEFT + 1200 * MAP_SCALE_X, MM_TOP + 210 * MAP_SCALE_Y,
               320 * MAP_SCALE_X, 210 * MAP_SCALE_Y);
    // Orc zone: x1110-1380, y500-760
    g.fillStyle(0x446633, 0.18);
    g.fillRect(MM_LEFT + 1110 * MAP_SCALE_X, MM_TOP + 500 * MAP_SCALE_Y,
               270 * MAP_SCALE_X, 260 * MAP_SCALE_Y);
    // Shaman zone: x410-680, y770-940
    g.fillStyle(0x9944aa, 0.18);
    g.fillRect(MM_LEFT + 410 * MAP_SCALE_X, MM_TOP + 770 * MAP_SCALE_Y,
               270 * MAP_SCALE_X, 170 * MAP_SCALE_Y);

    // Creatures
    for (const c of data.creatures) {
      if (c.isDead) continue;
      const cx = MM_LEFT + c.x * MAP_SCALE_X;
      const cy = MM_TOP  + c.y * MAP_SCALE_Y;
      if (c.isPassive) {
        g.fillStyle(0x888888, 0.75);
      } else if (c.isAggro) {
        g.fillStyle(0xff3333, 1.0);
      } else {
        g.fillStyle(0xcc4444, 0.65);
      }
      g.fillRect(cx - 1, cy - 1, 2, 2);
    }

    // Player dot
    if (data.playerPos) {
      const px = MM_LEFT + data.playerPos.x * MAP_SCALE_X;
      const py = MM_TOP  + data.playerPos.y * MAP_SCALE_Y;
      g.fillStyle(0x44aaff, 1.0);
      g.fillRect(px - 1.5, py - 1.5, 3, 3);
      g.lineStyle(1, 0xaaddff, 0.55);
      g.strokeRect(px - 2.5, py - 2.5, 5, 5);
    }
  }

  // ── Skill bar ─────────────────────────────────────────

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

      // Click on slot 2-8 → open spell picker
      if (i >= 1) {
        bg.setInteractive({ useHandCursor: true })
          .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
            ptr.event.stopPropagation();
            if (this.skillBarLocked) { this.addLog('🔒 Панель заблокирована'); return; }
            if (this.cachedInCombat) { this.addLog('⚔ Нельзя менять заклинания в бою'); return; }
            if (this.spellPickerSlot === i) this.closeSpellPicker();
            else this.openSpellPicker(i);
          });
      }
    }

    // Global lock button
    const totalW2 = SKILL_SLOTS_COUNT * SKILL_SLOT_SIZE + (SKILL_SLOTS_COUNT - 1) * SKILL_SLOT_GAP;
    const barStartX = (GAME_WIDTH - totalW2) / 2;
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

    // Spell picker container (hidden by default)
    this.spellPickerContainer = this.add.container(0, 0).setDepth(1100).setVisible(false);
  }

  private openSpellPicker(slotIndex: number) {
    this.spellPickerSlot = slotIndex;
    const usedIds = new Set(
      this.cachedBody?.abilitySlots
        .filter((s, i) => i !== slotIndex && s.ability)
        .map(s => s.ability!.id) ?? []
    );
    const spells = this.cachedLearnedSpells.filter(s => !usedIds.has(s.id));

    this.spellPickerContainer.removeAll(true);

    const itemSize = SKILL_SLOT_SIZE;
    const gap = SKILL_SLOT_GAP;
    const cols = spells.length + 1;
    const panelW = cols * itemSize + (cols - 1) * gap + 16;
    const panelH = itemSize + 32;

    const totalSlotW = SKILL_SLOTS_COUNT * SKILL_SLOT_SIZE + (SKILL_SLOTS_COUNT - 1) * SKILL_SLOT_GAP;
    const barStartX = (GAME_WIDTH - totalSlotW) / 2;
    const slotX = barStartX + slotIndex * (itemSize + gap) + itemSize / 2;
    const panelX = Math.min(Math.max(slotX - panelW / 2, 8), GAME_WIDTH - panelW - 8);
    const panelY = GAME_HEIGHT - SKILL_SLOT_SIZE - 8 - panelH - 6;

    const bg = this.add.rectangle(panelW / 2, panelH / 2, panelW, panelH, 0x0a0a1a, 0.95)
      .setStrokeStyle(1, 0x4455aa, 0.8);
    this.spellPickerContainer.add(bg);

    const label = this.add.text(panelW / 2, 6, `Слот ${slotIndex + 1} — выбери заклинание`, {
      fontSize: '10px', color: '#aaaacc',
    }).setOrigin(0.5, 0);
    this.spellPickerContainer.add(label);

    const itemsY = panelH / 2 + 6;

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
