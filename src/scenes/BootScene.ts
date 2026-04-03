import Phaser from 'phaser';

/**
 * BootScene — загрузка ассетов и переход к игре.
 * Пока без графики — генерируем текстуры программно.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Генерируем простую тайловую текстуру (трава)
    const gfx = this.add.graphics();

    // Тайл травы 32x32
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

    // Тайл камня (безопасная зона)
    gfx.fillStyle(0x555566, 1);
    gfx.fillRect(0, 0, 32, 32);
    gfx.fillStyle(0x666677, 1);
    gfx.fillRect(2, 2, 12, 12);
    gfx.fillRect(18, 16, 12, 12);
    gfx.generateTexture('tile_stone', 32, 32);
    gfx.clear();

    // Камень возрождения
    gfx.fillStyle(0x8888cc, 1);
    gfx.fillRect(4, 4, 24, 24);
    gfx.fillStyle(0xaaaaee, 1);
    gfx.fillRect(8, 8, 16, 16);
    gfx.generateTexture('respawn_stone', 32, 32);
    gfx.clear();

    gfx.destroy();
  }

  create() {
    this.scene.start('GameScene');
    this.scene.start('UIScene');
  }
}
