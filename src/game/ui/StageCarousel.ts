import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { isLevelUnlocked, levels } from '../config/Levels';
import { addGradientText } from './gradientText';
import { setContainerInteractive } from './setContainerInteractive';
import { viewSize } from './viewSize';

const SLIDE_MS = 250;
export const STAGE_CARD_WIDTH = 520;
export const STAGE_CARD_HEIGHT = 760;
const CARD_RADIUS = 48;
const CARD_FILL = 0x051630;
const CARD_FILL_ALPHA = 0.42;
const CARD_GLOW = 0x00b4ff;
const CARD_INNER = 0x4db8ff;
const CARD_TAB = 0x5ee2ff;
const ARROW_FRAME_WIDTH = 256;
const ARROW_FRAME_HEIGHT = 384;
const ARROW_DISPLAY_WIDTH = 96;
const ARROW_DISPLAY_HEIGHT = Math.round(
  (ARROW_DISPLAY_WIDTH * ARROW_FRAME_HEIGHT) / ARROW_FRAME_WIDTH,
);
const ARROW_PRESS_SCALE = 0.92;
const GLOW_PAD = 36;
const STAGE_FONT = {
  fontFamily: GameConfig.ui.fontFamily,
  fontWeight: '350',
  topColor: '#E7F6FF',
  bottomColor: '#3B8FD9',
  strokeColor: '#062038',
  innerStrokeColor: '#9AE8FF',
  shadowColor: 'rgba(9, 27, 70, 0.62)',
  shadowOffsetX: 4,
  shadowOffsetY: 7,
  bevelPx: 1,
  bevelLight: 'rgba(255, 255, 255, 0.7)',
  bevelDark: 'rgba(4, 20, 48, 0.8)',
} as const;

/**
 * One-stage-at-a-time picker with side arrows and a horizontal slide tween.
 */
export class StageCarousel {
  private readonly scene: Scene;
  private readonly currentLevel: number;
  private readonly spacing: number;
  private readonly track: GameObjects.Container;
  private readonly leftArrow: GameObjects.Container;
  private readonly rightArrow: GameObjects.Container;
  private selectedIndex: number;
  private sliding = false;

  public constructor(scene: Scene, currentLevel: number, centerY: number) {
    this.scene = scene;
    this.currentLevel = currentLevel;
    this.spacing = viewSize(scene).width;

    const startId = Math.min(Math.max(currentLevel, 1), levels.length);
    this.selectedIndex = Math.max(
      0,
      levels.findIndex((level) => level.id === startId),
    );

    const { width } = viewSize(scene);
    const centerX = width / 2;

    this.track = scene.add.container(centerX - this.selectedIndex * this.spacing, centerY);
    levels.forEach((level, index) => {
      this.track.add(this.buildCard(level.id, index * this.spacing, 0));
    });

    const maskShape = scene.add.rectangle(
      centerX,
      centerY,
      STAGE_CARD_WIDTH + GLOW_PAD * 2,
      STAGE_CARD_HEIGHT + GLOW_PAD * 2,
      0xffffff,
    );
    maskShape.setVisible(false);
    this.track.enableFilters();
    const filters = this.track.filters;
    if (!filters) {
      throw new Error('WebGL filters are required to clip the stage carousel');
    }
    filters.external.addMask(maskShape);

    this.leftArrow = this.buildArrow(96, centerY, -1);
    this.rightArrow = this.buildArrow(width - 96, centerY, 1);
    this.refreshArrows();
  }

  public onSelectionChange: (() => void) | null = null;

  public get selectedLevelId(): number {
    return levels[this.selectedIndex]?.id ?? 1;
  }

  public get isSelectedUnlocked(): boolean {
    return isLevelUnlocked(this.selectedLevelId, this.currentLevel);
  }

  private buildCard(levelId: number, x: number, y: number): GameObjects.Container {
    const card = this.scene.add.container(x, y);
    const left = -STAGE_CARD_WIDTH / 2;
    const top = -STAGE_CARD_HEIGHT / 2;
    const right = STAGE_CARD_WIDTH / 2;

    const bg = this.scene.add.graphics();
    bg.fillStyle(CARD_FILL, CARD_FILL_ALPHA);
    bg.fillRoundedRect(left, top, STAGE_CARD_WIDTH, STAGE_CARD_HEIGHT, CARD_RADIUS);
    bg.lineStyle(22, CARD_GLOW, 0.1);
    bg.strokeRoundedRect(left, top, STAGE_CARD_WIDTH, STAGE_CARD_HEIGHT, CARD_RADIUS);
    bg.lineStyle(12, CARD_GLOW, 0.28);
    bg.strokeRoundedRect(left, top, STAGE_CARD_WIDTH, STAGE_CARD_HEIGHT, CARD_RADIUS);
    bg.lineStyle(4, CARD_GLOW, 1);
    bg.strokeRoundedRect(left, top, STAGE_CARD_WIDTH, STAGE_CARD_HEIGHT, CARD_RADIUS);
    bg.lineStyle(2, CARD_INNER, 0.55);
    bg.strokeRoundedRect(left + 10, top + 10, STAGE_CARD_WIDTH - 20, STAGE_CARD_HEIGHT - 20, CARD_RADIUS - 10);

    const tabW = 12;
    const tabH = 64;
    bg.fillStyle(CARD_TAB, 1);
    bg.fillRoundedRect(left - 4, -tabH / 2, tabW, tabH, 4);
    bg.fillRoundedRect(right - 8, -tabH / 2, tabW, tabH, 4);

    const numberY = 28;
    const headerY = numberY - 118;
    const lineW = 78;
    const gap = 78;
    bg.lineStyle(3, CARD_GLOW, 0.95);
    bg.beginPath();
    bg.moveTo(-gap - lineW, headerY);
    bg.lineTo(-gap, headerY);
    bg.moveTo(gap, headerY);
    bg.lineTo(gap + lineW, headerY);
    bg.strokePath();

    const stageLabel = addGradientText(this.scene, 0, headerY, 'stage-label-v6', 'STAGE', {
      ...STAGE_FONT,
      fontSize: 36,
      strokeWidth: 6,
      innerStrokeWidth: 3,
    });
    const padded = String(levelId).padStart(2, '0');
    const number = addGradientText(this.scene, 0, numberY, `stage-num-v6-${padded}`, padded, {
      ...STAGE_FONT,
      fontSize: 168,
      strokeWidth: 10,
      innerStrokeWidth: 5,
    });

    card.add([bg, stageLabel, number]);
    return card;
  }

  private buildArrow(x: number, y: number, direction: -1 | 1): GameObjects.Container {
    const w = ARROW_DISPLAY_WIDTH;
    const h = ARROW_DISPLAY_HEIGHT;
    const arrow = this.scene.add.container(x, y);
    const icon = this.scene.add.image(0, 0, 'stage-arrows', direction < 0 ? 0 : 1);
    icon.setDisplaySize(w, h);

    arrow.add(icon);
    arrow.setSize(w, h);
    setContainerInteractive(
      arrow,
      new Geom.Rectangle(-w / 2, -h / 2, w, h),
      Geom.Rectangle.Contains,
    );
    arrow.on('pointerdown', () => {
      icon.setDisplaySize(w * ARROW_PRESS_SCALE, h * ARROW_PRESS_SCALE);
    });
    arrow.on('pointerout', () => {
      icon.setDisplaySize(w, h);
    });
    arrow.on('pointerup', () => {
      icon.setDisplaySize(w, h);
      this.go(direction);
    });
    this.scene.add.existing(arrow);
    return arrow;
  }

  private go(direction: -1 | 1): void {
    if (this.sliding) {
      return;
    }
    const next = this.selectedIndex + direction;
    if (next < 0 || next >= levels.length) {
      return;
    }
    this.selectedIndex = next;
    this.sliding = true;
    this.refreshArrows();
    this.onSelectionChange?.();
    const { width } = viewSize(this.scene);
    this.scene.tweens.add({
      targets: this.track,
      x: width / 2 - this.selectedIndex * this.spacing,
      duration: SLIDE_MS,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.sliding = false;
      },
    });
  }

  private refreshArrows(): void {
    this.leftArrow.setAlpha(this.selectedIndex <= 0 ? 0.28 : 1);
    this.rightArrow.setAlpha(this.selectedIndex >= levels.length - 1 ? 0.28 : 1);
  }
}
