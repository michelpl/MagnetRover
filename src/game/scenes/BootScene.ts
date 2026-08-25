import { Scene } from 'phaser';
import { Audio } from '../audio/Audio';

export class BootScene extends Scene {
  public constructor() {
    super('BootScene');
  }

  public create(): void {
    Audio.bind(this);
    this.scene.start('MenuScene');
  }
}
