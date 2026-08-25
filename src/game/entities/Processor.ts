import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Single dump landmark stub (US-007 spawn wiring).
 * processingArea + dump behavior land in US-012 / US-013.
 */
export class Processor extends GameObjects.Container {
  public constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.drawMachine();
    scene.add.existing(this);
  }

  private drawMachine(): void {
    const { processorBody, processorAccent, processorPad } = GameConfig.colors;
    const graphics = this.scene.add.graphics();

    graphics.fillStyle(processorPad, 0.45);
    graphics.fillCircle(0, 0, 70);

    graphics.fillStyle(processorBody, 1);
    graphics.fillRoundedRect(-48, -40, 96, 80, 10);

    graphics.fillStyle(processorAccent, 1);
    graphics.fillRect(-28, -52, 56, 14);
    graphics.fillCircle(0, 8, 18);

    graphics.lineStyle(3, 0xffffff, 0.5);
    graphics.strokeCircle(0, 8, 26);

    this.add(graphics);
  }
}
