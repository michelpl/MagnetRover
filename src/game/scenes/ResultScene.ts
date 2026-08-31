import { Scene } from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { getNextLevelId } from '../config/Levels';
import { Save } from '../save/Save';
import { viewSize } from '../ui/viewSize';

export type ResultPayload = {
  outcome: 'Won' | 'Lost';
  stageId: number;
  kills: number;
  coinsEarned: number;
};

/** Victory / defeat summary for survival runs. */
export class ResultScene extends Scene {
  public constructor() {
    super('ResultScene');
  }

  public create(): void {
    const payload = this.registry.get('resultPayload') as ResultPayload | undefined;
    const outcome = payload?.outcome ?? 'Won';
    const stageId = payload?.stageId ?? 1;
    const kills = payload?.kills ?? 0;
    const coinsEarned = payload?.coinsEarned ?? 0;
    const isWin = outcome === 'Won';
    const save = this.settleWin(isWin, stageId, coinsEarned);

    const { width, height } = viewSize(this);
    this.add.rectangle(width / 2, height / 2, width, height, 0x0d0d10, 0.92);

    const title = isWin ? 'Victory' : 'Defeat';
    const color = isWin ? '#69db7c' : '#fa5252';

    this.add
      .text(width / 2, height / 2 - 320, title, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '72px',
        color,
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 200, `Kills: ${kills}`, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '36px',
        color: '#ced4da',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 140, `+${coinsEarned} coins this run`, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '32px',
        color: '#ffd43b',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 80, `Wallet: ${save.coins}`, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '28px',
        color: '#adb5bd',
      })
      .setOrigin(0.5);

    if (isWin) {
      const nextId = getNextLevelId(stageId);
      this.addButton(width / 2, height / 2 + 40, 'Retry', GameConfig.colors.roverAccent, () => {
        this.registry.set('activeLevelId', stageId);
        this.scene.start('GameScene');
      });
      this.addButton(width / 2, height / 2 + 150, 'Garage', GameConfig.colors.magnetGlow, () => {
        this.scene.start('GarageScene');
      });
      this.addButton(width / 2, height / 2 + 260, 'Stages', GameConfig.colors.processorAccent, () => {
        this.scene.start('MenuScene');
      });
      if (nextId !== stageId) {
        this.addButton(width / 2, height / 2 + 370, 'Next', GameConfig.colors.roverCabin, () => {
          this.registry.set('activeLevelId', nextId);
          this.scene.start('GameScene');
        });
      }
    } else {
      this.addButton(width / 2, height / 2 + 80, 'Retry', GameConfig.colors.roverAccent, () => {
        this.registry.set('activeLevelId', stageId);
        this.scene.start('GameScene');
      });
      this.addButton(width / 2, height / 2 + 190, 'Menu', GameConfig.colors.roverCabin, () => {
        this.scene.start('MenuScene');
      });
    }
  }

  private settleWin(isWin: boolean, stageId: number, coinsEarned: number) {
    if (!isWin) {
      return Save.load();
    }
    if (this.registry.get('resultSettled') === true) {
      return Save.load();
    }
    const save = Save.applyWin(stageId, coinsEarned);
    this.registry.set('resultSettled', true);
    return save;
  }

  private addButton(
    x: number,
    y: number,
    label: string,
    fill: number,
    onClick: () => void,
  ): void {
    const bg = this.add.rectangle(x, y, 360, 80, fill, 1).setInteractive({ useHandCursor: true });
    const text = this.add
      .text(x, y, label, {
        fontFamily: GameConfig.ui.fontFamily,
        fontSize: '36px',
        color: fill === GameConfig.colors.roverCabin ? '#f8f9fa' : '#0d0d10',
      })
      .setOrigin(0.5);

    bg.on('pointerup', onClick);
    text.setInteractive({ useHandCursor: true }).on('pointerup', onClick);
  }
}
