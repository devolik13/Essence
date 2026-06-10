import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { Creature } from '../entities/Creature';
import { Caravan } from '../entities/Caravan';
import { DamageText } from '../entities/DamageText';
import { STARTER_BODIES, GOBLIN, WEAPON_COOLDOWNS, BodyType } from '../types/bodies';
import { lookupStarterBody } from '../data/starterBodies';
import { CREATURE_DB } from '../data/creatureDB';
import { TILE_SIZE, CAPTURE_RANGE } from '../utils/constants';
import { distance, clamp } from '../utils/math';
import { calcMeleeDamage, calcRangedDamage, calcMagicDamage, physicalReduction, magicalReduction } from '../systems/combat';
import { WEAPONS, weaponDamageType, getItemWeaponType } from '../data/weapons';
import {
  CaptureProcess, CaptureState,
  startCapture, updateCapture, interruptCapture,
} from '../systems/capture';
import { distributeXP, isFirstCapReached } from '../systems/progression';
import { SpatialGrid } from '../systems/spatialGrid';
import { Stats, StatName } from '../types/stats';
import { AbilityDef } from '../types/abilities';
import { QuestTracker } from '../systems/questTracker';
import { QUESTS } from '../data/questDB';
import { saveSphere, loadSphere } from '../systems/saveLoad';
import { ALL_KNOWN_SPELLS, getSpellById } from '../data/allSpells';
import { ALL_ZONES, ZoneConfig } from '../data/zones';
import { rollLoot, ITEMS, equipmentStatBonuses } from '../data/itemDB';
import { checkAchievements } from '../systems/achievements';
import { SCHOOL_BONUSES, MagicSchool } from '../data/magicSchools';
import { t, lt } from '../i18n';
import { getNPCDialog, PROLOGUE_DIALOG, CHAPTER1_FINALE_DIALOG, LAB_INTRO_DIALOG, LAB_VICTORY_DIALOG } from '../data/dialogs';
import { getBodyQuest, getBodyQuests } from '../data/bodyQuests';
import { BodyQuestTracker } from '../systems/bodyQuestTracker';
import { reveal as bestiaryReveal } from '../data/bestiaryProgress';
import { RESOURCE_NODES, RECIPES } from '../data/itemDB';
import { WORKBENCH_NAMES_RU, WORKBENCH_NAMES_EN, WORKBENCH_COLORS } from '../data/craftpixAssets';
import { STATUS_DEFS, StatusEffectId, isBuffStatus } from '../types/statuses';
// decorations atlas no longer used — all placed through in-game editor
import { spawnProjectileVFX, spawnHitVFX, spawnMeleeSwingVFX, spawnCastVFX, spawnHealVFX, spawnAoeVFX, spawnSpellImpact, spawnSpellProjectile, getSpellZoneAnim } from '../systems/vfx';
import { resumeAudio, sfxMeleeHit, sfxRangedShot, sfxMagicCast, sfxMagicHit, sfxCritHit, sfxDeath, sfxCapture, sfxHeal, sfxBuff, sfxBlock, sfxMiss, sfxLevelUp, sfxZoneTransition } from '../systems/sfx';
import { MOB_COPPER_DROPS, formatCurrency } from '../systems/currency';
import { buyRecipe as buyRecipeLogic, buyMaterial as buyMaterialLogic, consumeCraftMaterials, completeCraft, disassemble } from '../systems/craftingLogic';
import { MapEditor } from '../systems/mapEditor';
import {
  SummonedEnt, FireTsunami, GroundZone, SummonedWall, WindBarrier,
  pointInRotatedRect, BASIC_ATTACKS,
  DEATH_XP_LOSS_PCT, DEATH_DEBUFF_DURATION, DEATH_DEBUFF_MULT,
} from './gameSceneTypes';
export { DEATH_DEBUFF_MULT } from './gameSceneTypes';

/** Радиус очистки стартовой зоны от агрессивных существ вокруг камня
 *  возрождения Эшворта (px). Дефолтные спавны внутри удаляются. */
const START_CLEAR_RADIUS = 1400;

export class GameScene extends Phaser.Scene {
  private sphere!: Sphere;
  private playerBody: Body | null = null;
  private creatures: Creature[] = [];
  private caravans: Caravan[] = [];
  /** Пространственная сетка живых существ, перестраивается каждый кадр. */
  private creatureGrid = new SpatialGrid<Creature>(300);
  /** Кэш статичных точек NPC для миникарты (NPC не двигаются). */
  private cachedNpcDots: { x: number; y: number }[] | null = null;
  /** Кэш динамичных точек миникарты — пересборка раз в 200мс вместо каждого кадра. */
  private mapDotsTimer = 0;
  private cachedMapDots: {
    nodes: { x: number; y: number; depleted: boolean }[];
    quests: { x: number; y: number }[];
    creatures: { x: number; y: number; isDead: boolean; isPassive: boolean; isAggro: boolean }[];
  } | null = null;
  private damageTexts: DamageText[] = [];
  // ── Данж «Защита лаборатории» (зона lab) ──────────────────────────────────
  private labState: 'idle' | 'running' | 'victory' | 'defeat' = 'idle';
  private labWave = 0;
  private labMachine: Creature | null = null;
  private labCheckTimer = 0;
  private labSpawnPending = false;
  /** Режим питч-демо (вертикальный срез, запуск с титула): сцены идут по
   *  порядку пролог → деревня → Игнис → лаборатория. Флаг живёт в registry. */
  private pitchMode = false;
  /** Ритуал закрытия разрыва: появляется после 3-й волны. */
  private labRitual: 'none' | 'ready' | 'channeling' | 'done' = 'none';
  private labRitualTimer = 0;
  private labRitualReinforced = false;
  private labRiftGfx: Phaser.GameObjects.Graphics | null = null;
  private labRiftX = 0;
  private labRiftY = 0;
  private groundZones: GroundZone[] = [];
  private summonedWalls: SummonedWall[] = [];
  private windBarriers: WindBarrier[] = [];
  private starterBodies: {
    sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc;
    nameLabel: Phaser.GameObjects.Text;
    possessLabel: Phaser.GameObjects.Text;
    x: number; y: number;
    targetX: number; targetY: number;
    idleTimer: number;
    walking: boolean;
    animBase: string;
    facingDir: 'down' | 'up' | 'left' | 'right';
  }[] = [];

  // World objects
  private resourceNodes: { x: number; y: number; def: import('../data/itemDB').ResourceNodeDef; gfx: Phaser.GameObjects.Container; cooldown: number; depleted: boolean }[] = [];
  private workbenches: { x: number; y: number; type: string; nameRu: string; gfx: Phaser.GameObjects.Container }[] = [];
  private worldNPCs: { x: number; y: number; id: string; nameRu: string; role: string; gfx: Phaser.GameObjects.Container; questMarker?: Phaser.GameObjects.Text }[] = [];
  private questObjects: { x: number; y: number; objectId: string; nameRu: string; objType: string; gfx: Phaser.GameObjects.Container; used: boolean }[] = [];
  private bodyQuestObjects: typeof this.questObjects = [];

  // Fire tsunamis
  private fireTsunamis: FireTsunami[] = [];
  // Summoned Ents
  private summonedEnts: SummonedEnt[] = [];

  // Zone exit arrows (shown when near edge)
  private exitArrows: { text: Phaser.GameObjects.Text; edge: string }[] = [];

  // Loot drops on ground
  private lootDrops: { x: number; y: number; items: { itemId: string; qty: number }[]; gfx: Phaser.GameObjects.Container; timer: number }[] = [];

  // Crafting state
  private craftingTimer: number = 0;
  private craftingRecipe: import('../types/items').RecipeDef | null = null;
  private gatheringTimer: number = 0;
  private gatheringNode: typeof this.resourceNodes[0] | null = null;

  // Очередь респауна: { definitionId, x, y, delay (мс осталось) }
  private respawnQueue: { id: string; x: number; y: number; timer: number }[] = [];
  private readonly RESPAWN_DELAY = 15000; // 15 секунд

  // Стартовые тела — рассчитываются от точки респауна зоны
  private get starterPositions() {
    const rp = this.currentZone.respawnPoint;
    return [
      { x: rp.x - 20, y: rp.y },  // Воин
      { x: rp.x,      y: rp.y },  // Лучник
      { x: rp.x + 20, y: rp.y },  // Маг
    ];
  }

  // Захват
  private captureProcess: CaptureProcess | null = null;
  private captureTarget: Creature | null = null;

  // Квесты
  private questTracker!: QuestTracker;
  private bodyQuestTracker = new BodyQuestTracker();

  // NPC-квестодатель — рядом с респауном
  private get questGiverPos() {
    const rp = this.currentZone.respawnPoint;
    return { x: rp.x + 100, y: rp.y - 40 };
  }

  // Выбранная цель
  private selectedTarget: Creature | null = null;
  private selectedStarterDef: import('../types/bodies').BodyDefinition | null = null;
  private targetIndicator!: Phaser.GameObjects.Arc;

  // AoE прицеливание
  private aoeTargeting: { slotIndex: number; spell: AbilityDef } | null = null;
  /** Ally-target spell (e.g. Ally Heal): waits for click on a friendly creature. */
  private allyTargeting: { slotIndex: number; spell: AbilityDef } | null = null;
  private aoeCasting: {
    slotIndex: number; spell: AbilityDef;
    targetX: number; targetY: number;
    elapsed: number; duration: number;
  } | null = null;
  private aoeIndicator!: Phaser.GameObjects.Graphics;
  /** Последние координаты, для которых отрисован AoE-индикатор (skip redraw). */
  private aoeIndLastWx = NaN;
  private aoeIndLastWy = NaN;
  private aoeIndLastPx = NaN;
  private aoeIndLastPy = NaN;
  private protectZoneGfx!: Phaser.GameObjects.Graphics;
  /** Слабый круг дальности активного оружия вокруг игрока. */
  private weaponRangeGfx!: Phaser.GameObjects.Graphics;
  /** Экранная стрелка-указатель на ближайшую квест-цель (когда она за экраном). */
  private questArrow!: Phaser.GameObjects.Text;

  // Клавиши
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyTab!:   Phaser.Input.Keyboard.Key;
  private key1!: Phaser.Input.Keyboard.Key;
  private key2!: Phaser.Input.Keyboard.Key;
  private key3!: Phaser.Input.Keyboard.Key;
  private key4!: Phaser.Input.Keyboard.Key;
  private key5!: Phaser.Input.Keyboard.Key;
  private key6!: Phaser.Input.Keyboard.Key;
  private key7!: Phaser.Input.Keyboard.Key;
  private key8!: Phaser.Input.Keyboard.Key;

  /** Текущая зона */
  private currentZone: ZoneConfig = ALL_ZONES['village'];
  private mapLayer: Phaser.Tilemaps.TilemapLayer | null = null;
  private mapEditor?: MapEditor;
  /** true пока открыт редактор карт — мобы и игрок заморожены. */
  public editorMode = false;
  private spawnX?: number;
  private spawnY?: number;

  /**
   * Снятие слушателей/хендлеров, добавленных в create().
   * scene.restart() (смена зоны) переиспользует this.events и не чистит его,
   * поэтому без явного снятия собственные слушатели GameScene дублировались бы
   * с каждым рестартом (множит persist/клики). Заполняется через trackEvent(),
   * прогоняется в SHUTDOWN.
   */
  private teardownFns: Array<() => void> = [];

  /** Текущая цель слежения камеры — чтобы не дёргать startFollow каждый кадр. */
  private cameraFollowTarget?: Phaser.GameObjects.GameObject;

  // New game flow
  private isNewGame = false;
  private newGameBodyId?: string;
  private newGameCharName?: string;
  private newGameWeapon1?: string;
  private newGameWeapon2?: string;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data?: { zoneId?: string; spawnX?: number; spawnY?: number; isNewGame?: boolean; starterBodyId?: string; starterWeapon1?: string; starterWeapon2?: string; characterName?: string }) {
    this.currentZone = ALL_ZONES[data?.zoneId ?? 'village'] ?? ALL_ZONES['village'];
    this.spawnX = data?.spawnX;
    this.spawnY = data?.spawnY;
    this.isNewGame = data?.isNewGame ?? false;
    this.newGameBodyId = data?.starterBodyId;
    this.newGameWeapon1 = data?.starterWeapon1;
    this.newGameWeapon2 = data?.starterWeapon2;
    this.newGameCharName = data?.characterName;
    // Очищаем все ссылки при перезагрузке сцены
    this.creatures = [];
    for (const c of this.caravans) c.destroy();
    this.caravans = [];
    this.damageTexts = [];
    this.groundZones = [];
    this.windBarriers = [];
    this.summonedWalls = [];
    this.playerBody = null;
    this.selectedTarget = null;
    this.selectedStarterDef = null;
    this.captureProcess = null;
    this.captureTarget = null;
    this.starterBodies = [];
    this.resourceNodes = [];
    this.workbenches = [];
    this.worldNPCs = [];
    this.craftingTimer = 0;
    this.craftingRecipe = null;
    this.lootDrops = [];
    this.fireTsunamis = [];
    this.summonedEnts = [];
    this.exitArrows = [];
    this.questObjects = [];
    this.bodyQuestObjects = [];
    this.bodyQuestTracker.clear();
    this.teardownFns = [];
    this.cameraFollowTarget = undefined;
    this.cachedNpcDots = null;
    this.cachedMapDots = null;
    this.mapDotsTimer = 0;
    this.creatureGrid.clear();
  }

  /**
   * Регистрирует слушатель на this.events и запоминает его снятие для SHUTDOWN.
   * Снимаем именно по ссылке (а не events.off(event)), чтобы не задеть
   * слушателей UIScene на тех же событиях (напр. 'spell-learned').
   */
  private trackEvent(event: string, handler: (...args: any[]) => void): void {
    this.events.on(event, handler);
    this.teardownFns.push(() => this.events.off(event, handler));
  }

  /** Переключает слежение камеры только при реальной смене цели (не каждый кадр). */
  private followCamera(target: Phaser.GameObjects.GameObject): void {
    if (this.cameraFollowTarget === target) return;
    this.cameraFollowTarget = target;
    this.cameras.main.startFollow(target, true, 0.1, 0.1);
  }

  create() {
    // Снимаем все слушатели/хендлеры этой сцены при выгрузке. scene.restart()
    // на смене зоны переиспользует эмиттер — без этого хендлеры накапливаются.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const fn of this.teardownFns) fn();
      this.teardownFns = [];
    });
    this.pitchMode = this.registry.get('pitchMode') === true;

    // ─── Квесты ──────────────────────────────────────
    this.questTracker = new QuestTracker(QUESTS);

    // ─── Тайловая карта ──────────────────────────────
    this.buildMap();

    // ─── Редактор карт: загрузка сохранённых объектов + хоткеи ──
    this.mapEditor = new MapEditor(this, this.currentZone.id);
    this.mapEditor.spawnAll();
    {
      const toggle = () => { this.mapEditor?.toggle(); };
      const domHandler = (e: KeyboardEvent) => {
        if (e.key === '`' || e.key === '~' || e.code === 'Backquote' ||
            e.key === 'F2' || e.key === 'F9') {
          e.preventDefault();
          toggle();
        }
        // Dev-вход в данж лаборатории (TODO: нарративный вход после Игниса)
        if (e.key === 'F8') {
          e.preventDefault();
          const target = this.currentZone.id === 'lab' ? 'village' : 'lab';
          this.scene.restart({ zoneId: target, spawnX: undefined, spawnY: undefined });
        }
      };
      window.addEventListener('keydown', domHandler);
      this.teardownFns.push(() => window.removeEventListener('keydown', domHandler));
    }

    // ─── Сфера ───────────────────────────────────────
    const startX = this.spawnX ?? this.currentZone.respawnPoint.x;
    const startY = this.spawnY ?? this.currentZone.respawnPoint.y;
    this.sphere = new Sphere(this, startX, startY);
    const zoneW = this.currentZone.widthTiles * TILE_SIZE;
    const zoneH = this.currentZone.heightTiles * TILE_SIZE;
    this.sphere.mapW = zoneW;
    this.sphere.mapH = zoneH;

    if (this.isNewGame) {
      this.sphere.characterName = this.newGameCharName ?? '';
      if (this.newGameWeapon1) {
        const itemId1 = `starter_${this.newGameWeapon1}`;
        this.sphere.equipment.weapon = itemId1; // только в экипировку (не дублируем в сумку)
      }
      if (this.newGameWeapon2) {
        const itemId2 = `starter_${this.newGameWeapon2}`;
        this.sphere.equipment.weapon2 = itemId2;
      }
      // Питч-демо: статы сразу 100 — показываем контент (Игнис, лаборатория),
      // а не гринд. Заклинания НЕ выдаём: их игрок добывает вселениями —
      // это и есть демонстрация ядра игры.
      if (this.pitchMode) {
        for (const stat of Object.keys(this.sphere.stats) as StatName[]) {
          this.sphere.stats[stat] = 100;
        }
      }
    } else {
      const loaded = loadSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
      if (loaded) this.events.emit('save-loaded');
    }

    // UI scenes (e.g. inventory equip/unequip) request a save via this event.
    this.trackEvent('persist', () => this.persistState());

    // ─── Debug / cheat commands (DevTools console) ──────────────────────────
    // Usage: cheatWeapons() — adds 1 of every starter weapon to inventory
    //        cheatSpells()  — learns every T1 spell + neutrals + nature/wolf
    //        cheatAll()     — both at once
    (window as unknown as { cheatWeapons: () => void }).cheatWeapons = () => {
      const weaponIds = Object.keys(ITEMS).filter(id => id.startsWith('starter_'));
      let added = 0;
      for (const id of weaponIds) {
        if (!this.sphere.inventory.find(i => i.itemId === id)) {
          this.sphere.inventory.push({ itemId: id, quantity: 1 });
          added++;
        }
      }
      this.persistState();
      this.events.emit('log', { text: `[cheat] +${added} weapons (${weaponIds.length} types)`, color: '#ffcc66' });
      console.log(`[cheat] Added ${added} starter weapons:`, weaponIds);
    };
    (window as unknown as { cheatSpells: () => void }).cheatSpells = () => {
      // Learn every spell registered in ALL_KNOWN_SPELLS — covers all weapon
      // tiers, all school tiers, and all neutrals.
      let added = 0;
      for (const spell of ALL_KNOWN_SPELLS) {
        if (this.sphere.learnedSpells.some(s => s.id === spell.id)) continue;
        this.sphere.learnedSpells.push(spell);
        this.sphere.spellProgress[spell.id] = 9999;
        added++;
      }
      this.persistState();
      this.events.emit('log', { text: `[cheat] +${added} spells learned`, color: '#66ccff' });
      console.log(`[cheat] Learned ${added} spells. Total now: ${this.sphere.learnedSpells.length}`);
    };
    (window as unknown as { cheatAll: () => void }).cheatAll = () => {
      (window as unknown as { cheatWeapons: () => void }).cheatWeapons();
      (window as unknown as { cheatSpells: () => void }).cheatSpells();
    };
    // Снимаем чит-функции при выгрузке сцены (C4) — не оставляем висеть на window.
    this.teardownFns.push(() => {
      const w = window as unknown as Record<string, unknown>;
      delete w.cheatWeapons; delete w.cheatSpells; delete w.cheatAll;
    });

    // ─── Восстановление тела (загрузка) или авто-вселение (новая игра) ─────
    let autoBodyId = this.isNewGame ? this.newGameBodyId : this.sphere.lastBodyId;
    // Данж лаборатории: в паровом мире игрок ВСЕГДА в родном теле ассистента.
    // Прежнее тело запоминаем и возвращаем при выходе ('' = был в астрале).
    if (this.currentZone.id === 'lab') {
      if (autoBodyId !== 'lab_assistant') this.sphere.labReturnBodyId = autoBodyId ?? '';
      autoBodyId = 'lab_assistant';
    } else if (this.sphere.labReturnBodyId !== null) {
      autoBodyId = this.sphere.labReturnBodyId || null;
      this.sphere.labReturnBodyId = null;
      this.sphere.lastBodyId = autoBodyId;
    } else if (autoBodyId === 'lab_assistant') {
      // Сейв сделан внутри данжа: ассистент не существует в фэнтези-мире —
      // возвращаемся в астрал у камня возрождения.
      autoBodyId = null;
      this.sphere.lastBodyId = null;
    }
    if (autoBodyId) {
      const bodyDef = CREATURE_DB[autoBodyId] ?? lookupStarterBody(autoBodyId);
      if (bodyDef) {
        this.playerBody = new Body(this, startX, startY, bodyDef, this.getEquippedStats());
        this.playerBody.mapW = zoneW; this.playerBody.mapH = zoneH;
        this.playerBody.wallCheckFn = (x, y) => this.isBlockedByWall(x, y, true);
        this.playerBody.possess(this);
        this.fillBodySlots(this.playerBody);
        this.sphere.enterBody();
        this.sphere.lastBodyId = bodyDef.id;
        if (this.isNewGame) {
          this.persistState();
        }
      }
    }

    // ─── Стартовые тела (визуальные маркеры; в паровом мире их нет) ─────────
    if (this.currentZone.id !== 'lab') this.createStarterMarkers();

    // ─── Мобы ────────────────────────────────────────
    this.spawnCreatures();

    // ─── Данж «Защита лаборатории» ───────────────────
    if (this.currentZone.id === 'lab') this.initLabDungeon();

    // ─── Ресурсные ноды, верстаки, NPC ───────────────
    this.spawnWorldObjects();
    this.updateQuestMarkers();

    // ─── Exit arrows (hidden, shown near edge) ──────
    this.createExitArrows();

    // ─── Камера ──────────────────────────────────────
    this.cameras.main.setBounds(0, 0, zoneW, zoneH);
    this.followCamera(this.sphere);

    // Show prologue on first game start (village only)
    if (this.currentZone.id === 'village') {
      this.time.delayedCall(500, () => this.showPrologue());
    }

    // ─── Индикатор выбранной цели ─────────────────────
    this.targetIndicator = this.add.arc(0, 0, 18, 0, 360, false, 0xffff00, 0)
      .setStrokeStyle(2, 0xffff00, 0.8).setVisible(false);

    // ─── AoE индикатор (следует за мышью) ─────────────
    this.aoeIndicator = this.add.graphics().setDepth(60).setVisible(false);
    this.protectZoneGfx = this.add.graphics().setDepth(2).setVisible(false);
    this.weaponRangeGfx = this.add.graphics().setDepth(1).setVisible(false);
    this.questArrow = this.add.text(0, 0, '➤', { fontSize: '22px', color: '#55ff66', stroke: '#000', strokeThickness: 3 })
      .setOrigin(0.5).setScrollFactor(0).setDepth(900).setVisible(false);

    // ─── Клавиши ─────────────────────────────────────
    if (this.input.keyboard) {
      this.keyQ     = this.input.keyboard.addKey('Q');
      this.keyE     = this.input.keyboard.addKey('E');
      this.keyEsc   = this.input.keyboard.addKey('ESC');
      this.keySpace = this.input.keyboard.addKey('SPACE');
      this.keyTab   = this.input.keyboard.addKey('TAB');
      this.key1     = this.input.keyboard.addKey('ONE');
      this.key2     = this.input.keyboard.addKey('TWO');
      this.key3     = this.input.keyboard.addKey('THREE');
      this.key4     = this.input.keyboard.addKey('FOUR');
      this.key5     = this.input.keyboard.addKey('FIVE');
      this.key6     = this.input.keyboard.addKey('SIX');
      this.key7     = this.input.keyboard.addKey('SEVEN');
      this.key8     = this.input.keyboard.addKey('EIGHT');
    }

    // При изучении заклинания — обновляем слоты и квесты
    this.trackEvent('spell-learned', (spell: import('../types/abilities').AbilityDef) => {
      if (this.playerBody) this.fillBodySlots(this.playerBody);
      const spellCompleted = this.questTracker.onSpellLearned(spell.id);
      for (const q of spellCompleted) this.onQuestComplete(q);
      // Check spell achievements
      const spellAch = checkAchievements(this.sphere);
      for (const ach of spellAch) {
        this.events.emit('achievement-unlocked', ach);
      }
    });

    // Смена языка в настройках: мировые лейблы (имена мобов, ноды, NPC,
    // верстаки, название зоны) создаются при спавне — перезапускаем зону
    // на месте, чтобы пересоздать их на новом языке. Состояние сохраняется
    // как при обычном переходе между зонами.
    this.trackEvent('language-changed', () => {
      if (this.playerBody) this.sphere.lastBodyId = this.playerBody.definition.id;
      this.persistState();
      const px = this.playerBody?.x ?? this.currentZone.respawnPoint.x;
      const py = this.playerBody?.y ?? this.currentZone.respawnPoint.y;
      this.scene.restart({ zoneId: this.currentZone.id, spawnX: px, spawnY: py });
    });

    // Переключение отслеживания квеста
    this.trackEvent('track-quest', (questId: string) => {
      const ids = this.sphere.trackedQuestIds;
      const idx = ids.indexOf(questId);
      if (idx >= 0) {
        ids.splice(idx, 1);
      } else {
        ids.push(questId);
      }
      this.persistState();
    });

    // Назначение заклинания в слот из spell picker (из UIScene)
    this.trackEvent('assign-spell', (data: { slotIndex: number; spell: import('../types/abilities').AbilityDef | null }) => {
      if (!this.playerBody) return;
      const slot = this.playerBody.abilitySlots[data.slotIndex];
      if (!slot) return;
      slot.ability = data.spell;
      slot.cooldownRemaining = 0;
      if (data.spell) this.sphere.abilityCooldowns[data.spell.id] = 0;
      // Сохраняем назначение в Сферу
      this.sphere.savedSlotIds[data.slotIndex] = data.spell?.id ?? null;
      this.persistState();
    });

    this.trackEvent('activate-spell-slot', (slotIndex: number) => {
      if (slotIndex === 0) this.handleAttack();
      else this.activateSpellSlot(slotIndex);
    });

    this.trackEvent('use-item', (itemId: string) => {
      const def = ITEMS[itemId];
      if (!def || def.type !== 'consumable') return;
      if (!this.sphere.useItem(itemId)) return;
      const body = this.playerBody;
      if (body) {
        if (def.hpRestore) {
          body.currentHP = Math.min(body.maxHP, body.currentHP + def.hpRestore);
        }
        if (def.manaRestore) {
          body.currentMana = Math.min(body.maxMana, body.currentMana + def.manaRestore);
        }
      }
      this.persistState();
    });

    // ─── Клик ────────────────────────────────────────
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      resumeAudio(); // Unlock audio on first click
      // Правая кнопка — отмена AoE
      if (pointer.rightButtonDown()) {
        this.exitAoeTargeting();
        if (this.allyTargeting) this.exitAllyTargeting();
        return;
      }
      if (!pointer.leftButtonDown()) return;

      // Если активен режим AoE — выстрел
      if (this.aoeTargeting) {
        this.fireAoeSpell(pointer.worldX, pointer.worldY);
        return;
      }

      // Ally-targeting: click on a friendly creature (summoned wolf, caravan, etc.)
      if (this.allyTargeting) {
        const wx = pointer.worldX, wy = pointer.worldY;
        const clickedAlly = this.creatures.find(c =>
          !c.isDead && distance(c.x, c.y, wx, wy) < 30 &&
          (c.isSummoned || c.definition.faction === 'caravan'),
        );
        if (clickedAlly) {
          this.fireAllySpell(clickedAlly);
        } else {
          this.showMessage(lt('Выбери союзника', 'Choose an ally'));
        }
        return;
      }

      // Обычный клик — выбрать цель
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      const clicked = this.creatures.find(c =>
        !c.isDead && distance(c.x, c.y, worldX, worldY) < 20
      );
      if (clicked) {
        this.selectTarget(clicked);
        this.selectedStarterDef = null;
      } else {
        // Check starter bodies
        const clickedStarter = this.starterBodies.find(sb =>
          distance(sb.x, sb.y, worldX, worldY) < 30
        );
        if (clickedStarter) {
          const idx = this.starterBodies.indexOf(clickedStarter);
          this.selectedStarterDef = STARTER_BODIES[idx] ?? null;
          this.selectedTarget = null;
        } else {
          this.selectedStarterDef = null;
          // Empty-area click — move player body toward the click point
          if (this.playerBody) {
            this.playerBody.setClickMoveTarget(worldX, worldY);
          }
        }
      }
    });
  }

  private persistState() {
    // Пересчёт «постоянных» статов тела от текущей экипировки (maxHP/maxMana/база брони).
    // persistState вызывается при любой смене снаряжения (equip/unequip/disassemble/use-item).
    if (this.playerBody) this.playerBody.refreshStats(this.getEquippedStats());
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
  }

  update(time: number, delta: number) {
    // ── Editor mode: всё замирает, только редактор работает ──
    if (this.editorMode) return;

    // ── Проверка перехода между зонами ──────────────────
    this.checkZoneTransition();

    // Обновляем сферу
    this.sphere.update(time, delta);

    // Пространственная сетка живых существ — строится раз в кадр (позиции с
    // конца прошлого кадра) и обслуживает соседние запросы (фракции, бой,
    // ближайший враг волка) за O(соседей) вместо O(всех). Должна быть готова
    // до игрового ввода ниже (tryCaptureDead читает isInCombat).
    this.creatureGrid.clear();
    for (const c of this.creatures) {
      if (!c.isDead) this.creatureGrid.insert(c);
    }

    // Обновляем тело игрока
    if (this.playerBody) {
      // Цветные числа DoT над игроком (огонь — красный, яд — фиолетовый, мана — синий).
      if (!this.playerBody.onDotTick) {
        this.playerBody.onDotTick = (x, y, amount, kind) => {
          this.damageTexts.push(new DamageText(this, x, y, amount, false, false, undefined, kind));
        };
      }
      this.playerBody.update(time, delta);
      // Камера следит за телом
      this.followCamera(this.playerBody);

      // Слабый круг дальности активного оружия (следует за телом)
      this.weaponRangeGfx.clear().setVisible(true)
        .lineStyle(1, 0xffffff, 0.14)
        .strokeCircle(this.playerBody.x, this.playerBody.y, this.playerBody.weapon.range);

      // Стрелка-указатель на квест-цель (если она за экраном)
      this.updateQuestArrow();

      // Выход из тела [Q]
      if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
        this.exitBody();
      }
      // [E] в теле — лут, квестодатель, ноды, верстаки, NPC, захват
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        if (!this.tryStartLabRitual() && !this.tryPickupLoot() && !this.tryTalkToQuestGiver() && !this.tryInteractWorldObject()) {
          this.tryCaptureDead();
        }
      }

      // Слот 1 [1] — базовая атака
      if (Phaser.Input.Keyboard.JustDown(this.key1)) {
        this.handleAttack();
      }
      // Слоты 2–8 — заклинания
      const spellKeys = [this.key2, this.key3, this.key4, this.key5, this.key6, this.key7, this.key8];
      for (let i = 0; i < spellKeys.length; i++) {
        if (Phaser.Input.Keyboard.JustDown(spellKeys[i])) {
          this.activateSpellSlot(i + 1);
          break;
        }
      }

      // TAB — переключение оружия
      if (Phaser.Input.Keyboard.JustDown(this.keyTab)) {
        this.switchWeapon();
      }

      // ESC — отмена AoE
      if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
        this.exitAoeTargeting();
        if (this.allyTargeting) this.exitAllyTargeting();
      }
    } else {
      this.followCamera(this.sphere);
      this.weaponRangeGfx.setVisible(false); // в астрале оружия нет
      this.questArrow.setVisible(false);

      // В астрале: [E] — NPC, захват стартового тела, или мёртвого существа
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.tryTalkToQuestGiver() ||
        this.tryPossessStarter()   ||
        this.tryCaptureDead();
      }
    }

    // Обновляем караваны (двигают телегу + строят охрану в формацию)
    // Делаем это ПЕРЕД обновлением мобов, чтобы каждый кадр их позиции
    // были выставлены к слотам формации до AI-логики мобов.
    // Караван — самоуправляемый цикл (A→B→ожидание→полный респаун в A). Он сам
    // добавляет/удаляет эскорт и рейдеров через колбэки на this.creatures, так
    // что здесь фильтровать массив не нужно. Деспавн происходит только при смене
    // зоны / teardown через caravan.destroy() (см. init/clear).
    for (const caravan of this.caravans) caravan.update(time, delta);

    // Обновляем мобов
    const px = this.playerBody?.x ?? -9999;
    const py = this.playerBody?.y ?? -9999;
    const friendlyIds = this.bodyQuestTracker.getActive()?.def.friendlyCreatureIds;
    // While the player body is inside any safe zone, all aggro on player is
    // suppressed — chasing mobs return to spawn. NPC faction wars continue
    // (creature.factionTarget is unaffected by skipAggro).
    const playerInSafe = !!(this.playerBody && this.isInSafeZone(this.playerBody.x, this.playerBody.y));
    // Вид игрока: id тела без суффикса _veteran (orc/orc_veteran → 'orc').
    // Свои (тот же вид) не агрятся на вселённое тело (орки уважают вождя).
    // Ретализация при атаке всё равно срабатывает (aggroCreature игнорит skipAggro).
    const playerSpecies = this.playerBody ? this.playerBody.definition.id.replace(/_veteran$/, '') : '';
    // Живые призванные союзники (обычно 0-1) — чтобы мобы в атаке не
    // сканировали весь список существ в поисках волка (O(N²) при ~250 мобах).
    const aliveSummons: Creature[] = [];
    for (const c of this.creatures) {
      if (c.isSummoned && !c.isDead) aliveSummons.push(c);
    }
    for (const creature of this.creatures) {
      creature.skipAggro = playerInSafe ||
        (!!friendlyIds && friendlyIds.includes(creature.definition.id)) ||
        (!!playerSpecies && creature.definition.id.replace(/_veteran$/, '') === playerSpecies) ||
        // Фракционные существа (рейдеры + эскорт каравана) воюют через
        // faction-war AI + ретализацию, а не по близости игрока. Они не агрятся
        // на игрока по дистанции — чтобы можно было подойти и вселиться. При
        // атаке игроком ретализация всё равно работает (aggroCreature игнорит skipAggro).
        !!creature.definition.faction;
      // ── Призванный союзник — отдельная логика ──────────────────────────
      if (creature.isSummoned) {
        if (creature.isDead) continue;

        // Приоритет: цель игрока > ближайший враг > следовать за игроком
        let wolfTarget: Creature | null = null;

        // 1. Атакуем цель игрока если она есть и жива
        if (this.selectedTarget && !this.selectedTarget.isDead && !this.selectedTarget.isSummoned) {
          wolfTarget = this.selectedTarget;
        }

        // 2. Иначе ближайший враг в радиусе 300px
        if (!wolfTarget) {
          let nearestDist = 300;
          this.creatureGrid.forEachNear(creature.x, creature.y, 300, (c) => {
            if (c === creature || c.isDead || c.isSummoned) return;
            const d = distance(creature.x, creature.y, c.x, c.y);
            if (d < nearestDist) { nearestDist = d; wolfTarget = c; }
          });
        }

        // 3. Если игрок далеко (>250px) — бежим к нему, бросаем цель
        const distToPlayer = distance(creature.x, creature.y, px, py);
        if (distToPlayer > 250) {
          wolfTarget = null; // бросаем врага, бежим к хозяину
          creature.update(time, delta, px, py);
        } else if (wolfTarget) {
          creature.update(time, delta, wolfTarget.x, wolfTarget.y);
        } else {
          // Стоим рядом с игроком
          creature.update(time, delta, px, py);
        }

        if (wolfTarget && creature.aiState === 'attack' && creature.attackCooldown <= 0) {
          this.summonedWolfAttackEnemy(creature, wolfTarget);
        }
        continue;
      }

      // ── Троттлинг AI дальних мобов ───────────────────────
      // Вне боя и дальше FAR_AI_DIST от игрока моб «думает» ~10 раз/сек
      // с накопленной дельтой (кулдауны/DoT/таймеры остаются точными),
      // вместо полного апдейта на каждом из 60 кадров.
      creature.aiAccumMs += delta;
      const fdx = creature.x - px;
      const fdy = creature.y - py;
      if (fdx * fdx + fdy * fdy > GameScene.FAR_AI_DIST_SQ &&
          !creature.castingSpell &&
          (creature.aiState === 'idle' || creature.aiState === 'wander' || creature.aiState === 'return')) {
        if (creature.aiAccumMs < 100) continue;
      }
      const aiDelta = creature.aiAccumMs;
      creature.aiAccumMs = 0;

      // ── Поиск вражеской фракции ──────────────────────────
      // Если моб имеет faction и рядом есть живой моб противоположной
      // фракции — он становится предпочтительной целью. Иначе — игрок.
      // (NPC-животные между собой не дерутся: predator-prey aggro срабатывает
      // через стандартный 200px-радиус на playerBody — то есть только когда
      // игрок в теле жертвы.)
      creature.factionTarget = this.findFactionEnemy(creature);
      let targetX = px, targetY = py;
      if (creature.factionTarget) {
        targetX = creature.factionTarget.x;
        targetY = creature.factionTarget.y;
        // Агро через AGGRO_RANGE внутри Creature рассчитан на игрока;
        // фракционный обзор больше, поэтому принудительно переводим
        // в chase, если моб ещё в idle/return.
        if (creature.aiState === 'idle' || creature.aiState === 'return') {
          creature.aiState = 'chase';
        }
      }
      creature.update(time, aiDelta, targetX, targetY);

      // Моб атакует: приоритет — factionTarget, потом волк, потом игрок
      if (creature.aiState === 'attack' && creature.attackCooldown <= 0) {
        if (creature.factionTarget && !creature.factionTarget.isDead) {
          this.creatureAttackCreature(creature, creature.factionTarget);
        } else if (this.playerBody) {
          let wolfNearby: Creature | null = null;
          for (const c of aliveSummons) {
            const d = distance(creature.x, creature.y, c.x, c.y);
            if (d < WEAPONS[creature.definition.weapon].range * 1.2) { wolfNearby = c; break; }
          }
          if (wolfNearby) {
            this.creatureAttackWolf(creature, wolfNearby);
          } else {
            this.creatureAttackPlayer(creature);
          }
        }
      }

      // Моб кастует заклинание (только если цель — игрок, чтобы не усложнять)
      if (creature.aiState === 'attack' && this.playerBody && !creature.factionTarget) {
        const spell = creature.getReadySpell();
        if (spell) this.creatureCastSpell(creature, spell);
      }

      // Завершение каста (castTime заклинания)
      if (creature.castingSpell && creature.castTimer <= 0 && this.playerBody) {
        const spell = creature.consumeCastingSpell();
        if (spell) this.creatureCastSpell(creature, spell);
      }
    }

    // Смерть от DoT (яд/горение в собственном update) — засчитать убийство
    // (XP/лут), иначе существо просто зависает мёртвым. killProcessed дедуплицирует.
    for (const c of [...this.creatures]) {
      if (c.isDead && !c.killProcessed) this.onCreatureKilled(c);
    }

    // Столкновения: тело игрока ↔ мобы (через сетку — O(соседей), не O(всех))
    if (this.playerBody) {
      const pb = this.playerBody;
      const minDist = 26; // 14 + 12 — радиусы тела и моба
      this.creatureGrid.forEachNear(pb.x, pb.y, minDist + 16, (c) => {
        if (c.isDead) return;
        const dx = pb.x - c.x;
        const dy = pb.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < minDist) {
          const push = (minDist - dist) / dist;
          pb.x += dx * push * 0.6;
          pb.y += dy * push * 0.6;
          c.x -= dx * push * 0.4;
          c.y -= dy * push * 0.4;
        }
      });
    }

    // Обновляем текст урона
    this.damageTexts = this.damageTexts.filter(dt => !dt.update(time, delta));
    this.updateGroundZones(delta);
    this.updateWindBarriers(delta);
    this.updateSummonedWalls(delta);
    this.updateWorldObjects(delta);
    this.updateFireTsunamis(delta);
    this.updateEnts(delta);
    this.updateExitArrows();
    this.updateBossBanner();
    this.updateStarterWander(delta);
    if (this.currentZone.id === 'lab') { this.updateLabDungeon(delta); this.updateLabRitual(delta); }

    // Индикатор выбранной цели
    if (this.selectedTarget && !this.selectedTarget.isDead && this.selectedTarget.active) {
      this.targetIndicator.setPosition(this.selectedTarget.x, this.selectedTarget.y).setVisible(true);
    } else {
      this.selectedTarget = null;
      this.targetIndicator.setVisible(false);
    }

    // AoE индикатор — следует за мышью.
    // Перерисовываем только если мышь/игрок сдвинулись — clear() + redraw
    // Graphics на каждом кадре заметно дороже, чем проверка четырёх чисел.
    if (this.aoeTargeting && this.playerBody) {
      const spell = this.aoeTargeting.spell;
      const ptr = this.input.activePointer;
      const wx = this.cameras.main.scrollX + ptr.x / this.cameras.main.zoom;
      const wy = this.cameras.main.scrollY + ptr.y / this.cameras.main.zoom;
      if (wx === this.aoeIndLastWx && wy === this.aoeIndLastWy &&
          this.playerBody.x === this.aoeIndLastPx && this.playerBody.y === this.aoeIndLastPy &&
          this.aoeIndicator.visible) {
        // ничего не изменилось — индикатор актуален
      } else {
      this.aoeIndLastWx = wx;
      this.aoeIndLastWy = wy;
      this.aoeIndLastPx = this.playerBody.x;
      this.aoeIndLastPy = this.playerBody.y;
      const aoeR = spell.aoeRadius ?? 60;
      const castDist = distance(this.playerBody.x, this.playerBody.y, wx, wy);
      const inRange = castDist <= spell.range;

      this.aoeIndicator.clear().setVisible(true);

      // Тонкий круг максимальной дальности вокруг игрока
      this.aoeIndicator.lineStyle(1, 0xff4444, 0.45);
      this.aoeIndicator.strokeCircle(this.playerBody.x, this.playerBody.y, spell.range);

      // Зона поражения: яркая в радиусе, тусклая за ним
      const fillAlpha   = inRange ? 0.18 : 0.05;
      const strokeAlpha = inRange ? 0.9  : 0.25;
      const strokeColor = inRange ? 0xff8800 : 0x888888;

      if (spell.isWallShape) {
        // Прямоугольник стены перпендикулярно направлению
        const wallW = spell.wallWidth ?? 140;
        const wallT = spell.wallThickness ?? 30;
        const dx = wx - this.playerBody.x;
        const dy = wy - this.playerBody.y;
        const angle = Math.atan2(dy, dx) + Math.PI / 2;
        const indPts = this.getRotatedRectPoints(wx, wy, wallW / 2, wallT / 2, angle);
        this.aoeIndicator.fillStyle(0xff6600, fillAlpha);
        this.aoeIndicator.fillPoints(indPts, true);
        this.aoeIndicator.lineStyle(2, strokeColor, strokeAlpha);
        this.aoeIndicator.strokePoints(indPts, true);
      } else {
        this.aoeIndicator.fillStyle(0xff6600, fillAlpha);
        this.aoeIndicator.fillCircle(wx, wy, aoeR);
        this.aoeIndicator.lineStyle(2, strokeColor, strokeAlpha);
        this.aoeIndicator.strokeCircle(wx, wy, aoeR);
      }
      }
    }

    // Каст AoE — тикаем таймер
    if (this.aoeCasting && this.playerBody) {
      this.aoeCasting.elapsed += delta / 1000;
      if (this.aoeCasting.elapsed >= this.aoeCasting.duration) {
        this.executeAoeSpell();
      }
    }

    // Захват
    // Тикаем дебафф смерти
    if (this.sphere.deathDebuffRemaining > 0) {
      this.sphere.deathDebuffRemaining = Math.max(0, this.sphere.deathDebuffRemaining - delta / 1000);
    }

    if (this.captureProcess && this.captureProcess.state === CaptureState.Casting) {
      // Захват требует стоять на месте — движение (WASD/клик) прерывает.
      if (this.playerBody?.isMoving) {
        this.captureProcess = interruptCapture(this.captureProcess);
        this.captureTarget = null;
        this.events.emit('capture-interrupt');
        this.showMessage(lt('Захват прерван — нужно стоять на месте', 'Capture interrupted — you must stand still'));
      } else {
        this.captureProcess = updateCapture(this.captureProcess, delta);

        if (this.captureProcess.state === CaptureState.Success && this.captureTarget) {
          this.completeCaptureCreature(this.captureTarget);
          this.captureProcess = null;
          this.captureTarget = null;
        }
      }
    }

    // Респаун
    this.tickRespawn(delta);

    // Body quest: survive timers + waypoint proximity
    if (this.bodyQuestTracker.getActive() && !this.bodyQuestTracker.getActive()!.completed) {
      const wasComplete = this.bodyQuestTracker.isComplete();
      this.bodyQuestTracker.update(delta / 1000);
      if (!wasComplete && this.bodyQuestTracker.isComplete()) {
        this.onBodyQuestComplete();
      }
      this.checkWaypointProximity();
    }

    // Точки миникарты пересобираются раз в 200мс — пересборка каждый кадр
    // плодила сотни короткоживущих объектов (GC-паузы при ~250 мобах).
    this.mapDotsTimer -= delta;
    let mapDots = this.cachedMapDots;
    if (!mapDots || this.mapDotsTimer <= 0) {
      this.mapDotsTimer = 200;
      mapDots = {
        nodes: this.resourceNodes.map(n => ({ x: n.x, y: n.y, depleted: n.depleted })),
        quests: [...this.questObjects, ...this.bodyQuestObjects]
          .filter(q => !q.used).map(q => ({ x: q.x, y: q.y })),
        creatures: this.creatures.map(c => ({
          x: c.x, y: c.y,
          isDead: c.isDead,
          isPassive: c.definition.type !== BodyType.Combat,
          isAggro: c.aiState === 'chase' || c.aiState === 'attack',
        })),
      };
      this.cachedMapDots = mapDots;
    }

    // Передаём данные в UIScene
    this.events.emit('update-ui', {
      sphere: this.sphere,
      body: this.playerBody,
      capture: this.captureProcess,
      target: this.selectedTarget,
      starterTarget: this.selectedStarterDef,
      quests: this.questTracker.getAll(),
      deathDebuff: this.sphere.deathDebuffRemaining,
      activeEnchantId: this.sphere.activeEnchant?.id ?? null,
      inCombat: this.isInCombat,
      aoeCast: this.labRitual === 'channeling'
        ? { elapsed: 6 - this.labRitualTimer, duration: 6, name: lt('Закрытие разрыва', 'Sealing the rift') }
        : this.aoeCasting
        ? { elapsed: this.aoeCasting.elapsed, duration: this.aoeCasting.duration, name: lt(this.aoeCasting.spell.nameRu, this.aoeCasting.spell.nameEn) }
        : this.gatheringNode
          ? { elapsed: 3 - this.gatheringTimer, duration: 3, name: `⛏ ${lt(this.gatheringNode.def.nameRu, this.gatheringNode.def.nameEn)}` }
          : (this.craftingRecipe && this.craftingTimer > 0)
            ? { elapsed: this.craftingRecipe.craftTime - this.craftingTimer, duration: this.craftingRecipe.craftTime, name: `⚒ ${lt(this.craftingRecipe.nameRu, this.craftingRecipe.nameEn)}` }
            : null,
      playerPos: this.playerBody ? { x: this.playerBody.x, y: this.playerBody.y }
        : this.sphere.inBody ? null : { x: this.sphere.x, y: this.sphere.y },
      mapDotNpcs: (this.cachedNpcDots ??= this.worldNPCs.map(n => ({ x: n.x, y: n.y }))),
      mapDotNodes: mapDots.nodes,
      mapDotQuests: mapDots.quests,
      creatures: mapDots.creatures,
      inventory: this.sphere.inventory,
      killCounts: this.sphere.killCounts,
      unlockedAchievements: this.sphere.unlockedAchievements,
      trackedQuestIds: this.sphere.trackedQuestIds,
      weaponSchool: this.getWeaponSchool(),
      bodyQuest: this.bodyQuestTracker.getActive(),
    });
  }

  // ─── Карта ────────────────────────────────────────────

  private buildMap() {
    const zone = this.currentZone;
    const wt = zone.widthTiles;
    const ht = zone.heightTiles;
    const biomes = zone.biomes;

    // Tileset indices (PNG 5×2, firstgid=1):
    //   1 grass · 2 stone · 3 dirt · 4 sand · 5 water
    //   6 ash   · 7 bog   · 8 cave · 9 snow · 10 rock
    const STONE = 2;
    const biomeTile = (id: string): number => {
      switch (id) {
        case 'eshworth':   return 1;
        case 'waldmar':    return 1;
        case 'trade_road': return 3;
        case 'cave':       return 8;
        default:           return 1;
      }
    };
    const zoneDefaultTile = (): number => {
      switch (zone.id) {
        case 'fire':  return 6;
        case 'water': return 7;
        case 'earth': return 10;
        case 'wind':  return 9;
        case 'lab':   return STONE; // лаборатория — каменный/металлический пол
        default:      return 1;
      }
    };

    // Build tile data per biome/zone. Single GPU-batched TilemapLayer.
    const data: number[][] = [];
    // Для village заменяем дефолтную траву на empty (0) — её нарисует CraftPix TileSprite.
    const baseTile = zone.id === 'village' ? 0 : zoneDefaultTile();
    for (let ty = 0; ty < ht; ty++) {
      data.push(new Array(wt).fill(baseTile));
    }

    // Biome overrides (village has them)
    if (biomes) {
      for (const b of biomes) {
        let tile = biomeTile(b.id);
        // В village прозрачный грас-биом (eshworth/waldmar) — CraftPix видно сквозь.
        if (zone.id === 'village' && (b.id === 'eshworth' || b.id === 'waldmar' || b.id === 'trade_road')) tile = 0;
        const tx1 = Math.max(0, Math.floor(b.bounds.x1 / TILE_SIZE));
        const ty1 = Math.max(0, Math.floor(b.bounds.y1 / TILE_SIZE));
        const tx2 = Math.min(wt, Math.ceil(b.bounds.x2 / TILE_SIZE));
        const ty2 = Math.min(ht, Math.ceil(b.bounds.y2 / TILE_SIZE));
        for (let ty = ty1; ty < ty2; ty++) {
          for (let tx = tx1; tx < tx2; tx++) data[ty][tx] = tile;
        }
      }
    }

    // Реки убраны — пока без воды.

    // Safe zones: поверхность (каменный пол) убрана — визуал только через CraftPix-редактор.
    // Сама логика safe zone (респавн, мобы не заходят) остаётся через safeBoundsArr.

    const map = this.make.tilemap({ data, tileWidth: TILE_SIZE, tileHeight: TILE_SIZE });
    const tileset = map.addTilesetImage('tileset_world', undefined, TILE_SIZE, TILE_SIZE, 0, 0, 1);
    const layer = tileset ? map.createLayer(0, tileset, 0, 0) : null;
    if (layer) layer.setDepth(-10);
    this.mapLayer = layer;

    // CraftPix grass ковёр для village (единый TileSprite = 1 GameObject, GPU-батчинг).
    // Глубина -11 (под tilemap): камень safe zone и биом пещеры видны сверху.
    if (zone.id === 'village' && this.textures.exists('cp_ground_43')) {
      const zw = wt * TILE_SIZE;
      const zh = ht * TILE_SIZE;
      const ts = this.add.tileSprite(0, 0, zw, zh, 'cp_ground_43')
        .setOrigin(0, 0).setDepth(-11);
      ts.tileScaleX = 0.3;
      ts.tileScaleY = 0.3;
    }

    // Emit minimap terrain colors for UIScene
    const TILE_COLORS: Record<number, number> = {
      1: 0x4a7a3a, 2: 0x888888, 3: 0x8b6b3a, 4: 0xc8b870,
      5: 0x3366aa, 6: 0x5a3020, 7: 0x2a5530, 8: 0x3a2a1a,
      9: 0xddddee, 10: 0x7a6a50,
    };
    const mmW = Math.min(wt, 180);
    const mmH = Math.min(ht, 120);
    const mmColors: number[] = new Array(mmW * mmH);
    for (let my = 0; my < mmH; my++) {
      const ty = Math.floor(my * ht / mmH);
      for (let mx = 0; mx < mmW; mx++) {
        const tx = Math.floor(mx * wt / mmW);
        mmColors[my * mmW + mx] = TILE_COLORS[data[ty][tx]] ?? 0x4a7a3a;
      }
    }
    this.events.emit('minimap-terrain', { w: mmW, h: mmH, colors: mmColors, mapW: wt * TILE_SIZE, mapH: ht * TILE_SIZE });

    // Камни возрождения
    const respawnPoints = zone.safeZones
      ? zone.safeZones.map(sz => sz.respawnPoint)
      : [zone.respawnPoint];
    for (const rp of respawnPoints) {
      this.add.image(rp.x, rp.y - 80, 'respawn_stone');
      this.add.text(rp.x, rp.y - 106, t('misc.respawn_stone'), {
        fontSize: '11px', color: '#aaaaee', align: 'center',
      }).setOrigin(0.5);
    }

    // Название зоны
    this.add.text(wt * TILE_SIZE / 2, 40, lt(zone.nameRu, zone.nameEn), {
      fontSize: '16px', color: '#ffffff', align: 'center',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    // Подписи выходов
    for (const exit of zone.exits) {
      const targetZone = ALL_ZONES[exit.targetZone];
      if (!targetZone) continue;
      let ex = 0, ey = 0;
      if (exit.edge === 'north') { ex = wt * TILE_SIZE / 2; ey = 20; }
      if (exit.edge === 'south') { ex = wt * TILE_SIZE / 2; ey = ht * TILE_SIZE - 20; }
      if (exit.edge === 'east')  { ex = wt * TILE_SIZE - 20; ey = ht * TILE_SIZE / 2; }
      if (exit.edge === 'west')  { ex = 20; ey = ht * TILE_SIZE / 2; }
      const arrow = exit.edge === 'north' ? '↑' : exit.edge === 'south' ? '↓' : exit.edge === 'east' ? '→' : '←';
      this.add.text(ex, ey, `${arrow} ${lt(targetZone.nameRu, targetZone.nameEn)}`, {
        fontSize: '12px', color: '#ffdd88', align: 'center',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(100);
    }

    // ── Декорации ставятся вручную через редактор ( ` / F2 )
    // CraftPix-дороги из тайлов Ground (автоматические)
    if (zone.id === 'village') {
      this.spawnCraftPixRoads();
    }
  }

  /**
   * CraftPix-дороги: Ground 41 (горизонт.) / Ground 38 (вертик.) / Ground 32 (перекрёсток).
   */
  private spawnCraftPixRoads() {
    if (!this.textures.exists('cp_ground_41') || !this.textures.exists('cp_ground_38')) return;
    const zone = this.currentZone;
    const tileSize = 256 * 0.3; // ~77px при scale 0.3

    const layHorizRoad = (x1: number, y: number, x2: number) => {
      const step = tileSize * 0.95;
      const start = Math.min(x1, x2);
      const end = Math.max(x1, x2);
      for (let x = start; x < end; x += step) {
        this.add.image(x, y, 'cp_ground_41') // горизонтальная полоса земли
          .setScale(0.3)
          .setDepth(-3);
      }
    };
    const layVertRoad = (x: number, y1: number, y2: number) => {
      const step = tileSize * 0.95;
      const start = Math.min(y1, y2);
      const end = Math.max(y1, y2);
      for (let y = start; y < end; y += step) {
        this.add.image(x, y, 'cp_ground_38') // вертикальная полоса земли
          .setScale(0.3)
          .setDepth(-3);
      }
    };

    // Trade road между safe zones (Eshworth ↔ Waldmar)
    if (zone.safeZones && zone.safeZones.length >= 2) {
      const sz = zone.safeZones;
      layHorizRoad(sz[0].respawnPoint.x, sz[0].respawnPoint.y, sz[1].respawnPoint.x);
    }

    // Дороги от respawn point к каждому выходу
    const zw = zone.widthTiles * TILE_SIZE;
    const zh = zone.heightTiles * TILE_SIZE;
    const origin = zone.respawnPoint;
    const hasRoad = { north: false, south: false, east: false, west: false };
    for (const exit of zone.exits) {
      if (exit.edge === 'north') { layVertRoad(origin.x, 0, origin.y); hasRoad.north = true; }
      if (exit.edge === 'south') { layVertRoad(origin.x, origin.y, zh); hasRoad.south = true; }
      if (exit.edge === 'east')  { layHorizRoad(origin.x, origin.y, zw); hasRoad.east = true; }
      if (exit.edge === 'west')  { layHorizRoad(0, origin.y, origin.x); hasRoad.west = true; }
    }

    // Перекрёсток на respawn'е если есть хотя бы 1 горизонт + 1 вертикаль
    const hasHoriz = hasRoad.east || hasRoad.west || (zone.safeZones?.length ?? 0) >= 2;
    const hasVert = hasRoad.north || hasRoad.south;
    if (hasHoriz && hasVert && this.textures.exists('cp_ground_32')) {
      this.add.image(origin.x, origin.y, 'cp_ground_32')
        .setScale(0.3)
        .setDepth(-2); // чуть выше простых дорог чтобы перекрыть стык
    }
  }


  // ─── Стартовые тела ───────────────────────────────────

  private createStarterMarkers() {
    const animMap: Record<string, { idle: string; walk: string; base: string }> = {
      human_warrior: { idle: 'swordsman_idle_down', walk: 'swordsman_walk_down', base: 'swordsman' },
      human_archer:  { idle: 'archer_idle_down',    walk: 'archer_walk_down',    base: 'archer' },
      human_mage:    { idle: 'wizard_idle_down',     walk: 'wizard_walk_down',    base: 'wizard' },
    };

    STARTER_BODIES.forEach((def, i) => {
      const pos = this.starterPositions[i];
      const anim = animMap[def.id];

      const nameLabel = this.add.text(pos.x, pos.y + 36, lt(def.nameRu, def.name), {
        fontSize: '9px', color: '#cccccc', align: 'center',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
      const possessLabel = this.add.text(pos.x, pos.y + 48, t('misc.possess'), {
        fontSize: '7px', color: '#888866',
      }).setOrigin(0.5);

      if (anim && this.anims.exists(anim.idle)) {
        const sprite = this.add.sprite(pos.x, pos.y, anim.idle);
        sprite.play(anim.idle);
        sprite.setDisplaySize(48, 48);
        this.starterBodies.push({
          sprite, nameLabel, possessLabel,
          x: pos.x, y: pos.y,
          targetX: pos.x, targetY: pos.y,
          idleTimer: 1 + Math.random() * 3,
          walking: false,
          animBase: anim.base,
          facingDir: 'down',
        });
      } else {
        const marker = this.add.arc(pos.x, pos.y, 14, 0, 360, false, def.color, 0.7);
        this.starterBodies.push({
          sprite: marker, nameLabel, possessLabel,
          x: pos.x, y: pos.y,
          targetX: pos.x, targetY: pos.y,
          idleTimer: 1 + Math.random() * 3,
          walking: false,
          animBase: '',
          facingDir: 'down',
        });
      }
    });

  }

  private static readonly STARTER_WANDER_SPEED = 30;
  private static readonly STARTER_WANDER_RADIUS = 180;

  private updateStarterWander(delta: number) {
    const dt = delta / 1000;
    const sz = this.currentZone.safeZones?.[0] ?? this.currentZone.safeBounds;
    if (!sz) return;
    const pad = 40;

    const playDirectional = (sb: typeof this.starterBodies[number], state: 'idle' | 'walk') => {
      if (!sb.animBase) return;
      const spr = sb.sprite as Phaser.GameObjects.Sprite;
      const nativeKey = `${sb.animBase}_${state}_${sb.facingDir}`;
      let key = nativeKey;
      let flip = false;
      if (sb.facingDir === 'left') {
        const rightKey = `${sb.animBase}_${state}_right`;
        const leftAnim  = this.anims.get(nativeKey);
        const rightAnim = this.anims.get(rightKey);
        const sameTexture = !!leftAnim && !!rightAnim &&
          leftAnim.frames[0]?.textureKey === rightAnim.frames[0]?.textureKey;
        if (!this.anims.exists(nativeKey) || sameTexture) {
          key = rightKey;
          flip = true;
        }
      }
      spr.setFlipX(flip);
      if (spr.anims?.currentAnim?.key !== key && this.anims.exists(key)) spr.play(key);
    };

    for (const sb of this.starterBodies) {
      if (sb.walking) {
        const dx = sb.targetX - sb.x;
        const dy = sb.targetY - sb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 3) {
          sb.walking = false;
          sb.idleTimer = 2 + Math.random() * 4;
          playDirectional(sb, 'idle');
        } else {
          const step = GameScene.STARTER_WANDER_SPEED * dt;
          sb.x += (dx / dist) * step;
          sb.y += (dy / dist) * step;
          sb.sprite.setPosition(sb.x, sb.y);
          sb.nameLabel.setPosition(sb.x, sb.y + 36);
          sb.possessLabel.setPosition(sb.x, sb.y + 48);
          if (Math.abs(dx) > Math.abs(dy)) sb.facingDir = dx > 0 ? 'right' : 'left';
          else                              sb.facingDir = dy > 0 ? 'down'  : 'up';
          playDirectional(sb, 'walk');
        }
      } else {
        sb.idleTimer -= dt;
        if (sb.idleTimer <= 0) {
          const homePos = this.starterPositions[this.starterBodies.indexOf(sb)] ?? { x: sb.x, y: sb.y };
          const r = GameScene.STARTER_WANDER_RADIUS;
          let tx = homePos.x + (Math.random() - 0.5) * r * 2;
          let ty = homePos.y + (Math.random() - 0.5) * r * 2;
          tx = clamp(tx, sz.x1 + pad, sz.x2 - pad);
          ty = clamp(ty, sz.y1 + pad, sz.y2 - pad);
          sb.targetX = tx;
          sb.targetY = ty;
          sb.walking = true;
          const dx = tx - sb.x;
          const dy = ty - sb.y;
          if (Math.abs(dx) > Math.abs(dy)) sb.facingDir = dx > 0 ? 'right' : 'left';
          else                              sb.facingDir = dy > 0 ? 'down'  : 'up';
          playDirectional(sb, 'walk');
        }
      }
    }
  }

  /** Попытка захватить стартовое тело (в астрале, нажатие E) */
  private tryPossessStarter(): boolean {
    for (let i = 0; i < this.starterBodies.length; i++) {
      const sb = this.starterBodies[i];
      const dist = distance(this.sphere.x, this.sphere.y, sb.x, sb.y);
      if (dist < CAPTURE_RANGE) {
        this.possessStarterBody(i);
        return true;
      }
    }
    return false;
  }

  /** Попытка захватить существо рядом (в астрале, нажатие E):
   *  - Пассивное (Type 1): захват живого
   *  - Боевое (Type 2): только мёртвого
   */
  private tryCaptureDead(): boolean {
    if (this.captureProcess?.state === CaptureState.Casting) return false;

    // Позиция: если в теле — от тела, если в астрале — от Сферы
    const px = this.playerBody?.x ?? this.sphere.x;
    const py = this.playerBody?.y ?? this.sphere.y;

    for (const creature of this.creatures) {
      // Твари Пустоты полуматериальны — тела не остаётся; Машина — не тело.
      if (creature.definition.voidResistant || creature.definition.immobile) continue;
      // Passive (hare/grouse) — capturable alive when out of combat.
      // Fleeing (deer/merchant) and Combat — must be killed first.
      const canCapturAlive = creature.definition.type === BodyType.Passive;
      const eligible = canCapturAlive ? !this.isInCombat : creature.isDead;
      if (!eligible) continue;

      const dist = distance(px, py, creature.x, creature.y);
      if (dist < CAPTURE_RANGE) {
        this.captureProcess = startCapture(creature.definition.id);
        this.captureTarget = creature;
        this.events.emit('capture-start', lt(creature.definition.nameRu, creature.definition.name));
        return true;
      }
    }
    return false;
  }

  private possessStarterBody(index: number) {
    const def = STARTER_BODIES[index];
    const sb = this.starterBodies[index];
    const pos = { x: sb.x, y: sb.y };
    this.spawnCaptureFlash(pos.x, pos.y, () => {
      this.playerBody = new Body(this, pos.x, pos.y, def, this.getEquippedStats());
      this.playerBody.mapW = this.currentZone.widthTiles * TILE_SIZE;
      this.playerBody.mapH = this.currentZone.heightTiles * TILE_SIZE;
      this.playerBody.wallCheckFn = (x, y) => this.isBlockedByWall(x, y, true);
      this.playerBody.possess(this);
      this.fillBodySlots(this.playerBody);
      this.sphere.enterBody();
      this.sphere.lastBodyId = def.id;
    });
  }

  /** Базовая атака слота 0 — динамически по оружию в руках (тултип должен
   *  совпадать с реальным ударом: кастеты → Strike/melee, лук → Shot/ranged,
   *  посох → Staff Strike/magic). Слот 0 всегда вызывает handleAttack, так что
   *  этот AbilityDef — только подпись/иконка. */
  private basicAttackDef(body: Body): import('../types/abilities').AbilityDef {
    const w = body.weapon; // следует за активным/природным оружием
    const dt = weaponDamageType(w.type);
    // Когти (зверь/элементаль ИЛИ безоружный гуманоид) — Когти/Стихия;
    // иначе по оружию в руках.
    const nameRu = !body.usesInnateAttack
      ? (dt === 'magic' ? 'Staff Strike' : dt === 'ranged' ? 'Shot' : 'Strike')
      : (dt === 'magic' ? t('body.element') : t('body.claws'));
    const description = dt === 'magic' ? lt('Магическая атака', 'Magic attack')
      : dt === 'ranged' ? lt('Дальняя атака', 'Ranged attack') : lt('Ближняя атака', 'Melee attack');
    return {
      id: 'basic_attack', nameRu, damageType: dt,
      cooldown: w.cooldown, manaCost: 0, range: w.range, baseDamage: 0, description,
    };
  }

  /** Заполняет слоты умений тела: слот 1 — базовая атака, слоты 2+ — заклинания */
  private fillBodySlots(body: Body) {
    // Слот 0 — базовая атака по оружию в руках (динамически)
    body.abilitySlots[0].ability = this.basicAttackDef(body);

    // Очищаем остальные слоты
    for (let i = 1; i < 8; i++) body.abilitySlots[i].ability = null;

    // Не-гуманоиды (звери/элементали): из оружейного — только базовая атака
    // (слот 0, Когти/Стихия) + родной скил (слот 1). Оружейные слоты 2-4
    // заблокированы. НО нейтральные скилы (5-7) — любые, что знает Сфера
    // (Ускорение кролика и т.п. работают в любом теле).
    if (!body.definition.canUseAllSpells) {
      const sig = body.definition.signatureSpell;
      if (sig) {
        const learned = this.sphere.learnedSpells.find(s => s.id === sig.id);
        if (learned) body.abilitySlots[1].ability = learned;
      }
      this.fillNeutralSlots(body);
      return;
    }

    // Гуманоиды: слоты 0-4 = оружейные, слоты 5-7 = нейтральные
    const equip = this.sphere.equipment;
    const activeWeaponId = this.sphere.activeWeaponSlot === 0 ? equip.weapon : equip.weapon2;
    const activeWeaponType = activeWeaponId ? getItemWeaponType(activeWeaponId) : undefined;
    // Умение подходит активному оружию, если у него нет requiredWeapons
    // (нейтральное/универсальное) ИЛИ текущее оружие входит в список.
    const fitsWeapon = (sp: import('../types/abilities').AbilityDef | null) =>
      !sp || !sp.requiredWeapons || (activeWeaponType !== undefined && sp.requiredWeapons.includes(activeWeaponType));

    // Слоты 0-4: загружаем сохранённую конфигурацию для текущего оружия
    if (activeWeaponId && this.sphere.weaponSlotConfigs[activeWeaponId]) {
      const config = this.sphere.weaponSlotConfigs[activeWeaponId];
      for (let i = 0; i < 5; i++) {
        const spellId = config[i];
        const resolved = spellId
          ? (this.sphere.learnedSpells.find(s => s.id === spellId) ?? BASIC_ATTACKS[body.definition.id] ?? null)
          : null;
        // Чужие оружейные умения в слот не пускаем (Hook на луке и т.п.).
        body.abilitySlots[i].ability = fitsWeapon(resolved) ? resolved : null;
      }
    } else {
      // Автозаполнение слотов 0-4: базовая атака + T1/T2/T3 оружия
      body.abilitySlots[0].ability = BASIC_ATTACKS[body.definition.id] ?? BASIC_ATTACKS['default'];
      const sig = body.definition.signatureSpell;
      if (sig) {
        const learned = this.sphere.learnedSpells.find(s => s.id === sig.id);
        if (learned) body.abilitySlots[1].ability = learned;
      }
    }

    this.fillNeutralSlots(body);
  }

  /** Слоты 5-7 — нейтральные (не оружейные) скилы Сферы. Доступны в ЛЮБОМ теле,
   *  включая зверей/элементалей: Ускорение/Рывок/Лечение и т.п. */
  private fillNeutralSlots(body: Body) {
    const neutralSlotIds = this.sphere.savedSlotIds.slice(5);
    for (let i = 0; i < 3; i++) {
      const savedId = neutralSlotIds[i];
      if (savedId) {
        body.abilitySlots[5 + i].ability = this.sphere.learnedSpells.find(s => s.id === savedId) ?? null;
      } else if (i === 0) {
        // Auto-fill first neutral with Acceleration if learned
        body.abilitySlots[5].ability = this.sphere.learnedSpells.find(s => s.id === 'acceleration') ?? null;
      }
    }
  }

  // ─── Выход из тела ────────────────────────────────────

  private getBiomeTint(x: number, y: number): number | undefined {
    const biomes = this.currentZone.biomes;
    if (biomes) {
      for (const b of biomes) {
        if (b.tint && x >= b.bounds.x1 && x <= b.bounds.x2 && y >= b.bounds.y1 && y <= b.bounds.y2) {
          return b.tint;
        }
      }
    }
    return this.currentZone.tint;
  }

  private getBiomeId(x: number, y: number): string | undefined {
    const biomes = this.currentZone.biomes;
    if (!biomes) return undefined;
    for (const b of biomes) {
      if (x >= b.bounds.x1 && x <= b.bounds.x2 && y >= b.bounds.y1 && y <= b.bounds.y2) {
        return b.id;
      }
    }
    return undefined;
  }

  private getNearestRespawn(x: number, y: number): { x: number; y: number } {
    const zones = this.currentZone.safeZones;
    if (!zones || zones.length === 0) return this.currentZone.respawnPoint;
    let best = zones[0].respawnPoint;
    let bestDist = Infinity;
    for (const sz of zones) {
      const dx = sz.respawnPoint.x - x, dy = sz.respawnPoint.y - y;
      const d = dx * dx + dy * dy;
      if (d < bestDist) { bestDist = d; best = sz.respawnPoint; }
    }
    return best;
  }

  private isInSafeZone(x: number, y: number): boolean {
    const zones = this.currentZone.safeZones;
    if (zones && zones.length > 0) {
      return zones.some(sz => x >= sz.x1 && x <= sz.x2 && y >= sz.y1 && y <= sz.y2);
    }
    const sb = this.currentZone.safeBounds;
    if (!sb) return false;
    return x >= sb.x1 && x <= sb.x2 && y >= sb.y1 && y <= sb.y2;
  }

  private exitBody() {
    if (!this.playerBody) return;

    const x = this.playerBody.x;
    const y = this.playerBody.y;

    // Добровольный выход из тела — только в безопасной зоне
    if (!this.isInSafeZone(x, y)) {
      this.events.emit('log', { text: t('body.safe_zone_only'), color: '#ff6666' });
      return;
    }

    this.bodyQuestTracker.clear();
    this.clearBodyQuestObjects();
    this.playerBody.release();
    this.playerBody.destroy();
    this.playerBody = null;

    this.sphere.enterAstral(x, y);
  }

  // ─── Спавн мобов ─────────────────────────────────────

  private spawnCreatures() {
    const spawnGroup = (
      groups: { x: number; y: number; creatureId: string; count: number }[],
      jitter = 100,
    ) => {
      for (const group of groups) {
        const def = CREATURE_DB[group.creatureId];
        if (!def) continue;
        for (let i = 0; i < group.count; i++) {
          const jx = group.x + (Math.random() - 0.5) * jitter;
          const jy = group.y + (Math.random() - 0.5) * jitter;
          this.creatures.push(new Creature(this, jx, jy, def));
        }
      }
    };

    // Спавним мобов текущей зоны (из конфига)
    spawnGroup(this.currentZone.spawnGroups);

    // Питч-демо: дополнительный Игнис сразу слева от деревни — показать босса
    // без пробежки через всю карту. В обычной игре его здесь нет.
    if (this.pitchMode && this.currentZone.id === 'village') {
      const def = CREATURE_DB['ignis'];
      if (def) this.creatures.push(new Creature(this, 2350, 2800, def));
    }

    // Разброс: существа рандомно по всей карте, мимо сейф-зон (ветераны и т.п.)
    {
      const mapW = this.currentZone.widthTiles * TILE_SIZE;
      const mapH = this.currentZone.heightTiles * TILE_SIZE;
      for (const sc of this.currentZone.scatterSpawns ?? []) {
        const def = CREATURE_DB[sc.creatureId];
        if (!def) continue;
        for (let i = 0; i < sc.count; i++) {
          let x = 0, y = 0;
          for (let attempt = 0; attempt < 20; attempt++) {
            x = 80 + Math.random() * (mapW - 160);
            y = 80 + Math.random() * (mapH - 160);
            if (!this.isInSafeZone(x, y)) break;
          }
          this.creatures.push(new Creature(this, x, y, def));
        }
      }
    }

    // Очистка стартовой зоны (только village/Эшворт): рядом со стартовой
    // точкой возрождения не должно быть этих существ, чтобы новичок не попадал
    // сразу в замес. Они остаются дальше по карте (для квестов/контента).
    // ВАЖНО: фильтр идёт ДО спавна мобов из редактора — ручные правки игрока
    // (mob_* объекты) не удаляются, можно добавить кого угодно у старта.
    if (this.currentZone.id === 'village') {
      const start = this.currentZone.respawnPoint;
      const isCleared = (id: string) =>
        id === 'fox' || id === 'orc' || id === 'shaman' ||
        id === 'goblin_veteran' || id === 'pebble' || id.startsWith('wolf');
      this.creatures = this.creatures.filter((c) => {
        if (!isCleared(c.definition.id)) return true;
        const inRadius = Math.hypot(c.x - start.x, c.y - start.y) < START_CLEAR_RADIUS;
        if (inRadius) { c.destroy(); return false; }
        return true;
      });
    }

    // Спавним мобов из редактора карт (mob_* объекты) — после очистки, чтобы
    // ручные размещения игрока всегда сохранялись.
    if (this.mapEditor) {
      for (const ms of this.mapEditor.getMobSpawns()) {
        const def = CREATURE_DB[ms.creatureId];
        if (!def) continue;
        this.creatures.push(new Creature(this, ms.x, ms.y, def));
      }
    }

    // Внутри сейф-зон (городов за забором) мобы не спавнятся вообще — убираем
    // всех (из конфига/разброса/редактора), кто оказался в любой сейф-зоне.
    // ДО спавна караванов, чтобы их охрану/мерчанта (стартуют у Вальдмара) не задеть.
    this.creatures = this.creatures.filter((c) => {
      if (this.isInSafeZone(c.x, c.y)) { c.destroy(); return false; }
      return true;
    });

    // Караваны (живые группы: телега + охранники + мерчант + рейдеры, цикл A→B).
    // Передаём колбэки на ТЕКУЩИЙ this.creatures (он переприсваивается фильтром
    // в нескольких местах), чтобы караван надёжно добавлял/удалял своих существ.
    for (const cs of this.currentZone.caravans ?? []) {
      this.caravans.push(new Caravan(
        this,
        cs.start.x, cs.start.y,
        cs.end.x,   cs.end.y,
        cs.speed ?? 36,
        cs.guardCount ?? 2,
        (c) => { this.creatures.push(c); },
        (c) => { this.creatures = this.creatures.filter(x => x !== c); },
      ));
    }

    // Подключаем проверку стен и сейф-зоны ко всем существам
    for (const c of this.creatures) this.applyCreatureEnv(c);
  }

  /** Подключает к существу проверку стен и сейф-зон (мобы не заходят в сейф-зону). */
  private applyCreatureEnv(c: Creature) {
    c.wallCheckFn = (x: number, y: number) => this.isBlockedByWall(x, y, false);
    c.safeBoundsArr = this.currentZone.safeZones ?? (this.currentZone.safeBounds ? [this.currentZone.safeBounds] : []);
    // Цветные всплывающие числа от DoT (огонь — красный, яд — фиолетовый, кровь — алый).
    c.onDotTick = (x, y, amount, kind) => {
      this.damageTexts.push(new DamageText(this, x, y, amount, false, false, undefined, kind));
    };
  }

  // ─── Ресурсные ноды, верстаки, NPC ────────────────────

  private spawnWorldObjects() {
    const zone = this.currentZone;

    // ── Локальные хелперы рендера (общие для zone-массивов и editor-placed) ──
    const addResourceNode = (x: number, y: number, nodeId: string) => {
      const def = RESOURCE_NODES[nodeId];
      if (!def) return;
      const container = this.add.container(x, y).setDepth(3);
      // Тело ноды: PNG-спрайт (куст/дерево) если задан и загружен, иначе кружок.
      let body: Phaser.GameObjects.GameObject;
      if (def.sprite && this.textures.exists(def.sprite)) {
        const img = this.add.image(0, 0, def.sprite).setOrigin(0.5, 0.9);
        img.setScale((40 / img.height));
        body = img;
      } else {
        body = this.add.circle(0, 0, 12, def.color, 0.7);
      }
      const label = this.add.text(0, -20, lt(def.nameRu, def.nameEn), { fontSize: '8px', color: '#dddddd', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
      const eKey = this.add.text(0, 16, '[E]', { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
      container.add([body, label, eKey]);
      this.resourceNodes.push({ x, y, def, gfx: container, cooldown: 0, depleted: false });
    };

    const addWorkbench = (x: number, y: number, type: string, nameRu: string) => {
      const container = this.add.container(x, y).setDepth(5);
      const col = WORKBENCH_COLORS[type] ?? { fill: 0x664422, stroke: 0x996633 };
      const rect = this.add.rectangle(0, 0, 28, 20, col.fill, 0.85).setStrokeStyle(2, col.stroke);
      const label = this.add.text(0, -18, nameRu, { fontSize: '8px', color: '#ffdd88', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
      const icon = this.add.text(0, 0, '⚒', { fontSize: '14px' }).setOrigin(0.5);
      const eKey = this.add.text(0, 16, '[E]', { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
      container.add([rect, label, icon, eKey]);
      this.workbenches.push({ x, y, type, nameRu, gfx: container });
    };

    // Resource nodes (из конфига зоны)
    for (const ns of zone.resourceNodes ?? []) {
      addResourceNode(ns.x, ns.y, ns.nodeId);
    }

    // Workbenches (из конфига зоны)
    for (const wb of zone.workbenches ?? []) {
      addWorkbench(wb.x, wb.y, wb.type, lt(wb.nameRu, wb.nameEn));
    }

    // Ноды и верстаки, расставленные в редакторе карт (node_* / wb_* объекты).
    if (this.mapEditor) {
      for (const ns of this.mapEditor.getResourceNodeSpawns()) {
        addResourceNode(ns.x, ns.y, ns.nodeId);
      }
      for (const wb of this.mapEditor.getWorkbenchSpawns()) {
        addWorkbench(wb.x, wb.y, wb.type, lt(WORKBENCH_NAMES_RU[wb.type], WORKBENCH_NAMES_EN[wb.type]) || wb.type);
      }
      // Колодцы — лечебные точки в городе ([E] = полный HP/мана).
      for (const o of this.mapEditor.getObjects()) {
        if (o.key !== 'cp_well') continue;
        const hint = this.add.container(o.x, o.y).setDepth(6);
        const label = this.add.text(0, -34, lt('💧 Колодец', '💧 Well'), { fontSize: '8px', color: '#aaddff', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
        const eKey = this.add.text(0, -22, '[E]', { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
        hint.add([label, eKey]);
      }
    }

    // NPCs
    for (const npc of zone.npcs ?? []) {
      const container = this.add.container(npc.x, npc.y).setDepth(5);
      const circle = this.add.circle(0, 0, 12, 0xffdd55, 0.9);
      const glow = this.add.circle(0, 0, 16, 0xffaa00, 0.3);
      const label = this.add.text(0, -22, lt(npc.nameRu, npc.nameEn), { fontSize: '9px', color: '#ffdd88', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
      const eLabel = npc.role === 'vendor' || npc.role === 'weapon_vendor' ? t('misc.shop') : t('misc.talk');
      const eKey = this.add.text(0, 18, eLabel, { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
      const questMarker = this.add.text(12, -28, '!', { fontSize: '14px', color: '#ffff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setVisible(false);
      container.add([glow, circle, label, eKey, questMarker]);
      this.worldNPCs.push({ x: npc.x, y: npc.y, id: npc.id, nameRu: lt(npc.nameRu, npc.nameEn), role: npc.role, gfx: container, questMarker });
    }

    // Quest objects (waypoints, collectibles, destructibles)
    for (const qo of zone.questObjects ?? []) {
      const container = this.add.container(qo.x, qo.y).setDepth(3);
      const glow = this.add.circle(0, 0, 14, qo.color, 0.3);
      const icon = this.add.text(0, 0, qo.icon, { fontSize: '16px' }).setOrigin(0.5);
      const label = this.add.text(0, -22, lt(qo.nameRu, qo.nameEn), { fontSize: '8px', color: '#ddddcc', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
      const eKey = this.add.text(0, 18, '[E]', { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
      container.add([glow, icon, label, eKey]);
      this.tweens.add({ targets: glow, alpha: { from: 0.2, to: 0.5 }, duration: 1200, yoyo: true, repeat: -1 });
      this.questObjects.push({ x: qo.x, y: qo.y, objectId: qo.objectId, nameRu: lt(qo.nameRu, qo.nameEn), objType: qo.type, gfx: container, used: false });
    }
  }

  /** Try interact with nearby world object (E key) */
  private tryInteractWorldObject(): boolean {
    if (!this.playerBody) return false;
    const px = this.playerBody.x, py = this.playerBody.y;
    const interactRange = 80;

    // Resource nodes
    for (const node of this.resourceNodes) {
      if (node.depleted) continue;
      const d = distance(px, py, node.x, node.y);
      if (d < interactRange) {
        this.startGathering(node);
        return true;
      }
    }

    // Workbenches
    for (const wb of this.workbenches) {
      const d = distance(px, py, wb.x, wb.y);
      if (d < interactRange) {
        this.openCraftingUI(wb.type);
        return true;
      }
    }

    // Healing well — restores full HP + mana (placed map fixture `cp_well`).
    if (this.mapEditor) {
      for (const o of this.mapEditor.getObjects()) {
        if (o.key !== 'cp_well') continue;
        if (distance(px, py, o.x, o.y) < interactRange) {
          this.useHealingWell();
          return true;
        }
      }
    }

    // NPCs (vendor)
    for (const npc of this.worldNPCs) {
      const d = distance(px, py, npc.x, npc.y);
      if (d < interactRange) {
        if (npc.role === 'vendor') {
          this.openVendorUI();
        } else if (npc.role === 'weapon_vendor') {
          this.openWeaponVendor();
        } else if (npc.role === 'npc') {
          this.talkToNPC(npc.id);
        }
        return true;
      }
    }

    // Quest objects (collectible / destructible via [E])
    for (const qo of this.questObjects) {
      if (qo.used) continue;
      const d = distance(px, py, qo.x, qo.y);
      if (d < interactRange) {
        if (this.interactQuestObject(qo)) return true;
      }
    }

    return false;
  }

  /** Городской колодец: полностью восстанавливает HP и ману текущего тела. */
  private useHealingWell(): void {
    const b = this.playerBody;
    if (!b) return;
    if (b.currentHP >= b.maxHP && b.currentMana >= b.maxMana) {
      this.showMessage(lt('Колодец: здоровье и мана уже полны', 'Well: health and mana already full'));
      return;
    }
    const hpHealed = Math.round(b.maxHP - b.currentHP);
    const manaHealed = Math.round(b.maxMana - b.currentMana);
    b.currentHP = b.maxHP;
    b.currentMana = b.maxMana;
    if (hpHealed > 0) this.damageTexts.push(new DamageText(this, b.x, b.y - 10, hpHealed, false, false, `+${hpHealed} HP`, 'heal'));
    if (manaHealed > 0) this.damageTexts.push(new DamageText(this, b.x, b.y - 24, manaHealed, false, false, `+${manaHealed} MP`, 'mana'));
    sfxHeal();
    this.spawnAoeFlash(b.x, b.y, 50);
    this.showMessage(lt('Колодец восстановил здоровье и ману', 'The well restored your health and mana'));
  }

  private interactQuestObject(qo: typeof this.questObjects[0]): boolean {
    const bq = this.bodyQuestTracker.getActive();
    if (!bq || bq.completed) return false;

    let advanced = false;
    if (qo.objType === 'collectible') {
      advanced = this.bodyQuestTracker.onCollect(qo.objectId) || this.bodyQuestTracker.onSteal(qo.objectId);
    } else if (qo.objType === 'destructible') {
      advanced = this.bodyQuestTracker.onDestroy(qo.objectId);
    } else if (qo.objType === 'waypoint') {
      advanced = this.bodyQuestTracker.onReach(qo.objectId);
    }

    if (advanced) {
      qo.used = true;
      qo.gfx.setAlpha(0.3);
      sfxBuff();
      this.showMessage(`${qo.nameRu} ✓`);
      if (this.bodyQuestTracker.isComplete()) {
        this.onBodyQuestComplete();
      }
      return true;
    }
    return false;
  }

  private checkWaypointProximity(): void {
    if (!this.playerBody) return;
    const bq = this.bodyQuestTracker.getActive();
    if (!bq || bq.completed) return;

    const px = this.playerBody.x, py = this.playerBody.y;

    // Waypoint quest objects
    for (const qo of this.questObjects) {
      if (qo.used || qo.objType !== 'waypoint') continue;
      const d = distance(px, py, qo.x, qo.y);
      if (d < 60) {
        const advanced = this.bodyQuestTracker.onReach(qo.objectId);
        if (advanced) {
          qo.used = true;
          qo.gfx.setAlpha(0.3);
          sfxBuff();
          this.showMessage(`${qo.nameRu} ✓`);
          if (this.bodyQuestTracker.isComplete()) {
            this.onBodyQuestComplete();
          }
        }
      }
    }

    // Meditate objectives — tick timer while inside the circle, relocate on exit.
    this.checkMeditation(bq, px, py);

    // Proximity-reach: reach objectives targeting a live creature (e.g. wounded_human)
    for (const obj of bq.def.objectives) {
      if (obj.type !== 'reach' || !obj.targetId) continue;
      const idx = bq.def.objectives.indexOf(obj);
      if (bq.counts[idx] >= obj.count) continue;
      const target = this.creatures.find(c => c.definition.id === obj.targetId && !c.isDead);
      if (!target) continue;
      if (distance(px, py, target.x, target.y) < 80) {
        const advanced = this.bodyQuestTracker.onReach(obj.targetId);
        if (advanced) {
          sfxBuff();
          this.showMessage(`${lt(obj.targetNameRu, obj.targetNameEn)} ✓`);
          if (this.bodyQuestTracker.isComplete()) {
            this.onBodyQuestComplete();
          }
        }
      }
    }

    // Protect zone: draw circle + fail if player leaves
    this.protectZoneGfx.clear().setVisible(false);
    for (const obj of bq.def.objectives) {
      if (obj.type !== 'protect' || !obj.targetId || !obj.zoneRadius) continue;
      const target = this.creatures.find(c => c.definition.id === obj.targetId && !c.isDead);
      if (!target) continue;
      const isActive = this.bodyQuestTracker.isProtectActive(obj.targetId);
      // Draw circle whenever target is alive and protect not yet done
      const idx = bq.def.objectives.indexOf(obj);
      const done = bq.counts[idx] >= obj.count;
      if (done) continue;
      // Pulsing dashed-ish circle
      const pulse = 0.35 + 0.15 * Math.sin(this.time.now / 250);
      this.protectZoneGfx.setVisible(true);
      this.protectZoneGfx.lineStyle(2, isActive ? 0x88ddaa : 0xaaaa66, pulse);
      this.protectZoneGfx.strokeCircle(target.x, target.y, obj.zoneRadius);
      this.protectZoneGfx.lineStyle(1, isActive ? 0x88ddaa : 0xaaaa66, pulse * 0.5);
      this.protectZoneGfx.strokeCircle(target.x, target.y, obj.zoneRadius - 4);

      // Fail check only after reach is done (timer ticking)
      if (isActive && distance(px, py, target.x, target.y) > obj.zoneRadius) {
        const reset = this.bodyQuestTracker.failProtect(obj.targetId);
        if (reset) this.showMessage(lt('Ты слишком далеко. Раненый остался без защиты — вернись и начни заново.', 'Too far away. The wounded one is unprotected — return and start over.'));
      }
    }
  }

  /**
   * Meditate objectives: while player stays within the circle around a waypoint
   * (default radius 100), tick the meditate timer. If player leaves, relocate
   * the waypoint to a nearby random spot and reset the timer — gives the player
   * a way to evade hostile mobs without giving up the quest.
   */
  private checkMeditation(bq: NonNullable<ReturnType<BodyQuestTracker['getActive']>>, px: number, py: number) {
    for (const obj of bq.def.objectives) {
      if (obj.type !== 'meditate' || !obj.targetId) continue;
      const idx = bq.def.objectives.indexOf(obj);
      if (bq.counts[idx] >= obj.count) continue;
      const radius = obj.meditateRadius ?? 100;

      const qo = this.bodyQuestObjects.find(o => o.objectId === obj.targetId && !o.used);
      if (!qo) continue;

      const dist = distance(px, py, qo.x, qo.y);
      if (dist <= radius) {
        // Inside the circle — tick timer
        const completed = this.bodyQuestTracker.tickMeditate(obj.targetId, this.game.loop.delta / 1000);
        if (completed) {
          qo.used = true;
          qo.gfx.setAlpha(0.3);
          sfxBuff();
          this.showMessage(`${qo.nameRu} ✓`);
          if (this.bodyQuestTracker.isComplete()) {
            this.onBodyQuestComplete();
          }
        }
      } else if (dist > radius + 200) {
        // Player is far away — relocate waypoint nearby and reset timer
        const angle = Math.random() * Math.PI * 2;
        const moveDist = 250 + Math.random() * 200;
        const mapW = this.currentZone.widthTiles * TILE_SIZE;
        const mapH = this.currentZone.heightTiles * TILE_SIZE;
        const nx = Math.max(40, Math.min(mapW - 40, px + Math.cos(angle) * moveDist));
        const ny = Math.max(40, Math.min(mapH - 40, py + Math.sin(angle) * moveDist));
        qo.x = nx; qo.y = ny;
        qo.gfx.setPosition(nx, ny);
        this.bodyQuestTracker.resetMeditate(obj.targetId);
      }
    }
  }

  /** Create exit arrows — large arrows at zone edges, hidden by default */
  private createExitArrows() {
    const zw = this.currentZone.widthTiles * TILE_SIZE;
    const zh = this.currentZone.heightTiles * TILE_SIZE;
    for (const exit of this.currentZone.exits) {
      const target = ALL_ZONES[exit.targetZone];
      if (!target) continue;
      let x = zw / 2, y = zh / 2;
      let arrow = '';
      if (exit.edge === 'north') { x = zw / 2; y = 60; arrow = '▲'; }
      if (exit.edge === 'south') { x = zw / 2; y = zh - 60; arrow = '▼'; }
      if (exit.edge === 'east')  { x = zw - 60; y = zh / 2; arrow = '▶'; }
      if (exit.edge === 'west')  { x = 60; y = zh / 2; arrow = '◀'; }
      const text = this.add.text(x, y, `${arrow} ${lt(target.nameRu, target.nameEn)}`, {
        fontSize: '18px', color: '#ffdd44',
        stroke: '#000000', strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
      }).setOrigin(0.5).setDepth(100).setAlpha(0);
      this.exitArrows.push({ text, edge: exit.edge });
    }
  }

  /** Show/hide exit arrows based on player distance to edge */
  /** Стрелка у края экрана, указывающая на ближайшую активную квест-цель,
   *  когда та за пределами видимой области. На экране — стрелка скрыта. */
  private updateQuestArrow() {
    if (!this.playerBody) { this.questArrow.setVisible(false); return; }
    let target: { x: number; y: number } | null = null;
    let best = Infinity;
    // Цели: объекты основной линии + объекты активного квеста тела (поляна оленя
    // и т.п.) — иначе в теле зверя непонятно, куда бежать.
    for (const q of [...this.questObjects, ...this.bodyQuestObjects]) {
      if (q.used) continue;
      const d = distance(this.playerBody.x, this.playerBody.y, q.x, q.y);
      if (d < best) { best = d; target = q; }
    }
    if (!target) { this.questArrow.setVisible(false); return; }

    const cam = this.cameras.main;
    if (cam.worldView.contains(target.x, target.y)) {
      this.questArrow.setVisible(false); // цель на экране — стрелка не нужна
      return;
    }
    const ang = Math.atan2(target.y - this.playerBody.y, target.x - this.playerBody.x);
    const W = cam.width, H = cam.height, m = 44;
    const cx = W / 2, cy = H / 2;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const tx = dx !== 0 ? (dx > 0 ? W - m - cx : m - cx) / dx : Infinity;
    const ty = dy !== 0 ? (dy > 0 ? H - m - cy : m - cy) / dy : Infinity;
    const t = Math.min(Math.abs(tx), Math.abs(ty));
    this.questArrow.setPosition(cx + dx * t, cy + dy * t).setRotation(ang).setVisible(true);
  }

  private updateExitArrows() {
    const entity = this.playerBody ?? this.sphere;
    if (!entity) return;
    const zw = this.currentZone.widthTiles * TILE_SIZE;
    const zh = this.currentZone.heightTiles * TILE_SIZE;
    const showDist = 400; // show when within 400px of edge

    for (const arrow of this.exitArrows) {
      let dist = 9999;
      if (arrow.edge === 'north') dist = entity.y;
      if (arrow.edge === 'south') dist = zh - entity.y;
      if (arrow.edge === 'east')  dist = zw - entity.x;
      if (arrow.edge === 'west')  dist = entity.x;

      const alpha = dist < showDist ? Math.min(1, (showDist - dist) / 200) : 0;
      arrow.text.setAlpha(alpha);
      if (alpha > 0) {
        arrow.text.setScale(1 + Math.sin(Date.now() * 0.003) * 0.1);
      }
    }
  }

  /**
   * Emit banner data for the nearest alive boss within 1200px of the player.
   * Emits `boss-state: null` when no boss qualifies. UIScene owns the render.
   */
  private _bossBannerId: string | null = null;
  private updateBossBanner() {
    const entity = this.playerBody ?? this.sphere;
    if (!entity) return;
    let nearest: Creature | null = null;
    let nearestDist = 1200;
    for (const c of this.creatures) {
      if (!c.definition.isBoss || c.isDead) continue;
      const d = distance(c.x, c.y, entity.x, entity.y);
      if (d < nearestDist) { nearest = c; nearestDist = d; }
    }
    if (nearest) {
      this._bossBannerId = nearest.definition.id;
      const hpFrac = Math.max(0, Math.min(1, nearest.currentHP / nearest.maxHP));
      this.events.emit('boss-state', {
        name: lt(nearest.definition.nameRu, nearest.definition.name),
        hp: Math.ceil(nearest.currentHP),
        maxHp: Math.ceil(nearest.maxHP),
        hpFrac,
      });
    } else if (this._bossBannerId !== null) {
      this._bossBannerId = null;
      this.events.emit('boss-state', null);
    }
  }

  /** Spawn loot bag on the ground */
  private spawnLootDrop(x: number, y: number, items: { itemId: string; qty: number }[]) {
    const container = this.add.container(x, y).setDepth(3);
    // Glowing bag
    const glow = this.add.circle(0, 0, 14, 0xffdd44, 0.3);
    const bag = this.add.circle(0, 0, 8, 0xddaa33, 0.9);
    const icon = this.add.text(0, 0, '💰', { fontSize: '12px' }).setOrigin(0.5);
    const label = this.add.text(0, -18, t('misc.loot'), { fontSize: '7px', color: '#ffdd88', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
    container.add([glow, bag, icon, label]);

    // Pulse animation
    this.tweens.add({
      targets: glow,
      scaleX: 1.3, scaleY: 1.3,
      alpha: 0.5,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.lootDrops.push({ x, y, items, gfx: container, timer: 60 }); // 60 sec before despawn
  }

  /** Try pickup loot near player */
  private tryPickupLoot(): boolean {
    if (!this.playerBody) return false;
    const px = this.playerBody.x, py = this.playerBody.y;
    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      const drop = this.lootDrops[i];
      if (distance(px, py, drop.x, drop.y) < 60) {
        // Pick up all items
        for (const { itemId, qty } of drop.items) {
          this.sphere.addItem(itemId, qty);
        }
        const lootStr = drop.items.map(d => `+${d.qty} ${ITEMS[d.itemId] ? lt(ITEMS[d.itemId].nameRu, ITEMS[d.itemId].nameEn) : d.itemId}`).join(', ');
        this.showMessage(lootStr);
        drop.gfx.destroy();
        this.lootDrops.splice(i, 1);
        this.persistState();
        return true;
      }
    }
    return false;
  }

  /** Arms Dealer: gives all starter weapons for free */
  private openWeaponVendor() {
    if (!this.isHumanoidBody()) { this.showMessage(lt('Торговать можно только в теле гуманоида', 'Only humanoid bodies can trade')); return; }
    const starterWeapons = [
      'starter_sword', 'starter_mace', 'starter_greatsword', 'starter_spear',
      'starter_hammer', 'starter_dagger', 'starter_fists',
      'starter_shortbow', 'starter_longbow', 'starter_crossbow',
      'starter_staff_fire', 'starter_staff_water', 'starter_staff_earth',
      'starter_staff_wind', 'starter_staff_nature',
    ];
    let given = 0;
    for (const id of starterWeapons) {
      if (!this.sphere.inventory.find(i => i.itemId === id)) {
        this.sphere.inventory.push({ itemId: id, quantity: 1 });
        given++;
      }
    }
    if (given > 0) {
      this.showMessage(`Arms Dealer: ${given} weapons!`);
      sfxLevelUp();
    } else {
      this.showMessage('Arms Dealer: You have all weapons.');
    }
    this.persistState();
  }

  /** NPC dialog system */
  private talkToNPC(npcId: string) {
    const result = getNPCDialog(npcId, this.questTracker);
    if (!result.messages.length) return;

    const onEnd = () => {
      const talkCompleted = this.questTracker.onTalk(npcId);
      for (const q of talkCompleted) this.onQuestComplete(q);
      this.persistState();
      this.updateQuestMarkers();
    };

    this.events.emit('show-dialog', { messages: result.messages, onEnd });
  }

  /** Show prologue on first game start */
  private showPrologue() {
    if (localStorage.getItem('essence_prologue_shown')) return;
    localStorage.setItem('essence_prologue_shown', '1');
    this.events.emit('show-dialog', PROLOGUE_DIALOG);
  }

  /** Switch between weapon 1 and weapon 2 */
  private switchWeapon() {
    if (!this.playerBody) return;
    const equip = this.sphere.equipment;
    if (!equip.weapon && !equip.weapon2) return;
    if (!equip.weapon || !equip.weapon2) {
      this.showMessage(t('weapon.need_two'));
      return;
    }

    // Save current weapon slots 1-5 config
    const currentWeaponId = this.sphere.activeWeaponSlot === 0 ? equip.weapon : equip.weapon2;
    if (currentWeaponId) {
      const config: (string | null)[] = [];
      for (let i = 0; i < 5; i++) {
        config.push(this.playerBody.abilitySlots[i].ability?.id ?? null);
      }
      this.sphere.weaponSlotConfigs[currentWeaponId] = config;
    }

    // Switch active weapon
    this.sphere.activeWeaponSlot = this.sphere.activeWeaponSlot === 0 ? 1 : 0;
    const newWeaponId = this.sphere.activeWeaponSlot === 0 ? equip.weapon : equip.weapon2;

    // Load saved config for new weapon
    this.fillBodySlots(this.playerBody);

    // Пересчёт статов: активно только новое оружие (мгновенно, клампит HP/ману).
    this.playerBody.refreshStats(this.getEquippedStats());

    this.showMessage(`${t('weapon.switched')} ${ITEMS[newWeaponId!] ? lt(ITEMS[newWeaponId!].nameRu, ITEMS[newWeaponId!].nameEn) : 'weapon'}`);
    sfxBuff();
  }

  /** Какая школа магии доступна для текущего оружия тела */
  private getWeaponSchool(): string | null {
    if (!this.playerBody) return null;
    const weaponSchoolMap: Record<string, string> = {
      staff_fire: 'fire', staff_water: 'water', staff_earth: 'earth',
      staff_wind: 'wind', staff_nature: 'nature',
    };
    // body.weapon follows the active equipped item, so Tab swap changes the school.
    return weaponSchoolMap[this.playerBody.weapon.type] ?? null;
  }

  /** Проверяет можно ли заклинание поставить в слот с текущим оружием */
  private canUseSpellWithWeapon(spell: import('../types/abilities').AbilityDef): boolean {
    // Neutral spells — always OK
    if (!spell.school || spell.school === 'neutral') return true;
    // Weapon abilities (no school) — always OK
    if (!spell.school) return true;
    // Elemental spells — need matching staff
    const weaponSchool = this.getWeaponSchool();
    return spell.school === weaponSchool;
  }

  /** Show floating message above player */
  private showMessage(text: string) {
    if (!this.playerBody) return;
    this.damageTexts.push(new DamageText(this, this.playerBody.x, this.playerBody.y - 30, 0, false, false, text));
  }

  private startGathering(node: typeof this.resourceNodes[0]) {
    if (!this.isHumanoidBody()) { this.showMessage(lt('Собирать ресурсы можно только в теле гуманоида', 'Only humanoid bodies can gather resources')); return; }
    // Check for required tool
    const toolMap: Record<string, string> = { mining: 'pickaxe', woodcutting: 'axe', trophy: 'skinning_knife' };
    const requiredTool = toolMap[node.def.profession];
    if (requiredTool && !this.sphere.inventory.find(i => i.itemId === requiredTool)) {
      this.showMessage(`${lt('Нужен', 'Need')} ${ITEMS[requiredTool] ? lt(ITEMS[requiredTool].nameRu, ITEMS[requiredTool].nameEn) : requiredTool}! ${lt('Посетите торговца.', 'Visit Merchant.')}`);
      return;
    }
    // Start gathering cast (3 sec)
    this.gatheringTimer = 3;
    this.gatheringNode = node;
    this.showMessage(`${lt('Сбор:', 'Gathering')} ${lt(node.def.nameRu, node.def.nameEn)}...`);
    this.events.emit('crafting-start', 3); // reuse cast bar for gathering
  }

  private completeGathering() {
    if (!this.gatheringNode) return;
    const node = this.gatheringNode;
    const qty = node.def.minQty + Math.floor(Math.random() * (node.def.maxQty - node.def.minQty + 1));
    const existing = this.sphere.inventory.find(i => i.itemId === node.def.itemId);
    if (existing) existing.quantity += qty;
    else this.sphere.inventory.push({ itemId: node.def.itemId, quantity: qty });

    this.showMessage(`+${qty} ${ITEMS[node.def.itemId] ? lt(ITEMS[node.def.itemId].nameRu, ITEMS[node.def.itemId].nameEn) : node.def.itemId}`);
    node.depleted = true;
    node.cooldown = node.def.respawnTime;
    node.gfx.setAlpha(0.3);
    this.gatheringNode = null;
    this.gatheringTimer = 0;
    this.persistState();
  }

  private interruptGathering() {
    if (this.gatheringTimer > 0) {
      this.gatheringTimer = 0;
      this.gatheringNode = null;
      this.showMessage(t('gather.interrupted'));
    }
  }

  /** Ковать/покупать/собирать можно только в теле гуманоида. */
  private isHumanoidBody(): boolean {
    return !!this.playerBody?.definition.canUseAllSpells;
  }

  private openCraftingUI(workbenchType: string) {
    if (!this.isHumanoidBody()) { this.showMessage(lt('Ковать можно только в теле гуманоида', 'Only humanoid bodies can craft')); return; }
    this.events.emit('open-crafting', workbenchType);
  }

  /** Called from UIScene craft button */
  public startCraftingFromUI(recipe: import('../types/items').RecipeDef) {
    this.startCrafting(recipe);
  }

  private startCrafting(recipe: import('../types/items').RecipeDef) {
    consumeCraftMaterials(this.sphere, recipe);
    this.craftingTimer = recipe.craftTime;
    this.craftingRecipe = recipe;
    // Ковка обездвиживает игрока на время craftTime (прогресс-бар сверху).
    if (this.playerBody) this.playerBody.movementLocked = true;
    this.showMessage(`${lt('Создание:', 'Crafting')} ${lt(recipe.nameRu, recipe.nameEn)}... (${recipe.craftTime}s)`);
    this.events.emit('crafting-start', recipe.craftTime);
  }

  private openVendorUI() {
    if (!this.isHumanoidBody()) { this.showMessage(lt('Торговать можно только в теле гуманоида', 'Only humanoid bodies can trade')); return; }
    // Give tools for free (always)
    const tools = ['pickaxe', 'axe', 'skinning_knife'];
    for (const toolId of tools) {
      if (!this.sphere.inventory.find(i => i.itemId === toolId)) {
        this.sphere.inventory.push({ itemId: toolId, quantity: 1 });
      }
    }
    this.persistState();
    // Open vendor UI window
    this.events.emit('open-vendor');
  }

  /** Disassemble equipment item — returns 50% of materials */
  public disassembleItem(itemId: string) {
    const r = disassemble(this.sphere, itemId);
    if (r.msg) this.showMessage(r.msg);
    if (r.ok) this.persistState();
  }

  /** Buy recipe from vendor */
  public buyRecipe(recipeId: string, price: number) {
    const r = buyRecipeLogic(this.sphere, recipeId, price);
    this.showMessage(r.msg);
    if (r.ok) { sfxLevelUp(); this.persistState(); }
  }

  /** Купить сырьё у торговца (нитки/заклёпки). */
  public buyMaterial(itemId: string, qty: number, price: number) {
    const r = buyMaterialLogic(this.sphere, itemId, qty, price);
    this.showMessage(r.msg);
    if (r.ok) { sfxBuff(); this.persistState(); }
  }

  // ─── Атака ────────────────────────────────────────────

  private get isInCombat(): boolean {
    if (!this.playerBody) return false;
    const px = this.playerBody.x, py = this.playerBody.y;
    let inCombat = false;
    this.creatureGrid.forEachNear(px, py, 400, (c) => {
      if (inCombat || c.isDead) return;
      if ((c.aiState === 'chase' || c.aiState === 'attack') &&
          !c.factionTarget && distance(c.x, c.y, px, py) < 400) {
        inCombat = true;
      }
    });
    return inCombat;
  }

  private selectTarget(creature: Creature) {
    this.selectedTarget = creature;
  }

  /** Update resource node respawns, gathering timer, and crafting timer */
  private updateWorldObjects(delta: number) {
    const dt = delta / 1000;

    // Gathering timer
    if (this.gatheringTimer > 0 && this.gatheringNode) {
      this.gatheringTimer -= dt;
      if (this.gatheringTimer <= 0) {
        this.completeGathering();
      }
    }

    // Resource node respawn
    for (const node of this.resourceNodes) {
      if (node.depleted) {
        node.cooldown -= dt;
        if (node.cooldown <= 0) {
          node.depleted = false;
          node.gfx.setAlpha(1);
        }
      }
    }

    // Loot drop despawn
    for (let i = this.lootDrops.length - 1; i >= 0; i--) {
      this.lootDrops[i].timer -= dt;
      if (this.lootDrops[i].timer <= 0) {
        this.lootDrops[i].gfx.destroy();
        this.lootDrops.splice(i, 1);
      }
    }

    // Crafting timer
    if (this.craftingTimer > 0 && this.craftingRecipe) {
      this.craftingTimer -= dt;
      if (this.craftingTimer <= 0) {
        const recipe = this.craftingRecipe;
        completeCraft(this.sphere, recipe);
        this.showMessage(`${lt('Создано:', 'Crafted:')} ${ITEMS[recipe.resultId] ? lt(ITEMS[recipe.resultId].nameRu, ITEMS[recipe.resultId].nameEn) : recipe.resultId}!`);
        sfxLevelUp();
        this.craftingRecipe = null;
        if (this.playerBody) this.playerBody.movementLocked = false;
        this.persistState();
      }
    }
  }

  // ─── Summoned Ent ───────────────────────────────────────

  private spawnEnt(wx: number, wy: number, spell: AbilityDef) {
    if (!this.playerBody) return;
    const entHP = Math.round(this.playerBody.maxHP * 0.1);
    const radius = spell.aoeRadius ?? 100;
    const duration = spell.barrierDuration ?? 20;

    // Sprite
    let sprite: Phaser.GameObjects.Sprite | null = null;
    if (this.anims.exists('spell_ent')) {
      sprite = this.add.sprite(wx, wy, 'spell_ent').setDepth(6);
      sprite.setDisplaySize(64, 64);
      sprite.play('spell_ent');
    }

    // HP bar
    const hpBarBg = this.add.rectangle(wx, wy - 36, 40, 4, 0x333333).setDepth(7);
    const hpBar = this.add.rectangle(wx, wy - 36, 40, 4, 0x44cc44).setDepth(8);

    // Protection radius indicator
    const gfx = this.add.graphics().setDepth(3).setAlpha(0.15);
    gfx.fillStyle(0x44aa44, 0.2);
    gfx.fillCircle(wx, wy, radius);
    gfx.lineStyle(1, 0x44aa44, 0.4);
    gfx.strokeCircle(wx, wy, radius);

    this.summonedEnts.push({
      x: wx, y: wy, hp: entHP, maxHP: entHP,
      radius, remaining: duration,
      sprite, hpBar, hpBarBg,
    });

    this.summonedEnts[this.summonedEnts.length - 1].gfx = gfx;
  }

  private updateEnts(delta: number) {
    const dt = delta / 1000;
    for (let i = this.summonedEnts.length - 1; i >= 0; i--) {
      const ent = this.summonedEnts[i];
      ent.remaining -= dt;

      // HP bar
      const ratio = Math.max(0, ent.hp / ent.maxHP);
      ent.hpBar.width = 40 * ratio;

      if (ent.remaining <= 0 || ent.hp <= 0) {
        ent.sprite?.destroy();
        ent.hpBar.destroy();
        ent.hpBarBg.destroy();
        ent.gfx?.destroy();
        this.summonedEnts.splice(i, 1);
      }
    }
  }

  /** Check if an ent absorbs damage for target at position */
  public tryEntAbsorb(targetX: number, targetY: number, damage: number): number {
    for (const ent of this.summonedEnts) {
      if (ent.hp <= 0) continue;
      const d = distance(targetX, targetY, ent.x, ent.y);
      if (d <= ent.radius) {
        // Ent absorbs the damage
        const absorbed = Math.min(ent.hp, damage);
        ent.hp -= absorbed;
        // Flash ent
        if (ent.sprite) {
          ent.sprite.setTint(0xff4444);
          this.time.delayedCall(150, () => ent.sprite?.clearTint());
        }
        return damage - absorbed; // remaining damage to target
      }
    }
    return damage; // no ent protecting
  }

  // ─── Fire Tsunami ────────────────────────────────────────

  private spawnFireTsunami(wx: number, wy: number, spell: AbilityDef) {
    if (!this.playerBody) return;

    const width = spell.wallWidth ?? 200;
    const depth = spell.wallThickness ?? 160;
    const dx = wx - this.playerBody.x;
    const dy = wy - this.playerBody.y;
    const angle = Math.atan2(dy, dx); // direction from caster to target
    const waveDuration = 1.5; // seconds for wave to cross the zone

    // Zone rectangle graphics (burning ground area)
    const gfx = this.add.graphics().setDepth(4).setAlpha(0.3);
    gfx.fillStyle(0xff4400, 0.2);
    const pts = this.getRotatedRectPoints(wx, wy, width / 2, depth / 2, angle + Math.PI / 2);
    gfx.fillPoints(pts, true);
    gfx.lineStyle(1, 0xff6600, 0.4);
    gfx.strokePoints(pts, true);

    // Wave sprite — starts at far edge, moves toward caster
    const farX = wx + Math.cos(angle) * (depth / 2);
    const farY = wy + Math.sin(angle) * (depth / 2);
    let waveSprite: Phaser.GameObjects.Sprite | null = null;
    if (this.anims.exists('spell_fire_tsunami')) {
      waveSprite = this.add.sprite(farX, farY, 'spell_fire_tsunami').setDepth(7);
      waveSprite.setDisplaySize(width, 60);
      waveSprite.setRotation(angle + Math.PI); // face toward caster
      waveSprite.play('spell_fire_tsunami');
    }

    this.fireTsunamis.push({
      x: wx, y: wy, angle, width, depth,
      waveProgress: 0,
      waveDuration,
      waveHit: new Set(),
      baseDamage: spell.baseDamage,
      burnRemaining: spell.zoneDuration ?? 6,
      burnDps: spell.zoneDps ?? 25,
      burnTickTimer: 0,
      school: spell.school ?? 'fire',
      casterStats: { ...this.getEffectiveStats() },
      ownerIsPlayer: true,
      waveSprite,
      burnSprites: [],
      gfx,
    });
  }

  private updateFireTsunamis(delta: number) {
    const dt = delta / 1000;

    for (let i = this.fireTsunamis.length - 1; i >= 0; i--) {
      const t = this.fireTsunamis[i];

      // Phase 1: Wave moving
      if (t.waveProgress < 1) {
        t.waveProgress += dt / t.waveDuration;
        if (t.waveProgress > 1) t.waveProgress = 1;

        // Move wave sprite
        if (t.waveSprite) {
          const prog = t.waveProgress;
          const farX = t.x + Math.cos(t.angle) * (t.depth / 2) * (1 - prog * 2);
          const farY = t.y + Math.sin(t.angle) * (t.depth / 2) * (1 - prog * 2);
          t.waveSprite.setPosition(farX, farY);
        }

        // Wave hits creatures it passes over
        const waveLinePos = t.depth * (1 - t.waveProgress) - t.depth / 2; // relative to center
        for (const c of this.creatures) {
          if (c.isDead || c.isSummoned || t.waveHit.has(c)) continue;
          // Check if creature is inside the zone rectangle
          const cx = c.x - t.x, cy = c.y - t.y;
          const cos = Math.cos(-t.angle - Math.PI / 2), sin = Math.sin(-t.angle - Math.PI / 2);
          const lx = cx * cos - cy * sin;
          const ly = cx * sin + cy * cos;
          if (Math.abs(lx) > t.width / 2 || Math.abs(ly) > t.depth / 2) continue;
          // Check if wave has passed this creature's position
          if (ly < waveLinePos) {
            t.waveHit.add(c);
            const r = calcMagicDamage(t.casterStats, c.stats, t.baseDamage);
            c.takeDamage(r.final);
            this.aggroCreature(c);
            spawnSpellImpact(this, c.x, c.y, 'mob_fire_spark', 80, c); // spark explosion
            this.damageTexts.push(new DamageText(this, c.x, c.y - 10, r.final, r.crit, false));
            if (c.isDead) this.onCreatureKilled(c);
          }
        }

        // When wave finishes, destroy wave sprite, spawn burning ground
        if (t.waveProgress >= 1) {
          if (t.waveSprite) { t.waveSprite.destroy(); t.waveSprite = null; }
          // Spawn burning ground sprite
          if (this.anims.exists('spell_burning_ground')) {
            const bg = this.add.sprite(t.x, t.y, 'spell_burning_ground').setDepth(5);
            bg.setDisplaySize(t.width, t.depth);
            bg.setRotation(t.angle + Math.PI / 2);
            bg.play('spell_burning_ground');
            bg.setAlpha(0.7);
            t.burnSprites.push(bg);
          }
          t.gfx.setAlpha(0.5); // make zone more visible
        }
      }

      // Phase 2: Burning ground DPS
      if (t.waveProgress >= 1) {
        t.burnRemaining -= dt;
        t.burnTickTimer -= dt;

        if (t.burnTickTimer <= 0) {
          t.burnTickTimer = 1; // tick every 1 sec
          for (const c of this.creatures) {
            if (c.isDead || c.isSummoned) continue;
            const cx = c.x - t.x, cy = c.y - t.y;
            const cos = Math.cos(-t.angle - Math.PI / 2), sin = Math.sin(-t.angle - Math.PI / 2);
            const lx = cx * cos - cy * sin;
            const ly = cx * sin + cy * cos;
            if (Math.abs(lx) > t.width / 2 || Math.abs(ly) > t.depth / 2) continue;
            const r = calcMagicDamage(t.casterStats, c.stats, t.burnDps);
            c.takeDamage(r.final);
            this.aggroCreature(c);
            this.damageTexts.push(new DamageText(this, c.x, c.y - 10, r.final, false, false));
            // School bonus: 10% burn
            if (Math.random() < 0.1) c.applyStatus('burn');
            if (c.isDead) this.onCreatureKilled(c);
          }
        }

        if (t.burnRemaining <= 0) {
          // Cleanup
          t.gfx.destroy();
          for (const s of t.burnSprites) s.destroy();
          this.fireTsunamis.splice(i, 1);
        }
      }
    }
  }

  /** Вспышка захвата тела — яркая белая вспышка с частицами, callback после завершения */
  private spawnCaptureFlash(x: number, y: number, onComplete: () => void) {
    // Яркая вспышка
    const flash = this.add.circle(x, y, 40, 0xffffff, 0.9)
      .setDepth(60).setBlendMode(Phaser.BlendModes.ADD);
    const glow = this.add.circle(x, y, 80, 0xaaddff, 0.4)
      .setDepth(59).setBlendMode(Phaser.BlendModes.ADD);

    // Сжимающееся кольцо
    const ring = this.add.circle(x, y, 100, 0xaaddff, 0)
      .setStrokeStyle(3, 0xffffff, 0.8)
      .setDepth(60).setBlendMode(Phaser.BlendModes.ADD);

    // Частицы разлетаются
    const emitter = this.add.particles(x, y, 'particle_circle', {
      speed: { min: 60, max: 160 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xffffff, 0xaaddff, 0x88bbff],
      lifespan: 500,
      blendMode: Phaser.BlendModes.ADD,
      emitting: false,
    }).setDepth(61);
    emitter.explode(20);
    sfxCapture();

    // Анимация вспышки: расширяется и затухает
    this.tweens.add({
      targets: flash,
      scaleX: 2.5, scaleY: 2.5,
      alpha: 0,
      duration: 350,
      ease: 'Power2',
      onComplete: () => flash.destroy(),
    });
    this.tweens.add({
      targets: glow,
      scaleX: 2, scaleY: 2,
      alpha: 0,
      duration: 450,
      ease: 'Power1',
      onComplete: () => glow.destroy(),
    });
    this.tweens.add({
      targets: ring,
      scaleX: 0.1, scaleY: 0.1,
      alpha: 0,
      duration: 300,
      ease: 'Power3',
      onComplete: () => ring.destroy(),
    });

    // Callback после вспышки — появляется тело
    this.time.delayedCall(350, () => {
      onComplete();
      emitter.destroy();
    });
  }

  /** Переход между зонами: если игрок у края карты → переход */
  private checkZoneTransition() {
    const entity = this.playerBody ?? this.sphere;
    if (!entity) return;
    const zoneW = this.currentZone.widthTiles * TILE_SIZE;
    const zoneH = this.currentZone.heightTiles * TILE_SIZE;
    const edge = 40; // пикселей от края для срабатывания

    for (const exit of this.currentZone.exits) {
      let trigger = false;
      if (exit.edge === 'north' && entity.y < edge) trigger = true;
      if (exit.edge === 'south' && entity.y > zoneH - edge) trigger = true;
      if (exit.edge === 'east' && entity.x > zoneW - edge) trigger = true;
      if (exit.edge === 'west' && entity.x < edge) trigger = true;

      if (trigger) {
        // Сохраняем тело и сферу перед переходом
        if (this.playerBody) {
          this.sphere.lastBodyId = this.playerBody.definition.id;
        }
        this.persistState();
        // Перезапускаем сцену с новой зоной
        sfxZoneTransition();
        this.scene.restart({ zoneId: exit.targetZone, spawnX: exit.spawnX, spawnY: exit.spawnY });
        return;
      }
    }
  }

  /** Применить статус к цели с обработкой спец. эффектов (interrupt, knockback) */
  private applyStatusToTarget(target: Creature, effectId: StatusEffectId | string) {
    if (effectId === 'interrupt') {
      if (target.castTimer > 0 && target.castingSpell) {
        target.castTimer = target.castingSpell.castTime ?? 0;
      }
    } else if (effectId === 'knockback') {
      if (this.playerBody) {
        const kbDist = 180;
        const dx = target.x - this.playerBody.x;
        const dy = target.y - this.playerBody.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        target.x += (dx / len) * kbDist;
        target.y += (dy / len) * kbDist;
      }
      target.applyStatus('stun');
    } else if (effectId === 'fortify' && this.playerBody) {
      // Fortify применяется на КАСТЕРА (бафф), не на цель
      this.playerBody.applyStatus('fortify');
    } else {
      target.applyStatus(effectId as StatusEffectId);
    }
  }

  /**
   * Статы = личные (база, растут навсегда) + бонусы экипировки.
   * БЕЗ статус-эффектов — это «постоянные» статы тела (maxHP/maxMana/база брони).
   * Пересчитываются при каждой смене экипировки (см. persistState → refreshStats).
   */
  private getEquippedStats(): Stats {
    const s = { ...this.sphere.stats };
    const bonuses = equipmentStatBonuses(
      this.sphere.equipment as Record<string, string | undefined>,
      this.sphere.activeWeaponSlot ?? 0,
    );
    for (const [stat, val] of Object.entries(bonuses)) {
      s[stat as StatName] += val ?? 0;
    }
    return s;
  }

  /** Полные статы = база + экипировка + временные статус-эффекты (для боя) */
  private getEffectiveStats(): Stats {
    const s = this.getEquippedStats();

    // Временные бонусы от статус-эффектов (баффы/дебаффы) — только для боевых формул
    if (this.playerBody) {
      s[StatName.Armor] += this.playerBody.armorBonus;

      // Когти (зверь/элементаль ИЛИ безоружный гуманоид): оружие не выбрано,
      // поэтому атака масштабируется от НАИБОЛЬШЕГО боевого стата (Сила/Ловкость/
      // Интеллект) — вложение в любой стат всегда работает. Затрагивает только
      // исходящий урон: защита от Брони/Уклонения/Воли не трогается.
      if (this.playerBody.usesInnateAttack) {
        const maxOff = Math.max(
          s[StatName.Strength], s[StatName.Agility], s[StatName.Intellect],
        );
        s[StatName.Strength] = maxOff;
        s[StatName.Agility] = maxOff;
        s[StatName.Intellect] = maxOff;
      }
    }

    return s;
  }

  // ═══ REGION: Combat ═══════════════════════════════════════════════════════
  // handleAttack, creatureAttackPlayer, creatureCastSpell, applyStatusToTarget,
  // getPlayerDefenseStats, getEffectiveStats

  private handleAttack() {
    if (!this.playerBody || this.playerBody.attackCooldown > 0) return;

    const weapon = this.playerBody.weapon;

    // Приоритет: выбранная цель → ближайшая в радиусе
    let closestCreature: Creature | null = null;

    if (this.selectedTarget && !this.selectedTarget.isDead && this.selectedTarget.active) {
      const dist = distance(this.playerBody.x, this.playerBody.y, this.selectedTarget.x, this.selectedTarget.y);
      if (dist <= weapon.range) {
        closestCreature = this.selectedTarget;
      }
    }

    if (!closestCreature) {
      let closestDist = weapon.range;
      for (const creature of this.creatures) {
        if (creature.isDead) continue;
        const dist = distance(this.playerBody.x, this.playerBody.y, creature.x, creature.y);
        if (dist < closestDist) {
          closestDist = dist;
          closestCreature = creature;
        }
      }
    }

    if (!closestCreature) return;

    // Тип урона следует за ОРУЖИЕМ в руках, а не за врождённым телом
    // (воин с посохом бьёт магией по Интеллекту, с луком — дальним по Ловкости).
    const dt = weaponDamageType(weapon.type);
    const wb = weapon.baseDamage;
    const hasFocus = this.playerBody.hasStatus('focus');

    // Фокусировка: 100% попадание (игнор блок + уклонение), потребляем статус
    let result;
    if (hasFocus) {
      this.playerBody.clearStatus('focus');
      // Гарантированное попадание — считаем урон напрямую без проверки hit
      const raw = dt === 'magic' ? wb * (1 + (this.sphere.stats[StatName.Intellect] ?? 1) / 100)
                : dt === 'ranged' ? wb * (1 + (this.sphere.stats[StatName.Agility] ?? 1) / 100)
                :                   wb * (1 + (this.sphere.stats[StatName.Strength] ?? 1) / 100);
      const stat = dt === 'magic' ? StatName.Will : dt === 'ranged' ? StatName.Evasion : StatName.Armor;
      const defVal = closestCreature.stats[stat];
      const reduction = Math.min(defVal / (defVal + 125), 0.8);
      const reduced = raw * (1 - reduction);
      const crit = Math.random() < (this.sphere.stats[StatName.Luck] / (this.sphere.stats[StatName.Luck] + 50));
      const final_ = crit ? reduced * 1.5 : reduced;
      result = { raw, reduced, hit: true, crit, final: Math.round(final_) };
    } else {
      result = dt === 'magic'  ? calcMagicDamage(this.getEffectiveStats(), closestCreature.stats, wb)
             : dt === 'ranged' ? calcRangedDamage(this.getEffectiveStats(), closestCreature.stats, wb)
             :                   calcMeleeDamage(this.getEffectiveStats(), closestCreature.stats, wb);
    }

    let finalDmg = (result.hit && this.sphere.deathDebuffRemaining > 0)
      ? Math.round(result.final * DEATH_DEBUFF_MULT) : result.final;
    // Боевой клич: +10% исходящего урона
    if (result.hit && this.playerBody.hasStatus('damage_boost')) {
      const boost = STATUS_DEFS['damage_boost'].outgoingDamageIncrease ?? 0;
      finalDmg = Math.round(finalDmg * (1 + boost));
    }
    // Vulnerability: +10% incoming damage on target
    if (result.hit) {
      finalDmg = this.applyTargetVulnerability(closestCreature, finalDmg, dt === 'magic');
    }

    // ── Школьный бонус посоха на ОБЫЧНОЙ атаке (аналог фирменного эффекта оружия):
    //    огонь→горение 10%, вода→охлаждение 20%, земля→пробитие 20% защиты,
    //    ветер→×2 урон 20%, природа→самоисцеление 5% HP 20%. ──
    const staffSchool = this.getWeaponSchool();
    if (result.hit && staffSchool) {
      const sb = SCHOOL_BONUSES[staffSchool as MagicSchool];
      if (sb) {
        // Земля: пробитие части защиты — масштабируем урон по новой редукции.
        if (sb.penetrationChance && sb.penetrationPercent && Math.random() < sb.penetrationChance) {
          const origDef = closestCreature.stats[StatName.Will];
          const oldRed = magicalReduction(origDef);
          const newRed = magicalReduction(origDef * (1 - sb.penetrationPercent));
          if (oldRed < 1) finalDmg = Math.round(finalDmg * (1 - newRed) / (1 - oldRed));
        }
        // Ветер: двойной урон.
        if (sb.doubleDamageChance && Math.random() < sb.doubleDamageChance) finalDmg *= 2;
        // Огонь/Вода: статус на цель.
        if (sb.statusEffect && Math.random() < (sb.statusChance ?? 0)) {
          this.applyStatusToTarget(closestCreature, sb.statusEffect);
        }
        // Природа: самоисцеление при ударе.
        if (sb.selfHealChance && this.playerBody && Math.random() < sb.selfHealChance) {
          const heal = Math.round(this.playerBody.maxHP * (sb.selfHealPercent ?? 0));
          this.playerBody.currentHP = Math.min(this.playerBody.maxHP, this.playerBody.currentHP + heal);
        }
      }
    }

    if (result.hit) {
      // Обычная атака — нерезонансная: твари Пустоты получают 30% (см. Creature.takeDamage)
      closestCreature.takeDamage(finalDmg, true);
      if (closestCreature.aiState === 'idle' || closestCreature.aiState === 'wander') {
        closestCreature.aiState = 'chase';
      }
      // VFX удара
      if (dt === 'melee') {
        spawnMeleeSwingVFX(this, this.playerBody.x, this.playerBody.y, closestCreature.x, closestCreature.y);
      if (result.crit) sfxCritHit(); else sfxMeleeHit();
      }
      spawnHitVFX(this, closestCreature.x, closestCreature.y, 'neutral', result.crit);
    }

    // Снаряд для дальнобойного и магического тела (с VFX хвостом)
    const bodyElement = this.playerBody.definition.element ?? 'neutral';
    if (dt === 'ranged') {
      spawnProjectileVFX(this, this.playerBody.x, this.playerBody.y, closestCreature.x, closestCreature.y, 'neutral');
      sfxRangedShot();
      this.spawnProjectile(
        this.playerBody.x, this.playerBody.y,
        closestCreature.x, closestCreature.y,
        0xddcc88, 10, 2,
      );
    } else if (dt === 'magic') {
      spawnProjectileVFX(this, this.playerBody.x, this.playerBody.y, closestCreature.x, closestCreature.y, bodyElement);
      this.spawnProjectile(
        this.playerBody.x, this.playerBody.y,
        closestCreature.x, closestCreature.y,
        0xaaddff, 6, 6,
      );
    }

    // Текст урона
    this.damageTexts.push(
      new DamageText(this, closestCreature.x, closestCreature.y, finalDmg, result.crit, !result.hit)
    );

    // Доп. урон от зачарования оружия
    this.applyEnchantDamage(closestCreature, result.hit);

    // Фирменный эффект оружия теперь срабатывает и на обычной атаке
    // (тот же шанс, что у оружейных умений — 20%). Для зверей/элементалей
    // природное оружие без weaponEffect ничего не накладывает.
    if (result.hit && weapon.weaponEffect) {
      if (Math.random() < (weapon.weaponEffectChance ?? 0.2)) {
        this.applyStatusToTarget(closestCreature, weapon.weaponEffect);
      }
    }

    // Кулдаун
    this.playerBody.attackCooldown = weapon.cooldown;

    // Повернуть к цели и запустить анимацию атаки
    this.playerBody.faceToward(closestCreature.x, closestCreature.y);
    this.playerBody.playAttackAnim();

    // Проверка смерти моба
    if (closestCreature.isDead) {
      this.onCreatureKilled(closestCreature);
    }
  }

  private creatureAttackPlayer(creature: Creature) {
    if (!this.playerBody || this.playerBody.isDead) return;
    // Игрок внутри безопасной зоны — мобы не могут в него попасть.
    if (this.isInSafeZone(this.playerBody.x, this.playerBody.y)) return;
    // Жёсткая проверка дальности — не бьём из-за карты.
    const weapon = WEAPONS[creature.definition.weapon];
    const distToPlayer = distance(creature.x, creature.y, this.playerBody.x, this.playerBody.y);
    if (distToPlayer > weapon.range * 1.1) return;
    this.interruptGathering(); // Сбор прерывается при атаке

    const cdt = creature.definition.damageType;
    const cwb = WEAPONS[creature.definition.weapon].baseDamage;

    // Блок: melee/ranged → проверка блока ДО попадания
    if (cdt !== 'magic' && this.playerBody.tryBlock()) {
      sfxBlock();
      this.damageTexts.push(new DamageText(this, this.playerBody.x, this.playerBody.y, 0, false, false));
      creature.attackCooldown = WEAPON_COOLDOWNS[creature.definition.weapon];
      return;
    }

    const defStats = this.getEffectiveStats();
    const result = cdt === 'magic'  ? calcMagicDamage(creature.stats, defStats, cwb)
                 : cdt === 'ranged' ? calcRangedDamage(creature.stats, defStats, cwb)
                 :                    calcMeleeDamage(creature.stats, defStats, cwb);

    if (result.hit) {
      let finalDmg = result.final;
      // Vulnerability on player: +incoming damage
      finalDmg = this.applyPlayerVulnerability(finalDmg, cdt === 'magic');
      // Ветряной барьер снижает урон если снаряд пролетает через него
      const barrierRed = this.getWindBarrierReduction(creature.x, creature.y, this.playerBody.x, this.playerBody.y, true);
      if (barrierRed > 0) finalDmg = Math.round(finalDmg * (1 - barrierRed));
      // Закалка: −30% дальнего урона
      if (cdt === 'ranged' && this.playerBody.hasStatus('ranged_resist')) {
        finalDmg = Math.round(finalDmg * 0.7);
      }
      // Ent absorbs damage for player if in range
      const afterEnt = this.tryEntAbsorb(this.playerBody.x, this.playerBody.y, finalDmg);
      this.playerBody.takeDamage(afterEnt);
      this.logIncomingDamage(lt(creature.definition.nameRu, creature.definition.name), afterEnt, result.crit);
    }

    // Снаряд моба
    if (cdt === 'ranged') {
      this.spawnProjectile(creature.x, creature.y, this.playerBody.x, this.playerBody.y, 0xcc8844, 10, 2);
    } else if (cdt === 'magic') {
      this.spawnProjectile(creature.x, creature.y, this.playerBody.x, this.playerBody.y, 0xcc66ff, 6, 6);
    }

    this.damageTexts.push(
      new DamageText(this, this.playerBody.x, this.playerBody.y, result.final, result.crit, !result.hit)
    );

    creature.attackCooldown = WEAPON_COOLDOWNS[creature.definition.weapon];

    if (this.playerBody.isDead) {
      this.onPlayerDeath();
    }
  }

  /** Моб кастует заклинание своей школы по игроку */
  private creatureCastSpell(creature: Creature, spell: AbilityDef) {
    if (!this.playerBody || this.playerBody.isDead) return;
    if (this.isInSafeZone(this.playerBody.x, this.playerBody.y)) return;
    // Жёсткая проверка дальности заклинания.
    const distToPlayer = distance(creature.x, creature.y, this.playerBody.x, this.playerBody.y);
    const maxRange = (spell.range && spell.range > 0) ? spell.range * 1.1 : WEAPONS[creature.definition.weapon].range * 1.1;
    if (distToPlayer > maxRange) return;

    // Цвет снаряда по элементу
    const elementColors: Record<string, number> = {
      fire: 0xff5500,
      water: 0x44aaff,
      earth: 0x886633,
      wind: 0xaaddaa,
    };
    const projColor = elementColors[creature.definition.element ?? 'fire'] ?? 0xcc66ff;

    const result = calcMagicDamage(creature.stats, this.sphere.stats, spell.baseDamage);

    // Ground zone от NPC: создаёт зону на позиции игрока
    if (spell.effectType === 'ground_zone') {
      this.spawnGroundZone(this.playerBody.x, this.playerBody.y, spell.aoeRadius ?? 60, spell, false, { ...creature.stats });
      return;
    }

    // Wind barrier от NPC: ставит перед собой как щит
    if (spell.effectType === 'wind_barrier') {
      const mx = (creature.x + this.playerBody.x) / 2;
      const my = (creature.y + this.playerBody.y) / 2;
      this.spawnWindBarrier(mx, my, spell.aoeRadius ?? 80, spell, false);
      return;
    }

    // Summon wall от NPC: ставит стену перед собой (между собой и игроком)
    if (spell.effectType === 'summon_wall') {
      const int = creature.stats[StatName.Intellect] ?? 1;
      const hp = Math.round((spell.wallHP ?? 50) * (1 + int / 100));
      // Ставим стену на полпути между мобом и игроком
      const mx = (creature.x + this.playerBody.x) / 2;
      const my = (creature.y + this.playerBody.y) / 2;
      this.spawnWall(mx, my, spell, hp, false);
      return;
    }

    // Ветряной барьер снижает урон
    const barrierRed = this.getWindBarrierReduction(creature.x, creature.y, this.playerBody.x, this.playerBody.y, true);
    let npcDmg = barrierRed > 0 ? Math.round(result.final * (1 - barrierRed)) : result.final;
    npcDmg = this.applyPlayerVulnerability(npcDmg, true);

    if (result.hit) {
      if (spell.isAoe) {
        this.playerBody.takeDamage(npcDmg);
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI * 2 * i) / 4;
          const r = (spell.aoeRadius ?? 60) * 0.6;
          this.spawnProjectile(
            creature.x, creature.y,
            this.playerBody.x + Math.cos(angle) * r,
            this.playerBody.y + Math.sin(angle) * r,
            projColor, 5, 5,
          );
        }
      } else {
        this.playerBody.takeDamage(npcDmg);
        spawnProjectileVFX(this, creature.x, creature.y, this.playerBody.x, this.playerBody.y, creature.definition.element ?? 'neutral');
        spawnHitVFX(this, this.playerBody.x, this.playerBody.y, creature.definition.element ?? 'neutral');
        this.spawnProjectile(
          creature.x, creature.y,
          this.playerBody.x, this.playerBody.y,
          projColor, 7, 5,
        );
      }
      this.logIncomingDamage(lt(creature.definition.nameRu, creature.definition.name), npcDmg, result.crit, lt(spell.nameRu, spell.nameEn));
    }

    this.damageTexts.push(
      new DamageText(this, this.playerBody.x, this.playerBody.y - 10, result.hit ? npcDmg : 0, result.crit, !result.hit)
    );

    if (this.playerBody.isDead) {
      this.onPlayerDeath();
    }
  }

  // ═══ REGION: Creature Lifecycle ══════════════════════════════════════════
  // onCreatureKilled, onPlayerDeath, completeCaptureCreature

  private onCreatureKilled(creature: Creature) {
    // Идемпотентность: смерть может прийти из нескольких путей (прямой удар, AoE,
    // DoT-тик в update) — награду выдаём один раз.
    if (creature.killProcessed) return;
    creature.killProcessed = true;
    // Неподвижные объекты (Машина Переноса): без лога «killed», XP, лута и
    // бестиария — их гибель обрабатывает скрипт данжа (labState=defeat).
    if (creature.definition.immobile) return;
    sfxDeath();
    // Призванный союзник: убрать из мира, без XP, без захвата, без респауна
    if (creature.isSummoned) {
      creature.destroy();
      this.creatures = this.creatures.filter(c => c !== creature);
      return;
    }

    const xpTotal = creature.definition.xpReward;

    if (this.playerBody) {
      // 1. Stat XP — делится только между растущими (не на капе) cap-статами
      const caps = this.playerBody.definition.caps;
      const capStats = Object.keys(caps) as StatName[];
      for (const levelUp of distributeXP(this.sphere.stats, this.sphere.xpTracker, xpTotal, caps)) {
        this.events.emit('stat-up', levelUp);
      }

      this.events.emit('creature-killed', { name: lt(creature.definition.nameRu, creature.definition.name), xp: xpTotal, stats: capStats });
    } else {
      this.events.emit('creature-killed', { name: lt(creature.definition.nameRu, creature.definition.name), xp: 0, stats: [] });
    }

    // Бестиарий — отметить запись (для боссов и обычных мобов)
    {
      const { newlyRevealed } = bestiaryReveal(creature.definition.id, 'killed');
      if (newlyRevealed) {
        this.events.emit('bestiary-revealed', { id: creature.definition.id, reason: 'killed', nameRu: lt(creature.definition.nameRu, creature.definition.name) });
      }
    }

    // Квест — засчитать убийство (и босса если это Guardian)
    this.handleQuestKill(creature.definition.id, xpTotal);
    if (creature.definition.isBoss) {
      this.handleBossKill(creature.definition);
    }

    // Валюта
    const coinDrop = MOB_COPPER_DROPS[creature.definition.id];
    if (coinDrop) {
      const coins = coinDrop.min + Math.floor(Math.random() * (coinDrop.max - coinDrop.min + 1));
      this.sphere.copper += coins;
      this.showMessage(`+${formatCurrency(coins)}`);
    }

    // Лут — дроп на землю
    const dropped = rollLoot(creature.definition.id);
    if (dropped.length > 0) {
      this.spawnLootDrop(creature.x, creature.y, dropped);
    }

    // Статистика убийств
    this.sphere.killCounts[creature.definition.id] = (this.sphere.killCounts[creature.definition.id] ?? 0) + 1;

    // Ачивки
    const newAchievements = checkAchievements(this.sphere);
    for (const ach of newAchievements) {
      this.events.emit('achievement-unlocked', ach);
    }

    // Автосохранение
    this.persistState();

    // Пульсация — тело доступно для захвата (твари Пустоты тел не оставляют)
    if (!creature.definition.voidResistant && !creature.definition.immobile) {
      this.tweens.add({
        targets: creature,
        alpha: { from: 0.4, to: 0.7 },
        duration: 800,
        yoyo: true,
        repeat: -1,
      });
      this.events.emit('capture-available', lt(creature.definition.nameRu, creature.definition.name));
    }

    // Через 30 сек тело само исчезает и встаёт в очередь респауна
    this.time.delayedCall(30000, () => {
      if (creature.active) {
        this.scheduleRespawn(creature);
        creature.destroy();
        this.creatures = this.creatures.filter(c => c !== creature);
      }
    });
  }

  private onPlayerDeath() {
    sfxDeath();
    // Прогресс квеста тела НЕ сбрасываем: тело остаётся тем же (телепорт к камню),
    // поэтому собранное/прогресс сохраняются — продолжаешь с того же места.
    // (Сброс остаётся при добровольном выходе [Q] и захвате другого тела.)
    // ── Штраф за смерть ──────────────────────────────────
    let totalXpLost = 0;
    if (this.playerBody) {
      // Теряем % XP по статам текущего тела
      const caps = this.playerBody.definition.caps;
      for (const stat of Object.keys(caps) as StatName[]) {
        const cur = this.sphere.xpTracker[stat] ?? 0;
        const lost = Math.floor(cur * DEATH_XP_LOSS_PCT);
        this.sphere.xpTracker[stat] = cur - lost;
        totalXpLost += lost;
      }
    }
    // Дебафф урона (TODO: применять в боевых формулах после тестирования)
    this.sphere.deathDebuffRemaining = DEATH_DEBUFF_DURATION;

    // ── Телепорт к ближайшему камню возрождения в том же теле ──
    const deathX = this.playerBody?.x ?? this.sphere.x;
    const deathY = this.playerBody?.y ?? this.sphere.y;
    const rp = this.getNearestRespawn(deathX, deathY);
    if (this.playerBody) {
      this.playerBody.x = rp.x;
      this.playerBody.y = rp.y;
      this.playerBody.currentHP = this.playerBody.maxHP;
      this.playerBody.currentMana = this.playerBody.maxMana;
    } else {
      this.sphere.enterAstral(rp.x, rp.y);
    }
    // Сбрасываем агро и каст у всех мобов — игрок перезапустился.
    for (const c of this.creatures) {
      if (c.isDead || c.isSummoned) continue;
      c.aiState = 'return';
      c.factionTarget = null;
      c.castingSpell = null;
      c.castTimer = 0;
      c.attackCooldown = Math.max(c.attackCooldown, 0.5);
    }
    this.persistState();
    this.events.emit('player-died', { xpLost: totalXpLost, debuffDuration: DEATH_DEBUFF_DURATION });
  }

  // ─── Захват существа ──────────────────────────────────

  private completeCaptureCreature(creature: Creature) {
    const def = creature.definition;
    const cx = creature.x, cy = creature.y;

    // Убираем существо из мира + ставим в очередь респауна
    this.scheduleRespawn(creature);
    creature.destroy();
    this.creatures = this.creatures.filter(c => c !== creature);

    // Вспышка захвата → появление тела
    this.spawnCaptureFlash(cx, cy, () => {
      // Уничтожаем старое тело (Сфера покидает его)
      this.bodyQuestTracker.clear();
      this.clearBodyQuestObjects();
      if (this.playerBody) {
        this.playerBody.destroy();
        this.playerBody = null;
      }

      this.playerBody = new Body(this, cx, cy, def, this.getEquippedStats());
      this.playerBody.mapW = this.currentZone.widthTiles * TILE_SIZE;
      this.playerBody.mapH = this.currentZone.heightTiles * TILE_SIZE;
      this.playerBody.wallCheckFn = (x, y) => this.isBlockedByWall(x, y, true);
      this.playerBody.possess(this);
      this.fillBodySlots(this.playerBody);
      this.sphere.enterBody();
      this.sphere.lastBodyId = def.id;

      this.events.emit('body-captured', lt(def.nameRu, def.name));

      // Бестиарий — записать вселение
      {
        const { newlyRevealed } = bestiaryReveal(def.id, 'sphered');
        if (newlyRevealed) {
          this.events.emit('bestiary-revealed', { id: def.id, reason: 'sphered', nameRu: lt(def.nameRu, def.name) });
        }
      }

      // Захваты: счётчик ачивок
      this.sphere.killCounts['__captures'] = (this.sphere.killCounts['__captures'] ?? 0) + 1;
      const captureAchievements = checkAchievements(this.sphere);
      for (const ach of captureAchievements) {
        this.events.emit('achievement-unlocked', ach);
      }

      this.persistState();

      // Квест — засчитать захват
      const captureCompleted = this.questTracker.onCapture(def.id);
      for (const q of captureCompleted) this.onQuestComplete(q);

      // Body quest — show intro dialog on first possession
      this.tryShowBodyQuest(def.id);
    });
  }

  // ─── Квестовые хелперы ───────────────────────────────

  private handleQuestKill(creatureId: string, _xpFromKill: number) {
    const completed = this.questTracker.onKill(creatureId);
    for (const q of completed) this.onQuestComplete(q);

    // Body quest kill tracking — категория цели (для квестов «убей любого элементаля»).
    if (this.bodyQuestTracker.getActive() && !this.bodyQuestTracker.isComplete()) {
      const def = CREATURE_DB[creatureId];
      const category = def?.element && ['fire', 'water', 'earth', 'wind'].includes(def.element)
        ? 'elemental' : undefined;
      const wasComplete = this.bodyQuestTracker.isComplete();
      this.bodyQuestTracker.onKill(creatureId, category);
      if (!wasComplete && this.bodyQuestTracker.isComplete()) {
        this.onBodyQuestComplete();
      }
    }

    // Protected creature died → reset protect objective, player must try again
    if (this.bodyQuestTracker.getActive()) {
      const reset = this.bodyQuestTracker.failProtect(creatureId);
      if (reset) {
        this.showMessage(lt('Раненый погиб. Подойди снова чтобы попробовать ещё раз.', 'The wounded one died. Approach again to retry.'));
      }
    }
  }

  private tryShowBodyQuest(bodyId: string) {
    const quests = getBodyQuests(bodyId);
    const bq = quests.find(q => {
      if (this.sphere.triggeredBodyQuests.includes(q.id)) return false;
      if (q.prerequisiteBodyQuestId && !this.sphere.triggeredBodyQuests.includes(q.prerequisiteBodyQuestId)) return false;
      return true;
    });
    if (!bq) return;

    const hasObjectives = bq.objectives.length > 0;

    const onIntroEnd = () => {
      if (hasObjectives) {
        this.bodyQuestTracker.start(bq);
        this.spawnBodyQuestObjects(bq);
        this.spawnBodyQuestEnemies(bq);
        this.showMessage(`${lt('Квест начат:', 'Quest started:')} ${lt(bq.nameRu, bq.nameEn)}`);
      } else {
        this.grantBodyQuestReward(bq);
      }
    };

    this.events.emit('show-dialog', { messages: bq.introMessages, onEnd: onIntroEnd });
  }

  private spawnBodyQuestObjects(bq: import('../types/bodyQuests').BodyQuestDef): void {
    if (!bq.spawnObjects || !this.playerBody) return;
    const cx = this.playerBody.x, cy = this.playerBody.y;
    const mapW = this.currentZone.widthTiles * TILE_SIZE;
    const mapH = this.currentZone.heightTiles * TILE_SIZE;

    for (const so of bq.spawnObjects) {
      // Центр спавна: якорь (фикс. точка, напр. лагерь) или вокруг игрока.
      const ax = so.anchor?.x ?? cx;
      const ay = so.anchor?.y ?? cy;
      // Minimum spacing between same-batch objects so they don't clump.
      // Scales with available area: ~half the avg cell size for `count` items
      // packed into the (0.4–1.0)·radius annulus.
      const minSpacing = Math.max(60, so.radius / Math.sqrt(so.count) * 0.7);
      const placed: Array<{ x: number; y: number }> = [];
      // Равномерная «роза» направлений: i-й объект в своём секторе круга
      // (со случайным поворотом всей розы и джиттером внутри сектора) —
      // объекты гарантированно в разные стороны, а не кучей с одного бока.
      const roseOffset = Math.random() * Math.PI * 2;
      for (let i = 0; i < so.count; i++) {
        let ox = 0, oy = 0;
        for (let attempt = 0; attempt < 30; attempt++) {
          const sector = (i / so.count) * Math.PI * 2;
          const jitter = (Math.random() - 0.5) * (Math.PI * 2 / so.count) * 0.6;
          const angle = roseOffset + sector + jitter;
          const dist = so.radius * 0.4 + Math.random() * so.radius * 0.6;
          ox = Math.max(40, Math.min(mapW - 40, ax + Math.cos(angle) * dist));
          oy = Math.max(40, Math.min(mapH - 40, ay + Math.sin(angle) * dist));
          const tooClose = placed.some(p => Math.hypot(p.x - ox, p.y - oy) < minSpacing);
          if (!tooClose) break;
        }
        placed.push({ x: ox, y: oy });

        const container = this.add.container(ox, oy).setDepth(3);
        const glow = this.add.circle(0, 0, 14, so.color, 0.3);
        const icon = this.add.text(0, 0, so.icon, { fontSize: '16px' }).setOrigin(0.5);
        const label = this.add.text(0, -22, lt(so.nameRu, so.nameEn), { fontSize: '8px', color: '#ddddcc', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
        const eKey = this.add.text(0, 18, '[E]', { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
        container.add([glow, icon, label, eKey]);
        this.tweens.add({ targets: glow, alpha: { from: 0.2, to: 0.5 }, duration: 1200, yoyo: true, repeat: -1 });

        const obj = { x: ox, y: oy, objectId: so.objectId, nameRu: lt(so.nameRu, so.nameEn), objType: so.type, gfx: container, used: false };
        this.questObjects.push(obj);
        this.bodyQuestObjects.push(obj);
      }
    }
  }

  /** Спавн врагов при старте квеста тела — сразу агрятся на игрока. */
  private spawnBodyQuestEnemies(bq: import('../types/bodyQuests').BodyQuestDef): void {
    if (!bq.spawnEnemies || !this.playerBody) return;
    const cx = this.playerBody.x, cy = this.playerBody.y;
    const mapW = this.currentZone.widthTiles * TILE_SIZE;
    const mapH = this.currentZone.heightTiles * TILE_SIZE;
    for (const se of bq.spawnEnemies) {
      const def = CREATURE_DB[se.creatureId];
      if (!def) continue;
      const ax = se.anchor?.x ?? cx;
      const ay = se.anchor?.y ?? cy;
      const radius = se.radius ?? 150;
      for (let i = 0; i < se.count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * 0.5 + Math.random() * radius * 0.5;
        const x = Math.max(40, Math.min(mapW - 40, ax + Math.cos(angle) * dist));
        const y = Math.max(40, Math.min(mapH - 40, ay + Math.sin(angle) * dist));
        const c = new Creature(this, x, y, def);
        c.aiState = 'chase'; // сразу бегут на игрока
        this.applyCreatureEnv(c);
        this.creatures.push(c);
      }
    }
  }

  private clearBodyQuestObjects(): void {
    for (const obj of this.bodyQuestObjects) {
      obj.gfx.destroy();
      const idx = this.questObjects.indexOf(obj);
      if (idx >= 0) this.questObjects.splice(idx, 1);
    }
    this.bodyQuestObjects = [];
    this.protectZoneGfx?.clear().setVisible(false);
  }

  private onBodyQuestComplete(): void {
    const progress = this.bodyQuestTracker.getActive();
    if (!progress) return;
    const bq = progress.def;
    this.sphere.triggeredBodyQuests.push(bq.id);
    this.bodyQuestTracker.clear();
    this.clearBodyQuestObjects();
    this.grantBodyQuestReward(bq);
    this.persistState();
  }

  private grantBodyQuestReward(bq: import('../types/bodyQuests').BodyQuestDef): void {
    const spellId = bq.rewardSpellId;
    if (spellId && !this.sphere.learnedSpells.some(s => s.id === spellId)) {
      const spell = getSpellById(spellId);
      if (spell) {
        const prereqId = spell.prerequisiteId;
        const hasPrereq = !prereqId || this.sphere.learnedSpells.some(s => s.id === prereqId);
        if (hasPrereq) {
          this.sphere.learnedSpells.push(spell);
          this.sphere.spellProgress[spell.id] = 9999;
          this.events.emit('spell-learned', spell);
          if (this.playerBody) this.fillBodySlots(this.playerBody); // сразу в скилл-бар
          sfxLevelUp();
        }
      }
    }
    if (bq.xpReward > 0 && this.playerBody) {
      const caps = this.playerBody.definition.caps;
      for (const levelUp of distributeXP(this.sphere.stats, this.sphere.xpTracker, bq.xpReward, caps)) {
        this.events.emit('stat-up', levelUp);
      }
    }
    this.events.emit('show-dialog', { messages: bq.completeMessages });
  }

  private handleBossKill(def: import('../types/bodies').BodyDefinition) {
    const bossCompleted = this.questTracker.onBossKill(def.id);
    for (const q of bossCompleted) this.onQuestComplete(q);

    if (def.element && def.element in this.sphere.sealFrequencies) {
      this.sphere.sealFrequencies[def.element] = true;
      this.events.emit('seal-frequency-gained', def.element);

      const names: Record<string, string> = { fire: 'Fire', water: 'Water', earth: 'Earth', wind: 'Wind' };
      this.showMessage(`Seal frequency acquired: ${names[def.element]}!`);

      // Boss reward: auto-learn T2 spell of the Guardian's school
      const rewardSpellIds: Record<string, string> = {
        fire: 'mob_fire_arrow', water: 'mob_ice_arrow',
        earth: 'mob_stone_spike', wind: 'mob_wind_blade',
      };
      const rewardId = rewardSpellIds[def.element];
      if (rewardId && !this.sphere.learnedSpells.find(s => s.id === rewardId)) {
        const spell = getSpellById(rewardId);
        if (spell) {
          this.sphere.learnedSpells.push(spell);
          this.sphere.spellProgress[spell.id] = 9999;
          this.events.emit('spell-learned', spell);
          if (this.playerBody) this.fillBodySlots(this.playerBody); // сразу в скилл-бар
          sfxLevelUp();
        }
      }

      const allCollected = Object.values(this.sphere.sealFrequencies).every(v => v);
      if (allCollected) {
        this.events.emit('show-dialog', {
          messages: [
            { speaker: '', text: 'All four frequencies resonate within you. The Seal of Elements is complete.' },
            { speaker: '', text: 'You feel the power to close the warp rifts. But dark tendrils stir at the edges of the world...' },
          ],
        });
      }

      this.persistState();
    }
  }

  private onQuestComplete(q: import('../types/quests').QuestProgress) {
    const xpReward = q.def.xpReward;
    this.events.emit('quest-complete', { name: lt(q.def.nameRu, q.def.nameEn), xp: xpReward });

    if (this.playerBody && xpReward > 0) {
      const caps = this.playerBody.definition.caps;
      for (const levelUp of distributeXP(this.sphere.stats, this.sphere.xpTracker, xpReward, caps)) {
        this.events.emit('stat-up', levelUp);
      }
    }

    if (q.def.dialogEnd) {
      this.events.emit('show-dialog', {
        messages: [{ speaker: 'Quest Complete', text: q.def.dialogEnd }],
      });
    }

    if (q.def.id === 'q12_guardians_trial') {
      this.time.delayedCall(2000, () => {
        this.events.emit('show-dialog', { messages: CHAPTER1_FINALE_DIALOG });
      });
    }

    this.persistState();
    this.updateQuestMarkers();
  }

  private updateQuestMarkers() {
    const allQuests = this.questTracker.getAll();
    for (const npc of this.worldNPCs) {
      if (!npc.questMarker) continue;
      const hasQuest = allQuests.some(q =>
        !q.completed && q.def.giverNpcId === npc.id && this.questTracker.isQuestAvailable(q) &&
        q.counts.every(c => c === 0)
      );
      npc.questMarker.setVisible(hasQuest);
    }
  }

  /** Возвращает первый (основной) стат тела — тот в который идёт XP за атаки */
  private applyTargetVulnerability(target: Creature, dmg: number, isMagic: boolean): number {
    if (target.hasStatus('vulnerability')) {
      const inc = STATUS_DEFS['vulnerability'].incomingDamageIncrease ?? 0;
      dmg = Math.round(dmg * (1 + inc));
    }
    if (isMagic && target.hasStatus('magic_vulnerability')) {
      const inc = STATUS_DEFS['magic_vulnerability'].elementalDamageIncrease ?? 0;
      dmg = Math.round(dmg * (1 + inc));
    }
    return dmg;
  }

  private applyPlayerVulnerability(dmg: number, isMagic: boolean): number {
    if (!this.playerBody) return dmg;
    if (this.playerBody.hasStatus('vulnerability')) {
      const inc = STATUS_DEFS['vulnerability'].incomingDamageIncrease ?? 0;
      dmg = Math.round(dmg * (1 + inc));
    }
    if (isMagic && this.playerBody.hasStatus('magic_vulnerability')) {
      const inc = STATUS_DEFS['magic_vulnerability'].elementalDamageIncrease ?? 0;
      dmg = Math.round(dmg * (1 + inc));
    }
    return dmg;
  }

  private getBodyPrimaryStat(): StatName {
    if (!this.playerBody) return StatName.Strength;
    const caps = this.playerBody.definition.caps;
    // Находим стат с наибольшим капом — это главный обучающий стат тела
    let best = StatName.Strength;
    let bestVal = 0;
    for (const [stat, val] of Object.entries(caps)) {
      if ((val ?? 0) > bestVal) {
        bestVal = val ?? 0;
        best = stat as StatName;
      }
    }
    return best;
  }

  // ═══ REGION: Spell System ════════════════════════════════════════════════
  // handleSpell, activateSpellSlot, fireAoeSpell, executeAoeSpell, doAoeDamage,
  // canUseSpellWithWeapon, calcSpellDamage

  private handleSpell(slotIndex: number) {
    if (!this.playerBody) return;

    const slot = this.playerBody.abilitySlots[slotIndex];
    if (!slot?.ability) return;
    if (slot.cooldownRemaining > 0) return;

    const spell = slot.ability;

    // Школьная проверка: огненная магия требует огненный посох и т.д.
    if (!this.canUseSpellWithWeapon(spell)) {
      this.showMessage(`Need ${spell.school} staff`);
      return;
    }

    // Проверка маны
    if (!this.sphere.freeNextCast && this.playerBody.currentMana < spell.manaCost) {
      this.events.emit('no-mana');
      return;
    }

    // Бесплатный каст (от Рассечения). Запоминаем факт, чтобы «отменяющие»
    // ветки (toggle-выкл, неверное оружие, волк уже жив) могли вернуть РОВНО
    // то, что списали, и восстановить заряд бесплатного каста — иначе мана
    // бралась бы из ниоткуда, а бесплатный каст тратился впустую.
    const usedFreeCast = this.sphere.freeNextCast;
    if (usedFreeCast) {
      this.sphere.freeNextCast = false;
    } else {
      this.playerBody.currentMana -= spell.manaCost;
    }
    slot.cooldownRemaining = spell.cooldown;
    this.sphere.abilityCooldowns[spell.id] = spell.cooldown;

    // ── Рывок: бросок вперёд ──────────────────────────────────────────────
    // ── Weapon Enchant: toggle-аура ────────────────────────────────────────
    if (spell.effectType === 'weapon_enchant') {
      if (this.sphere.activeEnchant?.id === spell.id) {
        // Деактивация
        this.sphere.activeEnchant = null;
        if (this.playerBody) this.playerBody.enchantRegenPenalty = 0;
        this.events.emit('enchant-toggled', null);
        this.events.emit('log', { text: `${lt(spell.nameRu, spell.nameEn)} — ${lt('деактивировано', 'deactivated')}`, color: '#aaaaaa' });
      } else {
        // Активация
        this.sphere.activeEnchant = spell;
        if (this.playerBody) this.playerBody.enchantRegenPenalty = spell.regenPenalty ?? 0.3;
        this.events.emit('enchant-toggled', spell);
        const penaltyPct = Math.round((spell.regenPenalty ?? 0.3) * 100);
        this.events.emit('log', { text: `${lt(spell.nameRu, spell.nameEn)} — ${lt('активировано! Реген маны', 'activated! Mana regen')} −${penaltyPct}%`, color: '#ffaa00' });
      }
      // Не тратим ману и не запускаем кулдаун
      slot.cooldownRemaining = 0;
      this.sphere.abilityCooldowns[spell.id] = 0;
      if (usedFreeCast) this.sphere.freeNextCast = true;
      else this.playerBody.currentMana += spell.manaCost;
      return;
    }

    if (spell.effectType === 'dash_forward') {
      const dist = spell.dashDistance ?? 180;
      const dir = this.playerBody.getFacingVector();
      const startX = this.playerBody.x;
      const startY = this.playerBody.y;
      const targetX = clamp(startX + dir.x * dist, 16, this.playerBody.mapW - 16);
      const targetY = clamp(startY + dir.y * dist, 16, this.playerBody.mapH - 16);

      // Smooth dash — visual ram, ~600px/sec (200px ≈ 0.33s)
      const realDist = Math.hypot(targetX - startX, targetY - startY);
      const duration = Math.max(120, (realDist / 600) * 1000);
      this.tweens.add({
        targets: this.playerBody,
        x: targetX,
        y: targetY,
        duration,
        ease: 'Cubic.Out',
      });

      // Таран: отталкивание врагов вдоль пути рывка (apply at start, before tween settles)
      if (spell.statusEffect === 'knockback') {
        const pushDist = 80;
        for (const c of this.creatures) {
          if (c.isDead) continue;
          // Расстояние от линии рывка (start→target)
          const ax = c.x - startX, ay = c.y - startY;
          const bx = targetX - startX, by = targetY - startY;
          const lenSq = bx * bx + by * by;
          const t = lenSq > 0 ? Math.max(0, Math.min(1, (ax * bx + ay * by) / lenSq)) : 0;
          const projX = startX + t * bx, projY = startY + t * by;
          const d = distance(c.x, c.y, projX, projY);
          if (d < 40) {
            const dx = c.x - projX, dy = c.y - projY;
            const nd = Math.sqrt(dx * dx + dy * dy) || 1;
            c.x += (dx / nd) * pushDist;
            c.y += (dy / nd) * pushDist;
            c.applyStatus('knockback');
          }
        }
      }

      this.events.emit('ability-used', lt(spell.nameRu, spell.nameEn));
      return;
    }

    // ── Выстрел с отскоком: атака + бросок назад (обрабатывается ниже после урона)
    // dash_backward — не return здесь, падаем в обычный поток атаки

    // ── Самобафф (ускорение и пр.) ─────────────────────────────────────────
    if (spell.effectType === 'self_buff') {
      // Проверка requiredWeapons — используем активное оружие, а не intrinsic body weapon
      if (spell.requiredWeapons && !spell.requiredWeapons.includes(this.playerBody.weapon.type)) {
        slot.cooldownRemaining = 0;
        this.sphere.abilityCooldowns[spell.id] = 0;
        if (usedFreeCast) this.sphere.freeNextCast = true;
        else this.playerBody.currentMana += spell.manaCost;
        return;
      }
      if (spell.statusEffect) {
        this.playerBody.applyStatus(spell.statusEffect);
        // Групповые баффы: применяем к союзникам в радиусе (волк и будущие союзники)
        if (spell.isAoe && spell.aoeRadius) {
          for (const c of this.creatures) {
            if (!c.isSummoned || c.isDead) continue;
            const d = distance(this.playerBody.x, this.playerBody.y, c.x, c.y);
            if (d <= spell.aoeRadius) {
              c.applyStatus(spell.statusEffect);
            }
          }
        }
      }
      // Адаптация: следующий каст бесплатный
      if (spell.grantFreeNextCast) {
        this.sphere.freeNextCast = true;
      }
      // VFX кастования баффа
      spawnCastVFX(this, this.playerBody.x, this.playerBody.y, spell.school ?? 'neutral');
      this.playerBody.playAttackAnim();
      sfxBuff();
      this.events.emit('ability-used', lt(spell.nameRu, spell.nameEn));
      return;
    }

    // ── Лечение (self_heal / targetAlly / healPerStatusEffect) ────────────
    if (spell.effectType === 'self_heal') {
      const intel = this.sphere.stats.intellect ?? 0;
      let healAmount = spell.baseDamage > 0
        ? Math.round(spell.baseDamage * (1 + intel / 100))
        : 0;
      // Очищение: +HP за каждый активный статус на себе
      if (spell.healPerStatusEffect) {
        healAmount += spell.healPerStatusEffect * this.playerBody.statusEffects.size;
      }
      if (spell.targetAlly) {
        // Лечение союзника: ищем ближайшего союзника (волка) в радиусе
        let allyTarget: Creature | null = null;
        let allyDist = spell.range;
        for (const c of this.creatures) {
          if (!c.isSummoned || c.isDead) continue;
          const d = distance(this.playerBody.x, this.playerBody.y, c.x, c.y);
          if (d < allyDist) { allyDist = d; allyTarget = c; }
        }
        if (allyTarget && healAmount > 0) {
          allyTarget.currentHP = Math.min(allyTarget.currentHP + healAmount, allyTarget.maxHP);
          this.damageTexts.push(new DamageText(this, allyTarget.x, allyTarget.y - 10, healAmount, false, false, `+${healAmount}`, 'heal'));
          spawnHealVFX(this, allyTarget.x, allyTarget.y);
        }
      } else if (healAmount > 0) {
        this.playerBody.currentHP = Math.min(
          this.playerBody.currentHP + healAmount,
          this.playerBody.maxHP,
        );
        this.damageTexts.push(new DamageText(this, this.playerBody.x, this.playerBody.y - 10, healAmount, false, false, `+${healAmount}`, 'heal'));
        spawnHealVFX(this, this.playerBody.x, this.playerBody.y);
        sfxHeal();
      }
      this.events.emit('ability-used', lt(spell.nameRu, spell.nameEn));
      return;
    }

    // ── Призыв волка ───────────────────────────────────────────────────────
    if (spell.effectType === 'summon_wolf') {
      // Пока волк жив — повторный призыв заблокирован
      if (this.creatures.some(c => c.isSummoned && !c.isDead)) {
        slot.cooldownRemaining = 0;
        this.sphere.abilityCooldowns[spell.id] = 0;
        if (usedFreeCast) this.sphere.freeNextCast = true;
        else this.playerBody.currentMana += spell.manaCost;
        this.events.emit('log', { text: lt('Волк ещё жив', 'Your wolf is still alive'), color: '#aaaaaa' });
        return;
      }
      // КД не ставим сейчас — запустится когда волк умрёт
      slot.cooldownRemaining = 0;
      this.sphere.abilityCooldowns[spell.id] = 0;
      this.spawnSummonedWolf(this.playerBody.x + 40, this.playerBody.y);
      this.events.emit('ability-used', lt(spell.nameRu, spell.nameEn));
      return;
    }

    // Найти цель для атакующих умений (проверка дальности обязательна)
    let target: Creature | null = null;
    if (this.selectedTarget && !this.selectedTarget.isDead) {
      const d = distance(this.playerBody.x, this.playerBody.y, this.selectedTarget.x, this.selectedTarget.y);
      if (d <= spell.range) target = this.selectedTarget;
    }
    if (!target) {
      let closestDist = spell.range;
      for (const c of this.creatures) {
        if (c.isDead || c.isSummoned) continue;
        const d = distance(this.playerBody.x, this.playerBody.y, c.x, c.y);
        if (d < closestDist) { closestDist = d; target = c; }
      }
    }
    if (!target) {
      // Нет цели — возвращаем кулдаун и ману
      slot.cooldownRemaining = 0;
      this.sphere.abilityCooldowns[spell.id] = 0;
      this.playerBody.currentMana += spell.manaCost;
      return;
    }

    // Расчёт урона по типу атаки умения
    const result = spell.damageType === 'melee'  ? calcMeleeDamage(this.getEffectiveStats(), target.stats, spell.baseDamage)
                 : spell.damageType === 'ranged' ? calcRangedDamage(this.getEffectiveStats(), target.stats, spell.baseDamage)
                 :                                  calcMagicDamage(this.getEffectiveStats(), target.stats, spell.baseDamage);

    // ── Прыжок к цели (Shadow Step и пр. — не-AoE) ──────────────────────
    if (spell.leapDistance && this.playerBody && !spell.isAoe) {
      const dx = target.x - this.playerBody.x;
      const dy = target.y - this.playerBody.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const leap = Math.min(spell.leapDistance, dist);
      this.playerBody.x += (dx / dist) * leap;
      this.playerBody.y += (dy / dist) * leap;
    }

    // ── Пробивание защиты (школа Земли: 20% шанс игнорировать 20% защиты) ──
    let baseDmg = result.final;
    if (spell.school) {
      const schoolBonus = SCHOOL_BONUSES[spell.school];
      if (schoolBonus?.penetrationChance && schoolBonus?.penetrationPercent) {
        if (Math.random() < schoolBonus.penetrationChance) {
          // Пересчитываем урон с пониженной защитой
          const stat = spell.damageType === 'magic' ? StatName.Will : spell.damageType === 'ranged' ? StatName.Evasion : StatName.Armor;
          const origDef = target.stats[stat];
          const reducedDef = origDef * (1 - schoolBonus.penetrationPercent);
          const raw = result.raw;
          const reduction = spell.damageType === 'magic'
            ? magicalReduction(reducedDef)
            : physicalReduction(reducedDef);
          const reduced = raw * (1 - reduction);
          const final_ = result.crit ? reduced * 1.5 : reduced;
          baseDmg = Math.round(final_);
        }
      }
    }

    // ── Игнорирование брони (Мощный выстрел) ────────────────────────────
    if (spell.ignoreArmor) {
      // Пересчитываем без защиты
      const rawBase = spell.baseDamage * (1 + (this.sphere.stats[StatName.Agility] ?? 1) / 100);
      baseDmg = Math.round(rawBase);
    }

    // Двойной урон (школа ветра и др.)
    const isDouble = spell.doubleDamageChance && Math.random() < spell.doubleDamageChance;
    let dmg = this.sphere.deathDebuffRemaining > 0
      ? Math.round(baseDmg * DEATH_DEBUFF_MULT) : baseDmg;
    if (isDouble) dmg *= 2;

    // ── Условный бонус (Рассечение: если замедлен +50%) ─────────────────
    if (spell.conditionalBonusDmg && spell.conditionalOnStatus) {
      if (target.hasStatus(spell.conditionalOnStatus as StatusEffectId)) {
        dmg = Math.round(dmg * spell.conditionalBonusDmg);
      }
    }

    // ── Отчаяние: +10 урона за дебафф на себе ────────────────────────────
    if (spell.bonusDamagePerSelfDebuff && this.playerBody) {
      const debuffCount = [...this.playerBody.statusEffects.keys()].filter(id => !isBuffStatus(id)).length;
      dmg += spell.bonusDamagePerSelfDebuff * debuffCount;
    }

    // ── Разоблачение: +10% урона за бафф на враге ────────────────────────
    if (spell.bonusDamagePercentPerTargetBuff) {
      const buffCount = [...target.statusEffects.keys()].filter(id => isBuffStatus(id)).length;
      dmg = Math.round(dmg * (1 + spell.bonusDamagePercentPerTargetBuff * buffCount));
    }

    // ── Добивание: +50% урона если цель < 50% HP ─────────────────────────
    if (spell.executeBonusPercent) {
      const hpRatio = target.currentHP / target.maxHP;
      if (hpRatio < 0.5) {
        dmg = Math.round(dmg * (1 + spell.executeBonusPercent));
      }
    }

    // ── Чистый удар: +30% если нет зачарования ──────────────────────────
    if (spell.bonusDamageIfNoEnchant && this.sphere) {
      if (!this.sphere.activeEnchant) {
        dmg = Math.round(dmg * (1 + spell.bonusDamageIfNoEnchant));
      }
    }

    // ── Боевой клич (damage_boost): +10% исходящего урона ────────────────
    if (this.playerBody?.hasStatus('damage_boost')) {
      const boost = STATUS_DEFS['damage_boost'].outgoingDamageIncrease ?? 0;
      dmg = Math.round(dmg * (1 + boost));
    }

    // ── Vulnerability / elementalDamageIncrease on target ────────────────
    const isMagicSpell = spell.damageType === 'magic';
    dmg = this.applyTargetVulnerability(target, dmg, isMagicSpell);

    // ── Бурст яда (Смертельная доза: 5 стаков → мгновенный урон) ────────
    if (spell.poisonBurstDamage && target.hasStatus('poison')) {
      const poisonStatus = target.statusEffects.get('poison');
      if (poisonStatus && poisonStatus.stacks >= 5) {
        const burstDmg = spell.poisonBurstDamage;
        target.takeDamage(burstDmg);
        target.statusEffects.delete('poison');
        this.damageTexts.push(new DamageText(this, target.x, target.y - 20, burstDmg, true, false));
      }
    }

    target.takeDamage(dmg);
    this.aggroCreature(target);

    // Анимация атаки при заклинании
    if (this.playerBody) {
      this.playerBody.faceToward(target.x, target.y);
      this.playerBody.playAttackAnim();
    }

    // Летящий снаряд — пока ТОЛЬКО для Порыва ветра (mob_gust → spell_gust).
    // Остальные одиночные заклинания — позже.
    if (spell.id === 'mob_gust' && this.playerBody) {
      spawnSpellProjectile(this, this.playerBody.x, this.playerBody.y, target.x, target.y, spell.id, 38);
      spawnProjectileVFX(this, this.playerBody.x, this.playerBody.y, target.x, target.y, spell.school ?? 'neutral');
    }

    // VFX попадания способности
    const spellSchool = spell.school ?? (spell.damageType === 'melee' ? 'neutral' : 'neutral');
    if (spell.damageType === 'melee') {
      spawnMeleeSwingVFX(this, this.playerBody.x, this.playerBody.y, target.x, target.y,
        spell.school === 'fire' ? 0xff5500 : spell.school === 'water' ? 0x4499ff : 0xffffff);
    }
    spawnHitVFX(this, target.x, target.y, spellSchool, result.crit || !!isDouble);
    spawnSpellImpact(this, target.x, target.y, spell.id, 80, target);
    if (result.crit || isDouble) sfxCritHit(); else if (spell.damageType === 'magic') sfxMagicHit(); else sfxMeleeHit();

    // ── Лайфстил (Кровавый размах: 30% от урона лечит) ──────────────────
    if (spell.lifestealPercent && this.playerBody && result.hit) {
      const healAmount = Math.round(dmg * spell.lifestealPercent);
      this.playerBody.currentHP = Math.min(this.playerBody.currentHP + healAmount, this.playerBody.maxHP);
    }

    // ── Очищение дебаффов (Очищающий удар) ───────────────────────────────
    if ((spell.cleanseCount || spell.cleanseSelf) && this.playerBody) {
      // Очищаем только дебаффы — всё, что не бафф (единый список в statuses.ts).
      const debuffIds = [...this.playerBody.statusEffects.keys()].filter(id => !isBuffStatus(id));
      if (spell.cleanseCount) {
        // Снимаем N случайных дебаффов
        for (let i = 0; i < spell.cleanseCount && debuffIds.length > 0; i++) {
          const idx = Math.floor(Math.random() * debuffIds.length);
          this.playerBody.statusEffects.delete(debuffIds.splice(idx, 1)[0]);
        }
      } else {
        // cleanseSelf: снимаем все
        for (const id of debuffIds) this.playerBody.statusEffects.delete(id);
      }
      if (spell.debuffImmunityDuration) {
        this.playerBody.debuffImmunity = spell.debuffImmunityDuration;
      }
    }

    // ── Временные HP (Стойкий удар) ────────────────────────────────────
    if (spell.grantTempHP && this.playerBody) {
      this.playerBody.tempHP = spell.grantTempHP;
      this.playerBody.tempHPTimer = spell.tempHPDuration ?? 6;
    }

    // ── Бесплатный следующий каст (Рассечение) ──────────────────────────
    if (spell.grantFreeNextCast) {
      this.sphere.freeNextCast = true;
    }

    this.damageTexts.push(
      new DamageText(this, target.x, target.y - 10, dmg, result.crit || !!isDouble, false)
    );

    // Доп. урон от зачарования (только для физ. атак, не магии)
    if (spell.damageType !== 'magic') {
      this.applyEnchantDamage(target, result.hit);
    }
    // Статус-эффект: спелл > оружие (+ alsoApplyWeaponEffect для двойного)
    const weapon = this.playerBody ? this.playerBody.weapon : null;
    const effectId = spell.statusEffect ?? weapon?.weaponEffect;
    const effectChance = spell.statusEffect ? (spell.statusChance ?? 1.0) : (weapon?.weaponEffectChance ?? 0.2);
    if (effectId && result.hit) {
      if (Math.random() < effectChance) {
        this.applyStatusToTarget(target, effectId);
      }
    }
    // alsoApplyWeaponEffect: свой эффект + оружейный отдельно
    if (spell.alsoApplyWeaponEffect && spell.statusEffect && weapon?.weaponEffect && result.hit) {
      const wepChance = (weapon.weaponEffectChance ?? 0.2) * (spell.weaponEffectChanceMult ?? 1);
      if (Math.random() < wepChance) {
        this.applyStatusToTarget(target, weapon.weaponEffect);
      }
    }

    // ── Pierce: пробивающий болт (арбалет) — доп. цели в линии ──────────
    if (spell.effectType === 'pierce' && result.hit) {
      const maxExtra = (spell.pierceCount ?? 3) - 1;
      const dx = target.x - this.playerBody.x;
      const dy = target.y - this.playerBody.y;
      const lineLen = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / lineLen;
      const ny = dy / lineLen;
      let piercedCount = 0;
      // Сортируем по дальности от игрока чтобы пробивать ближних раньше
      const px = this.playerBody!.x;
      const py = this.playerBody!.y;
      const sorted = [...this.creatures].sort((a, b) =>
        distance(px, py, a.x, a.y) -
        distance(px, py, b.x, b.y)
      );
      for (const c of sorted) {
        if (piercedCount >= maxExtra) break;
        if (c === target || c.isDead || c.isSummoned) continue;
        const cx = c.x - this.playerBody.x;
        const cy = c.y - this.playerBody.y;
        const proj = cx * nx + cy * ny;
        if (proj <= 0) continue;
        const perp = Math.abs(cx * ny - cy * nx);
        if (perp > 40) continue;
        const r2 = spell.damageType === 'ranged'
          ? calcRangedDamage(this.getEffectiveStats(), c.stats, spell.baseDamage)
          : calcMeleeDamage(this.getEffectiveStats(), c.stats, spell.baseDamage);
        if (r2.hit) {
          c.takeDamage(r2.final);
          this.damageTexts.push(new DamageText(this, c.x, c.y - 10, r2.final, r2.crit, false));
          if (c.isDead) this.onCreatureKilled(c);
        }
        piercedCount++;
      }
    }

    // ── Chain Lightning: прыгает от цели к цели ──────────────────────────
    if (spell.effectType === 'chain_lightning' && result.hit) {
      const jumpRadius = spell.chainRadius ?? 120;
      const maxJumps = (spell.chainCount ?? 5) - 1; // first hit already done
      const hitTargets = new Set<Creature>([target]);
      let currentTarget = target;

      const doChain = (jumpIndex: number) => {
        if (jumpIndex >= maxJumps) return;
        // Find nearest unhit enemy
        let nearest: Creature | null = null;
        let nearestDist = jumpRadius;
        for (const c of this.creatures) {
          if (c.isDead || c.isSummoned || hitTargets.has(c)) continue;
          const d = distance(currentTarget.x, currentTarget.y, c.x, c.y);
          if (d < nearestDist) { nearestDist = d; nearest = c; }
        }
        if (!nearest) return;

        hitTargets.add(nearest);
        const nextTarget = nearest;

        // Delayed chain — visual hop
        this.time.delayedCall(150 * (jumpIndex + 1), () => {
          // Projectile VFX between targets
          spawnSpellProjectile(this, currentTarget.x, currentTarget.y, nextTarget.x, nextTarget.y, spell.id, 40);

          // Damage
          const r = calcMagicDamage(this.getEffectiveStats(), nextTarget.stats, spell.baseDamage);
          let chainDmg = r.final;
          if (spell.doubleDamageChance && Math.random() < spell.doubleDamageChance) chainDmg *= 2;
          nextTarget.takeDamage(chainDmg);
          this.aggroCreature(nextTarget);
          spawnHitVFX(this, nextTarget.x, nextTarget.y, spell.school ?? 'wind', chainDmg > r.final);
          this.damageTexts.push(new DamageText(this, nextTarget.x, nextTarget.y - 10, chainDmg, chainDmg > r.final, false));

          // Status effect
          if (spell.statusEffect && Math.random() < (spell.statusChance ?? 0)) {
            nextTarget.applyStatus(spell.statusEffect!);
          }

          if (nextTarget.isDead) this.onCreatureKilled(nextTarget);
          currentTarget = nextTarget;
          doChain(jumpIndex + 1);
        });
      };
      doChain(0);
    }

    // ── Сброс кулдауна (длинный лук) ─────────────────────────────────────
    if (spell.effectType === 'reset_cooldown' && result.hit) {
      if (Math.random() < (spell.resetCooldownChance ?? 0)) {
        slot.cooldownRemaining = 0;
        this.sphere.abilityCooldowns[spell.id] = 0;
      }
    }

    // ── Dash backward: бросок назад ОТ ЦЕЛИ после выстрела ─────────────────
    if (spell.effectType === 'dash_backward' && target) {
      const dist = spell.dashDistance ?? 180;
      const dx = this.playerBody.x - target.x;
      const dy = this.playerBody.y - target.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      this.playerBody.x = clamp(this.playerBody.x + (dx / len) * dist, 16, this.playerBody.mapW - 16);
      this.playerBody.y = clamp(this.playerBody.y + (dy / len) * dist, 16, this.playerBody.mapH - 16);
    }

    // ── Cone AoE: удар по всем в конусе перед игроком ────────────────────
    if (spell.effectType === 'cone_aoe' && result.hit) {
      const halfAngle = ((spell.coneAngle ?? 90) / 2) * (Math.PI / 180);
      const dir = this.playerBody.getFacingVector();
      const coneDir = Math.atan2(dir.y, dir.x);
      for (const c of this.creatures) {
        if (c === target || c.isDead || c.isSummoned) continue;
        const dx = c.x - this.playerBody.x;
        const dy = c.y - this.playerBody.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > spell.range) continue;
        const angle = Math.atan2(dy, dx);
        let diff = Math.abs(angle - coneDir);
        if (diff > Math.PI) diff = Math.PI * 2 - diff;
        if (diff > halfAngle) continue;
        const r2 = calcMeleeDamage(this.getEffectiveStats(), c.stats, spell.baseDamage);
        if (r2.hit) {
          const d2 = this.sphere.deathDebuffRemaining > 0 ? Math.round(r2.final * DEATH_DEBUFF_MULT) : r2.final;
          c.takeDamage(d2);
          this.aggroCreature(c);
          this.damageTexts.push(new DamageText(this, c.x, c.y - 10, d2, r2.crit, false));
          if (spell.statusEffect && Math.random() < (spell.statusChance ?? 1)) {
            c.applyStatus(spell.statusEffect);
          }
          if (c.isDead) this.onCreatureKilled(c);
        }
      }
    }

    // ── Multi-hit: повторные удары по той же цели ─────────────────────────
    if (spell.effectType === 'multi_hit' && result.hit && !target.isDead) {
      const extraHits = (spell.hitCount ?? 2) - 1;
      for (let h = 0; h < extraHits; h++) {
        const hitIndex = h;
        this.time.delayedCall(250 * (hitIndex + 1), () => {
          if (!this.playerBody || target.isDead) return;
          const r = spell.damageType === 'melee'  ? calcMeleeDamage(this.getEffectiveStats(), target.stats, spell.baseDamage)
                  : spell.damageType === 'ranged' ? calcRangedDamage(this.getEffectiveStats(), target.stats, spell.baseDamage)
                  :                                  calcMagicDamage(this.getEffectiveStats(), target.stats, spell.baseDamage);
          if (r.hit) {
            const d = this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final;
            target.takeDamage(d);
            this.aggroCreature(target);
            this.damageTexts.push(new DamageText(this, target.x, target.y - 10, d, r.crit, false));
            if (spell.statusEffect) {
              const chance = spell.statusChance ?? 1.0;
              if (Math.random() < chance) target.applyStatus(spell.statusEffect);
            }
            if (target.isDead) this.onCreatureKilled(target);
          }
        });
      }
    }

    // ── Projectile AoE: снаряд в цель + взрыв вокруг (Ледяная стрела) ────
    if (spell.effectType === 'projectile_aoe' && result.hit) {
      const aoeR = spell.aoeRadius ?? 45;
      const splashBase = spell.splashDamage ?? spell.baseDamage;

      // Визуальный снаряд к цели
      spawnSpellProjectile(this, this.playerBody.x, this.playerBody.y, target.x, target.y, spell.id);
      spawnProjectileVFX(this, this.playerBody.x, this.playerBody.y, target.x, target.y, spell.school ?? 'water');
      this.spawnProjectile(this.playerBody.x, this.playerBody.y, target.x, target.y, 0x4499ff, 8, 5);

      // Взрыв AoE с VFX
      spawnAoeVFX(this, target.x, target.y, aoeR, spell.school ?? 'water');

      // Школьный бонус
      const schoolBonus = spell.school ? SCHOOL_BONUSES[spell.school] : undefined;

      // Splash по ВСЕМ в радиусе (включая основную цель)
      for (const c of this.creatures) {
        if (c.isDead || c.isSummoned) continue;
        if (distance(c.x, c.y, target.x, target.y) > aoeR) continue;
        // Основная цель уже получила baseDamage выше — даём только splash
        const dmgBase = c === target ? 0 : splashBase;
        if (dmgBase > 0) {
          const r = calcMagicDamage(this.getEffectiveStats(), c.stats, dmgBase);
          const d = this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final;
          c.takeDamage(d);
          this.aggroCreature(c);
          this.damageTexts.push(new DamageText(this, c.x, c.y - 10, d, r.crit, false));
          spawnHitVFX(this, c.x, c.y, spell.school ?? 'water', r.crit);
          if (c.isDead) this.onCreatureKilled(c);
        }
        // Школьный бонус: chill на всех в зоне взрыва (включая основную цель)
        if (schoolBonus?.statusEffect && Math.random() < (schoolBonus.statusChance ?? 0)) {
          c.applyStatus(schoolBonus.statusEffect);
        }
      }
    }

    // ── Multi-projectile: 5 снарядов в случайные цели (Огненная стрела) ──
    if (spell.effectType === 'multi_projectile') {
      const radius = spell.projectileRadius ?? 150;
      const count = spell.projectileCount ?? 5;
      const pool = this.creatures.filter(c =>
        !c.isDead && !c.isSummoned &&
        distance(this.playerBody!.x, this.playerBody!.y, c.x, c.y) <= radius
      );
      if (pool.length > 0) {
        for (let i = 0; i < count; i++) {
          const c = pool[Math.floor(Math.random() * pool.length)];
          const r = calcMagicDamage(this.getEffectiveStats(), c.stats, spell.baseDamage);
          if (r.hit) {
            const d = this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final;
            c.takeDamage(d);
            this.aggroCreature(c);
            this.damageTexts.push(new DamageText(this, c.x, c.y - 10 - i * 6, d, r.crit, false));
            if (spell.statusEffect && Math.random() < (spell.statusChance ?? 1)) c.applyStatus(spell.statusEffect);
            if (c.isDead) this.onCreatureKilled(c);
          }
        }
      }
    }

    // ── Cross AoE: 4 шипа крестом от цели (Каменный шип) ────────────────
    if (spell.effectType === 'cross_aoe' && result.hit) {
      const armLen = spell.crossArmLength ?? 260;
      const armW   = spell.crossArmWidth  ?? 30;
      const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
      for (const dir of dirs) {
        for (const c of this.creatures) {
          if (c === target || c.isDead || c.isSummoned) continue;
          const dx = c.x - target.x;
          const dy = c.y - target.y;
          const proj = dx * dir.x + dy * dir.y;
          if (proj <= 0 || proj > armLen) continue;
          const perp = Math.abs(dx * dir.y - dy * dir.x);
          if (perp > armW) continue;
          const r = calcMagicDamage(this.getEffectiveStats(), c.stats, spell.baseDamage);
          if (r.hit) {
            const d = this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final;
            c.takeDamage(d);
            this.aggroCreature(c);
            this.damageTexts.push(new DamageText(this, c.x, c.y - 10, d, r.crit, false));
            if (spell.statusEffect && Math.random() < (spell.statusChance ?? 1)) c.applyStatus(spell.statusEffect);
            if (c.isDead) this.onCreatureKilled(c);
          }
        }
      }
    }

    // ── Cone projectiles: 3 смерча конусом (Ветрорез) ────────────────────
    if (spell.effectType === 'cone_projectiles' && result.hit) {
      const count     = spell.projectileCount ?? 3;
      const halfAngle = ((spell.coneAngle ?? 45) / 2) * (Math.PI / 180);
      const armRange  = spell.range;
      const dir       = this.playerBody.getFacingVector();
      const baseAngle = Math.atan2(dir.y, dir.x);
      // Равномерно распределяем лучи внутри конуса
      for (let i = 0; i < count; i++) {
        const t = count === 1 ? 0 : (i / (count - 1)) * 2 - 1; // -1..1
        const rayAngle = baseAngle + t * halfAngle;
        const rNx = Math.cos(rayAngle);
        const rNy = Math.sin(rayAngle);
        for (const c of this.creatures) {
          if (c.isDead || c.isSummoned) continue;
          const dx = c.x - this.playerBody!.x;
          const dy = c.y - this.playerBody!.y;
          const proj = dx * rNx + dy * rNy;
          if (proj <= 0 || proj > armRange) continue;
          const perp = Math.abs(dx * rNy - dy * rNx);
          if (perp > 25) continue;
          const r = calcMagicDamage(this.getEffectiveStats(), c.stats, spell.baseDamage);
          if (r.hit) {
            const isDouble = spell.doubleDamageChance && Math.random() < spell.doubleDamageChance;
            const d = (this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final) * (isDouble ? 2 : 1);
            c.takeDamage(d);
            this.aggroCreature(c);
            this.damageTexts.push(new DamageText(this, c.x, c.y - 10, d, r.crit || !!isDouble, false));
            if (c.isDead) this.onCreatureKilled(c);
          }
        }
      }
    }

    if (target.isDead) this.onCreatureKilled(target);
  }

  /** Активировать слот 1–7: AoE → режим прицеливания, иначе мгновенный каст */
  private activateSpellSlot(slotIndex: number) {
    if (!this.playerBody) return;
    const slot = this.playerBody.abilitySlots[slotIndex];
    if (!slot?.ability) return;

    const spell = slot.ability;

    // Повторное нажатие на стену/зону — досрочная отмена (даже во время КД)
    const isPlaceable = spell.effectType === 'summon_wall' || spell.effectType === 'ground_zone' || spell.effectType === 'wind_barrier' || spell.effectType === 'fire_tsunami' || spell.effectType === 'summon_ent';
    if (isPlaceable && this.cancelPlacedEffect(spell.id)) {
      this.events.emit('log', { text: `${lt(spell.nameRu, spell.nameEn)} — ${lt('отменено', 'cancelled')}`, color: '#aaaaaa' });
      return;
    }

    if (slot.cooldownRemaining > 0) return;

    if (spell.isAoe && spell.range === 0) {
      // AoE на себе (Whirlwind и пр.) — без прицеливания
      if (!this.sphere.freeNextCast && this.playerBody.currentMana < spell.manaCost) {
        this.events.emit('no-mana');
        return;
      }
      this.doAoeDamage(spell, slotIndex, this.playerBody.x, this.playerBody.y);
    } else if (spell.isAoe) {
      // Входим в режим прицеливания
      this.aoeTargeting = { slotIndex, spell };
      this.events.emit('aoe-targeting', lt(spell.nameRu, spell.nameEn));
    } else if (spell.targetAlly) {
      // Ally targeting — wait for click on friendly creature
      this.allyTargeting = { slotIndex, spell };
      this.events.emit('aoe-targeting', `${lt(spell.nameRu, spell.nameEn)} — ${lt('выбери союзника', 'choose an ally')}`);
    } else {
      this.handleSpell(slotIndex);
    }
  }

  /** Click in ally-targeting mode — heals the chosen ally. */
  private fireAllySpell(target: Creature) {
    if (!this.allyTargeting || !this.playerBody) return;
    const { slotIndex, spell } = this.allyTargeting;
    const slot = this.playerBody.abilitySlots[slotIndex];
    if (!slot?.ability) { this.exitAllyTargeting(); return; }
    if (slot.cooldownRemaining > 0) { this.exitAllyTargeting(); return; }

    const d = distance(this.playerBody.x, this.playerBody.y, target.x, target.y);
    if (d > spell.range) {
      this.showMessage('Out of range');
      return;
    }
    if (!this.sphere.freeNextCast && this.playerBody.currentMana < spell.manaCost) {
      this.events.emit('no-mana');
      return;
    }

    if (this.sphere.freeNextCast) {
      this.sphere.freeNextCast = false;
    } else {
      this.playerBody.currentMana = Math.max(0, this.playerBody.currentMana - spell.manaCost);
    }
    slot.cooldownRemaining = spell.cooldown;
    this.sphere.abilityCooldowns[spell.id] = spell.cooldown;

    const intel = this.sphere.stats.intellect ?? 0;
    const healAmount = Math.round(spell.baseDamage * (1 + intel / 100));
    target.currentHP = Math.min(target.currentHP + healAmount, target.maxHP);
    this.damageTexts.push(new DamageText(this, target.x, target.y - 10, healAmount, false, false));
    spawnHealVFX(this, target.x, target.y);

    this.exitAllyTargeting();
  }

  private exitAllyTargeting() {
    this.allyTargeting = null;
    this.events.emit('aoe-cancel');
  }

  /** Клик в режиме прицеливания — проверки и запуск каста */
  private fireAoeSpell(worldX: number, worldY: number) {
    if (!this.aoeTargeting || !this.playerBody) return;
    const { slotIndex, spell } = this.aoeTargeting;

    const slot = this.playerBody.abilitySlots[slotIndex];
    if (!slot || slot.cooldownRemaining > 0) { this.exitAoeTargeting(); return; }

    const castDist = distance(this.playerBody.x, this.playerBody.y, worldX, worldY);
    if (castDist > spell.range) {
      this.events.emit('spell-out-of-range');
      this.exitAoeTargeting();
      return;
    }

    if (!this.sphere.freeNextCast && this.playerBody.currentMana < spell.manaCost) {
      this.events.emit('no-mana');
      this.exitAoeTargeting();
      return;
    }

    // Выходим из режима прицеливания и начинаем каст
    this.aoeTargeting = null;
    this.aoeIndicator.clear().setVisible(false);

    const castTime = spell.castTime ?? 0;
    if (castTime > 0) {
      // Запуск каста — блокируем движение
      this.playerBody.isCasting = true;
      this.aoeCasting = {
        slotIndex, spell,
        targetX: worldX, targetY: worldY,
        elapsed: 0, duration: castTime,
      };
      this.events.emit('cast-start', { name: lt(spell.nameRu, spell.nameEn), duration: castTime });
    } else {
      // Мгновенный выстрел
      this.doAoeDamage(spell, slotIndex, worldX, worldY);
    }
  }

  /** Вызывается когда таймер каста завершился */
  private executeAoeSpell() {
    if (!this.aoeCasting || !this.playerBody) return;
    const { spell, slotIndex, targetX, targetY } = this.aoeCasting;
    this.playerBody.isCasting = false;
    this.aoeCasting = null;
    this.events.emit('cast-end');
    this.doAoeDamage(spell, slotIndex, targetX, targetY);
  }

  /** Наносит AoE урон и ставит кулдаун */
  private doAoeDamage(spell: AbilityDef, slotIndex: number, worldX: number, worldY: number) {
    if (!this.playerBody) return;
    const slot = this.playerBody.abilitySlots[slotIndex];
    if (!slot) return;

    if (this.sphere.freeNextCast) {
      this.sphere.freeNextCast = false;
    } else {
      this.playerBody.currentMana = Math.max(0, this.playerBody.currentMana - spell.manaCost);
    }
    slot.cooldownRemaining = spell.cooldown;
    this.sphere.abilityCooldowns[spell.id] = spell.cooldown;

    const radius = spell.aoeRadius ?? 60;

    // ── Прыжок в точку (Землетрясение и пр.) ───────────────────────────
    if (spell.leapDistance && this.playerBody) {
      const dx = worldX - this.playerBody.x;
      const dy = worldY - this.playerBody.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const leap = Math.min(spell.leapDistance, dist);
      this.playerBody.x += (dx / dist) * leap;
      this.playerBody.y += (dy / dist) * leap;
    }

    // ── Ground Zone: создаём зону вместо мгновенного урона ──────────────
    if (spell.effectType === 'ground_zone') {
      this.spawnGroundZone(worldX, worldY, radius, spell);
      return;
    }

    // ── Summon Ent: damage absorber ─────────────────────────────────────
    if (spell.effectType === 'summon_ent') {
      this.spawnEnt(worldX, worldY, spell);
      return;
    }

    // ── Fire Tsunami: wave + burning ground ──────────────────────────────
    if (spell.effectType === 'fire_tsunami') {
      this.spawnFireTsunami(worldX, worldY, spell);
      return;
    }

    // ── Wind Barrier: ветряной барьер ──────────────────────────────────────
    if (spell.effectType === 'wind_barrier') {
      this.spawnWindBarrier(worldX, worldY, radius, spell, true);
      return;
    }

    // ── Summon Wall: призыв стены ────────────────────────────────────────
    if (spell.effectType === 'summon_wall') {
      const int = this.sphere.stats[StatName.Intellect] ?? 1;
      const hp = Math.round((spell.wallHP ?? 50) * (1 + int / 100));
      this.spawnWall(worldX, worldY, spell, hp, true);
      return;
    }

    this.spawnAoeFlash(worldX, worldY, radius);
    // Spell-specific AoE: projectile flying to point + impact animation
    if (this.playerBody) {
      spawnSpellProjectile(this, this.playerBody.x, this.playerBody.y, worldX, worldY, spell.id);
      spawnProjectileVFX(this, this.playerBody.x, this.playerBody.y, worldX, worldY, spell.school ?? 'neutral');
    }
    spawnSpellImpact(this, worldX, worldY, spell.id, (spell.aoeRadius ?? 60) * 2);

    for (const c of this.creatures) {
      if (c.isDead) continue;
      if (distance(c.x, c.y, worldX, worldY) > radius) continue;
      const result = calcMagicDamage(this.getEffectiveStats(), c.stats, spell.baseDamage);
      const aoeDmg = this.sphere.deathDebuffRemaining > 0
        ? Math.round(result.final * DEATH_DEBUFF_MULT) : result.final;
      c.takeDamage(aoeDmg);
      this.aggroCreature(c);
      this.damageTexts.push(new DamageText(this, c.x, c.y - 10, aoeDmg, result.crit, false));
      if (spell.statusEffect && Math.random() < (spell.statusChance ?? 1)) c.applyStatus(spell.statusEffect);
      if (c.isDead) this.onCreatureKilled(c);
    }
  }

  /** Возвращает 4 угла повёрнутого прямоугольника как Phaser.Geom.Point[] */
  private getRotatedRectPoints(cx: number, cy: number, halfW: number, halfT: number, angle: number): Phaser.Geom.Point[] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const corners = [
      { lx: -halfW, ly: -halfT },
      { lx:  halfW, ly: -halfT },
      { lx:  halfW, ly:  halfT },
      { lx: -halfW, ly:  halfT },
    ];
    return corners.map(c => new Phaser.Geom.Point(
      cx + c.lx * cos - c.ly * sin,
      cy + c.lx * sin + c.ly * cos,
    ));
  }

  private aggroCreature(creature: Creature) {
    if (!creature.isDead && (creature.aiState === 'idle' || creature.aiState === 'wander')) {
      creature.aiState = 'chase';
    }
  }

  /** Доп. урон от зачарования оружия (если активно) */
  private applyEnchantDamage(target: Creature, didHit: boolean) {
    if (!didHit || !this.sphere.activeEnchant || target.isDead || !this.playerBody) return;
    const ench = this.sphere.activeEnchant;
    const enchBase = ench.enchantDamage ?? 8;
    const enchResult = calcMagicDamage(this.getEffectiveStats(), target.stats, enchBase);
    if (enchResult.hit) {
      const enchDmg = this.sphere.deathDebuffRemaining > 0
        ? Math.round(enchResult.final * DEATH_DEBUFF_MULT) : enchResult.final;
      target.takeDamage(enchDmg);
      if (ench.statusEffect) {
        const chance = ench.statusChance ?? 0.1;
        if (Math.random() < chance) target.applyStatus(ench.statusEffect);
      }
      this.time.delayedCall(150, () => {
        if (target.active) {
          this.damageTexts.push(new DamageText(this, target.x, target.y - 12, enchDmg, false, false));
        }
      });
      if (target.isDead) this.onCreatureKilled(target);
    }
  }

  private spawnAoeFlash(wx: number, wy: number, radius: number) {
    const gfx = this.add.graphics().setDepth(55);
    gfx.fillStyle(0xff6600, 0.55);
    gfx.fillCircle(wx, wy, radius);
    gfx.lineStyle(3, 0xffaa00, 0.9);
    gfx.strokeCircle(wx, wy, radius);
    // Inner bright core
    gfx.fillStyle(0xffdd88, 0.4);
    gfx.fillCircle(wx, wy, radius * 0.4);
    this.tweens.add({
      targets: gfx,
      alpha: 0,
      scaleX: 1.25,
      scaleY: 1.25,
      duration: 380,
      ease: 'Power2',
      onComplete: () => gfx.destroy(),
    });
  }

  // ═══ REGION: Placed Effects ═══════════════════════════════════════════════
  // spawnGroundZone, updateGroundZones, spawnWindBarrier, updateWindBarriers,
  // spawnWall, updateSummonedWalls, cancelPlacedEffect, destroyWall,
  // getWallAt, damageWall, isBlockedByWall, getWindBarrierReduction
  // TODO: extract to PlacedEffectsManager(scene, context) for ~380 lines reduction

  /** Создаёт зону на карте (ground_zone) — универсальная механика */
  private spawnGroundZone(wx: number, wy: number, radius: number, spell: AbilityDef, isPlayer = true, casterStats?: Stats) {
    const gfx = this.add.graphics().setDepth(5).setAlpha(0.6);
    const schoolColors: Record<string, number> = {
      fire: 0xff4400, water: 0x4488ff, earth: 0x886633, wind: 0xaaddcc,
      nature: 0x44aa44, poison: 0x66aa00, darkness: 0x440066,
    };
    const color = schoolColors[spell.school ?? ''] ?? 0xff6600;

    const isWall = spell.isWallShape ?? false;
    const wallW = spell.wallWidth ?? 140;
    const wallT = spell.wallThickness ?? 30;
    // Угол: перпендикулярно линии кастер→точка
    let angle = 0;
    if (isWall && this.playerBody) {
      const dx = wx - this.playerBody.x;
      const dy = wy - this.playerBody.y;
      angle = Math.atan2(dy, dx) + Math.PI / 2; // перпендикуляр
    }

    if (isWall) {
      const pts = this.getRotatedRectPoints(wx, wy, wallW / 2, wallT / 2, angle);
      gfx.fillStyle(color, 0.4);
      gfx.fillPoints(pts, true);
      gfx.lineStyle(2, color, 0.7);
      gfx.strokePoints(pts, true);
    } else {
      gfx.fillStyle(color, 0.35);
      gfx.fillCircle(wx, wy, radius);
      gfx.lineStyle(2, color, 0.7);
      gfx.strokeCircle(wx, wy, radius);
    }

    // Animated sprite overlay for zone
    let zoneSprite: Phaser.GameObjects.Sprite | null = null;
    const zoneAnimKey = getSpellZoneAnim(spell.id);
    if (zoneAnimKey && this.anims.exists(zoneAnimKey)) {
      zoneSprite = this.add.sprite(wx, wy, zoneAnimKey).setDepth(6);
      zoneSprite.play(zoneAnimKey);
      zoneSprite.setDisplaySize(isWall ? wallW : radius * 2, isWall ? wallT * 2 : radius * 2);
      zoneSprite.setAlpha(0.8);
      if (spell.school === 'fire') zoneSprite.setFlipY(true);
      if (isWall) zoneSprite.setRotation(angle);
    }

    this.groundZones.push({
      x: wx, y: wy, radius,
      dps: spell.zoneDps ?? 10,
      remaining: spell.zoneDuration ?? 5,
      tickTimer: 0,
      school: spell.school,
      statusEffect: spell.statusEffect,
      statusChance: spell.statusChance,
      spellId: spell.id,
      casterStats: casterStats ?? { ...this.sphere.stats },
      ownerIsPlayer: isPlayer,
      isWall, wallWidth: wallW, wallThickness: wallT, angle,
      followPlayer: isPlayer && spell.range === 0,
      gfx,
      sprite: zoneSprite ?? undefined,
    });
  }

  /** Обновляет все ground_zone: тик урона, удаление истёкших */
  private updateGroundZones(delta: number) {
    const dt = delta / 1000;
    for (let i = this.groundZones.length - 1; i >= 0; i--) {
      const zone = this.groundZones[i];
      zone.remaining -= dt;
      zone.tickTimer -= dt;

      if (zone.remaining <= 0) {
        zone.gfx.destroy();
        if (zone.sprite) zone.sprite.destroy();
        this.groundZones.splice(i, 1);
        continue;
      }

      // Следование за игроком (Whirlwind и пр.)
      if (zone.followPlayer && this.playerBody) {
        zone.x = this.playerBody.x;
        zone.y = this.playerBody.y;
        zone.gfx.clear();
        const color = ({ fire: 0xff4400, water: 0x4488ff, earth: 0x886633, wind: 0xaaddcc, nature: 0x44aa44 } as Record<string, number>)[zone.school ?? ''] ?? 0xff6600;
        zone.gfx.fillStyle(color, 0.35);
        zone.gfx.fillCircle(zone.x, zone.y, zone.radius);
        zone.gfx.lineStyle(2, color, 0.7);
        zone.gfx.strokeCircle(zone.x, zone.y, zone.radius);
        if (zone.sprite) zone.sprite.setPosition(zone.x, zone.y);
      }

      // Пульсация альфы
      zone.gfx.setAlpha(0.3 + 0.2 * Math.sin(zone.remaining * 3));

      // Тик урона раз в секунду
      if (zone.tickTimer <= 0) {
        zone.tickTimer = 1;

        // Определяем статус-эффект: спелл-специфичный > школьный
        let zoneStatus: StatusEffectId | undefined;
        let zoneStatusChance = 0;
        if (zone.statusEffect) {
          zoneStatus = zone.statusEffect;
          zoneStatusChance = zone.statusChance ?? 0.2;
        } else if (zone.school) {
          const bonus = SCHOOL_BONUSES[zone.school];
          if (bonus?.statusEffect) {
            zoneStatus = bonus.statusEffect;
            zoneStatusChance = bonus.statusChance ?? 0;
          }
        }

        const inZone = (tx: number, ty: number) => zone.isWall
          ? pointInRotatedRect(tx, ty, zone.x, zone.y, zone.wallWidth / 2, zone.wallThickness / 2, zone.angle)
          : distance(tx, ty, zone.x, zone.y) <= zone.radius;

        if (zone.ownerIsPlayer) {
          for (const c of this.creatures) {
            if (c.isDead) continue;
            if (!inZone(c.x, c.y)) continue;
            const r = calcMagicDamage(zone.casterStats, c.stats, zone.dps);
            c.takeDamage(r.final);
            this.damageTexts.push(new DamageText(this, c.x, c.y - 10, r.final, false, false));
            if (zoneStatus && Math.random() < zoneStatusChance) {
              c.applyStatus(zoneStatus);
            }
            if (c.isDead) this.onCreatureKilled(c);
          }
        } else if (this.playerBody && !this.playerBody.isDead) {
          if (inZone(this.playerBody.x, this.playerBody.y)) {
            const r = calcMagicDamage(zone.casterStats, this.sphere.stats, zone.dps);
            this.playerBody.takeDamage(r.final);
            this.damageTexts.push(new DamageText(this, this.playerBody.x, this.playerBody.y - 10, r.final, false, false));
            if (zoneStatus && Math.random() < zoneStatusChance) {
              this.playerBody.applyStatus(zoneStatus);
            }
            if (this.playerBody.isDead) this.onPlayerDeath();
          }
        }
      }
    }
  }

  /** Создаёт ветряной барьер (wind_barrier) — универсальная механика */
  private spawnWindBarrier(wx: number, wy: number, radius: number, spell: AbilityDef, isPlayer: boolean) {
    const gfx = this.add.graphics().setDepth(4).setAlpha(0.4);
    const isWall = spell.isWallShape ?? false;
    const halfW = (spell.wallWidth ?? 160) / 2;
    const halfT = (spell.wallThickness ?? 20) / 2;
    let angle = 0;
    if (isWall && this.playerBody) {
      const dx = wx - this.playerBody.x;
      const dy = wy - this.playerBody.y;
      angle = Math.atan2(dy, dx) + Math.PI / 2;
    }

    if (isWall) {
      const pts = this.getRotatedRectPoints(wx, wy, halfW, halfT, angle);
      gfx.fillStyle(0xaaddff, 0.2);
      gfx.fillPoints(pts, true);
      gfx.lineStyle(3, 0xaaddff, 0.6);
      gfx.strokePoints(pts, true);
    } else {
      gfx.lineStyle(3, 0xaaddff, 0.6);
      gfx.strokeCircle(wx, wy, radius);
      gfx.lineStyle(1, 0xcceeFF, 0.3);
      gfx.strokeCircle(wx, wy, radius * 0.7);
    }

    this.windBarriers.push({
      x: wx, y: wy, radius,
      damageReduction: spell.barrierDamageReduction ?? 0.25,
      remaining: spell.barrierDuration ?? 8,
      spellId: spell.id,
      ownerIsPlayer: isPlayer,
      isWall, halfW, halfT, angle,
      gfx,
    });
  }

  /** Обновляет ветряные барьеры: таймер, удаление */
  private updateWindBarriers(delta: number) {
    const dt = delta / 1000;
    for (let i = this.windBarriers.length - 1; i >= 0; i--) {
      const b = this.windBarriers[i];
      b.remaining -= dt;
      if (b.remaining <= 0) {
        b.gfx.destroy();
        this.windBarriers.splice(i, 1);
        continue;
      }
      // Пульсация + вращение визуала
      b.gfx.setAlpha(0.25 + 0.15 * Math.sin(b.remaining * 4));
      b.gfx.setRotation(b.gfx.rotation + dt * 0.5);
    }
  }

  /**
   * Проверяет снижение урона от ветряных барьеров.
   * Если снаряд/урон пролетает через зону барьера — урон снижается.
   * @param fromX - откуда летит урон
   * @param toX - куда летит (позиция цели)
   * @param protectsPlayer - true = проверяем барьеры защищающие игрока
   */
  public getWindBarrierReduction(fromX: number, fromY: number, toX: number, toY: number, protectsPlayer: boolean): number {
    let reduction = 0;
    for (const b of this.windBarriers) {
      if (b.ownerIsPlayer !== protectsPlayer) continue;
      // Проверяем пересекает ли линия (from→to) барьер
      const dx = toX - fromX;
      const dy = toY - fromY;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const t = ((b.x - fromX) * dx + (b.y - fromY) * dy) / (len * len);
      if (t < 0 || t > 1) continue;
      const closestX = fromX + t * dx;
      const closestY = fromY + t * dy;
      // Проверка: ближайшая точка линии внутри барьера?
      const inside = b.isWall
        ? pointInRotatedRect(closestX, closestY, b.x, b.y, b.halfW, b.halfT + 10, b.angle)
        : distance(closestX, closestY, b.x, b.y) <= b.radius;
      if (inside) {
        reduction = Math.max(reduction, b.damageReduction);
      }
    }
    return reduction;
  }

  /** Создаёт разрушаемую стену (summon_wall) — универсальная механика */
  private spawnWall(wx: number, wy: number, spell: AbilityDef, hp: number, isPlayer: boolean) {
    const gfx = this.add.graphics().setDepth(10);
    const color = isPlayer ? 0x886633 : 0x664422;
    const halfW = (spell.wallWidth ?? 120) / 2;
    const halfT = (spell.wallThickness ?? 24) / 2;

    // Угол: перпендикулярно кастер→точка
    let angle = 0;
    if (this.playerBody) {
      const dx = wx - this.playerBody.x;
      const dy = wy - this.playerBody.y;
      angle = Math.atan2(dy, dx) + Math.PI / 2;
    }

    const pts = this.getRotatedRectPoints(wx, wy, halfW, halfT, angle);
    gfx.fillStyle(color, 0.85);
    gfx.fillPoints(pts, true);
    gfx.lineStyle(2, 0xaa8844, 1);
    gfx.strokePoints(pts, true);

    // HP бар
    const barW = halfW * 2;
    const barH = 4;
    const hpBarBg = this.add.rectangle(wx, wy - halfT - 8, barW, barH, 0x333333).setDepth(11).setOrigin(0.5);
    const hpBar = this.add.rectangle(wx - barW / 2, wy - halfT - 8, barW, barH, 0x44aa44).setDepth(12).setOrigin(0, 0.5);

    const remaining = spell.barrierDuration ?? -1;
    this.summonedWalls.push({ x: wx, y: wy, halfW, halfT, angle, hp, maxHP: hp, remaining, spellId: spell.id, ownerIsPlayer: isPlayer, gfx, hpBar, hpBarBg });
  }

  /** Проверяет столкновение точки со стенами, возвращает стену или null */
  public getWallAt(x: number, y: number): SummonedWall | null {
    for (const w of this.summonedWalls) {
      if (pointInRotatedRect(x, y, w.x, w.y, w.halfW, w.halfT, w.angle)) return w;
    }
    return null;
  }

  /** Наносит урон стене, уничтожает при HP≤0 */
  public damageWall(wall: SummonedWall, amount: number) {
    wall.hp -= amount;
    const ratio = Math.max(0, wall.hp / wall.maxHP);
    wall.hpBar.width = wall.halfW * 2 * ratio;
    // Цвет HP бара
    if (ratio > 0.5) wall.hpBar.setFillStyle(0x44aa44);
    else if (ratio > 0.25) wall.hpBar.setFillStyle(0xaaaa44);
    else wall.hpBar.setFillStyle(0xaa4444);

    if (wall.hp <= 0) {
      this.destroyWall(wall);
    }
  }

  private updateSummonedWalls(delta: number) {
    const dt = delta / 1000;
    for (let i = this.summonedWalls.length - 1; i >= 0; i--) {
      const w = this.summonedWalls[i];
      if (w.remaining > 0) {
        w.remaining -= dt;
        if (w.remaining <= 0) {
          this.destroyWall(w);
        }
      }
    }
  }

  /** Отменяет стену/зону/барьер по spellId (повторное нажатие) */
  private cancelPlacedEffect(spellId: string): boolean {
    // Стены
    for (const w of this.summonedWalls) {
      if (w.spellId === spellId && w.ownerIsPlayer) {
        this.destroyWall(w);
        return true;
      }
    }
    // Зоны
    for (let i = this.groundZones.length - 1; i >= 0; i--) {
      const z = this.groundZones[i];
      if (z.spellId === spellId && z.ownerIsPlayer) {
        z.gfx.destroy();
        this.groundZones.splice(i, 1);
        return true;
      }
    }
    // Барьеры
    for (let i = this.windBarriers.length - 1; i >= 0; i--) {
      const b = this.windBarriers[i];
      if (b.spellId === spellId && b.ownerIsPlayer) {
        b.gfx.destroy();
        this.windBarriers.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  private destroyWall(wall: SummonedWall) {
    wall.gfx.destroy();
    wall.hpBar.destroy();
    wall.hpBarBg.destroy();
    const idx = this.summonedWalls.indexOf(wall);
    if (idx >= 0) this.summonedWalls.splice(idx, 1);
  }

  /** Блокировка движения — вызывается из update тела/существа */
  public isBlockedByWall(x: number, y: number, excludePlayer: boolean): boolean {
    for (const w of this.summonedWalls) {
      if (w.ownerIsPlayer === excludePlayer) continue;
      if (pointInRotatedRect(x, y, w.x, w.y, w.halfW, w.halfT + 4, w.angle)) return true;
    }
    return false;
  }

  /** Летящий снаряд: визуальный, урон уже применён */
  private spawnProjectile(
    fromX: number, fromY: number,
    toX: number,   toY: number,
    color: number, len: number, rad: number,
  ) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    const dist  = Math.sqrt(dx * dx + dy * dy);
    const speed = 420; // px/s
    const dur   = Math.min(600, (dist / speed) * 1000);

    const proj = this.add.rectangle(fromX, fromY, len, rad, color, 0.95)
      .setRotation(angle).setDepth(52);

    this.tweens.add({
      targets: proj,
      x: toX, y: toY,
      duration: dur,
      ease: 'Linear',
      onComplete: () => proj.destroy(),
    });
  }

  /** Разговор с доской квестов — только для авто-квестов (без giverNpcId) */
  private tryTalkToQuestGiver(): boolean {
    const qp = this.questGiverPos;
    const entity = this.playerBody ?? this.sphere;
    if (distance(entity.x, entity.y, qp.x, qp.y) > 80) return false;

    // Find next auto-quest (no giverNpcId)
    const next = this.questTracker.getNextQuest();
    const autoNext = next && !next.def.giverNpcId ? next : null;

    if (autoNext?.def.dialogStart) {
      this.events.emit('show-dialog', {
        messages: [{ speaker: 'Quest Board', text: autoNext.def.dialogStart }],
      });
    }

    const active = this.questTracker.getActive();
    const done = this.questTracker.getCompleted();
    this.events.emit('quest-giver-talk', { active, done });
    return true;
  }

  private exitAoeTargeting() {
    this.aoeTargeting = null;
    this.aoeIndicator.clear().setVisible(false);
    // Отмена каста
    if (this.aoeCasting && this.playerBody) {
      this.playerBody.isCasting = false;
    }
    this.aoeCasting = null;
    this.events.emit('cast-end');
  }

  // ─── Респаун ──────────────────────────────────────────

  private scheduleRespawn(creature: Creature) {
    this.respawnQueue.push({
      id: creature.definition.id,
      x: creature.spawnX,
      y: creature.spawnY,
      timer: this.RESPAWN_DELAY,
    });
  }

  // ═══ REGION: Lab Defense Dungeon (зона lab) ════════════════════════════════
  // Прототип данжа парового мира: волны тварей Пустоты атакуют игрока
  // (сталкеры) и Машину Переноса (громилы, фракция void→lab).
  // Вход (dev): F8 из любой зоны. TODO: нарративный вход после Игниса.

  private initLabDungeon() {
    this.labState = 'idle';
    this.labWave = 0;
    this.labCheckTimer = 0;
    this.labSpawnPending = false;
    this.labRitual = 'none';
    this.labRitualTimer = 0;
    this.labRitualReinforced = false;
    this.labMachine = this.creatures.find(c => c.definition.id === 'transfer_machine') ?? null;

    // Разрыв Пустоты на севере — пульсирующий тёмный овал
    const zw = this.currentZone.widthTiles * TILE_SIZE;
    this.labRiftX = zw / 2;
    this.labRiftY = 220;
    this.labRiftGfx = this.add.graphics().setDepth(5);
    this.labRiftGfx.fillStyle(0x2a1040, 0.85).fillEllipse(this.labRiftX, this.labRiftY, 150, 56);
    this.labRiftGfx.lineStyle(2, 0x8844cc, 0.8).strokeEllipse(this.labRiftX, this.labRiftY, 150, 56);
    this.tweens.add({ targets: this.labRiftGfx, alpha: { from: 0.65, to: 1 }, duration: 900, yoyo: true, repeat: -1 });

    // Вводный диалог близких → после него стартуют волны
    this.events.emit('show-dialog', {
      messages: LAB_INTRO_DIALOG,
      onEnd: () => {
        this.time.delayedCall(2000, () => {
          if (this.currentZone.id !== 'lab' || this.labState !== 'idle') return;
          this.labState = 'running';
          this.spawnLabWave(1);
        });
      },
    });
  }

  /** [E] у разрыва после зачистки волн — начать ритуал закрытия (канал 6 сек). */
  private tryStartLabRitual(): boolean {
    if (this.currentZone.id !== 'lab' || this.labRitual !== 'ready' || !this.playerBody) return false;
    const d = distance(this.playerBody.x, this.playerBody.y, this.labRiftX, this.labRiftY);
    if (d > 110) return false;
    this.labRitual = 'channeling';
    this.labRitualTimer = 6;
    this.labRitualReinforced = false;
    this.events.emit('log', { text: lt('Ритуал начат. Не двигайся!', 'The ritual has begun. Hold still!'), color: '#bb88ff' });
    return true;
  }

  /** Состав волн: сталкеры охотятся на игрока, громилы ломают Машину. */
  private spawnLabWave(n: number) {
    this.labWave = n;
    const zw = this.currentZone.widthTiles * TILE_SIZE;
    const riftX = zw / 2, riftY = 220; // разрыв на севере
    const spawnVoid = (id: string, x: number, y: number) => {
      const def = CREATURE_DB[id];
      if (!def) return;
      const c = new Creature(this, x, y, def);
      this.applyCreatureEnv(c);
      this.creatures.push(c);
    };
    if (n === 1) {
      // 3 сталкера от разрыва — расходятся к игроку
      spawnVoid('void_stalker', riftX - 120, riftY);
      spawnVoid('void_stalker', riftX, riftY + 40);
      spawnVoid('void_stalker', riftX + 120, riftY);
      this.events.emit('log', { text: lt('Волна 1: твари Пустоты!', 'Wave 1: Void creatures!'), color: '#bb88ff' });
    } else if (n === 2) {
      // громила идёт на Машину + 2 сталкера на игрока
      spawnVoid('void_brute', riftX, riftY);
      spawnVoid('void_stalker', riftX - 160, riftY + 30);
      spawnVoid('void_stalker', riftX + 160, riftY + 30);
      this.events.emit('log', { text: lt('Волна 2: они идут к Машине!', 'Wave 2: they are coming for the Machine!'), color: '#bb88ff' });
    } else {
      // финальная: 2 громилы + 3 сталкера
      spawnVoid('void_brute', riftX - 100, riftY);
      spawnVoid('void_brute', riftX + 100, riftY);
      spawnVoid('void_stalker', riftX - 200, riftY + 40);
      spawnVoid('void_stalker', riftX, riftY + 60);
      spawnVoid('void_stalker', riftX + 200, riftY + 40);
      this.events.emit('log', { text: lt('Последняя волна! Защити Машину!', 'Final wave! Protect the Machine!'), color: '#ff88ff' });
    }
  }

  private updateLabDungeon(delta: number) {
    if (this.labState !== 'running') return;
    // Поражение: Машина уничтожена
    if (this.labMachine && this.labMachine.isDead) {
      this.labState = 'defeat';
      this.showMessage(lt('Машина Переноса уничтожена. Путь между мирами потерян...', 'The Transfer Machine is destroyed. The way between worlds is lost...'));
      this.time.delayedCall(4000, () => {
        this.scene.restart({ zoneId: 'village', spawnX: undefined, spawnY: undefined });
      });
      return;
    }
    // Проверка зачистки волны — раз в 500мс
    this.labCheckTimer += delta;
    if (this.labCheckTimer < 500) return;
    this.labCheckTimer = 0;
    const aliveVoid = this.creatures.some(c => !c.isDead && c.definition.voidResistant);
    if (aliveVoid || this.labSpawnPending) return;
    if (this.labWave < 3) {
      this.labSpawnPending = true;
      this.events.emit('log', { text: lt(`Волна ${this.labWave} отбита.`, `Wave ${this.labWave} repelled.`), color: '#88ff88' });
      this.time.delayedCall(3000, () => {
        this.labSpawnPending = false;
        if (this.currentZone.id === 'lab' && this.labState === 'running') {
          this.spawnLabWave(this.labWave + 1);
        }
      });
    } else if (this.labRitual === 'none') {
      // Волны отбиты — разрыв нестабилен, нужно закрыть его вручную
      this.labRitual = 'ready';
      this.showMessage(lt('Разрыв нестабилен! Подойди и закрой его [E]', 'The rift is unstable! Approach and seal it [E]'));
    }
  }

  /** Тик ритуала закрытия разрыва (вызывается из updateLabDungeonRitual). */
  private updateLabRitual(delta: number) {
    if (this.labRitual !== 'channeling' || !this.playerBody) return;
    // Движение прерывает канал (как захват тела)
    if (this.playerBody.isMoving) {
      this.labRitual = 'ready';
      this.showMessage(lt('Ритуал прерван — нужно стоять у разрыва', 'Ritual interrupted — you must hold still at the rift'));
      return;
    }
    const total = 6;
    this.labRitualTimer -= delta / 1000;
    // На середине канала разрыв «огрызается» — последний сталкер
    if (!this.labRitualReinforced && this.labRitualTimer <= total / 2) {
      this.labRitualReinforced = true;
      const def = CREATURE_DB['void_stalker'];
      if (def) {
        const c = new Creature(this, this.labRiftX, this.labRiftY + 30, def);
        this.applyCreatureEnv(c);
        this.creatures.push(c);
        this.events.emit('log', { text: lt('Разрыв сопротивляется!', 'The rift fights back!'), color: '#ff88ff' });
      }
    }
    if (this.labRitualTimer > 0) return;

    // Разрыв закрыт — победа
    this.labRitual = 'done';
    this.labState = 'victory';
    if (this.labRiftGfx) {
      this.tweens.add({ targets: this.labRiftGfx, alpha: 0, scaleX: 0.1, scaleY: 0.1, duration: 1200 });
    }
    this.showMessage(lt('Разрыв закрыт. Лаборатория устояла.', 'The rift is sealed. The laboratory stands.'));
    this.events.emit('show-dialog', {
      messages: LAB_VICTORY_DIALOG,
      onEnd: () => {
        this.time.delayedCall(1500, () => {
          this.scene.restart({ zoneId: 'village', spawnX: undefined, spawnY: undefined });
        });
      },
    });
  }

  private tickRespawn(delta: number) {
    for (const entry of this.respawnQueue) {
      entry.timer -= delta;
    }

    const ready = this.respawnQueue.filter(e => e.timer <= 0);
    this.respawnQueue = this.respawnQueue.filter(e => e.timer > 0);

    for (const entry of ready) {
      const def = CREATURE_DB[entry.id];
      if (!def) continue;
      const creature = new Creature(this, entry.x, entry.y, def);
      this.applyCreatureEnv(creature);
      this.creatures.push(creature);
    }
  }

  // ─── Призыв ───────────────────────────────────────────

  /** Запускает КД волка на панели (после смерти волка) */
  private startWolfCooldown() {
    if (!this.playerBody) return;
    for (const slot of this.playerBody.abilitySlots) {
      if (slot.ability?.effectType === 'summon_wolf') {
        slot.cooldownRemaining = slot.ability.cooldown;
        break;
      }
    }
  }

  private spawnSummonedWolf(x: number, y: number) {
    const def = CREATURE_DB['wolf'];
    if (!def) return;
    const wolf = new Creature(this, x, y, def);
    wolf.isSummoned = true;
    wolf.summonTimer = Infinity; // волк живёт пока не убьют
    // Масштабирование от Интеллекта призывателя
    const intel = this.sphere.stats.intellect ?? 0;
    wolf.currentHP = wolf.currentHP + intel;
    wolf.stats.strength = (wolf.stats.strength ?? 0) + Math.floor(intel / 5);
    // Зелёный оттенок чтобы отличить от врагов
    wolf.setAlpha(0.85);
    this.creatures.push(wolf);
  }

  /** Призванный волк атакует существо */
  private creatureAttackWolf(creature: Creature, wolf: Creature) {
    const cwb = WEAPONS[creature.definition.weapon].baseDamage;
    const result = calcMeleeDamage(creature.stats, wolf.stats, cwb);
    if (result.hit) {
      wolf.takeDamage(result.final);
      this.damageTexts.push(new DamageText(this, wolf.x, wolf.y - 10, result.final, result.crit, false));
      if (wolf.isDead) {
        wolf.destroy();
        this.creatures = this.creatures.filter(c => c !== wolf);
        this.startWolfCooldown();
      }
    } else {
      this.damageTexts.push(new DamageText(this, wolf.x, wolf.y - 10, 0, false, true));
    }
    creature.attackCooldown = WEAPON_COOLDOWNS[creature.definition.weapon];
  }

  /**
   * Ближайший живой моб из противоборствующей фракции в радиусе AGGRO_RANGE.
   * Возвращает null если у моба нет фракции, нет подходящих противников, или
   * моб не боевой/убегающий.
   */
  private static FACTION_SIGHT = 600;
  /** Дальше этой дистанции от игрока мирные мобы обновляют AI ~10 раз/сек (квадрат, px²). */
  private static FAR_AI_DIST_SQ = 1600 * 1600;
  private findFactionEnemy(creature: Creature): Creature | null {
    const selfFaction = creature.definition.faction;
    if (!selfFaction) return null;
    if (creature.definition.immobile) return null; // Машина не ищет врагов
    if (creature.definition.type !== BodyType.Combat) return null;
    let best: Creature | null = null;
    let bestDist = GameScene.FACTION_SIGHT;
    this.creatureGrid.forEachNear(creature.x, creature.y, GameScene.FACTION_SIGHT, (other) => {
      if (other === creature || other.isDead || other.isSummoned) return;
      const otherFaction = other.definition.faction;
      if (!otherFaction || otherFaction === selfFaction) return;
      const d = distance(creature.x, creature.y, other.x, other.y);
      if (d < bestDist) { bestDist = d; best = other; }
    });
    return best;
  }

  /** Моб атакует моба — basic weapon damage. Общий путь для фракций. */
  private creatureAttackCreature(attacker: Creature, target: Creature) {
    const weapon = WEAPONS[attacker.definition.weapon];
    const result = calcMeleeDamage(attacker.stats, target.stats, weapon.baseDamage);
    if (result.hit) {
      target.takeDamage(result.final);
      this.damageTexts.push(new DamageText(this, target.x, target.y - 10, result.final, result.crit, false));
      if (target.isDead) this.onNpcVsNpcKill(target);
    } else {
      this.damageTexts.push(new DamageText(this, target.x, target.y - 10, 0, false, true));
    }
    attacker.attackCooldown = WEAPON_COOLDOWNS[attacker.definition.weapon];
  }

  /** Emit a combat-log line when an enemy damages the player. */
  private logIncomingDamage(attackerName: string, dmg: number, crit: boolean, spellName?: string) {
    if (dmg <= 0) return;
    const via = spellName ? ` (${spellName})` : '';
    const text = crit
      ? `${attackerName} наносит ${dmg} урона${via} — крит!`
      : `${attackerName} наносит ${dmg} урона${via}`;
    this.events.emit('log', { text, color: crit ? '#ffaa44' : '#ff8888' });
  }

  /** Silent cleanup for NPC-vs-NPC kills — no log, no XP, no loot, no capture prompt. */
  private onNpcVsNpcKill(creature: Creature) {
    sfxDeath();
    if (creature.isSummoned) {
      creature.destroy();
      this.creatures = this.creatures.filter(c => c !== creature);
      return;
    }
    // Clear any faction targeting pointing at this victim
    for (const c of this.creatures) {
      if (c.factionTarget === creature) c.factionTarget = null;
    }
    // Body lingers briefly, then despawns and schedules respawn (no capture tween).
    this.time.delayedCall(15000, () => {
      if (creature.active) {
        this.scheduleRespawn(creature);
        creature.destroy();
        this.creatures = this.creatures.filter(c => c !== creature);
      }
    });
  }

  private summonedWolfAttackEnemy(wolf: Creature, target: Creature) {
    const weapon = WEAPONS[wolf.definition.weapon];
    const result = calcMeleeDamage(wolf.stats, target.stats, weapon.baseDamage);
    if (result.hit) {
      target.takeDamage(result.final);
      this.damageTexts.push(
        new DamageText(this, target.x, target.y - 10, result.final, result.crit, false)
      );
      if (target.isDead) this.onCreatureKilled(target);
    }
    wolf.attackCooldown = WEAPON_COOLDOWNS[wolf.definition.weapon];
  }
}
