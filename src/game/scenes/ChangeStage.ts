import { Scene } from 'phaser';
import { IBombermanStage } from '@src/game/common/interfaces/IBombermanStage';
import { IPrepareUIParameters } from '@src/game/common/interfaces/IPrepareUIParameters';

export class ChangeStage extends Scene {
  _stageBomberman?: IBombermanStage;

  constructor() {
    super('ChangeStage');
  }

  init(stageBomberman: IBombermanStage) {
    this._stageBomberman = stageBomberman;
  }

  create() {
    this.sound.stopAll();
    this.cameras.main.backgroundColor =
      Phaser.Display.Color.HexStringToColor('#000000');

    switch (this._stageBomberman?.status) {
      case 'start':
      case 'restart':
        this.prepareUI({
          text: `STAGE ${this._stageBomberman?.stage}`,
          delay: 4,
          soundKey: 'level-start'
        });

        break;

      case 'game-over':
        this.prepareUI({
          text: 'GAME OVER',
          delay: 7,
          soundKey: 'game-over'
        });

        break;

      case 'next-stage':
        this.prepareUI({
          text: `STAGE ${this._stageBomberman?.stage + 1}`,
          delay: 4,
          soundKey: 'level-start'
        });
        break;

      default:
        break;
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
          this.scene.start('Game', this._stageBomberman);
        }
      },
      callbackScope: this
    });
  }
}
