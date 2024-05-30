import { GameObjects, Scene, Time } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';
import { EnemyGroup } from '@game/sprites/enemy/EnemyGroup';

// Interfaces
import { IGameStage } from '@game/common/interfaces/IGameStage';

// Helpers
import getItemFromPhaserGroup from '@game/common/helpers/getItemFromPhaserGroup';

// Enums
import { ENEMY_ENUM } from '@game/common/enums/EnemyEnum';
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';

interface GameRulesManagerProps {
  scene: Scene;
  gameStage: IGameStage;
  player: Player;
  enemiesGroup: EnemyGroup;
}

export class GameRulesManager {
  private _scene: Scene;
  private _gameStage: IGameStage;
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

  private _setUp() {
    const style = {
      font: '15px BitBold',
      fill: 'white',
      stroke: 'black',
      strokeThickness: 2.5
    };

    let distance = 22;

    const information = this._scene.add.text(
      distance,
      22,
      `TIME: ${this._gameStage.time}`,
      style
    );

    information.setScrollFactor(0, 0);
    information.name = 'TIME';
    this._labels.add(information);

    distance += 170;

    const score = this._scene.add.text(
      distance,
      22,
      this._gameStage.stageScore.toString(),
      style
    );

    score.setScrollFactor(0, 0);
    score.name = 'SCORE';
    this._labels.add(score);

    distance += 128;

    const lives = this._scene.add.text(
      distance,
      22,
      `LEFT: ${this._gameStage.lives}`,
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

        if (repeatCount <= 0) {
          this._enemiesGroup.replaceAllByType(ENEMY_ENUM.PONTAN);
        }

        this._gameStage.time = repeatCount;

        this._setLabelTextByKey('TIME', `TIME: ${repeatCount}`);
      },
      callbackScope: this
    });

    this._scene.time.addEvent(_timerGame);
    this._timers.set(TIMER_GAME_ENUM.GAME, _timerGame);
  }

  win() {
    this._scene.game.sound.stopAll();

    const highScore = localStorage.getItem('HightScore') ?? 0;

    if (highScore < localStorage.stage_points)
      localStorage.setItem('HightScore', localStorage.stage_points);

    this._player.disableBody(false);
    this._player.setImmovable(true);

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

  private _setLabelTextByKey(key: string, value: string) {
    const _label = getItemFromPhaserGroup(this._labels.getChildren(), key);

    if (_label) {
      (_label as GameObjects.Text).setText(value);
    }
  }

  public get score() {
    return this._gameStage.stageScore;
  }

  public set score(v: number) {
    this._gameStage.stageScore += v;

    this._setLabelTextByKey('SCORE', this._gameStage.stageScore.toString());
  }
}
