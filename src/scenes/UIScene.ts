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
import { ITEMS, RECIPES, VENDOR_MATERIALS, equipmentStatBonuses } from '../data/itemDB';
import { WEAPONS, getItemWeaponType, weaponDamageType } from '../data/weapons';
import { formatCurrency } from '../systems/currency';
import { AchievementDef } from '../data/achievementDB';
import { STATUS_DEFS } from '../types/statuses';
import { THEME, TC, drawCorner, drawBrassLineV } from '../ui/theme';
import { showEquipmentDom, hideEquipmentDom, refreshEquipmentDom, isEquipmentDomOpen } from '../ui/equipmentWindowDom';
import { showBagDom, hideBagDom, refreshBagDom, isBagDomOpen } from '../ui/bagWindowDom';
import { showSpellTooltip, moveSpellTooltip, hideSpellTooltip } from '../ui/spellTooltip';
import { showSpellsWindowDom, hideSpellsWindowDom, isSpellsWindowDomOpen } from '../ui/spellsWindowDom';
import { showQuestsDom, hideQuestsDom, isQuestsDomOpen } from '../ui/questsWindowDom';
import { spriteForSpell } from '../ui/weaponIcon';
import { spriteTextureKey } from '../systems/spriteSheetLoader';
import { showAchievementsWindowDom, hideAchievementsWindowDom, isAchievementsWindowDomOpen } from '../ui/achievementsWindowDom';
import { showBestiaryWindowDom, hideBestiaryWindowDom, isBestiaryWindowDomOpen, refreshBestiaryWindowDom } from '../ui/bestiaryWindowDom';
import { showVendorDom, hideVendorDom, isVendorDomOpen } from '../ui/vendorWindowDom';
import { showCraftingDom, hideCraftingDom, isCraftingDomOpen } from '../ui/craftingWindowDom';
import { syncPlayerStatusDom, clearPlayerStatusDom, StatusEntry } from '../ui/playerStatusDom';
import { ALL_KNOWN_SPELLS } from '../data/allSpells';

const UI_LAYOUT_KEY = 'essence_ui_layout_v1';
const WINDOW_LAYOUT_KEY = 'essence_window_layout_v1';
const HEADER_H = 20;
const WIN_W = 310;
const WIN_TITLE_H = 22;
const WIN_MIN_W = 220;
const WIN_MIN_H = 160;
/** Типы плавающего (Phaser) окна — остальные рендерятся через DOM. */
const FLOATING_TYPES: WindowType[] = ['stats', 'quests', 'vendor', 'crafting'];

type WindowType = 'stats' | 'equipment' | 'bag' | 'quests' | 'achievements' | 'vendor' | 'crafting' | 'spells' | 'bestiary';
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
  starterTarget: import('../types/bodies').BodyDefinition | null;
  quests: QuestProgress[];
  deathDebuff: number;
  activeEnchantId: string | null;
  inCombat: boolean;
  aoeCast: { elapsed: number; duration: number; name: string } | null;
  creatures: CreatureMapDot[];
  playerPos: { x: number; y: number } | null;
  mapDotNpcs: { x: number; y: number }[];
  mapDotNodes: { x: number; y: number; depleted: boolean }[];
  mapDotQuests?: { x: number; y: number }[];
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
  hidden?: boolean;
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
  // Player status pills are now rendered via DOM overlay (playerStatusDom.ts).
  private bodyInfoText!:Phaser.GameObjects.Text;
  private hintText!:    Phaser.GameObjects.Text;
  private logText!:     Phaser.GameObjects.Text;
  private captureBar!:  Phaser.GameObjects.Rectangle;
  private captureLabel!: Phaser.GameObjects.Text;

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
  private readonly menuBtnTypes: WindowType[] = ['stats', 'equipment', 'bag', 'quests', 'achievements', 'spells', 'bestiary'];

  // Weapon block (active equipped weapon: icon + damage)
  private weaponBlockBg?: Phaser.GameObjects.Rectangle;
  private weaponBlockIcon?: Phaser.GameObjects.Text;
  private weaponBlockDmg?: Phaser.GameObjects.Text;
  private weaponBlockTooltip?: Phaser.GameObjects.Container;

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
  private winResizeGrip!: Phaser.GameObjects.Rectangle;
  /** Сохранённые позиция/размер плавающего окна по типу (persist в localStorage). */
  private windowLayouts: Partial<Record<WindowType, { x: number; y: number; w: number; h: number }>> = {};
  private cachedUIData: UIData | null = null;
  /** Тип верстака для окна крафта */
  private craftingWorkbenchType: string = '';
  /** Vendor filter */
  private vendorFilter: string = 'all';
  private inventoryFilter: string = 'all';
  /** Сигнатура данных открытого окна — пересобираем содержимое только при её
   *  изменении, а не каждый кадр (иначе пересоздаём интерактивные GameObjects 60×/с). */
  private lastWindowSignature = '';
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
  private skillSlotsImage:     Phaser.GameObjects.Image[]     = [];
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

  // ── Maxi-map overlay ──────────────────────────────────
  private maximapOpen: boolean = false;
  private maximapContainer!: Phaser.GameObjects.Container;
  private maximapGfx!: Phaser.GameObjects.Graphics;
  private maximapTerrainImg: Phaser.GameObjects.Image | null = null;
  private lastUIData: UIData | null = null;

  constructor() { super({ key: 'UIScene' }); }

  create() {
    this.scene.bringToTop();
    // Load saved layout before creating anything
    this.loadUILayout();
    this.loadWindowLayouts();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      clearPlayerStatusDom();
    });

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
    this.captureLabel = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 26, 'Capturing...', {
      fontSize: '11px', fontFamily: '"Special Elite", monospace', color: TC.ether3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1001).setVisible(false);

    // Над барами HP/маны (они на GAME_HEIGHT - SKILL_SLOT_SIZE - 32), чтобы не перекрывать их.
    const castY = GAME_HEIGHT - SKILL_SLOT_SIZE - 32 - 42;
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
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: '#ffffff', lineSpacing: 3,
      stroke: '#000000', strokeThickness: 2,
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

    // ── Maxi-map overlay (hidden until M pressed) ─────────
    this.buildMaximap();

    // ── Panel headers (draggable) ──────────────────────────
    this.panelHeaders['body']    = this.makeHeader('body',    'Body');
    this.panelHeaders['target']  = this.makeHeader('target',  'Target');
    this.panelHeaders['log']     = this.makeHeader('log',     'Log');
    this.panelHeaders['minimap'] = this.makeMinimapHeader();

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
      this.buildMaximapTerrain(t);
    });

    // M — toggle maxi-map; ESC also closes it
    this.input.keyboard?.on('keydown-M',   () => this.toggleMaximap());
    this.input.keyboard?.on('keydown-ESC', () => { if (this.maximapOpen) this.toggleMaximap(); });

    // Window shortcuts: I=equipment, G=bag, L=quests, C=stats(char), K=spells, B=bestiary, J=achievements
    this.input.keyboard?.on('keydown-I', () => this.toggleWindow('equipment'));
    this.input.keyboard?.on('keydown-G', () => this.toggleWindow('bag'));
    this.input.keyboard?.on('keydown-L', () => this.toggleWindow('quests'));
    this.input.keyboard?.on('keydown-C', () => this.toggleWindow('stats'));
    this.input.keyboard?.on('keydown-K', () => this.toggleWindow('spells'));
    this.input.keyboard?.on('keydown-B', () => this.toggleWindow('bestiary'));
    this.input.keyboard?.on('keydown-J', () => this.toggleWindow('achievements'));
    // DOM windows close themselves on Escape (openWindowShell key handler).
    // Here we only need to close the Phaser stats window.
    this.input.keyboard?.on('keydown-ESC', () => { if (this.currentWindow === 'stats') this.closeSingleWindow('stats'); });
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
    gs.events.on('bestiary-revealed', (data: { id: string; reason: string; nameRu: string }) => {
      this.addLog(`✦ ${data.nameRu} → ${t('menu.bestiary')}`);
      if (isBestiaryWindowDomOpen()) refreshBestiaryWindowDom();
    });
    gs.events.on('show-dialog', (data: { speaker: string; text: string }[] | { messages: { speaker: string; text: string }[]; onEnd?: () => void }) => {
      if (Array.isArray(data)) {
        this.showDialog(data);
      } else {
        this.showDialog(data.messages, data.onEnd);
      }
    });
    gs.events.on('capture-available', (name: string) => this.addLog(`${name} ${t('log.capture_prompt')}`));
    gs.events.on('capture-start', (name: string) => this.addLog(`${t('log.capturing')} ${name}...`));
    gs.events.on('capture-interrupt', () => this.addLog('✖ Захват прерван (движение)'));
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
      // Independent window — does not close inventory/etc.
      this.openVendorDom();
    });
    gs.events.on('open-crafting', (workbenchType: string) => {
      this.craftingWorkbenchType = workbenchType;
      this.openCraftingDom(workbenchType);
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
        // Клик (а не перетаскивание) → сворачиваем. Считаем по дистанции
        // от нажатия, чтобы микро-сдвиг мыши не ломал тоггл.
        if (ptr.getDistance() < 6) {
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
    if (panelId === 'minimap') {
      // [0]=bg [1]=label [2]=arrow [3]=expand [4]=close
      (hdr.getAt(2) as Phaser.GameObjects.Text).setX(w - 36);
      (hdr.getAt(3) as Phaser.GameObjects.Text).setX(w - 22);
      (hdr.getAt(4) as Phaser.GameObjects.Text).setX(w - 8);
    } else {
      (hdr.getAt(2) as Phaser.GameObjects.Text).setX(w - 5);   // arrow
      (hdr.getAt(3) as Phaser.GameObjects.Text).setX(w / 2);   // grip dots
    }
    hdr.setSize(w, HEADER_H);
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

  // ── Floating window layout persistence (per type) ─────

  private loadWindowLayouts() {
    try {
      const raw = localStorage.getItem(WINDOW_LAYOUT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Record<string, { x: number; y: number; w: number; h: number }>;
      for (const [k, v] of Object.entries(saved)) {
        if (!FLOATING_TYPES.includes(k as WindowType)) continue;
        this.windowLayouts[k as WindowType] = {
          x: Math.max(0, Math.min(GAME_WIDTH  - 40, v.x ?? 0)),
          y: Math.max(0, Math.min(GAME_HEIGHT - 40, v.y ?? 0)),
          w: Math.max(WIN_MIN_W, v.w ?? WIN_MIN_W),
          h: Math.max(WIN_MIN_H, v.h ?? WIN_MIN_H),
        };
      }
    } catch { /* corrupt save */ }
  }

  /** Persist current window's position+size under its type. */
  private saveWindowLayout(type: WindowType | null) {
    if (!type || !FLOATING_TYPES.includes(type)) return;
    this.windowLayouts[type] = {
      x: this.windowX, y: this.windowY, w: this.windowW, h: this.windowH,
    };
    try {
      localStorage.setItem(WINDOW_LAYOUT_KEY, JSON.stringify(this.windowLayouts));
    } catch { /* localStorage unavailable */ }
  }

  /** Position the resize grip at the window's bottom-right corner. */
  private positionWindowGrip() {
    if (!this.winResizeGrip) return;
    this.winResizeGrip.setPosition(
      this.windowX + this.windowW - 6,
      this.windowY + WIN_TITLE_H + this.windowH - 6,
    );
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

    this.lastUIData = data;
    this.cachedUIData = data;
    this.cachedLearnedSpells = sphere.learnedSpells;
    this.cachedInCombat = data.inCombat ?? false;
    this.cachedBody = body;
    if (this.cachedInCombat && this.spellPickerSlot >= 0) this.closeSpellPicker();

    this.updateSealIndicator(sphere);
    this.updateWeaponBlock(data);

    // ── Tracked quest HUD (right side) ─────────────────────
    {
      const tracked = data.trackedQuestIds ?? [];
      const activeQuests = data.quests.filter(q => !q.completed);
      // На HUD — только ОТМЕЧЕННЫЕ квесты (чекбокс в окне квестов рулит видимостью).
      const trackedQuests = activeQuests.filter(q => tracked.includes(q.def.id));

      const lines: string[] = [];

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
          if ((obj.type === 'survive' || obj.type === 'protect') && !isDone) {
            const secs = Math.ceil(obj.type === 'protect' ? bq.protectTimers[i] : bq.surviveTimers[i]);
            // protect only shows timer after reach is done
            const reachDone = obj.type !== 'protect' || bq.def.objectives.some(
              (o, j) => o.type === 'reach' && o.targetId === obj.targetId && bq.counts[j] >= o.count,
            );
            lines.push(`  ${reachDone ? `${secs}s` : '–'} ${obj.description}`);
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

    // ── Refresh open window (только при изменении данных, не каждый кадр) ──
    if (this.currentWindow) {
      const sig = this.windowSignature(data);
      if (sig !== this.lastWindowSignature) {
        this.lastWindowSignature = sig;
        this.buildWindowContent(data);
      }
    }

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
      this.captureLabel.setVisible(true);
      this.captureBar.width = 140 * p;
    } else {
      this.captureBarBg.setVisible(false);
      this.captureBar.setVisible(false);
      this.captureLabel.setVisible(false);
    }

    // ── Skill bar ─────────────────────────────────────────
    this.updateSkillBar(body, data.activeEnchantId);
    this.updatePlayerStatusBar(body, data.deathDebuff ?? 0);

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
          // Гуманоид — реальное оружие; зверь/элементаль — природная атака
          // (Когти/Стихия), без понятия «оружие», чтобы не путать.
          const weaponLine = body.definition.canUseAllSpells
            ? `${t('body.weapon')}: ${body.weapon.nameRu}  ${t('body.cd')}: ${body.weapon.cooldown}s`
            : `${this.naturalAttackName(body)}  ${t('body.cd')}: ${body.weapon.cooldown}s`;
          this.bodyInfoText.setFixedSize(s.w, 0)
            .setPosition(s.x, s.y + HEADER_H).setText(
              `── ${body.definition.nameRu} ──\n` + weaponLine
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
      const starterDef = data.starterTarget;
      const hasCreatureTarget = !!(tgt && !tgt.isDead);
      const hasTarget = hasCreatureTarget || !!starterDef;
      this.panelHeaders['target'].setVisible(hasTarget).setPosition(s.x, s.y);
      this.grips['target'].setVisible(hasTarget);

      if (hasTarget) {
        const def = hasCreatureTarget ? tgt!.definition : starterDef!;
        if (hasCreatureTarget) {
          const hpPct = Math.round((tgt!.currentHP / tgt!.maxHP) * 100);
          this.setHeaderLabel('target', `${def.nameRu}  ${hpPct}%`);
        } else {
          this.setHeaderLabel('target', def.nameRu);
        }

        if (!s.collapsed) {
          const dmgLabel = def.damageType === 'magic'  ? '✦ Magic'
                         : def.damageType === 'ranged' ? '➶ Ranged' : '⚔ Melee';
          const tLines: string[] = [];
          if (hasCreatureTarget) {
            tLines.push(`${dmgLabel}  HP: ${Math.round(tgt!.currentHP)}/${tgt!.maxHP}`);
          } else {
            tLines.push(`${dmgLabel}`);
          }
          const stats = def.npcStats ?? {};
          if (Object.keys(stats).length > 0) {
            tLines.push('', 'Stats:');
            for (const [stat, val] of Object.entries(stats)) {
              if ((val ?? 0) > 0) tLines.push(`  ${STAT_NAMES_SHORT[stat as StatName]}: ${val}`);
            }
          }
          tLines.push('', 'Caps:');
          for (const [stat, cap] of Object.entries(def.caps)) {
            tLines.push(`  ${STAT_NAMES_SHORT[stat as StatName]} → ${cap}`);
          }
          if (def.abilityName) {
            tLines.push(``, `Ability: ${def.abilityName}`);
          }
          if (def.signatureSpell) {
            tLines.push(`✦ ${def.signatureSpell.nameRu}  (via Quest)`);
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

    // ── Mini-map / Maxi-map ────────────────────────────────
    this.drawMinimap(data);
    if (this.maximapOpen) this.drawMaximap(data);
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

  // ── Maxi-map ─────────────────────────────────────────────

  private buildMaximap() {
    const PAD = 60;
    const mmW = GAME_WIDTH  - PAD * 2;
    const mmH = GAME_HEIGHT - PAD * 2;

    const backdrop = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72)
      .setOrigin(0).setScrollFactor(0).setDepth(1400);
    const border = this.add.rectangle(PAD, PAD, mmW, mmH, THEME.ink1, 0.95)
      .setOrigin(0).setScrollFactor(0).setDepth(1401)
      .setStrokeStyle(2, THEME.brass1, 0.9);

    const title = this.add.text(PAD + 12, PAD + 8, 'MAP  [M] — close', {
      fontSize: '11px', fontFamily: '"Special Elite", monospace', color: TC.brass3,
    }).setScrollFactor(0).setDepth(1403).setOrigin(0);

    const closeBtn = this.add.text(PAD + mmW - 8, PAD + 8, '×', {
      fontSize: '14px', fontFamily: 'monospace', color: TC.text3,
    }).setScrollFactor(0).setDepth(1403).setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => closeBtn.setColor(TC.brass4))
      .on('pointerout',  () => closeBtn.setColor(TC.text3))
      .on('pointerdown', () => this.toggleMaximap());

    this.maximapGfx = this.add.graphics().setScrollFactor(0).setDepth(1402);

    this.maximapContainer = this.add.container(0, 0, [backdrop, border, title, closeBtn])
      .setScrollFactor(0).setDepth(1400).setVisible(false);

    // Close on backdrop click (outside the map area)
    backdrop.setInteractive()
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        const inside = ptr.x >= PAD && ptr.x <= PAD + mmW && ptr.y >= PAD && ptr.y <= PAD + mmH;
        if (!inside) this.toggleMaximap();
      });
  }

  private buildMaximapTerrain(t: { w: number; h: number; colors: number[] }) {
    if (this.maximapTerrainImg) this.maximapTerrainImg.destroy();
    const key = '__maximap_terrain__';
    // Reuse the same canvas data as minimap — already built in buildMinimapTexture
    if (this.textures.exists('__minimap_terrain__')) {
      // Clone key by sharing the same canvas texture
      if (this.textures.exists(key)) this.textures.remove(key);
      const canvas = document.createElement('canvas');
      canvas.width = t.w; canvas.height = t.h;
      const ctx = canvas.getContext('2d')!;
      const imgData = ctx.createImageData(t.w, t.h);
      for (let i = 0; i < t.colors.length; i++) {
        const c = t.colors[i];
        imgData.data[i * 4]     = (c >> 16) & 0xff;
        imgData.data[i * 4 + 1] = (c >> 8)  & 0xff;
        imgData.data[i * 4 + 2] = c & 0xff;
        imgData.data[i * 4 + 3] = 220;
      }
      ctx.putImageData(imgData, 0, 0);
      this.textures.addCanvas(key, canvas);
    }
    this.maximapTerrainImg = this.add.image(0, 0, key).setOrigin(0).setScrollFactor(0).setDepth(1402).setVisible(false);
  }

  private toggleMaximap() {
    this.maximapOpen = !this.maximapOpen;
    this.maximapContainer.setVisible(this.maximapOpen);
    this.maximapGfx.setVisible(this.maximapOpen);
    if (this.maximapTerrainImg) this.maximapTerrainImg.setVisible(this.maximapOpen);
    if (this.maximapOpen && this.lastUIData) this.drawMaximap(this.lastUIData);
  }

  private drawMaximap(data: UIData) {
    if (!this.maximapOpen) return;
    const PAD = 60;
    const HEADER = 30;
    const areaX = PAD;
    const areaY = PAD + HEADER;
    const areaW = GAME_WIDTH  - PAD * 2;
    const areaH = GAME_HEIGHT - PAD * 2 - HEADER;

    // Сохраняем аспект карты — letterbox внутри доступной области
    const mapAspect  = this.minimapMapW / this.minimapMapH;
    const areaAspect = areaW / areaH;
    let w: number, h: number;
    if (mapAspect > areaAspect) { w = areaW;            h = areaW / mapAspect; }
    else                        { h = areaH;            w = areaH * mapAspect; }
    const ox = areaX + (areaW - w) / 2;
    const oy = areaY + (areaH - h) / 2;

    if (this.maximapTerrainImg) {
      this.maximapTerrainImg.setPosition(ox, oy).setDisplaySize(w, h).setVisible(true);
    }

    this.maximapGfx.clear();
    // Рамка вокруг карты, чтобы было видно где её края
    this.maximapGfx.lineStyle(1, THEME.brass1, 0.5);
    this.maximapGfx.strokeRect(ox, oy, w, h);
    this.drawMapDots(this.maximapGfx, data, ox, oy, w, h, 4, 3);
  }

  // ── Minimap header with close + expand buttons ────────

  private makeMinimapHeader(): Phaser.GameObjects.Container {
    const state = this.panelStates.minimap;
    let dragMoved = false;

    const bg = this.add.rectangle(0, 0, state.w, HEADER_H, THEME.ink2, 0.95)
      .setOrigin(0, 0).setStrokeStyle(1, THEME.brass1, 0.85);
    const label = this.add.text(7, 3, 'Map', {
      fontSize: '10px', fontFamily: '"Special Elite", monospace', color: TC.brass3,
    }).setOrigin(0, 0);
    const arrow = this.add.text(state.w - 36, 3, '▼', {
      fontSize: '9px', color: TC.text3,
    }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
    const expandBtn = this.add.text(state.w - 22, 3, '⛶', {
      fontSize: '9px', color: TC.text3,
    }).setOrigin(0, 0).setInteractive({ useHandCursor: true })
      .on('pointerover', () => expandBtn.setColor(TC.brass4))
      .on('pointerout',  () => expandBtn.setColor(TC.text3))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => { ptr.event.stopPropagation(); this.toggleMaximap(); });
    const closeBtn = this.add.text(state.w - 8, 3, '×', {
      fontSize: '11px', color: TC.text3,
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
      .on('pointerover', () => closeBtn.setColor('#ff6666'))
      .on('pointerout',  () => closeBtn.setColor(TC.text3))
      .on('pointerdown', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        state.hidden = true;
        this.saveUILayout();
      });

    const container = this.add.container(state.x, state.y, [bg, label, arrow, expandBtn, closeBtn])
      .setScrollFactor(0).setDepth(1010)
      .setSize(state.w, HEADER_H)
      .setInteractive(new Phaser.Geom.Rectangle(0, 0, state.w, HEADER_H), Phaser.Geom.Rectangle.Contains)
      .on('pointerover', () => { (bg as Phaser.GameObjects.Rectangle).setFillStyle(THEME.ink3, 0.98); this.input.setDefaultCursor('grab'); })
      .on('pointerout',  () => { (bg as Phaser.GameObjects.Rectangle).setFillStyle(THEME.ink2, 0.95); this.input.setDefaultCursor('default'); })
      .on('dragstart', () => { dragMoved = false; })
      .on('drag', (_ptr: Phaser.Input.Pointer, dx: number, dy: number) => {
        dragMoved = true;
        state.x = Math.max(0, Math.min(GAME_WIDTH  - state.w, dx));
        state.y = Math.max(0, Math.min(GAME_HEIGHT - HEADER_H, dy));
        container.setPosition(state.x, state.y);
        this.input.setDefaultCursor('grabbing');
      })
      .on('dragend', () => { if (dragMoved) this.saveUILayout(); this.input.setDefaultCursor('default'); })
      .on('pointerup', (ptr: Phaser.Input.Pointer) => {
        ptr.event.stopPropagation();
        // Клик (а не перетаскивание) → сворачиваем. Считаем по дистанции
        // от нажатия, чтобы микро-сдвиг мыши не ломал тоггл.
        if (ptr.getDistance() < 6) {
          state.collapsed = !state.collapsed;
          (arrow as Phaser.GameObjects.Text).setText(state.collapsed ? '▶' : '▼');
          this.saveUILayout();
        }
        dragMoved = false;
      });

    this.input.setDraggable(container);
    return container;
  }

  private drawMinimap(data: UIData) {
    const s = this.panelStates.minimap;
    const hidden = s.hidden || this.maximapOpen;

    this.panelHeaders['minimap'].setVisible(!hidden).setPosition(s.x, s.y);
    this.minimapGfx.clear();

    if (hidden) {
      this.minimapBorder.setVisible(false);
      if (this.minimapTerrainImg) this.minimapTerrainImg.setVisible(false);
      this.grips['minimap']?.setVisible(false);
      return;
    }

    this.setHeaderLabel('minimap', 'Map');

    const collapsed = s.collapsed;
    const mapTop = s.y + HEADER_H;
    this.minimapBorder.setPosition(s.x, mapTop).setSize(s.w, s.h).setVisible(!collapsed);

    if (this.minimapTerrainImg) {
      this.minimapTerrainImg.setVisible(!collapsed);
      if (!collapsed) {
        this.minimapTerrainImg.setPosition(s.x, mapTop).setDisplaySize(s.w, s.h);
      }
    }

    if (!collapsed) {
      this.drawMapDots(this.minimapGfx, data, s.x, mapTop, s.w, s.h, 2, 1.5);
      this.positionGrip('minimap', mapTop + s.h);
    } else {
      this.positionGrip('minimap', s.y + HEADER_H);
    }
    this.grips['minimap']?.setVisible(!collapsed);
  }

  /** Draws creature/NPC/node/player dots onto a graphics object scaled to given rect. */
  private drawMapDots(
    g: Phaser.GameObjects.Graphics,
    data: UIData,
    ox: number, oy: number, w: number, h: number,
    dotSize: number, playerSize: number,
  ) {
    const mapW = this.minimapMapW;
    const mapH = this.minimapMapH;
    const sx = w / mapW;
    const sy = h / mapH;

    // Точки в границах карты: проецируем мир в [ox..ox+w] × [oy..oy+h] и пропускаем то, что вышло
    const inBounds = (wx: number, wy: number) => wx >= 0 && wx <= mapW && wy >= 0 && wy <= mapH;
    const drawDot = (wx: number, wy: number, size: number) => {
      const px = ox + wx * sx;
      const py = oy + wy * sy;
      const half = size * 0.5;
      // Клампим в области карты, чтобы маркер не выходил за рамку
      const dx = Math.min(Math.max(px, ox + half), ox + w - half);
      const dy = Math.min(Math.max(py, oy + half), oy + h - half);
      g.fillRect(dx - half, dy - half, size, size);
    };

    for (const n of data.mapDotNodes ?? []) {
      if (!inBounds(n.x, n.y)) continue;
      g.fillStyle(n.depleted ? 0x336633 : 0x44bb44, n.depleted ? 0.4 : 0.8);
      drawDot(n.x, n.y, dotSize);
    }

    for (const n of data.mapDotNpcs ?? []) {
      if (!inBounds(n.x, n.y)) continue;
      g.fillStyle(0xffdd55, 0.9);
      drawDot(n.x, n.y, dotSize);
    }

    // Цели квестов — крупнее и ярче (зелёный, как вейпоинт)
    for (const q of data.mapDotQuests ?? []) {
      if (!inBounds(q.x, q.y)) continue;
      g.fillStyle(0x55ff66, 1);
      drawDot(q.x, q.y, dotSize + 1.5);
    }

    for (const c of data.creatures) {
      if (c.isDead) continue;
      if (!inBounds(c.x, c.y)) continue;
      g.fillStyle(
        c.isPassive ? 0x888888 : c.isAggro ? 0xff3333 : 0xcc4444,
        c.isPassive ? 0.7 : c.isAggro ? 1.0 : 0.65,
      );
      drawDot(c.x, c.y, dotSize);
    }

    if (data.playerPos && inBounds(data.playerPos.x, data.playerPos.y)) {
      const ps = playerSize + 0.5;
      const px = Math.min(Math.max(ox + data.playerPos.x * sx, ox + ps), ox + w - ps);
      const py = Math.min(Math.max(oy + data.playerPos.y * sy, oy + ps), oy + h - ps);
      g.fillStyle(THEME.ether2, 1.0);
      g.fillRect(px - ps, py - ps, ps * 2, ps * 2);
      g.lineStyle(1, THEME.ether3, 0.6);
      g.strokeRect(px - ps - 1, py - ps - 1, ps * 2 + 2, ps * 2 + 2);
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

      // SVG sprite icon (hidden until ability with sprite is assigned)
      const img = this.add.image(x, y, '__DEFAULT')
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(1002)
        .setDisplaySize(SKILL_SLOT_SIZE - 8, SKILL_SLOT_SIZE - 8)
        .setVisible(false);
      this.skillSlotsImage.push(img);

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
          // Зверь/элементаль: оружейные слоты 0-4 (Когти + родной скил) не
          // редактируются — только каст. Редактируются лишь нейтральные 5-7.
          const beastWeaponSlot = !this.cachedBody?.definition.canUseAllSpells && i < 5;
          if (i === 0 || this.skillBarLocked || beastWeaponSlot) {
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
    // Use body.weapon getter (follows active equipped slot), not raw definition.weapon —
    // so Tab swap actually changes which weapon-bound spells are pickable.
    const bodyWeapon = this.cachedBody?.weapon.type ?? null;
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
      this.spellPickerContainer.add(ibg);

      const sprite = spriteForSpell(spell.id);
      const tex = sprite ? spriteTextureKey(sprite.id) : null;
      if (tex && this.textures.exists(tex)) {
        const iimg = this.add.image(ix, iy, tex)
          .setOrigin(0.5).setDisplaySize(sz - 6, sz - 6);
        this.spellPickerContainer.add(iimg);
      } else {
        const itxt = this.add.text(ix, iy - 2, spell.nameRu.slice(0, 7), {
          fontSize: '8px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1, align: 'center',
        }).setOrigin(0.5);
        this.spellPickerContainer.add(itxt);
      }
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

  // ── Панель статусов игрока (DOM-оверлей сверху экрана) ──

  private updatePlayerStatusBar(body: Body | null, deathDebuff = 0) {
    if (!body) {
      clearPlayerStatusDom();
      return;
    }

    const entries: StatusEntry[] = [];
    // Слабость после смерти тела — показываем значок с таймером сверху.
    if (deathDebuff > 0) {
      entries.push({ id: 'death_weakness', stacks: 1, timer: deathDebuff });
    }
    for (const [, s] of body.statusEffects) {
      entries.push({ id: s.id, stacks: s.stacks, timer: s.timer });
    }
    if (body.enchantRegenPenalty > 0) {
      entries.push({ id: 'enchant', stacks: 1, timer: -1 });
    }
    syncPlayerStatusDom(entries);
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

      // Icon: prefer SVG sprite (Image), fall back to text label
      const img = this.skillSlotsImage[i];
      const txt = this.skillSlotsIcon[i];
      if (i === 0 && body) {
        img.setVisible(false);
        txt.setText('⚔').setColor(TC.brass3).setFontSize('18px');
      } else if (ability) {
        const sprite = spriteForSpell(ability.id);
        const key = sprite ? spriteTextureKey(sprite.id) : null;
        if (key && this.textures.exists(key)) {
          img.setTexture(key).setDisplaySize(SKILL_SLOT_SIZE - 8, SKILL_SLOT_SIZE - 8).setVisible(true);
          txt.setText('');
        } else {
          img.setVisible(false);
          txt.setText(ability.nameRu.slice(0, 6)).setColor(TC.ether3).setFontSize('10px');
        }
      } else {
        img.setVisible(false);
        txt.setText('');
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

  // ── Weapon block ─────────────────────────────────────

  private buildWeaponBlock(x: number, y: number, btnSz: number) {
    // Outer ink frame (matches skill slot styling)
    this.weaponBlockBg = this.add.rectangle(x, y, btnSz, btnSz, THEME.ink0, 0.95)
      .setScrollFactor(0).setDepth(1000)
      .setInteractive({ useHandCursor: false })
      .on('pointerover', () => this.showWeaponTooltip(x, y))
      .on('pointerout',  () => this.hideWeaponTooltip());
    // Brass frame
    this.add.rectangle(x, y, btnSz, btnSz)
      .setStrokeStyle(1, THEME.brass1, 0.9).setFillStyle(0, 0)
      .setScrollFactor(0).setDepth(1001);
    this.add.rectangle(x, y, btnSz - 4, btnSz - 4)
      .setStrokeStyle(1, THEME.brass2, 0.18).setFillStyle(0, 0)
      .setScrollFactor(0).setDepth(1001);
    // Weapon icon
    this.weaponBlockIcon = this.add.text(x, y - 4, '—', {
      fontSize: '22px', fontFamily: '"Cormorant Garamond", serif', color: TC.brass3, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
    // Damage label below
    this.weaponBlockDmg = this.add.text(x, y + 16, '', {
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1002);
  }

  private showWeaponTooltip(x: number, y: number) {
    const data = this.lastUIData;
    if (!data?.body || !data?.sphere) return;
    const eq = data.sphere.equipment;
    // Когти (зверь/элементаль ИЛИ безоружный гуманоид) → природная атака,
    // иначе надетое оружие. wt всегда из body.weapon (для безоружного — Fists).
    const innate = data.body.usesInnateAttack;
    const activeId = data.sphere.activeWeaponSlot === 0 ? eq.weapon : eq.weapon2;
    const item = innate ? undefined : ITEMS[activeId ?? ''];
    const wt = data.body.weapon.type;
    const weapon = WEAPONS[wt];
    const atk = this.weaponAttackStat(wt, data.sphere, innate);
    const dmg = Math.round(weapon.baseDamage * (1 + atk.value / 100));
    const inactiveId = innate ? undefined : (data.sphere.activeWeaponSlot === 0 ? eq.weapon2 : eq.weapon);
    const lines = [
      item ? item.nameRu : `${data.body.definition.nameRu} — ${this.naturalAttackName(data.body)}`,
      `Base: ${weapon.baseDamage} • Range: ${weapon.range} • CD: ${weapon.cooldown}s`,
      `Damage (${atk.label} ${atk.value}): ${dmg}`,
      // Эффект оружия показываем только гуманоидам: у зверей «оружие» — заглушка
      // (заяц не машет ядовитым кинжалом), и базовая атака эффект не накладывает.
      (!innate && weapon.weaponEffect) ? `Effect: ${weapon.weaponEffect} ${Math.round((weapon.weaponEffectChance ?? 0) * 100)}%` : '',
      inactiveId ? `[Tab] swap → ${ITEMS[inactiveId]?.nameRu ?? inactiveId}` : '',
    ].filter(Boolean);
    this.hideWeaponTooltip();
    const c = this.add.container(x, y - 60).setScrollFactor(0).setDepth(1100);
    const txt = this.add.text(0, 0, lines.join('\n'), {
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.text1,
      backgroundColor: '#0d0b08', padding: { x: 6, y: 4 }, align: 'left',
    }).setOrigin(0.5, 1);
    c.add([txt]);
    this.weaponBlockTooltip = c;
  }

  private hideWeaponTooltip() {
    this.weaponBlockTooltip?.destroy();
    this.weaponBlockTooltip = undefined;
  }

  private updateWeaponBlock(data: UIData) {
    if (!this.weaponBlockIcon || !this.weaponBlockDmg) return;
    if (!data.body) {
      this.weaponBlockIcon.setText('—');
      this.weaponBlockDmg.setText('');
      return;
    }
    // Когти (зверь/элементаль ИЛИ безоружный гуманоид) → 🐾; иначе иконка оружия.
    const innate = data.body.usesInnateAttack;
    const eq = data.sphere.equipment;
    const activeId = data.sphere.activeWeaponSlot === 0 ? eq.weapon : eq.weapon2;
    const item = innate ? undefined : ITEMS[activeId ?? ''];
    const wt = data.body.weapon.type;
    const weapon = WEAPONS[wt];
    const atk = this.weaponAttackStat(wt, data.sphere, innate);
    const dmg = Math.round(weapon.baseDamage * (1 + atk.value / 100));
    this.weaponBlockIcon.setText(item?.icon ?? '🐾');
    this.weaponBlockDmg.setText(String(dmg));
  }

  /** Имя природной атаки тела (зверь → Когти, элементаль → Стихия). */
  private naturalAttackName(body: NonNullable<UIData['body']>): string {
    return weaponDamageType(body.weapon.type) === 'magic' ? t('body.element') : t('body.claws');
  }

  /** Атакующий стат оружия (STR/AGI/INT) + его эффективное значение (база + активная экипировка).
   *  Для зверей/элементалей (isNatural) атака идёт от НАИБОЛЬШЕГО боевого стата. */
  private weaponAttackStat(
    wt: import('../types/bodies').WeaponType,
    sphere: UIData['sphere'],
    isNatural = false,
  ): { label: string; stat: StatName; value: number } {
    const bonuses = equipmentStatBonuses(
      (sphere.equipment ?? {}) as Record<string, string | undefined>,
      sphere.activeWeaponSlot ?? 0,
    );
    const eff = (st: StatName) => (sphere.stats?.[st] ?? 0) + (bonuses[st] ?? 0);

    if (isNatural) {
      // Тело зверя/элементаля: урон от максимума Сила/Ловкость/Интеллект.
      const trio: [StatName, string][] = [
        [StatName.Strength, 'STR'], [StatName.Agility, 'AGI'], [StatName.Intellect, 'INT'],
      ];
      let best = trio[0]; let bestVal = eff(trio[0][0]);
      for (const pair of trio) {
        const v = eff(pair[0]);
        if (v > bestVal) { bestVal = v; best = pair; }
      }
      return { label: best[1], stat: best[0], value: bestVal };
    }

    // Гуманоид: стат совпадает с типом урона оружия.
    const dmgType = weaponDamageType(wt);
    const stat = dmgType === 'magic' ? StatName.Intellect
      : dmgType === 'ranged' ? StatName.Agility
      : StatName.Strength;
    const label = stat === StatName.Intellect ? 'INT' : stat === StatName.Agility ? 'AGI' : 'STR';
    return { label, stat, value: eff(stat) };
  }

  // ── Menu buttons ─────────────────────────────────────

  private buildMenuButtons() {
    const labels = [t('menu.stats'), t('menu.equipment'), t('menu.bag'), t('menu.quests'), t('menu.achieve'), t('menu.spells'), t('menu.bestiary')];
    const icons  = ['✦', '⬡', '🎒', '❖', '★', '⚡', '⌬'];
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

    // Left group: Stats, Equipment, Bag, Quests (4 buttons), weapon block, then tray.
    // Right group: Achievements, Spells, Bestiary (3 buttons)
    const leftCount = 4;
    const sideGap = 10;
    // Weapon block sits just to the left of the lock icon.
    const weaponBlockX = trayLeft - 22 - btnSz / 2;
    this.buildWeaponBlock(weaponBlockX, barY, btnSz);
    // Left buttons go further left, past the weapon block.
    const leftAnchor = weaponBlockX - btnSz / 2 - gap - btnSz / 2;

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
        .on('pointerover', () => { if (!this.isWindowOpen(this.menuBtnTypes[i])) bg.setFillStyle(THEME.ink3, 0.97); })
        .on('pointerout',  () => { if (!this.isWindowOpen(this.menuBtnTypes[i])) bg.setFillStyle(THEME.ink0, 0.95); })
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
        this.positionWindowGrip();
      })
      .on('dragend', () => this.saveWindowLayout(this.currentWindow));
    this.input.setDraggable(this.winTitleBg);

    // Resize grip (bottom-right corner) — scene-level so it sits above the
    // container; repositioned on move/resize. Hidden until a window is shown.
    this.winResizeGrip = this.add.rectangle(0, 0, 12, 12, THEME.brass0, 0.75)
      .setScrollFactor(0).setDepth(1019).setVisible(false)
      .setStrokeStyle(1, THEME.brass2, 0.6)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => { this.winResizeGrip.setFillStyle(THEME.brass1, 0.9); this.input.setDefaultCursor('se-resize'); })
      .on('pointerout',  () => { this.winResizeGrip.setFillStyle(THEME.brass0, 0.75); this.input.setDefaultCursor('default'); })
      .on('drag', (ptr: Phaser.Input.Pointer) => {
        const w = Math.max(WIN_MIN_W, Math.min(GAME_WIDTH - this.windowX, Math.round(ptr.x - this.windowX)));
        const h = Math.max(WIN_MIN_H, Math.min(GAME_HEIGHT - this.windowY - WIN_TITLE_H, Math.round(ptr.y - this.windowY - WIN_TITLE_H)));
        this.resizeWindow(w, h);
        this._contentScrollY = 0;
        this.windowContentText.setY(WIN_TITLE_H + 8);
        if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
      })
      .on('dragend', () => { this.saveWindowLayout(this.currentWindow); this.input.setDefaultCursor('default'); });
    this.input.setDraggable(this.winResizeGrip);

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
    this.positionWindowGrip();
  }

  private updateContentMask() {
    if (this._contentMaskGfx) {
      this._contentMaskGfx.clear();
      this._contentMaskGfx.fillRect(this.windowX, this.windowY + WIN_TITLE_H, this.windowW, this.windowH);
    }
  }

  /** Is the given window type currently open? (each window independent) */
  private isWindowOpen(type: WindowType): boolean {
    switch (type) {
      case 'equipment':    return isEquipmentDomOpen();
      case 'bag':          return isBagDomOpen();
      case 'spells':       return isSpellsWindowDomOpen();
      case 'quests':       return isQuestsDomOpen();
      case 'achievements': return isAchievementsWindowDomOpen();
      case 'bestiary':     return isBestiaryWindowDomOpen();
      case 'vendor':       return isVendorDomOpen();
      case 'crafting':     return isCraftingDomOpen();
      case 'stats':        return this.currentWindow === 'stats';
    }
  }

  /**
   * Toggle a single window independently — opening one does NOT close any other.
   * Each window's button highlight reflects only its own open state.
   */
  private toggleWindow(type: WindowType) {
    if (this.isWindowOpen(type)) {
      this.closeSingleWindow(type);
      return;
    }
    this.openSingleWindow(type);
  }

  /** Open exactly one window without touching the others. */
  private openSingleWindow(type: WindowType) {
    switch (type) {
      case 'equipment':
        this.openEquipmentDom();
        break;
      case 'bag':
        this.openBagDom();
        break;
      case 'spells': {
        const learnedIds = new Set(this.cachedLearnedSpells.map(s => s.id));
        showSpellsWindowDom(ALL_KNOWN_SPELLS, learnedIds, () => this.closeSingleWindow('spells'));
        break;
      }
      case 'quests':
        this.openQuestsDom();
        break;
      case 'achievements': {
        const sphere = this.cachedUIData?.sphere;
        if (sphere) showAchievementsWindowDom(sphere, () => this.closeSingleWindow('achievements'));
        break;
      }
      case 'bestiary':
        showBestiaryWindowDom(() => this.closeSingleWindow('bestiary'));
        break;
      case 'vendor':
        this.openVendorDom();
        break;
      case 'crafting':
        this.openCraftingDom(this.craftingWorkbenchType);
        break;
      case 'stats':
        this.openStatsWindow();
        break;
    }
    this.refreshMenuHighlight(type);
  }

  /** Open the Phaser-rendered floating stats window. */
  private openStatsWindow() {
    this.currentWindow = 'stats';
    this._contentScrollY = 0;
    this.windowContentText.setY(WIN_TITLE_H + 8);

    const def = { w: 320, h: 400, x: Math.floor((GAME_WIDTH - 320) / 2), y: 30 };
    const saved = this.windowLayouts['stats'];
    this.windowX = saved?.x ?? def.x;
    this.windowY = saved?.y ?? def.y;
    this.resizeWindow(saved?.w ?? def.w, saved?.h ?? def.h);

    this.windowContainer.setPosition(this.windowX, this.windowY);
    this.windowContainer.setVisible(true);
    this.winResizeGrip.setVisible(true);
    this.positionWindowGrip();
    this.lastWindowSignature = '';
    if (this.cachedUIData) this.buildWindowContent(this.cachedUIData);
  }

  /** Close exactly one window without touching the others. */
  private closeSingleWindow(type: WindowType) {
    switch (type) {
      case 'equipment':    if (isEquipmentDomOpen()) hideEquipmentDom(); break;
      case 'bag':          if (isBagDomOpen()) hideBagDom(); break;
      case 'spells':       if (isSpellsWindowDomOpen()) hideSpellsWindowDom(); break;
      case 'quests':       if (isQuestsDomOpen()) hideQuestsDom(); break;
      case 'achievements': if (isAchievementsWindowDomOpen()) hideAchievementsWindowDom(); break;
      case 'bestiary':     if (isBestiaryWindowDomOpen()) hideBestiaryWindowDom(); break;
      case 'vendor':       if (isVendorDomOpen()) hideVendorDom(); break;
      case 'crafting':     if (isCraftingDomOpen()) hideCraftingDom(); break;
      case 'stats':        this.closeStatsWindow(); break;
    }
    this.refreshMenuHighlight(type);
  }

  /** Hide the Phaser stats window and its scene-level decorations. */
  private closeStatsWindow() {
    this.currentWindow = null;
    this.lastWindowSignature = '';
    this.windowContainer.setVisible(false);
    this.winResizeGrip?.setVisible(false);
    for (const btn of this.windowInteractables) btn.destroy();
    this.windowInteractables = [];
  }

  /** Update a single menu button's highlight to match its own window's state. */
  private refreshMenuHighlight(type: WindowType) {
    const i = this.menuBtnTypes.indexOf(type);
    if (i < 0) return; // vendor/crafting have no menu button
    const active = this.isWindowOpen(type);
    this.menuBtnBgs[i].setFillStyle(active ? THEME.ink3 : THEME.ink2, active ? 1.0 : 0.92);
    this.menuBtnIcons[i].setColor(active ? TC.brass4 : TC.brass3);
    this.menuBtnTexts[i].setColor(active ? TC.brass4 : TC.text3);
  }

  /** Refresh every menu button's highlight to match its window's open state. */
  private refreshAllMenuHighlights() {
    for (const type of this.menuBtnTypes) this.refreshMenuHighlight(type);
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
    const tabs = ['All', 'Weapon', 'Armor', 'Jewel', 'Rune', 'T1', 'T2', 'T3', 'Mat'];

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

    // Вкладка Mat — кнопки покупки сырья (по одной на материал), без рецептов.
    if (this.vendorFilter === 'Mat') {
      let my = this.windowY + WIN_TITLE_H + 28;
      for (const m of VENDOR_MATERIALS) {
        const it = ITEMS[m.itemId];
        const afford = (data.sphere?.copper ?? 0) >= m.price;
        const btn = this.add.text(this.windowX + 8, my,
          `[ Купить ${it?.nameRu ?? m.itemId} ×${m.qty} — ${formatCurrency(m.price)} ]`, {
            fontSize: '10px', fontFamily: '"Special Elite", monospace',
            color: afford ? '#6d9a5a' : TC.text3, backgroundColor: '#1d1811', padding: { x: 6, y: 3 },
          }).setScrollFactor(0).setDepth(3000).setInteractive({ useHandCursor: true });
        if (afford) {
          btn.on('pointerdown', () => {
            const gs = this.scene.get('GameScene');
            (gs as any).buyMaterial?.(m.itemId, m.qty, m.price);
            this.time.delayedCall(150, () => {
              this.destroyVendorButtons();
              this.createVendorButtons(this.cachedUIData);
              this.refreshWindow();
            });
          });
        }
        this.vendorButtons.push(btn);
        my += 22;
      }
      return;
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
      this.buildWindowContent(this.cachedUIData);
    }
  }

  /** Open (or re-render) the DOM vendor window with fresh sphere data. */
  private openQuestsDom() {
    const data = this.cachedUIData;
    if (!data) return;
    showQuestsDom(
      { quests: data.quests, trackedQuestIds: data.trackedQuestIds ?? [], bodyQuest: data.bodyQuest },
      {
        onClose: () => this.closeSingleWindow('quests'),
        onTrackToggle: (id) => {
          this.scene.get('GameScene').events.emit('track-quest', id);
          this.openQuestsDom(); // re-render with updated tracked state
        },
      },
    );
  }

  private openVendorDom() {
    const sphere = this.cachedUIData?.sphere;
    if (!sphere) return;
    const gs = this.scene.get('GameScene') as any;
    showVendorDom(
      { copper: sphere.copper, learnedRecipes: sphere.learnedRecipes ?? [] },
      {
        onClose: () => this.closeSingleWindow('vendor'),
        onBuyRecipe: (id, price) => {
          gs?.buyRecipe?.(id, price);
          this.openVendorDom(); // re-render with updated copper / learned recipes
        },
        onBuyMaterial: (itemId, qty, price) => {
          gs?.buyMaterial?.(itemId, qty, price);
          this.openVendorDom();
        },
      },
    );
  }

  /** Open (or re-render) the DOM crafting window for the given workbench. */
  private openCraftingDom(workbenchType: string) {
    const sphere = this.cachedUIData?.sphere;
    if (!sphere) return;
    const gs = this.scene.get('GameScene') as any;
    showCraftingDom(
      workbenchType,
      { inventory: sphere.inventory, learnedRecipes: sphere.learnedRecipes ?? [] },
      {
        onClose: () => this.closeSingleWindow('crafting'),
        onCraft: (id) => {
          gs?.startCraftingFromUI?.(RECIPES.find(r => r.id === id));
          this.openCraftingDom(workbenchType); // re-render with consumed materials
        },
      },
    );
  }

  /** Close the Phaser stats window (× button / its own toggle). */
  private closeWindow() {
    this.destroyVendorButtons();
    this.closeStatsWindow();
    this.refreshMenuHighlight('stats');
  }

  // ── Equipment + Bag (split inventory) ──────────────────
  // Two independent, draggable windows sharing the same sphere data.
  // Equipping/unequipping/using mutates the sphere then refreshes BOTH
  // windows (whichever are open) plus the stats window.

  private doEquip(itemId: string, slot: string) {
    const sphere = this.cachedUIData?.sphere;
    if (!sphere) return;
    const equip = sphere.equipment as any;
    const invIdx = sphere.inventory.findIndex(i => i.itemId === itemId);
    if (invIdx < 0) return;
    const prev = equip[slot];
    equip[slot] = itemId;
    sphere.inventory.splice(invIdx, 1);
    if (prev && prev !== itemId) sphere.inventory.push({ itemId: prev, quantity: 1 });
    this.refreshInventoryWindows();
    this.scene.get('GameScene').events.emit('persist');
  }

  private doUnequip(slot: string) {
    const sphere = this.cachedUIData?.sphere;
    if (!sphere) return;
    const equip = sphere.equipment as any;
    const iid = equip[slot];
    if (!iid) return;
    equip[slot] = undefined;
    sphere.inventory.push({ itemId: iid, quantity: 1 });
    this.refreshInventoryWindows();
    this.scene.get('GameScene').events.emit('persist');
  }

  private doUseConsumable(itemId: string) {
    this.scene.get('GameScene').events.emit('use-item', itemId);
    this.refreshInventoryWindows();
  }

  private doSwitchWeapon(idx: 0 | 1) {
    const sphere = this.cachedUIData?.sphere;
    if (!sphere) return;
    sphere.activeWeaponSlot = idx;
    this.refreshInventoryWindows();
    // persist → refreshStats (active-weapon-only stats change on Tab switch).
    this.scene.get('GameScene').events.emit('persist');
  }

  private equipCallbacks() {
    return {
      onUnequip: (slot: string) => this.doUnequip(slot),
      onSwitchWeapon: (idx: 0 | 1) => this.doSwitchWeapon(idx),
      onClose: () => this.closeSingleWindow('equipment'),
    };
  }

  private bagCallbacks() {
    return {
      onEquip: (itemId: string, slot: string) => this.doEquip(itemId, slot),
      onUseConsumable: (itemId: string) => this.doUseConsumable(itemId),
      onClose: () => this.closeSingleWindow('bag'),
    };
  }

  private openEquipmentDom() {
    if (!this.cachedUIData) return;
    const { sphere, body } = this.cachedUIData;
    showEquipmentDom({ sphere, body: body ?? null }, this.equipCallbacks());
  }

  private openBagDom() {
    if (!this.cachedUIData) return;
    showBagDom({ sphere: this.cachedUIData.sphere }, this.bagCallbacks());
  }

  /** Re-render whichever inventory windows are currently open. */
  private refreshInventoryWindows() {
    if (!this.cachedUIData) return;
    const { sphere, body } = this.cachedUIData;
    if (isEquipmentDomOpen()) refreshEquipmentDom({ sphere, body: body ?? null }, this.equipCallbacks());
    if (isBagDomOpen()) refreshBagDom({ sphere }, this.bagCallbacks());
  }

  /** Сжатая сигнатура данных, которые отображает текущее окно (для гейта перестройки). */
  private windowSignature(data: UIData): string {
    const s = data.sphere;
    switch (this.currentWindow) {
      case 'stats':
        return 'stats|' + JSON.stringify(s.stats) + '|' + JSON.stringify(s.xpTracker)
          + '|' + JSON.stringify(s.equipment) + '|' + (s.copper ?? 0)
          + '|' + s.learnedSpells.map(sp => sp.id).join(',')
          + '|' + JSON.stringify(data.body?.definition.caps ?? {})
          + '|' + Math.ceil(data.deathDebuff ?? 0);
      case 'quests':
        return 'quests|' + data.quests.map(q => `${q.def.id}:${q.completed ? 1 : 0}:${q.counts.join('.')}`).join('|')
          + '|' + (data.trackedQuestIds ?? []).join(',');
      case 'vendor':
        return 'vendor|' + (s.copper ?? 0) + '|' + (s.learnedRecipes ?? []).join(',') + '|' + this.vendorFilter;
      case 'crafting':
        return 'crafting|' + JSON.stringify(data.inventory ?? []) + '|' + (s.learnedRecipes ?? []).join(',') + '|' + this.craftingWorkbenchType;
      default:
        return String(this.currentWindow);
    }
  }

  private buildWindowContent(data: UIData) {
    if (!this.currentWindow) return;
    if (this.currentWindow === 'spells') return;    // handled by DOM overlay
    if (this.currentWindow === 'vendor') return;    // handled by DOM overlay
    if (this.currentWindow === 'crafting') return;  // handled by DOM overlay
    if (this.currentWindow === 'quests') return;    // handled by DOM overlay
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

        // Бонусы экипировки — общий хелпер (см. itemDB.equipmentStatBonuses)
        const equipBonuses = equipmentStatBonuses(
          (sphere.equipment ?? {}) as Record<string, string | undefined>,
          sphere.activeWeaponSlot ?? 0,
        );

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
        if (sig) {
          lines.push('');
          const learned = sphere.learnedSpells.some(sp => sp.id === sig.id);
          if (learned) {
            lines.push(`✦ ${sig.nameRu} — LEARNED`);
          } else {
            lines.push(`✧ ${sig.nameRu} — via Body Quest`);
          }
        }

        // Show currency
        lines.push('');
        lines.push(`💰 ${formatCurrency(sphere.copper ?? 0)}`);

        this.windowTitleText.setText(t('stats.title'));
        this.windowContentText.setWordWrapWidth(this.windowW - 16, true).setText(lines.join('\n'));
        break;
      }
      case 'achievements':
        break;

      // 'vendor' / 'crafting' are handled by DOM overlays (early-returned above).
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
  StatName.Strength, StatName.Agility,
  StatName.Health, StatName.Armor, StatName.Evasion, StatName.Intellect, StatName.Will,
  StatName.Mana, StatName.Luck,
];
