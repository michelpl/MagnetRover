import { Math as PhaserMath } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { MoveInput } from '../entities/Rover';

/** Baked sprite frame index for the 16-direction rover sheet. */
export type RoverFacingFrame = number;

/** SE showcase / garage facing (135° clockwise from north). */
export const ROVER_FACING_SE: RoverFacingFrame = 6;

/**
 * Quantize a world-facing angle to a spritesheet frame.
 * Unique poses skip blended 16-dir intermediates (even indices on a 16-frame sheet).
 */
export function angleToRoverFrame(
  angle: number,
  directionCount: number = GameConfig.rover.directionCount,
  uniqueFacingCount: number = GameConfig.rover.uniqueFacingCount,
): RoverFacingFrame {
  const unique = Math.max(1, uniqueFacingCount);
  const step = (Math.PI * 2) / unique;
  const wrapped = PhaserMath.Angle.Wrap(angle);
  let index = Math.round(wrapped / step) % unique;
  if (index < 0) {
    index += unique;
  }
  const stride = Math.max(1, Math.round(directionCount / unique));
  return index * stride;
}

/** World-facing angle of a baked spritesheet frame (frame 0 = north). */
export function roverFrameToAngle(
  frame: RoverFacingFrame,
  directionCount: number = GameConfig.rover.directionCount,
): number {
  return frame * ((Math.PI * 2) / directionCount);
}

/** Facing angle from a move vector, or null when idle. */
export function moveInputToFacing(input: MoveInput): number | null {
  if (input.x === 0 && input.y === 0) {
    return null;
  }
  return Math.atan2(input.x, -input.y);
}
