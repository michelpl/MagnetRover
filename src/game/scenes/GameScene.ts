import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Rover } from '../entities/Rover';

export class GameScene extends Scene {
  private rover!: Rover;

  public constructor() {
    super('GameScene');
  }

  public create(): void {
    this.drawEmptyMap();

    this.rover = new Rover(
      this,
      GameConfig.map.width / 2,
      GameConfig.map.height / 2,
    );

    const { lerp } = GameConfig.camera;
    this.cameras.main.setBounds(0, 0, GameConfig.map.width, GameConfig.map.height);
    this.cameras.main.startFollow(this.rover, true, lerp, lerp);
  }

  public update(_time: number, delta: number): void {
    this.rover.updateRover(delta);
  }

  private drawEmptyMap(): void {
    const { width, height, gridSize, borderWidth } = GameConfig.map;
    const { mapFill, mapGrid, mapBorder } = GameConfig.colors;

    this.add.rectangle(width / 2, height / 2, width, height, mapFill);

    const grid = this.add.graphics();
    grid.lineStyle(1, mapGrid, 0.05);
    for (let x = 0; x <= width; x += gridSize) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      grid.lineBetween(0, y, width, y);
    }

    const border = this.add.graphics();
    border.lineStyle(borderWidth, mapBorder, 1);
    border.strokeRect(
      borderWidth / 2,
      borderWidth / 2,
      width - borderWidth,
      height - borderWidth,
    );
  }
}
