import { Scene } from 'phaser';

// Interfaces
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';

// Helpers
import getInitialGameStage from '@game/common/helpers/getInitialGameStage';

// Enums
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';

interface IPrepareUIParameters {
  text: string;
  delay: number;
  soundKey: string;
  sceneKey: string;
}

/**
 * This scene is showed before the Game scene, it's the black screen ith white texts
 */
export class ChangeStage extends Scene {
  private _gameStage?: IGameInitialStage;

  constructor() {
    super('ChangeStage');
  }

  init(gameStage: IGameInitialStage) {
    this._gameStage = gameStage;
  }

  create() {
    this.sound.stopAll();

    this.cameras.main.backgroundColor =
      Phaser.Display.Color.HexStringToColor('#000000');

    if (this._gameStage) {
      switch (this._gameStage?.status) {
        case GAME_STATUS_ENUM.START:
        case GAME_STATUS_ENUM.RESTART:
          // This line is important to keep always the same data of the initial stage
          this._gameStage = getInitialGameStage();

          this._prepareUI({
            text: this._getStageText(),
            delay: 4,
            soundKey: 'level-start',
            sceneKey: 'Game'
          });

          break;

        case GAME_STATUS_ENUM.LOADED_GAME:
          this._prepareUI({
            text: this._getStageText(),
            delay: 4,
            soundKey: 'level-start',
            sceneKey: 'Game'
          });

          break;

        case GAME_STATUS_ENUM.GAME_OVER:
          localStorage.clear();

          this._prepareUI({
            text: 'GAME OVER',
            delay: 7,
            soundKey: 'game-over',
            sceneKey: 'MainMenu'
          });

          break;

        case GAME_STATUS_ENUM.NEXT_STAGE:
          this._gameStage.stage++;

          this._prepareUI({
            text: this._getStageText(),
            delay: 4,
            soundKey: 'level-start',
            sceneKey: 'Game'
          });
          break;

        case GAME_STATUS_ENUM.COMPLETED:
          localStorage.clear();

          this._prepareUI({
            text: 'Amazing! \n Thanks for playing!',
            delay: 10,
            soundKey: 'level-complete',
            sceneKey: 'MainMenu'
          });
          break;

        default:
          break;
      }
    }
  }

  /**
   * This method prepares the text to show and the scene to execute after a delay
   * @param parameters data to prepare the scene
   */
  private _prepareUI(parameters: IPrepareUIParameters) {
    const { text, delay, soundKey } = parameters;

    this.add
      .text(this.cameras.main.centerX, this.cameras.main.centerY, text)
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(15)
      .setColor('white')
      .setStroke('black', 2.5)
      .setOrigin(0.5)
      .setAlign('center');

    this.sound.play(soundKey);

    const _sceneTimer = this.time.addEvent({
      delay: 1000,
      repeat: delay,
      callback: () => {
        const { repeatCount } = _sceneTimer;

        if (repeatCount <= 0) {
          // Show new scene ...
          this.scene.start(parameters.sceneKey, this._gameStage);
        }
      },
      callbackScope: this
    });
  }

  private _getStageText() {
    if (this._gameStage?.stage === GAME_STAGE_ENUM.FINAL_BONUS) {
      return 'BONUS STAGE';
    }

    return `STAGE ${(this._gameStage?.stage ?? 0) + 1}`;
  }
}
