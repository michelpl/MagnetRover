import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { setContainerInteractive } from './setContainerInteractive';
import { drawNavyPanel } from './navyPanel';

/** Opens the shared settings modal. */
export class SettingsButton extends GameObjects.Container {
  public constructor(scene: Scene, fixedToCamera = false, onOpen?: () => void) {
    const { width } = GameConfig.viewport;
    const { gearSize, gearMarginRight, marginTop } = GameConfig.topControls;
    const x = width - gearMarginRight - gearSize / 2;
    const y = marginTop + gearSize / 2;
    super(scene, x, y);

    const panel = scene.add.graphics();
    drawNavyPanel(panel, gearSize, gearSize, 16);
    panel.setPosition(-gearSize / 2, -gearSize / 2);

    const gear = scene.add.image(0, 0, 'iconset', 'gear');
    gear.setDisplaySize(gearSize * 0.62, gearSize * 0.62);

    this.add([panel, gear]);
    this.setSize(gearSize, gearSize);
    setContainerInteractive(
      this,
      new Geom.Rectangle(-gearSize / 2, -gearSize / 2, gearSize, gearSize),
      Geom.Rectangle.Contains,
    );
    this.on('pointerdown', () => this.setScale(0.95));
    this.on('pointerout', () => this.setScale(1));
    this.on('pointerup', () => {
      this.setScale(1);
      onOpen?.();
    });

    if (fixedToCamera) {
      this.setScrollFactor(0);
    }
    this.setDepth(2100);
    scene.add.existing(this);
  }
}
