import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { setContainerInteractive } from './setContainerInteractive';

/**
 * Camera-fixed pause control (top-right, below cargo) so it stays clear of HUD bars.
 */
export class PauseButton extends GameObjects.Container {
  public constructor(scene: Scene, onPause: () => void) {
    const { marginX, pauseSize } = GameConfig.hud;
    const { gearSize, marginTop, pauseGapBelowGear } = GameConfig.topControls;
    const x = GameConfig.viewport.width - marginX - pauseSize / 2;
    const y = marginTop + gearSize + pauseGapBelowGear + pauseSize / 2;
    super(scene, x, y);

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
    this.setSize(pauseSize, pauseSize);
    setContainerInteractive(
      this,
      new Geom.Rectangle(-pauseSize / 2, -pauseSize / 2, pauseSize, pauseSize),
      Geom.Rectangle.Contains,
    );
    this.on('pointerup', onPause);

    this.setScrollFactor(0);
    this.setDepth(2100);
    scene.add.existing(this);
  }
}
