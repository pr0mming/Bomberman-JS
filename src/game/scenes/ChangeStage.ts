import { Scene } from 'phaser';

// Interfaces
import { IGameStage } from '../common/interfaces/IGameStage';

// Enums
import { GAME_STATUS_ENUM } from '../common/enums/GameStatusEnum';

interface IPrepareUIParameters {
  text: string;
  delay: number;
  soundKey: string;
}

export class ChangeStage extends Scene {
  gameStage?: IGameStage;

  constructor() {
    super('ChangeStage');
  }

  init(gameStage: IGameStage) {
    this.gameStage = gameStage;
  }

  create() {
    this.sound.stopAll();
    this.cameras.main.backgroundColor =
      Phaser.Display.Color.HexStringToColor('#000000');

    if (this.gameStage) {
      switch (this.gameStage?.status) {
        case GAME_STATUS_ENUM.START:
        case GAME_STATUS_ENUM.RESTART:
          this.prepareUI({
            text: `STAGE ${this.gameStage?.stage + 1}`,
            delay: 4,
            soundKey: 'level-start'
          });

          break;

        case GAME_STATUS_ENUM.GAME_OVER:
          this.prepareUI({
            text: 'GAME OVER',
            delay: 7,
            soundKey: 'game-over'
          });

          break;

        case GAME_STATUS_ENUM.NEXT_STAGE:
          this.gameStage.stage++;

          this.prepareUI({
            text: `STAGE ${this.gameStage?.stage + 1}`,
            delay: 4,
            soundKey: 'level-start'
          });
          break;

        default:
          break;
      }
    }
  }

  prepareUI(parameters: IPrepareUIParameters) {
    const { text, delay, soundKey } = parameters;

    this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      text,

      {
        font: '15px BitBold',
        color: 'white',
        stroke: 'black',
        strokeThickness: 2.5
      }
    );

    this.sound.play(soundKey);

    const _sceneTimer = this.time.addEvent({
      delay: 1000,
      repeat: delay,
      callback: () => {
        const { repeatCount } = _sceneTimer;

        if (repeatCount <= 0) {
          _sceneTimer.paused = true;
          this.scene.start('Game', this.gameStage);
        }
      },
      callbackScope: this
    });
  }
}
