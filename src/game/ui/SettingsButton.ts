import { GameObjects, Geom, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { settingsHitRect } from './hudHit';
import { setContainerInteractive } from './setContainerInteractive';
import { drawNavyPanel } from './navyPanel';
import { bindViewResize } from './viewSize';

/** Opens the shared settings modal. */
export class SettingsButton extends GameObjects.Container {
  public constructor(scene: Scene, fixedToCamera = false, onOpen?: () => void) {
    const rect = settingsHitRect(scene);
    super(scene, rect.left + rect.width / 2, rect.top + rect.height / 2);

    const { gearSize } = GameConfig.topControls;
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
      ignoreWorldCamera(scene, this);
    }
    this.setDepth(2100);
    scene.add.existing(this);
    bindViewResize(scene, () => this.layout());
  }

  private layout(): void {
    const rect = settingsHitRect(this.scene);
    this.setPosition(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }
}
