import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { Creature } from '../entities/Creature';
import { DamageText } from '../entities/DamageText';
import { STARTER_BODIES, GOBLIN, WEAPON_COOLDOWNS, BodyType } from '../types/bodies';
import { lookupStarterBody } from '../data/starterBodies';
import { CREATURE_DB } from '../data/creatureDB';
import {
  MAP_WIDTH, MAP_HEIGHT, MAP_WIDTH_TILES, MAP_HEIGHT_TILES,
  TILE_SIZE, CAPTURE_RANGE,
} from '../utils/constants';
import { distance, clamp } from '../utils/math';
import { calcMeleeDamage, calcRangedDamage, calcMagicDamage } from '../systems/combat';
import { WEAPONS } from '../data/weapons';
import {
  CaptureProcess, CaptureState,
  startCapture, updateCapture, interruptCapture,
} from '../systems/capture';
import { addXP, isFirstCapReached } from '../systems/progression';
import { Stats, StatName } from '../types/stats';
import { AbilityDef } from '../types/abilities';
import { QuestTracker } from '../systems/questTracker';
import { QUESTS } from '../data/questDB';
import { saveSphere, loadSphere } from '../systems/saveLoad';
import { ALL_KNOWN_SPELLS } from '../data/allSpells';
import { ALL_ZONES, ZoneConfig } from '../data/zones';
import { rollLoot, ITEMS } from '../data/itemDB';
import { checkAchievements } from '../systems/achievements';
import { SCHOOL_BONUSES, MagicSchool } from '../data/magicSchools';
import { t } from '../i18n';
import { getNPCDialog, PROLOGUE_DIALOG } from '../data/dialogs';
import { RESOURCE_NODES, RECIPES } from '../data/itemDB';
import { STATUS_DEFS } from '../types/statuses';
import { spawnProjectileVFX, spawnHitVFX, spawnMeleeSwingVFX, spawnCastVFX, spawnHealVFX, spawnAoeVFX, spawnSpellImpact, spawnSpellProjectile, getSpellZoneAnim } from '../systems/vfx';
import { resumeAudio, sfxMeleeHit, sfxRangedShot, sfxMagicCast, sfxMagicHit, sfxCritHit, sfxDeath, sfxCapture, sfxHeal, sfxBuff, sfxBlock, sfxMiss, sfxLevelUp, sfxZoneTransition } from '../systems/sfx';
import { MOB_COPPER_DROPS, formatCurrency } from '../systems/currency';

// ── Summoned Ent (damage absorber) ───────────────────────────
interface SummonedEnt {
  x: number; y: number;
  hp: number; maxHP: number;
  radius: number;
  remaining: number;
  sprite: Phaser.GameObjects.Sprite | null;
  hpBar: Phaser.GameObjects.Rectangle;
  hpBarBg: Phaser.GameObjects.Rectangle;
}

// ── Fire Tsunami ─────────────────────────────────────────────
interface FireTsunami {
  x: number; y: number;           // center of the zone
  angle: number;                   // direction from target to caster
  width: number; depth: number;    // zone dimensions
  waveProgress: number;            // 0→1, wave position
  waveDuration: number;            // seconds for wave to cross
  waveHit: Set<Creature>;         // creatures already hit by wave
  baseDamage: number;              // instant wave damage
  burnRemaining: number;           // burning ground timer after wave
  burnDps: number;                 // burning ground DPS
  burnTickTimer: number;
  school: string;
  casterStats: Stats;
  ownerIsPlayer: boolean;
  waveSprite: Phaser.GameObjects.Sprite | null;
  burnSprites: Phaser.GameObjects.Sprite[];
  gfx: Phaser.GameObjects.Graphics;
}

// ── Зона на карте (ground_zone) ─────────────────────────────
interface GroundZone {
  x: number;
  y: number;
  radius: number;
  dps: number;
  remaining: number;
  tickTimer: number;
  school?: MagicSchool;
  statusEffect?: string;
  statusChance?: number;
  spellId: string;
  casterStats: Stats;
  ownerIsPlayer: boolean;
  followPlayer?: boolean;  // зона следует за игроком (Whirlwind)
  // Форма стены (прямоугольник)
  isWall: boolean;
  wallWidth: number;        // длина стены
  wallThickness: number;    // толщина
  angle: number;            // угол ориентации (рад)
  gfx: Phaser.GameObjects.Graphics;
  sprite?: Phaser.GameObjects.Sprite; // animated sprite overlay
}

// ── Призванная стена (summon_wall) ───────────────────────
interface SummonedWall {
  x: number;
  y: number;
  halfW: number;
  halfT: number;
  angle: number;
  hp: number;
  maxHP: number;
  remaining: number;        // секунд осталось (-1 = бессрочно)
  spellId: string;          // для отмены повторным нажатием
  ownerIsPlayer: boolean;
  gfx: Phaser.GameObjects.Graphics;
  hpBar: Phaser.GameObjects.Rectangle;
  hpBarBg: Phaser.GameObjects.Rectangle;
}

// ── Ветряной барьер (wind_barrier) ───────────────────────
interface WindBarrier {
  x: number;
  y: number;
  radius: number;
  damageReduction: number;
  remaining: number;
  spellId: string;
  ownerIsPlayer: boolean;
  isWall: boolean;
  halfW: number;
  halfT: number;
  angle: number;
  gfx: Phaser.GameObjects.Graphics;
}

/** Проверяет попадание точки в повёрнутый прямоугольник */
function pointInRotatedRect(px: number, py: number, cx: number, cy: number, halfW: number, halfT: number, angle: number): boolean {
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const dx = px - cx;
  const dy = py - cy;
  const lx = Math.abs(dx * cos - dy * sin);
  const ly = Math.abs(dx * sin + dy * cos);
  return lx <= halfW && ly <= halfT;
}

// ── Штраф за смерть ──────────────────────────────────────
// TODO: подобрать значения после тестирования баланса
const DEATH_XP_LOSS_PCT    = 0.10;  // 10% накопленного XP в текущих статах
const DEATH_DEBUFF_DURATION = 30;   // сек — длительность дебаффа
export const DEATH_DEBUFF_MULT = 0.85;  // ×0.85 к урону пока дебафф активен

/** Базовые атаки для каждого вида тела (слот 1).
 *  baseDamage = 0 — урон берётся из weapon.baseDamage в handleAttack */
const BASIC_ATTACKS: Record<string, AbilityDef> = {
  default: {
    id: 'basic_melee', nameRu: 'Strike', damageType: 'melee',
    cooldown: 1.2, manaCost: 0, range: 48, baseDamage: 0, description: 'Basic attack',
  },
  human_warrior: {
    id: 'basic_sword', nameRu: 'Sword Strike', damageType: 'melee',
    cooldown: 1.2, manaCost: 0, range: 48, baseDamage: 0, description: 'Sword attack',
  },
  human_archer: {
    id: 'basic_bow', nameRu: 'Shot', damageType: 'ranged',
    cooldown: 1.0, manaCost: 0, range: 200, baseDamage: 0, description: 'Bow shot',
  },
  human_mage: {
    id: 'basic_staff', nameRu: 'Staff Strike', damageType: 'magic',
    cooldown: 1.5, manaCost: 2, range: 180, baseDamage: 0, description: 'Magic shot',
  },
  rabbit: {
    id: 'basic_paw', nameRu: 'Paw Strike', damageType: 'melee',
    cooldown: 0.8, manaCost: 0, range: 36, baseDamage: 0, description: 'Quick paw strike',
  },
  goblin: {
    id: 'basic_dagger', nameRu: 'Dagger Stab', damageType: 'melee',
    cooldown: 0.8, manaCost: 0, range: 40, baseDamage: 0, description: 'Dagger stab',
  },
  wolf: {
    id: 'basic_bite', nameRu: 'Bite', damageType: 'melee',
    cooldown: 0.8, manaCost: 0, range: 38, baseDamage: 0, description: 'Wolf bite',
  },
};

export class GameScene extends Phaser.Scene {
  private sphere!: Sphere;
  private playerBody: Body | null = null;
  private creatures: Creature[] = [];
  private damageTexts: DamageText[] = [];
  private groundZones: GroundZone[] = [];
  private summonedWalls: SummonedWall[] = [];
  private windBarriers: WindBarrier[] = [];
  private starterBodies: Phaser.GameObjects.Arc[] = [];

  // World objects
  private resourceNodes: { x: number; y: number; def: import('../data/itemDB').ResourceNodeDef; gfx: Phaser.GameObjects.Container; cooldown: number; depleted: boolean }[] = [];
  private workbenches: { x: number; y: number; type: string; nameRu: string; gfx: Phaser.GameObjects.Container }[] = [];
  private worldNPCs: { x: number; y: number; id: string; nameRu: string; role: string; gfx: Phaser.GameObjects.Container }[] = [];

  // Fire tsunamis
  private fireTsunamis: FireTsunami[] = [];
  // Summoned Ents
  private summonedEnts: SummonedEnt[] = [];

  // Zone exit arrows (shown when near edge)
  private exitArrows: Phaser.GameObjects.Text[] = [];

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
      { x: rp.x - 40, y: rp.y + 60 },  // Воин
      { x: rp.x,      y: rp.y + 60 },  // Лучник
      { x: rp.x + 40, y: rp.y + 60 },  // Маг
    ];
  }

  // Захват
  private captureProcess: CaptureProcess | null = null;
  private captureTarget: Creature | null = null;

  // Квесты
  private questTracker!: QuestTracker;

  // NPC-квестодатель — рядом с респауном
  private get questGiverPos() {
    const rp = this.currentZone.respawnPoint;
    return { x: rp.x + 100, y: rp.y - 40 };
  }

  // Выбранная цель
  private selectedTarget: Creature | null = null;
  private targetIndicator!: Phaser.GameObjects.Arc;

  // AoE прицеливание
  private aoeTargeting: { slotIndex: number; spell: AbilityDef } | null = null;
  private aoeCasting: {
    slotIndex: number; spell: AbilityDef;
    targetX: number; targetY: number;
    elapsed: number; duration: number;
  } | null = null;
  private aoeIndicator!: Phaser.GameObjects.Graphics;

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
  private spawnX?: number;
  private spawnY?: number;

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
    this.damageTexts = [];
    this.groundZones = [];
    this.windBarriers = [];
    this.summonedWalls = [];
    this.playerBody = null;
    this.selectedTarget = null;
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
  }

  create() {
    // ─── Квесты ──────────────────────────────────────
    this.questTracker = new QuestTracker(QUESTS);

    // ─── Тайловая карта ──────────────────────────────
    this.buildMap();

    // ─── Сфера ───────────────────────────────────────
    const startX = this.spawnX ?? this.currentZone.respawnPoint.x;
    const startY = this.spawnY ?? this.currentZone.respawnPoint.y;
    this.sphere = new Sphere(this, startX, startY);

    if (this.isNewGame) {
      this.sphere.characterName = this.newGameCharName ?? '';
      if (this.newGameWeapon1) {
        const itemId1 = `starter_${this.newGameWeapon1}`;
        this.sphere.equipment.weapon = itemId1;
        if (!this.sphere.inventory.find(i => i.itemId === itemId1)) {
          this.sphere.inventory.push({ itemId: itemId1, quantity: 1 });
        }
      }
      if (this.newGameWeapon2) {
        const itemId2 = `starter_${this.newGameWeapon2}`;
        this.sphere.equipment.weapon2 = itemId2;
        if (!this.sphere.inventory.find(i => i.itemId === itemId2)) {
          this.sphere.inventory.push({ itemId: itemId2, quantity: 1 });
        }
      }
    } else {
      const loaded = loadSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
      if (loaded) this.events.emit('save-loaded');
    }

    // ─── Восстановление тела (загрузка) или авто-вселение (новая игра) ─────
    const autoBodyId = this.isNewGame ? this.newGameBodyId : this.sphere.lastBodyId;
    if (autoBodyId) {
      const bodyDef = CREATURE_DB[autoBodyId] ?? lookupStarterBody(autoBodyId);
      if (bodyDef) {
        this.playerBody = new Body(this, startX, startY, bodyDef, this.sphere.stats);
        this.playerBody.wallCheckFn = (x, y) => this.isBlockedByWall(x, y, true);
        this.playerBody.possess(this);
        this.fillBodySlots(this.playerBody);
        this.sphere.enterBody();
        this.sphere.lastBodyId = bodyDef.id;
        if (this.isNewGame) {
          saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
        }
      }
    }

    // ─── Стартовые тела (визуальные маркеры) ─────────
    this.createStarterMarkers();

    // ─── Мобы ────────────────────────────────────────
    this.spawnCreatures();

    // ─── Ресурсные ноды, верстаки, NPC ───────────────
    this.spawnWorldObjects();

    // ─── Exit arrows (hidden, shown near edge) ──────
    this.createExitArrows();

    // ─── Камера ──────────────────────────────────────
    const zoneW = this.currentZone.widthTiles * TILE_SIZE;
    const zoneH = this.currentZone.heightTiles * TILE_SIZE;
    this.cameras.main.setBounds(0, 0, zoneW, zoneH);
    this.cameras.main.startFollow(this.sphere, true, 0.1, 0.1);

    // Show prologue on first game start (village only)
    if (this.currentZone.id === 'village') {
      this.time.delayedCall(500, () => this.showPrologue());
    }

    // ─── Индикатор выбранной цели ─────────────────────
    this.targetIndicator = this.add.arc(0, 0, 18, 0, 360, false, 0xffff00, 0)
      .setStrokeStyle(2, 0xffff00, 0.8).setVisible(false);

    // ─── AoE индикатор (следует за мышью) ─────────────
    this.aoeIndicator = this.add.graphics().setDepth(60).setVisible(false);

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
    this.events.on('spell-learned', (spell: import('../types/abilities').AbilityDef) => {
      if (this.playerBody) this.fillBodySlots(this.playerBody);
      const spellCompleted = this.questTracker.onSpellLearned(spell.id);
      for (const q of spellCompleted) this.onQuestComplete(q);
      // Check spell achievements
      const spellAch = checkAchievements(this.sphere);
      for (const ach of spellAch) {
        this.events.emit('achievement-unlocked', ach);
      }
    });

    // Переключение отслеживания квеста
    this.events.on('track-quest', (questId: string) => {
      const ids = this.sphere.trackedQuestIds;
      const idx = ids.indexOf(questId);
      if (idx >= 0) {
        ids.splice(idx, 1);
      } else {
        ids.push(questId);
      }
      saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
    });

    // Назначение заклинания в слот из spell picker (из UIScene)
    this.events.on('assign-spell', (data: { slotIndex: number; spell: import('../types/abilities').AbilityDef | null }) => {
      if (!this.playerBody) return;
      const slot = this.playerBody.abilitySlots[data.slotIndex];
      if (!slot) return;
      slot.ability = data.spell;
      slot.cooldownRemaining = 0;
      // Сохраняем назначение в Сферу
      this.sphere.savedSlotIds[data.slotIndex] = data.spell?.id ?? null;
      saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
    });

    // ─── Клик ────────────────────────────────────────
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      resumeAudio(); // Unlock audio on first click
      // Правая кнопка — отмена AoE
      if (pointer.rightButtonDown()) {
        this.exitAoeTargeting();
        return;
      }
      if (!pointer.leftButtonDown()) return;

      // Если активен режим AoE — выстрел
      if (this.aoeTargeting) {
        this.fireAoeSpell(pointer.worldX, pointer.worldY);
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
      } else {
        this.handleAttack();
      }
    });
  }

  update(time: number, delta: number) {
    // ── Проверка перехода между зонами ──────────────────
    this.checkZoneTransition();

    // Обновляем сферу
    this.sphere.update(time, delta);

    // Обновляем тело игрока
    if (this.playerBody) {
      this.playerBody.update(time, delta);
      // Камера следит за телом
      this.cameras.main.startFollow(this.playerBody, true, 0.1, 0.1);

      // Выход из тела [Q]
      if (Phaser.Input.Keyboard.JustDown(this.keyQ)) {
        this.exitBody();
      }
      // [E] в теле — лут, квестодатель, ноды, верстаки, NPC, захват
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        if (!this.tryPickupLoot() && !this.tryTalkToQuestGiver() && !this.tryInteractWorldObject()) {
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
      }
    } else {
      this.cameras.main.startFollow(this.sphere, true, 0.1, 0.1);

      // В астрале: [E] — NPC, захват стартового тела, или мёртвого существа
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.tryTalkToQuestGiver() ||
        this.tryPossessStarter()   ||
        this.tryCaptureDead();
      }
    }

    // Обновляем мобов
    const px = this.playerBody?.x ?? -9999;
    const py = this.playerBody?.y ?? -9999;
    for (const creature of this.creatures) {
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
          for (const c of this.creatures) {
            if (c === creature || c.isDead || c.isSummoned) continue;
            const d = distance(creature.x, creature.y, c.x, c.y);
            if (d < nearestDist) { nearestDist = d; wolfTarget = c; }
          }
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

      creature.update(time, delta, px, py);

      // Моб атакует игрока или призванного волка — базовая атака оружием
      if (creature.aiState === 'attack' && this.playerBody && creature.attackCooldown <= 0) {
        // Если рядом призванный волк — может атаковать его
        let wolfNearby: Creature | null = null;
        for (const c of this.creatures) {
          if (!c.isSummoned || c.isDead) continue;
          const d = distance(creature.x, creature.y, c.x, c.y);
          if (d < WEAPONS[creature.definition.weapon].range * 1.2) { wolfNearby = c; break; }
        }
        if (wolfNearby) {
          this.creatureAttackWolf(creature, wolfNearby);
        } else {
          this.creatureAttackPlayer(creature);
        }
      }

      // Моб кастует заклинание (мгновенное)
      if (creature.aiState === 'attack' && this.playerBody) {
        const spell = creature.getReadySpell();
        if (spell) this.creatureCastSpell(creature, spell);
      }

      // Завершение каста (castTime заклинания)
      if (creature.castingSpell && creature.castTimer <= 0 && this.playerBody) {
        const spell = creature.consumeCastingSpell();
        if (spell) this.creatureCastSpell(creature, spell);
      }
    }

    // Столкновения: тело игрока ↔ мобы
    if (this.playerBody) {
      for (const c of this.creatures) {
        if (c.isDead) continue;
        const dx = this.playerBody.x - c.x;
        const dy = this.playerBody.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = 26; // 14 + 12 — радиусы тела и моба
        if (dist > 0 && dist < minDist) {
          const push = (minDist - dist) / dist;
          this.playerBody.x += dx * push * 0.6;
          this.playerBody.y += dy * push * 0.6;
          c.x -= dx * push * 0.4;
          c.y -= dy * push * 0.4;
        }
      }
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

    // Индикатор выбранной цели
    if (this.selectedTarget && !this.selectedTarget.isDead && this.selectedTarget.active) {
      this.targetIndicator.setPosition(this.selectedTarget.x, this.selectedTarget.y).setVisible(true);
    } else {
      this.selectedTarget = null;
      this.targetIndicator.setVisible(false);
    }

    // AoE индикатор — следует за мышью
    if (this.aoeTargeting && this.playerBody) {
      const spell = this.aoeTargeting.spell;
      const ptr = this.input.activePointer;
      const wx = this.cameras.main.scrollX + ptr.x / this.cameras.main.zoom;
      const wy = this.cameras.main.scrollY + ptr.y / this.cameras.main.zoom;
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
      this.captureProcess = updateCapture(this.captureProcess, delta);

      if (this.captureProcess.state === CaptureState.Success && this.captureTarget) {
        this.completeCaptureCreature(this.captureTarget);
        this.captureProcess = null;
        this.captureTarget = null;
      }
    }

    // Респаун
    this.tickRespawn(delta);

    // Передаём данные в UIScene
    this.events.emit('update-ui', {
      sphere: this.sphere,
      body: this.playerBody,
      capture: this.captureProcess,
      target: this.selectedTarget,
      quests: this.questTracker.getAll(),
      deathDebuff: this.sphere.deathDebuffRemaining,
      activeEnchantId: this.sphere.activeEnchant?.id ?? null,
      inCombat: this.isInCombat,
      aoeCast: this.aoeCasting
        ? { elapsed: this.aoeCasting.elapsed, duration: this.aoeCasting.duration, name: this.aoeCasting.spell.nameRu }
        : null,
      playerPos: this.playerBody ? { x: this.playerBody.x, y: this.playerBody.y }
        : this.sphere.inBody ? null : { x: this.sphere.x, y: this.sphere.y },
      creatures: this.creatures.map(c => ({
        x: c.x, y: c.y,
        isDead: c.isDead,
        isPassive: c.definition.type !== BodyType.Combat,
        isAggro: c.aiState === 'chase' || c.aiState === 'attack',
      })),
      inventory: this.sphere.inventory,
      killCounts: this.sphere.killCounts,
      unlockedAchievements: this.sphere.unlockedAchievements,
      trackedQuestIds: this.sphere.trackedQuestIds,
      weaponSchool: this.getWeaponSchool(),
    });
  }

  // ─── Карта ────────────────────────────────────────────

  private buildMap() {
    const zone = this.currentZone;
    const wt = zone.widthTiles;
    const ht = zone.heightTiles;

    // Фоновые тайлы
    for (let ty = 0; ty < ht; ty++) {
      for (let tx = 0; tx < wt; tx++) {
        const tile = this.add.image(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, zone.baseTile);
        if (zone.tint) tile.setTint(zone.tint);
      }
    }

    // Безопасная зона (каменные тайлы)
    if (zone.safeBounds) {
      const sb = zone.safeBounds;
      const tx1 = Math.floor(sb.x1 / TILE_SIZE);
      const ty1 = Math.floor(sb.y1 / TILE_SIZE);
      const tx2 = Math.ceil(sb.x2 / TILE_SIZE);
      const ty2 = Math.ceil(sb.y2 / TILE_SIZE);
      for (let ty = ty1; ty < ty2; ty++) {
        for (let tx = tx1; tx < tx2; tx++) {
          this.add.image(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, 'tile_stone');
        }
      }
    }

    // Камень возрождения
    const rp = zone.respawnPoint;
    this.add.image(rp.x, rp.y - 80, 'respawn_stone');
    this.add.text(rp.x, rp.y - 106, t('misc.respawn_stone'), {
      fontSize: '11px', color: '#aaaaee', align: 'center',
    }).setOrigin(0.5);

    // Название зоны
    this.add.text(wt * TILE_SIZE / 2, 40, zone.nameRu, {
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
      this.add.text(ex, ey, `${arrow} ${targetZone.nameRu}`, {
        fontSize: '12px', color: '#ffdd88', align: 'center',
        stroke: '#000000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(100);
    }

    // ── Декорации: деревья, камни, кусты ─────────────────
    this.spawnDecorations(wt, ht);
  }

  /** Процедурно расставить деревья, камни, кусты, реки, дороги */
  private spawnDecorations(wt: number, ht: number) {
    const zw = wt * TILE_SIZE;
    const zh = ht * TILE_SIZE;
    const sb = this.currentZone.safeBounds;
    const rng = new Phaser.Math.RandomDataGenerator([this.currentZone.id]);
    const zoneId = this.currentZone.id;

    const isInSafe = (x: number, y: number) =>
      sb && x > sb.x1 - 40 && x < sb.x2 + 40 && y > sb.y1 - 40 && y < sb.y2 + 40;

    // ── Дороги (из центра к выходам) ─────────────────────
    const gfxRoads = this.add.graphics().setDepth(0).setAlpha(0.4);
    gfxRoads.fillStyle(0x998866, 1);
    const cx = zw / 2, cy = zh / 2;
    for (const exit of this.currentZone.exits) {
      let ex = cx, ey = cy;
      if (exit.edge === 'north') { ex = cx; ey = 0; }
      if (exit.edge === 'south') { ex = cx; ey = zh; }
      if (exit.edge === 'east')  { ex = zw; ey = cy; }
      if (exit.edge === 'west')  { ex = 0; ey = cy; }
      // Рисуем полосу дороги
      const dx = ex - cx, dy = ey - cy;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len, ny = dy / len;
      const roadWidth = 20;
      for (let t = 0; t < len; t += 8) {
        const px = cx + nx * t;
        const py = cy + ny * t;
        // Немного "вибрации" для натуральности
        const wobble = Math.sin(t * 0.02) * 6;
        gfxRoads.fillRect(px - roadWidth / 2 + ny * wobble, py - roadWidth / 2 - nx * wobble, roadWidth, 8);
      }
    }

    // ── Река (извилистая линия, разная для каждой зоны) ───
    const gfxRiver = this.add.graphics().setDepth(0).setAlpha(0.5);
    const riverColor = zoneId === 'water' ? 0x3366aa : zoneId === 'fire' ? 0xaa4400 : 0x4488aa;
    gfxRiver.fillStyle(riverColor, 1);
    // Река идёт примерно по диагонали зоны
    const riverStartX = rng.between(100, 400);
    const riverEndX = zw - rng.between(100, 400);
    const riverY0 = rng.between(zh * 0.2, zh * 0.4);
    for (let x = riverStartX; x < riverEndX; x += 4) {
      const t = (x - riverStartX) / (riverEndX - riverStartX);
      const baseY = riverY0 + t * (zh * 0.4);
      const wave = Math.sin(x * 0.008 + rng.frac() * 6) * 60 + Math.sin(x * 0.02) * 20;
      const riverWidth = 14 + Math.sin(x * 0.005) * 6;
      if (!isInSafe(x, baseY + wave)) {
        gfxRiver.fillRect(x, baseY + wave - riverWidth / 2, 4, riverWidth);
      }
    }

    // ── Деревья (150-200) ────────────────────────────────
    const treeCount = 150 + rng.between(0, 50);
    for (let i = 0; i < treeCount; i++) {
      const x = rng.between(40, zw - 40);
      const y = rng.between(40, zh - 40);
      if (isInSafe(x, y)) continue;
      const tree = this.add.image(x, y, 'deco_tree').setDepth(1);
      tree.setScale(0.8 + rng.frac() * 0.8);
      tree.setAlpha(0.7 + rng.frac() * 0.3);
      if (this.currentZone.tint) tree.setTint(this.currentZone.tint);
    }

    // ── Камни (80-120) ───────────────────────────────────
    const rockCount = 80 + rng.between(0, 40);
    for (let i = 0; i < rockCount; i++) {
      const x = rng.between(40, zw - 40);
      const y = rng.between(40, zh - 40);
      if (isInSafe(x, y)) continue;
      const rock = this.add.image(x, y, 'deco_rock').setDepth(1);
      rock.setScale(0.6 + rng.frac() * 1.0);
      rock.setAlpha(0.5 + rng.frac() * 0.3);
      if (this.currentZone.tint) rock.setTint(Phaser.Display.Color.IntegerToColor(this.currentZone.tint).brighten(20).color);
    }

    // ── Кусты (100-140) ──────────────────────────────────
    const bushCount = 100 + rng.between(0, 40);
    for (let i = 0; i < bushCount; i++) {
      const x = rng.between(40, zw - 40);
      const y = rng.between(40, zh - 40);
      if (isInSafe(x, y)) continue;
      const bush = this.add.image(x, y, 'deco_bush').setDepth(1);
      bush.setScale(0.5 + rng.frac() * 0.8);
      bush.setAlpha(0.5 + rng.frac() * 0.3);
      if (this.currentZone.tint) bush.setTint(this.currentZone.tint);
    }
  }

  // ─── Стартовые тела ───────────────────────────────────

  private createStarterMarkers() {
    const animMap: Record<string, string> = {
      human_warrior: 'warrior_idle_down',
      human_mage: 'mage_idle_down',
    };

    STARTER_BODIES.forEach((def, i) => {
      const pos = this.starterPositions[i];

      // Use animated sprite if available, otherwise colored circle
      const animKey = animMap[def.id];
      if (animKey && this.anims.exists(animKey)) {
        const sprite = this.add.sprite(pos.x, pos.y, animKey);
        sprite.play(animKey);
        sprite.setDisplaySize(60, 60);
        this.starterBodies.push(sprite as any);
      } else {
        const marker = this.add.arc(pos.x, pos.y, 14, 0, 360, false, def.color, 0.7);
        this.starterBodies.push(marker);
      }

      this.add.text(pos.x, pos.y + 36, def.nameRu, {
        fontSize: '9px', color: '#cccccc', align: 'center',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5);
      this.add.text(pos.x, pos.y + 48, t('misc.possess'), {
        fontSize: '7px', color: '#888866',
      }).setOrigin(0.5);
    });

    // NPC-квестодатель
    const qp = this.questGiverPos;
    this.add.arc(qp.x, qp.y, 12, 0, 360, false, 0xffdd55, 0.9).setDepth(5);
    this.add.arc(qp.x, qp.y, 16, 0, 360, false, 0xffaa00, 0.3).setDepth(4);
    this.add.text(qp.x, qp.y - 24, '! Quest Board', {
      fontSize: '10px', color: '#ffdd88', align: 'center',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);
    this.add.text(qp.x, qp.y + 18, t('misc.talk'), {
      fontSize: '8px', color: '#888866',
    }).setOrigin(0.5).setDepth(6);
  }

  /** Попытка захватить стартовое тело (в астрале, нажатие E) */
  private tryPossessStarter(): boolean {
    for (let i = 0; i < this.starterPositions.length; i++) {
      const pos = this.starterPositions[i];
      const dist = distance(this.sphere.x, this.sphere.y, pos.x, pos.y);
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
      const canCapturAlive = creature.definition.type === BodyType.Passive || creature.definition.type === BodyType.Fleeing;
      // Пассивных — только вне боя; боевых — только мёртвых
      const eligible = canCapturAlive ? !this.isInCombat : creature.isDead;
      if (!eligible) continue;

      const dist = distance(px, py, creature.x, creature.y);
      if (dist < CAPTURE_RANGE) {
        this.captureProcess = startCapture(creature.definition.id);
        this.captureTarget = creature;
        this.events.emit('capture-start', creature.definition.nameRu);
        return true;
      }
    }
    return false;
  }

  private possessStarterBody(index: number) {
    const def = STARTER_BODIES[index];
    const pos = this.starterPositions[index];
    this.spawnCaptureFlash(pos.x, pos.y, () => {
      this.playerBody = new Body(this, pos.x, pos.y, def, this.sphere.stats);
      this.playerBody.wallCheckFn = (x, y) => this.isBlockedByWall(x, y, true);
      this.playerBody.possess(this);
      this.fillBodySlots(this.playerBody);
      this.sphere.enterBody();
      this.sphere.lastBodyId = def.id;
    });
  }

  /** Заполняет слоты умений тела: слот 1 — базовая атака, слоты 2+ — заклинания */
  private fillBodySlots(body: Body) {
    // Слот 0 — всегда базовая атака тела
    body.abilitySlots[0].ability = BASIC_ATTACKS[body.definition.id] ?? BASIC_ATTACKS['default'];

    // Очищаем остальные слоты
    for (let i = 1; i < 8; i++) body.abilitySlots[i].ability = null;

    // Не-гуманоиды: только своё умение (слот 1), остальное заблокировано
    if (!body.definition.canUseAllSpells) {
      const sig = body.definition.signatureSpell;
      if (sig) {
        const learned = this.sphere.learnedSpells.find(s => s.id === sig.id);
        if (learned) body.abilitySlots[1].ability = learned;
      }
      return;
    }

    // Гуманоиды: слоты 0-4 = оружейные, слоты 5-7 = нейтральные
    const equip = this.sphere.equipment;
    const activeWeaponId = this.sphere.activeWeaponSlot === 0 ? equip.weapon : equip.weapon2;

    // Слоты 0-4: загружаем сохранённую конфигурацию для текущего оружия
    if (activeWeaponId && this.sphere.weaponSlotConfigs[activeWeaponId]) {
      const config = this.sphere.weaponSlotConfigs[activeWeaponId];
      for (let i = 0; i < 5; i++) {
        const spellId = config[i];
        body.abilitySlots[i].ability = spellId
          ? (this.sphere.learnedSpells.find(s => s.id === spellId) ?? BASIC_ATTACKS[body.definition.id] ?? null)
          : null;
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

    // Слоты 5-7: нейтральные (сохранённые или автозаполнение)
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

  private isInSafeZone(x: number, y: number): boolean {
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

    // Спавним мобов текущей зоны
    spawnGroup(this.currentZone.spawnGroups);

    // Подключаем проверку стен и сейф-зону ко всем существам
    const wallCheck = (x: number, y: number) => this.isBlockedByWall(x, y, false);
    const sb = this.currentZone.safeBounds;
    for (const c of this.creatures) {
      c.wallCheckFn = wallCheck;
      if (sb) c.safeBounds = sb;
    }
  }

  // ─── Ресурсные ноды, верстаки, NPC ────────────────────

  private spawnWorldObjects() {
    const zone = this.currentZone;

    // Resource nodes
    for (const ns of zone.resourceNodes ?? []) {
      const def = RESOURCE_NODES[ns.nodeId];
      if (!def) continue;
      const container = this.add.container(ns.x, ns.y).setDepth(3);
      const circle = this.add.circle(0, 0, 12, def.color, 0.7);
      const label = this.add.text(0, -20, def.nameRu, { fontSize: '8px', color: '#dddddd', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
      const eKey = this.add.text(0, 16, '[E]', { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
      container.add([circle, label, eKey]);
      this.resourceNodes.push({ x: ns.x, y: ns.y, def, gfx: container, cooldown: 0, depleted: false });
    }

    // Workbenches
    for (const wb of zone.workbenches ?? []) {
      const container = this.add.container(wb.x, wb.y).setDepth(5);
      const rect = this.add.rectangle(0, 0, 28, 20, 0x664422, 0.8).setStrokeStyle(2, 0x996633);
      const label = this.add.text(0, -18, wb.nameRu, { fontSize: '8px', color: '#ffdd88', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
      const icon = this.add.text(0, 0, '⚒', { fontSize: '14px' }).setOrigin(0.5);
      const eKey = this.add.text(0, 16, '[E]', { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
      container.add([rect, label, icon, eKey]);
      this.workbenches.push({ x: wb.x, y: wb.y, type: wb.type, nameRu: wb.nameRu, gfx: container });
    }

    // NPCs
    for (const npc of zone.npcs ?? []) {
      const container = this.add.container(npc.x, npc.y).setDepth(5);
      const circle = this.add.circle(0, 0, 12, 0xffdd55, 0.9);
      const glow = this.add.circle(0, 0, 16, 0xffaa00, 0.3);
      const label = this.add.text(0, -22, npc.nameRu, { fontSize: '9px', color: '#ffdd88', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5);
      const eKey = this.add.text(0, 18, t('misc.shop'), { fontSize: '7px', color: '#888866' }).setOrigin(0.5);
      container.add([glow, circle, label, eKey]);
      this.worldNPCs.push({ x: npc.x, y: npc.y, id: npc.id, nameRu: npc.nameRu, role: npc.role, gfx: container });
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

    // NPCs (vendor)
    for (const npc of this.worldNPCs) {
      const d = distance(px, py, npc.x, npc.y);
      if (d < interactRange) {
        if (npc.role === 'vendor') {
          this.openVendorUI();
          this.events.emit('open-vendor');
        } else if (npc.role === 'weapon_vendor') {
          this.openWeaponVendor();
        } else if (npc.role === 'npc') {
          this.talkToNPC(npc.id);
        }
        return true;
      }
    }

    return false;
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
      const text = this.add.text(x, y, `${arrow} ${target.nameRu}`, {
        fontSize: '18px', color: '#ffdd44',
        stroke: '#000000', strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
      }).setOrigin(0.5).setDepth(100).setAlpha(0);
      (text as any)._exitEdge = exit.edge;
      this.exitArrows.push(text);
    }
  }

  /** Show/hide exit arrows based on player distance to edge */
  private updateExitArrows() {
    const entity = this.playerBody ?? this.sphere;
    if (!entity) return;
    const zw = this.currentZone.widthTiles * TILE_SIZE;
    const zh = this.currentZone.heightTiles * TILE_SIZE;
    const showDist = 400; // show when within 400px of edge

    for (const arrow of this.exitArrows) {
      const edge = (arrow as any)._exitEdge;
      let dist = 9999;
      if (edge === 'north') dist = entity.y;
      if (edge === 'south') dist = zh - entity.y;
      if (edge === 'east')  dist = zw - entity.x;
      if (edge === 'west')  dist = entity.x;

      const alpha = dist < showDist ? Math.min(1, (showDist - dist) / 200) : 0;
      arrow.setAlpha(alpha);
      // Pulse
      if (alpha > 0) {
        arrow.setScale(1 + Math.sin(Date.now() * 0.003) * 0.1);
      }
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
        const lootStr = drop.items.map(d => `+${d.qty} ${ITEMS[d.itemId]?.nameRu ?? d.itemId}`).join(', ');
        this.showMessage(lootStr);
        drop.gfx.destroy();
        this.lootDrops.splice(i, 1);
        saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
        return true;
      }
    }
    return false;
  }

  /** Arms Dealer: gives all starter weapons for free */
  private openWeaponVendor() {
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
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
  }

  /** NPC dialog system */
  private talkToNPC(npcId: string) {
    const result = getNPCDialog(npcId, this.questTracker);
    if (!result.messages.length) return;

    const onEnd = () => {
      const talkCompleted = this.questTracker.onTalk(npcId);
      for (const q of talkCompleted) this.onQuestComplete(q);
      saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
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

    this.showMessage(`Switched to ${ITEMS[newWeaponId!]?.nameRu ?? 'weapon'}`);
    sfxBuff();
  }

  /** Какая школа магии доступна для текущего оружия тела */
  private getWeaponSchool(): string | null {
    if (!this.playerBody) return null;
    const weaponSchoolMap: Record<string, string> = {
      staff_fire: 'fire', staff_water: 'water', staff_earth: 'earth',
      staff_wind: 'wind', staff_nature: 'nature',
    };
    return weaponSchoolMap[this.playerBody.definition.weapon] ?? null;
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
    // Check for required tool
    const toolMap: Record<string, string> = { mining: 'pickaxe', woodcutting: 'axe', trophy: 'skinning_knife' };
    const requiredTool = toolMap[node.def.profession];
    if (requiredTool && !this.sphere.inventory.find(i => i.itemId === requiredTool)) {
      this.showMessage(`Need ${ITEMS[requiredTool]?.nameRu ?? requiredTool}! Visit Merchant.`);
      return;
    }
    // Start gathering cast (3 sec)
    this.gatheringTimer = 3;
    this.gatheringNode = node;
    this.showMessage(`Gathering ${node.def.nameRu}...`);
    this.events.emit('crafting-start', 3); // reuse cast bar for gathering
  }

  private completeGathering() {
    if (!this.gatheringNode) return;
    const node = this.gatheringNode;
    const qty = node.def.minQty + Math.floor(Math.random() * (node.def.maxQty - node.def.minQty + 1));
    const existing = this.sphere.inventory.find(i => i.itemId === node.def.itemId);
    if (existing) existing.quantity += qty;
    else this.sphere.inventory.push({ itemId: node.def.itemId, quantity: qty });

    this.showMessage(`+${qty} ${ITEMS[node.def.itemId]?.nameRu ?? node.def.itemId}`);
    node.depleted = true;
    node.cooldown = node.def.respawnTime;
    node.gfx.setAlpha(0.3);
    this.gatheringNode = null;
    this.gatheringTimer = 0;
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
  }

  private interruptGathering() {
    if (this.gatheringTimer > 0) {
      this.gatheringTimer = 0;
      this.gatheringNode = null;
      this.showMessage(t('gather.interrupted'));
    }
  }

  private openCraftingUI(workbenchType: string) {
    this.events.emit('open-crafting', workbenchType);
  }

  /** Called from UIScene craft button */
  public startCraftingFromUI(recipe: import('../types/items').RecipeDef) {
    this.startCrafting(recipe);
  }

  private startCrafting(recipe: import('../types/items').RecipeDef) {
    // Consume materials
    for (const [itemId, qty] of Object.entries(recipe.materials)) {
      const inv = this.sphere.inventory.find(i => i.itemId === itemId);
      if (inv) inv.quantity -= qty;
    }
    this.sphere.inventory = this.sphere.inventory.filter(i => i.quantity > 0);

    this.craftingTimer = recipe.craftTime;
    this.craftingRecipe = recipe;
    this.showMessage(`Crafting ${recipe.nameRu}... (${recipe.craftTime}s)`);
    this.events.emit('crafting-start', recipe.craftTime);
  }

  private openVendorUI() {
    // Give tools for free (always)
    const tools = ['pickaxe', 'axe', 'skinning_knife'];
    for (const toolId of tools) {
      if (!this.sphere.inventory.find(i => i.itemId === toolId)) {
        this.sphere.inventory.push({ itemId: toolId, quantity: 1 });
      }
    }
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
    // Open vendor UI window
    this.events.emit('open-vendor');
  }

  /** Disassemble equipment item — returns 50% of materials */
  public disassembleItem(itemId: string) {
    const inv = this.sphere.inventory.find(i => i.itemId === itemId);
    if (!inv || inv.quantity <= 0) return;

    // Find the recipe that produces this item
    const recipe = RECIPES.find(r => r.resultId === itemId);
    if (!recipe) {
      this.showMessage('Cannot disassemble this item');
      return;
    }

    // Remove 1 from inventory
    inv.quantity -= 1;
    if (inv.quantity <= 0) {
      this.sphere.inventory = this.sphere.inventory.filter(i => i.quantity > 0);
    }

    // Unequip if equipped
    const equip = this.sphere.equipment;
    for (const key of Object.keys(equip)) {
      if ((equip as any)[key] === itemId) {
        (equip as any)[key] = undefined;
      }
    }

    // Return 50% of materials
    const returned: string[] = [];
    for (const [matId, qty] of Object.entries(recipe.materials)) {
      const returnQty = Math.max(1, Math.floor(qty * 0.5));
      const existing = this.sphere.inventory.find(i => i.itemId === matId);
      if (existing) existing.quantity += returnQty;
      else this.sphere.inventory.push({ itemId: matId, quantity: returnQty });
      returned.push(`${returnQty}x ${ITEMS[matId]?.nameRu ?? matId}`);
    }

    this.showMessage(`Disassembled! Got: ${returned.join(', ')}`);
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
  }

  /** Buy recipe from vendor */
  public buyRecipe(recipeId: string, price: number) {
    if (this.sphere.copper < price) {
      this.showMessage(`Not enough coins! Need ${formatCurrency(price)}`);
      return;
    }
    if (this.sphere.learnedRecipes.includes(recipeId)) {
      this.showMessage('Already known');
      return;
    }
    this.sphere.copper -= price;
    this.sphere.learnedRecipes.push(recipeId);
    this.showMessage(`Learned recipe! -${formatCurrency(price)}`);
    sfxLevelUp();
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
  }

  // ─── Атака ────────────────────────────────────────────

  private get isInCombat(): boolean {
    return this.playerBody !== null &&
      this.creatures.some(c => !c.isDead && (c.aiState === 'chase' || c.aiState === 'attack'));
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
        // Complete craft
        const recipe = this.craftingRecipe;
        const existing = this.sphere.inventory.find(i => i.itemId === recipe.resultId);
        if (existing) existing.quantity += recipe.resultQty;
        else this.sphere.inventory.push({ itemId: recipe.resultId, quantity: recipe.resultQty });
        this.showMessage(`Crafted: ${ITEMS[recipe.resultId]?.nameRu ?? recipe.resultId}!`);
        sfxLevelUp();
        this.craftingRecipe = null;
        saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
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

    // Store gfx reference for cleanup
    (this.summonedEnts[this.summonedEnts.length - 1] as any)._gfx = gfx;
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
        (ent as any)._gfx?.destroy();
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
            spawnSpellImpact(this, c.x, c.y, 'mob_fire_t1'); // spark explosion
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
        saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
        // Перезапускаем сцену с новой зоной
        sfxZoneTransition();
        this.scene.restart({ zoneId: exit.targetZone, spawnX: exit.spawnX, spawnY: exit.spawnY });
        return;
      }
    }
  }

  /** Применить статус к цели с обработкой спец. эффектов (interrupt, knockback) */
  private applyStatusToTarget(target: Creature, effectId: string) {
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
      target.applyStatus(effectId as any);
    }
  }

  /** Статы игрока с учётом экипировки + статус-бонусов */
  private getPlayerDefenseStats(): Stats {
    return this.getEffectiveStats();
  }

  /** Полные статы = база + экипировка + статус-эффекты */
  private getEffectiveStats(): Stats {
    const s = { ...this.sphere.stats };

    // Бонусы от экипировки
    const equip = this.sphere.equipment;
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
      // Stat bonuses
      if (def.statBonuses) {
        for (const [stat, val] of Object.entries(def.statBonuses)) {
          const sn = statMap[stat];
          if (sn && val) s[sn] += val;
        }
      }
      // Armor bonus from equipment
      if (def.armorBonus) s[StatName.Armor] += def.armorBonus;
    }

    // Бонусы от статус-эффектов
    if (this.playerBody) {
      s[StatName.Armor] += this.playerBody.armorBonus;
      s[StatName.Evasion] += this.playerBody.evasionBonus;
    }

    return s;
  }

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

    // Расчёт урона по damageType тела
    const dt = this.playerBody.definition.damageType;
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
      const stat = dt === 'magic' ? StatName.Will : StatName.Armor;
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

    if (result.hit) {
      closestCreature.takeDamage(finalDmg);
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
    if (!this.playerBody) return;
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

    const defStats = this.getPlayerDefenseStats();
    const result = cdt === 'magic'  ? calcMagicDamage(creature.stats, defStats, cwb)
                 : cdt === 'ranged' ? calcRangedDamage(creature.stats, defStats, cwb)
                 :                    calcMeleeDamage(creature.stats, defStats, cwb);

    if (result.hit) {
      let finalDmg = result.final;
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
    if (!this.playerBody) return;

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
    const npcDmg = barrierRed > 0 ? Math.round(result.final * (1 - barrierRed)) : result.final;

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
    }

    this.damageTexts.push(
      new DamageText(this, this.playerBody.x, this.playerBody.y - 10, result.hit ? npcDmg : 0, result.crit, !result.hit)
    );

    if (this.playerBody.isDead) {
      this.onPlayerDeath();
    }
  }

  private onCreatureKilled(creature: Creature) {
    sfxDeath();
    // Призванный союзник: убрать из мира, без XP, без захвата, без респауна
    if (creature.isSummoned) {
      creature.destroy();
      this.creatures = this.creatures.filter(c => c !== creature);
      return;
    }

    const xpTotal = creature.definition.xpReward;

    if (this.playerBody) {
      // 1. Stat XP — делится по капам тела
      const caps = this.playerBody.definition.caps;
      const capStats = Object.keys(caps) as StatName[];
      const xpEach = Math.floor(xpTotal / capStats.length);
      for (const stat of capStats) {
        const levelUp = addXP(this.sphere.stats, this.sphere.xpTracker, stat, xpEach, caps);
        if (levelUp) this.events.emit('stat-up', levelUp);
      }

      // 2. Spell XP — полный xpReward идёт в заклинание тела (дублируется)
      const spell = this.playerBody.definition.signatureSpell;
      const threshold = this.playerBody.definition.spellXPThreshold;
      if (spell && threshold) {
        const prev = this.sphere.spellProgress[spell.id] ?? 0;
        const alreadyLearned = this.sphere.learnedSpells.some(s => s.id === spell.id);

        if (!alreadyLearned) {
          // Проверка prerequisite — нельзя выучить T2 без T1
          const prereqId = spell.prerequisiteId;
          const hasPrereq = !prereqId || this.sphere.learnedSpells.some(s => s.id === prereqId);

          if (!hasPrereq) {
            this.events.emit('spell-locked', { spell, prereqId });
          } else {
            const next = prev + xpTotal;
            this.sphere.spellProgress[spell.id] = next;

            if (next >= threshold) {
              // Заклинание выучено!
              this.sphere.learnedSpells.push(spell);
              sfxLevelUp();
      this.events.emit('spell-learned', spell);
            } else {
              this.events.emit('spell-progress', { spell, current: next, threshold });
            }
          }
        }
      }

      this.events.emit('creature-killed', { name: creature.definition.nameRu, xp: xpTotal, stats: capStats });
    } else {
      this.events.emit('creature-killed', { name: creature.definition.nameRu, xp: 0, stats: [] });
    }

    // Квест — засчитать убийство
    this.handleQuestKill(creature.definition.id, xpTotal);

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
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);

    // Пульсация — тело доступно для захвата
    this.tweens.add({
      targets: creature,
      alpha: { from: 0.4, to: 0.7 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
    this.events.emit('capture-available', creature.definition.nameRu);

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

    // ── Телепорт к камню возрождения в том же теле ─────────
    if (this.playerBody) {
      this.playerBody.x = this.currentZone.respawnPoint.x;
      this.playerBody.y = this.currentZone.respawnPoint.y;
      this.playerBody.currentHP = this.playerBody.maxHP;
      this.playerBody.currentMana = this.playerBody.maxMana;
    } else {
      this.sphere.enterAstral(this.currentZone.respawnPoint.x, this.currentZone.respawnPoint.y);
    }
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
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
      if (this.playerBody) {
        this.playerBody.destroy();
        this.playerBody = null;
      }

      this.playerBody = new Body(this, cx, cy, def, this.sphere.stats);
      this.playerBody.wallCheckFn = (x, y) => this.isBlockedByWall(x, y, true);
      this.playerBody.possess(this);
      this.fillBodySlots(this.playerBody);
      this.sphere.enterBody();
      this.sphere.lastBodyId = def.id;

      this.events.emit('body-captured', def.nameRu);

      // Захваты: счётчик ачивок
      this.sphere.killCounts['__captures'] = (this.sphere.killCounts['__captures'] ?? 0) + 1;
      const captureAchievements = checkAchievements(this.sphere);
      for (const ach of captureAchievements) {
        this.events.emit('achievement-unlocked', ach);
      }

      saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);

      // Квест — засчитать захват
      const captureCompleted = this.questTracker.onCapture(def.id);
      for (const q of captureCompleted) this.onQuestComplete(q);
    });
  }

  // ─── Квестовые хелперы ───────────────────────────────

  private handleQuestKill(creatureId: string, _xpFromKill: number) {
    const completed = this.questTracker.onKill(creatureId);
    for (const q of completed) this.onQuestComplete(q);
  }

  private onQuestComplete(q: import('../types/quests').QuestProgress) {
    const xpReward = q.def.xpReward;
    this.events.emit('quest-complete', { name: q.def.nameRu, xp: xpReward });

    if (this.playerBody && xpReward > 0) {
      const caps = this.playerBody.definition.caps;
      const capStats = Object.keys(caps) as StatName[];
      if (capStats.length > 0) {
        const xpEach = Math.floor(xpReward / capStats.length);
        for (const stat of capStats) {
          const levelUp = addXP(this.sphere.stats, this.sphere.xpTracker, stat, xpEach, caps);
          if (levelUp) this.events.emit('stat-up', levelUp);
        }
      }
    }

    if (q.def.dialogEnd) {
      this.events.emit('show-dialog', {
        messages: [{ speaker: 'Quest Complete', text: q.def.dialogEnd }],
      });
    }

    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
  }

  /** Возвращает первый (основной) стат тела — тот в который идёт XP за атаки */
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

  // ─── Заклинания ───────────────────────────────────────

  private handleSpell(slotIndex: number) {
    if (!this.playerBody) return;

    const slot = this.playerBody.abilitySlots[slotIndex];
    if (!slot?.ability) return;
    if (slot.cooldownRemaining > 0) return;

    const spell = slot.ability;

    // Проверка маны
    if (this.playerBody.currentMana < spell.manaCost) {
      this.events.emit('no-mana');
      return;
    }

    // Бесплатный каст (от Рассечения)
    if ((this.sphere as any)._freeNextCast) {
      (this.sphere as any)._freeNextCast = false;
    } else {
      this.playerBody.currentMana -= spell.manaCost;
    }
    slot.cooldownRemaining = spell.cooldown;

    // ── Рывок: бросок вперёд ──────────────────────────────────────────────
    // ── Weapon Enchant: toggle-аура ────────────────────────────────────────
    if (spell.effectType === 'weapon_enchant') {
      if (this.sphere.activeEnchant?.id === spell.id) {
        // Деактивация
        this.sphere.activeEnchant = null;
        if (this.playerBody) this.playerBody.enchantRegenPenalty = 0;
        this.events.emit('enchant-toggled', null);
        this.events.emit('log', { text: `${spell.nameRu} — деактивировано`, color: '#aaaaaa' });
      } else {
        // Активация
        this.sphere.activeEnchant = spell;
        if (this.playerBody) this.playerBody.enchantRegenPenalty = spell.regenPenalty ?? 0.3;
        this.events.emit('enchant-toggled', spell);
        this.events.emit('log', { text: `${spell.nameRu} — активировано! Реген маны −30%`, color: '#ffaa00' });
      }
      // Не тратим ману и не запускаем кулдаун
      slot.cooldownRemaining = 0;
      this.playerBody.currentMana += spell.manaCost;
      return;
    }

    if (spell.effectType === 'dash_forward') {
      const dist = spell.dashDistance ?? 180;
      const dir = this.playerBody.getFacingVector();
      const startX = this.playerBody.x;
      const startY = this.playerBody.y;
      this.playerBody.x = clamp(startX + dir.x * dist, 16, MAP_WIDTH  - 16);
      this.playerBody.y = clamp(startY + dir.y * dist, 16, MAP_HEIGHT - 16);

      // Таран: отталкивание врагов вдоль пути рывка
      if (spell.statusEffect === 'knockback') {
        const pushDist = 80;
        for (const c of this.creatures) {
          if (c.isDead) continue;
          // Проверяем расстояние от линии рывка (start→end)
          const ax = c.x - startX, ay = c.y - startY;
          const bx = this.playerBody.x - startX, by = this.playerBody.y - startY;
          const lenSq = bx * bx + by * by;
          const t = lenSq > 0 ? Math.max(0, Math.min(1, (ax * bx + ay * by) / lenSq)) : 0;
          const projX = startX + t * bx, projY = startY + t * by;
          const d = distance(c.x, c.y, projX, projY);
          if (d < 40) {
            // Отталкиваем перпендикулярно от линии рывка
            const dx = c.x - projX, dy = c.y - projY;
            const nd = Math.sqrt(dx * dx + dy * dy) || 1;
            c.x += (dx / nd) * pushDist;
            c.y += (dy / nd) * pushDist;
            c.applyStatus('knockback' as any);
          }
        }
      }

      this.events.emit('ability-used', spell.nameRu);
      return;
    }

    // ── Выстрел с отскоком: атака + бросок назад (обрабатывается ниже после урона)
    // dash_backward — не return здесь, падаем в обычный поток атаки

    // ── Самобафф (ускорение и пр.) ─────────────────────────────────────────
    if (spell.effectType === 'self_buff') {
      // Проверка requiredWeapons
      if (spell.requiredWeapons && !spell.requiredWeapons.includes(this.playerBody.definition.weapon)) {
        slot.cooldownRemaining = 0;
        this.playerBody.currentMana += spell.manaCost;
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
        (this.sphere as any)._freeNextCast = true;
      }
      // VFX кастования баффа
      spawnCastVFX(this, this.playerBody.x, this.playerBody.y, spell.school ?? 'neutral');
      this.playerBody.playAttackAnim();
      sfxBuff();
      this.events.emit('ability-used', spell.nameRu);
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
          this.damageTexts.push(new DamageText(this, allyTarget.x, allyTarget.y - 10, healAmount, false, false));
          spawnHealVFX(this, allyTarget.x, allyTarget.y);
        }
      } else if (healAmount > 0) {
        this.playerBody.currentHP = Math.min(
          this.playerBody.currentHP + healAmount,
          this.playerBody.maxHP,
        );
        spawnHealVFX(this, this.playerBody.x, this.playerBody.y);
        sfxHeal();
      }
      this.events.emit('ability-used', spell.nameRu);
      return;
    }

    // ── Призыв волка ───────────────────────────────────────────────────────
    if (spell.effectType === 'summon_wolf') {
      // Пока волк жив — повторный призыв заблокирован
      if (this.creatures.some(c => c.isSummoned && !c.isDead)) {
        slot.cooldownRemaining = 0;
        this.playerBody.currentMana += spell.manaCost;
        this.events.emit('log', { text: 'Волк ещё жив', color: '#aaaaaa' });
        return;
      }
      // КД не ставим сейчас — запустится когда волк умрёт
      slot.cooldownRemaining = 0;
      this.spawnSummonedWolf(this.playerBody.x + 40, this.playerBody.y);
      this.events.emit('ability-used', spell.nameRu);
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
          const stat = spell.damageType === 'magic' ? StatName.Will : StatName.Armor;
          const origDef = target.stats[stat];
          const reducedDef = origDef * (1 - schoolBonus.penetrationPercent);
          const raw = result.raw;
          const reduction = spell.damageType === 'magic'
            ? Math.min(reducedDef / (reducedDef + 125), 0.8)
            : Math.min(reducedDef / (reducedDef + 125), 0.8);
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
      if (target.hasStatus(spell.conditionalOnStatus as any)) {
        dmg = Math.round(dmg * spell.conditionalBonusDmg);
      }
    }

    // ── Отчаяние: +10 урона за дебафф на себе ────────────────────────────
    if (spell.bonusDamagePerSelfDebuff && this.playerBody) {
      const debuffCount = [...this.playerBody.statusEffects.keys()].filter(id => {
        return !['acceleration', 'inspiration', 'bark_armor', 'leaf_regen', 'fortify',
                 'evasion_boost', 'block_next', 'shield_stance', 'hp_regen_boost',
                 'mana_regen_boost', 'stun_immune', 'knockback_immune',
                 'regen_per_buff', 'regen_per_debuff', 'ranged_resist', 'focus', 'damage_boost'].includes(id);
      }).length;
      dmg += spell.bonusDamagePerSelfDebuff * debuffCount;
    }

    // ── Разоблачение: +10% урона за бафф на враге ────────────────────────
    if (spell.bonusDamagePercentPerTargetBuff) {
      const buffCount = [...target.statusEffects.keys()].filter(id => {
        return ['fortify', 'evasion_boost', 'block_next', 'shield_stance',
                'hp_regen_boost', 'mana_regen_boost', 'stun_immune', 'knockback_immune',
                'regen_per_buff', 'regen_per_debuff', 'ranged_resist', 'acceleration',
                'inspiration', 'bark_armor', 'leaf_regen', 'focus', 'damage_boost'].includes(id);
      }).length;
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
      if (!(this.sphere as any).activeEnchant) {
        dmg = Math.round(dmg * (1 + spell.bonusDamageIfNoEnchant));
      }
    }

    // ── Боевой клич (damage_boost): +10% исходящего урона ────────────────
    if (this.playerBody?.hasStatus('damage_boost')) {
      const boost = STATUS_DEFS['damage_boost'].outgoingDamageIncrease ?? 0;
      dmg = Math.round(dmg * (1 + boost));
    }

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

    // VFX попадания способности
    const spellSchool = spell.school ?? (spell.damageType === 'melee' ? 'neutral' : 'neutral');
    if (spell.damageType === 'melee') {
      spawnMeleeSwingVFX(this, this.playerBody.x, this.playerBody.y, target.x, target.y,
        spell.school === 'fire' ? 0xff5500 : spell.school === 'water' ? 0x4499ff : 0xffffff);
    }
    spawnHitVFX(this, target.x, target.y, spellSchool, result.crit || !!isDouble);
    spawnSpellImpact(this, target.x, target.y, spell.id);
    if (result.crit || isDouble) sfxCritHit(); else if (spell.damageType === 'magic') sfxMagicHit(); else sfxMeleeHit();

    // ── Лайфстил (Кровавый размах: 30% от урона лечит) ──────────────────
    if (spell.lifestealPercent && this.playerBody && result.hit) {
      const healAmount = Math.round(dmg * spell.lifestealPercent);
      this.playerBody.currentHP = Math.min(this.playerBody.currentHP + healAmount, this.playerBody.maxHP);
    }

    // ── Очищение дебаффов (Очищающий удар) ───────────────────────────────
    if ((spell.cleanseCount || spell.cleanseSelf) && this.playerBody) {
      const debuffIds = [...this.playerBody.statusEffects.keys()].filter(id => {
        const def = STATUS_DEFS[id];
        // Дебаффы — всё кроме баффов (acceleration, inspiration, bark_armor, etc.)
        return !['acceleration', 'inspiration', 'bark_armor', 'leaf_regen', 'fortify',
                 'evasion_boost', 'block_next', 'shield_stance', 'hp_regen_boost',
                 'mana_regen_boost', 'stun_immune', 'knockback_immune',
                 'regen_per_buff', 'regen_per_debuff', 'ranged_resist'].includes(id);
      });
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
        (this.playerBody as any)._debuffImmunity = spell.debuffImmunityDuration;
      }
    }

    // ── Временные HP (Стойкий удар) ────────────────────────────────────
    if (spell.grantTempHP && this.playerBody) {
      this.playerBody.tempHP = spell.grantTempHP;
      this.playerBody.tempHPTimer = spell.tempHPDuration ?? 6;
    }

    // ── Бесплатный следующий каст (Рассечение) ──────────────────────────
    if (spell.grantFreeNextCast) {
      (this.sphere as any)._freeNextCast = true;
    }

    this.damageTexts.push(
      new DamageText(this, target.x, target.y - 10, dmg, result.crit || !!isDouble, false)
    );

    // Доп. урон от зачарования (только для физ. атак, не магии)
    if (spell.damageType !== 'magic') {
      this.applyEnchantDamage(target, result.hit);
    }
    // Статус-эффект: спелл > оружие (+ alsoApplyWeaponEffect для двойного)
    const weapon = this.playerBody ? WEAPONS[this.playerBody.definition.weapon] : null;
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
            nextTarget.applyStatus(spell.statusEffect as any);
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
      }
    }

    // ── Dash backward: бросок назад ОТ ЦЕЛИ после выстрела ─────────────────
    if (spell.effectType === 'dash_backward' && target) {
      const dist = spell.dashDistance ?? 180;
      const dx = this.playerBody.x - target.x;
      const dy = this.playerBody.y - target.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      this.playerBody.x = clamp(this.playerBody.x + (dx / len) * dist, 16, MAP_WIDTH  - 16);
      this.playerBody.y = clamp(this.playerBody.y + (dy / len) * dist, 16, MAP_HEIGHT - 16);
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
      this.events.emit('log', { text: `${spell.nameRu} — отменено`, color: '#aaaaaa' });
      return;
    }

    if (slot.cooldownRemaining > 0) return;

    if (spell.isAoe && spell.range === 0) {
      // AoE на себе (Whirlwind и пр.) — без прицеливания
      if (this.playerBody.currentMana < spell.manaCost) {
        this.events.emit('no-mana');
        return;
      }
      this.doAoeDamage(spell, slotIndex, this.playerBody.x, this.playerBody.y);
    } else if (spell.isAoe) {
      // Входим в режим прицеливания
      this.aoeTargeting = { slotIndex, spell };
      this.events.emit('aoe-targeting', spell.nameRu);
    } else {
      this.handleSpell(slotIndex);
    }
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

    if (this.playerBody.currentMana < spell.manaCost) {
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
      this.events.emit('cast-start', { name: spell.nameRu, duration: castTime });
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

    this.playerBody.currentMana -= spell.manaCost;
    slot.cooldownRemaining = spell.cooldown;

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
        let zoneStatus: string | undefined;
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
              c.applyStatus(zoneStatus as any);
            }
            if (c.isDead) this.onCreatureKilled(c);
          }
        } else if (this.playerBody && !this.playerBody.isDead) {
          if (inZone(this.playerBody.x, this.playerBody.y)) {
            const r = calcMagicDamage(zone.casterStats, this.sphere.stats, zone.dps);
            this.playerBody.takeDamage(r.final);
            this.damageTexts.push(new DamageText(this, this.playerBody.x, this.playerBody.y - 10, r.final, false, false));
            if (zoneStatus && Math.random() < zoneStatusChance) {
              this.playerBody.applyStatus(zoneStatus as any);
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
