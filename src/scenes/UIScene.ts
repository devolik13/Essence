import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { Creature } from '../entities/Creature';
import { StatName } from '../types/stats';
import { t, getLang, setLang, initLang } from '../i18n';
import { CaptureProcess, CaptureState } from '../systems/capture';
import { calcRank, xpToNextLevel } from '../systems/progression';
import { GAME_WIDTH, GAME_HEIGHT, MAP_WIDTH, MAP_HEIGHT } from '../utils/constants';
import { STAT_NAMES_SHORT } from '../utils/statNames';
import { QuestProgress } from '../types/quests';
import { InventoryItem } from '../types/items';
import { ITEMS, RECIPES } from '../data/itemDB';
import { formatCurrency } from '../systems/currency';
import { ACHIEVEMENTS, AchievementDef } from '../data/achievementDB';
import { getAllAchievementStatus } from '../systems/achievements';
import { STATUS_DEFS } from '../types/statuses';

const UI_LAYOUT_KEY = 'essence_ui_layout_v1';
const HEADER_H = 20;
const WIN_W = 310;
const WIN_TITLE_H = 22;

type WindowType = 'stats' | 'inventory' | 'quests' | 'achievements' | 'vendor' | 'crafting';
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
  weaponSchool: string | null;
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
  private playerStatusBoxes: Phaser.GameObjects.Container[] = [];
  private playerStatusPool: { bg: Phaser.GameObjects.Rectangle; icon: Phaser.GameObjects.Text; timer: Phaser.GameObjects.Text; }[] = [];
  private bodyInfoText!:Phaser.GameObjects.Text;
  private hintText!:    Phaser.GameObjects.Text;
  private logText!:     Phaser.GameObjects.Text;
  private captureBar!:  Phaser.GameObjects.Rectangle;

  // ── Tracked quest HUD (top-left) ──────────────────────
  private trackedQuestText!: Phaser.GameObjects.Text;
  private _questHudBg!: Phaser.GameObjects.Rectangle;
  private _questHudX: number = 0;
  private _questHudY: number = 0;

  // ── Menu buttons ──────────────────────────────────────
  private menuBtnBgs:   Phaser.GameObjects.Rectangle[] = [];
  private menuBtnTexts: Phaser.GameObjects.Text[]      = [];
  private readonly menuBtnTypes: WindowType[] = ['stats', 'inventory', 'quests', 'achievements'];

  // ── Floating window ───────────────────────────────────
  private currentWindow: WindowType | null = null;
  private windowContainer!: Phaser.GameObjects.Container;
  private windowTitleText!: Phaser.GameObjects.Text;
  private windowContentText!: Phaser.GameObjects.Text;
  private windowInteractables: Phaser.GameObjects.GameObject[] = [];
  private windowX: number = 200;
  private windowY: number = 50;
  private windowW: number = 310;
  private windowH: number = 380;
  private winBg!: Phaser.GameObjects.Rectangle;
  private winTitleBg!: Phaser.GameObjects.Rectangle;
  private winCloseBtn!: Phaser.GameObjects.Text;
  private cachedUIData: UIData | null = null;
  /** Тип верстака для окна крафта */
  private craftingWorkbenchType: string = '';
  /** Vendor filter */
  private vendorFilter: string = 'all';
  private vendorButtons: Phaser.GameObjects.Text[] = [];
  private _contentMaskGfx!: Phaser.GameObjects.Graphics;
  private _contentScrollY: number = 0;

  // Dialog system
  private dialogContainer!: Phaser.GameObjects.Container;
  private dialogText!: Phaser.GameObjects.Text;
  private dialogSpeaker!: Phaser.GameObjects.Text;
  private dialogQueue: { speaker: string; text: string }[] = [];
  private dialogVisible: boolean = false;
  private dialogOnEnd?: () => void;
  /** Активный крафт таймер */
  private craftingProgress: { remaining: number; total: number; name: string } | null = null;
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

  // ── Seal of Elements indicator ─────────────────────────
  private sealIcons: Phaser.GameObjects.Text[] = [];
  private sealContainer!: Phaser.GameObjects.Container;

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
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 26, 'Capturing...', {
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

    // ── Seal of Elements indicator ──────────────────────────
    {
      const sealX = 10;
      const sealY = GAME_HEIGHT - 30;
      this.sealContainer = this.add.container(sealX, sealY).setScrollFactor(0).setDepth(1000).setVisible(false);
      const elements: { key: string; symbol: string; color: string }[] = [
        { key: 'fire', symbol: '🔥', color: '#ff4400' },
        { key: 'water', symbol: '💧', color: '#0088ff' },
        { key: 'earth', symbol: '🪨', color: '#886633' },
        { key: 'wind', symbol: '🌀', color: '#99ddbb' },
      ];
      const label = this.add.text(0, 0, 'Seal:', { fontSize: '10px', color: '#aaaaaa' }).setOrigin(0, 0.5);
      this.sealContainer.add(label);
      let ox = 32;
      for (const el of elements) {
        const icon = this.add.text(ox, 0, el.symbol, { fontSize: '14px' }).setOrigin(0, 0.5).setAlpha(0.2);
        this.sealContainer.add(icon);
        this.sealIcons.push(icon);
        ox += 22;
      }
    }

    // ── Tracked quest HUD (right side, draggable) ─────────
    this._questHudX = GAME_WIDTH - 220;
    this._questHudY = 10;
    this._questHudBg = this.add.rectangle(this._questHudX, this._questHudY, 210, 100, 0x000000, 0.35)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(999).setVisible(false)
      .setStrokeStyle(1, 0x334455, 0.4);
    this.trackedQuestText = this.add.text(this._questHudX + 8, this._questHudY + 6, '', {
      fontSize: '10px', color: '#ffeeaa', lineSpacing: 3,
    }).setScrollFactor(0).setDepth(1000).setVisible(false);

    // Make quest HUD draggable
    this._questHudBg.setInteractive({ draggable: true });
    let qDragOffX = 0, qDragOffY = 0;
    this._questHudBg.on('dragstart', (ptr: Phaser.Input.Pointer) => {
      qDragOffX = ptr.x - this._questHudX;
      qDragOffY = ptr.y - this._questHudY;
    });
    this._questHudBg.on('drag', (ptr: Phaser.Input.Pointer) => {
      this._questHudX = ptr.x - qDragOffX;
      this._questHudY = ptr.y - qDragOffY;
      this._questHudBg.setPosition(this._questHudX, this._questHudY);
      this.trackedQuestText.setPosition(this._questHudX + 8, this._questHudY + 6);
    });
    this.input.setDraggable(this._questHudBg);

    // ── Dialog panel (bottom of screen) ────────────────────
    {
      const dY = GAME_HEIGHT - 130;
      const dBg = this.add.rectangle(GAME_WIDTH / 2, dY + 50, GAME_WIDTH - 40, 100, 0x0a0a1a, 0.92)
        .setStrokeStyle(1, 0x334466);
      this.dialogSpeaker = this.add.text(30, dY + 8, '', {
        fontSize: '12px', color: '#ffcc66', fontStyle: 'bold',
      });
      this.dialogText = this.add.text(30, dY + 26, '', {
        fontSize: '11px', color: '#ccccdd', lineSpacing: 3,
        wordWrap: { width: GAME_WIDTH - 80 },
      });
      const continueBtn = this.add.text(GAME_WIDTH - 50, dY + 80, '[Continue]', {
        fontSize: '10px', color: '#88aacc',
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
        .on('pointerover', () => continueBtn.setColor('#aaddff'))
        .on('pointerout', () => continueBtn.setColor('#88aacc'))
        .on('pointerdown', () => this.advanceDialog());

      this.dialogContainer = this.add.container(0, 0, [dBg, this.dialogSpeaker, this.dialogText, continueBtn])
        .setScrollFactor(0).setDepth(2000).setVisible(false);
    }

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
    this.panelHeaders['body']    = this.makeHeader('body',    'Body');
    this.panelHeaders['target']  = this.makeHeader('target',  'Target');
    this.panelHeaders['log']     = this.makeHeader('log',     'Log');
    this.panelHeaders['minimap'] = this.makeHeader('minimap', 'Map');

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

    // ── Language toggle button ─────────────────────────────
    initLang();
    const langBtn = this.add.text(GAME_WIDTH - 40, GAME_HEIGHT - 16, getLang().toUpperCase(), {
      fontSize: '10px', color: '#888888', backgroundColor: '#111122', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000).setInteractive({ useHandCursor: true });
    langBtn.on('pointerdown', () => {
      const next = getLang() === 'en' ? 'ru' : 'en';
      setLang(next);
      langBtn.setText(next.toUpperCase());
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
      this.addLog(`${data.name} killed  +${data.xp} XP → [${s}]`);
    });
    gs.events.on('player-died', (data: { xpLost: number; debuffDuration: number }) => {
      this.addLog(t('death.message'));
      if (data?.xpLost > 0) this.addLog(`  ↓ Lost ${data.xpLost} XP`);
      this.addLog(`  ✦ Weakness: -15% dmg for ${data?.debuffDuration ?? 30}с`);
    });
    gs.events.on('body-captured', (name: string) => this.addLog(`${t('log.captured')} ${name}`));
    gs.events.on('show-dialog', (data: { speaker: string; text: string }[] | { messages: { speaker: string; text: string }[]; onEnd?: () => void }) => {
      if (Array.isArray(data)) {
        this.showDialog(data);
      } else {
        this.showDialog(data.messages, data.onEnd);
      }
    });
    gs.events.on('capture-available', (name: string) => this.addLog(`${name} ${t('log.capture_prompt')}`));
    gs.events.on('capture-start', (name: string) => this.addLog(`${t('log.capturing')} ${name}...`));
    gs.events.on('spell-learned', (spell: import('../types/abilities').AbilityDef) => {
      this.addLog(`★ Learned: ${spell.nameRu}`);
    });
    gs.events.on('spell-locked', (data: { spell: import('../types/abilities').AbilityDef; prereqId: string }) => {
      this.addLog(`✗ ${data.spell.nameRu} — learn basic ability first`);
    });
    gs.events.on('quest-complete', (data: { name: string; xp: number }) => {
      this.addLog(`✦ QUEST: ${data.name}  +${data.xp} XP`);
    });
    gs.events.on('quest-giver-talk', (data: { active: import('../types/quests').QuestProgress[]; done: import('../types/quests').QuestProgress[] }) => {
      this.addLog('── Ranger ──');
      if (data.active.length === 0) {
        this.addLog('  All quests complete!');
      } else {
        for (const q of data.active) {
          const progress = q.counts.map((c, i) =>
            `${c}/${q.def.objectives[i].count}`
          ).join(', ');
          this.addLog(`  ▸ ${q.def.nameRu} [${progress}]  +${q.def.xpReward} XP`);
        }
      }
      if (data.done.length > 0) {
        this.addLog(`  ✓ Completed: ${data.done.length}`);
      }
    });
    gs.events.on('seal-frequency-gained', (element: string) => {
      this.addLog(`✦ Seal frequency: ${element}`);
      this.updateSealIndicator();
    });
    gs.events.on('save-loaded', () => this.addLog(t('log.progress_loaded')));
    gs.events.on('open-vendor', () => {
      this.currentWindow = 'vendor';
      this.windowContainer.setVisible(true);
      if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
    });
    gs.events.on('open-crafting', (workbenchType: string) => {
      this.craftingWorkbenchType = workbenchType;
      this.currentWindow = 'crafting';
      this.windowContainer.setVisible(true);
      if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
    });
    gs.events.on('aoe-targeting', (name: string) => {
      this.addLog(`◎ Targeting: ${name}  [LMB/RMB]`);
    });
    gs.events.on('spell-out-of-range', () => this.addLog(t('log.too_far')));
    gs.events.on('loot-dropped', (data: { creatureName: string; loot: string }) => {
      this.addLog(`↓ ${data.loot}`);
    });
    gs.events.on('achievement-unlocked', (ach: AchievementDef) => {
      this.achievementNotifQueue.push(ach);
      this.addLog(`★ Achievement: ${ach.nameRu}`);
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

    this.updateSealIndicator(sphere);

    // ── Tracked quest HUD (right side) ─────────────────────
    {
      const tracked = data.trackedQuestIds ?? [];
      // Active main quest (first incomplete in chain)
      const activeQuests = data.quests.filter(q => !q.completed);
      const mainQuest = activeQuests.find(q => q.def.prerequisiteIds !== undefined || q.def.id.startsWith('q'));
      // Tracked side quests
      const trackedQuests = activeQuests.filter(q => tracked.includes(q.def.id));

      const lines: string[] = [];

      // Main quest always shown
      if (mainQuest && !trackedQuests.find(q => q.def.id === mainQuest.def.id)) {
        lines.push(`◆ ${mainQuest.def.nameRu}`);
        for (let i = 0; i < mainQuest.def.objectives.length; i++) {
          const obj = mainQuest.def.objectives[i];
          const cur = mainQuest.counts[i];
          const isDone = cur >= obj.count;
          lines.push(`  ${isDone ? '✓' : `${cur}/${obj.count}`} ${obj.targetNameRu ?? ''}`);
        }
      }

      // Tracked quests
      for (const q of trackedQuests) {
        if (lines.length > 0) lines.push('');
        lines.push(`▸ ${q.def.nameRu}`);
        for (let i = 0; i < q.def.objectives.length; i++) {
          const obj = q.def.objectives[i];
          const cur = q.counts[i];
          const isDone = cur >= obj.count;
          lines.push(`  ${isDone ? '✓' : `${cur}/${obj.count}`} ${obj.targetNameRu ?? ''}`);
        }
      }

      if (lines.length > 0) {
        this.trackedQuestText.setText(lines.join('\n')).setVisible(true);
        this.trackedQuestText.setPosition(this._questHudX + 8, this._questHudY + 6);
        // Resize background to fit content
        const tw = Math.max(180, this.trackedQuestText.width + 16);
        const th = this.trackedQuestText.height + 12;
        this._questHudBg.setSize(tw, th).setVisible(true);
      } else {
        this.trackedQuestText.setVisible(false);
        this._questHudBg.setVisible(false);
      }
    }

    // ── Refresh open window ───────────────────────────────
    if (this.currentWindow) this.buildWindowContent(data);

    // ── Resources (always visible when in body) ──────────
    if (body) {
      const hpPct  = Math.round((body.currentHP   / body.maxHP)   * 100);
      const manaPct= Math.round((body.currentMana / body.maxMana) * 100);
      const coins = formatCurrency(data.sphere.copper ?? 0);
      this.resourceText.setText(
        `HP ${Math.round(body.currentHP)}/${body.maxHP} (${hpPct}%)   ` +
        `Mana ${Math.round(body.currentMana)}/${body.maxMana} (${manaPct}%)   ` +
        `💰 ${coins}`
      ).setVisible(true);
      this.hintText.setText(t('hud.attack'));

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
      this.hintText.setText(t('hud.astral'));
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
    this.updatePlayerStatusBar(body);

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
              `${t('body.weapon')}: ${body.weapon.nameRu}  ${t('body.cd')}: ${body.weapon.cooldown}s`
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
          const dmgLabel = def.damageType === 'magic'  ? '✦ Magic'
                         : def.damageType === 'ranged' ? '➶ Ranged' : '⚔ Melee';
          const tLines = [
            `${dmgLabel}  HP: ${Math.round(tgt.currentHP)}/${tgt.maxHP}`,
            '',
            'Combat stats:',
          ];
          for (const [stat, val] of Object.entries(def.npcStats ?? {})) {
            if ((val ?? 0) > 0) tLines.push(`  ${STAT_NAMES_SHORT[stat as StatName]}: ${val}`);
          }
          tLines.push('', 'Teaches:');
          for (const [stat, cap] of Object.entries(def.caps)) {
            tLines.push(`  ${STAT_NAMES_SHORT[stat as StatName]} → cap ${cap}`);
          }
          tLines.push(``, `Ability: ${def.abilityName}`);
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
      this.setHeaderLabel('log', 'Event Log');
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
    this.setHeaderLabel('minimap', `Map  ${s.w}×${s.h}`);

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

    const DIVIDER_GAP = 14; // extra gap between weapon (0-4) and neutral (5-7) slots

    // Divider line between slot 5 and 6
    const divX = startX + 5 * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP) + DIVIDER_GAP / 2 - 2;
    this.add.rectangle(divX, y, 2, SKILL_SLOT_SIZE + 8, 0x334466, 0.6)
      .setScrollFactor(0).setDepth(1000);

    // Labels
    const labelY = y - SKILL_SLOT_SIZE / 2 - 8;
    this.add.text(startX + 2 * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP) + SKILL_SLOT_SIZE / 2, labelY, t('skill.weapon_tab'), {
      fontSize: '8px', color: '#556688',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    this.add.text(divX + 1.5 * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP) + SKILL_SLOT_SIZE / 2, labelY, t('skill.neutral'), {
      fontSize: '8px', color: '#556688',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    for (let i = 0; i < SKILL_SLOTS_COUNT; i++) {
      const extraGap = i >= 5 ? DIVIDER_GAP : 0;
      const x = startX + i * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP) + extraGap + SKILL_SLOT_SIZE / 2;

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
            if (this.skillBarLocked) { this.addLog(t('skill.locked')); return; }
            if (this.cachedInCombat) { this.addLog(t('skill.no_combat')); return; }
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
    const weaponSchool = this.cachedUIData?.weaponSchool ?? null;
    const spells = this.cachedLearnedSpells.filter(sp => {
      if (usedIds.has(sp.id)) return false;
      // Filter by weapon school: elemental spells need matching staff
      if (sp.school && sp.school !== 'neutral') {
        return sp.school === weaponSchool;
      }
      return true; // neutral/weapon spells always available
    });
    this.spellPickerContainer.removeAll(true);

    const sz = 44, gap = 4;
    const COLS = 8;
    const totalItems = spells.length + 1; // +1 for clear button
    const rows = Math.ceil(totalItems / COLS);
    const gridCols = Math.min(totalItems, COLS);
    const panelW = gridCols * (sz + gap) + gap + 8;
    const panelH = rows * (sz + gap) + gap + 24;

    // Position above skill bar, centered
    const panelX = Math.max(8, Math.min((GAME_WIDTH - panelW) / 2, GAME_WIDTH - panelW - 8));
    const panelY = GAME_HEIGHT - SKILL_SLOT_SIZE - 14 - panelH;

    const bg = this.add.rectangle(panelW / 2, panelH / 2, panelW, panelH, 0x0a0a1a, 0.95)
      .setStrokeStyle(1, 0x4455aa, 0.8);
    const label = this.add.text(panelW / 2, 4, `${t('skill.slot')} ${slotIndex + 1} ${t('skill.choose')}`, {
      fontSize: '9px', color: '#aaaacc',
    }).setOrigin(0.5, 0);
    this.spellPickerContainer.add([bg, label]);

    spells.forEach((spell, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const ix = gap + 4 + col * (sz + gap) + sz / 2;
      const iy = 20 + row * (sz + gap) + sz / 2;

      const ibg = this.add.rectangle(ix, iy, sz, sz, 0x1e2244)
        .setStrokeStyle(1, 0x6677cc).setInteractive({ useHandCursor: true })
        .on('pointerover', () => ibg.setFillStyle(0x2e3466))
        .on('pointerout',  () => ibg.setFillStyle(0x1e2244))
        .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          ptr.event.stopPropagation();
          this.scene.get('GameScene').events.emit('assign-spell', { slotIndex, spell });
          this.closeSpellPicker();
        });
      const itxt = this.add.text(ix, iy - 2, spell.nameRu.slice(0, 7), {
        fontSize: '8px', color: '#aaccff', align: 'center',
      }).setOrigin(0.5);
      this.spellPickerContainer.add([ibg, itxt]);
    });

    // Clear button
    const clearIdx = spells.length;
    const clearCol = clearIdx % COLS;
    const clearRow = Math.floor(clearIdx / COLS);
    const cx = gap + 4 + clearCol * (sz + gap) + sz / 2;
    const cy = 20 + clearRow * (sz + gap) + sz / 2;
    const cbg = this.add.rectangle(cx, cy, sz, sz, 0x221111)
      .setStrokeStyle(1, 0x774444).setInteractive({ useHandCursor: true })
      .on('pointerover', () => cbg.setFillStyle(0x331111))
      .on('pointerout',  () => cbg.setFillStyle(0x221111))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.scene.get('GameScene').events.emit('assign-spell', { slotIndex, spell: null });
        this.closeSpellPicker();
      });
    const ctxt = this.add.text(cx, cy, '✕', {
      fontSize: '14px', color: '#ff6666',
    }).setOrigin(0.5);
    this.spellPickerContainer.add([cbg, ctxt]);

    this.spellPickerContainer.setPosition(panelX, panelY).setVisible(true);
  }

  private closeSpellPicker() {
    this.spellPickerSlot = -1;
    this.spellPickerContainer.setVisible(false);
  }

  // ── Панель статусов игрока (квадратики над скилл-баром) ──

  private static PLAYER_STATUS_ICONS: Record<string, { icon: string; color: number }> = {
    poison:       { icon: '☠',  color: 0x336600 },
    bleed:        { icon: '🩸', color: 0x660022 },
    burn:         { icon: '🔥', color: 0x662200 },
    burn_mana:    { icon: '💧', color: 0x220066 },
    slow:         { icon: '❄',  color: 0x224466 },
    root:         { icon: '⌇',  color: 0x443311 },
    stun:         { icon: '★',  color: 0x666600 },
    chill:        { icon: '❅',  color: 0x334466 },
    freeze:       { icon: '❆',  color: 0x224488 },
    armor_reduce: { icon: '↓',  color: 0x443322 },
    armor_break:  { icon: '⇊',  color: 0x664400 },
    vulnerability:{ icon: '◇',  color: 0x662222 },
    acceleration: { icon: '»',  color: 0x446622 },
    bark_armor:   { icon: '🛡', color: 0x443311 },
    leaf_regen:   { icon: '❤',  color: 0x226622 },
    hp_regen_boost:{ icon: '❤', color: 0x226622 },
    mana_regen_boost:{ icon: '💎', color: 0x222266 },
  };

  private updatePlayerStatusBar(body: Body | null) {
    for (const box of this.playerStatusBoxes) box.setVisible(false);

    if (!body) return;

    // Собираем все активные эффекты
    const items: { icon: string; label: string; timer: number; color: number }[] = [];

    for (const [, s] of body.statusEffects) {
      const info = UIScene.PLAYER_STATUS_ICONS[s.id];
      if (!info) continue;
      const stackStr = s.stacks > 1 ? `×${s.stacks}` : '';
      items.push({ icon: `${info.icon}${stackStr}`, label: '', timer: s.timer, color: info.color });
    }

    // Enchantment как постоянный статус
    if (body.enchantRegenPenalty > 0) {
      items.push({ icon: '⚔🔥', label: 'Enchant', timer: -1, color: 0x664400 });
    }

    const boxSize = 48;
    const gap = 6;
    const startY = 40;
    const startX = (GAME_WIDTH - items.length * (boxSize + gap)) / 2;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      let poolEntry = this.playerStatusPool[i];
      if (!poolEntry) {
        const bg = this.add.rectangle(0, 0, boxSize, boxSize, 0x222222, 0.8).setStrokeStyle(2, 0x555555).setScrollFactor(0).setDepth(1010);
        const icon = this.add.text(0, -6, '', { fontSize: '18px' }).setOrigin(0.5).setScrollFactor(0).setDepth(1011);
        const timer = this.add.text(0, 14, '', { fontSize: '11px', color: '#cccccc', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(1011);
        const container = this.add.container(0, 0, [bg, icon, timer]).setScrollFactor(0).setDepth(1010);
        this.playerStatusBoxes.push(container);
        poolEntry = { bg, icon, timer };
        this.playerStatusPool.push(poolEntry);
      }

      const container = this.playerStatusBoxes[i];
      const x = startX + i * (boxSize + gap) + boxSize / 2;
      container.setPosition(x, startY);
      container.setVisible(true);

      poolEntry.bg.setFillStyle(item.color, 0.8);
      poolEntry.icon.setText(item.icon);
      poolEntry.timer.setText(item.timer > 0 ? `${item.timer.toFixed(1)}` : item.timer < 0 ? 'ON' : '');
    }
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
    const labels = [t('menu.stats'), t('menu.inventory'), t('menu.quests'), t('menu.achieve')];
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
    // All elements use origin(0,0) and RELATIVE positions inside container

    // Background (starts at y=WIN_TITLE_H to leave space for title bar)
    this.winBg = this.add.rectangle(0, WIN_TITLE_H, this.windowW, this.windowH, 0x070d18, 0.96)
      .setOrigin(0, 0).setStrokeStyle(1, 0x2d4a66, 0.9);

    // Title bar
    this.winTitleBg = this.add.rectangle(0, 0, this.windowW, WIN_TITLE_H, 0x0e1828, 0.97)
      .setOrigin(0, 0).setStrokeStyle(1, 0x2d4a66, 0.9);

    // Title text
    this.windowTitleText = this.add.text(8, 4, '', {
      fontSize: '11px', color: '#8899bb',
    }).setOrigin(0, 0);

    // Close button
    this.winCloseBtn = this.add.text(this.windowW - 6, 4, '[×]', {
      fontSize: '10px', color: '#aa4444',
    }).setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.winCloseBtn.setColor('#ff6666'))
      .on('pointerout',  () => this.winCloseBtn.setColor('#aa4444'))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.closeWindow();
      });

    // Content text
    this.windowContentText = this.add.text(8, WIN_TITLE_H + 8, '', {
      fontSize: '11px', color: '#cccccc', lineSpacing: 4,
    }).setOrigin(0, 0);

    // Drag via title bar
    let dragOffX = 0, dragOffY = 0;
    this.winTitleBg
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, this.windowW, WIN_TITLE_H), Phaser.Geom.Rectangle.Contains)
      .on('dragstart', (ptr: Phaser.Input.Pointer) => {
        dragOffX = ptr.x - this.windowX;
        dragOffY = ptr.y - this.windowY;
      })
      .on('drag', (ptr: Phaser.Input.Pointer) => {
        this.windowX = Math.max(0, Math.min(GAME_WIDTH - this.windowW, ptr.x - dragOffX));
        this.windowY = Math.max(0, Math.min(GAME_HEIGHT - 40, ptr.y - dragOffY));
        this.windowContainer.setPosition(this.windowX, this.windowY);
        this.updateContentMask();
      });
    this.input.setDraggable(this.winTitleBg);

    // Container holds everything — position is (windowX, windowY)
    this.windowContainer = this.add.container(this.windowX, this.windowY, [
      this.winBg, this.winTitleBg, this.windowTitleText,
      this.winCloseBtn, this.windowContentText,
    ]).setScrollFactor(0).setDepth(1018).setVisible(false);

    // Mask for content clipping (in scene coordinates, updated on resize)
    this._contentMaskGfx = this.make.graphics({});
    this._contentMaskGfx.fillRect(0, 0, 1, 1); // placeholder
    const mask = this._contentMaskGfx.createGeometryMask();
    this.windowContentText.setMask(mask);

    // Scroll with mouse wheel
    this._contentScrollY = 0;
    this.input.on('wheel', (_ptr: Phaser.Input.Pointer, _dx: number[], _dy: number[], dz: number) => {
      if (!this.windowContainer.visible) return;
      // Check if pointer is over window
      const ptr = this.input.activePointer;
      if (ptr.x < this.windowX || ptr.x > this.windowX + this.windowW) return;
      if (ptr.y < this.windowY || ptr.y > this.windowY + this.windowH) return;

      this._contentScrollY += dz > 0 ? 20 : -20;
      this._contentScrollY = Math.max(0, this._contentScrollY);
      // Limit scroll to content height
      const maxScroll = Math.max(0, this.windowContentText.height - (this.windowH - WIN_TITLE_H - 16));
      this._contentScrollY = Math.min(this._contentScrollY, maxScroll);
      this.windowContentText.setY(WIN_TITLE_H + 8 - this._contentScrollY);
    });
  }

  /** Resize window (for inventory vs other panels) */
  private resizeWindow(w: number, h: number) {
    this.windowW = w;
    this.windowH = h;
    this.winBg.setSize(w, h);
    this.winTitleBg.setSize(w, WIN_TITLE_H);
    this.winTitleBg.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, w, WIN_TITLE_H),
      Phaser.Geom.Rectangle.Contains,
    );
    this.winCloseBtn.setX(w - 6);
    this.updateContentMask();
  }

  private updateContentMask() {
    if (this._contentMaskGfx) {
      this._contentMaskGfx.clear();
      this._contentMaskGfx.fillRect(this.windowX, this.windowY + WIN_TITLE_H, this.windowW, this.windowH);
    }
  }

  private toggleWindow(type: WindowType) {
    if (this.currentWindow === type) {
      this.closeWindow();
      return;
    }
    this.currentWindow = type;
    this._contentScrollY = 0;
    this.windowContentText.setY(WIN_TITLE_H + 8);

    // Resize + center based on window type
    if (type === 'inventory') {
      this.windowX = Math.floor((GAME_WIDTH - 620) / 2);
      this.windowY = 10;
      this.resizeWindow(620, 560);
    } else if (type === 'vendor' || type === 'crafting') {
      this.windowX = Math.floor((GAME_WIDTH - 400) / 2);
      this.windowY = 30;
      this.resizeWindow(400, 420);
    } else {
      this.windowX = Math.floor((GAME_WIDTH - 320) / 2);
      this.windowY = 30;
      this.resizeWindow(320, 400);
    }

    this.windowContainer.setPosition(this.windowX, this.windowY);
    this.windowContainer.setVisible(true);

    // Create vendor filter/buy buttons (outside container for clickability)
    this.destroyVendorButtons();
    if (type === 'vendor') this.createVendorButtons(this.cachedUIData);

    for (let i = 0; i < this.menuBtnTypes.length; i++) {
      const active = this.menuBtnTypes[i] === type;
      this.menuBtnBgs[i].setFillStyle(active ? 0x1e3a55 : 0x0e1828, active ? 1.0 : 0.92);
      this.menuBtnTexts[i].setColor(active ? '#aaccff' : '#7799bb');
    }
    if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
  }

  // ── Dialog system ──────────────────────────────────────

  public showDialog(messages: { speaker: string; text: string }[], onEnd?: () => void) {
    this.dialogQueue = [...messages];
    this.dialogOnEnd = onEnd;
    this.dialogVisible = true;
    this.advanceDialog();
  }

  private advanceDialog() {
    if (this.dialogQueue.length === 0) {
      this.dialogContainer.setVisible(false);
      this.dialogVisible = false;
      if (this.dialogOnEnd) {
        const cb = this.dialogOnEnd;
        this.dialogOnEnd = undefined;
        cb();
      }
      return;
    }
    const msg = this.dialogQueue.shift()!;
    this.dialogSpeaker.setText(msg.speaker);
    this.dialogText.setText(msg.text);
    this.dialogContainer.setVisible(true);
  }

  private destroyVendorButtons() {
    for (const b of this.vendorButtons) b.destroy();
    this.vendorButtons = [];
  }

  private createVendorButtons(data: UIData | null) {
    if (!data) return;
    const tabs = ['All', 'Weapon', 'Armor', 'Jewel', 'Rune', 'T1', 'T2', 'T3'];

    // Filter tabs
    let fx = this.windowX + 8;
    const tabY = this.windowY + WIN_TITLE_H + 4;
    for (const tab of tabs) {
      const isActive = (this.vendorFilter === 'all' && tab === 'All') || this.vendorFilter === tab;
      const btn = this.add.text(fx, tabY, tab, {
        fontSize: '9px',
        color: isActive ? '#ffdd88' : '#99aabb',
        backgroundColor: isActive ? '#443322' : '#1a1a2a',
        padding: { x: 4, y: 2 },
      }).setScrollFactor(0).setDepth(3000).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => {
        this.vendorFilter = tab === 'All' ? 'all' : tab;
        this.destroyVendorButtons();
        this.createVendorButtons(this.cachedUIData);
        if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
      });
      this.vendorButtons.push(btn);
      fx += btn.width + 4;
    }

    // Buy All button
    const learned = data.sphere?.learnedRecipes ?? [];
    const coins = data.sphere?.copper ?? 0;
    let filtered = RECIPES;
    const f = this.vendorFilter;
    if (f === 'Weapon') filtered = RECIPES.filter(r => r.workbench === 'weaponsmith');
    else if (f === 'Armor') filtered = RECIPES.filter(r => r.workbench === 'armorer');
    else if (f === 'Jewel') filtered = RECIPES.filter(r => r.workbench === 'jeweler');
    else if (f === 'Rune') filtered = RECIPES.filter(r => r.workbench === 'runemaster');
    else if (f === 'T1') filtered = RECIPES.filter(r => !r.resultId.includes('_t2') && !r.resultId.includes('_t3'));
    else if (f === 'T2') filtered = RECIPES.filter(r => r.resultId.includes('_t2'));
    else if (f === 'T3') filtered = RECIPES.filter(r => r.resultId.includes('_t3'));

    const affordable = filtered.filter(r => {
      if (learned.includes(r.id)) return false;
      const tier = r.resultId.includes('_t3') ? 3 : r.resultId.includes('_t2') ? 2 : 1;
      const price = tier === 3 ? 200 : tier === 2 ? 50 : 0;
      return coins >= price;
    });

    const buyBtn = this.add.text(this.windowX + 8, this.windowY + this.windowH - 30,
      `[ Buy ${affordable.length} affordable recipes ]`, {
        fontSize: '10px', color: affordable.length > 0 ? '#88ff88' : '#666',
        backgroundColor: '#224422', padding: { x: 6, y: 3 },
      }).setScrollFactor(0).setDepth(3000).setInteractive({ useHandCursor: true });
    if (affordable.length > 0) {
      buyBtn.on('pointerdown', () => {
        const gs = this.scene.get('GameScene');
        for (const r of affordable) {
          const tier = r.resultId.includes('_t3') ? 3 : r.resultId.includes('_t2') ? 2 : 1;
          const price = tier === 3 ? 200 : tier === 2 ? 50 : 0;
          if (gs) (gs as any).buyRecipe?.(r.id, price);
        }
        this.time.delayedCall(200, () => {
          this.destroyVendorButtons();
          this.createVendorButtons(this.cachedUIData);
          this.refreshWindow();
        });
      });
    }
    this.vendorButtons.push(buyBtn);
  }

  private refreshWindow() {
    if (this.currentWindow && this.cachedUIData) {
      this.buildWindowContent(this.cachedUIData);
    }
  }

  private closeWindow() {
    this.currentWindow = null;
    this.windowContainer.setVisible(false);
    for (const btn of this.windowInteractables) btn.destroy();
    this.windowInteractables = [];
    this.destroyVendorButtons();
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
        const debuffStr = debuffSecs > 0 ? `  ⚠ Weakness: ${debuffSecs}s` : '';
        const lines: string[] = [`◉ Rank ${rank.toFixed(1)}${debuffStr}`, ''];

        // Calculate equipment bonuses
        const equipBonuses: Partial<Record<StatName, number>> = {};
        const equip = sphere.equipment ?? {};
        const statMap: Record<string, StatName> = {
          strength: StatName.Strength, agility: StatName.Agility,
          accuracy: StatName.Accuracy, evasion: StatName.Evasion,
          health: StatName.Health, armor: StatName.Armor,
          intellect: StatName.Intellect, will: StatName.Will,
          mana: StatName.Mana, luck: StatName.Luck,
        };
        for (const slotKey of Object.keys(equip)) {
          const itemId = (equip as any)[slotKey];
          if (!itemId) continue;
          const def = ITEMS[itemId];
          if (!def) continue;
          if (def.statBonuses) {
            for (const [s, v] of Object.entries(def.statBonuses)) {
              const sn = statMap[s];
              if (sn && v) equipBonuses[sn] = (equipBonuses[sn] ?? 0) + v;
            }
          }
          if (def.armorBonus) equipBonuses[StatName.Armor] = (equipBonuses[StatName.Armor] ?? 0) + def.armorBonus;
        }

        for (const stat of STAT_ORDER) {
          const base = sphere.stats[stat];
          const bonus = equipBonuses[stat] ?? 0;
          const total = base + bonus;
          const cap = caps[stat];
          const bonusStr = bonus > 0 ? ` (+${bonus})` : '';

          if (cap !== undefined) {
            const isCapped = base >= cap;
            // Show: base/cap = total(+bonus)
            let line = `► ${STAT_NAMES_SHORT[stat]}: ${base}/${cap}${bonusStr} = ${total}`;
            if (!isCapped) {
              const xp = xpTracker[stat] ?? 0;
              const need = xpToNextLevel(base);
              line += `  ${buildXPBar(xp, need, 6)}`;
            } else line += ' ' + t('stats.cap');
            lines.push(line);
          } else {
            lines.push(`  ${STAT_NAMES_SHORT[stat]}: ${total}${bonusStr}`);
          }
        }
        const sig = data.body?.definition.signatureSpell;
        const threshold = data.body?.definition.spellXPThreshold;
        if (sig && threshold) {
          lines.push('');
          const learned = sphere.learnedSpells.some(sp => sp.id === sig.id);
          if (learned) {
            lines.push(`✦ ${sig.nameRu} — LEARNED`);
          } else {
            const cur = sphere.spellProgress[sig.id] ?? 0;
            lines.push(`✧ ${sig.nameRu}: ${buildXPBar(cur, threshold, 10)}  ${cur}/${threshold}`);
          }
        }

        // Show currency
        lines.push('');
        lines.push(`💰 ${formatCurrency(sphere.copper ?? 0)}`);

        this.windowTitleText.setText(t('stats.title'));
        this.windowContentText.setWordWrapWidth(this.windowW - 16, true).setText(lines.join('\n'));
        break;
      }
      case 'inventory': {
        const inv = data.inventory ?? [];
        const equip = data.sphere?.equipment ?? {};
        this.windowInteractables.forEach(t => t.destroy());
        this.windowInteractables = [];
        this.windowContentText.setText('');
        this.windowTitleText.setText('');

        const SLOT = 50;
        const GAP = 5;
        const rarityColors: Record<string, number> = { common: 0x444444, uncommon: 0x225522, rare: 0x333366, epic: 0x442266, legendary: 0x664400 };

        // All positions RELATIVE to windowContainer (0,0 = top-left of window)

        // ── LEFT: Character Equipment ──────────────────────
        const eqX = 12;
        const eqY = 30;

        const eqTitle = this.add.text(eqX + 50, eqY - 4, t('inv.equipment'), { fontSize: '10px', color: '#bbaa88' }).setOrigin(0.5, 0);
        this.windowContainer.add(eqTitle);
        this.windowInteractables.push(eqTitle);

        const eqSlots: { key: string; label: string; col: number; row: number }[] = [
          { key: 'helmet',      label: 'Head',    col: 1, row: 0 },
          { key: 'amulet',      label: 'Neck',    col: 0, row: 1 },
          { key: 'chest',       label: 'Chest',   col: 1, row: 1 },
          { key: 'weapon',      label: 'Wpn 1',   col: 2, row: 0 },
          { key: 'weapon2',     label: 'Wpn 2',   col: 2, row: 1 },
          { key: 'ring',        label: 'Ring',     col: 0, row: 2 },
          { key: 'gloves',      label: 'Hands',   col: 1, row: 2 },
          { key: 'shield',      label: 'Shield',  col: 2, row: 2 },
          { key: 'boots',       label: 'Feet',    col: 1, row: 3 },
          { key: 'weapon_rune', label: 'W.Rune',  col: 0, row: 4 },
          { key: 'armor_rune',  label: 'A.Rune',  col: 2, row: 4 },
        ];

        for (const es of eqSlots) {
          const sx = eqX + es.col * (SLOT + GAP);
          const sy = eqY + 14 + es.row * (SLOT + GAP);
          const itemId = (equip as any)[es.key];
          const itemDef = itemId ? ITEMS[itemId] : null;
          const bgColor = itemDef ? (rarityColors[itemDef.rarity] ?? 0x333333) : 0x1a1a2a;

          const bg = this.add.rectangle(sx + SLOT / 2, sy + SLOT / 2, SLOT, SLOT, bgColor, 0.9)
            .setStrokeStyle(1, itemDef ? 0x888888 : 0x333344).setInteractive();
          this.windowContainer.add(bg);
        this.windowInteractables.push(bg);

          const txt = this.add.text(sx + SLOT / 2, sy + SLOT / 2,
            itemDef ? (itemDef.icon ?? '?') : es.label,
            { fontSize: itemDef ? '22px' : '9px', color: itemDef ? '#ffffff' : '#555566' }
          ).setOrigin(0.5);
          this.windowContainer.add(txt);
        this.windowInteractables.push(txt);

          if (itemDef) {
            bg.on('pointerdown', () => {
              (equip as any)[es.key] = undefined;
              this.refreshWindow();
            });
          }
        }

        // ── RIGHT: Inventory Bag ──────────────────────────
        const bagX = 185;
        const bagY = 30;
        const COLS = 8;

        const bagTitle = this.add.text(bagX + 45, bagY - 4, t('inv.inventory'), { fontSize: '10px', color: '#bbaa88' }).setOrigin(0.5, 0);
        this.windowContainer.add(bagTitle);
        this.windowInteractables.push(bagTitle);

        for (let i = 0; i < Math.max(inv.length, 20); i++) {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const sx = bagX + col * (SLOT + GAP);
          const sy = bagY + 14 + row * (SLOT + GAP);
          const item = inv[i];
          const itemDef = item ? ITEMS[item.itemId] : null;
          const bgColor = itemDef ? (rarityColors[itemDef.rarity] ?? 0x333333) : 0x111118;

          const bg = this.add.rectangle(sx + SLOT / 2, sy + SLOT / 2, SLOT, SLOT, bgColor, 0.8)
            .setStrokeStyle(1, item ? 0x666666 : 0x222233).setInteractive();
          this.windowContainer.add(bg);
        this.windowInteractables.push(bg);

          if (itemDef && item) {
            const icon = this.add.text(sx + SLOT / 2, sy + SLOT / 2 - 4,
              itemDef.icon ?? '?', { fontSize: '20px' }
            ).setOrigin(0.5);
            this.windowContainer.add(icon);
        this.windowInteractables.push(icon);

            if (item.quantity > 1) {
              const qty = this.add.text(sx + SLOT - 2, sy + SLOT - 2,
                `${item.quantity}`, { fontSize: '10px', color: '#cccccc', stroke: '#000', strokeThickness: 2 }
              ).setOrigin(1);
              this.windowContainer.add(qty);
        this.windowInteractables.push(qty);
            }

            if (itemDef.type === 'equipment' && itemDef.equipSlot) {
              const slot = itemDef.equipSlot;
              bg.on('pointerdown', () => {
                (equip as any)[slot] = item.itemId;
                this.refreshWindow();
              });
            }
          }
        }
        break;
      }
      case 'quests': {
        const completedIds = data.quests.filter(q => q.completed).map(q => q.def.id);
        // Only show quests where prerequisites are met
        const active = data.quests.filter(q => {
          if (q.completed) return false;
          const prereqs = q.def.prerequisiteIds;
          if (!prereqs || prereqs.length === 0) return true;
          return prereqs.every(pid => completedIds.includes(pid));
        });
        const done = data.quests.filter(q => q.completed);
        const tracked = data.trackedQuestIds ?? [];
        const lines: string[] = [];
        let relY = WIN_TITLE_H + 8;
        const lineH = 15;

        if (active.length === 0) {
          lines.push('  All quests complete!');
        } else {
          for (const q of active) {
            const isTracked = tracked.includes(q.def.id);
            // Checkbox — inside container with relative coords
            const btn = this.add.text(
              this.windowW - 28, relY,
              isTracked ? '☑' : '☐',
              { fontSize: '14px', color: isTracked ? '#66ccff' : '#888899',
                padding: { x: 4, y: 2 } },
            ).setInteractive({ useHandCursor: true })
              .on('pointerover', () => btn.setColor('#aaddff'))
              .on('pointerout',  () => btn.setColor(isTracked ? '#66ccff' : '#556677'))
              .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
                ptr.event.stopPropagation();
                this.scene.get('GameScene').events.emit('track-quest', q.def.id);
                if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
              });
            this.windowContainer.add(btn);
            this.windowInteractables.push(btn);

            lines.push(`▸ ${q.def.nameRu}  +${q.def.xpReward} XP`);
            relY += lineH;
            for (let i = 0; i < q.def.objectives.length; i++) {
              const obj = q.def.objectives[i];
              const cur = q.counts[i];
              const d = cur >= obj.count ? '✓' : `${cur}/${obj.count}`;
              const verb = obj.type === 'kill' ? t('quest.kill') : obj.type === 'capture' ? t('quest.capture') : obj.type === 'talk' ? t('quest.talk') : obj.type === 'craft_t3' ? t('quest.craft') : obj.type === 'kill_boss' ? t('quest.defeat') : t('quest.learn');
              lines.push(`   ${verb} ${obj.targetNameRu ?? obj.targetId ?? ''}: ${d}`);
              relY += lineH;
            }
            relY += 4;
          }
        }
        if (done.length > 0) lines.push('', `✓ Completed: ${done.length} quests`);
        this.windowTitleText.setText(`▸ Quests  (${active.length} active)`);
        this.windowContentText.setWordWrapWidth(this.windowW - 30, true).setText(lines.join('\n'));
        break;
      }
      case 'achievements': {
        const statuses = getAllAchievementStatus(sphere);
        const cnt = statuses.filter(s => s.unlocked).length;
        const lines = statuses.map(({ def, unlocked }) =>
          `${unlocked ? '✓' : '✗'} ${def.icon} ${def.nameRu}\n   ${def.descRu}`
        );
        this.windowTitleText.setText(`★ Achievements  ${cnt}/${ACHIEVEMENTS.length}`);
        this.windowContentText.setWordWrapWidth(this.windowW - 16, true).setText(lines.join('\n'));
        break;
      }

      case 'vendor': {
        const coins = data.sphere?.copper ?? 0;
        const learned = data.sphere?.learnedRecipes ?? [];
        const filter = this.vendorFilter;

        // Filter recipes
        let filtered = RECIPES;
        if (filter === 'Weapon') filtered = RECIPES.filter(r => r.workbench === 'weaponsmith');
        else if (filter === 'Armor') filtered = RECIPES.filter(r => r.workbench === 'armorer');
        else if (filter === 'Jewel') filtered = RECIPES.filter(r => r.workbench === 'jeweler');
        else if (filter === 'Rune') filtered = RECIPES.filter(r => r.workbench === 'runemaster');
        else if (filter === 'T1') filtered = RECIPES.filter(r => !r.resultId.includes('_t2') && !r.resultId.includes('_t3'));
        else if (filter === 'T2') filtered = RECIPES.filter(r => r.resultId.includes('_t2'));
        else if (filter === 'T3') filtered = RECIPES.filter(r => r.resultId.includes('_t3'));

        const notLearned = filtered.filter(r => !learned.includes(r.id));

        const lines: string[] = [];
        lines.push(''); // space for filter tabs
        lines.push(`${notLearned.length} recipes available | ${filtered.length - notLearned.length} learned`);
        lines.push('');

        for (const recipe of notLearned) {
          const tier = recipe.resultId.includes('_t3') ? 3 : recipe.resultId.includes('_t2') ? 2 : 1;
          const price = tier === 3 ? 200 : tier === 2 ? 50 : 0;
          const result = ITEMS[recipe.resultId];
          const canAfford = coins >= price;
          const priceStr = price === 0 ? 'Free' : formatCurrency(price);
          lines.push(`${canAfford ? '●' : '○'} ${result?.icon ?? '?'} ${recipe.nameRu}  ${priceStr}`);
        }
        if (notLearned.length === 0) lines.push('✓ All learned!');

        this.windowTitleText.setText(`🏪 Merchant  💰 ${formatCurrency(coins)}`);
        this.windowContentText.setWordWrapWidth(this.windowW - 16, true).setText(lines.join('\n'));
        break;
      }

      case 'crafting': {
        const inv = data.inventory ?? [];
        const wbType = this.craftingWorkbenchType;
        const available = RECIPES.filter(r => r.workbench === wbType);
        const lines: string[] = [];

        lines.push(`═══ ${wbType.toUpperCase()} ═══`);
        lines.push('');

        if (available.length === 0) {
          lines.push('No recipes for this workbench.');
        }

        for (const recipe of available) {
          const result = ITEMS[recipe.resultId];
          lines.push(`${result?.icon ?? '?'} ${recipe.nameRu}  (${recipe.craftTime}s)`);
          if (result?.descRu) lines.push(`   ${result.descRu}`);

          // Ingredients with have/need
          const matLines: string[] = [];
          let canCraft = true;
          for (const [itemId, need] of Object.entries(recipe.materials)) {
            const have = inv.find(i => i.itemId === itemId)?.quantity ?? 0;
            const ok = have >= need;
            if (!ok) canCraft = false;
            const color = ok ? '' : '!';
            matLines.push(`   ${color}${ITEMS[itemId]?.icon ?? '?'} ${ITEMS[itemId]?.nameRu ?? itemId}: ${have}/${need}`);
          }
          lines.push(...matLines);
          lines.push(canCraft ? '   ✓ Ready to craft' : '   ✗ Missing materials');
          lines.push('');
        }

        this.windowTitleText.setText(`⚒ ${wbType.charAt(0).toUpperCase() + wbType.slice(1)}`);
        this.windowContentText.setWordWrapWidth(this.windowW - 16, true).setText(lines.join('\n'));

        // Craft buttons
        this.windowInteractables.forEach(t => t.destroy());
        this.windowInteractables = [];
        let btnY = 0;
        for (const recipe of available) {
          const canCraft = Object.entries(recipe.materials).every(([itemId, qty]) => {
            return (inv.find(i => i.itemId === itemId)?.quantity ?? 0) >= qty;
          });
          const btn = this.add.text(
            this.windowX + this.windowW - 60, this.windowY + 60 + btnY,
            canCraft ? t('quest.craft') : '---',
            {
              fontSize: '10px',
              color: canCraft ? '#88ff88' : '#666666',
              backgroundColor: canCraft ? '#224422' : '#222222',
              padding: { x: 6, y: 3 },
            }
          ).setDepth(1003).setInteractive();
          if (canCraft) {
            btn.on('pointerdown', () => {
              const gs = this.scene.get('GameScene');
              if (gs) (gs as any).startCraftingFromUI?.(recipe);
              this.time.delayedCall(200, () => this.refreshWindow());
            });
          }
          this.windowInteractables.push(btn);
          btnY += 80; // space per recipe
        }
        break;
      }
    }
  }

  private updateSealIndicator(sphere?: import('../entities/Sphere').Sphere) {
    const freq = sphere?.sealFrequencies ?? this.cachedUIData?.sphere?.sealFrequencies;
    if (!freq) return;
    const hasAny = Object.values(freq).some(v => v);
    this.sealContainer.setVisible(hasAny);
    if (!hasAny) return;
    const keys = ['fire', 'water', 'earth', 'wind'];
    for (let i = 0; i < keys.length; i++) {
      this.sealIcons[i]?.setAlpha(freq[keys[i]] ? 1 : 0.2);
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
        .setText(`★ ACHIEVEMENT: ${ach.nameRu}\n${ach.descRu}`)
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
