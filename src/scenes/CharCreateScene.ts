import Phaser from 'phaser';
import { GAME_WIDTH } from '../utils/constants';
import { setActiveSlot, findFreeSlot, saveCharacterMeta } from '../systems/saveLoad';
import { t } from '../i18n/index';
import { WeaponType } from '../types/bodies';
import { WEAPONS, WeaponDef, STRENGTH_WEAPONS, AGILITY_WEAPONS, INTELLECT_WEAPONS } from '../data/weapons';

const MAX_NAME_LENGTH = 16;

interface WeaponGroup {
  labelKey: string;
  color: number;
  statsDesc: string;
  weapons: WeaponType[];
}

const GROUPS: WeaponGroup[] = [
  { labelKey: 'create.group_str', color: 0xcc3333, statsDesc: '', weapons: STRENGTH_WEAPONS },
  { labelKey: 'create.group_agi', color: 0x33cc33, statsDesc: '', weapons: AGILITY_WEAPONS },
  { labelKey: 'create.group_int', color: 0x3366ff, statsDesc: '', weapons: INTELLECT_WEAPONS },
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
  private selectedWeapon: WeaponType | null = null;
  private cardBorders: Map<WeaponType, Phaser.GameObjects.Rectangle> = new Map();
  private cardBgs: Map<WeaponType, Phaser.GameObjects.Rectangle> = new Map();
  private infoPanel!: Phaser.GameObjects.Container;
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
    this.cardBorders.clear();
    this.cardBgs.clear();

    const cx = GAME_WIDTH / 2;

    // Title
    this.add.text(cx, 30, t('create.title'), {
      fontSize: '28px', color: '#66ccff',
      stroke: '#224466', strokeThickness: 3,
    }).setOrigin(0.5);

    // ── Name input ────────────────────────────────────
    this.add.text(280, 70, t('create.name'), {
      fontSize: '14px', color: '#778899',
    }).setOrigin(0.5);

    this.add.rectangle(280, 100, 280, 34, 0x1a1a2a, 0.9)
      .setStrokeStyle(1, 0x446688);

    this.nameDisplay = this.add.text(148, 92, '', {
      fontSize: '16px', color: '#ccddee',
    });

    this.nameCursor = this.add.rectangle(150, 100, 2, 22, 0xaaccee);

    this.keyHandler = (e: KeyboardEvent) => this.onKeyDown(e);
    window.addEventListener('keydown', this.keyHandler);

    // ── Weapon choice label ───────────────────────────
    this.add.text(280, 140, t('create.choose_weapon'), {
      fontSize: '14px', color: '#778899',
    }).setOrigin(0.5);

    // ── Weapon grid ───────────────────────────────────
    const CARD_W = 92;
    const CARD_H = 52;
    const GAP_X = 8;
    const GAP_Y = 8;
    const GRID_X = 40;
    const LABEL_W = 52;

    GROUPS.forEach((group, gi) => {
      const rowY = 175 + gi * (CARD_H + GAP_Y + 18);

      // Group label
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
    const weapon = WEAPONS[wt];
    const bg = this.add.rectangle(x, y, w, h, 0x1a1a2a, 0.9);
    const border = this.add.rectangle(x, y, w, h);
    border.setStrokeStyle(1, 0x333344);
    border.setFillStyle(0, 0);

    // Color stripe at top
    this.add.rectangle(x, y - h / 2 + 3, w - 4, 4, groupColor, 0.6);

    // Weapon name (short)
    this.add.text(x, y + 2, t(`weapon.${wt}`), {
      fontSize: '11px', color: '#bbccdd',
    }).setOrigin(0.5);

    // Damage number
    this.add.text(x, y + 17, `${weapon.baseDamage}`, {
      fontSize: '10px', color: '#667788',
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerdown', () => {
      this.selectedWeapon = wt;
      this.updateCardSelection();
      this.updateStartButton();
      this.buildInfoPanel(wt);
    });

    bg.on('pointerover', () => {
      if (this.selectedWeapon !== wt) {
        border.setStrokeStyle(1, 0x557799);
      }
      this.buildInfoPanel(wt);
    });

    bg.on('pointerout', () => {
      if (this.selectedWeapon !== wt) {
        border.setStrokeStyle(1, 0x333344);
      }
      if (this.selectedWeapon) {
        this.buildInfoPanel(this.selectedWeapon);
      } else {
        this.buildInfoPanelEmpty();
      }
    });

    this.cardBorders.set(wt, border);
    this.cardBgs.set(wt, bg);
  }

  private updateCardSelection() {
    for (const [wt, border] of this.cardBorders) {
      const bg = this.cardBgs.get(wt)!;
      if (wt === this.selectedWeapon) {
        border.setStrokeStyle(2, 0x66ccff);
        bg.setFillStyle(0x223344, 0.9);
      } else {
        border.setStrokeStyle(1, 0x333344);
        bg.setFillStyle(0x1a1a2a, 0.9);
      }
    }
  }

  // ── Info panel ────────────────────────────────────

  private buildInfoPanelEmpty() {
    this.infoPanel.removeAll(true);
    const bg = this.add.rectangle(175, 110, 340, 230, 0x1a1a2a, 0.7);
    bg.setStrokeStyle(1, 0x333344);
    this.infoPanel.add(bg);
    this.infoPanel.add(this.add.text(175, 110, t('create.info.hover'), {
      fontSize: '13px', color: '#445566',
    }).setOrigin(0.5));
  }

  private buildInfoPanel(wt: WeaponType) {
    this.infoPanel.removeAll(true);

    const weapon = WEAPONS[wt];
    const panelW = 340;
    const panelH = 230;
    const px = panelW / 2;
    const py = panelH / 2;

    // Background
    const bg = this.add.rectangle(px, py, panelW, panelH, 0x1a1a2a, 0.9);
    bg.setStrokeStyle(1, 0x446688);
    this.infoPanel.add(bg);

    // Group color
    const group = GROUPS.find(g => g.weapons.includes(wt))!;
    const groupHex = '#' + group.color.toString(16).padStart(6, '0');

    let y = 20;
    const leftX = 16;
    const valX = 170;

    // Weapon name
    this.infoPanel.add(this.add.text(px, y, t(`weapon.${wt}`), {
      fontSize: '18px', color: '#ccddee',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5));
    y += 28;

    // Separator
    this.infoPanel.add(this.add.rectangle(px, y, panelW - 20, 1, 0x334455));
    y += 12;

    // Type
    const typeKey = INTELLECT_WEAPONS.includes(wt) ? 'create.type.magic'
      : weapon.isMelee ? 'create.type.melee' : 'create.type.ranged';
    this.addInfoRow(leftX, valX, y, t('create.info.type'), t(typeKey));
    y += 20;

    // Damage
    this.addInfoRow(leftX, valX, y, t('create.info.damage'), `${weapon.baseDamage}`);
    y += 20;

    // Speed
    this.addInfoRow(leftX, valX, y, t('create.info.speed'), `${weapon.cooldown}s`);
    y += 20;

    // Range
    this.addInfoRow(leftX, valX, y, t('create.info.range'), `${weapon.range}`);
    y += 20;

    // Effect or School
    const school = STAFF_SCHOOLS[wt];
    if (school) {
      this.addInfoRow(leftX, valX, y, t('create.info.school'), t(school), '#aaaaff');
    } else {
      const effectStr = this.getEffectString(weapon);
      this.addInfoRow(leftX, valX, y, t('create.info.effect'), effectStr, '#eebb77');
    }
    y += 26;

    // Starting stats
    this.infoPanel.add(this.add.rectangle(px, y, panelW - 20, 1, 0x334455));
    y += 10;
    this.infoPanel.add(this.add.text(leftX, y, t('create.info.stats'), {
      fontSize: '11px', color: '#667788',
    }));
    y += 16;
    this.infoPanel.add(this.add.text(leftX, y, t('create.info.all_stats_10'), {
      fontSize: '13px', color: '#aabbcc',
    }));
  }

  private addInfoRow(leftX: number, valX: number, y: number, label: string, value: string, valueColor = '#ccddee') {
    this.infoPanel.add(this.add.text(leftX, y, label, {
      fontSize: '12px', color: '#778899',
    }));
    this.infoPanel.add(this.add.text(valX, y, value, {
      fontSize: '12px', color: valueColor,
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

  // ── Start game ────────────────────────────────────

  private startNewGame() {
    if (!this.canStart()) return;
    const slotIndex = findFreeSlot();
    if (slotIndex === null) return;

    this.cleanup();

    const bodyId = `starter_${this.selectedWeapon!}`;

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
