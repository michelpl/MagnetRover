import { Scene } from 'phaser';
import { GameConfig, isDebugMode } from '../config/GameConfig';
import type { LevelConfig } from '../config/LevelConfig';
import { getLevelById } from '../config/Levels';
import { Processor } from '../entities/Processor';
import { Rover } from '../entities/Rover';
import { Scrap } from '../entities/Scrap';
import { CargoSystem } from '../systems/CargoSystem';
import { DumpSystem } from '../systems/DumpSystem';
import { EnergySystem } from '../systems/EnergySystem';
import { MagnetSystem } from '../systems/MagnetSystem';
import { DebugSpeedButton } from '../ui/DebugSpeedButton';
import { VirtualJoystick } from '../ui/VirtualJoystick';

/** Prototype level until menu / level select exists. */
const ACTIVE_LEVEL_ID = 1;

export class GameScene extends Scene {
  private level!: LevelConfig;
  private rover!: Rover;
  private processor!: Processor;
  private scraps: Scrap[] = [];
  private cargoSystem!: CargoSystem;
  private magnetSystem!: MagnetSystem;
  private dumpSystem!: DumpSystem;
  private energySystem!: EnergySystem;
  private joystick!: VirtualJoystick;

  public constructor() {
    super('GameScene');
  }

  public create(): void {
    this.level = getLevelById(ACTIVE_LEVEL_ID);
    this.drawEmptyMap(this.level.mapWidth, this.level.mapHeight);

    this.rover = new Rover(
      this,
      this.level.mapWidth / 2,
      this.level.mapHeight / 2,
    );

    this.scraps = this.spawnLevelEntities(this.level);
    this.cargoSystem = new CargoSystem(this.rover, this.scraps);
    this.magnetSystem = new MagnetSystem(this.rover, this.scraps, this.cargoSystem);
    this.magnetSystem.setCanAttract(() => this.cargoSystem.canAccept());
    this.dumpSystem = new DumpSystem(
      this.rover,
      this.processor,
      this.cargoSystem,
      this.scraps,
    );
    this.energySystem = new EnergySystem(this.level.initialEnergy);

    this.joystick = new VirtualJoystick(this);

    const { lerp } = GameConfig.camera;
    this.cameras.main.setBounds(0, 0, this.level.mapWidth, this.level.mapHeight);
    this.cameras.main.startFollow(this.rover, true, lerp, lerp);

    if (isDebugMode) {
      new DebugSpeedButton(this, (active) => {
        this.rover.setSpeedBoostActive(active);
      });
    }
  }

  public update(_time: number, delta: number): void {
    const axis = this.joystick.getAxis();
    this.rover.setJoystickInput(axis.x, axis.y);
    this.rover.updateRover(delta);
    this.magnetSystem.update(delta);
    this.cargoSystem.update(delta);
    this.dumpSystem.update(delta);
    this.energySystem.update(delta, this.rover.isMoving);
  }

  /** Wire entities from LevelConfig — no attraction or dump math here. */
  private spawnLevelEntities(level: LevelConfig): Scrap[] {
    this.processor = new Processor(this, level.processor.x, level.processor.y);

    const scraps: Scrap[] = [];
    for (const scrap of level.scraps) {
      scraps.push(new Scrap(this, scrap.x, scrap.y, scrap.color, scrap.size));
    }
    return scraps;
  }

  private drawEmptyMap(width: number, height: number): void {
    const { gridSize, borderWidth } = GameConfig.map;
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
