import { GameObjects, Scene, Time } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';
import { EnemyGroup } from '@game/sprites/enemy/EnemyGroup';

// Interfaces
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';

// Enums
import { ENEMY_ENUM } from '@game/common/enums/EnemyEnum';
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';
import { LOCAL_STORAGE_KEYS_ENUM } from '@game/common/enums/LocalStorageKeysEnum';
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';

interface GameRulesManagerProps {
  scene: Scene;
  gameStage: IGameInitialStage;
  player: Player;
  enemiesGroup: EnemyGroup;
}

/**
 * This class manage the logic when the player wins or loses the game, it also organize the statistics to show (time, lifes, etc.)
 */
export class GameRulesManager {
  private _scene: Scene;
  private _gameStage: IGameInitialStage;
  private _player: Player;
  private _enemiesGroup: EnemyGroup;

  private _labels: GameObjects.Group;

  private _timers: Map<number, Time.TimerEvent>;

  constructor({
    scene,
    gameStage,
    player,
    enemiesGroup
  }: GameRulesManagerProps) {
    this._scene = scene;
    this._gameStage = gameStage;
    this._player = player;
    this._enemiesGroup = enemiesGroup;

    this._labels = this._scene.add.group();

    this._timers = new Map<number, Time.TimerEvent>();

    this._setUp();
  }

  /**
   * This method places the time, score and lifes of the player
   */
  private _setUp() {
    const style = {
      font: '15px BitBold',
      fill: 'white',
      stroke: 'black',
      strokeThickness: 2.5
    };

    let distanceX = 22;

    const information = this._scene.add.text(
      distanceX,
      22,
      `TIME ${this._gameStage.time}`,
      style
    );

    information.setScrollFactor(0, 0);
    information.name = 'TIME';
    this._labels.add(information);

    distanceX += 170;

    const score = this._scene.add.text(
      distanceX,
      22,
      this._gameStage.stageScore.toString(),
      style
    );

    score.setScrollFactor(0, 0);
    score.name = 'SCORE';
    this._labels.add(score);

    distanceX += 128;

    const lives = this._scene.add.text(
      distanceX,
      22,
      `LEFT ${this._gameStage.lives}`,
      style
    );

    lives.setScrollFactor(0, 0);
    lives.name = 'LEFT';
    this._labels.add(lives);

    const _timerGame = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._gameStage.time,
      callback: () => {
        const { repeatCount } = _timerGame;

        // If the game time is run out then all the enemies are PONTAN (pink coin)
        if (repeatCount <= 0) {
          this._enemiesGroup.replaceAllByType(ENEMY_ENUM.PONTAN);
        }

        this._gameStage.time = repeatCount;

        this._setLabelTextByKey('TIME', `TIME ${repeatCount}`);
      },
      callbackScope: this
    });

    this._scene.time.addEvent(_timerGame);
    this._timers.set(TIMER_GAME_ENUM.GAME, _timerGame);
  }

  win() {
    this._scene.game.sound.stopAll();

    // Check highest score
    const highScore =
      localStorage.getItem(LOCAL_STORAGE_KEYS_ENUM.HIGHEST_SCORE_KEY) ?? 0;

    if (highScore < localStorage.stage_points)
      localStorage.setItem(
        LOCAL_STORAGE_KEYS_ENUM.HIGHEST_SCORE_KEY,
        localStorage.stage_points
      );

    // Freeze player
    this._player.disableBody(false);
    this._player.setImmovable(true);

    // Update game object
    this._gameStage.stageScore += 450;
    this._gameStage.totalScore = this._gameStage.stageScore;
    this._gameStage.status = GAME_STATUS_ENUM.NEXT_STAGE;

    this._setLabelTextByKey('SCORE', this._gameStage.stageScore.toString());

    this._scene.sound.play('level-complete');

    const _timerNextStage = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: 5,
      callback: () => {
        const { repeatCount } = _timerNextStage;

        if (repeatCount <= 0) {
          // Validate final stage
          if (this._gameStage.stage === GAME_STAGE_ENUM.FINAL_BONUS) {
            this._gameStage.status = GAME_STATUS_ENUM.COMPLETED;
          }

          // Or show next stage
          this._scene.scene.start('ChangeStage', this._gameStage);
        }
      },
      callbackScope: this
    });

    this._scene.time.addEvent(_timerNextStage);
  }

  lose() {
    const _timerGame = this._timers.get(TIMER_GAME_ENUM.GAME);

    if (_timerGame) {
      _timerGame.paused = true;
    }

    this._gameStage.stageScore = 0;

    this._player.kill();

    const _timerLose = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: 4,
      callback: () => {
        const { repeatCount } = _timerLose;

        if (repeatCount <= 0) {
          this._gameStage.lives--;

          // Restart of Game Over
          if (this._gameStage.lives >= 0) {
            this._gameStage.status = GAME_STATUS_ENUM.RESTART;
          } else {
            this._gameStage.status = GAME_STATUS_ENUM.GAME_OVER;
          }

          this._scene.scene.start('ChangeStage', this._gameStage);
        }
      },
      callbackScope: this
    });

    this._scene.time.addEvent(_timerLose);
  }

  /**
   * Simple method with boilerplate to change the text of a label
   * @param keyName key of the label to access
   * @param value new value to change
   */
  private _setLabelTextByKey(keyName: string, value: string) {
    const _label = this._labels.getMatching('name', keyName)[0];

    if (_label) {
      (_label as GameObjects.Text).setText(value);
    }
  }

  public get score() {
    return this._gameStage.stageScore;
  }

  public set score(v: number) {
    this._gameStage.stageScore = v;

    this._setLabelTextByKey('SCORE', this._gameStage.stageScore.toString());
  }
}
