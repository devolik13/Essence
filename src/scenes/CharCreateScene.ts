import Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/constants';
import { setActiveSlot, findFreeSlot, saveCharacterMeta } from '../systems/saveLoad';
import { t } from '../i18n/index';

const MAX_NAME_LENGTH = 16;

interface WeaponOption {
  bodyId: string;
  labelKey: string;
  color: number;
  descKey: string;
}

const WEAPONS: WeaponOption[] = [
  { bodyId: 'human_warrior', labelKey: 'title.sword', color: 0xcc3333, descKey: 'create.sword_desc' },
  { bodyId: 'human_mage',   labelKey: 'title.staff', color: 0x3366ff, descKey: 'create.staff_desc' },
];

export class CharCreateScene extends Phaser.Scene {
  private playerName = '';
  private nameDisplay!: Phaser.GameObjects.Text;
  private nameCursor!: Phaser.GameObjects.Rectangle;
  private selectedWeapon: string | null = null;
  private weaponCards: { bodyId: string; bg: Phaser.GameObjects.Rectangle; border: Phaser.GameObjects.Rectangle }[] = [];
  private startBg!: Phaser.GameObjects.Rectangle;
  private startTxt!: Phaser.GameObjects.Text;
  private blinkTimer = 0;
  private keyHandler?: (e: KeyboardEvent) => void;

  constructor() {
    super({ key: 'CharCreateScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#111111');
    this.playerName = '';
    this.selectedWeapon = null;
    this.weaponCards = [];

    const cx = GAME_WIDTH / 2;

    // Title
    this.add.text(cx, 60, t('create.title'), {
      fontSize: '32px', color: '#66ccff',
      stroke: '#224466', strokeThickness: 3,
    }).setOrigin(0.5);

    // Name label
    this.add.text(cx, 130, t('create.name'), {
      fontSize: '16px', color: '#778899',
    }).setOrigin(0.5);

    // Name input box
    this.add.rectangle(cx, 170, 300, 40, 0x1a1a2a, 0.9)
      .setStrokeStyle(1, 0x446688);

    // Name text
    this.nameDisplay = this.add.text(cx - 140, 160, '', {
      fontSize: '18px', color: '#ccddee',
    });

    // Blinking cursor
    this.nameCursor = this.add.rectangle(cx - 138, 170, 2, 24, 0xaaccee);

    // Keyboard input via DOM event (avoids conflicts with Phaser key objects)
    this.keyHandler = (e: KeyboardEvent) => this.onKeyDown(e);
    window.addEventListener('keydown', this.keyHandler);

    // Weapon choice label
    this.add.text(cx, 230, t('create.choose_weapon'), {
      fontSize: '16px', color: '#778899',
    }).setOrigin(0.5);

    // Weapon cards
    WEAPONS.forEach((w, i) => {
      const x = cx + (i === 0 ? -120 : 120);
      this.createWeaponCard(x, 340, w);
    });

    // Back button
    this.createActionButton(cx - 120, 490, t('title.back'), () => {
      this.cleanup();
      this.scene.start('TitleScene');
      this.scene.stop();
    });

    // Start button
    const { bg, txt } = this.createActionButton(cx + 120, 490, t('create.start'), () => {
      this.startNewGame();
    });
    this.startBg = bg;
    this.startTxt = txt;
    this.updateStartButton();
  }

  update(_time: number, delta: number) {
    this.blinkTimer += delta;
    if (this.blinkTimer > 500) {
      this.blinkTimer = 0;
      this.nameCursor.setVisible(!this.nameCursor.visible);
    }
    this.nameCursor.setX(GAME_WIDTH / 2 - 140 + this.nameDisplay.width + 2);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.playerName = this.playerName.slice(0, -1);
    } else if (e.key === 'Enter') {
      if (this.canStart()) this.startNewGame();
      return;
    } else if (e.key.length === 1 && this.playerName.length < MAX_NAME_LENGTH) {
      if (/[\w\s\u0400-\u04FF-]/.test(e.key)) {
        this.playerName += e.key;
      }
    } else {
      return;
    }
    this.nameDisplay.setText(this.playerName);
    this.updateStartButton();
  }

  private createWeaponCard(x: number, y: number, weapon: WeaponOption) {
    const bg = this.add.rectangle(x, y, 190, 150, 0x1a1a2a, 0.9);
    const border = this.add.rectangle(x, y, 190, 150);
    border.setStrokeStyle(2, 0x333344);
    border.setFillStyle(0, 0);

    // Color indicator
    this.add.arc(x, y - 40, 22, 0, 360, false, weapon.color, 0.7);

    // Name
    this.add.text(x, y + 5, t(weapon.labelKey), {
      fontSize: '18px', color: '#ccddee',
    }).setOrigin(0.5);

    // Description
    this.add.text(x, y + 30, t(weapon.descKey), {
      fontSize: '11px', color: '#667788',
      wordWrap: { width: 170 },
      align: 'center',
    }).setOrigin(0.5, 0);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerdown', () => {
      this.selectedWeapon = weapon.bodyId;
      this.updateWeaponSelection();
      this.updateStartButton();
    });
    bg.on('pointerover', () => {
      if (this.selectedWeapon !== weapon.bodyId) border.setStrokeStyle(2, 0x557799);
    });
    bg.on('pointerout', () => {
      if (this.selectedWeapon !== weapon.bodyId) border.setStrokeStyle(2, 0x333344);
    });

    this.weaponCards.push({ bodyId: weapon.bodyId, bg, border });
  }

  private updateWeaponSelection() {
    for (const card of this.weaponCards) {
      if (card.bodyId === this.selectedWeapon) {
        card.border.setStrokeStyle(2, 0x66ccff);
        card.bg.setFillStyle(0x223344, 0.9);
      } else {
        card.border.setStrokeStyle(2, 0x333344);
        card.bg.setFillStyle(0x1a1a2a, 0.9);
      }
    }
  }

  private canStart(): boolean {
    return this.playerName.trim().length > 0 && this.selectedWeapon !== null;
  }

  private updateStartButton() {
    const ok = this.canStart();
    this.startBg.setFillStyle(ok ? 0x334455 : 0x222222, 0.9);
    this.startBg.setStrokeStyle(1, ok ? 0x557799 : 0x333333);
    this.startTxt.setColor(ok ? '#aaccee' : '#555555');
    if (ok) {
      this.startBg.setInteractive({ useHandCursor: true });
    } else {
      this.startBg.disableInteractive();
    }
  }

  private createActionButton(
    x: number, y: number, label: string, callback: () => void,
  ): { bg: Phaser.GameObjects.Rectangle; txt: Phaser.GameObjects.Text } {
    const bg = this.add.rectangle(x, y, 180, 44, 0x334455, 0.9);
    bg.setStrokeStyle(1, 0x557799);
    const txt = this.add.text(x, y, label, {
      fontSize: '16px', color: '#aaccee',
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => { bg.setFillStyle(0x445566); txt.setColor('#ffffff'); });
    bg.on('pointerout', () => { bg.setFillStyle(0x334455); txt.setColor('#aaccee'); });
    bg.on('pointerdown', callback);

    return { bg, txt };
  }

  private startNewGame() {
    if (!this.canStart()) return;
    const slotIndex = findFreeSlot();
    if (slotIndex === null) return;

    this.cleanup();

    setActiveSlot(slotIndex);
    saveCharacterMeta({
      slotIndex,
      name: this.playerName.trim(),
      bodyId: this.selectedWeapon!,
      rank: 1,
      lastPlayed: Date.now(),
    });

    this.scene.start('GameScene', {
      isNewGame: true,
      starterBodyId: this.selectedWeapon!,
      characterName: this.playerName.trim(),
    });
    this.scene.start('UIScene');
    this.scene.stop();
  }

  private cleanup() {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = undefined;
    }
  }

  shutdown() {
    this.cleanup();
  }
}
