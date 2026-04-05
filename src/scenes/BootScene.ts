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

    gfx.destroy();
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
  }

  create() {
    this.scene.start('GameScene');
    this.scene.start('UIScene');
  }
}
