import { Geom, Scene } from 'phaser';
import { Audio } from '../audio/Audio';
import { GameConfig, isDebugMode } from '../config/GameConfig';
import type { LevelConfig } from '../config/LevelConfig';
import { getLevelById } from '../config/Levels';
import { Processor } from '../entities/Processor';
import { EnergyPickup } from '../entities/EnergyPickup';
import { Rover } from '../entities/Rover';
import { Scrap } from '../entities/Scrap';
import { CargoSystem } from '../systems/CargoSystem';
import { DumpSystem } from '../systems/DumpSystem';
import { EnergySystem } from '../systems/EnergySystem';
import { MagnetSystem } from '../systems/MagnetSystem';
import { ProgressSystem } from '../systems/ProgressSystem';
import { RegionClearSystem } from '../systems/RegionClearSystem';
import { RunState } from '../systems/RunState';
import { Save } from '../save/Save';
import { Upgrades } from '../save/Upgrades';
import { CargoIndicator } from '../ui/CargoIndicator';
import { CleanBar } from '../ui/CleanBar';
import { DebugSpeedButton } from '../ui/DebugSpeedButton';
import { EnergyBar } from '../ui/EnergyBar';
import { Minimap } from '../ui/Minimap';
import { PauseButton } from '../ui/PauseButton';
import { PauseModal } from '../ui/PauseModal';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { SettingsButton } from '../ui/SettingsButton';
import { SettingsModal } from '../ui/SettingsModal';
import { WalletBar } from '../ui/WalletBar';
import { bindPlayCameras } from '../cameras/GameCameras';
import type { ResultPayload } from './ResultScene';

/** Prototype level until menu / level select exists. */
const DEFAULT_LEVEL_ID = 1;

/** Delay so the last dump tween / burst can finish before ResultScene. */
const RESULT_DELAY_MS = 500;

export class GameScene extends Scene {
  private level!: LevelConfig;
  private rover!: Rover;
  private processor!: Processor;
  private scraps: Scrap[] = [];
  private energyPickups: EnergyPickup[] = [];
  private cargoSystem!: CargoSystem;
  private magnetSystem!: MagnetSystem;
  private dumpSystem!: DumpSystem;
  private energySystem!: EnergySystem;
  private progressSystem!: ProgressSystem;
  private regionClearSystem!: RegionClearSystem;
  private runState!: RunState;
  private energyBar!: EnergyBar;
  private cleanBar!: CleanBar;
  private cargoIndicator!: CargoIndicator;
  private minimap!: Minimap;
  private cargoCapacity: number = GameConfig.rover.capacity;
  private obstacleColliders: Geom.Rectangle[] = [];
  private joystick!: VirtualJoystick;
  private pauseModal!: PauseModal;
  private tutorial: TutorialOverlay | null = null;
  private settingsModal!: SettingsModal;
  private paused = false;
  private ending = false;

  public constructor() {
    super('GameScene');
  }

  public create(): void {
    Audio.bind(this);
    const save = Save.load();
    const applied = Upgrades.getApplied(save.upgrades);
    this.cargoCapacity = applied.capacity;

    const levelId =
      (this.registry.get('activeLevelId') as number | undefined) ??
      save.currentLevel ??
      DEFAULT_LEVEL_ID;
    this.registry.set('activeLevelId', levelId);
    this.level = getLevelById(levelId);
    this.registry.set('mapWidth', this.level.mapWidth);
    this.registry.set('mapHeight', this.level.mapHeight);
    this.drawEmptyMap(this.level.mapWidth, this.level.mapHeight);

    const spawnX = this.level.spawn?.x ?? this.level.mapWidth / 2;
    const spawnY = this.level.spawn?.y ?? this.level.mapHeight / 2;
    this.rover = new Rover(this, spawnX, spawnY);
    this.rover.setMoveSpeed(applied.speed);

    this.scraps = this.spawnLevelEntities(this.level);
    this.cargoSystem = new CargoSystem(this.rover, this.scraps, applied.capacity);
    this.cargoSystem.setProcessor(this.processor);
    this.magnetSystem = new MagnetSystem(this.rover, this.scraps, this.cargoSystem);
    this.magnetSystem.setMagnetRadius(applied.magnetRadius);
    this.magnetSystem.setCanAttract(() => this.cargoSystem.canAccept());
    this.energySystem = new EnergySystem(applied.battery);
    this.dumpSystem = new DumpSystem(
      this.rover,
      this.processor,
      this.cargoSystem,
      this.scraps,
    );
    this.progressSystem = new ProgressSystem(
      this.scraps,
      this.cargoSystem,
      this.dumpSystem,
      this.scraps.length,
    );
    this.regionClearSystem = new RegionClearSystem(this, this.scraps);
    this.dumpSystem.setOnProcessed(() => {
      this.regionClearSystem.check(this.scraps);
    });
    this.runState = new RunState();

    this.energyBar = new EnergyBar(this);
    this.cleanBar = new CleanBar(this);
    this.cargoIndicator = new CargoIndicator(this);
    this.minimap = new Minimap(this);
    this.minimap.updateMarkers(this.rover, this.scraps, this.energyPickups, this.processor);
    const wallet = new WalletBar(this, { fixedToCamera: true, depth: 2000 });
    wallet.setCoins(save.coins);
    this.settingsModal = new SettingsModal(this);
    new SettingsButton(this, true, () => this.settingsModal.show());

    this.joystick = new VirtualJoystick(this);
    this.pauseModal = new PauseModal(this, {
      onContinue: () => this.setPaused(false),
      onQuit: () => this.quitToMenu(),
    });
    new PauseButton(this, () => this.setPaused(true));

    if (isDebugMode) {
      new DebugSpeedButton(this, (active) => {
        this.rover.setSpeedBoostActive(active);
      });
    }

    bindPlayCameras(this, this.rover);

    if (this.level.id === 1 && !save.tutorialDone) {
      this.tutorial = new TutorialOverlay(this);
    }
  }

  public update(_time: number, delta: number): void {
    if (!this.runState.isPlaying || this.paused || this.settingsModal.isOpen) {
      return;
    }

    const axis = this.joystick.getAxis();
    this.rover.setJoystickInput(axis.x, axis.y);
    this.rover.updateRover(delta);
    this.rover.resolveSolidRect(this.processor.collider);
    for (const collider of this.obstacleColliders) {
      this.rover.resolveSolidRect(collider);
    }
    this.magnetSystem.update(delta);
    this.cargoSystem.update(delta);
    this.dumpSystem.update(delta);
    this.energySystem.update(delta, this.rover.isMoving);
    this.collectEnergyPickups();

    this.energyBar.setRatio(this.energySystem.ratio);
    this.cleanBar.setRatio(this.progressSystem.cleanupRatio);
    this.cargoIndicator.setCargo(this.cargoSystem.length, this.cargoCapacity);
    this.minimap.updateMarkers(this.rover, this.scraps, this.energyPickups, this.processor);
    this.syncTutorial();

    this.evaluateRunEnd();
  }

  private syncTutorial(): void {
    if (!this.tutorial?.isActive) {
      return;
    }

    this.tutorial.sync({
      moving: this.rover.isMoving,
      attracted: this.scraps.some((scrap) => scrap.state === 'Attracted'),
      queued: this.cargoSystem.length > 0,
      dumped: this.dumpSystem.processedTotal > 0,
    });
  }

  private setPaused(paused: boolean): void {
    if (this.ending) {
      return;
    }
    if (!this.runState.isPlaying && paused) {
      return;
    }

    this.paused = paused;
    if (paused) {
      this.joystick.release();
      this.rover.setJoystickInput(0, 0);
      this.tweens.pauseAll();
      this.time.paused = true;
      this.pauseModal.show();
    } else {
      this.time.paused = false;
      this.tweens.resumeAll();
      this.pauseModal.hide();
    }
  }

  private quitToMenu(): void {
    this.time.paused = false;
    this.tweens.resumeAll();
    this.joystick.release();
    this.rover.setJoystickInput(0, 0);
    this.scene.start('MenuScene');
  }

  private evaluateRunEnd(): void {
    if (this.ending || this.paused) {
      return;
    }

    if (
      this.progressSystem.remainingObjects === 0 &&
      this.progressSystem.carriedObjects === 0
    ) {
      this.endRun('Won');
      return;
    }

    if (this.energySystem.isEmpty) {
      this.endRun('Lost');
    }
  }

  private endRun(outcome: 'Won' | 'Lost'): void {
    if (this.ending) {
      return;
    }
    this.ending = true;

    if (outcome === 'Won') {
      this.runState.win();
    } else {
      this.runState.lose();
    }

    this.rover.setJoystickInput(0, 0);
    this.joystick.release();

    const payload: ResultPayload = {
      outcome,
      cleanPercentage: this.progressSystem.getCleanPercentage(),
      levelId: this.level.id,
      coinsEarned:
        outcome === 'Won'
          ? this.dumpSystem.processedTotal * GameConfig.coins.perScrap
          : 0,
    };
    this.registry.set('resultPayload', payload);
    this.registry.set('resultSettled', false);
    this.time.delayedCall(RESULT_DELAY_MS, () => {
      this.scene.start('ResultScene');
    });
  }

  private collectEnergyPickups(): void {
    const bonus = this.energySystem.maxEnergy * GameConfig.energy.pickupBonusRatio;
    for (const pickup of this.energyPickups) {
      if (pickup.collected) {
        continue;
      }
      if (pickup.overlapsRover(this.rover.x, this.rover.y)) {
        pickup.collected = true;
        this.energySystem.addEnergy(bonus);
        pickup.destroy();
      }
    }
  }

  /** Wire entities from LevelConfig — no attraction or dump math here. */
  private spawnLevelEntities(level: LevelConfig): Scrap[] {
    this.processor = new Processor(this, level.processor.x, level.processor.y);
    this.spawnObstacles(level);

    const scraps: Scrap[] = [];
    for (const scrap of level.scraps) {
      scraps.push(
        new Scrap(this, scrap.x, scrap.y, scrap.color, scrap.size, scrap.regionId ?? 0),
      );
    }

    this.energyPickups = [];
    for (const powerUp of level.powerUps ?? []) {
      if (powerUp.type === 'energy') {
        this.energyPickups.push(new EnergyPickup(this, powerUp.x, powerUp.y));
      }
    }
    return scraps;
  }

  private spawnObstacles(level: LevelConfig): void {
    this.obstacleColliders = [];
    for (const obstacle of level.obstacles ?? []) {
      this.obstacleColliders.push(
        new Geom.Rectangle(obstacle.x, obstacle.y, obstacle.width, obstacle.height),
      );

      const graphics = this.add.graphics();
      graphics.fillStyle(0x3d3d4a, 0.92);
      graphics.fillRoundedRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 8);
      graphics.lineStyle(2, 0x868e96, 0.8);
      graphics.strokeRoundedRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 8);
    }
  }

  private drawEmptyMap(width: number, height: number): void {
    const { mapFill } = GameConfig.colors;

    this.add.rectangle(width / 2, height / 2, width, height, mapFill);
    this.add
      .image(0, 0, 'scenario1')
      .setOrigin(0, 0)
      .setDisplaySize(width, height);
  }
}
