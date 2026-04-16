import Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/constants';
import { getCharacters, deleteCharacter, setActiveSlot, migrateOldSave, CharacterMeta, findFreeSlot } from '../systems/saveLoad';
import { t, initLang } from '../i18n/index';

export class TitleScene extends Phaser.Scene {
  private menuContainer!: Phaser.GameObjects.Container;
  private loadContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    initLang();
    migrateOldSave();
    this.cameras.main.setBackgroundColor('#111111');

    this.menuContainer = this.add.container(0, 0);
    this.loadContainer = this.add.container(0, 0);
    this.loadContainer.setVisible(false);

    this.buildMenu();
  }

  // ── Menu View ─────────────────────────────────────────

  private buildMenu() {
    this.tweens.killAll();
    this.menuContainer.removeAll(true);

    const cx = GAME_WIDTH / 2;

    // Animated sphere
    const glow = this.add.arc(cx, 150, 30, 0, 360, false, 0x66ccff, 0.3);
    const inner = this.add.arc(cx, 150, 16, 0, 360, false, 0xaaeeff, 0.9);
    this.menuContainer.add([glow, inner]);

    this.tweens.add({
      targets: glow,
      alpha: { from: 0.15, to: 0.5 },
      scaleX: { from: 0.9, to: 1.15 },
      scaleY: { from: 0.9, to: 1.15 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    // Title
    this.menuContainer.add(this.add.text(cx, 220, 'ESSENCE', {
      fontSize: '56px',
      fontFamily: 'Georgia, serif',
      color: '#66ccff',
      stroke: '#224466',
      strokeThickness: 4,
    }).setOrigin(0.5));

    // Subtitle
    this.menuContainer.add(this.add.text(cx, 270, 'PvP MMORPG', {
      fontSize: '16px',
      color: '#556677',
    }).setOrigin(0.5));

    // New Game button
    const slotsFull = findFreeSlot() === null;
    this.addButton(cx, 360, t('title.new_game'), () => {
      this.scene.start('CharCreateScene');
      this.scene.stop();
    }, this.menuContainer, slotsFull);

    // Load button
    const noChars = getCharacters().length === 0;
    this.addButton(cx, 420, t('title.load'), () => {
      this.showLoad();
    }, this.menuContainer, noChars);
  }

  // ── Load View ─────────────────────────────────────────

  private buildLoadView() {
    this.loadContainer.removeAll(true);

    const cx = GAME_WIDTH / 2;

    // Title
    this.loadContainer.add(this.add.text(cx, 80, t('title.load'), {
      fontSize: '32px', color: '#66ccff',
      stroke: '#224466', strokeThickness: 3,
    }).setOrigin(0.5));

    const chars = getCharacters();

    for (let i = 0; i < 3; i++) {
      const y = 170 + i * 90;
      const meta = chars.find(c => c.slotIndex === i);

      // Slot background
      const bg = this.add.rectangle(cx, y, 500, 70, meta ? 0x223344 : 0x1a1a2a, 0.8);
      bg.setStrokeStyle(1, meta ? 0x446688 : 0x333344);
      this.loadContainer.add(bg);

      if (meta) {
        const weaponName = this.weaponLabel(meta.bodyId);
        this.loadContainer.add(this.add.text(cx - 220, y - 12, meta.name, {
          fontSize: '18px', color: '#ccddee',
        }));
        this.loadContainer.add(this.add.text(cx - 220, y + 10,
          `${weaponName}  |  ${t('stats.rank')} ${meta.rank}`, {
          fontSize: '12px', color: '#778899',
        }));

        // Play
        this.addButton(cx + 130, y, t('title.play'), () => {
          this.startGame(meta.slotIndex);
        }, this.loadContainer, false, 90, 36);

        // Delete
        this.addButton(cx + 225, y, t('title.delete'), () => {
          deleteCharacter(meta.slotIndex);
          this.buildLoadView();
        }, this.loadContainer, false, 70, 36, 0x553333, '#cc8888');
      } else {
        this.loadContainer.add(this.add.text(cx, y, t('title.empty_slot'), {
          fontSize: '14px', color: '#445566',
        }).setOrigin(0.5));
      }
    }

    // Back button
    this.addButton(cx, 460, t('title.back'), () => {
      this.showMenu();
    }, this.loadContainer);
  }

  // ── Navigation ────────────────────────────────────────

  private showMenu() {
    this.loadContainer.setVisible(false);
    this.buildMenu();
    this.menuContainer.setVisible(true);
  }

  private showLoad() {
    this.menuContainer.setVisible(false);
    this.buildLoadView();
    this.loadContainer.setVisible(true);
  }

  private startGame(slotIndex: number) {
    setActiveSlot(slotIndex);
    this.scene.start('GameScene', { isNewGame: false });
    this.scene.start('UIScene');
    this.scene.stop();
  }

  // ── Helpers ───────────────────────────────────────────

  private weaponLabel(bodyId: string): string {
    switch (bodyId) {
      case 'human_warrior': return t('title.sword');
      case 'human_mage':    return t('title.staff');
      case 'human_archer':  return t('title.bow');
      default: return bodyId;
    }
  }

  private addButton(
    x: number, y: number, label: string, callback: () => void,
    container: Phaser.GameObjects.Container,
    disabled = false, w = 200, h = 44,
    bgColor?: number, textColor?: string,
  ) {
    const fillColor = disabled ? 0x222222 : (bgColor ?? 0x334455);
    const strokeColor = disabled ? 0x333333 : 0x557799;
    const txtColor = disabled ? '#555555' : (textColor ?? '#aaccee');

    const bg = this.add.rectangle(x, y, w, h, fillColor, 0.9);
    bg.setStrokeStyle(1, strokeColor);
    const txt = this.add.text(x, y, label, {
      fontSize: h > 40 ? '16px' : '13px',
      color: txtColor,
    }).setOrigin(0.5);
    container.add([bg, txt]);

    if (!disabled) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => { bg.setFillStyle(0x445566); txt.setColor('#ffffff'); });
      bg.on('pointerout', () => { bg.setFillStyle(fillColor); txt.setColor(txtColor); });
      bg.on('pointerdown', callback);
    }
  }
}
