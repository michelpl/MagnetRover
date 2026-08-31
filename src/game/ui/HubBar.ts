import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { setContainerInteractive } from './setContainerInteractive';
import { bindViewResize, safeInsets, viewSize } from './viewSize';

export type HubTab = 'inventory' | 'stages' | 'garage';

const TABS: readonly HubTab[] = ['inventory', 'stages', 'garage'];

const SCENE_BY_TAB: Record<HubTab, string> = {
  inventory: 'InventoryScene',
  stages: 'MenuScene',
  garage: 'GarageScene',
};

const TEXTURE_BY_TAB: Record<HubTab, string> = {
  inventory: 'hub-shop',
  stages: 'hub-stages',
  garage: 'hub-garage',
};

const PRESS_SCALE = 0.92;
const IDLE_ALPHA = 0.82;
const ACTIVE_ALPHA = 1;

/** Camera-fixed hub bar: Inventory | Stages | Garage. */
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
    const btn = scene.add.container(x, y);
    const icon = scene.add.image(0, 0, TEXTURE_BY_TAB[tab]);
    icon.setDisplaySize(buttonSize, buttonSize);
    icon.setAlpha(isActive ? ACTIVE_ALPHA : IDLE_ALPHA);
    btn.add(icon);

    if (!isActive) {
      btn.setSize(buttonSize, buttonSize);
      setContainerInteractive(
        btn,
        new Geom.Rectangle(-buttonSize / 2, -buttonSize / 2, buttonSize, buttonSize),
        Geom.Rectangle.Contains,
      );
      btn.on('pointerdown', () => {
        scene.tweens.add({
          targets: btn,
          scaleX: PRESS_SCALE,
          scaleY: PRESS_SCALE,
          duration: 80,
        });
      });
      btn.on('pointerup', () => {
        scene.tweens.add({
          targets: btn,
          scaleX: 1,
          scaleY: 1,
          duration: 80,
        });
        scene.scene.start(SCENE_BY_TAB[tab]);
      });
    }

    return btn;
  }
}
