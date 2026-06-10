import Phaser from 'phaser';
import { setActiveSlot, findFreeSlot, saveCharacterMeta } from '../systems/saveLoad';
import { WeaponType } from '../types/bodies';
import { showWeaponSelectDom, hideWeaponSelectDom } from '../ui/weaponSelectDom';

/**
 * Character creation scene — the entire UI is the DOM window
 * "Essence Weapon Select" (src/ui/weaponSelectDom.ts). The scene itself
 * only paints the dark background and bridges DOM callbacks to the
 * existing slot/save/scene-start flow.
 */
export class CharCreateScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharCreateScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#0c0a07');

    showWeaponSelectDom({
      onBack: () => {
        hideWeaponSelectDom();
        this.scene.start('TitleScene');
        this.scene.stop();
      },
      onCreate: (name, weapon1, weapon2) => {
        this.startNewGame(name, weapon1, weapon2);
      },
    });

    // Safety net: whatever shuts this scene down, the DOM goes with it.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => hideWeaponSelectDom());
  }

  // ── Start game (same contract as before) ──────────────────

  private startNewGame(name: string, weapon1: WeaponType, weapon2: WeaponType) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const slotIndex = findFreeSlot();
    if (slotIndex === null) return;

    hideWeaponSelectDom();

    const bodyId = `starter_${weapon1}`;

    setActiveSlot(slotIndex);
    saveCharacterMeta({
      slotIndex,
      name: trimmed,
      bodyId,
      rank: 1,
      lastPlayed: Date.now(),
    });

    this.scene.start('GameScene', {
      isNewGame: true,
      starterBodyId: bodyId,
      starterWeapon1: weapon1,
      starterWeapon2: weapon2,
      characterName: trimmed,
    });
    this.scene.start('UIScene');
    this.scene.stop();
  }
}
