import { GameObjects, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { pauseHitRect } from './hudHit';
import { bindViewResize } from './viewSize';

/**
 * Camera-fixed pause control (top-right, below settings).
 * Hit testing uses a Zone so it stays in unzoomed screen space.
 */
export class PauseButton extends GameObjects.Container {
  private readonly hit: GameObjects.Zone;

  public constructor(scene: Scene, onPause: () => void) {
    const rect = pauseHitRect(scene);
    super(scene, rect.left + rect.width / 2, rect.top + rect.height / 2);

    const pauseSize = GameConfig.hud.pauseSize;
    const bg = scene.add.graphics();
    bg.fillStyle(0x212529, 0.88);
    bg.fillRoundedRect(-pauseSize / 2, -pauseSize / 2, pauseSize, pauseSize, 12);
    bg.lineStyle(2, GameConfig.colors.mapBorder, 1);
    bg.strokeRoundedRect(-pauseSize / 2, -pauseSize / 2, pauseSize, pauseSize, 12);

    const barW = 10;
    const barH = 28;
    const gap = 10;
    const bars = scene.add.graphics();
    bars.fillStyle(0xf8f9fa, 1);
    bars.fillRoundedRect(-gap / 2 - barW, -barH / 2, barW, barH, 3);
    bars.fillRoundedRect(gap / 2, -barH / 2, barW, barH, 3);

    this.add([bg, bars]);
    this.setScrollFactor(0);
    this.setDepth(9_500);
    scene.add.existing(this);
    ignoreWorldCamera(scene, this);

    this.hit = scene.add.zone(this.x, this.y, pauseSize, pauseSize);
    this.hit.setScrollFactor(0);
    this.hit.setDepth(9_501);
    this.hit.setInteractive();
    this.hit.on('pointerdown', onPause);
    ignoreWorldCamera(scene, this.hit);

    bindViewResize(scene, () => this.layout());
  }

  public destroy(fromScene?: boolean): void {
    this.hit.destroy();
    super.destroy(fromScene);
  }

  private layout(): void {
    const rect = pauseHitRect(this.scene);
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    this.setPosition(x, y);
    this.hit.setPosition(x, y);
    this.hit.setSize(rect.width, rect.height);
    this.hit.setInteractive();
  }
}
