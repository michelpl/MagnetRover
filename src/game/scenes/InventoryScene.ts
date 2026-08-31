import { Scene } from 'phaser';
import { Save } from '../save/Save';
import { HubBar } from '../ui/HubBar';
import { addCoverBackground } from '../ui/hubBackground';
import { InventoryUI } from '../ui/InventoryUI';
import { SettingsButton } from '../ui/SettingsButton';
import { SettingsModal } from '../ui/SettingsModal';
import { WalletBar } from '../ui/WalletBar';
import { viewSize } from '../ui/viewSize';

/** Equip up to four owned weapons before a run. */
export class InventoryScene extends Scene {
  private wallet!: WalletBar;

  public constructor() {
    super('InventoryScene');
  }

  public create(): void {
    const { width } = viewSize(this);

    addCoverBackground(this, 'stages-bg');

    this.wallet = new WalletBar(this);
    const settingsModal = new SettingsModal(this);
    new SettingsButton(this, false, () => settingsModal.show());

    const ui = new InventoryUI(this, (width - 800) / 2, 280);
    ui.setOnChange(() => this.refresh());
    this.refresh();

    new HubBar(this, 'inventory');
  }

  private refresh(): void {
    this.wallet.setCoins(Save.load().coins);
  }
}
