import { Geom, Scene } from 'phaser';
import { Audio } from '../audio/Audio';
import { GameConfig, isDebugMode } from '../config/GameConfig';
import { getStageById } from '../config/Stages';
import type { StageConfig } from '../config/StageConfig';
import { totalWaveEnemies } from '../config/Stages';
import { Enemy } from '../entities/Enemy';
import { Rover } from '../entities/Rover';
import { CombatSystem } from '../systems/CombatSystem';
import { HpSystem } from '../systems/HpSystem';
import { RunState } from '../systems/RunState';
import { WaveSpawnSystem } from '../systems/WaveSpawnSystem';
import { WeaponSystem } from '../systems/WeaponSystem';
import { Save } from '../save/Save';
import { Upgrades } from '../save/Upgrades';
import { DebugSpeedButton } from '../ui/DebugSpeedButton';
import { HpBar } from '../ui/HpBar';
import { Minimap } from '../ui/Minimap';
import { PauseButton } from '../ui/PauseButton';
import { PauseModal } from '../ui/PauseModal';
import { VirtualJoystick } from '../ui/VirtualJoystick';
import { TutorialOverlay, type TutorialSignals } from '../ui/TutorialOverlay';
import { SettingsButton } from '../ui/SettingsButton';
import { SettingsModal } from '../ui/SettingsModal';
import { WalletBar } from '../ui/WalletBar';
import { WaveIndicator } from '../ui/WaveIndicator';
import { bindPlayCameras } from '../cameras/GameCameras';
import type { ResultPayload } from './ResultScene';

const DEFAULT_STAGE_ID = 1;
const RESULT_DELAY_MS = 400;

export class GameScene extends Scene {
  private stage!: StageConfig;
  private rover!: Rover;
  private enemies: Enemy[] = [];
  private hpSystem!: HpSystem;
  private combatSystem!: CombatSystem;
  private weaponSystem!: WeaponSystem;
  private waveSpawnSystem!: WaveSpawnSystem;
  private runState!: RunState;
  private hpBar!: HpBar;
  private waveIndicator!: WaveIndicator;
  private minimap!: Minimap;
  private obstacleColliders: Geom.Rectangle[] = [];
  private joystick!: VirtualJoystick;
  private pauseModal!: PauseModal;
  private tutorial: TutorialOverlay | null = null;
  private settingsModal!: SettingsModal;
  private paused = false;
  private ending = false;
  private roverFlashMs = 0;
  private saveData = Save.load();

  public constructor() {
    super('GameScene');
  }

  public create(): void {
    this.ending = false;
    this.paused = false;
    this.roverFlashMs = 0;
    this.time.paused = false;
    this.saveData = Save.load();

    Audio.bind(this);
    const save = this.saveData;
    const roverStats = Upgrades.getAppliedRover(save.roverUpgrades);

    const stageId =
      (this.registry.get('activeLevelId') as number | undefined) ??
      save.currentLevel ??
      DEFAULT_STAGE_ID;
    this.registry.set('activeLevelId', stageId);
    this.stage = getStageById(stageId);
    this.registry.set('mapWidth', this.stage.mapWidth);
    this.registry.set('mapHeight', this.stage.mapHeight);
    this.drawMap(this.stage);

    const spawnX = this.stage.spawn?.x ?? this.stage.mapWidth / 2;
    const spawnY = this.stage.spawn?.y ?? this.stage.mapHeight / 2;
    this.rover = new Rover(this, spawnX, spawnY);
    this.rover.setMoveSpeed(roverStats.speed);

    this.hpSystem = new HpSystem({
      maxHp: roverStats.maxHp,
      armor: roverStats.armor,
    });
    this.combatSystem = new CombatSystem(this.rover, this.hpSystem, {
      onEnemyKilled: () => undefined,
      onRoverDamaged: () => {
        this.roverFlashMs = GameConfig.survival.roverDamageFlashMs;
      },
      onKillShake: () => this.shakeCamera(),
    });

    this.runState = new RunState();
    this.enemies = [];

    this.waveSpawnSystem = new WaveSpawnSystem(
      this,
      this.stage,
      this.rover,
      (x, y, recipe) => {
        const enemy = new Enemy(this, x, y, recipe);
        this.enemies.push(enemy);
        return enemy;
      },
    );
    this.combatSystem.initRemaining(totalWaveEnemies(this.stage.wave));

    this.weaponSystem = new WeaponSystem(
      this,
      this.rover,
      this.combatSystem,
      save.loadout,
      save.weaponUpgrades,
      this.obstacleColliders,
    );

    this.hpBar = new HpBar(this);
    this.waveIndicator = new WaveIndicator(this);
    this.minimap = new Minimap(this);
    this.minimap.updateEnemies(this.rover, this.enemies);

    const wallet = new WalletBar(this, { fixedToCamera: true, depth: 2000 });
    wallet.setCoins(save.coins);
    this.settingsModal = new SettingsModal(this);
    new SettingsButton(this, true, () => this.settingsModal.show());

    this.input.setTopOnly(true);
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

    if (this.stage.id === 1 && !save.tutorialDone) {
      this.tutorial = new TutorialOverlay(this);
    }

    this.events.once('shutdown', () => {
      this.weaponSystem?.dispose();
    });
  }

  public shutdown(): void {
    this.weaponSystem?.dispose();
  }

  public update(_time: number, delta: number): void {
    if (!this.runState.isPlaying || this.paused || this.settingsModal.isOpen) {
      return;
    }

    const axis = this.joystick.getAxis();
    this.rover.setJoystickInput(axis.x, axis.y);
    this.rover.updateRover(delta);
    for (const collider of this.obstacleColliders) {
      this.rover.resolveSolidRect(collider);
    }

    this.hpSystem.update(delta);
    this.waveSpawnSystem.update(delta);

    for (const enemy of this.enemies) {
      if (enemy.active) {
        enemy.updateChase(
          delta,
          this.rover.x,
          this.rover.y,
          this.stage.mapWidth,
          this.stage.mapHeight,
        );
      }
    }

    this.combatSystem.updateContact(this.enemies);
    this.weaponSystem.update(
      delta,
      this.enemies,
      this.stage.mapWidth,
      this.stage.mapHeight,
      this.saveData.weaponUpgrades,
    );

    this.hpBar.setRatio(this.hpSystem.ratio);
    this.waveIndicator.setRemaining(this.combatSystem.remainingEnemies);
    this.minimap.updateEnemies(this.rover, this.enemies);
    this.syncTutorial();
    this.updateRoverFlash(delta);
    this.evaluateRunEnd();
  }

  private syncTutorial(): void {
    if (!this.tutorial?.isActive) {
      return;
    }
    const signals: TutorialSignals = {
      moving: this.rover.isMoving,
      fired: this.combatSystem.killCount > 0,
      damaged: this.roverFlashMs > 0,
      cleared: this.combatSystem.remainingEnemies === 0 && this.waveSpawnSystem.waveFullySpawned,
    };
    this.tutorial.sync(signals);
  }

  private updateRoverFlash(delta: number): void {
    if (this.roverFlashMs <= 0) {
      return;
    }
    this.roverFlashMs = Math.max(0, this.roverFlashMs - delta);
    this.rover.setAlpha(this.roverFlashMs > 0 ? 0.65 : 1);
  }

  private shakeCamera(): void {
    const cam = this.cameras.main;
    const intensity = GameConfig.survival.killShakeIntensity;
    this.tweens.add({
      targets: cam,
      scrollX: cam.scrollX + intensity * 40,
      duration: 40,
      yoyo: true,
      repeat: 2,
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
      this.joystick.setCaptureEnabled(false);
      this.rover.setJoystickInput(0, 0);
      this.tweens.pauseAll();
      this.time.paused = true;
      this.pauseModal.show();
    } else {
      this.time.paused = false;
      this.tweens.resumeAll();
      this.pauseModal.hide();
      this.joystick.setCaptureEnabled(true);
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

    if (this.hpSystem.isDead) {
      this.endRun('Lost');
      return;
    }

    if (
      this.combatSystem.remainingEnemies === 0 &&
      this.waveSpawnSystem.waveFullySpawned
    ) {
      this.endRun('Won');
    }
  }

  private endRun(outcome: 'Won' | 'Lost'): void {
    if (this.ending) {
      return;
    }
    this.ending = true;

    if (outcome === 'Won') {
      this.runState.win();
      Audio.play('win');
    } else {
      this.runState.lose();
      Audio.play('lose');
    }

    this.rover.setJoystickInput(0, 0);
    this.joystick.release();
    this.joystick.setCaptureEnabled(false);

    const stageBonus =
      GameConfig.survival.stageCoinBonus[this.stage.id - 1] ?? 10;
    const coinsEarned =
      outcome === 'Won'
        ? this.combatSystem.killCount * GameConfig.coins.perKill + stageBonus
        : 0;

    const payload: ResultPayload = {
      outcome,
      stageId: this.stage.id,
      kills: this.combatSystem.killCount,
      coinsEarned,
    };
    this.registry.set('resultPayload', payload);
    this.registry.set('resultSettled', false);
    this.time.paused = false;
    this.tweens.resumeAll();
    this.time.delayedCall(RESULT_DELAY_MS, () => {
      this.scene.start('ResultScene');
    });
  }

  private spawnObstacles(stage: StageConfig): void {
    this.obstacleColliders = [];
    for (const obstacle of stage.obstacles) {
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

  private drawMap(stage: StageConfig): void {
    const { mapFill } = GameConfig.colors;
    this.add.rectangle(stage.mapWidth / 2, stage.mapHeight / 2, stage.mapWidth, stage.mapHeight, mapFill);
    this.add
      .image(0, 0, stage.backgroundKey)
      .setOrigin(0, 0)
      .setDisplaySize(stage.mapWidth, stage.mapHeight);
    this.spawnObstacles(stage);
  }
}
