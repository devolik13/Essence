import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { Creature } from '../entities/Creature';
import { StatName } from '../types/stats';
import { CaptureProcess, CaptureState } from '../systems/capture';
import { calcRank, xpToNextLevel } from '../systems/progression';
import { GAME_WIDTH, GAME_HEIGHT, MAP_WIDTH, MAP_HEIGHT } from '../utils/constants';
import { STAT_NAMES_SHORT } from '../utils/statNames';
import { QuestProgress } from '../types/quests';
import { InventoryItem } from '../types/items';
import { ITEMS } from '../data/itemDB';
import { ACHIEVEMENTS, AchievementDef } from '../data/achievementDB';
import { getAllAchievementStatus } from '../systems/achievements';
import { STATUS_DEFS } from '../types/statuses';

const UI_LAYOUT_KEY = 'essence_ui_layout_v1';
const HEADER_H = 20;
const WIN_W = 310;
const WIN_TITLE_H = 22;

type WindowType = 'stats' | 'inventory' | 'quests' | 'achievements';
const SKILL_SLOT_SIZE = 48;
const SKILL_SLOT_GAP = 6;
const SKILL_SLOTS_COUNT = 8;

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
  activeEnchantId: string | null;
  inCombat: boolean;
  aoeCast: { elapsed: number; duration: number; name: string } | null;
  creatures: CreatureMapDot[];
  playerPos: { x: number; y: number } | null;
  inventory: InventoryItem[];
  unlockedAchievements: string[];
  trackedQuestIds: string[];
}

interface PanelState {
  x: number; y: number;
  w: number; h: number;   // h only used for minimap
  collapsed: boolean;
}

export class UIScene extends Phaser.Scene {
  // ── Fixed content text objects ────────────────────────
  private targetPanel!: Phaser.GameObjects.Text;
  private resourceText!:Phaser.GameObjects.Text;
  private statusBarText!:Phaser.GameObjects.Text;
  private bodyInfoText!:Phaser.GameObjects.Text;
  private hintText!:    Phaser.GameObjects.Text;
  private logText!:     Phaser.GameObjects.Text;
  private captureBar!:  Phaser.GameObjects.Rectangle;

  // ── Tracked quest HUD (top-left) ──────────────────────
  private trackedQuestText!: Phaser.GameObjects.Text;

  // ── Menu buttons ──────────────────────────────────────
  private menuBtnBgs:   Phaser.GameObjects.Rectangle[] = [];
  private menuBtnTexts: Phaser.GameObjects.Text[]      = [];
  private readonly menuBtnTypes: WindowType[] = ['stats', 'inventory', 'quests', 'achievements'];

  // ── Floating window ───────────────────────────────────
  private currentWindow: WindowType | null = null;
  private windowContainer!: Phaser.GameObjects.Container;
  private windowTitleText!: Phaser.GameObjects.Text;
  private windowContentText!: Phaser.GameObjects.Text;
  private windowInteractables: Phaser.GameObjects.Text[] = [];
  private windowX: number = 200;
  private windowY: number = 50;
  private windowW: number = 310;
  private windowH: number = 380;
  private winBg!: Phaser.GameObjects.Rectangle;
  private winTitleBg!: Phaser.GameObjects.Rectangle;
  private winCloseBtn!: Phaser.GameObjects.Text;
  private cachedUIData: UIData | null = null;
  private captureBarBg!:Phaser.GameObjects.Rectangle;
  private castBarBg!:   Phaser.GameObjects.Rectangle;
  private castBar!:     Phaser.GameObjects.Rectangle;
  private castLabel!:   Phaser.GameObjects.Text;

  // ── Skill bar ─────────────────────────────────────────
  private skillSlotsBg:      Phaser.GameObjects.Rectangle[] = [];
  private skillSlotsIcon:    Phaser.GameObjects.Text[]      = [];
  private skillSlotsKey:     Phaser.GameObjects.Text[]      = [];
  private skillSlotsCd:      Phaser.GameObjects.Rectangle[] = [];
  private skillSlotsCdText:  Phaser.GameObjects.Text[]      = [];
  private skillBarLocked:    boolean = false;
  private lockBtn!:          Phaser.GameObjects.Text;
  private spellPickerContainer!: Phaser.GameObjects.Container;
  private spellPickerSlot:   number = -1;
  private cachedLearnedSpells: import('../types/abilities').AbilityDef[] = [];
  private cachedInCombat:    boolean = false;
  private cachedBody:        Body | null = null;

  // ── Log ───────────────────────────────────────────────
  private logMessages: string[] = [];

  // ── Achievement notifications ─────────────────────────
  private achievementNotifBg!:   Phaser.GameObjects.Rectangle;
  private achievementNotifText!: Phaser.GameObjects.Text;
  private achievementNotifTimer: number = 0;
  private achievementNotifQueue: AchievementDef[] = [];

  // ── Panel state (position, size, collapsed) ───────────
  private panelStates: Record<string, PanelState> = {
    body:    { x: GAME_WIDTH-180, y: 10,  w: 170, h: 0,   collapsed: false },
    target:  { x: GAME_WIDTH-180, y: 110, w: 170, h: 0,   collapsed: false },
    log:     { x: 10,             y: 475, w: 210, h: 0,   collapsed: false },
    minimap: { x: GAME_WIDTH-156, y: 440, w: 150, h: 100, collapsed: false },
  };

  // ── Panel header containers ───────────────────────────
  // Each: [0]=bg rect  [1]=label text  [2]=arrow text
  private panelHeaders: Record<string, Phaser.GameObjects.Container> = {};

  // ── Resize grips ──────────────────────────────────────
  private grips: Record<string, Phaser.GameObjects.Rectangle> = {};

  // ── Mini-map graphics ─────────────────────────────────
  private minimapBorder!: Phaser.GameObjects.Rectangle;
  private minimapGfx!:    Phaser.GameObjects.Graphics;

  constructor() { super({ key: 'UIScene' }); }

  create() {
    // Load saved layout before creating anything
    this.loadUILayout();

    // ── Fixed UI elements (not in panels) ──────────────
    this.resourceText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 72, '', {
      fontSize: '13px', color: '#ffffff', align: 'center',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1000);

    this.hintText = this.add.text(10, GAME_HEIGHT - 12, '', {
      fontSize: '11px', color: '#666677',
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(1000);

    this.statusBarText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 55, '', {
      fontSize: '11px', color: '#ffffff', align: 'center',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1000);

    this.captureBarBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 140, 10, 0x333333)
      .setScrollFactor(0).setDepth(1001).setVisible(false);
    this.captureBar = this.add.rectangle(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 40, 0, 10, 0x66ccff)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 26, 'Захват...', {
      fontSize: '11px', color: '#66ccff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    const castY = GAME_HEIGHT - 72;
    this.castBarBg = this.add.rectangle(GAME_WIDTH / 2, castY, 160, 10, 0x222222)
      .setScrollFactor(0).setDepth(1001).setVisible(false);
    this.castBar = this.add.rectangle(GAME_WIDTH / 2 - 80, castY, 0, 10, 0xff8800)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);
    this.castLabel = this.add.text(GAME_WIDTH / 2, castY - 14, '', {
      fontSize: '11px', color: '#ff8800',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setVisible(false);

    // ── Tracked quest HUD (top-left) ─────────────────────
    this.trackedQuestText = this.add.text(10, 10, '', {
      fontSize: '11px', color: '#ffeeaa', lineSpacing: 4,
      backgroundColor: '#000000bb', padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(1000).setVisible(false);

    // ── Panel content text objects (positioned in updateUI) ──
    this.targetPanel = this.add.text(0, 0, '', {
      fontSize: '11px', color: '#ffddaa', lineSpacing: 4,
      backgroundColor: '#000000bb', padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(1000).setVisible(false);

    this.bodyInfoText = this.add.text(0, 0, '', {
      fontSize: '11px', color: '#cccccc',
      backgroundColor: '#000000aa', padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setDepth(1000);

    this.logText = this.add.text(0, 0, '', {
      fontSize: '10px', color: '#aaaaaa', lineSpacing: 3,
    }).setScrollFactor(0).setDepth(1000);

    // Achievement unlock notification (top-center, fades out)
    this.achievementNotifBg = this.add.rectangle(GAME_WIDTH / 2, 60, 280, 36, 0x112233, 0.93)
      .setScrollFactor(0).setDepth(1200).setStrokeStyle(2, 0xffcc44, 0.9).setVisible(false);
    this.achievementNotifText = this.add.text(GAME_WIDTH / 2, 60, '', {
      fontSize: '12px', color: '#ffcc44', align: 'center',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1201).setVisible(false);

    // ── Mini-map ──────────────────────────────────────────
    const mm = this.panelStates.minimap;
    this.minimapBorder = this.add.rectangle(mm.x, mm.y + HEADER_H, mm.w, mm.h, 0x0a0f1a, 0.88)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1008)
      .setStrokeStyle(1, 0x334466, 0.9);
    this.minimapGfx = this.add.graphics().setScrollFactor(0).setDepth(1009);

    // ── Panel headers (draggable) ──────────────────────────
    this.panelHeaders['body']    = this.makeHeader('body',    'Тело');
    this.panelHeaders['target']  = this.makeHeader('target',  'Цель');
    this.panelHeaders['log']     = this.makeHeader('log',     'Лог');
    this.panelHeaders['minimap'] = this.makeHeader('minimap', 'Карта');

    // ── Resize grips ───────────────────────────────────────
    for (const id of Object.keys(this.panelStates)) {
      this.grips[id] = this.makeResizeGrip(id, id === 'minimap');
    }

    // ── Notification ticker ───────────────────────────────
    this.time.addEvent({
      delay: 50,
      loop: true,
      callback: this.tickAchievementNotif,
      callbackScope: this,
    });

    // ── Skill bar ─────────────────────────────────────────
    this.buildSkillBar();

    // ── Menu buttons ──────────────────────────────────────
    this.buildMenuButtons();

    // ── Floating window ───────────────────────────────────
    this.buildFloatingWindow();

    // ── Events ────────────────────────────────────────────
    const gs = this.scene.get('GameScene');
    gs.events.on('update-ui', (data: UIData) => this.updateUI(data));
    gs.events.on('stat-up', (data: { stat: StatName; newValue: number }) => {
      this.addLog(`▲ ${STAT_NAMES_SHORT[data.stat]} → ${data.newValue}`);
    });
    gs.events.on('creature-killed', (data: { name: string; xp: number; stats: StatName[] }) => {
      const s = data.stats.map(s => STAT_NAMES_SHORT[s]).join(', ');
      this.addLog(`${data.name} убит  +${data.xp} XP → [${s}]`);
    });
    gs.events.on('player-died', (data: { xpLost: number; debuffDuration: number }) => {
      this.addLog('⚠ Тело погибло. Вы в астрале.');
      if (data?.xpLost > 0) this.addLog(`  ↓ Потеряно ${data.xpLost} XP`);
      this.addLog(`  ✦ Слабость: −15% урон на ${data?.debuffDuration ?? 30}с`);
    });
    gs.events.on('body-captured', (name: string) => this.addLog(`✦ Захвачено: ${name}`));
    gs.events.on('capture-available', (name: string) => this.addLog(`${name} — [E] захват`));
    gs.events.on('capture-start', (name: string) => this.addLog(`Захват ${name}...`));
    gs.events.on('spell-learned', (spell: import('../types/abilities').AbilityDef) => {
      this.addLog(`★ Изучено: ${spell.nameRu}`);
    });
    gs.events.on('spell-locked', (data: { spell: import('../types/abilities').AbilityDef; prereqId: string }) => {
      this.addLog(`✗ ${data.spell.nameRu} — сначала выучи базовое умение`);
    });
    gs.events.on('quest-complete', (data: { name: string; xp: number }) => {
      this.addLog(`✦ КВЕСТ: ${data.name}  +${data.xp} XP`);
    });
    gs.events.on('quest-giver-talk', (data: { active: import('../types/quests').QuestProgress[]; done: import('../types/quests').QuestProgress[] }) => {
      this.addLog('── Следопыт ──');
      if (data.active.length === 0) {
        this.addLog('  Все задания выполнены!');
      } else {
        for (const q of data.active) {
          const progress = q.counts.map((c, i) =>
            `${c}/${q.def.objectives[i].count}`
          ).join(', ');
          this.addLog(`  ▸ ${q.def.nameRu} [${progress}]  +${q.def.xpReward} XP`);
        }
      }
      if (data.done.length > 0) {
        this.addLog(`  ✓ Выполнено заданий: ${data.done.length}`);
      }
    });
    gs.events.on('save-loaded', () => this.addLog('↺ Прогресс загружен'));
    gs.events.on('aoe-targeting', (name: string) => {
      this.addLog(`◎ Прицеливание: ${name}  [ЛКМ/ПКМ]`);
    });
    gs.events.on('spell-out-of-range', () => this.addLog('✗ Слишком далеко'));
    gs.events.on('loot-dropped', (data: { creatureName: string; loot: string }) => {
      this.addLog(`↓ ${data.loot}`);
    });
    gs.events.on('achievement-unlocked', (ach: AchievementDef) => {
      this.achievementNotifQueue.push(ach);
      this.addLog(`★ Ачивка: ${ach.nameRu}`);
    });
  }

  // ── Panel header factory ─────────────────────────────

  private makeHeader(panelId: string, defaultLabel: string): Phaser.GameObjects.Container {
    const state = this.panelStates[panelId];
    let dragMoved = false;

    const bg = this.add.rectangle(0, 0, state.w, HEADER_H, 0x0e1020, 0.93)
      .setOrigin(0, 0).setStrokeStyle(1, 0x2d3a55, 0.8);
    const label = this.add.text(7, 3, defaultLabel, {
      fontSize: '11px', color: '#8899bb',
    }).setOrigin(0, 0);
    const arrow = this.add.text(state.w - 5, 3, '▼', {
      fontSize: '9px', color: '#445566',
    }).setOrigin(1, 0);

    // Drag cursor icon (small grip dots)
    const grip3 = this.add.text(state.w / 2, 3, '⋮⋮', {
      fontSize: '9px', color: '#334455',
    }).setOrigin(0.5, 0);

    const container = this.add.container(state.x, state.y, [bg, label, arrow, grip3])
      .setScrollFactor(0).setDepth(1010)
      .setSize(state.w, HEADER_H)
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, state.w, HEADER_H),
        Phaser.Geom.Rectangle.Contains,
      )
      .on('pointerover', () => {
        (bg as Phaser.GameObjects.Rectangle).setFillStyle(0x182038, 0.98);
        this.input.setDefaultCursor('grab');
      })
      .on('pointerout', () => {
        (bg as Phaser.GameObjects.Rectangle).setFillStyle(0x0e1020, 0.93);
        this.input.setDefaultCursor('default');
      })
      .on('dragstart', () => { dragMoved = false; })
      .on('drag', (_ptr: Phaser.Input.Pointer, dx: number, dy: number) => {
        dragMoved = true;
        state.x = Math.max(0, Math.min(GAME_WIDTH  - state.w, dx));
        state.y = Math.max(0, Math.min(GAME_HEIGHT - HEADER_H, dy));
        container.setPosition(state.x, state.y);
        this.input.setDefaultCursor('grabbing');
      })
      .on('dragend', () => {
        if (dragMoved) this.saveUILayout();
        this.input.setDefaultCursor('default');
      })
      .on('pointerup', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        if (!dragMoved) {
          state.collapsed = !state.collapsed;
          (arrow as Phaser.GameObjects.Text).setText(state.collapsed ? '▶' : '▼');
          this.saveUILayout();
        }
        dragMoved = false;
      });

    this.input.setDraggable(container);
    return container;
  }

  private resizeHeader(panelId: string) {
    const state = this.panelStates[panelId];
    const hdr = this.panelHeaders[panelId];
    if (!hdr) return;
    const w = state.w;
    (hdr.getAt(0) as Phaser.GameObjects.Rectangle).width = w;
    (hdr.getAt(2) as Phaser.GameObjects.Text).setX(w - 5);   // arrow
    (hdr.getAt(3) as Phaser.GameObjects.Text).setX(w / 2);   // grip dots
    hdr.setSize(w, HEADER_H);
    // Update hitArea too
    hdr.input!.hitArea = new Phaser.Geom.Rectangle(0, 0, w, HEADER_H);
  }

  private setHeaderLabel(panelId: string, text: string) {
    const hdr = this.panelHeaders[panelId];
    if (hdr) (hdr.getAt(1) as Phaser.GameObjects.Text).setText(text);
  }

  // ── Resize grip factory ──────────────────────────────

  private makeResizeGrip(panelId: string, vertical: boolean): Phaser.GameObjects.Rectangle {
    const state = this.panelStates[panelId];

    const grip = this.add.rectangle(0, 0, 10, 10, 0x445566, 0.75)
      .setScrollFactor(0).setDepth(1011)
      .setStrokeStyle(1, 0x6688aa, 0.6)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        grip.setFillStyle(0x6688aa, 0.9);
        this.input.setDefaultCursor(vertical ? 'se-resize' : 'e-resize');
      })
      .on('pointerout', () => {
        grip.setFillStyle(0x445566, 0.75);
        this.input.setDefaultCursor('default');
      })
      .on('drag', (ptr: Phaser.Input.Pointer) => {
        state.w = Math.max(80, Math.min(GAME_WIDTH - state.x, Math.round(ptr.x - state.x)));
        if (vertical) {
          state.h = Math.max(60, Math.min(GAME_HEIGHT - state.y - HEADER_H, Math.round(ptr.y - state.y - HEADER_H)));
        }
        this.resizeHeader(panelId);
      })
      .on('dragend', () => {
        this.saveUILayout();
        this.input.setDefaultCursor('default');
      });

    this.input.setDraggable(grip);
    return grip;
  }

  // ── Layout persistence ────────────────────────────────

  private saveUILayout() {
    try {
      const save: Record<string, PanelState> = {};
      for (const [k, v] of Object.entries(this.panelStates)) {
        save[k] = { ...v };
      }
      localStorage.setItem(UI_LAYOUT_KEY, JSON.stringify(save));
    } catch { /* localStorage unavailable */ }
  }

  private loadUILayout() {
    try {
      const raw = localStorage.getItem(UI_LAYOUT_KEY);
      if (!raw) return;
      const saved: Record<string, PanelState> = JSON.parse(raw);
      for (const [k, v] of Object.entries(saved)) {
        if (this.panelStates[k]) {
          this.panelStates[k] = {
            x: Math.max(0, Math.min(GAME_WIDTH  - 40, v.x ?? this.panelStates[k].x)),
            y: Math.max(0, Math.min(GAME_HEIGHT - 20, v.y ?? this.panelStates[k].y)),
            w: Math.max(80, v.w ?? this.panelStates[k].w),
            h: Math.max(60, v.h ?? this.panelStates[k].h),
            collapsed: v.collapsed ?? this.panelStates[k].collapsed,
          };
        }
      }
    } catch { /* corrupt save */ }
  }

  // ── Grip positioning helper ───────────────────────────

  private positionGrip(panelId: string, contentBottom: number) {
    const state = this.panelStates[panelId];
    const grip = this.grips[panelId];
    if (!grip) return;
    grip.setPosition(state.x + state.w - 5, contentBottom - 5).setVisible(true);
  }

  // ── Main UI update ────────────────────────────────────

  private updateUI(data: UIData) {
    const { sphere, body, capture } = data;

    this.cachedUIData = data;
    this.cachedLearnedSpells = sphere.learnedSpells;
    this.cachedInCombat = data.inCombat ?? false;
    this.cachedBody = body;
    if (this.cachedInCombat && this.spellPickerSlot >= 0) this.closeSpellPicker();

    // ── Tracked quest HUD (top-left) ──────────────────────
    {
      const tracked = data.trackedQuestIds ?? [];
      const trackedQuests = data.quests.filter(q => !q.completed && tracked.includes(q.def.id));
      if (trackedQuests.length > 0) {
        const lines: string[] = [];
        for (const q of trackedQuests) {
          lines.push(`▸ ${q.def.nameRu}`);
          for (let i = 0; i < q.def.objectives.length; i++) {
            const obj = q.def.objectives[i];
            const cur = q.counts[i];
            const isDone = cur >= obj.count;
            lines.push(`  ${isDone ? '✓' : `${cur}/${obj.count}`} ${obj.targetNameRu ?? obj.targetId ?? ''}`);
          }
        }
        this.trackedQuestText.setText(lines.join('\n')).setVisible(true);
      } else {
        this.trackedQuestText.setVisible(false);
      }
    }

    // ── Refresh open window ───────────────────────────────
    if (this.currentWindow) this.buildWindowContent(data);

    // ── Resources (always visible when in body) ──────────
    if (body) {
      const hpPct  = Math.round((body.currentHP   / body.maxHP)   * 100);
      const manaPct= Math.round((body.currentMana / body.maxMana) * 100);
      this.resourceText.setText(
        `HP ${Math.round(body.currentHP)}/${body.maxHP} (${hpPct}%)   ` +
        `Мана ${Math.round(body.currentMana)}/${body.maxMana} (${manaPct}%)`
      ).setVisible(true);
      this.hintText.setText('[1] Атака  [Q] Выйти  [E] Захват  [2-8] Умения');

      // ── Статус-иконки ────────────────────────────────────
      if (body.statusEffects.size > 0) {
        const parts: string[] = [];
        for (const [, status] of body.statusEffects) {
          const def = (STATUS_DEFS as Record<string, import('../types/statuses').StatusEffectDef>)[status.id];
          const name = def?.nameRu ?? status.id;
          const secs = Math.ceil(status.timer);
          const stacks = status.stacks > 1 ? `×${status.stacks}` : '';
          parts.push(`${name}${stacks}(${secs}с)`);
        }
        this.statusBarText.setText(parts.join('  ')).setVisible(true);
      } else {
        this.statusBarText.setVisible(false);
      }
    } else {
      this.resourceText.setVisible(false);
      this.statusBarText.setVisible(false);
      this.hintText.setText('[WASD] Движение  [E] Захватить тело');
    }

    // ── Capture bar ──────────────────────────────────────
    if (capture?.state === CaptureState.Casting) {
      const p = capture.elapsed / capture.duration;
      this.captureBarBg.setVisible(true);
      this.captureBar.setVisible(true);
      this.captureBar.width = 140 * p;
    } else {
      this.captureBarBg.setVisible(false);
      this.captureBar.setVisible(false);
    }

    // ── Skill bar ─────────────────────────────────────────
    this.updateSkillBar(body, data.activeEnchantId);

    // ── Cast bar ──────────────────────────────────────────
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

    // ── Body panel (right) ────────────────────────────────
    {
      const s = this.panelStates.body;
      this.panelHeaders['body'].setVisible(!!body).setPosition(s.x, s.y);
      this.grips['body'].setVisible(!!body);
      if (body) {
        this.setHeaderLabel('body', body.definition.nameRu);
        if (!s.collapsed) {
          this.bodyInfoText.setFixedSize(s.w, 0)
            .setPosition(s.x, s.y + HEADER_H).setText(
              `── ${body.definition.nameRu} ──\n` +
              `Оружие: ${body.weapon.nameRu}  КД: ${body.weapon.cooldown}с`
            ).setVisible(true);
          this.positionGrip('body', this.bodyInfoText.getBounds().bottom);
        } else {
          this.bodyInfoText.setVisible(false);
          this.positionGrip('body', s.y + HEADER_H);
        }
      } else {
        this.bodyInfoText.setVisible(false);
      }
    }

    // ── Target panel (right) ──────────────────────────────
    {
      const s = this.panelStates.target;
      const tgt = data.target;
      const hasTarget = !!(tgt && !tgt.isDead);
      this.panelHeaders['target'].setVisible(hasTarget).setPosition(s.x, s.y);
      this.grips['target'].setVisible(hasTarget);

      if (hasTarget && tgt) {
        const hpPct = Math.round((tgt.currentHP / tgt.maxHP) * 100);
        this.setHeaderLabel('target', `${tgt.definition.nameRu}  ${hpPct}%`);

        if (!s.collapsed) {
          const def = tgt.definition;
          const dmgLabel = def.damageType === 'magic'  ? '✦ Магия'
                         : def.damageType === 'ranged' ? '➶ Дальний' : '⚔ Ближний';
          const tLines = [
            `${dmgLabel}  HP: ${Math.round(tgt.currentHP)}/${tgt.maxHP}`,
            '',
            'Боевые статы:',
          ];
          for (const [stat, val] of Object.entries(def.npcStats ?? {})) {
            if ((val ?? 0) > 0) tLines.push(`  ${STAT_NAMES_SHORT[stat as StatName]}: ${val}`);
          }
          tLines.push('', 'Обучает:');
          for (const [stat, cap] of Object.entries(def.caps)) {
            tLines.push(`  ${STAT_NAMES_SHORT[stat as StatName]} → кап ${cap}`);
          }
          tLines.push(``, `Умение: ${def.abilityName}`);
          if (def.signatureSpell) {
            tLines.push(`✦ ${def.signatureSpell.nameRu}  (${def.spellXPThreshold} XP)`);
          }
          this.targetPanel.setFixedSize(s.w, 0).setWordWrapWidth(s.w - 16, true)
            .setPosition(s.x, s.y + HEADER_H).setText(tLines.join('\n')).setVisible(true);
          this.positionGrip('target', this.targetPanel.getBounds().bottom);
        } else {
          this.targetPanel.setVisible(false);
          this.positionGrip('target', s.y + HEADER_H);
        }
      } else {
        this.targetPanel.setVisible(false);
      }
    }

    // ── Log panel ─────────────────────────────────────────
    {
      const s = this.panelStates.log;
      this.panelHeaders['log'].setPosition(s.x, s.y);
      this.setHeaderLabel('log', 'Лог событий');
      if (!s.collapsed) {
        this.logText.setFixedSize(s.w, 0).setWordWrapWidth(s.w - 10, true)
          .setPosition(s.x, s.y + HEADER_H).setVisible(true);
        this.positionGrip('log', this.logText.getBounds().bottom);
      } else {
        this.logText.setVisible(false);
        this.positionGrip('log', s.y + HEADER_H);
      }
    }

    // ── Mini-map ──────────────────────────────────────────
    this.drawMinimap(data);
  }

  // ── Mini-map renderer ─────────────────────────────────

  private drawMinimap(data: UIData) {
    const s = this.panelStates.minimap;
    this.panelHeaders['minimap'].setPosition(s.x, s.y);
    this.setHeaderLabel('minimap', `Карта  ${s.w}×${s.h}`);

    const collapsed = s.collapsed;
    const mapTop = s.y + HEADER_H;
    this.minimapBorder.setPosition(s.x, mapTop).setSize(s.w, s.h).setVisible(!collapsed);
    this.minimapGfx.clear();

    if (!collapsed) {
      const sx = s.w / MAP_WIDTH;
      const sy = s.h / MAP_HEIGHT;
      const ml = s.x;
      const mt = mapTop;
      const g = this.minimapGfx;

      // Background
      g.fillStyle(0x0a0f1a, 0.85);
      g.fillRect(ml, mt, s.w, s.h);

      // Safe zone
      g.fillStyle(0x2244aa, 0.22);
      g.fillRect(ml + 224*sx, mt + 256*sy, 256*sx, 192*sy);

      // Zone tints
      g.fillStyle(0x664422, 0.18);
      g.fillRect(ml + 1200*sx, mt + 210*sy, 320*sx, 210*sy);
      g.fillStyle(0x446633, 0.18);
      g.fillRect(ml + 1110*sx, mt + 500*sy, 270*sx, 260*sy);
      g.fillStyle(0x9944aa, 0.18);
      g.fillRect(ml + 410*sx, mt + 770*sy, 270*sx, 170*sy);

      // Creatures
      for (const c of data.creatures) {
        if (c.isDead) continue;
        const cx = ml + c.x * sx;
        const cy = mt + c.y * sy;
        g.fillStyle(c.isPassive ? 0x888888 : c.isAggro ? 0xff3333 : 0xcc4444,
                    c.isPassive ? 0.7 : c.isAggro ? 1.0 : 0.65);
        g.fillRect(cx - 1, cy - 1, 2, 2);
      }

      // Player
      if (data.playerPos) {
        const px = ml + data.playerPos.x * sx;
        const py = mt + data.playerPos.y * sy;
        g.fillStyle(0x44aaff, 1.0);
        g.fillRect(px - 1.5, py - 1.5, 3, 3);
        g.lineStyle(1, 0xaaddff, 0.55);
        g.strokeRect(px - 2.5, py - 2.5, 5, 5);
      }

      this.positionGrip('minimap', mt + s.h);
    } else {
      this.positionGrip('minimap', s.y + HEADER_H);
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

      const key = this.add.text(
        x - SKILL_SLOT_SIZE / 2 + 3, y - SKILL_SLOT_SIZE / 2 + 2, `${i + 1}`,
        { fontSize: '9px', color: '#555577' },
      ).setScrollFactor(0).setDepth(1003);
      this.skillSlotsKey.push(key);

      const cd = this.add.rectangle(x, y + SKILL_SLOT_SIZE / 2, SKILL_SLOT_SIZE, 0, 0x000000, 0.65)
        .setOrigin(0.5, 1).setScrollFactor(0).setDepth(1004);
      this.skillSlotsCd.push(cd);

      const cdText = this.add.text(x, y, '', {
        fontSize: '12px', color: '#ffffff', align: 'center',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1005);
      this.skillSlotsCdText.push(cdText);

      if (i >= 1) {
        bg.setInteractive({ useHandCursor: true })
          .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
            ptr.event.stopPropagation();
            if (this.skillBarLocked) { this.addLog('🔒 Панель заблокирована'); return; }
            if (this.cachedInCombat) { this.addLog('⚔ Нельзя менять в бою'); return; }
            if (this.spellPickerSlot === i) this.closeSpellPicker();
            else this.openSpellPicker(i);
          });
      }
    }

    const barStartX = (GAME_WIDTH - (SKILL_SLOTS_COUNT * SKILL_SLOT_SIZE + (SKILL_SLOTS_COUNT - 1) * SKILL_SLOT_GAP)) / 2;
    this.lockBtn = this.add.text(barStartX - 20, y, '🔓', { fontSize: '18px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1006)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.skillBarLocked = !this.skillBarLocked;
        this.lockBtn.setText(this.skillBarLocked ? '🔒' : '🔓');
        if (this.skillBarLocked) this.closeSpellPicker();
      });

    this.spellPickerContainer = this.add.container(0, 0).setDepth(1100).setVisible(false);
  }

  private openSpellPicker(slotIndex: number) {
    this.spellPickerSlot = slotIndex;
    const usedIds = new Set(
      this.cachedBody?.abilitySlots
        .filter((s, i) => i !== slotIndex && s.ability)
        .map(s => s.ability!.id) ?? []
    );
    const spells = this.cachedLearnedSpells.filter(sp => !usedIds.has(sp.id));
    this.spellPickerContainer.removeAll(true);

    const sz = SKILL_SLOT_SIZE, gap = SKILL_SLOT_GAP;
    const cols   = spells.length + 1;
    const panelW = cols * sz + (cols - 1) * gap + 16;
    const panelH = sz + 32;

    const totalSlotW = SKILL_SLOTS_COUNT * sz + (SKILL_SLOTS_COUNT - 1) * gap;
    const barStartX  = (GAME_WIDTH - totalSlotW) / 2;
    const slotX      = barStartX + slotIndex * (sz + gap) + sz / 2;
    const panelX     = Math.min(Math.max(slotX - panelW / 2, 8), GAME_WIDTH - panelW - 8);
    const panelY     = GAME_HEIGHT - sz - 8 - panelH - 6;

    const bg = this.add.rectangle(panelW / 2, panelH / 2, panelW, panelH, 0x0a0a1a, 0.95)
      .setStrokeStyle(1, 0x4455aa, 0.8);
    const label = this.add.text(panelW / 2, 6, `Слот ${slotIndex + 1} — выбери заклинание`, {
      fontSize: '10px', color: '#aaaacc',
    }).setOrigin(0.5, 0);
    this.spellPickerContainer.add([bg, label]);

    const iy = panelH / 2 + 6;
    spells.forEach((spell, idx) => {
      const ix = 8 + idx * (sz + gap) + sz / 2;
      const ibg = this.add.rectangle(ix, iy, sz, sz, 0x1e2244)
        .setStrokeStyle(1, 0x6677cc).setInteractive({ useHandCursor: true })
        .on('pointerover', () => ibg.setFillStyle(0x2e3466))
        .on('pointerout',  () => ibg.setFillStyle(0x1e2244))
        .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          ptr.event.stopPropagation();
          this.scene.get('GameScene').events.emit('assign-spell', { slotIndex, spell });
          this.closeSpellPicker();
        });
      const itxt = this.add.text(ix, iy, spell.nameRu.slice(0, 7), {
        fontSize: '9px', color: '#aaccff', align: 'center',
      }).setOrigin(0.5);
      this.spellPickerContainer.add([ibg, itxt]);
      if (spell.isAoe) {
        this.spellPickerContainer.add(
          this.add.text(ix, iy + 14, 'AoE', { fontSize: '8px', color: '#ff9944' }).setOrigin(0.5)
        );
      }
    });

    const cx = 8 + spells.length * (sz + gap) + sz / 2;
    const cbg = this.add.rectangle(cx, iy, sz, sz, 0x221111)
      .setStrokeStyle(1, 0x774444).setInteractive({ useHandCursor: true })
      .on('pointerover', () => cbg.setFillStyle(0x331111))
      .on('pointerout',  () => cbg.setFillStyle(0x221111))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.scene.get('GameScene').events.emit('assign-spell', { slotIndex, spell: null });
        this.closeSpellPicker();
      });
    const ctxt = this.add.text(cx, iy, '✕\nочист.', {
      fontSize: '9px', color: '#ff6666', align: 'center',
    }).setOrigin(0.5);
    this.spellPickerContainer.add([cbg, ctxt]);
    this.spellPickerContainer.setPosition(panelX, panelY).setVisible(true);
  }

  private closeSpellPicker() {
    this.spellPickerSlot = -1;
    this.spellPickerContainer.setVisible(false);
  }

  private updateSkillBar(body: Body | null, activeEnchantId?: string | null) {
    for (let i = 0; i < SKILL_SLOTS_COUNT; i++) {
      const slot    = body?.abilitySlots[i];
      const ability = slot?.ability ?? null;
      const isActiveEnchant = ability && activeEnchantId && ability.id === activeEnchantId;
      this.skillSlotsBg[i].setFillStyle(isActiveEnchant ? 0x664400 : ability ? 0x1e2244 : 0x1a1a2e, 0.9);
      this.skillSlotsBg[i].setStrokeStyle(isActiveEnchant ? 2 : 1, isActiveEnchant ? 0xffaa00 : 0x334466);
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

  // ── Menu buttons ─────────────────────────────────────

  private buildMenuButtons() {
    const labels = ['Статы', 'Инвентарь', 'Квесты', 'Ачивки'];
    const btnW = 76;
    const btnH = 22;
    const gap = 4;
    const y = GAME_HEIGHT - SKILL_SLOT_SIZE - 20 - btnH / 2;

    for (let i = 0; i < labels.length; i++) {
      const x = 10 + i * (btnW + gap) + btnW / 2;
      const bg = this.add.rectangle(x, y, btnW, btnH, 0x0e1828, 0.92)
        .setStrokeStyle(1, 0x2d4a66, 0.9).setScrollFactor(0).setDepth(1010)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => { if (this.currentWindow !== this.menuBtnTypes[i]) bg.setFillStyle(0x1a2e44, 0.97); })
        .on('pointerout',  () => { if (this.currentWindow !== this.menuBtnTypes[i]) bg.setFillStyle(0x0e1828, 0.92); })
        .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          ptr.event.stopPropagation();
          this.toggleWindow(this.menuBtnTypes[i]);
        });
      const txt = this.add.text(x, y, labels[i], {
        fontSize: '11px', color: '#7799bb', align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1011);
      this.menuBtnBgs.push(bg);
      this.menuBtnTexts.push(txt);
    }
  }

  private buildFloatingWindow() {
    this.winBg = this.add.rectangle(0, WIN_TITLE_H, this.windowW, this.windowH, 0x070d18, 0.96)
      .setOrigin(0, 0).setStrokeStyle(1, 0x2d4a66, 0.9).setScrollFactor(0).setDepth(1019);

    this.winTitleBg = this.add.rectangle(0, 0, this.windowW, WIN_TITLE_H, 0x0e1828, 0.97)
      .setOrigin(0, 0).setStrokeStyle(1, 0x2d4a66, 0.9).setScrollFactor(0).setDepth(1020);

    this.windowTitleText = this.add.text(8, 4, '', {
      fontSize: '11px', color: '#8899bb',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(1021);

    this.winCloseBtn = this.add.text(this.windowW - 6, 4, '[×]', {
      fontSize: '10px', color: '#aa4444',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1022)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.winCloseBtn.setColor('#ff6666'))
      .on('pointerout',  () => this.winCloseBtn.setColor('#aa4444'))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.closeWindow();
      });

    this.windowContentText = this.add.text(8, WIN_TITLE_H + 8, '', {
      fontSize: '11px', color: '#cccccc', lineSpacing: 4,
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(1021);

    // ── Drag via title bar ────────────────────────────────
    this.winTitleBg
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, this.windowW, WIN_TITLE_H), Phaser.Geom.Rectangle.Contains)
      .on('pointerover', () => this.input.setDefaultCursor('grab'))
      .on('pointerout',  () => this.input.setDefaultCursor('default'))
      .on('drag', (_ptr: Phaser.Input.Pointer, dx: number, dy: number) => {
        this.windowX = Math.max(0, Math.min(GAME_WIDTH - this.windowW, dx));
        this.windowY = Math.max(0, Math.min(GAME_HEIGHT - 40, dy));
        this.windowContainer.setPosition(this.windowX, this.windowY);
        this.repositionInteractables();
        this.input.setDefaultCursor('grabbing');
      })
      .on('dragend', () => this.input.setDefaultCursor('default'));
    this.input.setDraggable(this.winTitleBg);

    // ── Resize grip (bottom-right corner) ────────────────
    const grip = this.add.text(this.windowW - 3, WIN_TITLE_H + this.windowH - 3, '⇲', {
      fontSize: '11px', color: '#334455',
    }).setOrigin(1, 1).setScrollFactor(0).setDepth(1023)
      .setInteractive({ useHandCursor: true, draggable: true })
      .on('pointerover', () => {
        this.input.setDefaultCursor('nwse-resize');
        grip.setColor('#6688aa');
      })
      .on('pointerout', () => {
        this.input.setDefaultCursor('default');
        grip.setColor('#334455');
      })
      .on('drag', (ptr: Phaser.Input.Pointer) => {
        const newW = Math.max(220, Math.min(560, ptr.x - this.windowX));
        const newH = Math.max(120, Math.min(540, ptr.y - this.windowY - WIN_TITLE_H));
        this.windowW = newW;
        this.windowH = newH;
        this.applyWindowSize(grip);
        if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
      })
      .on('dragend', () => this.input.setDefaultCursor('default'));
    this.input.setDraggable(grip);

    this.windowContainer = this.add.container(this.windowX, this.windowY, [
      this.winBg, this.winTitleBg, this.windowTitleText,
      this.winCloseBtn, this.windowContentText, grip,
    ]).setScrollFactor(0).setDepth(1018).setVisible(false);
  }

  /** Обновить размеры всех элементов окна после ресайза */
  private applyWindowSize(grip: Phaser.GameObjects.Text) {
    this.winBg.setSize(this.windowW, this.windowH);
    this.winTitleBg.setSize(this.windowW, WIN_TITLE_H);
    this.winTitleBg.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.windowW, WIN_TITLE_H),
      Phaser.Geom.Rectangle.Contains,
    );
    this.winCloseBtn.setX(this.windowW - 6);
    grip.setPosition(this.windowW - 3, WIN_TITLE_H + this.windowH - 3);
  }

  private repositionInteractables() {
    for (const btn of this.windowInteractables) {
      btn.setPosition(
        this.windowX + (btn as any).__relX,
        this.windowY + (btn as any).__relY,
      );
    }
  }

  private toggleWindow(type: WindowType) {
    if (this.currentWindow === type) {
      this.closeWindow();
      return;
    }
    this.currentWindow = type;
    this.windowContainer.setVisible(true);
    for (let i = 0; i < this.menuBtnTypes.length; i++) {
      const active = this.menuBtnTypes[i] === type;
      this.menuBtnBgs[i].setFillStyle(active ? 0x1e3a55 : 0x0e1828, active ? 1.0 : 0.92);
      this.menuBtnTexts[i].setColor(active ? '#aaccff' : '#7799bb');
    }
    if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
  }

  private closeWindow() {
    this.currentWindow = null;
    this.windowContainer.setVisible(false);
    for (const btn of this.windowInteractables) btn.destroy();
    this.windowInteractables = [];
    for (let i = 0; i < this.menuBtnTypes.length; i++) {
      this.menuBtnBgs[i].setFillStyle(0x0e1828, 0.92);
      this.menuBtnTexts[i].setColor('#7799bb');
    }
  }

  private buildWindowContent(data: UIData) {
    if (!this.currentWindow) return;
    for (const btn of this.windowInteractables) btn.destroy();
    this.windowInteractables = [];

    const { sphere } = data;
    const caps = data.body?.definition.caps ?? {};
    const xpTracker = sphere.xpTracker;
    const debuffSecs = Math.ceil(data.deathDebuff ?? 0);
    const rank = calcRank(sphere.stats);

    switch (this.currentWindow) {
      case 'stats': {
        const debuffStr = debuffSecs > 0 ? `  ⚠ Слабость: ${debuffSecs}с` : '';
        const lines: string[] = [`◉ Ранг ${rank.toFixed(1)}${debuffStr}`, ''];
        for (const stat of STAT_ORDER) {
          const val = sphere.stats[stat];
          const cap = caps[stat];
          if (cap !== undefined) {
            const isCapped = val >= cap;
            let line = `► ${STAT_NAMES_SHORT[stat]}: ${val}/${cap}`;
            if (!isCapped) {
              const xp = xpTracker[stat] ?? 0;
              const need = xpToNextLevel(val);
              line += `  ${buildXPBar(xp, need, 6)} ${xp}/${need}`;
            } else line += ' [КАП]';
            lines.push(line);
          } else {
            lines.push(`  ${STAT_NAMES_SHORT[stat]}: ${val}`);
          }
        }
        const sig = data.body?.definition.signatureSpell;
        const threshold = data.body?.definition.spellXPThreshold;
        if (sig && threshold) {
          lines.push('');
          const learned = sphere.learnedSpells.some(sp => sp.id === sig.id);
          if (learned) {
            lines.push(`✦ ${sig.nameRu} — ИЗУЧЕНО`);
          } else {
            const cur = sphere.spellProgress[sig.id] ?? 0;
            lines.push(`✧ ${sig.nameRu}: ${buildXPBar(cur, threshold, 10)}  ${cur}/${threshold}`);
          }
        }
        this.windowTitleText.setText('◉ Статы сферы');
        this.windowContentText.setWordWrapWidth(this.windowW - 16, true).setText(lines.join('\n'));
        break;
      }
      case 'inventory': {
        const inv = data.inventory ?? [];
        const lines: string[] = [];
        if (inv.length === 0) {
          lines.push('  Инвентарь пуст');
        } else {
          for (const slot of inv) {
            const def = ITEMS[slot.itemId];
            const r = def?.rarity === 'rare' ? '★' : def?.rarity === 'uncommon' ? '◆' : '·';
            lines.push(`${r} ${def?.icon ?? '?'} ${def?.nameRu ?? slot.itemId}  ×${slot.quantity}`);
            if (def?.descRu) lines.push(`   ${def.descRu}`);
          }
        }
        this.windowTitleText.setText(`◈ Инвентарь  (${inv.length} видов)`);
        this.windowContentText.setWordWrapWidth(this.windowW - 16, true).setText(lines.join('\n'));
        break;
      }
      case 'quests': {
        const active = data.quests.filter(q => !q.completed);
        const done   = data.quests.filter(q =>  q.completed);
        const tracked = data.trackedQuestIds ?? [];
        const lines: string[] = [];
        let relY = WIN_TITLE_H + 8;
        const lineH = 15;

        if (active.length === 0) {
          lines.push('  Все квесты выполнены!');
        } else {
          for (const q of active) {
            const isTracked = tracked.includes(q.def.id);
            // Checkbox — created as interactive Text outside container
            const btnRelX = this.windowW - 24;
            const btnRelY = relY;
            const btn = this.add.text(
              this.windowX + btnRelX,
              this.windowY + btnRelY,
              isTracked ? '☑' : '☐',
              { fontSize: '12px', color: isTracked ? '#66ccff' : '#556677' },
            ).setScrollFactor(0).setDepth(1030)
              .setInteractive({ useHandCursor: true })
              .on('pointerover', () => btn.setColor('#aaddff'))
              .on('pointerout',  () => btn.setColor(isTracked ? '#66ccff' : '#556677'))
              .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
                ptr.event.stopPropagation();
                this.scene.get('GameScene').events.emit('track-quest', q.def.id);
                if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
              });
            (btn as any).__relX = btnRelX;
            (btn as any).__relY = btnRelY;
            this.windowInteractables.push(btn);

            lines.push(`▸ ${q.def.nameRu}  +${q.def.xpReward} XP`);
            relY += lineH;
            for (let i = 0; i < q.def.objectives.length; i++) {
              const obj = q.def.objectives[i];
              const cur = q.counts[i];
              const d = cur >= obj.count ? '✓' : `${cur}/${obj.count}`;
              const verb = obj.type === 'kill' ? 'Убить' : obj.type === 'capture' ? 'Захватить' : 'Изучить';
              lines.push(`   ${verb} ${obj.targetNameRu ?? obj.targetId ?? ''}: ${d}`);
              relY += lineH;
            }
            relY += 4;
          }
        }
        if (done.length > 0) lines.push('', `✓ Выполнено: ${done.length} квестов`);
        this.windowTitleText.setText(`▸ Квесты  (${active.length} активных)`);
        this.windowContentText.setWordWrapWidth(this.windowW - 30, true).setText(lines.join('\n'));
        break;
      }
      case 'achievements': {
        const statuses = getAllAchievementStatus(sphere);
        const cnt = statuses.filter(s => s.unlocked).length;
        const lines = statuses.map(({ def, unlocked }) =>
          `${unlocked ? '✓' : '✗'} ${def.icon} ${def.nameRu}\n   ${def.descRu}`
        );
        this.windowTitleText.setText(`★ Ачивки  ${cnt}/${ACHIEVEMENTS.length}`);
        this.windowContentText.setWordWrapWidth(this.windowW - 16, true).setText(lines.join('\n'));
        break;
      }
    }
  }

  private addLog(msg: string) {
    this.logMessages.push(msg);
    if (this.logMessages.length > 6) this.logMessages.shift();
    this.logText.setText(this.logMessages.join('\n'));
  }

  // ── Achievement notification ticker (called every 50ms) ──
  private tickAchievementNotif() {
    if (this.achievementNotifTimer > 0) {
      this.achievementNotifTimer -= 50;
      if (this.achievementNotifTimer <= 0) {
        // fade out
        this.tweens.add({
          targets: [this.achievementNotifBg, this.achievementNotifText],
          alpha: 0,
          duration: 400,
          onComplete: () => {
            this.achievementNotifBg.setVisible(false);
            this.achievementNotifText.setVisible(false);
          },
        });
      }
    } else if (this.achievementNotifQueue.length > 0) {
      const ach = this.achievementNotifQueue.shift()!;
      this.achievementNotifBg.setAlpha(0.93).setVisible(true);
      this.achievementNotifText
        .setText(`★ АЧИВКА: ${ach.nameRu}\n${ach.descRu}`)
        .setAlpha(1).setVisible(true);
      this.achievementNotifTimer = 3000;
    }
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
