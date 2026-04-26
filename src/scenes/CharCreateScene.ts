import Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/constants';
import { setActiveSlot, findFreeSlot, saveCharacterMeta } from '../systems/saveLoad';
import { t } from '../i18n/index';
import { WeaponType } from '../types/bodies';
import { WEAPONS, WeaponDef, STRENGTH_WEAPONS, AGILITY_WEAPONS, INTELLECT_WEAPONS } from '../data/weapons';
import { THEME, TC } from '../ui/theme';

const MAX_NAME_LENGTH = 16;

interface WeaponGroup {
  labelKey: string;
  color: number;
  weapons: WeaponType[];
}

const GROUPS: WeaponGroup[] = [
  { labelKey: 'create.group_str', color: 0xcc3333, weapons: STRENGTH_WEAPONS },
  { labelKey: 'create.group_agi', color: 0x33cc33, weapons: AGILITY_WEAPONS },
  { labelKey: 'create.group_int', color: 0x3366ff, weapons: INTELLECT_WEAPONS },
];

const STAFF_SCHOOLS: Partial<Record<WeaponType, string>> = {
  [WeaponType.StaffFire]:   'school.fire',
  [WeaponType.StaffWater]:  'school.water',
  [WeaponType.StaffEarth]:  'school.earth',
  [WeaponType.StaffWind]:   'school.wind',
  [WeaponType.StaffNature]: 'school.nature',
};

export class CharCreateScene extends Phaser.Scene {
  private playerName = '';
  private nameDisplay!: Phaser.GameObjects.Text;
  private nameCursor!: Phaser.GameObjects.Rectangle;
  private selectedWeapons: WeaponType[] = [];
  private cardBorders: Map<WeaponType, Phaser.GameObjects.Rectangle> = new Map();
  private cardBgs: Map<WeaponType, Phaser.GameObjects.Rectangle> = new Map();
  private cardLabels: Map<WeaponType, Phaser.GameObjects.Text> = new Map();
  private infoPanel!: Phaser.GameObjects.Container;
  private startBg!: Phaser.GameObjects.Rectangle;
  private startTxt!: Phaser.GameObjects.Text;
  private selectionHint!: Phaser.GameObjects.Text;
  private blinkTimer = 0;
  private keyHandler?: (e: KeyboardEvent) => void;

  constructor() {
    super({ key: 'CharCreateScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#0d0b08');
    this.playerName = '';
    this.selectedWeapons = [];
    this.cardBorders.clear();
    this.cardBgs.clear();
    this.cardLabels.clear();

    const cx = GAME_WIDTH / 2;

    // Title
    this.add.text(cx, 30, t('create.title'), {
      fontSize: '28px', fontFamily: '"Cormorant Garamond", serif',
      color: TC.brass3,
      stroke: '#2a1a08', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── Name input ────────────────────────────────────
    this.add.text(280, 70, t('create.name'), {
      fontSize: '12px', fontFamily: '"Special Elite", monospace', color: TC.text2,
    }).setOrigin(0.5);

    this.add.rectangle(280, 100, 280, 34, THEME.ink1, 0.9)
      .setStrokeStyle(1, THEME.brass0);

    this.nameDisplay = this.add.text(148, 92, '', {
      fontSize: '16px', fontFamily: '"Inter", sans-serif', color: TC.paper0,
    });

    this.nameCursor = this.add.rectangle(150, 100, 2, 22, THEME.brass3);

    this.keyHandler = (e: KeyboardEvent) => this.onKeyDown(e);
    window.addEventListener('keydown', this.keyHandler);

    // ── Weapon choice label ───────────────────────────
    this.add.text(280, 140, t('create.choose_weapons'), {
      fontSize: '12px', fontFamily: '"Special Elite", monospace', color: TC.text2,
    }).setOrigin(0.5);

    // Selection hint (shows "1/2" or "2/2")
    this.selectionHint = this.add.text(420, 140, '', {
      fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', color: TC.text3,
    }).setOrigin(0, 0.5);

    // ── Weapon grid ───────────────────────────────────
    const CARD_W = 92;
    const CARD_H = 52;
    const GAP_X = 8;
    const GAP_Y = 8;
    const GRID_X = 40;
    const LABEL_W = 52;

    GROUPS.forEach((group, gi) => {
      const rowY = 175 + gi * (CARD_H + GAP_Y + 18);

      this.add.text(GRID_X, rowY + CARD_H / 2, t(group.labelKey), {
        fontSize: '10px', color: '#' + group.color.toString(16).padStart(6, '0'),
      }).setOrigin(0, 0.5);

      group.weapons.forEach((wt, wi) => {
        const cardX = GRID_X + LABEL_W + wi * (CARD_W + GAP_X) + CARD_W / 2;
        const cardY = rowY + CARD_H / 2;
        this.createWeaponCard(cardX, cardY, CARD_W, CARD_H, wt, group.color);
      });
    });

    // ── Info panel (right side) ───────────────────────
    this.infoPanel = this.add.container(560, 155);
    this.buildInfoPanelEmpty();

    // ── Buttons ───────────────────────────────────────
    this.createActionButton(200, 430, t('title.back'), () => {
      this.cleanup();
      this.scene.start('TitleScene');
      this.scene.stop();
    });

    const { bg, txt } = this.createActionButton(420, 430, t('create.start'), () => {
      this.startNewGame();
    });
    this.startBg = bg;
    this.startTxt = txt;
    this.updateStartButton();
    this.updateSelectionHint();
  }

  update(_time: number, delta: number) {
    this.blinkTimer += delta;
    if (this.blinkTimer > 500) {
      this.blinkTimer = 0;
      this.nameCursor.setVisible(!this.nameCursor.visible);
    }
    this.nameCursor.setX(148 + this.nameDisplay.width + 2);
  }

  // ── Keyboard ──────────────────────────────────────

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

  // ── Weapon card ───────────────────────────────────

  private createWeaponCard(x: number, y: number, w: number, h: number, wt: WeaponType, groupColor: number) {
    const bg = this.add.rectangle(x, y, w, h, THEME.ink1, 0.9);
    const border = this.add.rectangle(x, y, w, h);
    border.setStrokeStyle(1, THEME.ink4);
    border.setFillStyle(0, 0);

    this.add.rectangle(x, y - h / 2 + 3, w - 4, 4, groupColor, 0.6);

    this.add.text(x, y + 2, t(`weapon.${wt}`), {
      fontSize: '11px', fontFamily: '"Inter", sans-serif', color: TC.text1,
    }).setOrigin(0.5);

    // Selection order label (hidden initially)
    const orderLabel = this.add.text(x + w / 2 - 10, y - h / 2 + 6, '', {
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace',
      color: TC.ether2, fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(x, y + 17, '10', {
      fontSize: '10px', fontFamily: '"JetBrains Mono", monospace', color: TC.text3,
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerdown', () => {
      this.toggleWeapon(wt);
    });

    bg.on('pointerover', () => {
      if (!this.selectedWeapons.includes(wt)) {
        border.setStrokeStyle(1, THEME.brass0);
      }
      this.buildInfoPanel(wt);
    });

    bg.on('pointerout', () => {
      if (!this.selectedWeapons.includes(wt)) {
        border.setStrokeStyle(1, THEME.ink4);
      }
      const last = this.selectedWeapons[this.selectedWeapons.length - 1];
      if (last) {
        this.buildInfoPanel(last);
      } else {
        this.buildInfoPanelEmpty();
      }
    });

    this.cardBorders.set(wt, border);
    this.cardBgs.set(wt, bg);
    this.cardLabels.set(wt, orderLabel);
  }

  private toggleWeapon(wt: WeaponType) {
    const idx = this.selectedWeapons.indexOf(wt);
    if (idx >= 0) {
      // Deselect
      this.selectedWeapons.splice(idx, 1);
    } else if (this.selectedWeapons.length < 2) {
      // Select
      this.selectedWeapons.push(wt);
    } else {
      // Already 2 selected — replace second
      this.selectedWeapons[1] = wt;
    }
    this.updateCardSelection();
    this.updateStartButton();
    this.updateSelectionHint();
    this.buildInfoPanel(wt);
  }

  private updateCardSelection() {
    for (const [wt, border] of this.cardBorders) {
      const bg = this.cardBgs.get(wt)!;
      const label = this.cardLabels.get(wt)!;
      const idx = this.selectedWeapons.indexOf(wt);

      if (idx >= 0) {
        border.setStrokeStyle(2, idx === 0 ? THEME.ether2 : THEME.brass3);
        bg.setFillStyle(THEME.ink2, 0.9);
        label.setText(`${idx + 1}`);
        label.setColor(idx === 0 ? TC.ether2 : TC.brass3);
      } else {
        border.setStrokeStyle(1, THEME.ink4);
        bg.setFillStyle(THEME.ink1, 0.9);
        label.setText('');
      }
    }
  }

  private updateSelectionHint() {
    this.selectionHint.setText(`(${this.selectedWeapons.length}/2)`);
    this.selectionHint.setColor(this.selectedWeapons.length === 2 ? TC.ether2 : TC.text3);
  }

  // ── Info panel ────────────────────────────────────

  private buildInfoPanelEmpty() {
    this.infoPanel.removeAll(true);
    const bg = this.add.rectangle(175, 110, 340, 230, THEME.ink1, 0.7);
    bg.setStrokeStyle(1, THEME.ink4);
    this.infoPanel.add(bg);
    this.infoPanel.add(this.add.text(175, 110, t('create.info.hover'), {
      fontSize: '13px', fontFamily: '"Special Elite", monospace', color: TC.text3,
    }).setOrigin(0.5));
  }

  private buildInfoPanel(wt: WeaponType) {
    this.infoPanel.removeAll(true);

    const weapon = WEAPONS[wt];
    const panelW = 340;
    const panelH = 230;
    const px = panelW / 2;
    const py = panelH / 2;

    const bg = this.add.rectangle(px, py, panelW, panelH, THEME.ink1, 0.9);
    bg.setStrokeStyle(1, THEME.brass0);
    this.infoPanel.add(bg);

    let y = 20;
    const leftX = 16;
    const valX = 170;

    this.infoPanel.add(this.add.text(px, y, t(`weapon.${wt}`), {
      fontSize: '18px', fontFamily: '"Cormorant Garamond", serif', color: TC.paper0,
      stroke: '#0d0b08', strokeThickness: 2,
    }).setOrigin(0.5));
    y += 28;

    this.infoPanel.add(this.add.rectangle(px, y, panelW - 20, 1, THEME.brass0));
    y += 12;

    const typeKey = INTELLECT_WEAPONS.includes(wt) ? 'create.type.magic'
      : weapon.isMelee ? 'create.type.melee' : 'create.type.ranged';
    this.addInfoRow(leftX, valX, y, t('create.info.type'), t(typeKey));
    y += 20;

    this.addInfoRow(leftX, valX, y, t('create.info.damage'), '10');
    y += 20;

    this.addInfoRow(leftX, valX, y, t('create.info.speed'), `${weapon.cooldown}s`);
    y += 20;

    this.addInfoRow(leftX, valX, y, t('create.info.range'), `${weapon.range}`);
    y += 20;

    const school = STAFF_SCHOOLS[wt];
    if (school) {
      this.addInfoRow(leftX, valX, y, t('create.info.school'), t(school), TC.ether2);
    } else {
      const effectStr = this.getEffectString(weapon);
      this.addInfoRow(leftX, valX, y, t('create.info.effect'), effectStr, TC.brass3);
    }
  }

  private addInfoRow(leftX: number, valX: number, y: number, label: string, value: string, valueColor: string = TC.text1) {
    this.infoPanel.add(this.add.text(leftX, y, label, {
      fontSize: '12px', fontFamily: '"Special Elite", monospace', color: TC.text2,
    }));
    this.infoPanel.add(this.add.text(valX, y, value, {
      fontSize: '12px', fontFamily: '"JetBrains Mono", monospace', color: valueColor,
    }));
  }

  private getEffectString(w: WeaponDef): string {
    if (w.weaponEffect) {
      const chance = Math.round((w.weaponEffectChance ?? 0) * 100);
      return `${chance}% ${t('effect.' + w.weaponEffect)}`;
    }
    if (w.weaponResetCooldownChance) {
      return `${Math.round(w.weaponResetCooldownChance * 100)}% ${t('effect.reset_cd')}`;
    }
    if (w.weaponDoubleDamageChance) {
      return `${Math.round(w.weaponDoubleDamageChance * 100)}% ${t('effect.double_damage')}`;
    }
    if (w.weaponSelfHealChance) {
      return `${Math.round(w.weaponSelfHealChance * 100)}% ${t('effect.self_heal')}`;
    }
    return '—';
  }

  // ── Buttons ───────────────────────────────────────

  private canStart(): boolean {
    return this.playerName.trim().length > 0 && this.selectedWeapons.length === 2;
  }

  private updateStartButton() {
    const ok = this.canStart();
    this.startBg.setFillStyle(ok ? THEME.ink2 : THEME.ink1, 0.9);
    this.startBg.setStrokeStyle(1, ok ? THEME.brass0 : THEME.ink4);
    this.startTxt.setColor(ok ? TC.text1 : TC.text3);
    if (ok) {
      this.startBg.setInteractive({ useHandCursor: true });
    } else {
      this.startBg.disableInteractive();
    }
  }

  private createActionButton(
    x: number, y: number, label: string, callback: () => void,
  ): { bg: Phaser.GameObjects.Rectangle; txt: Phaser.GameObjects.Text } {
    const bg = this.add.rectangle(x, y, 180, 44, THEME.ink2, 0.9);
    bg.setStrokeStyle(1, THEME.brass0);
    const txt = this.add.text(x, y, label, {
      fontSize: '16px', fontFamily: '"Special Elite", monospace', color: TC.text1,
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => { bg.setFillStyle(THEME.ink3); txt.setColor(TC.paper0); });
    bg.on('pointerout', () => { bg.setFillStyle(THEME.ink2); txt.setColor(TC.text1); });
    bg.on('pointerdown', callback);

    return { bg, txt };
  }

  // ── Start game ────────────────────────────────────

  private startNewGame() {
    if (!this.canStart()) return;
    const slotIndex = findFreeSlot();
    if (slotIndex === null) return;

    this.cleanup();

    const weapon1 = this.selectedWeapons[0];
    const weapon2 = this.selectedWeapons[1];
    const bodyId = `starter_${weapon1}`;

    setActiveSlot(slotIndex);
    saveCharacterMeta({
      slotIndex,
      name: this.playerName.trim(),
      bodyId,
      rank: 1,
      lastPlayed: Date.now(),
    });

    this.scene.start('GameScene', {
      isNewGame: true,
      starterBodyId: bodyId,
      starterWeapon1: weapon1,
      starterWeapon2: weapon2,
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
