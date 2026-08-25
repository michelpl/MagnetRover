import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Title screen: Play starts the current level (US-021). */
export class MenuScene extends Scene {
  public constructor() {
    super('MenuScene');
  }

  public create(): void {
    const { width, height } = GameConfig.viewport;

    this.add.rectangle(width / 2, height / 2, width, height, GameConfig.colors.background);

    this.add
      .text(width / 2, height / 2 - 200, 'Magnet Rover', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '72px',
        color: '#74c0fc',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 100, 'Clear the scrap before energy runs out', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#adb5bd',
      })
      .setOrigin(0.5);

    const playBg = this.add
      .rectangle(width / 2, height / 2 + 80, 360, 90, GameConfig.colors.magnetGlow, 1)
      .setInteractive({ useHandCursor: true });
    const playText = this.add
      .text(width / 2, height / 2 + 80, 'Play', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '40px',
        color: '#0d0d10',
      })
      .setOrigin(0.5);

    const startGame = (): void => {
      const levelId = (this.registry.get('activeLevelId') as number | undefined) ?? 1;
      this.registry.set('activeLevelId', levelId);
      this.scene.start('GameScene');
    };

    playBg.on('pointerup', startGame);
    playText.setInteractive({ useHandCursor: true }).on('pointerup', startGame);
  }
}
