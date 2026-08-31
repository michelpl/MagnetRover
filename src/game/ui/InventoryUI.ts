import { GameObjects, Geom, Scene } from 'phaser';
import { getWeaponDefinition, WEAPON_IDS, type WeaponId } from '../config/Weapons';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';

/** Four-slot weapon loadout picker. */
export class InventoryUI {
  private readonly root: GameObjects.Container;
  private readonly slotLabels: GameObjects.Text[] = [];
  private readonly weaponButtons: GameObjects.Container[] = [];
  private onChange: () => void = () => undefined;

  public constructor(scene: Scene, x: number, y: number) {
    this.root = scene.add.container(x, y);

    const title = scene.add
      .text(0, 0, 'Loadout (4 slots)', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '36px',
        color: '#74c0fc',
      })
      .setOrigin(0, 0);

    for (let i = 0; i < 4; i += 1) {
      const slotY = 80 + i * 100;
      const label = scene.add
        .text(0, slotY, '', {
          fontFamily: GameConfig.ui.fontFamily,
          fontSize: '28px',
          color: '#f8f9fa',
        })
        .setOrigin(0, 0.5);
      this.slotLabels.push(label);

      const clearBtn = this.makeButton(scene, 720, slotY, 'Clear', () => this.equipSlot(i, null));
      this.root.add(clearBtn);
    }

    let weaponY = 520;
    for (const weaponId of WEAPON_IDS) {
      const btn = this.makeWeaponRow(scene, 0, weaponY, weaponId);
      this.weaponButtons.push(btn);
      weaponY += 72;
    }

    this.root.add([title, ...this.slotLabels, ...this.weaponButtons]);
    this.refresh();
  }

  public setOnChange(handler: () => void): void {
    this.onChange = handler;
  }

  public refresh(): void {
    const data = Save.load();
    for (let i = 0; i < 4; i += 1) {
      const weaponId = data.loadout[i];
      const name = weaponId ? getWeaponDefinition(weaponId).name : 'Empty';
      this.slotLabels[i]?.setText(`Slot ${i + 1}: ${name}`);
    }

    for (const btn of this.weaponButtons) {
      const weaponId = btn.getData('weaponId') as WeaponId;
      const owned = data.ownedWeapons.includes(weaponId);
      btn.setAlpha(owned ? 1 : 0.45);
    }
  }

  private equipSlot(index: number, weaponId: WeaponId | null): void {
    if (weaponId !== null) {
      const data = Save.load();
      if (!data.ownedWeapons.includes(weaponId)) {
        return;
      }
    }
    Save.setLoadoutSlot(index, weaponId);
    this.refresh();
    this.onChange();
  }

  private makeWeaponRow(
    scene: Scene,
    x: number,
    y: number,
    weaponId: WeaponId,
  ): GameObjects.Container {
    const def = getWeaponDefinition(weaponId);
    const row = scene.add.container(x, y);
    row.setData('weaponId', weaponId);

    const bg = scene.add.rectangle(400, 0, 800, 60, 0x273b52, 0.95).setOrigin(0.5);
    bg.setStrokeStyle(2, 0x4dabf7, 0.6);
    const label = scene.add
      .text(24, 0, def.name, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '26px',
        color: '#f8f9fa',
      })
      .setOrigin(0, 0.5);

    for (let slot = 0; slot < 4; slot += 1) {
      const equip = this.makeButton(scene, 520 + slot * 90, 0, `${slot + 1}`, () =>
        this.equipSlot(slot, weaponId),
      );
      row.add(equip);
    }

    row.add([bg, label]);
    return row;
  }

  private makeButton(
    scene: Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): GameObjects.Container {
    const btn = scene.add.container(x, y);
    const bg = scene.add.rectangle(0, 0, 72, 48, 0xffb00d, 1);
    const text = scene.add
      .text(0, 0, label, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '20px',
        color: '#0d0d10',
      })
      .setOrigin(0.5);
    btn.add([bg, text]);
    btn.setSize(72, 48);
    setContainerInteractive(
      btn,
      new Geom.Rectangle(-36, -24, 72, 48),
      Geom.Rectangle.Contains,
    );
    btn.on('pointerup', onClick);
    return btn;
  }
}

import { setContainerInteractive } from './setContainerInteractive';