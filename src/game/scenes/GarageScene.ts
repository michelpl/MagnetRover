import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';
import { type UpgradeLine } from '../save/Upgrades';
import { HubBar } from '../ui/HubBar';
import { addCoverBackground } from '../ui/hubBackground';
import { UpgradeCard } from '../ui/UpgradeCard';
import { WalletBar } from '../ui/WalletBar';
import { SettingsButton } from '../ui/SettingsButton';
import { SettingsModal } from '../ui/SettingsModal';
import { viewSize } from '../ui/viewSize';

const UPGRADE_LINES: readonly UpgradeLine[] = ['capacity', 'battery', 'speed', 'magnetRadius'];

/** Spend coins on rover upgrades — hub Garage tab. */
export class GarageScene extends Scene {
  private wallet!: WalletBar;
  private cards: UpgradeCard[] = [];

  public constructor() {
    super('GarageScene');
  }

  public create(): void {
    const { width } = viewSize(this);
    const { cardsTop, cardWidth, cardHeight, cardGap } = GameConfig.garage;

    addCoverBackground(this, 'garage-bg');

    this.wallet = new WalletBar(this);
    const settingsModal = new SettingsModal(this);
    new SettingsButton(this, false, () => settingsModal.show());
    const cardX = (width - cardWidth) / 2;
    this.cards = UPGRADE_LINES.map(
      (line, index) =>
        new UpgradeCard(
          this,
          cardX,
          cardsTop + index * (cardHeight + cardGap),
          line,
          () => this.refresh(),
        ),
    );

    this.refresh();
    new HubBar(this, 'garage');
  }

  private refresh(): void {
    const data = Save.load();
    this.wallet.setCoins(data.coins);
    for (const card of this.cards) {
      card.refresh(data);
    }
  }
}
