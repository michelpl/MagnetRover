import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { getWeaponDefinition, scaledLaserFireRateMs, type WeaponId } from '../config/Weapons';
import { Audio } from '../audio/Audio';
import { Haptics } from '../audio/Haptics';
import { Save, type SaveData } from '../save/Save';
import { Upgrades, type RoverUpgradeLine } from '../save/Upgrades';
import { drawNavyPanel } from './navyPanel';
import { setContainerInteractive } from './setContainerInteractive';

export type UpgradeCardKind =
  | { type: 'rover'; line: RoverUpgradeLine }
  | { type: 'weapon'; weaponId: WeaponId }
  | { type: 'cadence' };

/** One garage upgrade row for rover stats or weapon damage tiers. */
export class UpgradeCard {
  private readonly scene: Scene;
  private readonly kind: UpgradeCardKind;
  private readonly root: GameObjects.Container;
  private readonly baseX: number;
  private readonly titleText: GameObjects.Text;
  private readonly valueText: GameObjects.Text;
  private readonly costText: GameObjects.Text;
  private readonly plusText: GameObjects.Text;
  private readonly buyGfx: GameObjects.Graphics;
  private shaking = false;

  public constructor(
    scene: Scene,
    x: number,
    y: number,
    kind: UpgradeCardKind,
    onChange: () => void,
  ) {
    this.scene = scene;
    this.kind = kind;
    this.baseX = x;

    const { cardWidth, cardHeight, cardRadius, buySize } = GameConfig.garage;
    const panel = scene.add.graphics();
    drawNavyPanel(panel, cardWidth, cardHeight, cardRadius);

    this.titleText = scene.add
      .text(28, 24, this.cardTitle(), {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#f5f8fd',
      })
      .setOrigin(0, 0);

    const buyX = cardWidth - 28 - 166 - buySize;
    this.valueText = scene.add
      .text(buyX - 20, 58, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#f5f8fd',
      })
      .setOrigin(1, 0);

    this.buyGfx = scene.add.graphics();
    this.plusText = scene.add
      .text(buyX + buySize / 2, (cardHeight - buySize) / 2 + buySize / 2 - 3, '+', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '52px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.costText = scene.add
      .text(buyX + buySize + 48, cardHeight / 2, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#f5f8fd',
      })
      .setOrigin(0, 0.5);

    this.root = scene.add.container(x, y, [
      panel,
      this.titleText,
      this.valueText,
      this.buyGfx,
      this.plusText,
      this.costText,
    ]);
    this.root.setSize(cardWidth, cardHeight);
    setContainerInteractive(
      this.root,
      new Geom.Rectangle(0, 0, cardWidth, cardHeight),
      Geom.Rectangle.Contains,
    );
    this.root.setDepth(1000);
    this.root.on('pointerup', () => this.tryPurchase(onChange));
    this.refresh(Save.load());
  }

  public refresh(data: SaveData): void {
    const cost = this.nextCost(data);
    const maxed = cost === null;
    const affordable = cost !== null && data.coins >= cost;

    this.valueText.setText(this.valueLabel(data));
    this.drawBuy(maxed, affordable, cost);
  }

  private tryPurchase(onChange: () => void): void {
    const data = Save.load();
    if (this.nextCost(data) === null) {
      return;
    }
    const bought =
      this.kind.type === 'rover'
        ? Upgrades.purchaseRover(this.kind.line)
        : this.kind.type === 'weapon'
          ? Upgrades.purchaseWeapon(this.kind.weaponId)
          : Upgrades.purchaseCadence();
    if (!bought) {
      this.shake();
      return;
    }
    Haptics.vibrate(12);
    Audio.play('ui');
    this.scene.tweens.add({
      targets: this.root,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 80,
      yoyo: true,
    });
    onChange();
  }

  private shake(): void {
    if (this.shaking) {
      return;
    }
    this.shaking = true;
    Haptics.vibrate(8);
    this.scene.tweens.add({
      targets: this.root,
      x: this.baseX + 14,
      duration: 40,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.root.x = this.baseX;
        this.shaking = false;
      },
    });
  }

  private nextCost(data: SaveData): number | null {
    if (this.kind.type === 'rover') {
      return Upgrades.roverNextCost(this.kind.line, data.roverUpgrades);
    }
    if (this.kind.type === 'weapon') {
      return Upgrades.weaponNextCost(this.kind.weaponId, data);
    }
    return Upgrades.cadenceNextCost(data);
  }

  private valueLabel(data: SaveData): string {
    if (this.kind.type === 'rover') {
      const applied = Upgrades.getAppliedRover(data.roverUpgrades);
      if (this.kind.line === 'hp') {
        return String(applied.maxHp);
      }
      if (this.kind.line === 'speed') {
        return String(applied.speed);
      }
      return String(applied.armor);
    }
    if (this.kind.type === 'weapon') {
      const tier = Upgrades.weaponTier(this.kind.weaponId, data);
      return `Tier ${tier}`;
    }
    return `${scaledLaserFireRateMs(Upgrades.cadenceTier(data))} ms`;
  }

  private cardTitle(): string {
    if (this.kind.type === 'rover') {
      switch (this.kind.line) {
        case 'hp':
          return 'Rover HP';
        case 'speed':
          return 'Speed';
        case 'armor':
          return 'Armor';
        default: {
          const _exhaustive: never = this.kind.line;
          return _exhaustive;
        }
      }
    }
    if (this.kind.type === 'weapon') {
      return getWeaponDefinition(this.kind.weaponId).name;
    }
    return 'Laser cadence';
  }

  private drawBuy(maxed: boolean, affordable: boolean, cost: number | null): void {
    const { cardWidth, cardHeight, buySize, cardRadius, colors } = GameConfig.garage;
    const buyX = cardWidth - 28 - 166 - buySize;
    const buyY = (cardHeight - buySize) / 2;
    const fill = maxed || !affordable ? colors.buyDim : 0x55ad25;
    this.buyGfx.clear();
    this.buyGfx.fillStyle(fill, 1);
    this.buyGfx.fillRoundedRect(buyX, buyY, buySize, buySize, Math.min(16, cardRadius));
    this.plusText.setVisible(!maxed);
    this.plusText.setAlpha(affordable ? 1 : 0.4);
    if (maxed) {
      this.costText.setText('MAX');
      this.costText.setColor('#a9bbd4');
    } else {
      this.costText.setText(String(cost ?? 0));
      this.costText.setColor(affordable ? '#f5f8fd' : '#a9bbd4');
    }
  }
}
