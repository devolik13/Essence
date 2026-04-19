import Phaser from 'phaser';
import { THEME, TC } from '../ui/theme';

/**
 * TestMapScene — загрузка и рендер карты, экспортированной из Tiled.
 *
 * Ожидает файлы:
 *   public/assets/maps/test.json   — экспорт из Tiled (File → Export As → JSON)
 *   public/assets/tileset_world.png — тайлсет 160×64 (5×2 тайлов 32×32)
 *
 * ВАЖНО: при экспорте Tiled убедись, что тайлсет встроен в JSON
 *   (Map → Map Properties или при Export As поставь галочку "Embed tilesets").
 *   Иначе в JSON будет ссылка на .tsx и Phaser не сможет распарсить.
 */
export class TestMapScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TestMapScene' });
  }

  preload() {
    this.load.image('tileset_world_png', 'assets/tileset_world.png');
    this.load.tilemapTiledJSON('test-map', 'assets/maps/test.json');

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('[TestMapScene] не удалось загрузить:', file.key, file.src);
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0b08');

    let map: Phaser.Tilemaps.Tilemap;
    try {
      map = this.make.tilemap({ key: 'test-map' });
    } catch (e) {
      this.showError('Карта не загрузилась. Проверь public/assets/maps/test.json');
      return;
    }

    // Имя тайлсета внутри JSON может быть любым — возьмём первое доступное.
    const tsName = map.tilesets[0]?.name;
    if (!tsName) {
      this.showError('В JSON нет встроенного тайлсета. В Tiled: Export As → галочка "Embed tilesets".');
      return;
    }

    const tileset = map.addTilesetImage(tsName, 'tileset_world_png');
    if (!tileset) {
      this.showError(`Не удалось связать тайлсет "${tsName}" с PNG.`);
      return;
    }

    // Отрендерим все видимые слои
    for (let i = 0; i < map.layers.length; i++) {
      const layer = map.createLayer(i, tileset, 0, 0);
      if (layer) layer.setScale(1);
    }

    // Камера
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const keys = this.input.keyboard!.createCursorKeys();
    this.events.on('update', () => {
      const speed = 6;
      if (keys.left?.isDown) this.cameras.main.scrollX -= speed;
      if (keys.right?.isDown) this.cameras.main.scrollX += speed;
      if (keys.up?.isDown) this.cameras.main.scrollY -= speed;
      if (keys.down?.isDown) this.cameras.main.scrollY += speed;
    });

    // HUD
    this.add.text(10, 10,
      `Tiled map: ${map.width}×${map.height} tiles · tileset: ${tsName}\n← ↑ → ↓ — камера · ESC — назад`, {
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
    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('TitleScene'));
    this.add.text(20, 80, 'ESC — назад к титулу', {
      fontSize: '12px', color: TC.text3,
    });
  }
}
