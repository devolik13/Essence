import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { Creature } from '../entities/Creature';
import { DamageText } from '../entities/DamageText';
import { STARTER_BODIES, GOBLIN, WEAPON_COOLDOWNS } from '../types/bodies';
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
import { StatName } from '../types/stats';
import { AbilityDef } from '../types/abilities';
import { QuestTracker } from '../systems/questTracker';
import { QUESTS } from '../data/questDB';
import { saveSphere, loadSphere } from '../systems/saveLoad';
import { ALL_KNOWN_SPELLS } from '../data/allSpells';
import { CHAPTER1_ZONES, MINI_EVENT_LOCATIONS, VILLAGE_STARTER_SPAWNS, TEST_SPELL_SPAWNS, VILLAGE_CENTER, VILLAGE_BOUNDS } from '../data/chapter1';
import { rollLoot, ITEMS } from '../data/itemDB';
import { checkAchievements } from '../systems/achievements';

// ── Штраф за смерть ──────────────────────────────────────
// TODO: подобрать значения после тестирования баланса
const DEATH_XP_LOSS_PCT    = 0.10;  // 10% накопленного XP в текущих статах
const DEATH_DEBUFF_DURATION = 30;   // сек — длительность дебаффа
export const DEATH_DEBUFF_MULT = 0.85;  // ×0.85 к урону пока дебафф активен

/** Базовые атаки для каждого вида тела (слот 1).
 *  baseDamage = 0 — урон берётся из weapon.baseDamage в handleAttack */
const BASIC_ATTACKS: Record<string, AbilityDef> = {
  default: {
    id: 'basic_melee', nameRu: 'Удар', damageType: 'melee',
    cooldown: 1.2, manaCost: 0, range: 48, baseDamage: 0, description: 'Базовый удар',
  },
  human_warrior: {
    id: 'basic_sword', nameRu: 'Удар мечом', damageType: 'melee',
    cooldown: 1.2, manaCost: 0, range: 48, baseDamage: 0, description: 'Удар мечом',
  },
  human_archer: {
    id: 'basic_bow', nameRu: 'Выстрел', damageType: 'ranged',
    cooldown: 1.0, manaCost: 0, range: 200, baseDamage: 0, description: 'Выстрел из лука',
  },
  human_mage: {
    id: 'basic_staff', nameRu: 'Удар посохом', damageType: 'magic',
    cooldown: 1.5, manaCost: 2, range: 180, baseDamage: 0, description: 'Магический выстрел',
  },
  rabbit: {
    id: 'basic_paw', nameRu: 'Удар лапой', damageType: 'melee',
    cooldown: 0.8, manaCost: 0, range: 36, baseDamage: 0, description: 'Быстрый удар лапой',
  },
  goblin: {
    id: 'basic_dagger', nameRu: 'Укол кинжалом', damageType: 'melee',
    cooldown: 0.8, manaCost: 0, range: 40, baseDamage: 0, description: 'Укол кинжалом',
  },
  wolf: {
    id: 'basic_bite', nameRu: 'Укус', damageType: 'melee',
    cooldown: 0.8, manaCost: 0, range: 38, baseDamage: 0, description: 'Укус волка',
  },
};

export class GameScene extends Phaser.Scene {
  private sphere!: Sphere;
  private playerBody: Body | null = null;
  private creatures: Creature[] = [];
  private damageTexts: DamageText[] = [];
  private starterBodies: Phaser.GameObjects.Arc[] = [];

  // Очередь респауна: { definitionId, x, y, delay (мс осталось) }
  private respawnQueue: { id: string; x: number; y: number; timer: number }[] = [];
  private readonly RESPAWN_DELAY = 15000; // 15 секунд

  // Стартовые тела на камне возрождения
  private starterPositions = [
    { x: 1880, y: 1340 },  // Воин
    { x: 1920, y: 1340 },  // Лучник
    { x: 1960, y: 1340 },  // Маг
  ];

  // Захват
  private captureProcess: CaptureProcess | null = null;
  private captureTarget: Creature | null = null;

  // Квесты
  private questTracker!: QuestTracker;

  // NPC-квестодатель
  private questGiverPos = { x: 2020, y: 1240 };

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
  private key1!: Phaser.Input.Keyboard.Key;
  private key2!: Phaser.Input.Keyboard.Key;
  private key3!: Phaser.Input.Keyboard.Key;
  private key4!: Phaser.Input.Keyboard.Key;
  private key5!: Phaser.Input.Keyboard.Key;
  private key6!: Phaser.Input.Keyboard.Key;
  private key7!: Phaser.Input.Keyboard.Key;
  private key8!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // ─── Квесты ──────────────────────────────────────
    this.questTracker = new QuestTracker(QUESTS);

    // ─── Тайловая карта ──────────────────────────────
    this.buildMap();

    // ─── Сфера ───────────────────────────────────────
    this.sphere = new Sphere(this, VILLAGE_CENTER.x, VILLAGE_CENTER.y);
    const loaded = loadSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
    if (loaded) this.events.emit('save-loaded');

    // ─── Стартовые тела (визуальные маркеры) ─────────
    this.createStarterMarkers();

    // ─── Мобы ────────────────────────────────────────
    this.spawnCreatures();

    // ─── Камера ──────────────────────────────────────
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.sphere, true, 0.1, 0.1);

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
        // Убит игроком — onCreatureKilled уже удалит, просто пропускаем
        if (creature.isDead) continue;
        const dt = delta / 1000;
        creature.summonTimer = Math.max(0, creature.summonTimer - dt);
        if (creature.summonTimer <= 0) {
          creature.destroy();
          this.creatures = this.creatures.filter(c => c !== creature);
          continue;
        }
        // Ищем ближайшего врага
        let nearestEnemy: Creature | null = null;
        let nearestDist = 600;
        for (const c of this.creatures) {
          if (c === creature || c.isDead || c.isSummoned) continue;
          const d = distance(creature.x, creature.y, c.x, c.y);
          if (d < nearestDist) { nearestDist = d; nearestEnemy = c; }
        }
        creature.update(time, delta, nearestEnemy?.x, nearestEnemy?.y);
        if (nearestEnemy && creature.aiState === 'attack' && creature.attackCooldown <= 0) {
          this.summonedWolfAttackEnemy(creature, nearestEnemy);
        }
        continue;
      }

      creature.update(time, delta, px, py);

      // Моб атакует игрока — базовая атака оружием
      if (creature.aiState === 'attack' && this.playerBody && creature.attackCooldown <= 0) {
        this.creatureAttackPlayer(creature);
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
      this.aoeIndicator.fillStyle(0xff6600, fillAlpha);
      this.aoeIndicator.fillCircle(wx, wy, aoeR);
      this.aoeIndicator.lineStyle(2, strokeColor, strokeAlpha);
      this.aoeIndicator.strokeCircle(wx, wy, aoeR);
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
        isPassive: c.definition.type === 1,
        isAggro: c.aiState === 'chase' || c.aiState === 'attack',
      })),
      inventory: this.sphere.inventory,
      killCounts: this.sphere.killCounts,
      unlockedAchievements: this.sphere.unlockedAchievements,
      trackedQuestIds: this.sphere.trackedQuestIds,
    });
  }

  // ─── Карта ────────────────────────────────────────────

  private buildMap() {
    // Трава
    for (let ty = 0; ty < MAP_HEIGHT_TILES; ty++) {
      for (let tx = 0; tx < MAP_WIDTH_TILES; tx++) {
        this.add.image(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, 'tile_grass');
      }
    }

    // Деревня Эшворт — каменные тайлы вокруг центра карты (tx 56-64, ty 37-43)
    // Центр карты тайл (60,40) = пиксель (1920, 1280)
    for (let ty = 37; ty < 44; ty++) {
      for (let tx = 56; tx < 65; tx++) {
        this.add.image(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, 'tile_stone');
      }
    }

    // Камень возрождения — в центре деревни
    this.add.image(VILLAGE_CENTER.x, VILLAGE_CENTER.y - 80, 'respawn_stone');
    this.add.text(VILLAGE_CENTER.x, VILLAGE_CENTER.y - 106, 'Камень возрождения', {
      fontSize: '11px', color: '#aaaaee', align: 'center',
    }).setOrigin(0.5);

    // ─── Подписи зон ─────────────────────────────────────
    this.add.text(3040, 1280, '🔥 Пепельная роща', {
      fontSize: '14px', color: '#ff8844', align: 'center',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(1920, 480, '🌊 Туманное озеро', {
      fontSize: '14px', color: '#66aaff', align: 'center',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(800, 1280, '🪨 Каменные холмы', {
      fontSize: '14px', color: '#aa8855', align: 'center',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(1920, 2080, '💨 Вершины ветров', {
      fontSize: '14px', color: '#99ddaa', align: 'center',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5);

    this.add.text(900, 1570, '🌲 Серый лес', {
      fontSize: '12px', color: '#88aa66', align: 'center',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(2000, 1570, '⚔ Лагерь орков', {
      fontSize: '12px', color: '#88aa55', align: 'center',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);

    this.add.text(2800, 720, '🏚 Крестьянский хутор', {
      fontSize: '12px', color: '#ccaa77', align: 'center',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5);
  }

  // ─── Стартовые тела ───────────────────────────────────

  private createStarterMarkers() {
    STARTER_BODIES.forEach((def, i) => {
      const pos = this.starterPositions[i];
      const marker = this.add.arc(pos.x, pos.y, 10, 0, 360, false, def.color, 0.7);
      this.starterBodies.push(marker);

      this.add.text(pos.x, pos.y + 16, def.nameRu, {
        fontSize: '9px', color: '#cccccc', align: 'center',
      }).setOrigin(0.5);
    });

    // NPC-квестодатель
    const qp = this.questGiverPos;
    this.add.arc(qp.x, qp.y, 12, 0, 360, false, 0xffdd55, 0.9).setDepth(5);
    this.add.arc(qp.x, qp.y, 16, 0, 360, false, 0xffaa00, 0.3).setDepth(4);
    this.add.text(qp.x, qp.y - 24, '! Следопыт', {
      fontSize: '10px', color: '#ffdd88', align: 'center',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(6);
    this.add.text(qp.x, qp.y + 18, '[E] поговорить', {
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

    for (const creature of this.creatures) {
      const isPassive = creature.definition.type === 1;
      const eligible = isPassive ? true : creature.isDead;
      if (!eligible) continue;

      const dist = distance(this.sphere.x, this.sphere.y, creature.x, creature.y);
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
    this.playerBody = new Body(this, pos.x, pos.y, def, this.sphere.stats);
    this.playerBody.possess(this);
    this.fillBodySlots(this.playerBody);
    this.sphere.enterBody();
  }

  /** Заполняет слоты умений тела: слот 1 — базовая атака, слоты 2+ — заклинания */
  private fillBodySlots(body: Body) {
    body.abilitySlots[0].ability = BASIC_ATTACKS[body.definition.id] ?? BASIC_ATTACKS['default'];

    // Если есть сохранённые назначения — применяем их
    const hasCustomSlots = this.sphere.savedSlotIds.slice(1).some(id => id !== null);
    if (hasCustomSlots) {
      for (let i = 1; i < 8; i++) {
        const savedId = this.sphere.savedSlotIds[i];
        body.abilitySlots[i].ability = savedId
          ? (this.sphere.learnedSpells.find(s => s.id === savedId) ?? null)
          : null;
      }
      return;
    }

    // Иначе — автозаполнение
    const sig = body.definition.signatureSpell;
    if (sig) {
      const learned = this.sphere.learnedSpells.find(s => s.id === sig.id);
      if (learned) body.abilitySlots[1].ability = learned;
    }
    let slotIdx = 2;
    for (const spell of this.sphere.learnedSpells) {
      if (sig && spell.id === sig.id) continue;
      if (slotIdx >= 8) break;
      body.abilitySlots[slotIdx].ability = spell;
      slotIdx++;
    }
  }

  // ─── Выход из тела ────────────────────────────────────

  private isInSafeZone(x: number, y: number): boolean {
    return x >= VILLAGE_BOUNDS.x1 && x <= VILLAGE_BOUNDS.x2
        && y >= VILLAGE_BOUNDS.y1 && y <= VILLAGE_BOUNDS.y2;
  }

  private exitBody() {
    if (!this.playerBody) return;

    const x = this.playerBody.x;
    const y = this.playerBody.y;

    // Добровольный выход из тела — только в безопасной зоне
    if (!this.isInSafeZone(x, y)) {
      this.events.emit('log', { text: 'Выйти из тела можно только в безопасной зоне', color: '#ff6666' });
      return;
    }

    this.playerBody.release();
    this.playerBody.destroy();
    this.playerBody = null;

    this.sphere.enterAstral(x, y);
  }

  // ─── Спавн мобов ─────────────────────────────────────

  private spawnCreatures() {
    const spawnGroups = (
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

    // ── Глава 1: элементали по зонам ─────────────────────
    for (const zone of CHAPTER1_ZONES) {
      spawnGroups(zone.spawnGroups);
      // Босс зоны (null = ещё не реализован)
      if (zone.bossId) {
        const bossDef = CREATURE_DB[zone.bossId];
        if (bossDef) this.creatures.push(new Creature(this, zone.bossX, zone.bossY, bossDef));
      }
    }

    // ── Мини-ивент локации ────────────────────────────────
    // Серый лес (волки + медведи), Лагерь орков, Крестьянский хутор (разведчики)
    for (const loc of MINI_EVENT_LOCATIONS) {
      spawnGroups(loc.spawnGroups);
    }

    // ── Стартовая зона (вокруг деревни Эшворт) ───────────
    // Малый джиттер ±40px — пассивные мобы не вылезают за границы деревни
    spawnGroups(VILLAGE_STARTER_SPAWNS, 40);
    spawnGroups(TEST_SPELL_SPAWNS, 10);
  }

  // ─── Атака ────────────────────────────────────────────

  private get isInCombat(): boolean {
    return this.playerBody !== null &&
      this.creatures.some(c => !c.isDead && (c.aiState === 'chase' || c.aiState === 'attack'));
  }

  private selectTarget(creature: Creature) {
    this.selectedTarget = creature;
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
    const result = dt === 'magic'  ? calcMagicDamage(this.sphere.stats, closestCreature.stats, wb)
                 : dt === 'ranged' ? calcRangedDamage(this.sphere.stats, closestCreature.stats, wb)
                 :                   calcMeleeDamage(this.sphere.stats, closestCreature.stats, wb);

    const finalDmg = (result.hit && this.sphere.deathDebuffRemaining > 0)
      ? Math.round(result.final * DEATH_DEBUFF_MULT) : result.final;

    if (result.hit) {
      closestCreature.takeDamage(finalDmg);
      if (closestCreature.aiState === 'idle' || closestCreature.aiState === 'wander') {
        closestCreature.aiState = 'chase';
      }
    }

    // Снаряд для дальнобойного и магического тела
    if (dt === 'ranged') {
      this.spawnProjectile(
        this.playerBody.x, this.playerBody.y,
        closestCreature.x, closestCreature.y,
        0xddcc88, 10, 2,
      );
    } else if (dt === 'magic') {
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
    if (result.hit && this.sphere.activeEnchant && !closestCreature.isDead) {
      const ench = this.sphere.activeEnchant;
      const enchBase = ench.enchantDamage ?? 8;
      const enchResult = calcMagicDamage(this.sphere.stats, closestCreature.stats, enchBase);
      if (enchResult.hit) {
        const enchDmg = this.sphere.deathDebuffRemaining > 0
          ? Math.round(enchResult.final * DEATH_DEBUFF_MULT) : enchResult.final;
        closestCreature.takeDamage(enchDmg);
        // Школьный эффект зачарования
        if (ench.statusEffect) {
          const chance = ench.statusChance ?? 0.1;
          if (Math.random() < chance) closestCreature.applyStatus(ench.statusEffect);
        }
        // Доп. урон отображается с задержкой (как двойной удар)
        this.time.delayedCall(150, () => {
          if (closestCreature.active) {
            this.damageTexts.push(new DamageText(this, closestCreature.x, closestCreature.y - 12, enchDmg, false, false));
          }
        });
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
    if (!this.playerBody) return;

    const cdt = creature.definition.damageType;
    const cwb = WEAPONS[creature.definition.weapon].baseDamage;
    const result = cdt === 'magic'  ? calcMagicDamage(creature.stats, this.sphere.stats, cwb)
                 : cdt === 'ranged' ? calcRangedDamage(creature.stats, this.sphere.stats, cwb)
                 :                    calcMeleeDamage(creature.stats, this.sphere.stats, cwb);

    if (result.hit) {
      this.playerBody.takeDamage(result.final);
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

    if (result.hit) {
      if (spell.isAoe) {
        // AOE: урон всем телам в радиусе вокруг игрока (сейчас только игрок)
        this.playerBody.takeDamage(result.final);
        // Визуал AOE — несколько снарядов по кругу
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
        this.playerBody.takeDamage(result.final);
        this.spawnProjectile(
          creature.x, creature.y,
          this.playerBody.x, this.playerBody.y,
          projColor, 7, 5,
        );
      }
    }

    this.damageTexts.push(
      new DamageText(this, this.playerBody.x, this.playerBody.y - 10, result.final, result.crit, !result.hit)
    );

    if (this.playerBody.isDead) {
      this.onPlayerDeath();
    }
  }

  private onCreatureKilled(creature: Creature) {
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

    // Лут
    const dropped = rollLoot(creature.definition.id);
    if (dropped.length > 0) {
      for (const { itemId, qty } of dropped) {
        this.sphere.addItem(itemId, qty);
      }
      const lootStr = dropped.map(d => {
        const item = ITEMS[d.itemId];
        return `${item?.nameRu ?? d.itemId} ×${d.qty}`;
      }).join(', ');
      this.events.emit('loot-dropped', { creatureName: creature.definition.nameRu, loot: lootStr });
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
      this.playerBody.x = VILLAGE_CENTER.x;
      this.playerBody.y = VILLAGE_CENTER.y;
      this.playerBody.currentHP = this.playerBody.maxHP;
      this.playerBody.currentMana = this.playerBody.maxMana;
    } else {
      this.sphere.enterAstral(VILLAGE_CENTER.x, VILLAGE_CENTER.y);
    }
    saveSphere(this.sphere, ALL_KNOWN_SPELLS, this.questTracker);
    this.events.emit('player-died', { xpLost: totalXpLost, debuffDuration: DEATH_DEBUFF_DURATION });
  }

  // ─── Захват существа ──────────────────────────────────

  private completeCaptureCreature(creature: Creature) {
    const def = creature.definition;
    this.playerBody = new Body(this, creature.x, creature.y, def, this.sphere.stats);
    this.playerBody.possess(this);
    this.fillBodySlots(this.playerBody);
    this.sphere.enterBody();

    // Убираем существо из мира + ставим в очередь респауна
    this.scheduleRespawn(creature);
    creature.destroy();
    this.creatures = this.creatures.filter(c => c !== creature);

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
  }

  // ─── Квестовые хелперы ───────────────────────────────

  private handleQuestKill(creatureId: string, _xpFromKill: number) {
    const completed = this.questTracker.onKill(creatureId);
    for (const q of completed) this.onQuestComplete(q);
  }

  private onQuestComplete(q: import('../types/quests').QuestProgress) {
    const xpReward = q.def.xpReward;
    this.events.emit('quest-complete', { name: q.def.nameRu, xp: xpReward });

    // Распределяем XP как за убийство — по капам текущего тела
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

    this.playerBody.currentMana -= spell.manaCost;
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
      this.playerBody.x = clamp(this.playerBody.x + dir.x * dist, 16, MAP_WIDTH  - 16);
      this.playerBody.y = clamp(this.playerBody.y + dir.y * dist, 16, MAP_HEIGHT - 16);
      this.events.emit('ability-used', spell.nameRu);
      return;
    }

    // ── Выстрел с отскоком: атака + бросок назад (обрабатывается ниже после урона)
    // dash_backward — не return здесь, падаем в обычный поток атаки

    // ── Самобафф (ускорение и пр.) ─────────────────────────────────────────
    if (spell.effectType === 'self_buff') {
      if (spell.statusEffect) {
        this.playerBody.applyStatus(spell.statusEffect);
      }
      this.events.emit('ability-used', spell.nameRu);
      return;
    }

    // ── Лечение себя (природа T2) ──────────────────────────────────────────
    if (spell.effectType === 'self_heal') {
      const intel = this.sphere.stats.intellect ?? 0;
      const healAmount = Math.round(spell.baseDamage * (1 + intel / 100));
      this.playerBody.currentHP = Math.min(
        this.playerBody.currentHP + healAmount,
        this.playerBody.maxHP,
      );
      this.events.emit('ability-used', spell.nameRu);
      return;
    }

    // ── Призыв волка ───────────────────────────────────────────────────────
    if (spell.effectType === 'summon_wolf') {
      // Пока волк жив — повторный призыв заблокирован
      if (this.creatures.some(c => c.isSummoned && !c.isDead)) {
        slot.cooldownRemaining = 0;
        this.playerBody.currentMana += spell.manaCost;
        return;
      }
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
    const result = spell.damageType === 'melee'  ? calcMeleeDamage(this.sphere.stats, target.stats, spell.baseDamage)
                 : spell.damageType === 'ranged' ? calcRangedDamage(this.sphere.stats, target.stats, spell.baseDamage)
                 :                                  calcMagicDamage(this.sphere.stats, target.stats, spell.baseDamage);

    // Двойной урон (школа ветра и др.)
    const isDouble = spell.doubleDamageChance && Math.random() < spell.doubleDamageChance;
    let dmg = this.sphere.deathDebuffRemaining > 0
      ? Math.round(result.final * DEATH_DEBUFF_MULT) : result.final;
    if (isDouble) dmg *= 2;

    target.takeDamage(dmg);
    this.aggroCreature(target);

    this.damageTexts.push(
      new DamageText(this, target.x, target.y - 10, dmg, result.crit || !!isDouble, false)
    );

    // ── Статус-эффект умения ──────────────────────────────────────────────
    if (spell.statusEffect && result.hit) {
      const chance = spell.statusChance ?? 1.0;
      if (Math.random() < chance) {
        // Мгновенные эффекты (interrupt, knockback) — обрабатываем отдельно
        if (spell.statusEffect === 'interrupt') {
          // Сбитие концентрации: сбрасываем таймер каста (без кулдауна)
          if (target.castTimer > 0 && target.castingSpell) {
            target.castTimer = target.castingSpell.castTime ?? 0;
          }
        } else if (spell.statusEffect === 'knockback') {
          // Отбрасывание: толкаем от игрока
          const kbDist = 180;
          const dx = target.x - this.playerBody.x;
          const dy = target.y - this.playerBody.y;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          target.x += (dx / len) * kbDist;
          target.y += (dy / len) * kbDist;
          target.applyStatus('stun'); // 0.5 сек потеря контроля — используем stun с коротким таймером
        } else {
          target.applyStatus(spell.statusEffect);
        }
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
          ? calcRangedDamage(this.sphere.stats, c.stats, spell.baseDamage)
          : calcMeleeDamage(this.sphere.stats, c.stats, spell.baseDamage);
        if (r2.hit) {
          c.takeDamage(r2.final);
          this.damageTexts.push(new DamageText(this, c.x, c.y - 10, r2.final, r2.crit, false));
          if (c.isDead) this.onCreatureKilled(c);
        }
        piercedCount++;
      }
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
        const r2 = calcMeleeDamage(this.sphere.stats, c.stats, spell.baseDamage);
        if (r2.hit) {
          const d2 = this.sphere.deathDebuffRemaining > 0 ? Math.round(r2.final * DEATH_DEBUFF_MULT) : r2.final;
          c.takeDamage(d2);
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
          const r = spell.damageType === 'melee'  ? calcMeleeDamage(this.sphere.stats, target.stats, spell.baseDamage)
                  : spell.damageType === 'ranged' ? calcRangedDamage(this.sphere.stats, target.stats, spell.baseDamage)
                  :                                  calcMagicDamage(this.sphere.stats, target.stats, spell.baseDamage);
          if (r.hit) {
            const d = this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final;
            target.takeDamage(d);
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
          const r = calcMagicDamage(this.sphere.stats, c.stats, spell.baseDamage);
          if (r.hit) {
            const d = this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final;
            c.takeDamage(d);
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
          const r = calcMagicDamage(this.sphere.stats, c.stats, spell.baseDamage);
          if (r.hit) {
            const d = this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final;
            c.takeDamage(d);
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
          const r = calcMagicDamage(this.sphere.stats, c.stats, spell.baseDamage);
          if (r.hit) {
            const isDouble = spell.doubleDamageChance && Math.random() < spell.doubleDamageChance;
            const d = (this.sphere.deathDebuffRemaining > 0 ? Math.round(r.final * DEATH_DEBUFF_MULT) : r.final) * (isDouble ? 2 : 1);
            c.takeDamage(d);
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
    if (slot.cooldownRemaining > 0) return;

    const spell = slot.ability;
    if (spell.isAoe) {
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
    this.spawnAoeFlash(worldX, worldY, radius);

    for (const c of this.creatures) {
      if (c.isDead) continue;
      if (distance(c.x, c.y, worldX, worldY) > radius) continue;
      const result = calcMagicDamage(this.sphere.stats, c.stats, spell.baseDamage);
      const aoeDmg = this.sphere.deathDebuffRemaining > 0
        ? Math.round(result.final * DEATH_DEBUFF_MULT) : result.final;
      c.takeDamage(aoeDmg);
      this.aggroCreature(c);
      this.damageTexts.push(new DamageText(this, c.x, c.y - 10, aoeDmg, result.crit, false));
      if (c.isDead) this.onCreatureKilled(c);
    }
  }

  private aggroCreature(creature: Creature) {
    if (!creature.isDead && (creature.aiState === 'idle' || creature.aiState === 'wander')) {
      creature.aiState = 'chase';
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

  /** Разговор с NPC-квестодателем */
  private tryTalkToQuestGiver(): boolean {
    const qp = this.questGiverPos;
    if (distance(this.sphere.x, this.sphere.y, qp.x, qp.y) > CAPTURE_RANGE * 1.5) return false;

    const all = this.questTracker.getAll();
    const active = all.filter(q => !q.completed);
    const done   = all.filter(q => q.completed);

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

  private spawnSummonedWolf(x: number, y: number) {
    const def = CREATURE_DB['wolf'];
    if (!def) return;
    const wolf = new Creature(this, x, y, def);
    wolf.isSummoned = true;
    wolf.summonTimer = 30;
    // Масштабирование от Интеллекта призывателя
    const intel = this.sphere.stats.intellect ?? 0;
    wolf.currentHP = wolf.currentHP + intel;
    wolf.stats.strength = (wolf.stats.strength ?? 0) + Math.floor(intel / 5);
    // Зелёный оттенок чтобы отличить от врагов
    wolf.setAlpha(0.85);
    this.creatures.push(wolf);
  }

  /** Призванный волк атакует существо */
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
