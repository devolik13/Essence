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
import { AchievementDef } from '../data/achievementDB';
import { STATUS_DEFS } from '../types/statuses';
import { THEME, TC, drawCorner, drawBrassLineV } from '../ui/theme';
import { showInventoryDom, hideInventoryDom, refreshInventoryDom, isInventoryDomOpen } from '../ui/inventoryDom';
import { showSpellTooltip, moveSpellTooltip, hideSpellTooltip } from '../ui/spellTooltip';
import { showSpellsWindowDom, hideSpellsWindowDom, isSpellsWindowDomOpen } from '../ui/spellsWindowDom';
import { showAchievementsWindowDom, hideAchievementsWindowDom, isAchievementsWindowDomOpen } from '../ui/achievementsWindowDom';
import { ALL_KNOWN_SPELLS } from '../data/allSpells';

const UI_LAYOUT_KEY = 'essence_ui_layout_v1';
const HEADER_H = 20;
const WIN_W = 310;
const WIN_TITLE_H = 22;

type WindowType = 'stats' | 'inventory' | 'quests' | 'achievements' | 'vendor' | 'crafting' | 'spells';
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
  bodyQuest: import('../systems/bodyQuestTracker').BodyQuestProgress | null;
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
  // Brass/ether vital bars (HP + Mana) above the skill bar
  private hpBarFill!:   Phaser.GameObjects.Rectangle;
  private hpBarText!:   Phaser.GameObjects.Text;
  private manaBarFill!: Phaser.GameObjects.Rectangle;
  private manaBarText!: Phaser.GameObjects.Text;
  private vitalsContainer!: Phaser.GameObjects.Container;
  // Gold display (top-right)
  private goldContainer!: Phaser.GameObjects.Container;
  private goldText!:    Phaser.GameObjects.Text;
  // Boss banner (top-center, visible when a boss is nearby)
  private bossBanner?:   Phaser.GameObjects.Container;
  private bossBarFill?:  Phaser.GameObjects.Rectangle;
  private bossNameText?: Phaser.GameObjects.Text;
  private bossHpText?:   Phaser.GameObjects.Text;
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
  private _questHudHeaderBg!: Phaser.GameObjects.Rectangle;
  private _questHudHeaderText!: Phaser.GameObjects.Text;
  private _questHudX: number = 0;
  private _questHudY: number = 0;

  // ── Menu buttons ──────────────────────────────────────
  private menuBtnBgs:   Phaser.GameObjects.Rectangle[] = [];
  private menuBtnIcons: Phaser.GameObjects.Text[]      = [];
  private menuBtnTexts: Phaser.GameObjects.Text[]      = [];
  private readonly menuBtnTypes: WindowType[] = ['stats', 'inventory', 'quests', 'achievements', 'spells'];

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
  private inventoryFilter: string = 'all';
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
  private skillSlotsBg:        Phaser.GameObjects.Rectangle[] = [];
  private skillSlotsFrame:     Phaser.GameObjects.Rectangle[] = [];
  private skillSlotsInner:     Phaser.GameObjects.Rectangle[] = [];
  private skillSlotsIcon:      Phaser.GameObjects.Text[]      = [];
  private skillSlotsKey:       Phaser.GameObjects.Text[]      = [];
  private skillSlotsMana:      Phaser.GameObjects.Text[]      = [];
  private skillSlotsCd:        Phaser.GameObjects.Rectangle[] = [];
  private skillSlotsCdText:    Phaser.GameObjects.Text[]      = [];
  private skillSlotsEnchantGlow: Phaser.GameObjects.Arc[]     = [];
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
  private minimapTerrainImg: Phaser.GameObjects.Image | null = null;
  private minimapMapW: number = MAP_WIDTH;
  private minimapMapH: number = MAP_HEIGHT;

  constructor() { super({ key: 'UIScene' }); }

  create() {
    this.scene.bringToTop();
    // Load saved layout before creating anything
    this.loadUILayout();

    // ── Fixed UI elements (not in panels) ──────────────
    // Legacy (kept hidden): consolidated single-line HP/Mana/gold text
    this.resourceText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 72, '', {
      fontSize: '13px', color: '#ffffff', align: 'center',
      backgroundColor: '#000000aa', padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1000).setVisible(false);

    // ── Vital bars (HP + Mana) above skill bar — brass/ether ───────────
    this.buildVitalsWidget();
    // ── Gold pouch at top-right ──────────────────────────
    this.buildGoldWidget();

    this.hintText = this.add.text(10, GAME_HEIGHT - 12, '', {
      fontSize: '10px', fontFamily: '"Special Elite", monospace', color: TC.text3,
    }).setOrigin(0, 1).setScrollFactor(0).setDepth(1000);

    this.statusBarText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 55, '', {
      fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1, align: 'center',
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(1000);

    this.captureBarBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, 140, 10, THEME.ink2)
      .setScrollFactor(0).setDepth(1001).setVisible(false)
      .setStrokeStyle(1, THEME.brass0, 0.6);
    this.captureBar = this.add.rectangle(GAME_WIDTH / 2 - 70, GAME_HEIGHT / 2 + 40, 0, 10, THEME.ether2)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 26, 'Capturing...', {
      fontSize: '11px', fontFamily: '"Special Elite", monospace', color: TC.ether3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    const castY = GAME_HEIGHT - 72;
    this.castBarBg = this.add.rectangle(GAME_WIDTH / 2, castY, 160, 10, THEME.ink2)
      .setScrollFactor(0).setDepth(1001).setVisible(false)
      .setStrokeStyle(1, THEME.brass0, 0.6);
    this.castBar = this.add.rectangle(GAME_WIDTH / 2 - 80, castY, 0, 10, THEME.brass3)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1002).setVisible(false);
    this.castLabel = this.add.text(GAME_WIDTH / 2, castY - 14, '', {
      fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: TC.brass3,
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
      const label = this.add.text(0, 0, 'Seal:', { fontSize: '10px', fontFamily: '"Special Elite", monospace', color: TC.text2 }).setOrigin(0, 0.5);
      this.sealContainer.add(label);
      let ox = 32;
      for (const el of elements) {
        const icon = this.add.text(ox, 0, el.symbol, { fontSize: '14px' }).setOrigin(0, 0.5).setAlpha(0.2);
        this.sealContainer.add(icon);
        this.sealIcons.push(icon);
        ox += 22;
      }
    }

    // ── Tracked quest HUD (right side, draggable, brass/ether style) ─
    this._questHudX = GAME_WIDTH - 220;
    this._questHudY = 10;
    this._questHudBg = this.add.rectangle(this._questHudX, this._questHudY, 210, 100, THEME.ink1, 0.88)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(999).setVisible(false)
      .setStrokeStyle(1, THEME.brass1, 0.9);
    // Brass header strip at the top of the quest panel
    this._questHudHeaderBg = this.add.rectangle(this._questHudX, this._questHudY, 210, 18, THEME.ink2, 0.95)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1000).setVisible(false)
      .setStrokeStyle(1, THEME.brass1, 0.6);
    this._questHudHeaderText = this.add.text(this._questHudX + 8, this._questHudY + 3, 'QUESTS', {
      fontSize: '9px', fontFamily: '"Special Elite", monospace', color: TC.brass3,
    }).setScrollFactor(0).setDepth(1001).setVisible(false);
    this.trackedQuestText = this.add.text(this._questHudX + 8, this._questHudY + 24, '', {
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1, lineSpacing: 3,
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
      this._questHudHeaderBg.setPosition(this._questHudX, this._questHudY);
      this._questHudHeaderText.setPosition(this._questHudX + 8, this._questHudY + 3);
      this.trackedQuestText.setPosition(this._questHudX + 8, this._questHudY + 24);
    });
    this.input.setDraggable(this._questHudBg);

    // ── Dialog panel (bottom of screen) ────────────────────
    {
      const dY = GAME_HEIGHT - 130;
      const dBg = this.add.rectangle(GAME_WIDTH / 2, dY + 50, GAME_WIDTH - 40, 100, THEME.ink1, 0.94)
        .setStrokeStyle(1, THEME.brass1);
      this.dialogSpeaker = this.add.text(30, dY + 8, '', {
        fontSize: '13px', fontFamily: '"Cormorant Garamond", serif', color: TC.brass4, fontStyle: 'bold',
      });
      this.dialogText = this.add.text(30, dY + 26, '', {
        fontSize: '11px', fontFamily: '"Inter", sans-serif', color: TC.text1, lineSpacing: 3,
        wordWrap: { width: GAME_WIDTH - 80 },
      });
      const continueBtn = this.add.text(GAME_WIDTH - 50, dY + 80, '[Continue]', {
        fontSize: '10px', fontFamily: '"Special Elite", monospace', color: TC.ether2,
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
        .on('pointerover', () => continueBtn.setColor(TC.ether3))
        .on('pointerout', () => continueBtn.setColor(TC.ether2))
        .on('pointerdown', () => this.advanceDialog());

      this.dialogContainer = this.add.container(0, 0, [dBg, this.dialogSpeaker, this.dialogText, continueBtn])
        .setScrollFactor(0).setDepth(2000).setVisible(false);
    }

    // ── Panel content text objects (positioned in updateUI) ──
    this.targetPanel = this.add.text(0, 0, '', {
      fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1, lineSpacing: 4,
      backgroundColor: '#14110cdd', padding: { x: 8, y: 6 },
    }).setScrollFactor(0).setDepth(1000).setVisible(false);

    this.bodyInfoText = this.add.text(0, 0, '', {
      fontSize: '11px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1,
      backgroundColor: '#14110cdd', padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setDepth(1000);

    this.logText = this.add.text(0, 0, '', {
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.text2, lineSpacing: 3,
    }).setScrollFactor(0).setDepth(1000);

    // Achievement unlock notification (top-center, fades out)
    this.achievementNotifBg = this.add.rectangle(GAME_WIDTH / 2, 60, 280, 36, THEME.ink1, 0.95)
      .setScrollFactor(0).setDepth(1200).setStrokeStyle(2, THEME.brass3, 0.9).setVisible(false);
    this.achievementNotifText = this.add.text(GAME_WIDTH / 2, 60, '', {
      fontSize: '12px', fontFamily: '"Cormorant Garamond", serif', color: TC.brass4, align: 'center',
      stroke: '#0d0b08', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1201).setVisible(false);

    // ── Mini-map ──────────────────────────────────────────
    const mm = this.panelStates.minimap;
    this.minimapBorder = this.add.rectangle(mm.x, mm.y + HEADER_H, mm.w, mm.h, THEME.ink1, 0.9)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(1008)
      .setStrokeStyle(1, THEME.brass1, 0.85);
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
      fontSize: '10px', fontFamily: '"Special Elite", monospace', color: TC.text2, backgroundColor: '#14110c', padding: { x: 4, y: 2 },
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
    gs.events.on('editor-mode', (active: boolean) => {
      this.scene.setVisible(!active);
      this.input.enabled = !active;
    });
    gs.events.on('minimap-terrain', (t: { w: number; h: number; colors: number[]; mapW: number; mapH: number }) => {
      this.minimapMapW = t.mapW;
      this.minimapMapH = t.mapH;
      this.buildMinimapTexture(t);
    });
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
    gs.events.on('log', (data: { text: string; color?: string }) => this.addLog(data.text));
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
    gs.events.on('boss-state', (data: { name: string; hp: number; maxHp: number; hpFrac: number } | null) => {
      this.updateBossBanner(data);
    });
  }

  // ── Panel header factory ─────────────────────────────

  private makeHeader(panelId: string, defaultLabel: string): Phaser.GameObjects.Container {
    const state = this.panelStates[panelId];
    let dragMoved = false;

    const bg = this.add.rectangle(0, 0, state.w, HEADER_H, THEME.ink2, 0.95)
      .setOrigin(0, 0).setStrokeStyle(1, THEME.brass1, 0.85);
    const label = this.add.text(7, 3, defaultLabel, {
      fontSize: '10px', fontFamily: '"Special Elite", monospace', color: TC.brass3,
    }).setOrigin(0, 0);
    const arrow = this.add.text(state.w - 5, 3, '▼', {
      fontSize: '9px', color: TC.text3,
    }).setOrigin(1, 0);

    // Drag cursor icon (small grip dots)
    const grip3 = this.add.text(state.w / 2, 3, '⋮⋮', {
      fontSize: '9px', color: TC.text3,
    }).setOrigin(0.5, 0);

    const container = this.add.container(state.x, state.y, [bg, label, arrow, grip3])
      .setScrollFactor(0).setDepth(1010)
      .setSize(state.w, HEADER_H)
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, state.w, HEADER_H),
        Phaser.Geom.Rectangle.Contains,
      )
      .on('pointerover', () => {
        (bg as Phaser.GameObjects.Rectangle).setFillStyle(THEME.ink3, 0.98);
        this.input.setDefaultCursor('grab');
      })
      .on('pointerout', () => {
        (bg as Phaser.GameObjects.Rectangle).setFillStyle(THEME.ink2, 0.95);
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

    const grip = this.add.rectangle(0, 0, 10, 10, THEME.brass0, 0.75)
      .setScrollFactor(0).setDepth(1011)
      .setStrokeStyle(1, THEME.brass2, 0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        grip.setFillStyle(THEME.brass1, 0.9);
        this.input.setDefaultCursor(vertical ? 'se-resize' : 'e-resize');
      })
      .on('pointerout', () => {
        grip.setFillStyle(THEME.brass0, 0.75);
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

      // Active body quest
      const bq = data.bodyQuest;
      if (bq && !bq.completed) {
        if (lines.length > 0) lines.push('');
        lines.push(`★ ${bq.def.nameRu}`);
        for (let i = 0; i < bq.def.objectives.length; i++) {
          const obj = bq.def.objectives[i];
          const cur = bq.counts[i];
          const isDone = cur >= obj.count;
          if (obj.type === 'survive' && !isDone) {
            const secs = Math.ceil(bq.surviveTimers[i]);
            lines.push(`  ${secs}s ${obj.description}`);
          } else {
            const label = obj.description || obj.targetNameRu || '';
            lines.push(`  ${isDone ? '✓' : `${cur}/${obj.count}`} ${label}`);
          }
        }
      }

      if (lines.length > 0) {
        this.trackedQuestText.setText(lines.join('\n')).setVisible(true);
        this.trackedQuestText.setPosition(this._questHudX + 8, this._questHudY + 24);
        // Resize background + header to fit content
        const tw = Math.max(180, this.trackedQuestText.width + 16);
        const th = this.trackedQuestText.height + 30;
        this._questHudBg.setSize(tw, th).setVisible(true);
        this._questHudHeaderBg.setSize(tw, 18).setVisible(true);
        this._questHudHeaderBg.setPosition(this._questHudX, this._questHudY);
        this._questHudHeaderText.setPosition(this._questHudX + 8, this._questHudY + 3).setVisible(true);
      } else {
        this.trackedQuestText.setVisible(false);
        this._questHudBg.setVisible(false);
        this._questHudHeaderBg.setVisible(false);
        this._questHudHeaderText.setVisible(false);
      }
    }

    // ── Refresh open window ───────────────────────────────
    if (this.currentWindow) this.buildWindowContent(data);

    // ── Resources (always visible when in body) ──────────
    this.updateGoldWidget(data.sphere.copper ?? 0);
    if (body) {
      const hpPct  = body.currentHP   / body.maxHP;
      const manaPct= body.currentMana / body.maxMana;
      const barW = 210 - 2;
      this.hpBarFill.width = Math.max(0, Math.min(1, hpPct)) * barW;
      this.manaBarFill.width = Math.max(0, Math.min(1, manaPct)) * barW;
      this.hpBarText.setText(`${Math.round(body.currentHP)} / ${body.maxHP}`);
      this.manaBarText.setText(`${Math.round(body.currentMana)} / ${body.maxMana}`);
      this.vitalsContainer.setVisible(true);
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
      this.vitalsContainer.setVisible(false);
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
        this.setHeaderLabel('body', `Body · ${body.definition.nameRu}`);
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

  private buildMinimapTexture(t: { w: number; h: number; colors: number[] }) {
    if (this.minimapTerrainImg) this.minimapTerrainImg.destroy();
    const canvas = document.createElement('canvas');
    canvas.width = t.w;
    canvas.height = t.h;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(t.w, t.h);
    for (let i = 0; i < t.colors.length; i++) {
      const c = t.colors[i];
      imgData.data[i * 4]     = (c >> 16) & 0xff;
      imgData.data[i * 4 + 1] = (c >> 8) & 0xff;
      imgData.data[i * 4 + 2] = c & 0xff;
      imgData.data[i * 4 + 3] = 230;
    }
    ctx.putImageData(imgData, 0, 0);
    const key = '__minimap_terrain__';
    if (this.textures.exists(key)) this.textures.remove(key);
    this.textures.addCanvas(key, canvas);
    this.minimapTerrainImg = this.add.image(0, 0, key).setOrigin(0).setScrollFactor(0).setDepth(1009);
  }

  private drawMinimap(data: UIData) {
    const s = this.panelStates.minimap;
    this.panelHeaders['minimap'].setPosition(s.x, s.y);
    this.setHeaderLabel('minimap', `Map  ${s.w}×${s.h}`);

    const collapsed = s.collapsed;
    const mapTop = s.y + HEADER_H;
    this.minimapBorder.setPosition(s.x, mapTop).setSize(s.w, s.h).setVisible(!collapsed);
    this.minimapGfx.clear();

    if (this.minimapTerrainImg) {
      this.minimapTerrainImg.setVisible(!collapsed);
      if (!collapsed) {
        this.minimapTerrainImg.setPosition(s.x, mapTop).setDisplaySize(s.w, s.h);
      }
    }

    if (!collapsed) {
      const ml = s.x;
      const mt = mapTop;
      const g = this.minimapGfx;

      const mapW = this.minimapMapW;
      const mapH = this.minimapMapH;
      const sx = s.w / mapW;
      const sy = s.h / mapH;

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
        g.fillStyle(THEME.ether2, 1.0);
        g.fillRect(px - 1.5, py - 1.5, 3, 3);
        g.lineStyle(1, THEME.ether3, 0.55);
        g.strokeRect(px - 2.5, py - 2.5, 5, 5);
      }

      this.positionGrip('minimap', mt + s.h);
    } else {
      this.positionGrip('minimap', s.y + HEADER_H);
    }
  }

  // ── Skill bar ─────────────────────────────────────────

  private buildSkillBar() {
    const DIVIDER_GAP = 16; // extra gap between weapon (0-4) and neutral (5-7)
    const totalW = SKILL_SLOTS_COUNT * SKILL_SLOT_SIZE + (SKILL_SLOTS_COUNT - 1) * SKILL_SLOT_GAP + DIVIDER_GAP;
    const startX = (GAME_WIDTH - totalW) / 2;
    const y = GAME_HEIGHT - SKILL_SLOT_SIZE / 2 - 10;

    // Brass-framed tray behind the whole bar, like a weapon rack on the wall.
    const trayPadX = 10, trayPadY = 8;
    const trayW = totalW + trayPadX * 2;
    const trayH = SKILL_SLOT_SIZE + trayPadY * 2;
    const trayCx = startX + totalW / 2;
    const trayCy = y;
    this.add.rectangle(trayCx, trayCy, trayW, trayH, THEME.ink1, 0.92)
      .setScrollFactor(0).setDepth(999);
    this.add.rectangle(trayCx, trayCy, trayW, trayH)
      .setStrokeStyle(1, THEME.brass1, 1).setFillStyle(0, 0)
      .setScrollFactor(0).setDepth(999);
    this.add.rectangle(trayCx, trayCy, trayW - 4, trayH - 4)
      .setStrokeStyle(1, THEME.brass2, 0.2).setFillStyle(0, 0)
      .setScrollFactor(0).setDepth(999);

    // Corner ornaments ✦-style brackets on the tray.
    const cx1 = trayCx - trayW / 2 + 4, cx2 = trayCx + trayW / 2 - 4;
    const cy1 = trayCy - trayH / 2 + 4, cy2 = trayCy + trayH / 2 - 4;
    drawCorner(this, cx1, cy1, 6, 'tl').setScrollFactor(0).setDepth(999);
    drawCorner(this, cx2, cy1, 6, 'tr').setScrollFactor(0).setDepth(999);
    drawCorner(this, cx1, cy2, 6, 'bl').setScrollFactor(0).setDepth(999);
    drawCorner(this, cx2, cy2, 6, 'br').setScrollFactor(0).setDepth(999);

    // Divider between slot 5 and 6 — brass gradient line
    const divX = startX + 5 * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP) + DIVIDER_GAP / 2;
    drawBrassLineV(this, divX, y - SKILL_SLOT_SIZE / 2 - 2, SKILL_SLOT_SIZE + 4)
      .setScrollFactor(0).setDepth(1000);

    // Group labels (small-caps mechanical)
    const labelY = y - SKILL_SLOT_SIZE / 2 - 11;
    this.add.text(startX + 2.5 * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP), labelY, t('skill.weapon_tab').toUpperCase(), {
      fontSize: '9px', fontFamily: '"Special Elite", monospace', color: TC.text3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    this.add.text(divX + 1.5 * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP), labelY, t('skill.neutral').toUpperCase(), {
      fontSize: '9px', fontFamily: '"Special Elite", monospace', color: TC.text3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    for (let i = 0; i < SKILL_SLOTS_COUNT; i++) {
      const extraGap = i >= 5 ? DIVIDER_GAP : 0;
      const x = startX + i * (SKILL_SLOT_SIZE + SKILL_SLOT_GAP) + extraGap + SKILL_SLOT_SIZE / 2;

      // Enchant glow (hidden by default, shown pulsing when slot is active enchant)
      const glow = this.add.circle(x, y, SKILL_SLOT_SIZE * 0.72, THEME.brass3, 0.22)
        .setScrollFactor(0).setDepth(999).setVisible(false);
      this.skillSlotsEnchantGlow.push(glow);

      // Slot background (deep void)
      const bg = this.add.rectangle(x, y, SKILL_SLOT_SIZE, SKILL_SLOT_SIZE, THEME.ink0, 0.95)
        .setScrollFactor(0).setDepth(1000);
      this.skillSlotsBg.push(bg);

      // Outer brass frame
      const frame = this.add.rectangle(x, y, SKILL_SLOT_SIZE, SKILL_SLOT_SIZE)
        .setStrokeStyle(1, THEME.brass1, 0.9).setFillStyle(0, 0)
        .setScrollFactor(0).setDepth(1001);
      this.skillSlotsFrame.push(frame);

      // Inner hairline — subtle etched look
      const inner = this.add.rectangle(x, y, SKILL_SLOT_SIZE - 4, SKILL_SLOT_SIZE - 4)
        .setStrokeStyle(1, THEME.brass2, 0.18).setFillStyle(0, 0)
        .setScrollFactor(0).setDepth(1001);
      this.skillSlotsInner.push(inner);

      const icon = this.add.text(x, y - 2, '', {
        fontSize: '12px',
        fontFamily: '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji","Cormorant Garamond",serif',
        color: TC.text1, align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
      this.skillSlotsIcon.push(icon);

      // Keybind number — top-left, brass accent
      const key = this.add.text(
        x - SKILL_SLOT_SIZE / 2 + 3, y - SKILL_SLOT_SIZE / 2 + 2, `${i + 1}`,
        { fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.brass3 },
      ).setScrollFactor(0).setDepth(1003);
      this.skillSlotsKey.push(key);

      // Mana cost pip — bottom-right, ether blue
      const mana = this.add.text(
        x + SKILL_SLOT_SIZE / 2 - 3, y + SKILL_SLOT_SIZE / 2 - 2, '',
        { fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.ether3 },
      ).setOrigin(1, 1).setScrollFactor(0).setDepth(1003);
      this.skillSlotsMana.push(mana);

      const cd = this.add.rectangle(x, y + SKILL_SLOT_SIZE / 2, SKILL_SLOT_SIZE, 0, THEME.ink0, 0.7)
        .setOrigin(0.5, 1).setScrollFactor(0).setDepth(1004);
      this.skillSlotsCd.push(cd);

      const cdText = this.add.text(x, y, '', {
        fontSize: '14px',
        fontFamily: '"Cormorant Garamond", serif', fontStyle: '600',
        color: TC.paper0, align: 'center',
        stroke: TC.ink0, strokeThickness: 3,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1005);
      this.skillSlotsCdText.push(cdText);

      bg.setInteractive({ useHandCursor: true })
        .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          ptr.event.stopPropagation();
          if (i === 0 || this.skillBarLocked) {
            this.scene.get('GameScene').events.emit('activate-spell-slot', i);
            return;
          }
          if (this.cachedInCombat) { this.addLog(t('skill.no_combat')); return; }
          if (this.spellPickerSlot === i) this.closeSpellPicker();
          else this.openSpellPicker(i);
        })
        .on('pointerover', (ptr: Phaser.Input.Pointer) => {
          if (!this.skillSlotsFrame[i].getData('active')) frame.setStrokeStyle(1, THEME.brass3, 1);
          const ability = this.cachedBody?.abilitySlots[i]?.ability;
          const ev = ptr.event as MouseEvent;
          if (ability) showSpellTooltip(ability, ev.clientX ?? 0, ev.clientY ?? 0);
        })
        .on('pointermove', (ptr: Phaser.Input.Pointer) => {
          const ev = ptr.event as MouseEvent;
          moveSpellTooltip(ev.clientX ?? 0, ev.clientY ?? 0);
        })
        .on('pointerout',  () => {
          if (!this.skillSlotsFrame[i].getData('active')) frame.setStrokeStyle(1, THEME.brass1, 0.9);
          hideSpellTooltip();
        });
    }

    // Lock button — styled like a brass icon-btn
    const lockX = startX - 22;
    this.add.rectangle(lockX, y, 22, 22, THEME.ink0, 0.9).setStrokeStyle(1, THEME.brass1, 0.9)
      .setScrollFactor(0).setDepth(1005);
    this.lockBtn = this.add.text(lockX, y, '🔓', { fontSize: '12px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1006)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.skillBarLocked = !this.skillBarLocked;
        this.lockBtn.setText(this.skillBarLocked ? '🔒' : '🔓');
        if (this.skillBarLocked) this.closeSpellPicker();
      });

    this.spellPickerContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(1100).setVisible(false);
  }

  private openSpellPicker(slotIndex: number) {
    this.spellPickerSlot = slotIndex;
    const usedIds = new Set(
      this.cachedBody?.abilitySlots
        .filter((s, i) => i !== slotIndex && s.ability)
        .map(s => s.ability!.id) ?? []
    );
    const weaponSchool = this.cachedUIData?.weaponSchool ?? null;
    const bodyWeapon = this.cachedBody?.definition.weapon ?? null;
    const isWeaponSlot = slotIndex < 5;
    const spells = this.cachedLearnedSpells.filter(sp => {
      if (usedIds.has(sp.id)) return false;
      const hasWeaponReq = sp.requiredWeapons && sp.requiredWeapons.length > 0;
      const isElemental = sp.school && sp.school !== 'neutral';
      const isNeutral = !hasWeaponReq && !isElemental;

      if (isWeaponSlot) {
        // Slots 1-5: weapon abilities + elemental spells (matching staff)
        if (isNeutral) return false;
        if (isElemental) return sp.school === weaponSchool;
        if (hasWeaponReq) return !!bodyWeapon && sp.requiredWeapons!.includes(bodyWeapon);
        return false;
      } else {
        // Slots 6-7-8: neutral only (no weapon req, no elemental)
        return isNeutral;
      }
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

    const bg = this.add.rectangle(panelW / 2, panelH / 2, panelW, panelH, THEME.ink1, 0.96)
      .setStrokeStyle(1, THEME.brass1, 0.9);
    const label = this.add.text(panelW / 2, 4, `${t('skill.slot')} ${slotIndex + 1} ${t('skill.choose')}`, {
      fontSize: '9px', fontFamily: '"Special Elite", monospace', color: TC.brass3,
    }).setOrigin(0.5, 0);
    this.spellPickerContainer.add([bg, label]);

    spells.forEach((spell, idx) => {
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const ix = gap + 4 + col * (sz + gap) + sz / 2;
      const iy = 20 + row * (sz + gap) + sz / 2;

      const ibg = this.add.rectangle(ix, iy, sz, sz, THEME.ink2)
        .setStrokeStyle(1, THEME.brass0).setInteractive({ useHandCursor: true })
        .on('pointerover', () => ibg.setFillStyle(THEME.ink3))
        .on('pointerout',  () => ibg.setFillStyle(THEME.ink2))
        .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          ptr.event.stopPropagation();
          this.scene.get('GameScene').events.emit('assign-spell', { slotIndex, spell });
          this.closeSpellPicker();
        });
      const itxt = this.add.text(ix, iy - 2, spell.nameRu.slice(0, 7), {
        fontSize: '8px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1, align: 'center',
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
      .setStrokeStyle(1, THEME.brass0).setInteractive({ useHandCursor: true })
      .on('pointerover', () => cbg.setFillStyle(0x331111))
      .on('pointerout',  () => cbg.setFillStyle(0x221111))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.scene.get('GameScene').events.emit('assign-spell', { slotIndex, spell: null });
        this.closeSpellPicker();
      });
    const ctxt = this.add.text(cx, cy, '✕', {
      fontSize: '14px', color: '#c86a6a',
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
        const bg = this.add.rectangle(0, 0, boxSize, boxSize, THEME.ink2, 0.85).setStrokeStyle(1, THEME.brass0).setScrollFactor(0).setDepth(1010);
        const icon = this.add.text(0, -6, '', { fontSize: '18px' }).setOrigin(0.5).setScrollFactor(0).setDepth(1011);
        const timer = this.add.text(0, 14, '', { fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1 }).setOrigin(0.5).setScrollFactor(0).setDepth(1011);
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
      const isActiveEnchant = !!(ability && activeEnchantId && ability.id === activeEnchantId);

      // Background tint: ether-tint for filled slots, deeper ink for empty
      const bgColor =
        isActiveEnchant ? THEME.brass1 :
        ability         ? THEME.ink2   :
                          THEME.ink0;
      this.skillSlotsBg[i].setFillStyle(bgColor, isActiveEnchant ? 0.6 : 0.95);

      // Frame: bright brass for enchant, normal brass otherwise
      const frame = this.skillSlotsFrame[i];
      if (isActiveEnchant) {
        frame.setStrokeStyle(2, THEME.brass4, 1);
        frame.setData('active', true);
      } else {
        frame.setStrokeStyle(1, THEME.brass1, 0.9);
        frame.setData('active', false);
      }

      // Enchant glow pulse (simple alpha tween)
      const glow = this.skillSlotsEnchantGlow[i];
      if (isActiveEnchant && !glow.visible) {
        glow.setVisible(true);
        this.tweens.add({
          targets: glow, alpha: { from: 0.12, to: 0.32 },
          duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
      } else if (!isActiveEnchant && glow.visible) {
        this.tweens.killTweensOf(glow);
        glow.setVisible(false);
      }

      // Icon
      if (i === 0 && body) {
        this.skillSlotsIcon[i].setText('⚔').setColor(TC.brass3).setFontSize('18px');
      } else if (ability) {
        this.skillSlotsIcon[i].setText(ability.nameRu.slice(0, 6)).setColor(TC.ether3).setFontSize('10px');
      } else {
        this.skillSlotsIcon[i].setText('');
      }

      // Mana cost pip
      if (ability && ability.manaCost) {
        this.skillSlotsMana[i].setText(String(ability.manaCost));
      } else {
        this.skillSlotsMana[i].setText('');
      }

      // Cooldown
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

  // ── Vitals (HP + Mana) bars above skill bar ──────────
  private buildVitalsWidget() {
    const barW = 210;
    const barH = 10;
    const gap = 16;
    const totalW = barW * 2 + gap;
    const cx = GAME_WIDTH / 2;
    // Center above the skill bar tray.
    const y = GAME_HEIGHT - SKILL_SLOT_SIZE - 32;

    this.vitalsContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);

    // Shared tray
    const trayPadX = 14, trayPadY = 10;
    const trayW = totalW + trayPadX * 2;
    const trayH = barH + trayPadY * 2;
    const tray = this.add.rectangle(cx, y, trayW, trayH, THEME.ink1, 0.88)
      .setScrollFactor(0).setDepth(999);
    const outline = this.add.rectangle(cx, y, trayW, trayH)
      .setStrokeStyle(1, THEME.brass1, 0.9).setFillStyle(0, 0)
      .setScrollFactor(0).setDepth(999);
    const inner = this.add.rectangle(cx, y, trayW - 4, trayH - 4)
      .setStrokeStyle(1, THEME.brass2, 0.18).setFillStyle(0, 0)
      .setScrollFactor(0).setDepth(999);
    this.vitalsContainer.add([tray, outline, inner]);

    const hpX = cx - totalW / 2;
    const manaX = cx - totalW / 2 + barW + gap;

    // ── HP bar ──
    const hpBg = this.add.rectangle(hpX, y, barW, barH, 0x0b0905, 1)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1000)
      .setStrokeStyle(1, THEME.ink4, 1);
    this.hpBarFill = this.add.rectangle(hpX + 1, y, 0, barH - 2, 0xc64040, 1)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001);
    const hpLabel = this.add.text(hpX, y - barH / 2 - 10, 'HP', {
      fontSize: '9px', fontFamily: '"Special Elite", monospace', color: TC.text3,
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001);
    this.hpBarText = this.add.text(hpX + barW, y - barH / 2 - 10, '0/0', {
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.paper0,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);

    // ── Mana bar ──
    const manaBg = this.add.rectangle(manaX, y, barW, barH, 0x0b0905, 1)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1000)
      .setStrokeStyle(1, THEME.ink4, 1);
    this.manaBarFill = this.add.rectangle(manaX + 1, y, 0, barH - 2, THEME.ether2, 1)
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001);
    const manaLabel = this.add.text(manaX, y - barH / 2 - 10, 'MANA', {
      fontSize: '9px', fontFamily: '"Special Elite", monospace', color: TC.text3,
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001);
    this.manaBarText = this.add.text(manaX + barW, y - barH / 2 - 10, '0/0', {
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.paper0,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);

    this.vitalsContainer.add([hpBg, this.hpBarFill, hpLabel, this.hpBarText, manaBg, this.manaBarFill, manaLabel, this.manaBarText]);
    this.vitalsContainer.setVisible(false);
  }

  // ── Gold pouch (top-right) ───────────────────────────
  private buildGoldWidget() {
    const y = 18;
    const rightPad = 14;
    this.goldContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(1000);

    const padX = 10, padY = 5;
    this.goldText = this.add.text(0, 0, '—', {
      fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', color: TC.paper0,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);
    const textX = GAME_WIDTH - rightPad - padX;
    this.goldText.setPosition(textX, y);

    // Coin icon circle (brass gradient approximation)
    const coinX = textX - this.goldText.width - 8;
    const coin = this.add.circle(coinX, y, 7, THEME.brass3, 1)
      .setStrokeStyle(1, THEME.brass1, 1)
      .setScrollFactor(0).setDepth(1001);
    const coinInner = this.add.circle(coinX, y, 4, THEME.brass4, 1)
      .setScrollFactor(0).setDepth(1002);

    // Tray around text+coin
    const contentW = this.goldText.width + 22;
    const trayW = contentW + padX * 2;
    const trayH = 22;
    const trayCx = GAME_WIDTH - rightPad - trayW / 2;
    const tray = this.add.rectangle(trayCx, y, trayW, trayH, THEME.ink1, 0.85)
      .setScrollFactor(0).setDepth(999);
    const outline = this.add.rectangle(trayCx, y, trayW, trayH)
      .setStrokeStyle(1, THEME.brass1, 0.85).setFillStyle(0, 0)
      .setScrollFactor(0).setDepth(999);

    this.goldContainer.add([tray, outline, coin, coinInner, this.goldText]);
    (this.goldContainer as any)._coinX = coinX;
    (this.goldContainer as any)._coin = coin;
    (this.goldContainer as any)._coinInner = coinInner;
    (this.goldContainer as any)._tray = tray;
    (this.goldContainer as any)._outline = outline;
    (this.goldContainer as any)._rightPad = rightPad;
    (this.goldContainer as any)._padX = padX;
    (this.goldContainer as any)._y = y;
  }

  private updateGoldWidget(copper: number) {
    const coins = formatCurrency(copper);
    this.goldText.setText(coins);
    const ctx: any = this.goldContainer;
    const padX = ctx._padX;
    const rightPad = ctx._rightPad;
    const y = ctx._y;
    const textX = GAME_WIDTH - rightPad - padX;
    this.goldText.setPosition(textX, y);
    const coinX = textX - this.goldText.width - 8;
    ctx._coin.setPosition(coinX, y);
    ctx._coinInner.setPosition(coinX, y);
    const contentW = this.goldText.width + 22;
    const trayW = contentW + padX * 2;
    const trayCx = GAME_WIDTH - rightPad - trayW / 2;
    ctx._tray.setPosition(trayCx, y).setSize(trayW, 22);
    ctx._outline.setPosition(trayCx, y).setSize(trayW, 22);
  }

  // ── Boss banner (top-center, only visible when a boss is nearby) ──
  private updateBossBanner(data: { name: string; hp: number; maxHp: number; hpFrac: number } | null) {
    if (!data) {
      this.bossBanner?.setVisible(false);
      return;
    }
    if (!this.bossBanner) this.buildBossBanner();
    this.bossBanner!.setVisible(true);
    this.bossNameText!.setText(data.name);
    this.bossHpText!.setText(`${data.hp} / ${data.maxHp}`);
    const maxBarW = 320;
    this.bossBarFill!.width = maxBarW * data.hpFrac;
  }

  private buildBossBanner() {
    const w = 360;
    const cx = GAME_WIDTH / 2;
    const y = 44;
    const c = this.add.container(cx, y).setDepth(60).setScrollFactor(0);
    const tray = this.add.rectangle(0, 0, w, 44, THEME.ink0, 0.9)
      .setStrokeStyle(1, THEME.brass1, 0.9);
    const inner = this.add.rectangle(0, 0, w - 4, 40).setStrokeStyle(1, THEME.brass0, 0.4).setFillStyle(0, 0);
    const name = this.add.text(0, -12, '', {
      fontSize: '13px', fontFamily: '"Cormorant Garamond", serif', color: TC.brass4,
      stroke: '#0d0b08', strokeThickness: 2,
    }).setOrigin(0.5);
    // HP bar
    const barBg = this.add.rectangle(0, 9, 320, 10, THEME.ink2, 1).setStrokeStyle(1, THEME.brass0, 0.8);
    const barFill = this.add.rectangle(-160, 9, 320, 8, 0xc64040, 1).setOrigin(0, 0.5);
    const hp = this.add.text(0, 9, '', {
      fontSize: '9px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1,
    }).setOrigin(0.5);
    c.add([tray, inner, name, barBg, barFill, hp]);
    c.setVisible(false);
    this.bossBanner = c;
    this.bossBarFill = barFill;
    this.bossNameText = name;
    this.bossHpText = hp;
  }

  // ── Menu buttons ─────────────────────────────────────

  private buildMenuButtons() {
    const labels = [t('menu.stats'), t('menu.inventory'), t('menu.quests'), t('menu.achieve'), t('menu.spells')];
    const icons  = ['✦', '⬡', '❖', '★', '⚡'];
    const btnSz = SKILL_SLOT_SIZE;
    const gap = SKILL_SLOT_GAP;

    // Skill bar geometry (must match buildSkillBar)
    const DIVIDER_GAP = 16;
    const totalBarW = SKILL_SLOTS_COUNT * SKILL_SLOT_SIZE + (SKILL_SLOTS_COUNT - 1) * SKILL_SLOT_GAP + DIVIDER_GAP;
    const trayPadX = 10;
    const trayW = totalBarW + trayPadX * 2;
    const barCx = GAME_WIDTH / 2;
    const barY = GAME_HEIGHT - SKILL_SLOT_SIZE / 2 - 10;
    const trayLeft = barCx - trayW / 2;
    const trayRight = barCx + trayW / 2;

    // Left group: Stats, Inventory, Quests (3 buttons)
    // Right group: Achievements, Spells (2 buttons)
    const leftCount = 3;
    const sideGap = 10;
    // Left buttons sit past the lock icon (22px wide at startX - 22, left of tray start).
    const leftAnchor = trayLeft - 22 - 14;

    for (let i = 0; i < labels.length; i++) {
      let x: number;
      if (i < leftCount) {
        x = leftAnchor - (leftCount - i - 1) * (btnSz + gap) - btnSz / 2;
      } else {
        const ri = i - leftCount;
        x = trayRight + sideGap + ri * (btnSz + gap) + btnSz / 2;
      }
      const y = barY;

      // Outer brass frame (matches skill slot styling)
      const bg = this.add.rectangle(x, y, btnSz, btnSz, THEME.ink0, 0.95)
        .setScrollFactor(0).setDepth(1000)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => { if (this.currentWindow !== this.menuBtnTypes[i]) bg.setFillStyle(THEME.ink3, 0.97); })
        .on('pointerout',  () => { if (this.currentWindow !== this.menuBtnTypes[i]) bg.setFillStyle(THEME.ink0, 0.95); })
        .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
          ptr.event.stopPropagation();
          this.toggleWindow(this.menuBtnTypes[i]);
        });

      // Brass frame (matches skill slots)
      this.add.rectangle(x, y, btnSz, btnSz)
        .setStrokeStyle(1, THEME.brass1, 0.9).setFillStyle(0, 0)
        .setScrollFactor(0).setDepth(1001);
      // Inner hairline (matches skill slots)
      this.add.rectangle(x, y, btnSz - 4, btnSz - 4)
        .setStrokeStyle(1, THEME.brass2, 0.18).setFillStyle(0, 0)
        .setScrollFactor(0).setDepth(1001);

      const icon = this.add.text(x, y - 6, icons[i], {
        fontSize: '22px', fontFamily: '"Cormorant Garamond", serif', color: TC.brass3, align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

      const txt = this.add.text(x, y + 14, labels[i], {
        fontSize: '8px', fontFamily: '"Special Elite", monospace', color: TC.text3, align: 'center',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);

      this.menuBtnBgs.push(bg);
      this.menuBtnIcons.push(icon);
      this.menuBtnTexts.push(txt);
    }
  }

  private buildFloatingWindow() {
    // Background — dark ink with brass border
    this.winBg = this.add.rectangle(0, WIN_TITLE_H, this.windowW, this.windowH, THEME.ink1, 0.96)
      .setOrigin(0, 0).setStrokeStyle(1, THEME.brass1, 0.9);

    // Title bar — slightly lighter with brass border
    this.winTitleBg = this.add.rectangle(0, 0, this.windowW, WIN_TITLE_H, THEME.ink2, 0.97)
      .setOrigin(0, 0).setStrokeStyle(1, THEME.brass1, 0.9);

    // Title text — brass accent
    this.windowTitleText = this.add.text(8, 4, '', {
      fontSize: '12px', fontFamily: '"Cormorant Garamond", serif', color: TC.brass3,
    }).setOrigin(0, 0);

    // Close button — brass styled
    this.winCloseBtn = this.add.text(this.windowW - 6, 4, '[×]', {
      fontSize: '10px', fontFamily: '"Cormorant Garamond", serif', color: TC.brass2,
    }).setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.winCloseBtn.setColor('#c86a6a'))
      .on('pointerout',  () => this.winCloseBtn.setColor(TC.brass2))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        this.closeWindow();
      });

    // Content text
    this.windowContentText = this.add.text(8, WIN_TITLE_H + 8, '', {
      fontSize: '11px', fontFamily: '"Inter", sans-serif', color: TC.text1, lineSpacing: 4,
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

    // DOM-based inventory takes over for type 'inventory'
    if (type === 'inventory') {
      this.windowContainer.setVisible(false);
      this.openInventoryDom();
      for (let i = 0; i < this.menuBtnTypes.length; i++) {
        const active = this.menuBtnTypes[i] === type;
        this.menuBtnBgs[i].setFillStyle(active ? THEME.ink3 : THEME.ink2, active ? 1.0 : 0.92);
        this.menuBtnIcons[i].setColor(active ? TC.brass4 : TC.brass3);
        this.menuBtnTexts[i].setColor(active ? TC.brass4 : TC.text3);
      }
      return;
    }

    // DOM-based spellbook
    if (type === 'spells') {
      this.windowContainer.setVisible(false);
      const learnedIds = new Set(this.cachedLearnedSpells.map(s => s.id));
      showSpellsWindowDom(ALL_KNOWN_SPELLS, learnedIds, () => this.closeWindow());
      for (let i = 0; i < this.menuBtnTypes.length; i++) {
        const active = this.menuBtnTypes[i] === type;
        this.menuBtnBgs[i].setFillStyle(active ? THEME.ink3 : THEME.ink2, active ? 1.0 : 0.92);
        this.menuBtnIcons[i].setColor(active ? TC.brass4 : TC.brass3);
        this.menuBtnTexts[i].setColor(active ? TC.brass4 : TC.text3);
      }
      return;
    }

    // DOM-based achievements
    if (type === 'achievements') {
      this.windowContainer.setVisible(false);
      const sphere = this.cachedUIData?.sphere;
      if (sphere) {
        showAchievementsWindowDom(sphere, () => this.closeWindow());
      }
      for (let i = 0; i < this.menuBtnTypes.length; i++) {
        const active = this.menuBtnTypes[i] === type;
        this.menuBtnBgs[i].setFillStyle(active ? THEME.ink3 : THEME.ink2, active ? 1.0 : 0.92);
        this.menuBtnIcons[i].setColor(active ? TC.brass4 : TC.brass3);
        this.menuBtnTexts[i].setColor(active ? TC.brass4 : TC.text3);
      }
      return;
    }

    if (type === 'vendor' || type === 'crafting') {
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
      this.menuBtnBgs[i].setFillStyle(active ? THEME.ink3 : THEME.ink2, active ? 1.0 : 0.92);
      this.menuBtnIcons[i].setColor(active ? TC.brass4 : TC.brass3);
      this.menuBtnTexts[i].setColor(active ? TC.brass4 : TC.text3);
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
        fontSize: '9px', fontFamily: '"Special Elite", monospace',
        color: isActive ? TC.brass4 : TC.text2,
        backgroundColor: isActive ? '#2a2218' : '#14110c',
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
        fontSize: '10px', fontFamily: '"Special Elite", monospace',
        color: affordable.length > 0 ? '#6d9a5a' : TC.text3,
        backgroundColor: '#1d1811', padding: { x: 6, y: 3 },
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
      if (this.currentWindow === 'inventory' && isInventoryDomOpen()) {
        this.refreshInventoryDom();
      } else {
        this.buildWindowContent(this.cachedUIData);
      }
    }
  }

  private closeWindow() {
    if (this.currentWindow === 'inventory' && isInventoryDomOpen()) {
      hideInventoryDom();
    }
    if (this.currentWindow === 'spells' && isSpellsWindowDomOpen()) {
      hideSpellsWindowDom();
    }
    if (this.currentWindow === 'achievements' && isAchievementsWindowDomOpen()) {
      hideAchievementsWindowDom();
    }
    this.currentWindow = null;
    this.windowContainer.setVisible(false);
    for (const btn of this.windowInteractables) btn.destroy();
    this.windowInteractables = [];
    this.destroyVendorButtons();
    for (let i = 0; i < this.menuBtnTypes.length; i++) {
      this.menuBtnBgs[i].setFillStyle(THEME.ink2, 0.92);
      this.menuBtnIcons[i].setColor(TC.brass3);
      this.menuBtnTexts[i].setColor(TC.text3);
    }
  }

  private openInventoryDom() {
    if (!this.cachedUIData) return;
    const { sphere, body } = this.cachedUIData;
    showInventoryDom({
      sphere,
      body: body ?? null,
      cb: {
        onEquip: (itemId, slot) => {
          const equip = sphere.equipment as any;
          // Remove from inventory, put back any existing in slot
          const invIdx = sphere.inventory.findIndex(i => i.itemId === itemId);
          if (invIdx < 0) return;
          const prev = equip[slot];
          equip[slot] = itemId;
          sphere.inventory.splice(invIdx, 1);
          if (prev) sphere.inventory.push({ itemId: prev, quantity: 1 });
          this.refreshInventoryDom();
        },
        onUnequip: (slot) => {
          const equip = sphere.equipment as any;
          const iid = equip[slot];
          if (!iid) return;
          equip[slot] = undefined;
          sphere.inventory.push({ itemId: iid, quantity: 1 });
          this.refreshInventoryDom();
        },
        onUseConsumable: (itemId) => {
          this.scene.get('GameScene').events.emit('use-item', itemId);
          this.refreshInventoryDom();
        },
        onSwitchWeapon: (idx) => {
          sphere.activeWeaponSlot = idx;
          this.refreshInventoryDom();
        },
        onClose: () => this.closeWindow(),
      },
    });
  }

  private refreshInventoryDom() {
    if (!this.cachedUIData) return;
    const { sphere, body } = this.cachedUIData;
    refreshInventoryDom({
      sphere,
      body: body ?? null,
      cb: {
        onEquip: (itemId, slot) => {
          const equip = sphere.equipment as any;
          const invIdx = sphere.inventory.findIndex(i => i.itemId === itemId);
          if (invIdx < 0) return;
          const prev = equip[slot];
          equip[slot] = itemId;
          sphere.inventory.splice(invIdx, 1);
          if (prev) sphere.inventory.push({ itemId: prev, quantity: 1 });
          this.refreshInventoryDom();
        },
        onUnequip: (slot) => {
          const equip = sphere.equipment as any;
          const iid = equip[slot];
          if (!iid) return;
          equip[slot] = undefined;
          sphere.inventory.push({ itemId: iid, quantity: 1 });
          this.refreshInventoryDom();
        },
        onUseConsumable: (itemId) => {
          this.scene.get('GameScene').events.emit('use-item', itemId);
          this.refreshInventoryDom();
        },
        onSwitchWeapon: (idx) => {
          sphere.activeWeaponSlot = idx;
          this.refreshInventoryDom();
        },
        onClose: () => this.closeWindow(),
      },
    });
  }

  private buildWindowContent(data: UIData) {
    if (!this.currentWindow) return;
    if (this.currentWindow === 'inventory') return; // handled by DOM overlay
    if (this.currentWindow === 'spells') return;    // handled by DOM overlay
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
          if (def.manaBonus) equipBonuses[StatName.Mana] = (equipBonuses[StatName.Mana] ?? 0) + def.manaBonus;
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
              { fontSize: '14px', color: isTracked ? TC.ether2 : TC.text3,
                padding: { x: 4, y: 2 } },
            ).setInteractive({ useHandCursor: true })
              .on('pointerover', () => btn.setColor(TC.ether3))
              .on('pointerout',  () => btn.setColor(isTracked ? TC.ether2 : TC.text3))
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
      case 'achievements':
        break;

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
              fontSize: '10px', fontFamily: '"Special Elite", monospace',
              color: canCraft ? '#6d9a5a' : TC.text3,
              backgroundColor: canCraft ? '#1d1811' : '#14110c',
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
