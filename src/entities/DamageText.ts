import Phaser from 'phaser';
import { DAMAGE_TEXT_DURATION } from '../utils/constants';
import { t } from '../i18n';

/**
 * Всплывающий текст урона — появляется над целью и улетает вверх.
 */
/** Тип числа — задаёт цвет: огонь/яд/кровь красным/фиолетовым/алым, лечение зелёным. */
export type DamageKind = 'fire' | 'poison' | 'bleed' | 'mana' | 'heal';

const KIND_COLORS: Record<DamageKind, string> = {
  fire:   '#ff5a3c',
  poison: '#b362ff',
  bleed:  '#dd3344',
  mana:   '#5a9cff',
  heal:   '#55ff55',
};

export class DamageText extends Phaser.GameObjects.Text {
  private lifetime: number = 0;
  private duration: number;

  constructor(scene: Phaser.Scene, x: number, y: number, damage: number, isCrit: boolean, isMiss: boolean, label?: string, kind?: DamageKind) {
    const text = label ?? (isMiss ? t('misc.miss') : `${damage}`);
    const color =
      isMiss ? '#888888'
      : kind ? KIND_COLORS[kind]
      : label ? '#55ff55'
      : isCrit ? '#ffaa00'
      : '#ffffff';
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
    this.y -= 60 * (delta / 1000);
    this.setAlpha(1 - t);

    if (t >= 1) {
      this.destroy();
      return true; // удалён
    }
    return false;
  }
}
