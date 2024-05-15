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

  recalculateNextMap() {
    let rows = 11,
      cols = 35,
      distance = 40,
      coords = [],
      specialities = ['door', 'power'];

    for (let i = 0, y = 98; i < rows; i++, y += distance) {
      if (i % 2 == 0)
        for (let j = 0, x = 38; j < cols; j++, x += distance)
          coords.push(x + ',' + y);
      else
        for (let j = 0, x = 38; j < cols; j++, x += distance * 2)
          coords.push(x + ',' + y);
    }

    // for (var i in this._stageBomberman?.map) {
    //   var coord =
    //       coords[this.rnd.integerInRange(0, coords.length - 1)].split(','),
    //     index = specialities.indexOf(this._stageBomberman.map[i].name);

    //   if (index != -1) {
    //     var brick = this._stageBomberman.map
    //       .map((object) => {
    //         return object.name;
    //       }, this)
    //       .indexOf(specialities[index] + '-brick');
    //     this._stageBomberman.map[brick].x = parseInt(coord[0]);
    //     this._stageBomberman.map[brick].y = parseInt(coord[1]);
    //   }

    //   this._stageBomberman.map[i].x = parseInt(coord[0]);
    //   this._stageBomberman.map[i].y = parseInt(coord[1]);

    //   coords.splice(coords.indexOf(coord.join(',')), 1);
    // }
  }
}
