import Phaser from 'phaser';
import { TC } from '../ui/theme';

/**
 * TestMapScene — загрузка и рендер карты, экспортированной из Tiled.
 *
 * Ожидает файлы:
 *   public/assets/maps/test.json           — экспорт из Tiled (JSON)
 *   public/assets/maps/tileset_world.tsx   — описание тайлсета (XML)
 *   public/assets/maps/tileset_world.png   — картинка тайлсета
 *
 * Код сам подклеивает .tsx в JSON и подгружает PNG по пути из .tsx.
 * Поддерживается CSV и uncompressed Base64 (zlib — Phaser не умеет,
 * в Tiled смени формат слоя на CSV).
 */
export class TestMapScene extends Phaser.Scene {
  private static readonly MAP_KEY = 'test-map';
  private static readonly TSX_KEY = 'test-map-tsx';
  private static readonly JSON_KEY = 'test-map-json';
  private static readonly PNG_KEY = 'tileset_world_png';

  constructor() {
    super({ key: 'TestMapScene' });
  }

  preload() {
    this.load.json(TestMapScene.JSON_KEY, 'assets/maps/test.json');
    this.load.text(TestMapScene.TSX_KEY, 'assets/maps/tileset_world.tsx');
    this.load.image(TestMapScene.PNG_KEY, 'assets/maps/tileset_world.png');

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('[TestMapScene] не удалось загрузить:', file.key, file.src);
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0b08');

    const mapData = this.cache.json.get(TestMapScene.JSON_KEY);
    const tsxText = this.cache.text.get(TestMapScene.TSX_KEY);
    if (!mapData) {
      this.showError('Не загрузился test.json');
      return;
    }
    if (!tsxText) {
      this.showError('Не загрузился tileset_world.tsx');
      return;
    }

    // Парсим .tsx (простой XML)
    const xml = new DOMParser().parseFromString(tsxText, 'application/xml');
    const tsEl = xml.querySelector('tileset');
    const imgEl = xml.querySelector('image');
    if (!tsEl || !imgEl) {
      this.showError('В tileset_world.tsx нет элементов <tileset>/<image>');
      return;
    }
    const tsName = tsEl.getAttribute('name') || 'tileset_world';
    const tileWidth = +(tsEl.getAttribute('tilewidth') || 32);
    const tileHeight = +(tsEl.getAttribute('tileheight') || 32);
    const tileCount = +(tsEl.getAttribute('tilecount') || 10);
    const columns = +(tsEl.getAttribute('columns') || 5);
    const imgWidth = +(imgEl.getAttribute('width') || 160);
    const imgHeight = +(imgEl.getAttribute('height') || 64);

    // Встраиваем тайлсет в JSON (если он внешний)
    const firstgid = mapData.tilesets?.[0]?.firstgid ?? 1;
    mapData.tilesets = [{
      firstgid,
      name: tsName,
      tilewidth: tileWidth,
      tileheight: tileHeight,
      tilecount: tileCount,
      columns,
      image: 'tileset_world.png',
      imagewidth: imgWidth,
      imageheight: imgHeight,
      margin: 0,
      spacing: 0,
    }];

    // Регистрируем как Tiled JSON tilemap
    this.cache.tilemap.add(TestMapScene.MAP_KEY, {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: mapData,
    });

    const map = this.make.tilemap({ key: TestMapScene.MAP_KEY });
    const tileset = map.addTilesetImage(tsName, TestMapScene.PNG_KEY);
    if (!tileset) {
      this.showError(`Не связался тайлсет "${tsName}" с PNG.`);
      return;
    }

    for (let i = 0; i < map.layers.length; i++) {
      const layer = map.createLayer(i, tileset, 0, 0);
      if (!layer) {
        this.showError(
          `Слой ${i} не отрисовался. Проверь формат данных слоя в Tiled ` +
          `(должен быть CSV или Base64 без сжатия — zlib Phaser не умеет).`,
        );
        return;
      }
    }

    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const keys = this.input.keyboard!.createCursorKeys();
    this.events.on('update', () => {
      const speed = 6;
      if (keys.left?.isDown) this.cameras.main.scrollX -= speed;
      if (keys.right?.isDown) this.cameras.main.scrollX += speed;
      if (keys.up?.isDown) this.cameras.main.scrollY -= speed;
      if (keys.down?.isDown) this.cameras.main.scrollY += speed;
    });

    this.add.text(10, 10,
      `Tiled: ${map.width}×${map.height} · tileset: ${tsName}\n← ↑ → ↓ — камера · ESC — назад`, {
      fontSize: '12px',
      fontFamily: '"JetBrains Mono", monospace',
      color: TC.brass3,
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0);

    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });
  }

  private showError(msg: string) {
    this.add.text(20, 20, '⚠ ' + msg, {
      fontSize: '14px',
      fontFamily: '"Special Elite", monospace',
      color: '#c86a6a',
      wordWrap: { width: 900 },
    });
    this.add.text(20, 80, 'ESC — назад к титулу', {
      fontSize: '12px', color: TC.text3,
    });
    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('TitleScene'));
  }
}
