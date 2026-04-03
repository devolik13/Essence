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
import { distance } from '../utils/math';
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
    { x: 280, y: 300 },  // Воин
    { x: 320, y: 300 },  // Лучник
    { x: 360, y: 300 },  // Маг
  ];

  // Захват
  private captureProcess: CaptureProcess | null = null;
  private captureTarget: Creature | null = null;

  // Квесты
  private questTracker!: QuestTracker;

  // Выбранная цель
  private selectedTarget: Creature | null = null;
  private targetIndicator!: Phaser.GameObjects.Arc;

  // Клавиши
  private keyQ!: Phaser.Input.Keyboard.Key;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private key1!: Phaser.Input.Keyboard.Key;
  private key2!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // ─── Квесты ──────────────────────────────────────
    this.questTracker = new QuestTracker(QUESTS);

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

    // ─── Индикатор выбранной цели ─────────────────────
    this.targetIndicator = this.add.arc(0, 0, 18, 0, 360, false, 0xffff00, 0)
      .setStrokeStyle(2, 0xffff00, 0.8).setVisible(false);

    // ─── Клавиши ─────────────────────────────────────
    if (this.input.keyboard) {
      this.keyQ     = this.input.keyboard.addKey('Q');
      this.keyE     = this.input.keyboard.addKey('E');
      this.keySpace = this.input.keyboard.addKey('SPACE');
      this.key1     = this.input.keyboard.addKey('ONE');
      this.key2     = this.input.keyboard.addKey('TWO');
    }

    // При изучении заклинания — обновляем слоты и квесты
    this.events.on('spell-learned', (spell: import('../types/abilities').AbilityDef) => {
      if (this.playerBody) this.fillBodySlots(this.playerBody);
      const spellCompleted = this.questTracker.onSpellLearned(spell.id);
      for (const q of spellCompleted) this.onQuestComplete(q);
    });

    // ─── Клик ────────────────────────────────────────
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;
      // Пробуем выбрать цель кликом
      const worldX = pointer.worldX;
      const worldY = pointer.worldY;
      const clicked = this.creatures.find(c =>
        !c.isDead && distance(c.x, c.y, worldX, worldY) < 20
      );
      if (clicked) {
        this.selectTarget(clicked);
      } else {
        // Клик в пустоту — снять цель, или атаковать ближайшее
        if (!this.selectedTarget) this.handleAttack();
        else this.handleAttack();
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
      // Слот 2 [2] — заклинание
      if (Phaser.Input.Keyboard.JustDown(this.key2)) {
        this.handleSpell(1);
      }
    } else {
      this.cameras.main.startFollow(this.sphere, true, 0.1, 0.1);

      // В астрале: [E] захват стартового тела или мёртвого существа
      if (Phaser.Input.Keyboard.JustDown(this.keyE)) {
        this.tryPossessStarter() || this.tryCaptureDead();
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

    // Индикатор выбранной цели
    if (this.selectedTarget && !this.selectedTarget.isDead && this.selectedTarget.active) {
      this.targetIndicator.setPosition(this.selectedTarget.x, this.selectedTarget.y).setVisible(true);
    } else {
      this.selectedTarget = null;
      this.targetIndicator.setVisible(false);
    }

    // Захват
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

  /** Заполняет слоты умений тела: слот 1 — базовая атака, слоты 2+ — выученные заклинания */
  private fillBodySlots(body: Body) {
    body.abilitySlots[0].ability = BASIC_ATTACKS[body.definition.id] ?? BASIC_ATTACKS['default'];

    // Слот 2 — заклинание тела если уже выучено
    const sig = body.definition.signatureSpell;
    if (sig) {
      const learned = this.sphere.learnedSpells.find(s => s.id === sig.id);
      if (learned) body.abilitySlots[1].ability = learned;
    }

    // Слоты 3+ — остальные выученные заклинания Сферы
    let slotIdx = 2;
    for (const spell of this.sphere.learnedSpells) {
      if (sig && spell.id === sig.id) continue; // уже в слоте 2
      if (slotIdx >= 8) break;
      body.abilitySlots[slotIdx].ability = spell;
      slotIdx++;
    }
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
    for (let i = 0; i < 7; i++) {
      const x = 200 + Math.random() * 300;
      const y = 450 + Math.random() * 150;
      this.creatures.push(new Creature(this, x, y, CREATURE_DB['rabbit']));
    }

    // Лесные духи — рядом с кроликами (пассивные, учат Искре)
    for (let i = 0; i < 6; i++) {
      const x = 150 + Math.random() * 350;
      const y = 620 + Math.random() * 120;
      this.creatures.push(new Creature(this, x, y, CREATURE_DB['forest_spirit']));
    }

    // Разведчики — дальнобойные, правее гоблинов
    for (let i = 0; i < 4; i++) {
      const x = 820 + Math.random() * 180;
      const y = 500 + Math.random() * 150;
      this.creatures.push(new Creature(this, x, y, CREATURE_DB['scout']));
    }
  }

  // ─── Атака ────────────────────────────────────────────

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

    this.damageTexts.push(
      new DamageText(this, this.playerBody.x, this.playerBody.y, result.final, result.crit, !result.hit)
    );

    creature.attackCooldown = WEAPON_COOLDOWNS[creature.definition.weapon];

    if (this.playerBody.isDead) {
      this.onPlayerDeath();
    }
  }

  private onCreatureKilled(creature: Creature) {
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

      this.events.emit('creature-killed', { name: creature.definition.nameRu, xp: xpTotal, stats: capStats });
    } else {
      this.events.emit('creature-killed', { name: creature.definition.nameRu, xp: 0, stats: [] });
    }

    // Квест — засчитать убийство
    this.handleQuestKill(creature.definition.id, xpTotal);

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

    // Найти цель
    let target = this.selectedTarget && !this.selectedTarget.isDead ? this.selectedTarget : null;
    if (!target) {
      let closestDist = spell.range;
      for (const c of this.creatures) {
        if (c.isDead) continue;
        const d = distance(this.playerBody.x, this.playerBody.y, c.x, c.y);
        if (d < closestDist) { closestDist = d; target = c; }
      }
    }
    if (!target) return;

    // Расход маны
    this.playerBody.currentMana -= spell.manaCost;

    // Урон (заклинания всегда магический урон)
    const result = calcMagicDamage(this.sphere.stats, target.stats, spell.baseDamage);
    target.takeDamage(result.final);

    this.damageTexts.push(
      new DamageText(this, target.x, target.y - 10, result.final, result.crit, false)
    );

    // Кулдаун на слот
    slot.cooldownRemaining = spell.cooldown;

    if (target.isDead) this.onCreatureKilled(target);
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
}
