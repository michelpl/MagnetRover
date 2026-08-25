import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { ScrapSize } from '../config/LevelConfig';

/** Lifecycle of a metallic cube (MVP §15). */
export type ScrapState = 'Idle' | 'Attracted' | 'Carried' | 'Processing';

function parseHexColor(hex: string): number {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  const value = Number.parseInt(normalized, 16);
  if (Number.isNaN(value)) {
    throw new Error(`Invalid scrap color: ${hex}`);
  }
  return value;
}

/**
 * Metallic cube collectible. Color and size are visual only — every cube counts as 1 object.
 * Starts Idle; MagnetSystem / CargoSystem own state transitions.
 */
export class Scrap extends GameObjects.Container {
  public state: ScrapState = 'Idle';
  public readonly color: string;
  public readonly size: ScrapSize;

  public constructor(
    scene: Scene,
    x: number,
    y: number,
    color: string,
    size: ScrapSize,
  ) {
    super(scene, x, y);
    this.color = color;
    this.size = size;
    this.drawCube();
    scene.add.existing(this);
  }

  private drawCube(): void {
    const side = GameConfig.scrap.sizePx[this.size];
    const fill = parseHexColor(this.color);
    const half = side / 2;
    const { cornerRadius, edgeHighlight } = GameConfig.scrap;

    const graphics = this.scene.add.graphics();
    graphics.fillStyle(fill, 1);
    graphics.fillRoundedRect(-half, -half, side, side, cornerRadius);
    graphics.lineStyle(2, edgeHighlight, 0.35);
    graphics.strokeRoundedRect(-half, -half, side, side, cornerRadius);
    this.add(graphics);
  }
}
