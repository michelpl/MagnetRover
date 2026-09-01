import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ROVER_FACING_SE } from '../rover/roverFacing';
import { viewSize } from './viewSize';

/** Rover sprite on the painted garage pad — no extra platform graphics. */
export class RoverShowcase {
  public constructor(scene: Scene) {
    const { width } = viewSize(scene);
    const { showcaseY, roverDisplaySize } = GameConfig.garage;
    const rover = scene.add.sprite(width / 2, showcaseY, 'rover', ROVER_FACING_SE);
    rover.setDisplaySize(roverDisplaySize, roverDisplaySize);
    rover.setDepth(901);
  }
}
