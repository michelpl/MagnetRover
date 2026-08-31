import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { setContainerInteractive } from './setContainerInteractive';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

export type HubTab = 'shop' | 'stages' | 'garage';

const TABS: readonly HubTab[] = ['stages', 'garage'];

const SCENE_BY_TAB: Record<HubTab, string> = {
  shop: 'ShopScene',
  stages: 'MenuScene',
  garage: 'GarageScene',
};

const TEXTURE_BY_TAB: Record<HubTab, string> = {
  shop: 'hub-shop',
  stages: 'hub-stages',
  garage: 'hub-garage',
};

const PRESS_SCALE = 0.92;
const IDLE_ALPHA = 0.82;
const ACTIVE_ALPHA = 1;

/**
 * Camera-fixed stages / garage bar at the bottom of hub screens.
 */
export class HubBar extends GameObjects.Container {
  public constructor(scene: Scene, activeTab: HubTab) {
    const { buttonSize, spacing } = GameConfig.hub;
    super(scene, 0, 0);

    const startX = -((TABS.length - 1) * spacing) / 2;
    TABS.forEach((tab, column) => {
      this.add(this.buildButton(scene, tab, startX + column * spacing, 0, activeTab, buttonSize));
    });

    this.setScrollFactor(0);
    this.setDepth(3000);
    scene.add.existing(this);
    scene.children.bringToTop(this);
    bindViewResize(scene, () => this.layout());
  }

  private layout(): void {
    const { width, height } = viewSize(this.scene);
    const { marginBottom } = GameConfig.hub;
    const inset = safeInsets(this.scene);
    this.setPosition(width / 2, height - inset.bottom - marginBottom);
  }

  private buildButton(
    scene: Scene,
    tab: HubTab,
    x: number,
    y: number,
    activeTab: HubTab,
    buttonSize: number,
  ): GameObjects.Container {
    const isActive = tab === activeTab;
    const { hitRadius } = GameConfig.hub;
    const button = scene.add.container(x, y);

    const icon = scene.add.image(0, 0, TEXTURE_BY_TAB[tab]);
    icon.setDisplaySize(buttonSize, buttonSize);
    icon.setAlpha(isActive ? ACTIVE_ALPHA : IDLE_ALPHA);

    button.add(icon);
    button.setSize(hitRadius * 2, hitRadius * 2);
    setContainerInteractive(button, new Geom.Circle(0, 0, hitRadius), Geom.Circle.Contains);

    if (!isActive) {
      button.on('pointerdown', () => {
        icon.setDisplaySize(buttonSize * PRESS_SCALE, buttonSize * PRESS_SCALE);
      });
      button.on('pointerup', () => {
        icon.setDisplaySize(buttonSize, buttonSize);
        scene.scene.start(SCENE_BY_TAB[tab]);
      });
      button.on('pointerout', () => {
        icon.setDisplaySize(buttonSize, buttonSize);
      });
    }

    return button;
  }
}
