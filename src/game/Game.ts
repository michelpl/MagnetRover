import { AUTO, Game, Scale } from 'phaser';
import { GameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { ResultScene } from './scenes/ResultScene';

export function createGame(): Game {
  return new Game({
    type: AUTO,
    parent: 'game-container',
    width: GameConfig.viewport.width,
    height: GameConfig.viewport.height,
    backgroundColor: GameConfig.colors.background,
    scale: {
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
    scene: [BootScene, MenuScene, GameScene, ResultScene],
  });
}
