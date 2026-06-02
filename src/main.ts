import Phaser from 'phaser';
import './ui/inventory.css';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { CharCreateScene } from './scenes/CharCreateScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { TestMapScene } from './scenes/TestMapScene';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: document.body,
  backgroundColor: '#111111',
  scene: [BootScene, TitleScene, CharCreateScene, GameScene, UIScene, TestMapScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    keyboard: true,
    mouse: true,
  },
};

new Phaser.Game(config);
