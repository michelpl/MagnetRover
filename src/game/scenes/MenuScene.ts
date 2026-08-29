import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Save } from '../save/Save';
import { ensureGradientTextTexture } from '../ui/gradientText';
import { HubBar } from '../ui/HubBar';
import { addCoverBackground } from '../ui/hubBackground';
import {
  ensurePlayChromeTexture,
  ensurePlayShadowTexture,
  PLAY_BUTTON_HEIGHT,
  PLAY_BUTTON_WIDTH,
  playChromeKey,
  playShadowKey,
  playShadowLayout,
} from '../ui/playChrome';
import { setContainerInteractive } from '../ui/setContainerInteractive';
import { STAGE_CARD_HEIGHT, StageCarousel } from '../ui/StageCarousel';
import { SettingsButton } from '../ui/SettingsButton';
import { SettingsModal } from '../ui/SettingsModal';
import { WalletBar } from '../ui/WalletBar';

/** Title screen with one-stage carousel (US-021). */
export class MenuScene extends Scene {
  private carousel!: StageCarousel;
  private playButton!: GameObjects.Container;
  private playChrome!: GameObjects.Image;
  private playLabel!: GameObjects.Image;
  private playShadow!: GameObjects.Image;

  public constructor() {
    super('MenuScene');
  }

  public create(): void {
    const { width, height } = GameConfig.viewport;
    const save = Save.load();

    addCoverBackground(this, 'stages-bg');

    this.add
      .text(width / 2, 220, 'Magnet Rover', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '72px',
        color: '#74c0fc',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 310, 'Clear the scrap before energy runs out', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        color: '#adb5bd',
      })
      .setOrigin(0.5);

    const wallet = new WalletBar(this);
    wallet.setCoins(save.coins);
    const settingsModal = new SettingsModal(this);
    new SettingsButton(this, false, () => settingsModal.show());

    const carouselY = height / 2 - 40;
    this.carousel = new StageCarousel(this, save.currentLevel, carouselY);
    this.carousel.onSelectionChange = () => {
      this.refreshPlayButton();
    };

    const playY = carouselY + STAGE_CARD_HEIGHT / 2 + 200;
    this.buildPlayButton(width / 2, playY);
    this.refreshPlayButton();

    new HubBar(this, 'stages');
  }

  private buildPlayButton(x: number, y: number): void {
    const width = PLAY_BUTTON_WIDTH;
    const height = PLAY_BUTTON_HEIGHT;
    const pressScale = 0.96;
    this.playButton = this.add.container(x, y);

    ensurePlayShadowTexture(this);
    const shadow = playShadowLayout();
    this.playShadow = this.add.image(0, 0, playShadowKey());
    this.playShadow.setDisplaySize(shadow.width, shadow.height);
    this.playShadow.setOrigin(0.5, shadow.originY);

    ensurePlayChromeTexture(this, 'ready');
    ensurePlayChromeTexture(this, 'locked');
    this.playChrome = this.add.image(0, 0, playChromeKey('ready'));
    this.playChrome.setDisplaySize(width, height + 12);
    this.playChrome.setOrigin(0.5, height / 2 / (height + 12));

    const labelStyle = {
      fontFamily: GameConfig.ui.fontFamily,
      fontWeight: '600',
      fontSize: 46,
    };
    ensureGradientTextTexture(this, 'play-label-v6', 'PLAY', {
      ...labelStyle,
      topColor: '#ffffff',
      bottomColor: '#ffffff',
      strokeColor: '#d4921c',
      strokeWidth: 2,
      shadowColor: 'rgba(90, 40, 0, 0.42)',
      shadowOffsetY: 3,
      shadowBlur: 10,
    });
    ensureGradientTextTexture(this, 'play-label-locked-v6', 'PLAY', {
      ...labelStyle,
      topColor: '#ffffff',
      bottomColor: '#ffffff',
      strokeColor: '#7a8a9e',
      strokeWidth: 2,
      shadowColor: 'rgba(10, 16, 24, 0.35)',
      shadowOffsetY: 3,
      shadowBlur: 10,
    });
    this.playLabel = this.add.image(0, -2, 'play-label-v6');

    this.playButton.add([this.playShadow, this.playChrome, this.playLabel]);
    this.playButton.setSize(width, height);
    setContainerInteractive(
      this.playButton,
      new Geom.Rectangle(-width / 2, -height / 2, width, height),
      Geom.Rectangle.Contains,
    );
    this.playButton.on('pointerdown', () => {
      if (!this.carousel.isSelectedUnlocked) {
        return;
      }
      this.playButton.setScale(pressScale);
    });
    this.playButton.on('pointerout', () => {
      this.playButton.setScale(1);
    });
    this.playButton.on('pointerup', () => {
      this.playButton.setScale(1);
      this.startSelectedLevel();
    });
  }

  private refreshPlayButton(): void {
    const unlocked = this.carousel.isSelectedUnlocked;
    this.playChrome.setTexture(playChromeKey(unlocked ? 'ready' : 'locked'));
    this.playLabel.setTexture(unlocked ? 'play-label-v6' : 'play-label-locked-v6');
    this.playButton.setAlpha(unlocked ? 1 : 0.82);
  }

  private startSelectedLevel(): void {
    if (!this.carousel.isSelectedUnlocked) {
      return;
    }
    this.registry.set('activeLevelId', this.carousel.selectedLevelId);
    this.scene.start('GameScene');
  }
}
