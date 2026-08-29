import { GameObjects, Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';

type PanelLayout = {
  width: number;
  height: number;
  radius: number;
  trackX: number;
  trackY: number;
  trackWidth: number;
  trackHeight: number;
  trackRadius: number;
  trackPadding: number;
  fillRadius: number;
  percentRight: number;
  titleY: number;
  dividerY: number;
  glossInset: number;
  titleSize: number;
  percentSize: number;
  innerTrackWidth: number;
  innerTrackHeight: number;
  fillX: number;
  fillY: number;
};

type CornerRadius = number | { tl: number; tr: number; bl: number; br: number };

/** Cleanup progress panel (camera-fixed, top-center). */
export class CleanBar {
  private readonly root: GameObjects.Container;
  private readonly fillGfx: GameObjects.Graphics;
  private readonly percentText: GameObjects.Text;
  private readonly layout: PanelLayout;

  public constructor(scene: Scene) {
    const hud = GameConfig.hud;
    const scale = hud.cleanPanelScale;
    const layout = (this.layout = this.buildLayout(hud, scale));
    const x = (GameConfig.viewport.width - layout.width) / 2;
    const y = hud.cleanPanelMarginTop;

    const panel = scene.add.graphics();
    this.drawPanel(panel, layout);

    const track = scene.add.graphics();
    this.drawTrack(track, layout);

    this.fillGfx = scene.add.graphics();

    const title = scene.add
      .text(layout.width / 2, layout.titleY, 'CLEANING PROGRESS', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: `${layout.titleSize}px`,
        fontStyle: 'bold',
        color: '#f5f7fa',
      })
      .setOrigin(0.5, 0)
      .setShadow(0, 1, '#000000', 1, true, true);

    this.percentText = scene.add
      .text(layout.width - layout.percentRight, layout.trackY, '0%', {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: `${layout.percentSize}px`,
        fontStyle: 'bold',
        color: '#64f321',
      })
      .setOrigin(1, 0)
      .setShadow(0, 1, '#000000', 1, true, true);

    this.root = scene.add.container(x, y, [panel, track, this.fillGfx, title, this.percentText]);
    this.root.setScrollFactor(0);
    this.root.setDepth(2000);

    this.setRatio(0);
  }

  public setRatio(ratio: number): void {
    const clamped = Math.max(0, Math.min(1, ratio));
    const fillWidth = this.layout.innerTrackWidth * clamped;
    const { fillX, fillY, innerTrackHeight, fillRadius } = this.layout;
    const scale = GameConfig.hud.cleanPanelScale;

    this.fillGfx.clear();
    if (fillWidth > 0) {
      const radius = this.clampedRadius(fillRadius, fillWidth, innerTrackHeight);
      this.fillRounded(this.fillGfx, fillX, fillY, fillWidth, innerTrackHeight, radius, 0x52dc18, 1);

      const highlightH = Math.min(2 * scale, innerTrackHeight - 2);
      const highlightInset = 3 * scale;
      const highlightWidth = fillWidth - highlightInset * 2;
      if (highlightH > 0 && highlightWidth > 0) {
        this.fillGfx.fillStyle(0xffffff, 0.14);
        this.fillGfx.fillRoundedRect(
          fillX + highlightInset,
          fillY + 1,
          highlightWidth,
          highlightH,
          Math.min(2 * scale, highlightWidth / 2, highlightH / 2),
        );
      }
    }

    this.percentText.setText(`${Math.floor(clamped * 100)}%`);
  }

  private buildLayout(hud: typeof GameConfig.hud, scale: number): PanelLayout {
    const innerTrackWidth = (hud.cleanTrackWidth - hud.cleanTrackPadding * 2) * scale;
    const innerTrackHeight = (hud.cleanTrackHeight - hud.cleanTrackPadding * 2) * scale;

    return {
      width: hud.cleanPanelWidth * scale,
      height: hud.cleanPanelHeight * scale,
      radius: hud.cleanPanelRadius * scale,
      trackX: hud.cleanTrackX * scale,
      trackY: hud.cleanTrackY * scale,
      trackWidth: hud.cleanTrackWidth * scale,
      trackHeight: hud.cleanTrackHeight * scale,
      trackRadius: hud.cleanTrackRadius * scale,
      trackPadding: hud.cleanTrackPadding * scale,
      fillRadius: hud.cleanFillRadius * scale,
      percentRight: hud.cleanPercentRight * scale,
      titleY: 8 * scale,
      dividerY: 25 * scale,
      glossInset: 10 * scale,
      titleSize: 11 * scale,
      percentSize: 17 * scale,
      innerTrackWidth,
      innerTrackHeight,
      fillX: (hud.cleanTrackX + hud.cleanTrackPadding) * scale,
      fillY: (hud.cleanTrackY + hud.cleanTrackPadding) * scale,
    };
  }

  private drawPanel(g: GameObjects.Graphics, layout: PanelLayout): void {
    const { width, height, radius, glossInset, dividerY } = layout;
    const bottomRadius: CornerRadius = { tl: 0, tr: 0, bl: radius, br: radius };

    this.fillRounded(g, 0, 0, width, height, radius, 0x273b52, 0.95);
    this.fillRounded(g, 0, height * 0.44, width, height * 0.56, bottomRadius, 0x142335, 0.2);
    this.fillRounded(g, 0, height * 0.72, width, height * 0.28, bottomRadius, 0x08121e, 0.18);

    g.lineStyle(1, 0x6591be, 0.55);
    g.strokeRoundedRect(0.5, 0.5, width - 1, height - 1, radius);

    g.lineStyle(1, 0x08111c, 0.85);
    g.strokeRoundedRect(1.5, 1.5, width - 3, height - 3, Math.max(0, radius - 1));

    g.fillStyle(0x80b1e2, 0.42);
    g.fillRect(glossInset, 1, width - glossInset * 2, 1);

    g.fillStyle(0x000000, 0.22);
    g.fillRect(radius, dividerY, width - radius * 2, 1);
  }

  private drawTrack(g: GameObjects.Graphics, layout: PanelLayout): void {
    const { trackX, trackY, trackWidth, trackHeight, trackRadius, trackPadding, fillRadius } = layout;
    const bottomRadius: CornerRadius = { tl: 0, tr: 0, bl: trackRadius, br: trackRadius };

    this.fillRounded(g, trackX, trackY, trackWidth, trackHeight, trackRadius, 0x15293a, 0.92);
    this.fillRounded(
      g,
      trackX,
      trackY + trackHeight * 0.5,
      trackWidth,
      trackHeight * 0.5,
      bottomRadius,
      0x091724,
      0.35,
    );

    g.lineStyle(1, 0x2d4962, 0.7);
    g.strokeRoundedRect(trackX + 0.5, trackY + 0.5, trackWidth - 1, trackHeight - 1, trackRadius);

    const insetW = trackWidth - trackPadding * 2;
    const insetH = trackHeight - trackPadding * 2;
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(
      trackX + trackPadding,
      trackY + trackPadding + 1,
      insetW,
      insetH,
      this.clampedRadius(fillRadius, insetW, insetH),
    );
  }

  private fillRounded(
    g: GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: CornerRadius,
    color: number,
    alpha: number,
  ): void {
    g.fillStyle(color, alpha);
    g.fillRoundedRect(x, y, width, height, radius);
  }

  private clampedRadius(radius: number, width: number, height: number): number {
    return Math.max(0, Math.min(radius, width / 2, height / 2));
  }
}
