import Phaser from 'phaser';
import { DAMAGE_TEXT_DURATION } from '../utils/constants';

/**
 * Всплывающий текст урона — появляется над целью и улетает вверх.
 */
export class DamageText extends Phaser.GameObjects.Text {
  private lifetime: number = 0;
  private duration: number;

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number, isCrit: boolean, isMiss: boolean, label?: string) {
    const text = label ?? (isMiss ? 'Промах' : `${damage}`);
    const color = label ? '#55ff55' : isMiss ? '#888888' : isCrit ? '#ffaa00' : '#ffffff';
    const size = isCrit ? '16px' : '12px';

    super(scene, x, y - 20, text, {
      fontSize: size,
      color,
      fontStyle: isCrit ? 'bold' : 'normal',
      stroke: '#000000',
      strokeThickness: 2,
    });

    this.setOrigin(0.5);
    this.duration = DAMAGE_TEXT_DURATION;

    scene.add.existing(this);
  }

  update(_time: number, delta: number): boolean {
    this.lifetime += delta;
    const t = this.lifetime / this.duration;

    // Летит вверх и затухает
    this.y -= 30 * (delta / 1000);
    this.setAlpha(1 - t);

    if (t >= 1) {
      this.destroy();
      return true; // удалён
    }
    return false;
  }
}
