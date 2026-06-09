import Phaser from 'phaser';
import { DECO_CELL, DECO_COLS, DECO_ROWS } from '../data/decorations';
import { CP_ASSETS, MOB_SPRITE_SETS, ANIMAL_SPRITE_SETS, WORKBENCH_COLORS } from '../data/craftpixAssets';
import { RESOURCE_NODES } from '../data/itemDB';
import { loadAllSpriteSheets } from '../systems/spriteSheetLoader';

/**
 * BootScene — загрузка ассетов и переход к игре.
 * Текстуры генерируются программно (без PNG файлов).
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Тайлсет мира — 10 терреновых тайлов 32×32 (5×2 грид, 160×64)
    this.load.image('tileset_world', 'assets/tileset_world.webp');

    // CraftPix "Top-Down Simple Summer" — 89 PNG (56 земли + 33 пропа)
    for (const [key, path] of CP_ASSETS) {
      this.load.image(key, path);
    }

    // Mob directional spritesheets — all animations (goblin style: separate files per direction)
    const loadedSheets = new Set<string>();
    for (const [mobId, spriteSet] of Object.entries(MOB_SPRITE_SETS)) {
      for (const [animKey, anim] of Object.entries(spriteSet.anims)) {
        const sheetKey = `mob_sheet_${mobId}_${animKey}`;
        if (loadedSheets.has(sheetKey)) continue;
        loadedSheets.add(sheetKey);
        this.load.spritesheet(sheetKey, spriteSet.folder + anim.file, {
          frameWidth: spriteSet.frameW, frameHeight: spriteSet.frameH,
        });
      }
    }
    // Animal spritesheets — rows = directions in single file
    for (const [creatureId, animalSet] of Object.entries(ANIMAL_SPRITE_SETS)) {
      for (const [animName, sheet] of Object.entries(animalSet.sheets)) {
        const sheetKey = `animal_${creatureId}_${animName}`;
        if (loadedSheets.has(sheetKey)) continue;
        loadedSheets.add(sheetKey);
        this.load.spritesheet(sheetKey, animalSet.folder + sheet.file, {
          frameWidth: animalSet.frameW, frameHeight: animalSet.frameH,
        });
      }
    }

    // Caravan cart spritesheets (4x4 / 128px / 16 frames)
    const CART_DIR = 'assets/objects/caravan_cart/';
    this.load.spritesheet('cart_move_down',  CART_DIR + 'merchant_cart-iso_custom_move_down-v1.webp',  { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('cart_move_right', CART_DIR + 'merchant_cart-iso_custom_move_right-v1.webp', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('cart_move_up',    CART_DIR + 'merchant_cart-iso_custom_move_up-v1.webp',    { frameWidth: 128, frameHeight: 128 });

    const gfx = this.add.graphics();

    // ── Тайл травы 32x32 ────────────────────────────────
    gfx.fillStyle(0x2d5a1e, 1);
    gfx.fillRect(0, 0, 32, 32);
    gfx.fillStyle(0x3a6b2a, 1);
    gfx.fillRect(4, 4, 2, 2);
    gfx.fillRect(14, 8, 2, 2);
    gfx.fillRect(24, 18, 2, 2);
    gfx.fillRect(8, 26, 2, 2);
    gfx.fillRect(20, 28, 2, 2);
    gfx.generateTexture('tile_grass', 32, 32);
    gfx.clear();

    // ── Тайл камня (безопасная зона) ─────────────────────
    gfx.fillStyle(0x555566, 1);
    gfx.fillRect(0, 0, 32, 32);
    gfx.fillStyle(0x666677, 1);
    gfx.fillRect(2, 2, 12, 12);
    gfx.fillRect(18, 16, 12, 12);
    gfx.generateTexture('tile_stone', 32, 32);
    gfx.clear();

    // ── Камень возрождения ────────────────────────────────
    gfx.fillStyle(0x8888cc, 1);
    gfx.fillRect(4, 4, 24, 24);
    gfx.fillStyle(0xaaaaee, 1);
    gfx.fillRect(8, 8, 16, 16);
    gfx.generateTexture('respawn_stone', 32, 32);
    gfx.clear();

    // ── Персонажи (28×28) ─────────────────────────────────
    this.genCharTextures(gfx);

    // ── Ресурсные ноды / верстаки для редактора (плейсхолдеры) ─
    this.genFixtureTextures(gfx);

    // ── VFX текстуры частиц ──────────────────────────────
    this.genParticleTextures(gfx);

    // ── Атлас декораций ──────────────────────────────────
    // Чтобы подключить реальный PNG — заменить этот вызов на:
    //   this.load.spritesheet('decorations', 'assets/decorations.png',
    //     { frameWidth: DECO_CELL, frameHeight: DECO_CELL });
    this.generateDecorationAtlas();

    gfx.destroy();
  }

  /**
   * Плейсхолдер-текстуры для ресурсных нод и верстаков.
   * Ключ текстуры === editor-ключ (node_* / wb_*), чтобы редактор и in-game
   * рендер находили её напрямую.
   */
  private genFixtureTextures(g: Phaser.GameObjects.Graphics) {
    // Ресурсные ноды — кружок цвета ноды с тёмной окантовкой (28×28)
    for (const id of Object.keys(RESOURCE_NODES)) {
      const def = RESOURCE_NODES[id];
      if (def.sprite) continue; // ноды с PNG-спрайтом используют загруженную текстуру
      g.clear();
      g.fillStyle(def.color, 1);
      g.fillCircle(14, 14, 12);
      // тонкая тёмная окантовка
      g.lineStyle(2, 0x222222, 0.8);
      g.strokeCircle(14, 14, 12);
      g.generateTexture('node_' + id, 28, 28);
    }
    g.clear();

    // Верстаки — скруглённый прямоугольник своего цвета (28×24)
    for (const type of ['armorer', 'weaponsmith', 'jeweler', 'runemaster']) {
      const col = WORKBENCH_COLORS[type] ?? { fill: 0x664422, stroke: 0x996633 };
      g.clear();
      g.fillStyle(col.fill, 1);
      g.fillRoundedRect(0, 2, 28, 20, 4);
      g.lineStyle(2, col.stroke, 1);
      g.strokeRoundedRect(0, 2, 28, 20, 4);
      g.generateTexture('wb_' + type, 28, 24);
    }
    g.clear();
  }

  private genParticleTextures(g: Phaser.GameObjects.Graphics) {
    // Круглая частица (мягкая, 16×16)
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 6);
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(8, 8, 8);
    g.generateTexture('particle_circle', 16, 16);
    g.clear();

    // Квадратная искра (4×4)
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle_spark', 4, 4);
    g.clear();

    // Маленькая точка (2×2)
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture('particle_dot', 2, 2);
    g.clear();

    // ── Дерево (24×32) ────────────────────────────────
    g.clear();
    // Ствол
    g.fillStyle(0x664422, 1);
    g.fillRect(9, 20, 6, 12);
    // Крона
    g.fillStyle(0x336622, 1);
    g.fillCircle(12, 14, 10);
    g.fillStyle(0x448833, 1);
    g.fillCircle(12, 12, 8);
    g.fillStyle(0x55aa44, 1);
    g.fillCircle(12, 10, 5);
    g.generateTexture('deco_tree', 24, 32);
    g.clear();

    // ── Камень (16×12) ────────────────────────────────
    g.fillStyle(0x666677, 1);
    g.fillRoundedRect(0, 2, 16, 10, 4);
    g.fillStyle(0x777788, 1);
    g.fillRoundedRect(2, 0, 12, 8, 3);
    g.generateTexture('deco_rock', 16, 12);
    g.clear();

    // ── Куст (16×14) ──────────────────────────────────
    g.fillStyle(0x2d5a1e, 1);
    g.fillCircle(8, 8, 7);
    g.fillStyle(0x3a7a2a, 1);
    g.fillCircle(8, 6, 5);
    g.generateTexture('deco_bush', 16, 14);
    g.clear();

    // ── Фургон (48×32) — для каравана на Trade Road ────
    // Тёмно-коричневый кузов, бежевый тент, два колеса, передняя ось
    g.fillStyle(0x3a2714, 1);
    g.fillRect(4, 12, 40, 14);
    g.fillStyle(0x8a6a2f, 1);
    g.fillRect(6, 14, 36, 2);
    g.fillRect(6, 20, 36, 2);
    // Тент (крыша)
    g.fillStyle(0xccaa77, 1);
    g.fillRect(4, 4, 40, 10);
    g.fillStyle(0xddbb88, 1);
    g.fillRect(6, 6, 36, 4);
    // Полосы на тенте
    g.fillStyle(0x8a6a2f, 1);
    g.fillRect(12, 4, 2, 10);
    g.fillRect(22, 4, 2, 10);
    g.fillRect(32, 4, 2, 10);
    // Колёса
    g.fillStyle(0x1a0f05, 1);
    g.fillCircle(12, 26, 5);
    g.fillCircle(36, 26, 5);
    g.fillStyle(0x6b4e1f, 1);
    g.fillCircle(12, 26, 3);
    g.fillCircle(36, 26, 3);
    g.fillStyle(0x1a0f05, 1);
    g.fillCircle(12, 26, 1);
    g.fillCircle(36, 26, 1);
    // Передняя ось / дышло
    g.fillStyle(0x3a2714, 1);
    g.fillRect(44, 18, 4, 2);
    g.generateTexture('deco_wagon', 48, 32);
    g.clear();
  }

  private genCharTextures(g: Phaser.GameObjects.Graphics) {
    // ── Вспомогательные функции ──────────────────────────
    const skin  = 0xffccaa;
    const metal = 0xccccdd;

    // ── Human Warrior (body_human_warrior) ───────────────
    // Красный воин со щитом и мечом
    g.clear();
    // Ноги
    g.fillStyle(0x882222, 1);
    g.fillRect(8, 20, 5, 7);
    g.fillRect(15, 20, 5, 7);
    // Доспех
    g.fillStyle(0xcc3333, 1);
    g.fillRect(5, 9, 18, 13);
    // Нагрудная полоса
    g.fillStyle(0xee6666, 1);
    g.fillRect(11, 11, 6, 7);
    // Щит (слева)
    g.fillStyle(0x3355cc, 1);
    g.fillRect(1, 9, 4, 11);
    g.fillStyle(0x6677ee, 1);
    g.fillRect(2, 12, 2, 5);
    // Меч (справа) — рукоять
    g.fillStyle(0xddaa33, 1);
    g.fillRect(23, 12, 4, 3);
    // Лезвие
    g.fillStyle(metal, 1);
    g.fillRect(24, 5, 2, 12);
    // Голова
    g.fillStyle(skin, 1);
    g.fillRect(9, 2, 10, 8);
    // Шлем
    g.fillStyle(0xcc2222, 1);
    g.fillRect(8, 1, 12, 5);
    g.fillRect(7, 4, 2, 5);
    g.fillRect(19, 4, 2, 5);
    // Глаза
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 5, 2, 2);
    g.fillRect(15, 5, 2, 2);
    g.generateTexture('body_human_warrior', 28, 28);
    g.clear();

    // ── Human Archer (body_human_archer) ─────────────────
    // Зелёный лучник с луком
    g.fillStyle(0x224422, 1);
    g.fillRect(9, 19, 4, 8);
    g.fillRect(15, 19, 4, 8);
    // Плащ/туника
    g.fillStyle(0x336633, 1);
    g.fillRect(5, 8, 18, 13);
    // Деталь туники
    g.fillStyle(0x448844, 1);
    g.fillRect(10, 10, 8, 6);
    // Колчан (справа, коричневый)
    g.fillStyle(0x886633, 1);
    g.fillRect(21, 7, 4, 12);
    g.fillStyle(0xaaaa33, 1);
    g.fillRect(22, 8, 2, 2);
    g.fillRect(22, 12, 2, 2);
    g.fillRect(22, 16, 2, 2);
    // Лук (слева)
    g.fillStyle(0x774422, 1);
    g.fillRect(2, 6, 3, 16);
    g.fillRect(2, 6, 3, 3);
    g.fillRect(2, 19, 3, 3);
    g.fillStyle(0xccbb88, 1);
    g.fillRect(3, 9, 1, 10);  // тетива
    // Голова
    g.fillStyle(skin, 1);
    g.fillRect(9, 2, 10, 8);
    // Капюшон
    g.fillStyle(0x336633, 1);
    g.fillRect(8, 1, 12, 5);
    // Глаза
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 5, 2, 2);
    g.fillRect(15, 5, 2, 2);
    g.generateTexture('body_human_archer', 28, 28);
    g.clear();

    // ── Human Mage (body_human_mage) ─────────────────────
    // Синий маг с посохом
    g.fillStyle(0x112255, 1);
    g.fillRect(9, 20, 4, 7);
    g.fillRect(15, 20, 4, 7);
    // Мантия
    g.fillStyle(0x2244aa, 1);
    g.fillRect(4, 8, 20, 14);
    // Звезда на мантии
    g.fillStyle(0x66aaff, 1);
    g.fillRect(12, 12, 4, 4);
    g.fillRect(11, 13, 6, 2);
    g.fillRect(13, 11, 2, 6);
    // Посох (справа)
    g.fillStyle(0x886633, 1);
    g.fillRect(22, 2, 3, 24);
    // Кристалл на посохе
    g.fillStyle(0x44ffcc, 1);
    g.fillRect(21, 1, 5, 5);
    g.fillStyle(0xaaffee, 1);
    g.fillRect(22, 2, 3, 3);
    // Голова
    g.fillStyle(skin, 1);
    g.fillRect(9, 2, 10, 8);
    // Шляпа мага
    g.fillStyle(0x1a3388, 1);
    g.fillRect(7, 0, 14, 4);
    g.fillRect(10, -2, 8, 4);  // конус (clipped)
    g.fillRect(11, 1, 6, 4);
    // Глаза
    g.fillStyle(0x4466ff, 1);
    g.fillRect(11, 5, 2, 2);
    g.fillRect(15, 5, 2, 2);
    g.generateTexture('body_human_mage', 28, 28);
    g.clear();

    // ── Goblin (body_goblin) ──────────────────────────────
    g.fillStyle(0x336622, 1);
    g.fillRect(10, 19, 4, 7);
    g.fillRect(15, 19, 4, 7);
    // Тело
    g.fillStyle(0x44aa22, 1);
    g.fillRect(7, 9, 14, 12);
    // Пояс
    g.fillStyle(0x885522, 1);
    g.fillRect(7, 18, 14, 3);
    // Кинжал (справа)
    g.fillStyle(metal, 1);
    g.fillRect(21, 7, 2, 10);
    g.fillStyle(0x885522, 1);
    g.fillRect(20, 14, 4, 3);
    // Голова (большая)
    g.fillStyle(0x55bb33, 1);
    g.fillRect(7, 1, 14, 10);
    // Уши (большие, по бокам)
    g.fillStyle(0x44aa22, 1);
    g.fillRect(3, 3, 5, 7);
    g.fillRect(20, 3, 5, 7);
    g.fillStyle(0x77cc55, 1);
    g.fillRect(4, 5, 3, 4);
    g.fillRect(21, 5, 3, 4);
    // Глаза (жёлтые)
    g.fillStyle(0xffff00, 1);
    g.fillRect(10, 4, 3, 3);
    g.fillRect(16, 4, 3, 3);
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 5, 1, 2);
    g.fillRect(17, 5, 1, 2);
    g.generateTexture('body_goblin', 28, 28);
    g.clear();

    // ── Rabbit (body_rabbit) ──────────────────────────────
    // Пушистый кролик
    g.fillStyle(0xaa8855, 1);
    g.fillRect(9, 18, 5, 8);
    g.fillRect(14, 18, 5, 8);
    // Тело
    g.fillStyle(0xccaa77, 1);
    g.fillRect(6, 9, 16, 12);
    // Брюшко (светлее)
    g.fillStyle(0xeeddbb, 1);
    g.fillRect(9, 11, 10, 8);
    // Голова
    g.fillStyle(0xccaa77, 1);
    g.fillRect(8, 2, 12, 9);
    // Длинные уши
    g.fillStyle(0xccaa77, 1);
    g.fillRect(9, -4, 4, 8);
    g.fillRect(15, -4, 4, 8);
    g.fillStyle(0xffaaaa, 1);
    g.fillRect(10, -3, 2, 6);
    g.fillRect(16, -3, 2, 6);
    // Нос
    g.fillStyle(0xffaaaa, 1);
    g.fillRect(13, 7, 2, 2);
    // Глаза
    g.fillStyle(0x993333, 1);
    g.fillRect(10, 4, 2, 2);
    g.fillRect(16, 4, 2, 2);
    g.generateTexture('body_rabbit', 28, 28);
    g.clear();

    // ── Wolf (body_wolf) ──────────────────────────────────
    g.fillStyle(0x666666, 1);
    // Тело (горизонтальное, волк на четырёх)
    g.fillRect(4, 10, 22, 12);
    // Ноги (4 штуки)
    g.fillStyle(0x555555, 1);
    g.fillRect(5, 20, 4, 7);
    g.fillRect(11, 20, 4, 7);
    g.fillRect(14, 20, 4, 7);
    g.fillRect(20, 20, 4, 7);
    // Хвост
    g.fillStyle(0x888888, 1);
    g.fillRect(22, 5, 4, 8);
    g.fillRect(24, 3, 3, 5);
    // Голова (морда вперёд)
    g.fillStyle(0x777777, 1);
    g.fillRect(2, 7, 12, 10);
    // Морда
    g.fillStyle(0xaaaaaa, 1);
    g.fillRect(1, 9, 5, 7);
    // Зубы/пасть
    g.fillStyle(0xffffff, 1);
    g.fillRect(2, 14, 4, 2);
    // Глаза (жёлтые)
    g.fillStyle(0xffcc00, 1);
    g.fillRect(6, 9, 3, 3);
    g.fillStyle(0x111111, 1);
    g.fillRect(7, 9, 1, 2);
    // Уши
    g.fillStyle(0x666666, 1);
    g.fillRect(8, 4, 3, 4);
    g.fillRect(13, 4, 3, 4);
    g.generateTexture('body_wolf', 28, 28);
    g.clear();

    // ── Bear (body_bear) ──────────────────────────────────
    // Большой медведь
    g.fillStyle(0x553311, 1);
    g.fillRect(7, 20, 6, 7);
    g.fillRect(16, 20, 6, 7);
    // Массивное тело
    g.fillStyle(0x664422, 1);
    g.fillRect(3, 8, 22, 14);
    // Живот (светлее)
    g.fillStyle(0x886644, 1);
    g.fillRect(8, 10, 12, 10);
    // Лапы
    g.fillStyle(0x553311, 1);
    g.fillRect(1, 12, 4, 8);
    g.fillRect(23, 12, 4, 8);
    // Когти
    g.fillStyle(0x111111, 1);
    g.fillRect(1, 19, 2, 2);
    g.fillRect(23, 19, 2, 2);
    // Голова (круглая большая)
    g.fillStyle(0x664422, 1);
    g.fillRect(7, 1, 14, 10);
    // Уши
    g.fillStyle(0x553311, 1);
    g.fillRect(7, 0, 4, 4);
    g.fillRect(17, 0, 4, 4);
    // Глаза (маленькие)
    g.fillStyle(0x111111, 1);
    g.fillRect(10, 4, 3, 3);
    g.fillRect(16, 4, 3, 3);
    // Нос
    g.fillStyle(0x222222, 1);
    g.fillRect(12, 8, 4, 3);
    g.generateTexture('body_bear', 28, 28);
    g.clear();

    // ── Hare (body_hare) ────────────────────────────────────
    g.fillStyle(0x998866, 1);
    g.fillRect(10, 18, 4, 6);
    g.fillRect(16, 18, 4, 6);
    g.fillStyle(0xbb9966, 1);
    g.fillRect(7, 10, 14, 10);
    g.fillStyle(0xddccaa, 1);
    g.fillRect(10, 12, 8, 6);
    g.fillStyle(0xbb9966, 1);
    g.fillRect(9, 3, 10, 8);
    g.fillRect(10, -3, 3, 7);
    g.fillRect(17, -3, 3, 7);
    g.fillStyle(0xffaaaa, 1);
    g.fillRect(11, -2, 1, 5);
    g.fillRect(18, -2, 1, 5);
    g.fillStyle(0xffaaaa, 1);
    g.fillRect(13, 7, 2, 2);
    g.fillStyle(0x331111, 1);
    g.fillRect(11, 5, 2, 2);
    g.fillRect(17, 5, 2, 2);
    g.generateTexture('body_hare', 28, 28);
    g.clear();

    // ── Deer (body_deer) ────────────────────────────────────
    g.fillStyle(0x775533, 1);
    g.fillRect(8, 18, 4, 8);
    g.fillRect(17, 18, 4, 8);
    g.fillStyle(0xaa7744, 1);
    g.fillRect(5, 9, 18, 12);
    g.fillStyle(0xccaa77, 1);
    g.fillRect(9, 11, 10, 8);
    g.fillStyle(0xaa7744, 1);
    g.fillRect(8, 1, 12, 10);
    g.fillStyle(0x775533, 1);
    g.fillRect(8, -4, 3, 5);
    g.fillRect(11, -6, 2, 3);
    g.fillRect(7, -6, 2, 3);
    g.fillRect(17, -4, 3, 5);
    g.fillRect(19, -6, 2, 3);
    g.fillRect(16, -6, 2, 3);
    g.fillStyle(0x111111, 1);
    g.fillRect(10, 4, 2, 2);
    g.fillRect(16, 4, 2, 2);
    g.fillStyle(0x222222, 1);
    g.fillRect(13, 7, 2, 2);
    g.generateTexture('body_deer', 28, 28);
    g.clear();

    // ── Fox (body_fox) ────────────────────────────────────
    g.fillStyle(0xcc5511, 1);
    g.fillRect(9, 18, 4, 6);
    g.fillRect(16, 18, 4, 6);
    g.fillStyle(0xdd6622, 1);
    g.fillRect(5, 10, 18, 11);
    g.fillStyle(0xeeddbb, 1);
    g.fillRect(9, 13, 10, 6);
    g.fillStyle(0xdd6622, 1);
    g.fillRect(8, 2, 12, 10);
    g.fillRect(7, 0, 4, 4);
    g.fillRect(17, 0, 4, 4);
    g.fillStyle(0x111111, 1);
    g.fillRect(10, 5, 2, 2);
    g.fillRect(16, 5, 2, 2);
    g.fillStyle(0x222222, 1);
    g.fillRect(13, 8, 2, 2);
    g.fillStyle(0xdd6622, 1);
    g.fillRect(21, 6, 5, 6);
    g.fillStyle(0xeeddbb, 1);
    g.fillRect(24, 8, 3, 3);
    g.generateTexture('body_fox', 28, 28);
    g.clear();

    // ── Boar (body_boar) ────────────────────────────────────
    g.fillStyle(0x553322, 1);
    g.fillRect(7, 20, 5, 6);
    g.fillRect(16, 20, 5, 6);
    g.fillStyle(0x774422, 1);
    g.fillRect(4, 9, 20, 13);
    g.fillStyle(0x553322, 1);
    g.fillRect(7, 10, 14, 4);
    g.fillStyle(0x774422, 1);
    g.fillRect(7, 2, 14, 9);
    g.fillStyle(0xccaa88, 1);
    g.fillRect(10, 7, 8, 4);
    g.fillStyle(0xeeeeee, 1);
    g.fillRect(9, 8, 2, 2);
    g.fillRect(17, 8, 2, 2);
    g.fillStyle(0x111111, 1);
    g.fillRect(10, 4, 2, 2);
    g.fillRect(16, 4, 2, 2);
    g.generateTexture('body_boar', 28, 28);
    g.clear();

    // ── Grouse (body_grouse) ────────────────────────────────
    g.fillStyle(0x445566, 1);
    g.fillRect(10, 20, 3, 4);
    g.fillRect(16, 20, 3, 4);
    g.fillStyle(0x334455, 1);
    g.fillRect(7, 10, 14, 12);
    g.fillStyle(0x556677, 1);
    g.fillRect(10, 12, 8, 6);
    g.fillStyle(0x334455, 1);
    g.fillRect(9, 3, 10, 9);
    g.fillStyle(0xffaa33, 1);
    g.fillRect(12, 8, 4, 3);
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 5, 2, 2);
    g.fillRect(16, 5, 2, 2);
    g.fillStyle(0x445566, 1);
    g.fillRect(3, 11, 5, 8);
    g.fillRect(20, 11, 5, 8);
    g.generateTexture('body_grouse', 28, 28);
    g.clear();

    // ── Orc (body_orc) ────────────────────────────────────
    // Мощный орк с топором
    g.fillStyle(0x223311, 1);
    g.fillRect(8, 20, 5, 7);
    g.fillRect(16, 20, 5, 7);
    // Массивное тело
    g.fillStyle(0x334422, 1);
    g.fillRect(4, 8, 20, 14);
    // Доспех/кираса
    g.fillStyle(0x2a3322, 1);
    g.fillRect(8, 9, 12, 10);
    // Топор (справа)
    g.fillStyle(0x777788, 1);
    g.fillRect(22, 4, 4, 8);
    g.fillRect(20, 3, 6, 4);
    g.fillStyle(0x886633, 1);
    g.fillRect(23, 10, 2, 12);
    // Голова
    g.fillStyle(0x446633, 1);
    g.fillRect(7, 1, 14, 10);
    // Клыки
    g.fillStyle(0xeeddcc, 1);
    g.fillRect(11, 9, 2, 4);
    g.fillRect(16, 9, 2, 4);
    // Глаза (красные)
    g.fillStyle(0xff3300, 1);
    g.fillRect(10, 4, 3, 3);
    g.fillRect(16, 4, 3, 3);
    g.generateTexture('body_orc', 28, 28);
    g.clear();

    // ── Scout (body_scout) ────────────────────────────────
    // Ловкий разведчик с коротким луком
    g.fillStyle(0x445522, 1);
    g.fillRect(9, 20, 4, 7);
    g.fillRect(15, 20, 4, 7);
    // Плащ
    g.fillStyle(0x667733, 1);
    g.fillRect(5, 8, 18, 13);
    // Деталь
    g.fillStyle(0x556622, 1);
    g.fillRect(10, 10, 8, 7);
    // Короткий лук (слева)
    g.fillStyle(0x885522, 1);
    g.fillRect(2, 8, 3, 13);
    g.fillStyle(0xbbaa77, 1);
    g.fillRect(3, 10, 1, 9);
    // Плащ (правый угол, треугольник-ish)
    g.fillStyle(0x445522, 1);
    g.fillRect(21, 8, 5, 11);
    // Голова
    g.fillStyle(skin, 1);
    g.fillRect(9, 2, 10, 8);
    // Берет
    g.fillStyle(0x556622, 1);
    g.fillRect(8, 1, 12, 4);
    // Глаза
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 5, 2, 2);
    g.fillRect(15, 5, 2, 2);
    g.generateTexture('body_scout', 28, 28);
    g.clear();

    // ── Shaman (body_shaman) ──────────────────────────────
    // Шаман с тотемным посохом
    g.fillStyle(0x551166, 1);
    g.fillRect(9, 20, 4, 7);
    g.fillRect(15, 20, 4, 7);
    // Мантия
    g.fillStyle(0x8833aa, 1);
    g.fillRect(4, 8, 20, 14);
    // Руны на мантии
    g.fillStyle(0xcc66ff, 1);
    g.fillRect(9, 11, 3, 3);
    g.fillRect(16, 11, 3, 3);
    g.fillRect(12, 16, 4, 2);
    // Тотем (слева)
    g.fillStyle(0x665522, 1);
    g.fillRect(2, 2, 3, 24);
    g.fillStyle(0xcc6633, 1);
    g.fillRect(0, 2, 7, 5);
    g.fillStyle(0x994422, 1);
    g.fillRect(1, 3, 5, 3);
    // Посох (правая рука)
    g.fillStyle(0x442255, 1);
    g.fillRect(23, 4, 3, 20);
    // Кристалл
    g.fillStyle(0xee44ff, 1);
    g.fillRect(21, 2, 7, 5);
    g.fillStyle(0xffc0ff, 1);
    g.fillRect(23, 3, 3, 3);
    // Голова
    g.fillStyle(0x664477, 1);
    g.fillRect(8, 1, 12, 10);
    // Маска/лицо
    g.fillStyle(0xcc99cc, 1);
    g.fillRect(10, 3, 8, 6);
    g.fillStyle(0xee00ff, 1);
    g.fillRect(11, 4, 2, 2);
    g.fillRect(15, 4, 2, 2);
    g.generateTexture('body_shaman', 28, 28);
    g.clear();

    // ── Forest Spirit (body_forest_spirit) ────────────────
    // Призрачный светящийся дух
    g.fillStyle(0x22aa88, 0.8);
    g.fillRect(8, 16, 12, 10);
    // Тело-туман (несколько слоёв)
    g.fillStyle(0x44ccaa, 1);
    g.fillRect(6, 7, 16, 14);
    g.fillStyle(0x66ddbb, 0.9);
    g.fillRect(9, 5, 10, 16);
    // Свечение центра
    g.fillStyle(0xaaffee, 1);
    g.fillRect(11, 9, 6, 8);
    g.fillStyle(0xeeffff, 1);
    g.fillRect(12, 11, 4, 4);
    // «Руки» по бокам
    g.fillStyle(0x44ccaa, 0.7);
    g.fillRect(2, 9, 5, 8);
    g.fillRect(21, 9, 5, 8);
    // Голова (полупрозрачная)
    g.fillStyle(0x55ddbb, 1);
    g.fillRect(9, 1, 10, 8);
    // Глаза (светящиеся)
    g.fillStyle(0xffffff, 1);
    g.fillRect(11, 3, 3, 3);
    g.fillRect(15, 3, 3, 3);
    g.fillStyle(0x00ffcc, 1);
    g.fillRect(12, 4, 1, 2);
    g.fillRect(16, 4, 1, 2);
    g.generateTexture('body_forest_spirit', 28, 28);
    g.clear();

    // ── Spark / Искра (body_spark) — огненный шарик ───────
    // Маленький пылающий шарик
    g.fillStyle(0xcc3300, 1);
    g.fillRect(6, 6, 16, 16);
    g.fillStyle(0xff6600, 1);
    g.fillRect(8, 8, 12, 12);
    g.fillStyle(0xffaa00, 1);
    g.fillRect(10, 10, 8, 8);
    g.fillStyle(0xffff88, 1);
    g.fillRect(12, 12, 4, 4);
    // Языки пламени
    g.fillStyle(0xff4400, 1);
    g.fillRect(10, 3, 3, 5);
    g.fillRect(15, 4, 3, 4);
    g.fillRect(7, 4, 2, 4);
    g.generateTexture('body_spark', 28, 28);
    g.clear();

    // ── Asher / Пепельник (body_asher) — пепельная фигура ─
    g.fillStyle(0x333333, 1);
    g.fillRect(9, 19, 4, 8);
    g.fillRect(15, 19, 4, 8);
    // Тело из пепла
    g.fillStyle(0x555555, 1);
    g.fillRect(5, 8, 18, 13);
    // Угольные прожилки (оранжевые)
    g.fillStyle(0xff4400, 1);
    g.fillRect(8, 11, 2, 2);
    g.fillRect(14, 13, 3, 2);
    g.fillRect(10, 16, 2, 2);
    g.fillRect(17, 10, 2, 3);
    // Голова
    g.fillStyle(0x444444, 1);
    g.fillRect(8, 1, 12, 9);
    // Глаза (красные угли)
    g.fillStyle(0xff2200, 1);
    g.fillRect(10, 4, 3, 3);
    g.fillRect(16, 4, 3, 3);
    g.generateTexture('body_asher', 28, 28);
    g.clear();

    // ── Splasher / Брызгун (body_splasher) — водяной пузырь
    g.fillStyle(0x2255aa, 1);
    g.fillRect(7, 7, 14, 14);
    g.fillStyle(0x3377cc, 1);
    g.fillRect(8, 6, 12, 16);
    g.fillStyle(0x44aaff, 1);
    g.fillRect(9, 7, 10, 14);
    // Блик
    g.fillStyle(0xaaddff, 1);
    g.fillRect(10, 8, 4, 4);
    // Глаза
    g.fillStyle(0xffffff, 1);
    g.fillRect(10, 12, 3, 3);
    g.fillRect(15, 12, 3, 3);
    g.fillStyle(0x000066, 1);
    g.fillRect(11, 13, 1, 2);
    g.fillRect(16, 13, 1, 2);
    // Капли воды
    g.fillStyle(0x66bbff, 1);
    g.fillRect(3, 9, 3, 4);
    g.fillRect(22, 11, 3, 4);
    g.generateTexture('body_splasher', 28, 28);
    g.clear();

    // ── Fogger / Туманник (body_fogger) — туманная фигура ─
    g.fillStyle(0x6699aa, 0.7);
    g.fillRect(5, 5, 18, 20);
    g.fillStyle(0x88bbcc, 1);
    g.fillRect(7, 7, 14, 16);
    g.fillStyle(0xaaccdd, 0.8);
    g.fillRect(9, 9, 10, 12);
    // Туманные края
    g.fillStyle(0x77aacc, 1);
    g.fillRect(3, 8, 5, 10);
    g.fillRect(20, 8, 5, 10);
    g.fillRect(8, 2, 12, 5);
    // Глаза (холодные голубые)
    g.fillStyle(0xccffff, 1);
    g.fillRect(10, 10, 3, 3);
    g.fillRect(15, 10, 3, 3);
    g.fillStyle(0x00ccee, 1);
    g.fillRect(11, 11, 1, 2);
    g.fillRect(16, 11, 1, 2);
    g.generateTexture('body_fogger', 28, 28);
    g.clear();

    // ── Pebble / Каменыш (body_pebble) — каменный голем ──
    // Ноги-блоки
    g.fillStyle(0x554433, 1);
    g.fillRect(7, 20, 6, 7);
    g.fillRect(16, 20, 6, 7);
    // Массивное каменное тело
    g.fillStyle(0x776655, 1);
    g.fillRect(4, 8, 20, 14);
    // Трещины на теле
    g.fillStyle(0x443322, 1);
    g.fillRect(10, 10, 1, 8);
    g.fillRect(15, 12, 1, 6);
    g.fillRect(6, 14, 5, 1);
    g.fillRect(18, 11, 5, 1);
    // Руки-глыбы
    g.fillStyle(0x665544, 1);
    g.fillRect(0, 9, 5, 9);
    g.fillRect(23, 9, 5, 9);
    // Голова-блок
    g.fillStyle(0x887766, 1);
    g.fillRect(7, 1, 14, 9);
    // Глаза (тусклые)
    g.fillStyle(0x443322, 1);
    g.fillRect(10, 4, 3, 3);
    g.fillRect(16, 4, 3, 3);
    g.generateTexture('body_pebble', 28, 28);
    g.clear();

    // ── Mudder / Грязевик (body_mudder) — грязь и корни ──
    // Ноги из грязи
    g.fillStyle(0x332211, 1);
    g.fillRect(8, 20, 5, 7);
    g.fillRect(16, 20, 5, 7);
    // Тело (тёмно-коричневое)
    g.fillStyle(0x554433, 1);
    g.fillRect(5, 8, 18, 13);
    // Корни/полосы
    g.fillStyle(0x221100, 1);
    g.fillRect(5, 12, 18, 2);
    g.fillRect(7, 16, 3, 4);
    g.fillRect(18, 15, 4, 4);
    // Зелёные побеги (живые)
    g.fillStyle(0x336622, 1);
    g.fillRect(3, 7, 3, 5);
    g.fillRect(22, 8, 3, 4);
    g.fillRect(12, 5, 4, 4);
    // Голова
    g.fillStyle(0x665544, 1);
    g.fillRect(8, 1, 12, 9);
    // Глаза (жёлто-зелёные)
    g.fillStyle(0x88cc22, 1);
    g.fillRect(10, 4, 3, 3);
    g.fillRect(16, 4, 3, 3);
    g.generateTexture('body_mudder', 28, 28);
    g.clear();

    // ── Gusty / Вихрик (body_gusty) — маленький вихрь ────
    // Вихрь (спиральные слои)
    g.fillStyle(0x88bb88, 0.5);
    g.fillRect(5, 5, 18, 18);
    g.fillStyle(0xaaddaa, 0.8);
    g.fillRect(7, 7, 14, 14);
    g.fillStyle(0xcceecc, 1);
    g.fillRect(9, 9, 10, 10);
    g.fillStyle(0xeeffee, 1);
    g.fillRect(11, 11, 6, 6);
    // Спиральный эффект
    g.fillStyle(0x77aa77, 1);
    g.fillRect(5, 12, 4, 2);
    g.fillRect(19, 12, 4, 2);
    g.fillRect(12, 4, 2, 4);
    g.fillRect(12, 20, 2, 4);
    // Глаза (маленькие)
    g.fillStyle(0x224422, 1);
    g.fillRect(11, 12, 2, 2);
    g.fillRect(15, 12, 2, 2);
    g.generateTexture('body_gusty', 28, 28);
    g.clear();

    // ── Whistler / Свистун (body_whistler) — птицеэлементаль
    // Ноги (когтистые)
    g.fillStyle(0x88aa88, 1);
    g.fillRect(9, 21, 4, 6);
    g.fillRect(16, 21, 4, 6);
    g.fillRect(8, 25, 3, 2);
    g.fillRect(16, 25, 4, 2);
    // Тело (обтекаемое)
    g.fillStyle(0x99ccaa, 1);
    g.fillRect(6, 9, 16, 13);
    // Крылья
    g.fillStyle(0xaaddcc, 1);
    g.fillRect(0, 8, 7, 10);
    g.fillRect(21, 8, 7, 10);
    // Рисунок крыла
    g.fillStyle(0x77aa88, 1);
    g.fillRect(1, 10, 5, 2);
    g.fillRect(1, 14, 5, 2);
    g.fillRect(22, 10, 5, 2);
    g.fillRect(22, 14, 5, 2);
    // Голова (птичья)
    g.fillStyle(0x88bb99, 1);
    g.fillRect(9, 1, 10, 10);
    // Клюв
    g.fillStyle(0xddcc55, 1);
    g.fillRect(8, 6, 4, 3);
    // Глаза
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 3, 3, 3);
    g.fillRect(16, 3, 2, 3);
    g.generateTexture('body_whistler', 28, 28);
    g.clear();

    // ── Bandit Archer (body_bandit_archer) ─────────────────
    // Лесной лучник в тёмно-зелёном плаще, длинный лук
    g.fillStyle(0x334422, 1);
    g.fillRect(9, 20, 4, 7);
    g.fillRect(15, 20, 4, 7);
    g.fillStyle(0x556633, 1);
    g.fillRect(5, 8, 18, 14);
    g.fillStyle(0x445522, 1);
    g.fillRect(9, 10, 10, 8);
    // Длинный лук (слева, высокий)
    g.fillStyle(0x773311, 1);
    g.fillRect(2, 4, 3, 20);
    g.fillStyle(0xcc9955, 1);
    g.fillRect(3, 5, 1, 18);
    // Стрела
    g.fillStyle(0xccccaa, 1);
    g.fillRect(4, 11, 6, 1);
    g.fillStyle(skin, 1);
    g.fillRect(9, 2, 10, 7);
    g.fillStyle(0x445522, 1);
    g.fillRect(8, 0, 12, 5);
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 4, 2, 2);
    g.fillRect(15, 4, 2, 2);
    g.generateTexture('body_bandit_archer', 28, 28);
    g.clear();

    // ── Bandit Crossbowman (body_bandit_crossbow) ──────────
    // Наёмник в кожаном доспехе, арбалет перед собой
    g.fillStyle(0x443322, 1);
    g.fillRect(9, 20, 4, 7);
    g.fillRect(15, 20, 4, 7);
    g.fillStyle(0x664433, 1);
    g.fillRect(5, 8, 18, 14);
    // Нагрудник
    g.fillStyle(0x553322, 1);
    g.fillRect(8, 10, 12, 9);
    // Арбалет (горизонтальный, перед телом)
    g.fillStyle(0x554433, 1);
    g.fillRect(4, 16, 20, 4);
    g.fillStyle(0x885544, 1);
    g.fillRect(4, 17, 20, 2);
    g.fillStyle(0x442211, 1);
    g.fillRect(12, 14, 4, 8);
    // Болт
    g.fillStyle(0xccbbaa, 1);
    g.fillRect(4, 17, 8, 1);
    g.fillStyle(skin, 1);
    g.fillRect(9, 2, 10, 7);
    g.fillStyle(0x553322, 1);
    g.fillRect(8, 1, 12, 4);
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 4, 2, 2);
    g.fillRect(15, 4, 2, 2);
    g.generateTexture('body_bandit_crossbow', 28, 28);
    g.clear();

    // ── Bandit Spearman (body_bandit_spear) ────────────────
    // Воин в синевато-серых доспехах, копьё
    g.fillStyle(0x334455, 1);
    g.fillRect(9, 20, 4, 7);
    g.fillRect(15, 20, 4, 7);
    g.fillStyle(0x445566, 1);
    g.fillRect(5, 8, 18, 14);
    g.fillStyle(0x556677, 1);
    g.fillRect(8, 10, 12, 9);
    // Копьё (вертикальное, справа)
    g.fillStyle(0x885533, 1);
    g.fillRect(23, 0, 3, 28);
    // Наконечник копья
    g.fillStyle(0xcccccc, 1);
    g.fillRect(22, 0, 5, 4);
    g.fillStyle(skin, 1);
    g.fillRect(9, 2, 10, 7);
    g.fillStyle(0x445566, 1);
    g.fillRect(8, 1, 12, 4);
    g.fillStyle(0x111111, 1);
    g.fillRect(11, 4, 2, 2);
    g.fillRect(15, 4, 2, 2);
    g.generateTexture('body_bandit_spear', 28, 28);
    g.clear();

    // ── Bandit Brute (body_bandit_brute) ───────────────────
    // Громила в тёмно-красных доспехах, молот
    g.fillStyle(0x442222, 1);
    g.fillRect(8, 20, 5, 7);
    g.fillRect(15, 20, 5, 7);
    g.fillStyle(0x664444, 1);
    g.fillRect(4, 8, 20, 14);
    g.fillStyle(0x775555, 1);
    g.fillRect(7, 10, 14, 9);
    // Молот (крупный, правая сторона)
    g.fillStyle(0x553322, 1);
    g.fillRect(20, 8, 4, 16);
    g.fillStyle(0x888888, 1);
    g.fillRect(17, 6, 10, 7);
    g.fillStyle(0xaaaaaa, 1);
    g.fillRect(18, 7, 8, 5);
    // Шипы на плечах
    g.fillStyle(0x999999, 1);
    g.fillRect(4, 8, 3, 3);
    g.fillRect(21, 8, 3, 3);
    g.fillStyle(skin, 1);
    g.fillRect(8, 1, 12, 8);
    // Шлем
    g.fillStyle(0x553333, 1);
    g.fillRect(7, 0, 14, 5);
    g.fillStyle(0x111111, 1);
    g.fillRect(10, 4, 3, 2);
    g.fillRect(15, 4, 3, 2);
    g.generateTexture('body_bandit_brute', 28, 28);
    g.clear();

    // Old warrior/mage directional spritesheets removed — replaced by swordsman/archer/wizard in MOB_SPRITE_SETS

    // ── Spell spritesheets ──────────────────────────────────────────────────
    // FIRE
    this.load.spritesheet('spell_fireball',       'assets/spells/fire/fireball_sheet.webp',        { frameWidth: 341, frameHeight: 341 }); // 3×3=9
    this.load.spritesheet('spell_fire_wall',      'assets/spells/fire/fire_wall_spritesheet.webp', { frameWidth: 256, frameHeight: 256 }); // 5×5=25
    this.load.spritesheet('spell_spark',          'assets/spells/fire/explosion_sheet.webp',       { frameWidth: 256, frameHeight: 256 }); // 3×3=9
    this.load.spritesheet('spell_firebolt',       'assets/spells/fire/firebolt_sheet.webp',        { frameWidth: 256, frameHeight: 180 }); // 4×3=12
    this.load.spritesheet('spell_fire_tsunami',   'assets/spells/fire/tsunami_sheet.webp',         { frameWidth: 192, frameHeight: 96 });  // 4×2=8 (768/4, 768/8? no 768/2=384 per row... wait 4col 2row = 192×384? no)
    this.load.spritesheet('spell_burning_ground', 'assets/spells/fire/burning_ground_sheet.webp',  { frameWidth: 204, frameHeight: 136 }); // 3×3=9 (612/3=204)

    // WATER
    this.load.spritesheet('spell_ice_drop',         'assets/spells/water/ice_drop_sprite.webp',        { frameWidth: 192, frameHeight: 384 }); // 4×2=8 (768/4=192, 768/2=384)
    this.load.spritesheet('spell_frost_arrow',      'assets/spells/water/frost_arrow_sprite.webp',     { frameWidth: 768, frameHeight: 153 }); // 1×5=5 (768/1, 768/5=153)
    this.load.spritesheet('spell_frost_explosion',  'assets/spells/water/frost_explosion_sprite.webp', { frameWidth: 256, frameHeight: 256 }); // 3×3=9
    this.load.spritesheet('spell_ice_explosion',    'assets/spells/water/ice_explosion_sheet.webp',    { frameWidth: 256, frameHeight: 256 }); // 3×3=9
    this.load.spritesheet('spell_blizzard',         'assets/spells/water/blizzard_sprite.webp',        { frameWidth: 256, frameHeight: 256 }); // 5×5=25
    this.load.spritesheet('spell_absolute_zero',    'assets/spells/water/absolute_zero.webp',          { frameWidth: 256, frameHeight: 256 }); // 3×3=9

    // EARTH
    this.load.image('spell_pebble',              'assets/spells/earth/pebble_sprite.webp');       // static
    this.load.spritesheet('spell_spike',         'assets/spells/earth/spike_sprite.webp',          { frameWidth: 256, frameHeight: 256 }); // 3×3=9
    this.load.spritesheet('spell_earth_wall',    'assets/spells/earth/wall_sprite.webp',           { frameWidth: 256, frameHeight: 256 }); // 5×5=25
    this.load.image('spell_grotto',              'assets/spells/earth/grotto_shield.webp');        // static
    this.load.spritesheet('spell_meteor',        'assets/spells/earth/meteor_sprite.webp',         { frameWidth: 256, frameHeight: 256 }); // 5×5=25

    // WIND
    this.load.spritesheet('spell_gust',          'assets/spells/wind/gust_spritesheet.webp',       { frameWidth: 256, frameHeight: 256 }); // 3×3=9
    this.load.spritesheet('spell_wind_blade',    'assets/spells/wind/wind_blade_spritesheet.webp', { frameWidth: 256, frameHeight: 256 }); // 3×3=9
    this.load.spritesheet('spell_wind_wall',     'assets/spells/wind/wind_wall_spritesheet.webp',  { frameWidth: 153, frameHeight: 384 }); // 5×2=10 (768/5=153, 768/2=384)
    this.load.spritesheet('spell_lightning',      'assets/spells/wind/lightning_spritesheet.webp',  { frameWidth: 153, frameHeight: 384 }); // 5×2=10
    this.load.spritesheet('spell_ball_lightning', 'assets/spells/wind/ball_spritesheet.webp',       { frameWidth: 256, frameHeight: 256 }); // 3×3=9

    // NATURE
    this.load.image('spell_bark',                'assets/spells/nature/bark_shield.webp');         // static
    this.load.spritesheet('spell_leaves',        'assets/spells/nature/leaves_sheet.webp',         { frameWidth: 122, frameHeight: 136 }); // 5×3=15 (612/5=122, 408/3=136)
    this.load.spritesheet('spell_ent',           'assets/spells/nature/ent_sheet.webp',            { frameWidth: 256, frameHeight: 256 }); // 3×3=9
    this.load.spritesheet('spell_wolf_idle',     'assets/spells/nature/wolf_idle_sheet.webp',      { frameWidth: 102, frameHeight: 102 }); // 5×5=25 (512/5=102)
    this.load.spritesheet('spell_wolf_attack',   'assets/spells/nature/wolf-attack-v2.webp',       { frameWidth: 102, frameHeight: 102 }); // 5×5=25

    // PLANT NODES — спрайты ресурсных нод (ключ === node-sprite key из RESOURCE_NODES)
    this.load.image('node_fiber_bush',   'assets/deco/plants/Bush_pink_flowers1.png');
    this.load.image('node_fern_patch',   'assets/deco/plants/Fern1_1.png');
    this.load.image('node_cactus_plant', 'assets/deco/plants/Cactus2_1.png');
    this.load.image('node_oak_tree',     'assets/deco/plants/Autumn_tree1.png');
    this.load.image('node_broken_tree',  'assets/deco/plants/Broken_tree7.png');
    this.load.image('node_burned_tree',  'assets/deco/plants/Burned_tree1.png');
    // Камни-жилы (mining)
    this.load.image('node_copper_vein',   'assets/deco/Rocks/Rock1_1.webp');
    this.load.image('node_copper_vein_2', 'assets/deco/Rocks/Rock2_1.webp');
    this.load.image('node_copper_vein_3', 'assets/deco/Rocks/Rock6_1.webp');
  }

  create() {
    // Old warrior/mage animations removed — now handled via FRONT_ONLY_MOBS loop (swordsman/archer/wizard)

    // ── Goblin animations ─────────────────────────────────────────────────────
    const mkMobAnim = (key: string, sheet: string, numFrames: number, fps: number, repeat: number) => {
      if (!this.anims.exists(key) && this.textures.exists(sheet)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(sheet, { start: 0, end: numFrames - 1 }),
          frameRate: fps,
          repeat,
        });
      }
    };
    // All MOB_SPRITE_SETS animations
    // hasDirs=true  → 4-directional sheets (bandit, bear, shaman format)
    // hasDirs=false → front-only sheet used for all directions (ranger, orc format)
    const DIR_PREFIXES: Array<[string, string]> = [['down','front'],['up','back'],['left','left'],['right','right']];
    for (const [mobId, set] of Object.entries(MOB_SPRITE_SETS)) {
      const hasDirs = 'back_idle' in set.anims;
      const dieN = set.anims['dying']?.frames ?? 10;
      mkMobAnim(`${mobId}_dying`, `mob_sheet_${mobId}_dying`, dieN, 10, 0);
      for (const [gameDir, prefix] of DIR_PREFIXES) {
        const iKey = hasDirs ? `${prefix}_idle`   : 'front_idle';
        const wKey = hasDirs ? `${prefix}_walk`   : 'front_walk';
        const aKey = hasDirs ? `${prefix}_attack` : 'front_attack';
        const idleN = set.anims[iKey]?.frames ?? 16;
        const walkN = set.anims[wKey]?.frames ?? 20;
        const atkN  = set.anims[aKey]?.frames ?? 10;
        // If left_* uses same file as right_*, register the animation using the right_ texture key.
        // This makes the textureKey comparison in Creature.ts flip detection work correctly.
        let iTexKey = `mob_sheet_${mobId}_${iKey}`;
        let wTexKey = `mob_sheet_${mobId}_${wKey}`;
        let aTexKey = `mob_sheet_${mobId}_${aKey}`;
        if (hasDirs && gameDir === 'left') {
          if (set.anims['left_idle']?.file   === set.anims['right_idle']?.file)   iTexKey = `mob_sheet_${mobId}_right_idle`;
          if (set.anims['left_walk']?.file   === set.anims['right_walk']?.file)   wTexKey = `mob_sheet_${mobId}_right_walk`;
          if (set.anims['left_attack']?.file === set.anims['right_attack']?.file) aTexKey = `mob_sheet_${mobId}_right_attack`;
        }
        mkMobAnim(`${mobId}_idle_${gameDir}`, iTexKey, idleN, 8,  -1);
        mkMobAnim(`${mobId}_walk_${gameDir}`, wTexKey, walkN, 12, -1);
        mkMobAnim(`${mobId}_atk_${gameDir}`,  aTexKey, atkN,  14,  0);
      }
    }

    // ── Animal animations (rows: down=0, up=1, left=2, right=3) ────────────
    const DIRS: Array<[string, number]> = [['down', 0], ['up', 1], ['left', 2], ['right', 3]];
    for (const [creatureId, animalSet] of Object.entries(ANIMAL_SPRITE_SETS)) {
      for (const [animName, sheet] of Object.entries(animalSet.sheets)) {
        const sheetKey = `animal_${creatureId}_${animName}`;
        if (!this.textures.exists(sheetKey)) continue;
        const cols = sheet.cols;
        // Map anim names: walk→walk, run→walk (fallback), attack→atk, death→dying
        const gameAnim = animName === 'attack' ? 'atk' : animName === 'death' ? 'dying' : animName === 'run' ? 'walk' : animName;
        for (const [dirName, rowIdx] of DIRS) {
          if (gameAnim === 'dying' && dirName !== 'down') continue; // dying only needs one direction
          const animKey = gameAnim === 'dying'
            ? `${creatureId}_dying`
            : `${creatureId}_${gameAnim}_${dirName}`;
          if (this.anims.exists(animKey)) continue;
          const start = rowIdx * cols;
          const end = start + cols - 1;
          const fps = gameAnim === 'idle' ? 6 : gameAnim === 'dying' ? 8 : 10;
          const repeat = gameAnim === 'dying' || gameAnim === 'atk' ? 0 : -1;
          this.anims.create({
            key: animKey,
            frames: this.anims.generateFrameNumbers(sheetKey, { start, end }),
            frameRate: fps,
            repeat,
          });
        }
      }
    }

    // ── Cart animations (caravan) ────────────────────────────────────────────
    for (const dir of ['down', 'right', 'up']) {
      const key = `cart_move_${dir}`;
      if (this.anims.exists(key) || !this.textures.exists(key)) continue;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 15 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    // ── Spell animations ─────────────────────────────────────────────────────
    const mkSpell = (key: string, sheet: string, end: number, fps: number, loop: boolean) => {
      if (!this.anims.exists(key)) {
        this.anims.create({ key, frames: this.anims.generateFrameNumbers(sheet, { start: 0, end }), frameRate: fps, repeat: loop ? -1 : 0 });
      }
    };

    // FIRE
    mkSpell('spell_spark',          'spell_spark',          8,  12, false);
    mkSpell('spell_firebolt',       'spell_firebolt',       11, 14, true);
    mkSpell('spell_fireball',       'spell_fireball',       8,  12, false);
    mkSpell('spell_fire_wall',      'spell_fire_wall',      24, 12, true);
    mkSpell('spell_fire_tsunami',   'spell_fire_tsunami',   7,  10, true);
    mkSpell('spell_burning_ground', 'spell_burning_ground', 8,  10, true);

    // WATER
    mkSpell('spell_ice_drop',        'spell_ice_drop',        7,  10, false);
    mkSpell('spell_frost_arrow',     'spell_frost_arrow',     4,  10, true);
    mkSpell('spell_frost_explosion', 'spell_frost_explosion', 8,  12, false);
    mkSpell('spell_ice_explosion',   'spell_ice_explosion',   8,  12, false);
    mkSpell('spell_blizzard',        'spell_blizzard',        24, 10, true);
    mkSpell('spell_absolute_zero',   'spell_absolute_zero',   8,  12, false);

    // EARTH
    mkSpell('spell_spike',      'spell_spike',      8,  12, false);
    mkSpell('spell_earth_wall', 'spell_earth_wall', 24, 10, true);
    mkSpell('spell_meteor',     'spell_meteor',     24, 14, false);

    // WIND
    mkSpell('spell_gust',          'spell_gust',          8,  12, false);
    mkSpell('spell_wind_blade',    'spell_wind_blade',    8,  12, false);
    mkSpell('spell_wind_wall',     'spell_wind_wall',     9,  10, true);
    mkSpell('spell_lightning',     'spell_lightning',      9,  14, false);
    mkSpell('spell_ball_lightning','spell_ball_lightning', 8,  12, true);

    // NATURE
    mkSpell('spell_leaves',       'spell_leaves',       14, 10, true);
    mkSpell('spell_ent',          'spell_ent',          8,  8,  true);
    mkSpell('spell_wolf_idle',    'spell_wolf_idle',    24, 8,  true);
    mkSpell('spell_wolf_attack',  'spell_wolf_attack',  24, 14, false);

    // Pre-extract every <symbol> from public/*.svg sheets into Phaser textures
    // so the canvas-rendered skill bar can show real icons.
    loadAllSpriteSheets(this)
      .catch((err) => {
        // Сбой загрузки спрайтшита не должен вешать игру на чёрном BootScene —
        // у контента есть процедурные плейсхолдеры, просто идём дальше.
        console.error('[BootScene] sprite sheet load failed, continuing:', err);
      })
      .finally(() => {
        this.scene.start('TitleScene');
      });
  }

  /**
   * Рисует процедурные плейсхолдеры для атласа декораций.
   * Сетка DECO_COLS × DECO_ROWS ячеек по DECO_CELL px.
   * Регистрирует результат как spritesheet с ключом 'decorations'.
   */
  private generateDecorationAtlas() {
    const canvas = document.createElement('canvas');
    canvas.width = DECO_COLS * DECO_CELL;
    canvas.height = DECO_ROWS * DECO_CELL;
    const ctx = canvas.getContext('2d')!;

    const cellAt = (col: number, row: number) => ({
      ox: col * DECO_CELL,
      oy: row * DECO_CELL,
    });
    const rect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };
    const circ = (cx: number, cy: number, r: number, color: string) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // ── Row 0: деревья ───────────────────────────────────
    // TREE — дуб
    let { ox, oy } = cellAt(0, 0);
    rect(ox + 22, oy + 34, 4, 12, '#4a2e18');
    circ(ox + 24, oy + 22, 14, '#2d5a1e');
    circ(ox + 22, oy + 18, 10, '#3a7a2a');
    circ(ox + 26, oy + 20, 7, '#55aa44');
    // TREE_PINE — ель
    ({ ox, oy } = cellAt(1, 0));
    rect(ox + 22, oy + 38, 4, 10, '#3a2a14');
    ctx.fillStyle = '#1a4a22';
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 8); ctx.lineTo(ox + 8, oy + 22); ctx.lineTo(ox + 40, oy + 22); ctx.fill();
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 18); ctx.lineTo(ox + 6, oy + 32); ctx.lineTo(ox + 42, oy + 32); ctx.fill();
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 28); ctx.lineTo(ox + 4, oy + 42); ctx.lineTo(ox + 44, oy + 42); ctx.fill();
    // TREE_DEAD — сухое дерево
    ({ ox, oy } = cellAt(2, 0));
    rect(ox + 22, oy + 14, 4, 34, '#5a4020');
    rect(ox + 14, oy + 22, 10, 2, '#5a4020');
    rect(ox + 24, oy + 28, 10, 2, '#5a4020');
    rect(ox + 18, oy + 16, 2, 6, '#5a4020');
    rect(ox + 28, oy + 18, 2, 6, '#5a4020');
    // TREE_SNOW — ель в снегу
    ({ ox, oy } = cellAt(3, 0));
    rect(ox + 22, oy + 38, 4, 10, '#3a2a14');
    ctx.fillStyle = '#2a5a3a';
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 8); ctx.lineTo(ox + 8, oy + 24); ctx.lineTo(ox + 40, oy + 24); ctx.fill();
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 22); ctx.lineTo(ox + 6, oy + 38); ctx.lineTo(ox + 42, oy + 38); ctx.fill();
    ctx.fillStyle = '#eeeeff';
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 8); ctx.lineTo(ox + 14, oy + 18); ctx.lineTo(ox + 34, oy + 18); ctx.fill();
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 22); ctx.lineTo(ox + 12, oy + 32); ctx.lineTo(ox + 36, oy + 32); ctx.fill();
    // PALM — пальма
    ({ ox, oy } = cellAt(4, 0));
    rect(ox + 22, oy + 20, 4, 28, '#6a4a2a');
    ctx.fillStyle = '#3a8a3a';
    for (const a of [-1.2, -0.6, 0, 0.6, 1.2]) {
      ctx.save(); ctx.translate(ox + 24, oy + 20); ctx.rotate(a);
      ctx.fillRect(-2, -14, 4, 14); ctx.restore();
    }
    // BUSH_BIG — большой куст
    ({ ox, oy } = cellAt(5, 0));
    circ(ox + 18, oy + 36, 10, '#2d5a1e');
    circ(ox + 30, oy + 34, 10, '#2d5a1e');
    circ(ox + 24, oy + 28, 11, '#3a7a2a');
    circ(ox + 22, oy + 24, 6, '#55aa44');
    // STUMP — пень
    ({ ox, oy } = cellAt(6, 0));
    rect(ox + 14, oy + 34, 20, 12, '#6a4020');
    rect(ox + 16, oy + 32, 16, 4, '#8a5a30');
    rect(ox + 22, oy + 34, 4, 2, '#3a2a10');
    // LOG — бревно
    ({ ox, oy } = cellAt(7, 0));
    rect(ox + 6, oy + 36, 36, 8, '#6a4020');
    rect(ox + 6, oy + 36, 4, 8, '#3a2a10');
    rect(ox + 38, oy + 36, 4, 8, '#3a2a10');
    circ(ox + 8, oy + 40, 2, '#8a5a30');
    circ(ox + 40, oy + 40, 2, '#8a5a30');

    // ── Row 1: камни ─────────────────────────────────────
    ({ ox, oy } = cellAt(0, 1));
    circ(ox + 24, oy + 40, 6, '#666677'); circ(ox + 24, oy + 38, 5, '#888899');
    ({ ox, oy } = cellAt(1, 1));
    circ(ox + 24, oy + 38, 10, '#666677'); circ(ox + 24, oy + 36, 8, '#888899');
    ({ ox, oy } = cellAt(2, 1));
    circ(ox + 24, oy + 34, 14, '#555566'); circ(ox + 24, oy + 32, 11, '#777788');
    ({ ox, oy } = cellAt(3, 1));
    circ(ox + 24, oy + 38, 10, '#555566'); circ(ox + 24, oy + 36, 8, '#3a5a3a');
    circ(ox + 18, oy + 32, 3, '#55aa44'); circ(ox + 30, oy + 34, 2, '#55aa44');
    ({ ox, oy } = cellAt(4, 1));
    circ(ox + 24, oy + 32, 16, '#4a4a55'); circ(ox + 20, oy + 28, 10, '#6a6a77');
    ({ ox, oy } = cellAt(5, 1));
    for (const [dx, dy, r] of [[18,40,3],[28,42,4],[22,36,2],[32,38,3],[14,38,2]]) {
      circ(ox + dx, oy + dy, r, '#888899');
    }
    // CRYSTAL
    ({ ox, oy } = cellAt(6, 1));
    ctx.fillStyle = '#66ccee';
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 14); ctx.lineTo(ox + 14, oy + 30); ctx.lineTo(ox + 24, oy + 44); ctx.lineTo(ox + 34, oy + 30); ctx.fill();
    ctx.fillStyle = '#aaddff';
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 14); ctx.lineTo(ox + 24, oy + 44); ctx.lineTo(ox + 34, oy + 30); ctx.fill();
    // ORE_VEIN — жила руды
    ({ ox, oy } = cellAt(7, 1));
    circ(ox + 24, oy + 36, 12, '#4a4a55');
    circ(ox + 20, oy + 34, 3, '#dd8833');
    circ(ox + 28, oy + 38, 3, '#dd8833');
    circ(ox + 24, oy + 40, 2, '#dd8833');

    // ── Row 2: кусты, цветы, грибы ───────────────────────
    ({ ox, oy } = cellAt(0, 2));
    circ(ox + 24, oy + 40, 6, '#2d5a1e'); circ(ox + 24, oy + 38, 4, '#3a7a2a');
    ({ ox, oy } = cellAt(1, 2));
    circ(ox + 24, oy + 38, 9, '#2d5a1e'); circ(ox + 24, oy + 36, 6, '#3a7a2a'); circ(ox + 22, oy + 34, 3, '#55aa44');
    ({ ox, oy } = cellAt(2, 2));
    rect(ox + 23, oy + 36, 2, 10, '#3a7a2a');
    circ(ox + 24, oy + 34, 3, '#cc3333'); circ(ox + 24, oy + 32, 2, '#ff5544');
    ({ ox, oy } = cellAt(3, 2));
    rect(ox + 23, oy + 36, 2, 10, '#3a7a2a');
    circ(ox + 24, oy + 34, 3, '#3366cc'); circ(ox + 24, oy + 32, 2, '#5588ee');
    // MUSHROOM
    ({ ox, oy } = cellAt(4, 2));
    rect(ox + 22, oy + 38, 4, 8, '#eeddaa');
    ctx.fillStyle = '#cc3333'; ctx.beginPath(); ctx.arc(ox + 24, oy + 36, 8, Math.PI, 0); ctx.fill();
    circ(ox + 20, oy + 32, 1.5, '#ffffff'); circ(ox + 26, oy + 34, 1.5, '#ffffff');
    // REEDS — тростник
    ({ ox, oy } = cellAt(5, 2));
    for (const dx of [14, 20, 26, 32]) {
      rect(ox + dx, oy + 24, 2, 22, '#5a7a2a');
      circ(ox + dx + 1, oy + 22, 2, '#8aa84a');
    }
    // FERN — папоротник
    ({ ox, oy } = cellAt(6, 2));
    ctx.fillStyle = '#3a7a2a';
    for (const a of [-1.0, -0.3, 0.3, 1.0]) {
      ctx.save(); ctx.translate(ox + 24, oy + 44); ctx.rotate(a);
      ctx.fillRect(-1.5, -18, 3, 18); ctx.restore();
    }
    rect(ox + 23, oy + 28, 2, 16, '#2a5a1e');
    // GRASS_TUFT
    ({ ox, oy } = cellAt(7, 2));
    ctx.fillStyle = '#5a8a2a';
    for (const [dx, h] of [[18, 12], [22, 16], [26, 14], [30, 10], [14, 8]]) {
      ctx.fillRect(ox + dx, oy + 48 - h, 2, h);
    }

    // ── Row 3: постройки ─────────────────────────────────
    // HOUSE_SM
    ({ ox, oy } = cellAt(0, 3));
    rect(ox + 10, oy + 24, 28, 22, '#8a6a3a');
    rect(ox + 10, oy + 24, 28, 3, '#6a4a20');
    ctx.fillStyle = '#7a2a1a';
    ctx.beginPath(); ctx.moveTo(ox + 6, oy + 24); ctx.lineTo(ox + 24, oy + 10); ctx.lineTo(ox + 42, oy + 24); ctx.fill();
    rect(ox + 21, oy + 32, 6, 14, '#3a2010');
    rect(ox + 14, oy + 30, 5, 5, '#aaddee');
    rect(ox + 29, oy + 30, 5, 5, '#aaddee');
    // HOUSE_MD
    ({ ox, oy } = cellAt(1, 3));
    rect(ox + 6, oy + 22, 36, 24, '#9a7a4a');
    rect(ox + 6, oy + 22, 36, 3, '#6a4a20');
    ctx.fillStyle = '#6a2018';
    ctx.beginPath(); ctx.moveTo(ox + 2, oy + 22); ctx.lineTo(ox + 24, oy + 6); ctx.lineTo(ox + 46, oy + 22); ctx.fill();
    rect(ox + 20, oy + 32, 8, 14, '#3a2010');
    rect(ox + 10, oy + 28, 6, 6, '#aaddee');
    rect(ox + 32, oy + 28, 6, 6, '#aaddee');
    rect(ox + 22, oy + 16, 4, 4, '#aaddee');
    // HOUSE_LG
    ({ ox, oy } = cellAt(2, 3));
    rect(ox + 4, oy + 20, 40, 26, '#9a7a4a');
    rect(ox + 4, oy + 20, 40, 3, '#6a4a20');
    ctx.fillStyle = '#5a1a10';
    ctx.beginPath(); ctx.moveTo(ox + 0, oy + 20); ctx.lineTo(ox + 24, oy + 4); ctx.lineTo(ox + 48, oy + 20); ctx.fill();
    rect(ox + 20, oy + 30, 8, 16, '#3a2010');
    rect(ox + 8, oy + 26, 6, 6, '#aaddee');
    rect(ox + 34, oy + 26, 6, 6, '#aaddee');
    rect(ox + 10, oy + 36, 4, 4, '#aaddee');
    rect(ox + 34, oy + 36, 4, 4, '#aaddee');
    // HUT — хижина
    ({ ox, oy } = cellAt(3, 3));
    rect(ox + 12, oy + 28, 24, 18, '#8a6a4a');
    ctx.fillStyle = '#6a5a2a';
    ctx.beginPath(); ctx.moveTo(ox + 8, oy + 28); ctx.lineTo(ox + 24, oy + 14); ctx.lineTo(ox + 40, oy + 28); ctx.fill();
    rect(ox + 22, oy + 34, 4, 12, '#3a2010');
    // TOWER
    ({ ox, oy } = cellAt(4, 3));
    rect(ox + 16, oy + 14, 16, 32, '#888899');
    rect(ox + 16, oy + 14, 16, 3, '#555566');
    ctx.fillStyle = '#5a1a10';
    ctx.beginPath(); ctx.moveTo(ox + 14, oy + 14); ctx.lineTo(ox + 24, oy + 4); ctx.lineTo(ox + 34, oy + 14); ctx.fill();
    rect(ox + 22, oy + 36, 4, 10, '#3a2010');
    rect(ox + 20, oy + 22, 4, 6, '#223344');
    // SHACK — лачуга
    ({ ox, oy } = cellAt(5, 3));
    rect(ox + 10, oy + 26, 28, 20, '#7a5a3a');
    ctx.fillStyle = '#5a4020';
    ctx.beginPath(); ctx.moveTo(ox + 8, oy + 26); ctx.lineTo(ox + 20, oy + 16); ctx.lineTo(ox + 40, oy + 26); ctx.fill();
    rect(ox + 22, oy + 34, 5, 12, '#2a1808');
    rect(ox + 20, oy + 36, 2, 2, '#aaddee');
    // RUIN — руины
    ({ ox, oy } = cellAt(6, 3));
    rect(ox + 10, oy + 30, 8, 16, '#666677');
    rect(ox + 20, oy + 34, 10, 12, '#666677');
    rect(ox + 32, oy + 28, 6, 18, '#666677');
    rect(ox + 14, oy + 26, 2, 4, '#555566');
    rect(ox + 34, oy + 24, 2, 4, '#555566');
    // BARN — амбар
    ({ ox, oy } = cellAt(7, 3));
    rect(ox + 6, oy + 22, 36, 24, '#9a4a2a');
    ctx.fillStyle = '#5a2010';
    ctx.beginPath(); ctx.moveTo(ox + 4, oy + 22); ctx.lineTo(ox + 24, oy + 10); ctx.lineTo(ox + 44, oy + 22); ctx.fill();
    rect(ox + 20, oy + 30, 8, 16, '#3a2010');
    rect(ox + 22, oy + 14, 4, 6, '#eeddaa');

    // ── Row 4: объекты ───────────────────────────────────
    // FENCE_H — забор горизонтальный
    ({ ox, oy } = cellAt(0, 4));
    rect(ox + 2, oy + 34, 44, 2, '#6a4020');
    rect(ox + 2, oy + 40, 44, 2, '#6a4020');
    for (const dx of [6, 18, 30, 42]) rect(ox + dx, oy + 28, 2, 18, '#8a5a30');
    // FENCE_V — забор вертикальный
    ({ ox, oy } = cellAt(1, 4));
    rect(ox + 22, oy + 4, 2, 44, '#6a4020');
    rect(ox + 24, oy + 4, 2, 44, '#6a4020');
    for (const dy of [8, 20, 32, 44]) rect(ox + 18, oy + dy, 12, 2, '#8a5a30');
    // GATE
    ({ ox, oy } = cellAt(2, 4));
    rect(ox + 4, oy + 24, 4, 22, '#5a3a18');
    rect(ox + 40, oy + 24, 4, 22, '#5a3a18');
    rect(ox + 4, oy + 14, 40, 4, '#6a4020');
    rect(ox + 22, oy + 26, 4, 20, '#8a5a30');
    // WELL
    ({ ox, oy } = cellAt(3, 4));
    rect(ox + 12, oy + 32, 24, 14, '#666677');
    rect(ox + 14, oy + 30, 20, 4, '#888899');
    rect(ox + 18, oy + 34, 12, 8, '#223344');
    rect(ox + 10, oy + 14, 2, 20, '#5a3a18');
    rect(ox + 36, oy + 14, 2, 20, '#5a3a18');
    rect(ox + 10, oy + 14, 28, 2, '#5a3a18');
    ctx.fillStyle = '#6a2018';
    ctx.beginPath(); ctx.moveTo(ox + 8, oy + 14); ctx.lineTo(ox + 24, oy + 6); ctx.lineTo(ox + 40, oy + 14); ctx.fill();
    // SIGNPOST — знак
    ({ ox, oy } = cellAt(4, 4));
    rect(ox + 23, oy + 20, 2, 26, '#5a3a18');
    rect(ox + 14, oy + 18, 20, 10, '#8a5a30');
    rect(ox + 14, oy + 18, 20, 2, '#5a3a18');
    rect(ox + 18, oy + 22, 2, 2, '#3a2010');
    rect(ox + 22, oy + 22, 2, 2, '#3a2010');
    rect(ox + 26, oy + 22, 2, 2, '#3a2010');
    // CART
    ({ ox, oy } = cellAt(5, 4));
    rect(ox + 8, oy + 26, 32, 12, '#6a4020');
    rect(ox + 10, oy + 28, 28, 2, '#8a5a30');
    circ(ox + 14, oy + 40, 5, '#222222'); circ(ox + 14, oy + 40, 2, '#6a4020');
    circ(ox + 34, oy + 40, 5, '#222222'); circ(ox + 34, oy + 40, 2, '#6a4020');
    // BARREL
    ({ ox, oy } = cellAt(6, 4));
    rect(ox + 16, oy + 20, 16, 26, '#6a4020');
    rect(ox + 16, oy + 24, 16, 2, '#3a2010');
    rect(ox + 16, oy + 40, 16, 2, '#3a2010');
    rect(ox + 16, oy + 20, 16, 2, '#8a5a30');
    // CRATE
    ({ ox, oy } = cellAt(7, 4));
    rect(ox + 12, oy + 24, 24, 22, '#8a5a30');
    rect(ox + 12, oy + 24, 24, 2, '#6a4020');
    rect(ox + 12, oy + 24, 2, 22, '#6a4020');
    rect(ox + 34, oy + 24, 2, 22, '#6a4020');
    rect(ox + 12, oy + 34, 24, 2, '#6a4020');

    // ── Row 5: особые ────────────────────────────────────
    // BRIDGE_H
    ({ ox, oy } = cellAt(0, 5));
    rect(ox + 2, oy + 28, 44, 14, '#8a5a30');
    for (const dx of [6, 14, 22, 30, 38]) rect(ox + dx, oy + 28, 2, 14, '#5a3a18');
    rect(ox + 2, oy + 26, 44, 2, '#5a3a18');
    rect(ox + 2, oy + 42, 44, 2, '#5a3a18');
    // BRIDGE_V
    ({ ox, oy } = cellAt(1, 5));
    rect(ox + 14, oy + 2, 20, 44, '#8a5a30');
    for (const dy of [6, 14, 22, 30, 38]) rect(ox + 14, oy + dy, 20, 2, '#5a3a18');
    rect(ox + 12, oy + 2, 2, 44, '#5a3a18');
    rect(ox + 34, oy + 2, 2, 44, '#5a3a18');
    // FIREPIT
    ({ ox, oy } = cellAt(2, 5));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      circ(ox + 24 + Math.cos(a) * 12, oy + 36 + Math.sin(a) * 6, 3, '#555566');
    }
    rect(ox + 16, oy + 30, 16, 6, '#2a1808');
    circ(ox + 24, oy + 30, 4, '#ff6622');
    circ(ox + 24, oy + 28, 3, '#ffaa33');
    circ(ox + 24, oy + 26, 2, '#ffee66');
    // LANTERN — фонарь
    ({ ox, oy } = cellAt(3, 5));
    rect(ox + 23, oy + 22, 2, 24, '#3a2a10');
    rect(ox + 18, oy + 14, 12, 10, '#6a4020');
    rect(ox + 20, oy + 16, 8, 6, '#ffee88');
    rect(ox + 22, oy + 10, 4, 4, '#3a2a10');
    // TENT
    ({ ox, oy } = cellAt(4, 5));
    ctx.fillStyle = '#8a4a2a';
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 12); ctx.lineTo(ox + 8, oy + 46); ctx.lineTo(ox + 40, oy + 46); ctx.fill();
    ctx.fillStyle = '#2a1808';
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 16); ctx.lineTo(ox + 18, oy + 46); ctx.lineTo(ox + 30, oy + 46); ctx.fill();
    // GRAVE — могила
    ({ ox, oy } = cellAt(5, 5));
    rect(ox + 14, oy + 38, 20, 8, '#5a4020');
    rect(ox + 18, oy + 22, 12, 18, '#888899');
    ctx.fillStyle = '#888899';
    ctx.beginPath(); ctx.arc(ox + 24, oy + 22, 6, Math.PI, 0); ctx.fill();
    rect(ox + 23, oy + 28, 2, 6, '#3a3a3a');
    rect(ox + 20, oy + 30, 8, 2, '#3a3a3a');
    // STATUE
    ({ ox, oy } = cellAt(6, 5));
    rect(ox + 16, oy + 40, 16, 6, '#666677');
    rect(ox + 20, oy + 18, 8, 22, '#888899');
    circ(ox + 24, oy + 14, 5, '#888899');
    rect(ox + 16, oy + 22, 4, 12, '#888899');
    rect(ox + 28, oy + 22, 4, 12, '#888899');
    // SHRINE — алтарь
    ({ ox, oy } = cellAt(7, 5));
    rect(ox + 12, oy + 38, 24, 8, '#555566');
    rect(ox + 16, oy + 30, 16, 8, '#888899');
    rect(ox + 20, oy + 14, 8, 16, '#aaaacc');
    ctx.fillStyle = '#66ccee';
    ctx.beginPath(); ctx.moveTo(ox + 24, oy + 10); ctx.lineTo(ox + 20, oy + 18); ctx.lineTo(ox + 24, oy + 26); ctx.lineTo(ox + 28, oy + 18); ctx.fill();

    // Регистрируем как spritesheet (frameWidth × frameHeight).
    this.textures.addSpriteSheet('decorations', canvas as unknown as HTMLImageElement, {
      frameWidth: DECO_CELL,
      frameHeight: DECO_CELL,
    });
  }
}
