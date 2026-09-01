import { GameObjects, Scene } from 'phaser';
import { getWeaponDefinition } from '../config/Weapons';
import { GameConfig } from '../config/GameConfig';

/** Single-weapon loadout until more weapons are enabled. */
export class InventoryUI {
  private readonly root: GameObjects.Container;

  public constructor(scene: Scene, x: number, y: number) {
    this.root = scene.add.container(x, y);

    const def = getWeaponDefinition('laser_cannon');
    const title = scene.add
      .text(0, 0, 'Loadout', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '36px',
        color: '#74c0fc',
      })
      .setOrigin(0, 0);

    const bg = scene.add.rectangle(400, 100, 800, 140, 0x273b52, 0.95).setOrigin(0.5);
    bg.setStrokeStyle(2, 0x4dabf7, 0.6);

    const name = scene.add
      .text(24, 70, def.name, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        color: '#f8f9fa',
      })
      .setOrigin(0, 0.5);

    const hint = scene.add
      .text(24, 118, 'Auto-aims inside a 120° forward cone. Fires sequential laser dashes.', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '22px',
        color: '#adb5bd',
        wordWrap: { width: 752 },
      })
      .setOrigin(0, 0.5);

    this.root.add([title, bg, name, hint]);
  }

  public setOnChange(_handler: () => void): void {
    return;
  }

  public refresh(): void {
    return;
  }
}
