import Phaser from 'phaser';
import { TC } from '../ui/theme';

/**
 * TestMapScene — рендер LDtk-карты через Phaser Tilemap.
 *
 * Файлы:
 *   public/assets/maps/test.ldtk          — экспорт LDtk (JSON)
 *   public/assets/maps/tileset_world.png  — тайлсет (32px тайлы)
 *
 * Поддерживаются слои типа Tiles (gridTiles) и AutoLayer (autoLayerTiles).
 * IntGrid пока не визуализируется (будет для коллизий позже).
 */
export class TestMapScene extends Phaser.Scene {
  private static readonly LDTK_KEY = 'test-ldtk';
  private static readonly PNG_KEY = 'tileset_world_png';

  constructor() {
    super({ key: 'TestMapScene' });
  }

  preload() {
    this.load.json(TestMapScene.LDTK_KEY, 'assets/maps/test.ldtk');
    this.load.image(TestMapScene.PNG_KEY, 'assets/maps/tileset_world.png');
    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      console.error('[TestMapScene] не удалось загрузить:', file.key, file.src);
    });
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0b08');

    const ldtk = this.cache.json.get(TestMapScene.LDTK_KEY);
    if (!ldtk) {
      this.showError('Не загрузился test.ldtk');
      return;
    }

    const tsDef = ldtk.defs?.tilesets?.[0];
    const level = ldtk.levels?.[0];
    if (!tsDef || !level) {
      this.showError('В LDtk нет тайлсета или уровня.');
      return;
    }

    const tileSize = tsDef.tileGridSize || 32;
    const pxWid = level.pxWid;
    const pxHei = level.pxHei;
    const wTiles = pxWid / tileSize;
    const hTiles = pxHei / tileSize;
    const columnsInTileset = tsDef.__cWid || Math.floor(tsDef.pxWid / tileSize);

    // Собираем пустую Phaser-tilemap и кладём слои из LDtk
    const map = this.make.tilemap({
      tileWidth: tileSize,
      tileHeight: tileSize,
      width: wTiles,
      height: hTiles,
    });
    const tileset = map.addTilesetImage('ts', TestMapScene.PNG_KEY, tileSize, tileSize, 0, 0);
    if (!tileset) {
      this.showError('Не подключился тайлсет.');
      return;
    }

    // LDtk слои идут от верхнего к нижнему — рендерим в обратном порядке
    const layerInstances = [...(level.layerInstances || [])].reverse();
    let totalTiles = 0;
    for (const li of layerInstances) {
      if (li.__type !== 'Tiles' && li.__type !== 'AutoLayer') continue;
      const tiles = li.__type === 'AutoLayer' ? li.autoLayerTiles : li.gridTiles;
      if (!tiles?.length) continue;

      const phaserLayer = map.createBlankLayer(li.__identifier, tileset, 0, 0, wTiles, hTiles);
      if (!phaserLayer) continue;

      for (const t of tiles) {
        const [px, py] = t.px;
        const [sx, sy] = t.src;
        const tileIndex = (sy / tileSize) * columnsInTileset + (sx / tileSize);
        phaserLayer.putTileAt(tileIndex, px / tileSize, py / tileSize);
        totalTiles++;
      }
    }

    this.cameras.main.setBounds(0, 0, pxWid, pxHei);
    const keys = this.input.keyboard!.createCursorKeys();
    this.events.on('update', () => {
      const speed = 6;
      if (keys.left?.isDown) this.cameras.main.scrollX -= speed;
      if (keys.right?.isDown) this.cameras.main.scrollX += speed;
      if (keys.up?.isDown) this.cameras.main.scrollY -= speed;
      if (keys.down?.isDown) this.cameras.main.scrollY += speed;
    });

    this.add.text(10, 10,
      `LDtk · ${wTiles}×${hTiles} tiles · ${totalTiles} placed\n← ↑ → ↓ — камера · ESC — назад`, {
      fontSize: '12px',
      fontFamily: '"JetBrains Mono", monospace',
      color: TC.brass3,
      backgroundColor: '#000000aa',
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0);

    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('TitleScene'));
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
