import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Camera-fixed loading UI displayed while the gameplay assets are fetched. */
export class SplashScreen {
  private readonly fill: GameObjects.Graphics;
  private readonly fillWidth: number;
  private progress = 0;

  public constructor(scene: Scene) {
    const { width, height } = GameConfig.viewport;
    const config = GameConfig.splash.progressBar;
    const left = (width - config.width) / 2;

    scene.add.image(width / 2, height / 2, 'splash-background');

    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000814, 0.7);
    shadow.fillRoundedRect(
      left - 4,
      config.y - (config.height + 8) / 2 + 5,
      config.width + 8,
      config.height + 8,
      config.radius + 4,
    );

    const track = scene.add.graphics();
    track.fillStyle(config.trackColor, 1);
    track.fillRoundedRect(left, config.y - config.height / 2, config.width, config.height, config.radius);
    track.lineStyle(3, config.trackStrokeColor, 0.9);
    track.strokeRoundedRect(left, config.y - config.height / 2, config.width, config.height, config.radius);

    this.fillWidth = config.width - config.padding * 2;
    this.fill = scene.add.graphics();
    this.drawFill(left + config.padding, config.y, 0);

    this.addLabel(scene, GameConfig.splash.loadingLabel, config.y + config.labelOffsetY, 38);
    this.addLabel(scene, GameConfig.splash.versionLabel, config.y + config.versionOffsetY, 25);
  }

  public setProgress(value: number): void {
    const nextProgress = Math.min(1, Math.max(this.progress, value));
    this.progress = nextProgress;
    const config = GameConfig.splash.progressBar;
    const left = (GameConfig.viewport.width - config.width) / 2;
    this.drawFill(left + config.padding, config.y, nextProgress);
  }

  private addLabel(scene: Scene, text: string, y: number, fontSize: number): void {
    const label = scene.add.text(GameConfig.viewport.width / 2, y, text, {
      color: `#${GameConfig.splash.progressBar.textColor.toString(16).padStart(6, '0')}`,
      fontFamily: GameConfig.ui.fontFamily,
      fontSize: `${fontSize}px`,
      fontStyle: '800',
      stroke: '#09264b',
      strokeThickness: 6,
    });
    label.setOrigin(0.5);
    label.setShadow(0, 4, '#000814', 0.85, false, true);
  }

  private drawFill(left: number, centerY: number, progress: number): void {
    const config = GameConfig.splash.progressBar;
    const width = this.fillWidth * progress;
    this.fill.clear();
    if (width <= 0) {
      return;
    }

    const height = config.height - config.padding * 2;
    const y = centerY - height / 2;
    const radius = height / 2;
    this.fill.fillStyle(config.fillColor, 1);
    this.fill.fillRoundedRect(left, y, width, height, Math.min(radius, width / 2));
    this.fill.fillStyle(config.fillHighlightColor, 0.45);
    this.fill.fillRoundedRect(
      left + config.padding,
      y + config.padding,
      Math.max(0, width - config.padding * 2),
      height * 0.34,
      Math.min(radius, width / 2),
    );
  }
}
