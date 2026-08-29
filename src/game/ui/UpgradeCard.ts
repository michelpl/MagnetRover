import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Audio } from '../audio/Audio';
import { Haptics } from '../audio/Haptics';
import { Save, type SaveData } from '../save/Save';
import { Upgrades, type UpgradeLine } from '../save/Upgrades';
import { drawNavyPanel } from './navyPanel';
import { setContainerInteractive } from './setContainerInteractive';

/** One garage upgrade row: icon, current → next, pips, buy. */
export class UpgradeCard {
  private readonly scene: Scene;
  private readonly line: UpgradeLine;
  private readonly root: GameObjects.Container;
  private readonly baseX: number;
  private readonly levelText: GameObjects.Text;
  private readonly valueText: GameObjects.Text;
  private readonly costText: GameObjects.Text;
  private readonly plusText: GameObjects.Text;
  private readonly coinIcon: GameObjects.Image;
  private readonly buyGfx: GameObjects.Graphics;
  private readonly progressGfx: GameObjects.Graphics;
  private shaking = false;

  public constructor(scene: Scene, x: number, y: number, line: UpgradeLine, onChange: () => void) {
    this.scene = scene;
    this.line = line;
    this.baseX = x;

    const { cardWidth, cardHeight, cardRadius, iconSize, buySize } = GameConfig.garage;
    const panel = scene.add.graphics();
    drawNavyPanel(panel, cardWidth, cardHeight, cardRadius);

    const iconX = 28 + iconSize / 2;
    const iconName = lineIconFrame(line);
    const icon = scene.add.image(iconX, cardHeight / 2, 'garage-icons', iconName);
    icon.setDisplaySize(iconSize, iconSize);

    const textX = 28 + iconSize + 20;
    const title = scene.add
      .text(textX, 24, upgradeTitle(line), {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#f5f8fd',
      })
      .setOrigin(0, 0)
      .setShadow(0, 1, '#000000', 1, true, true);

    this.levelText = scene.add
      .text(textX, 58, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#caff00',
      })
      .setOrigin(0, 0);

    const costAreaWidth = 166;
    const buyX = cardWidth - 28 - costAreaWidth - buySize;
    const buyY = (cardHeight - buySize) / 2;
    this.valueText = scene.add
      .text(buyX - 20, 30, '', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#f5f8fd',
      })
      .setOrigin(1, 0);

    this.progressGfx = scene.add.graphics();
    this.buyGfx = scene.add.graphics();
    this.plusText = scene.add
      .text(buyX + buySize / 2, buyY + buySize / 2 - 3, '+', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '52px',
        fontStyle: 'bold',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setShadow(0, 3, '#0a3c16', 2, true, true);
    this.coinIcon = scene.add.image(buyX + buySize + 24, cardHeight / 2, 'iconset', 'coin');
    this.coinIcon.setDisplaySize(32, 32);
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
      icon,
      title,
      this.levelText,
      this.valueText,
      this.progressGfx,
      this.buyGfx,
      this.plusText,
      this.coinIcon,
      this.costText,
    ]);
    this.root.setSize(cardWidth, cardHeight);
    setContainerInteractive(
      this.root,
      new Geom.Rectangle(0, 0, cardWidth, cardHeight),
      Geom.Rectangle.Contains,
    );
    this.root.setDepth(1000);

    this.root.on('pointerup', () => {
      this.tryPurchase(onChange);
    });

    this.refresh(Save.load());
  }

  public refresh(data: SaveData): void {
    const current = Upgrades.getApplied(data.upgrades)[this.line];
    const cost = Upgrades.nextCost(this.line, data.upgrades);
    const maxed = Upgrades.isMaxed(this.line, data.upgrades);
    const affordable = cost !== null && data.coins >= cost && Upgrades.isEnabled();
    const level = data.upgrades[this.line] + 1;
    const values = GameConfig.upgrades[this.line].values;
    const max = values[values.length - 1];
    if (max === undefined) {
      throw new Error(`Missing maximum value for ${this.line} upgrade`);
    }

    this.levelText.setText(`LEVEL ${level}`);
    this.valueText.setText(`${current}/${max}`);
    this.drawProgress(level, GameConfig.upgrades[this.line].values.length);
    this.drawBuy(maxed, affordable, cost);
  }

  private tryPurchase(onChange: () => void): void {
    const data = Save.load();
    if (Upgrades.isMaxed(this.line, data.upgrades)) {
      return;
    }
    const bought = Upgrades.purchase(this.line);
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

  private drawProgress(level: number, levelCount: number): void {
    const { cardWidth, iconSize, buySize } = GameConfig.garage;
    const x = 28 + iconSize + 20;
    const buyX = cardWidth - 28 - 166 - buySize;
    const width = buyX - x - 28;
    const height = 16;
    const y = 92;
    const ratio = Math.max(0, Math.min(level / levelCount, 1));
    this.progressGfx.clear();
    this.progressGfx.fillStyle(0x02142c, 0.95);
    this.progressGfx.fillRoundedRect(x, y, width, height, height / 2);
    this.progressGfx.fillStyle(0x8ff000, 1);
    this.progressGfx.fillRoundedRect(x, y, width * ratio, height, height / 2);
  }

  private drawBuy(maxed: boolean, affordable: boolean, cost: number | null): void {
    const { cardWidth, cardHeight, buySize, cardRadius, colors } = GameConfig.garage;
    const buyX = cardWidth - 28 - 166 - buySize;
    const buyY = (cardHeight - buySize) / 2;
    const fill = maxed || !affordable ? colors.buyDim : 0x55ad25;
    this.buyGfx.clear();
    this.buyGfx.fillStyle(fill, 1);
    this.buyGfx.fillRoundedRect(buyX, buyY, buySize, buySize, Math.min(16, cardRadius));
    this.buyGfx.fillStyle(maxed || !affordable ? 0x304861 : 0x337f18, 0.8);
    this.buyGfx.fillRoundedRect(buyX + 4, buyY + buySize * 0.58, buySize - 8, buySize * 0.38, 10);
    this.buyGfx.lineStyle(3, maxed || !affordable ? 0x5f7890 : 0x9bea58, 0.95);
    this.buyGfx.strokeRoundedRect(buyX, buyY, buySize, buySize, Math.min(16, cardRadius));

    this.plusText.setVisible(!maxed);
    this.plusText.setAlpha(affordable ? 1 : 0.4);
    this.coinIcon.setVisible(!maxed);
    if (maxed) {
      this.costText.setText('MAX');
      this.costText.setColor('#a9bbd4');
      this.costText.setX(buyX + buySize + 20);
    } else {
      this.costText.setText(String(cost ?? 0));
      this.costText.setColor(affordable ? '#f5f8fd' : '#a9bbd4');
      this.costText.setX(buyX + buySize + 48);
    }
  }
}

function lineIconFrame(line: UpgradeLine): string {
  switch (line) {
    case 'capacity':
      return GameConfig.garage.lineIcons.capacity;
    case 'battery':
      return GameConfig.garage.lineIcons.battery;
    case 'speed':
      return GameConfig.garage.lineIcons.speed;
    case 'magnetRadius':
      return GameConfig.garage.lineIcons.magnetRadius;
    default: {
      const _exhaustive: never = line;
      return _exhaustive;
    }
  }
}

function upgradeTitle(line: UpgradeLine): string {
  switch (line) {
    case 'capacity':
      return 'Load';
    case 'battery':
      return 'Battery';
    case 'speed':
      return 'Speed';
    case 'magnetRadius':
      return 'Range';
    default: {
      const _exhaustive: never = line;
      return _exhaustive;
    }
  }
}
