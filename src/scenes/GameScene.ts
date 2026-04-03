import Phaser from 'phaser';
import { Sphere } from '../entities/Sphere';
import { Body } from '../entities/Body';
import { Creature } from '../entities/Creature';
import { DamageText } from '../entities/DamageText';
import { STARTER_BODIES, GOBLIN } from '../types/bodies';
import { CREATURE_DB } from '../data/creatureDB';
import {
  MAP_WIDTH, MAP_HEIGHT, MAP_WIDTH_TILES, MAP_HEIGHT_TILES,
  TILE_SIZE, CAPTURE_RANGE,
} from '../utils/constants';
import { distance } from '../utils/math';
import { calcMeleeDamage, calcRangedDamage, calcMagicDamage } from '../systems/combat';
import { WEAPONS } from '../data/weapons';
import {
  CaptureProcess, CaptureState,
  startCapture, updateCapture, interruptCapture,
} from '../systems/capture';
import { addXP, isFirstCapReached } from '../systems/progression';
import { StatName } from '../types/stats';

export class GameScene extends Phaser.Scene {
  private sphere!: Sphere;
  private playerBody: Body | null = null;
  private creatures: Creature[] = [];
  private damageTexts: DamageText[] = [];
  private starterBodies: Phaser.GameObjects.Arc[] = [];

  // Стартовые тела на камне возрождения
  private starterPositions = [
    { x: 280, y: 300 },  // Воин
    { x: 320, y: 300 },  // Лучник
    { x: 360, y: 300 },  // Маг
  ];

  // Захват
  private captureProcess: CaptureProcess | null = null;
  private captureTarget: Creature | null = null;

  // Клавиши
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // ─── Тайловая карта ──────────────────────────────
    this.buildMap();

    // ─── Сфера ───────────────────────────────────────
    this.sphere = new Sphere(this, 320, 320);

    // ─── Стартовые тела (визуальные маркеры) ─────────
    this.createStarterMarkers();

    // ─── Мобы ────────────────────────────────────────
    this.spawnCreatures();

    // ─── Камера ──────────────────────────────────────
    this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    this.cameras.main.startFollow(this.sphere, true, 0.1, 0.1);

    // ─── Клавиши ─────────────────────────────────────
    if (this.input.keyboard) {
      this.keyQ = this.input.keyboard.addKey('Q');
      this.keyE = this.input.keyboard.addKey('E');
      this.keySpace = this.input.keyboard.addKey('SPACE');
    }

    // ─── Клик — атака ────────────────────────────────
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
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
    } else {
      this.cameras.main.startFollow(this.sphere, true, 0.1, 0.1);

      // В астрале: [E] захват стартового тела
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.tryPossessStarter();
      }
    }

    // Обновляем мобов
    const px = this.playerBody?.x ?? -9999;
    const py = this.playerBody?.y ?? -9999;
    for (const creature of this.creatures) {
      creature.update(time, delta, px, py);

      // Моб атакует игрока
      if (creature.aiState === 'attack' && this.playerBody && creature.attackCooldown <= 0) {
        this.creatureAttackPlayer(creature);
      }
    }

    // Обновляем текст урона
    this.damageTexts = this.damageTexts.filter(dt => !dt.update(time, delta));

    // Захват
    if (this.captureProcess && this.captureProcess.state === CaptureState.Casting) {
      this.captureProcess = updateCapture(this.captureProcess, delta);

      if (this.captureProcess.state === CaptureState.Success && this.captureTarget) {
        this.completeCaptureCreature(this.captureTarget);
        this.captureProcess = null;
        this.captureTarget = null;
      }
    }

    // Передаём данные в UIScene
    this.events.emit('update-ui', {
      sphere: this.sphere,
      body: this.playerBody,
      capture: this.captureProcess,
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

    // Безопасная зона (камень) — 8x6 тайлов в центре-лево
    for (let ty = 8; ty < 14; ty++) {
      for (let tx = 7; tx < 15; tx++) {
        this.add.image(tx * TILE_SIZE + 16, ty * TILE_SIZE + 16, 'tile_stone');
      }
    }

    // Камень возрождения
    this.add.image(320, 280, 'respawn_stone');
    this.add.text(320, 256, 'Камень возрождения', {
      fontSize: '11px', color: '#aaaaee', align: 'center',
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
  }

  /** Попытка захватить стартовое тело (в астрале, нажатие E) */
  private tryPossessStarter() {
    for (let i = 0; i < this.starterPositions.length; i++) {
      const pos = this.starterPositions[i];
      const dist = distance(this.sphere.x, this.sphere.y, pos.x, pos.y);
      if (dist < CAPTURE_RANGE) {
        this.possessStarterBody(i);
        return;
      }
    }
  }

  private possessStarterBody(index: number) {
    const def = STARTER_BODIES[index];
    const pos = this.starterPositions[index];

    this.playerBody = new Body(this, pos.x, pos.y, def, this.sphere.stats);
    this.playerBody.possess(this);
    this.sphere.enterBody();
  }

  // ─── Выход из тела ────────────────────────────────────

  private exitBody() {
    if (!this.playerBody) return;

    const x = this.playerBody.x;
    const y = this.playerBody.y;

    this.playerBody.release();
    this.playerBody.destroy();
    this.playerBody = null;

    this.sphere.enterAstral(x, y);
  }

  // ─── Спавн мобов ─────────────────────────────────────

  private spawnCreatures() {
    // Гоблины — группа справа от безопасной зоны
    for (let i = 0; i < 5; i++) {
      const x = 600 + Math.random() * 200;
      const y = 250 + Math.random() * 200;
      const creature = new Creature(this, x, y, CREATURE_DB['goblin']);
      this.creatures.push(creature);
    }

    // Волки — дальше
    for (let i = 0; i < 3; i++) {
      const x = 900 + Math.random() * 200;
      const y = 300 + Math.random() * 200;
      const creature = new Creature(this, x, y, CREATURE_DB['wolf']);
      this.creatures.push(creature);
    }

    // Кролики — рядом с базой (пассивные)
    for (let i = 0; i < 4; i++) {
      const x = 200 + Math.random() * 300;
      const y = 450 + Math.random() * 150;
      const creature = new Creature(this, x, y, CREATURE_DB['rabbit']);
      this.creatures.push(creature);
    }
  }

  // ─── Атака ────────────────────────────────────────────

  private handleAttack() {
    if (!this.playerBody || this.playerBody.attackCooldown > 0) return;

    const weapon = this.playerBody.weapon;
    let closestCreature: Creature | null = null;
    let closestDist = weapon.range;

    for (const creature of this.creatures) {
      if (creature.isDead) continue;
      const dist = distance(this.playerBody.x, this.playerBody.y, creature.x, creature.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestCreature = creature;
      }
    }

    if (!closestCreature) return;

    // Расчёт урона
    const result = weapon.isMelee
      ? calcMeleeDamage(this.sphere.stats, closestCreature.stats)
      : calcRangedDamage(this.sphere.stats, closestCreature.stats);

    if (result.hit) {
      closestCreature.takeDamage(result.final);

      // Агро
      if (closestCreature.aiState === 'idle' || closestCreature.aiState === 'wander') {
        closestCreature.aiState = 'chase';
      }
    }

    // Текст урона
    this.damageTexts.push(
      new DamageText(this, closestCreature.x, closestCreature.y, result.final, result.crit, !result.hit)
    );

    // Кулдаун
    this.playerBody.attackCooldown = weapon.cooldown;

    // XP за удар
    if (result.hit) {
      const xpStat = weapon.isMelee ? StatName.Strength : StatName.Agility;
      const levelUp = addXP(
        this.sphere.stats,
        this.playerBody.xpTracker,
        xpStat,
        2,
        this.playerBody.definition.caps,
      );
      if (levelUp) {
        this.events.emit('stat-up', levelUp);
      }
    }

    // Проверка смерти моба
    if (closestCreature.isDead) {
      this.onCreatureKilled(closestCreature);
    }
  }

  private creatureAttackPlayer(creature: Creature) {
    if (!this.playerBody) return;

    const result = calcMeleeDamage(creature.stats, this.sphere.stats);

    if (result.hit) {
      this.playerBody.takeDamage(result.final);
    }

    this.damageTexts.push(
      new DamageText(this, this.playerBody.x, this.playerBody.y, result.final, result.crit, !result.hit)
    );

    creature.attackCooldown = 1.5; // мобы атакуют раз в 1.5 сек

    // Смерть игрока
    if (this.playerBody.isDead) {
      this.onPlayerDeath();
    }
  }

  private onCreatureKilled(creature: Creature) {
    // XP за убийство
    // TODO: распределить по всем основным статам тела
    this.events.emit('creature-killed', creature.definition.nameRu);
  }

  private onPlayerDeath() {
    // Респавн — выход из тела на камне возрождения
    if (this.playerBody) {
      this.playerBody.release();
      this.playerBody.destroy();
      this.playerBody = null;
    }
    this.sphere.enterAstral(320, 320); // камень возрождения
    this.events.emit('player-died');
  }

  // ─── Захват существа ──────────────────────────────────

  private completeCaptureCreature(creature: Creature) {
    // Захватываем тело существа — создаём Body из его определения
    const def = creature.definition;
    this.playerBody = new Body(this, creature.x, creature.y, def, this.sphere.stats);
    this.playerBody.possess(this);
    this.sphere.enterBody();

    // Убираем существо
    creature.destroy();
    this.creatures = this.creatures.filter(c => c !== creature);

    this.events.emit('body-captured', def.nameRu);
  }
}
