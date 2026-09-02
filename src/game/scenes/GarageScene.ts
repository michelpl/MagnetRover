import { Scene } from 'phaser';
import { WEAPON_IDS } from '../config/Weapons';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';
import { HubBar } from '../ui/HubBar';
import { addCoverBackground } from '../ui/hubBackground';
import { UpgradeCard } from '../ui/UpgradeCard';
import { WalletBar } from '../ui/WalletBar';
import { SettingsButton } from '../ui/SettingsButton';
import { SettingsModal } from '../ui/SettingsModal';
import { viewSize } from '../ui/viewSize';

/** Spend coins on rover and weapon upgrades — hub Garage tab. */
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
    const lines = [
      { type: 'rover' as const, line: 'hp' as const },
      { type: 'rover' as const, line: 'speed' as const },
      { type: 'rover' as const, line: 'armor' as const },
      ...WEAPON_IDS.map((weaponId) => ({ type: 'weapon' as const, weaponId })),
      { type: 'cadence' as const },
    ];

    this.cards = lines.map(
      (kind, index) =>
        new UpgradeCard(this, cardX, cardsTop + index * (cardHeight + cardGap), kind, () =>
          this.refresh(),
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
