import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { getCharacters, deleteCharacter, setActiveSlot, migrateOldSave, findFreeSlot } from '../systems/saveLoad';
import { t, lt, initLang } from '../i18n/index';
import { WeaponType } from '../types/bodies';
import { THEME, TC } from '../ui/theme';
import { stopMusic } from '../systems/music';

export class TitleScene extends Phaser.Scene {
  private menuContainer!: Phaser.GameObjects.Container;
  private loadContainer!: Phaser.GameObjects.Container;
  private bgArt?: Phaser.GameObjects.Image;
  private bgArtScale = 1;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    stopMusic(); // возврат из игры/титров — фоновая музыка затихает
    initLang();
    migrateOldSave();
    this.cameras.main.setBackgroundColor('#0d0b08');

    // Арт-фон (кадр пролога «Эпоха пара») + виньетка, чтобы меню читалось
    if (this.textures.exists('prologue_1')) {
      this.bgArt = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'prologue_1')
        .setAlpha(0.38);
      this.bgArtScale = Math.max(GAME_WIDTH / this.bgArt.width, GAME_HEIGHT / this.bgArt.height);
      this.bgArt.setScale(this.bgArtScale * 1.04);
      const vign = this.add.graphics();
      vign.fillStyle(0x0d0b08, 0.55).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      vign.fillGradientStyle(0x0d0b08, 0x0d0b08, 0x0d0b08, 0x0d0b08, 0.9, 0.9, 0.1, 0.1);
      vign.fillRect(0, 0, GAME_WIDTH, 240);
    }

    this.menuContainer = this.add.container(0, 0);
    this.loadContainer = this.add.container(0, 0);
    this.loadContainer.setVisible(false);

    this.buildMenu();
  }

  // ── Menu View ─────────────────────────────────────────

  private buildMenu() {
    this.tweens.killAll();
    this.menuContainer.removeAll(true);

    // «Дыхание» арт-фона — пересоздаём после killAll
    if (this.bgArt) {
      this.bgArt.setScale(this.bgArtScale * 1.04);
      this.tweens.add({
        targets: this.bgArt, scale: this.bgArtScale * 1.1,
        duration: 22000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    }

    const cx = GAME_WIDTH / 2;

    // Animated sphere
    const glow = this.add.arc(cx, 150, 30, 0, 360, false, THEME.ether2, 0.3);
    const inner = this.add.arc(cx, 150, 16, 0, 360, false, THEME.ether3, 0.9);
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
      fontFamily: '"Cormorant Garamond", serif',
      color: TC.brass4,
      stroke: '#2a1a08',
      strokeThickness: 4,
    }).setOrigin(0.5));

    // Subtitle
    this.menuContainer.add(this.add.text(cx, 270, 'PvP MMORPG', {
      fontSize: '14px',
      fontFamily: '"Special Elite", monospace',
      color: TC.text3,
      letterSpacing: 6,
    }).setOrigin(0.5));

    // New Game button
    const slotsFull = findFreeSlot() === null;
    this.addButton(cx, 360, t('title.new_game'), () => {
      this.registry.set('pitchMode', false);
      this.scene.start('CharCreateScene');
      this.scene.stop();
    }, this.menuContainer, slotsFull);

    // Load button
    const noChars = getCharacters().length === 0;
    this.addButton(cx, 420, t('title.load'), () => {
      this.showLoad();
    }, this.menuContainer, noChars);

    // Питч-демо: вертикальный срез одним прогоном (пролог → деревня → Игнис →
    // лаборатория). Свежий старт на скрытом слоте 99 — не занимает слоты игрока.
    this.addButton(cx, 480, t('title.pitch'), () => {
      localStorage.removeItem('essence_slot_99');
      setActiveSlot(99);
      this.registry.set('pitchMode', true);
      this.scene.start('GameScene', {
        isNewGame: true,
        starterBodyId: 'starter_sword',
        starterWeapon1: WeaponType.Sword,
        starterWeapon2: WeaponType.StaffFire,
        characterName: lt('Доброволец', 'Volunteer'),
      });
      this.scene.start('UIScene');
      this.scene.stop();
    }, this.menuContainer, false, 180, 36);

    // Lab Editor: прямой вход в лабораторию с открытым редактором карт —
    // расставить мебель и экспортировать lab.json (Ctrl+E).
    this.addButton(cx, 528, lt('Редактор лаборатории', 'Lab Editor'), () => {
      localStorage.removeItem('essence_slot_99');
      setActiveSlot(99);
      this.registry.set('pitchMode', true);
      this.scene.start('GameScene', {
        isNewGame: true,
        zoneId: 'lab',
        starterBodyId: 'starter_sword',
        starterWeapon1: WeaponType.Sword,
        starterWeapon2: WeaponType.StaffFire,
        characterName: lt('Доброволец', 'Volunteer'),
        editorOnStart: true,
      });
      this.scene.start('UIScene');
      this.scene.stop();
    }, this.menuContainer, false, 200, 30);

    // Подсказка про редактор карт
    this.menuContainer.add(this.add.text(cx, 568,
      lt('Расставь мебель → Ctrl+E скачает lab.json → пришли мне',
         'Arrange furniture → Ctrl+E downloads lab.json → send it to me'),
      { fontSize: '11px', color: '#88aabb', fontStyle: 'italic' } as Phaser.Types.GameObjects.Text.TextStyle
    ).setOrigin(0.5));
  }

  // ── Load View ─────────────────────────────────────────

  private buildLoadView() {
    this.loadContainer.removeAll(true);

    const cx = GAME_WIDTH / 2;

    // Title
    this.loadContainer.add(this.add.text(cx, 80, t('title.load'), {
      fontSize: '32px',
      fontFamily: '"Cormorant Garamond", serif',
      color: TC.brass3,
      stroke: '#2a1a08', strokeThickness: 3,
    }).setOrigin(0.5));

    const chars = getCharacters();

    for (let i = 0; i < 3; i++) {
      const y = 170 + i * 90;
      const meta = chars.find(c => c.slotIndex === i);

      // Slot background
      const bg = this.add.rectangle(cx, y, 500, 70, meta ? THEME.ink2 : THEME.ink1, 0.8);
      bg.setStrokeStyle(1, meta ? THEME.brass0 : THEME.ink4);
      this.loadContainer.add(bg);

      if (meta) {
        const weaponName = this.weaponLabel(meta.bodyId);
        this.loadContainer.add(this.add.text(cx - 220, y - 12, meta.name, {
          fontSize: '18px', fontFamily: '"Cormorant Garamond", serif', color: TC.paper0,
        }));
        this.loadContainer.add(this.add.text(cx - 220, y + 10,
          `${weaponName}  |  ${t('stats.rank')} ${meta.rank}`, {
          fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', color: TC.text2,
        }));

        // Play
        this.addButton(cx + 130, y, t('title.play'), () => {
          this.registry.set('pitchMode', false);
          this.startGame(meta.slotIndex);
        }, this.loadContainer, false, 90, 36);

        // Delete
        this.addButton(cx + 225, y, t('title.delete'), () => {
          deleteCharacter(meta.slotIndex);
          this.buildLoadView();
        }, this.loadContainer, false, 70, 36, 0x2a1111, '#c86a6a');
      } else {
        this.loadContainer.add(this.add.text(cx, y, t('title.empty_slot'), {
          fontSize: '14px', fontFamily: '"Special Elite", monospace', color: TC.text3,
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
    if (bodyId.startsWith('starter_')) {
      const wt = bodyId.substring(8);
      return t(`weapon.${wt}`);
    }
    switch (bodyId) {
      case 'human_warrior': return t('weapon.sword');
      case 'human_mage':    return t('weapon.staff_fire');
      case 'human_archer':  return t('weapon.shortbow');
      default: return bodyId;
    }
  }

  private addButton(
    x: number, y: number, label: string, callback: () => void,
    container: Phaser.GameObjects.Container,
    disabled = false, w = 200, h = 44,
    bgColor?: number, textColor?: string,
  ) {
    const fillColor = disabled ? THEME.ink1 : (bgColor ?? THEME.ink2);
    const strokeColor = disabled ? THEME.ink4 : THEME.brass0;
    const txtColor = disabled ? TC.text3 : (textColor ?? TC.text1);

    const bg = this.add.rectangle(x, y, w, h, fillColor, 0.9);
    bg.setStrokeStyle(1, strokeColor);
    const txt = this.add.text(x, y, label, {
      fontSize: h > 40 ? '16px' : '13px',
      fontFamily: '"Special Elite", monospace',
      color: txtColor,
    }).setOrigin(0.5);
    container.add([bg, txt]);

    if (!disabled) {
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => { bg.setFillStyle(THEME.ink3); txt.setColor(TC.paper0); });
      bg.on('pointerout', () => { bg.setFillStyle(fillColor); txt.setColor(txtColor); });
      bg.on('pointerdown', callback);
    }
  }
}
