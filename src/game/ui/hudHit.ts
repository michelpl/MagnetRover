import { GameConfig } from '../config/GameConfig';
import type { Scene } from 'phaser';
import { safeInsets, viewSize } from './viewSize';

type HitRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** True if the pointer is over the lower-left energy panel (not a stick start). */
export function isPointerOnEnergyPanel(scene: Scene, x: number, y: number): boolean {
  const { marginX, marginBottom, energyPanel } = GameConfig.hud;
  const { height } = viewSize(scene);
  const inset = safeInsets(scene);
  return contains(x, y, {
    left: inset.left + marginX,
    top: height - inset.bottom - marginBottom - energyPanel.height,
    width: energyPanel.width,
    height: energyPanel.height,
  });
}

/** True if the pointer is over in-run settings or pause (not a stick start). */
export function isPointerOnPlayHudButton(scene: Scene, x: number, y: number): boolean {
  return contains(x, y, settingsHitRect(scene)) || contains(x, y, pauseHitRect(scene));
}

export function settingsHitRect(scene: Scene): HitRect {
  const { width } = viewSize(scene);
  const { gearSize, gearMarginRight, marginTop } = GameConfig.topControls;
  const inset = safeInsets(scene);
  return {
    left: width - inset.right - gearMarginRight - gearSize,
    top: inset.top + marginTop,
    width: gearSize,
    height: gearSize,
  };
}

export function pauseHitRect(scene: Scene): HitRect {
  const { width } = viewSize(scene);
  const { marginX, pauseSize } = GameConfig.hud;
  const { gearSize, marginTop, pauseGapBelowGear } = GameConfig.topControls;
  const inset = safeInsets(scene);
  return {
    left: width - inset.right - marginX - pauseSize,
    top: inset.top + marginTop + gearSize + pauseGapBelowGear,
    width: pauseSize,
    height: pauseSize,
  };
}

function contains(x: number, y: number, rect: HitRect): boolean {
  return x >= rect.left && x <= rect.left + rect.width && y >= rect.top && y <= rect.top + rect.height;
}
