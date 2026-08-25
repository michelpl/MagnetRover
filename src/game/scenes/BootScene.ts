import { Scene } from 'phaser';

export class BootScene extends Scene {
  public constructor() {
    super('BootScene');
  }

  public create(): void {
    this.scene.start('MenuScene');
  }
}
