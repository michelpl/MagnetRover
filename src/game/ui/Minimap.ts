import { GameObjects, Scene } from 'phaser';
import { ignoreWorldCamera } from '../cameras/GameCameras';
import { GameConfig } from '../config/GameConfig';
import { bindViewResize, safeInsets } from './viewSize';
import type { Enemy } from '../entities/Enemy';
import type { Rover } from '../entities/Rover';

type MapRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};

/** Sci-fi HUD radar: rover heading and enemy blips. */
export class Minimap {
  private readonly markers: GameObjects.Graphics;
  private readonly root: GameObjects.Container;
  private readonly mapWidth: number;
  private readonly mapHeight: number;
  private readonly plot: MapRect;

  public constructor(scene: Scene) {
    const hud = GameConfig.hud;
    const cfg = hud.minimap;
    this.mapWidth = (scene.registry.get('mapWidth') as number | undefined) ?? GameConfig.map.width;
    this.mapHeight = (scene.registry.get('mapHeight') as number | undefined) ?? GameConfig.map.height;

    const aspect = this.mapHeight / this.mapWidth;
    const panelWidth = cfg.width;
    const panelHeight = cfg.width * aspect;
    this.plot = this.computePlot(panelWidth, panelHeight, cfg.padding);

    const chrome = scene.add.graphics();
    this.drawChrome(chrome, cfg, panelWidth, panelHeight);

    this.markers = scene.add.graphics();

    this.root = scene.add.container(0, 0, [chrome, this.markers]);
    this.root.setScrollFactor(0);
    this.root.setDepth(2000);
    ignoreWorldCamera(scene, this.root);
    bindViewResize(scene, () => this.layout());
  }

  private layout(): void {
    const hud = GameConfig.hud;
    const cfg = hud.minimap;
    const inset = safeInsets(this.root.scene);
    const topOffset = GameConfig.hudSurvival.wavePanelMarginTop + GameConfig.hudSurvival.wavePanelHeight;
    this.root.setPosition(
      inset.left + hud.marginX,
      inset.top + topOffset + cfg.gapBelowBars,
    );
  }

  public updateEnemies(rover: Rover, enemies: readonly Enemy[]): void {
    const cfg = GameConfig.hud.minimap;
    const g = this.markers;
    g.clear();

    for (const enemy of enemies) {
      if (!enemy.active) {
        continue;
      }
      const p = this.worldToLocal(enemy.x, enemy.y);
      g.fillStyle(0xff6b6b, 1);
      g.fillCircle(p.x, p.y, cfg.scrapRadius);
    }

    const roverPos = this.worldToLocal(rover.x, rover.y);
    const heading = rover.rotation;
    const halfW = cfg.coneWidth / 2;
    const tipX = roverPos.x + Math.sin(heading) * cfg.coneLength;
    const tipY = roverPos.y - Math.cos(heading) * cfg.coneLength;
    const leftX = roverPos.x + Math.cos(heading) * halfW;
    const leftY = roverPos.y + Math.sin(heading) * halfW;
    const rightX = roverPos.x - Math.cos(heading) * halfW;
    const rightY = roverPos.y - Math.sin(heading) * halfW;

    g.fillStyle(cfg.roverColor, cfg.coneAlpha);
    g.fillTriangle(tipX, tipY, leftX, leftY, rightX, rightY);

    g.fillStyle(cfg.roverColor, 1);
    g.fillCircle(roverPos.x, roverPos.y, cfg.roverRadius);
  }

  private computePlot(panelW: number, panelH: number, padding: number): MapRect {
    const innerW = panelW - padding * 2;
    const innerH = panelH - padding * 2;
    const scale = Math.min(innerW / this.mapWidth, innerH / this.mapHeight);
    const width = this.mapWidth * scale;
    const height = this.mapHeight * scale;
    return {
      x: padding + (innerW - width) / 2,
      y: padding + (innerH - height) / 2,
      width,
      height,
      scale,
    };
  }

  private worldToLocal(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: this.plot.x + worldX * this.plot.scale,
      y: this.plot.y + worldY * this.plot.scale,
    };
  }

  private drawChrome(
    g: GameObjects.Graphics,
    cfg: typeof GameConfig.hud.minimap,
    width: number,
    height: number,
  ): void {
    const { cornerRadius, padding } = cfg;

    g.fillStyle(cfg.fillColor, cfg.fillAlpha);
    g.fillRoundedRect(0, 0, width, height, cornerRadius);

    g.lineStyle(cfg.strokeWidth, cfg.strokeColor, 1);
    g.strokeRoundedRect(
      cfg.strokeWidth / 2,
      cfg.strokeWidth / 2,
      width - cfg.strokeWidth,
      height - cfg.strokeWidth,
      Math.max(0, cornerRadius - cfg.strokeWidth / 2),
    );

    const gridLeft = padding;
    const gridTop = padding;
    const gridRight = width - padding;
    const gridBottom = height - padding;
    g.lineStyle(1, cfg.gridColor, cfg.gridAlpha);
    for (let col = 0; col <= cfg.gridCols; col += 1) {
      const x = gridLeft + ((gridRight - gridLeft) * col) / cfg.gridCols;
      g.lineBetween(x, gridTop, x, gridBottom);
    }
    for (let row = 0; row <= cfg.gridRows; row += 1) {
      const y = gridTop + ((gridBottom - gridTop) * row) / cfg.gridRows;
      g.lineBetween(gridLeft, y, gridRight, y);
    }
  }
}
