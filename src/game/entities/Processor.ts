import { GameObjects, Geom, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/**
 * Single dump landmark with a world-space processingArea for overlap tests (US-013).
 */
export class Processor extends GameObjects.Container {
  /** World-space dump zone; rebuild if the processor ever moves. */
  public readonly processingArea: Geom.Circle;

  public constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    this.processingArea = new Geom.Circle(x, y, GameConfig.processor.areaRadius);
    this.drawMachine();
    scene.add.existing(this);
  }

  /** True when a world point is inside the dump zone. */
  public containsPoint(x: number, y: number): boolean {
    return this.processingArea.contains(x, y);
  }

  /** Pulse landmark while cargo is full (US-025). */
  public setHintPulse(active: boolean): void {
    const scene = this.scene;
    if (active) {
      if (!scene.tweens.isTweening(this)) {
        scene.tweens.add({
          targets: this,
          scaleX: 1.08,
          scaleY: 1.08,
          duration: 320,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    } else {
      scene.tweens.killTweensOf(this);
      this.setScale(1);
    }
  }

  private drawMachine(): void {
    const { processorBody, processorAccent, processorPad } = GameConfig.colors;
    const { bodyWidth, bodyHeight, padRadius, areaRadius } = GameConfig.processor;
    const graphics = this.scene.add.graphics();

    graphics.fillStyle(processorPad, 0.25);
    graphics.fillCircle(0, 0, areaRadius);
    graphics.lineStyle(2, processorAccent, 0.55);
    graphics.strokeCircle(0, 0, areaRadius);

    graphics.fillStyle(processorPad, 0.45);
    graphics.fillCircle(0, 0, padRadius);

    graphics.fillStyle(processorBody, 1);
    graphics.fillRoundedRect(-bodyWidth / 2, -bodyHeight / 2, bodyWidth, bodyHeight, 10);

    graphics.fillStyle(processorAccent, 1);
    graphics.fillRect(-28, -bodyHeight / 2 - 12, 56, 14);
    graphics.fillCircle(0, 8, 18);

    graphics.lineStyle(3, 0xffffff, 0.5);
    graphics.strokeCircle(0, 8, 26);

    this.add(graphics);
  }
}
