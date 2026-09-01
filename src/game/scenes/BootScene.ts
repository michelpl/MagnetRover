import { Scene, Textures } from 'phaser';
import { Audio } from '../audio/Audio';
import { GameConfig } from '../config/GameConfig';
import { getObstacleVisual, OBSTACLE_VARIANTS } from '../config/Obstacles';
import { SplashScreen } from '../ui/SplashScreen';

export class BootScene extends Scene {
  public constructor() {
    super('BootScene');
  }

  public preload(): void {
    this.load.image('splash-background', 'assets/ui/splash/magnet-rover-splash-1080x1920.png');
  }

  public create(): void {
    const splash = new SplashScreen(this);
    const displayedAt = this.time.now;
    this.load.on('progress', (progress: number) => splash.setProgress(progress));
    this.load.once('complete', () => {
      splash.setProgress(1);
      const visibleFor = this.time.now - displayedAt;
      const remainingDisplayMs = Math.max(0, GameConfig.splash.minimumDisplayMs - visibleFor);
      this.time.delayedCall(remainingDisplayMs, () => void this.finishBoot());
    });
    this.loadGameAssets();
    this.load.start();
  }

  private loadGameAssets(): void {
    this.load.image('scenario1', 'assets/ui/scenario1.png');
    this.load.spritesheet('rover', 'assets/sprites/rover/rover.png', {
      frameWidth: GameConfig.rover.spriteFrameSize,
      frameHeight: GameConfig.rover.spriteFrameSize,
    });
    this.load.spritesheet('weapon-base', 'assets/sprites/weapons/weapon_base.png', {
      frameWidth: GameConfig.survival.cannonSpriteFrameSize,
      frameHeight: GameConfig.survival.cannonSpriteFrameSize,
    });
    this.load.spritesheet('laser-cannon', 'assets/sprites/weapons/laser_cannon.png', {
      frameWidth: GameConfig.survival.cannonSpriteFrameSize,
      frameHeight: GameConfig.survival.cannonSpriteFrameSize,
    });
    this.load.image('hub-shop', 'assets/ui/shop-icon.png');
    this.load.image('hub-stages', 'assets/ui/stages-icon.png');
    this.load.image('hub-garage', 'assets/ui/garage-icon.png');
    this.load.image('iconset', 'assets/ui/iconset.png');
    this.load.spritesheet('garage-icons', 'assets/ui/garage-icons.png', {
      frameWidth: 627,
      frameHeight: 627,
    });
    this.load.image('garage-bg', 'assets/ui/garage-bg.png');
    this.load.image('stages-bg', 'assets/ui/stages-bg.jpg');
    this.load.spritesheet('stage-arrows', 'assets/ui/arrows.png', {
      frameWidth: 256,
      frameHeight: 384,
    });
    this.load.image('stage-lock', 'assets/ui/stage-lock.png');
    for (const variant of OBSTACLE_VARIANTS) {
      const visual = getObstacleVisual(variant);
      this.load.image(visual.textureKey, visual.assetPath);
    }
  }

  private async finishBoot(): Promise<void> {
    const family = GameConfig.ui.fontFamily;
    await document.fonts.load(`400 24px ${family}`);
    await document.fonts.load(`600 24px ${family}`);
    await document.fonts.load(`700 24px ${family}`);
    await document.fonts.load(`800 64px ${family}`);
    await document.fonts.ready;
    registerIconsetFrames(this);
    knockoutNearBlack(this, 'stage-lock');
    Audio.bind(this);
    this.scene.start('MenuScene');
  }
}

function registerIconsetFrames(scene: Scene): void {
  const texture = scene.textures.get('iconset');
  const frames = GameConfig.garage.iconFrames;
  addIconFrame(texture, 'bolt', frames.bolt);
  addIconFrame(texture, 'plus', frames.plus);
  addIconFrame(texture, 'coin', frames.coin);
  addIconFrame(texture, 'gear', frames.gear);
  addIconFrame(texture, 'chest', frames.chest);
  addIconFrame(texture, 'boost', frames.boost);
}

function addIconFrame(
  texture: Textures.Texture,
  name: string,
  frame: { x: number; y: number; width: number; height: number },
): void {
  texture.add(name, 0, frame.x, frame.y, frame.width, frame.height);
}

/** Punch opaque black mattes to alpha 0 so the lock sits on the navy card. */
function knockoutNearBlack(scene: Scene, key: string, threshold = 16): void {
  const image = scene.textures.get(key).getSourceImage();
  if (!(image instanceof HTMLImageElement) && !(image instanceof HTMLCanvasElement)) {
    throw new Error(`${key} source is not a drawable image`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas is required to process stage-lock');
  }
  ctx.drawImage(image, 0, 0);
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    if (r <= threshold && g <= threshold && b <= threshold) {
      data[i + 3] = 0;
    }
  }
  ctx.putImageData(pixels, 0, 0);
  scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
}
