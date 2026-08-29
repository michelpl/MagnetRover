import { Scene, Textures } from 'phaser';
import { Audio } from '../audio/Audio';
import { GameConfig } from '../config/GameConfig';
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
    this.load.image('processor', 'assets/sprites/processor/processor.png');
    this.load.image('scrap-gear', 'assets/sprites/scrap/gear.png');
    this.load.spritesheet('rover', 'assets/sprites/rover/rover.png', {
      frameWidth: GameConfig.rover.spriteFrameSize,
      frameHeight: GameConfig.rover.spriteFrameSize,
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
    this.load.image('energy-panel', 'assets/ui/energybar.png');
    this.load.image('energy-unit', 'assets/ui/energy-unity.png');
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
    knockoutBorderMatte(this, 'energy-panel', GameConfig.hud.energyPanel.matteThreshold);
    knockoutBorderMatte(this, 'energy-unit', GameConfig.hud.energyPanel.matteThreshold);
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

/**
 * Removes only the opaque black matte connected to an image edge. Dark panel
 * details enclosed by the artwork remain intact.
 */
function knockoutBorderMatte(scene: Scene, key: string, threshold: number): void {
  const image = scene.textures.get(key).getSourceImage();
  if (!(image instanceof HTMLImageElement) && !(image instanceof HTMLCanvasElement)) {
    throw new Error(`${key} source is not a drawable image`);
  }

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas is required to process energy artwork');
  }
  ctx.drawImage(image, 0, 0);

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = pixels;
  const pixelCount = canvas.width * canvas.height;
  const pending = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const enqueueIfMatte = (pixelIndex: number): void => {
    const offset = pixelIndex * 4;
    const alpha = data[offset + 3] ?? 0;
    const red = data[offset] ?? 0;
    const green = data[offset + 1] ?? 0;
    const blue = data[offset + 2] ?? 0;
    if (alpha === 0 || red > threshold || green > threshold || blue > threshold) {
      return;
    }
    data[offset + 3] = 0;
    pending[tail] = pixelIndex;
    tail += 1;
  };

  const { width, height } = canvas;
  for (let x = 0; x < width; x += 1) {
    enqueueIfMatte(x);
    enqueueIfMatte((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueueIfMatte(y * width);
    enqueueIfMatte(y * width + width - 1);
  }

  while (head < tail) {
    const pixelIndex = pending[head];
    head += 1;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);
    if (x > 0) {
      enqueueIfMatte(pixelIndex - 1);
    }
    if (x + 1 < width) {
      enqueueIfMatte(pixelIndex + 1);
    }
    if (y > 0) {
      enqueueIfMatte(pixelIndex - width);
    }
    if (y + 1 < height) {
      enqueueIfMatte(pixelIndex + width);
    }
  }

  ctx.putImageData(pixels, 0, 0);
  scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
}
