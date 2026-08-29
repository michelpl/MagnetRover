import { GameObjects } from 'phaser';
import { GameConfig } from '../config/GameConfig';

/** Shared navy card chrome used on garage widgets. */
export function drawNavyPanel(
  g: GameObjects.Graphics,
  width: number,
  height: number,
  radius: number,
): void {
  const { panel, panelBottom, stroke, gloss } = GameConfig.garage.colors;
  g.fillStyle(0x061b38, 0.98);
  g.fillRoundedRect(0, 0, width, height, radius);
  g.fillStyle(panel, 0.98);
  g.fillRoundedRect(3, 3, width - 6, height - 6, radius - 3);
  g.fillStyle(panelBottom, 0.72);
  g.fillRoundedRect(0, height * 0.42, width, height * 0.58, {
    tl: 0,
    tr: 0,
    bl: radius,
    br: radius,
  });
  g.lineStyle(3, 0x0a4e9d, 0.95);
  g.strokeRoundedRect(1, 1, width - 2, height - 2, radius);
  g.lineStyle(1, stroke, 0.9);
  g.strokeRoundedRect(7, 7, width - 14, height - 14, radius - 5);
  g.fillStyle(gloss, 0.22);
  g.fillRoundedRect(radius, 4, width - radius * 2, 8, 4);
}
