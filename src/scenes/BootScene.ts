import Phaser from 'phaser';

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
    this.load.image('tileset_world', 'assets/tileset_world.png');

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

    // ── VFX текстуры частиц ──────────────────────────────
    this.genParticleTextures(gfx);

    gfx.destroy();
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

    // ── Warrior spritesheets (256×256 per frame, 5×5 = 25 frames) ────────────
    const W = 256;
    this.load.spritesheet('warrior_idle_down',   'assets/warrior/warrior_idle_down.png',   { frameWidth: W, frameHeight: W });
    this.load.spritesheet('warrior_idle_right',  'assets/warrior/warrior_idle_right.png',  { frameWidth: W, frameHeight: W });
    this.load.spritesheet('warrior_idle_up',     'assets/warrior/warrior_idle_up.png',     { frameWidth: W, frameHeight: W });
    this.load.spritesheet('warrior_walk_down',   'assets/warrior/warrior_walk_down.png',   { frameWidth: W, frameHeight: W });
    this.load.spritesheet('warrior_walk_right',  'assets/warrior/warrior_walk_right.png',  { frameWidth: W, frameHeight: W });
    this.load.spritesheet('warrior_walk_up',     'assets/warrior/warrior_walk_up.png',     { frameWidth: W, frameHeight: W });
    this.load.spritesheet('warrior_atk_down',    'assets/warrior/warrior_custom_sword_attack_down.png',  { frameWidth: W, frameHeight: W });
    this.load.spritesheet('warrior_atk_right',   'assets/warrior/warrior_custom_sword_attack_right.png', { frameWidth: W, frameHeight: W });
    this.load.spritesheet('warrior_atk_up',      'assets/warrior/warrior_custom_sword_attack_up.png',    { frameWidth: W, frameHeight: W });

    // ── Mage spritesheets (256×256 per frame, 5×5 = 25 frames) ──────────────
    this.load.spritesheet('mage_idle_down',   'assets/mage/Lich-idle_down-v1.png',        { frameWidth: W, frameHeight: W });
    this.load.spritesheet('mage_idle_right',  'assets/mage/Lich-idle_right-v1.png',       { frameWidth: W, frameHeight: W });
    this.load.spritesheet('mage_idle_up',     'assets/mage/Lich-idle_up-v1.png',          { frameWidth: W, frameHeight: W });
    this.load.spritesheet('mage_walk_down',   'assets/mage/Lich-walk_down-v1.png',        { frameWidth: W, frameHeight: W });
    this.load.spritesheet('mage_walk_right',  'assets/mage/Lich-walk_right-v1.png',       { frameWidth: W, frameHeight: W });
    this.load.spritesheet('mage_walk_up',     'assets/mage/Lich-walk_up-v1.png',          { frameWidth: W, frameHeight: W });
    this.load.spritesheet('mage_atk_down',    'assets/mage/Lich-custom_cast_down-v1.png', { frameWidth: W, frameHeight: W });
    this.load.spritesheet('mage_atk_right',   'assets/mage/Lich-custom_cast_right-v1.png',{ frameWidth: W, frameHeight: W });
    this.load.spritesheet('mage_atk_up',      'assets/mage/Lich-custom_cast_up-v1.png',   { frameWidth: W, frameHeight: W });

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
  }

  create() {
    // ── Warrior animations ────────────────────────────────────────────────────
    const makeAnim = (key: string, sheet: string, frameRate: number, repeat: number) => {
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(sheet, { start: 0, end: 24 }),
          frameRate,
          repeat,
        });
      }
    };

    makeAnim('warrior_idle_down',  'warrior_idle_down',  8, -1);
    makeAnim('warrior_idle_right', 'warrior_idle_right', 8, -1);
    makeAnim('warrior_idle_up',    'warrior_idle_up',    8, -1);
    makeAnim('warrior_walk_down',  'warrior_walk_down',  18, -1);
    makeAnim('warrior_walk_right', 'warrior_walk_right', 18, -1);
    makeAnim('warrior_walk_up',    'warrior_walk_up',    18, -1);
    makeAnim('warrior_atk_down',   'warrior_atk_down',   17, 0);
    makeAnim('warrior_atk_right',  'warrior_atk_right',  17, 0);
    makeAnim('warrior_atk_up',     'warrior_atk_up',     17, 0);

    // ── Mage animations ──────────────────────────────────────────────────────
    makeAnim('mage_idle_down',  'mage_idle_down',  8, -1);
    makeAnim('mage_idle_right', 'mage_idle_right', 8, -1);
    makeAnim('mage_idle_up',    'mage_idle_up',    8, -1);
    makeAnim('mage_walk_down',  'mage_walk_down',  18, -1);
    makeAnim('mage_walk_right', 'mage_walk_right', 18, -1);
    makeAnim('mage_walk_up',    'mage_walk_up',    18, -1);
    makeAnim('mage_atk_down',   'mage_atk_down',   17, 0);
    makeAnim('mage_atk_right',  'mage_atk_right',  17, 0);
    makeAnim('mage_atk_up',     'mage_atk_up',     17, 0);

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

    this.scene.start('TitleScene');
  }
}
