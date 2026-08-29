import { GameObjects, Scene } from 'phaser';

/** Single energy battery pickup — restores a fixed bonus once (US-034). */
export class EnergyPickup extends GameObjects.Container {
  public collected = false;

  public constructor(scene: Scene, x: number, y: number) {
    super(scene, x, y);
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x69db7c, 1);
    graphics.fillRoundedRect(-11, -17, 22, 34, 4);
    graphics.fillStyle(0x212529, 1);
    graphics.fillRect(-6, -21, 12, 5);
    graphics.lineStyle(2, 0xffffff, 0.45);
    graphics.strokeRoundedRect(-11, -17, 22, 34, 4);
    this.add(graphics);
    scene.add.existing(this);
  }

  public overlapsRover(x: number, y: number): boolean {
    const dx = this.x - x;
    const dy = this.y - y;
    return dx * dx + dy * dy <= 34 * 34;
  }
}
