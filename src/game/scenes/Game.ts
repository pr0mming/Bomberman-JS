import { GameObjects, Physics, Scene, Time } from 'phaser';

// Interfaces
import { IBombermanStage } from '@game/common/interfaces/IBombermanStage';

// Helpers
import getInitialBombermanStage from '@game/common/helpers/getInitialBombermanStage';
import getItemFromPhaserGroup from '@game/common/helpers/getItemFromPhaserGroup';

// Sprites
import { Player } from '@game/sprites/player/Player';
import { Wall } from '@game/sprites/wall/Wall';
import { Bomb } from '@game/sprites/bomb/Bomb';
import { BombGroup } from '@game/sprites/bomb/BombGroup';
import { Enemy } from '@game/sprites/enemy/Enemy';
import { EnemyGroup } from '@game/sprites/enemy/EnemyGroup';

// Managers
import { MapManager } from '@game/managers/MapManager';
import { PowerUpManager } from '@game/managers/PowerUpManager';

// Enums
import { LEVEL_ENUM } from '@game/common/enums/LevelEnum';
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';
import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';

export class Game extends Scene {
  _stageBomberman: IBombermanStage;

  _timers: Map<number, Time.TimerEvent>;

  _mapManager!: MapManager;
  _powerUpManager!: PowerUpManager;

  _player!: Player;
  _bombGroup!: BombGroup;
  _enemiesGroup!: EnemyGroup;

  _labels!: GameObjects.Group;

  constructor() {
    super('Game');

    this._stageBomberman = getInitialBombermanStage();

    this._timers = new Map<number, Time.TimerEvent>();
  }

  init(stageBomberman: IBombermanStage) {
    this._stageBomberman = stageBomberman;
  }

  create() {
    this._mapManager = new MapManager({
      scene: this,
      world: this.physics.world
    });

    this._bombGroup = new BombGroup({
      scene: this,
      world: this.physics.world
    });

    this._player = new Player({
      scene: this,
      x: 60,
      y: 120,
      bombGroup: this._bombGroup
    });

    this._enemiesGroup = new EnemyGroup({
      scene: this,
      world: this.physics.world,
      level: LEVEL_ENUM.ONE,
      freePositions: this._mapManager.freePositions,
      player: this._player
    });

    this._powerUpManager = new PowerUpManager({
      scene: this,
      player: this._player,
      bombGroup: this._bombGroup
    });

    this.createStatistics();

    this.physics.add.collider(this._player, this._mapManager.mapLayer);
    this.physics.add.collider(
      this._player,
      this._bombGroup,
      undefined,
      (player, _) => {
        const _player = player as Player;

        return !_player.hasBombPassPowerUp;
      },
      this
    );

    this.physics.add.collider(
      this._player,
      this._mapManager.wallsGroup,
      undefined,
      (player, _) => {
        const _player = player as Player;

        return !_player.hasWallPassPowerUp;
      },
      this
    );

    this.physics.add.overlap(
      this._player,
      this._enemiesGroup,
      () => {
        this.lose();
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this._player,
      this._bombGroup.explosionGroup,
      () => {
        this.lose();
      },
      (player, _) => {
        const _player = player as Player;

        return !_player.hasFlamePassPowerUp;
      },
      this
    );

    // this.physics.add.overlap(
    //   this._player,
    //   this._mapManager.crossroads,
    //   (enemy, crossroad) => {
    //     const _crossroad = crossroad as Physics.Arcade.Sprite;

    //     console.log(_crossroad.body?.x, _crossroad.body?.y);
    //   },
    //   undefined,
    //   this
    // );

    this.physics.add.collider(
      this._enemiesGroup,
      this._bombGroup,
      (enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this._enemiesGroup,
      this._mapManager.mapLayer,
      (enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this._enemiesGroup,
      this._mapManager.wallsGroup,
      (enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      (enemy) => {
        const _enemy = enemy as Enemy;

        return !_enemy.enemyData.hasWallPassPowerUp;
      },
      this
    );

    this.physics.add.overlap(
      this._enemiesGroup,
      this._mapManager.crossroads,
      (enemy, crossroad) => {
        const _crossroad = crossroad as Physics.Arcade.Sprite;
        const _enemy = enemy as Enemy;

        const crossroadPos = {
          x: _crossroad.body?.x ?? 0,
          y: _crossroad.body?.y ?? 0
        };

        _enemy.lastCrossroadTouched = {
          x: crossroadPos.x,
          y: crossroadPos.y
        };

        // Perform movement so that the enemy isn't immovable
        _enemy.dispatchMotion();
      },
      (enemy, crossroad) => {
        const _enemy = enemy as Enemy;
        const _crossroad = crossroad as Physics.Arcade.Sprite;

        const crossroadPos = {
          x: _crossroad.body?.x ?? 0,
          y: _crossroad.body?.y ?? 0
        };

        return _enemy.validateCrossroadOverlap({
          x: crossroadPos.x,
          y: crossroadPos.y
        });
      },
      this
    );

    this.physics.add.overlap(
      this._bombGroup.explosionGroup,
      this._bombGroup,
      (_, bomb) => {
        const _bomb = bomb as Bomb;

        this._bombGroup.exploitByBomb(_bomb);
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this._player,
      this._mapManager.powerUp,
      (_, powerUp) => {
        const _powerUp = powerUp as Physics.Arcade.Sprite;
        const powerUpId = _powerUp.getData('powerUpId') as number;

        this.addPowerUp(powerUpId);

        _powerUp.destroy();
      },
      (player, powerUp) => {
        const _player = player as Player;
        const _powerUp = powerUp as Physics.Arcade.Sprite;

        return (
          _player.body &&
          _powerUp.body &&
          Math.floor(_player.body.center.x) ===
            Math.floor(_powerUp.body.center.x) &&
          Math.floor(_player.body.center.y) ===
            Math.floor(_powerUp.body.center.y)
        );
      },
      this
    );

    this.physics.add.overlap(
      this._player,
      this._mapManager.door,
      () => {
        if (this._enemiesGroup.getLength() === 0) this.win();
      },
      (player, door) => {
        const _player = player as Player;
        const _door = door as Physics.Arcade.Sprite;

        return (
          _player.body &&
          _door.body &&
          Math.floor(_player.body.center.x) ===
            Math.floor(_door.body.center.x) &&
          Math.floor(_player.body.center.y) === Math.floor(_door.body.center.y)
        );
      },
      this
    );

    this.physics.add.overlap(
      this._bombGroup.explosionGroup,
      this._mapManager.door,
      (_, door) => {
        const _door = door as Physics.Arcade.Sprite;

        _door.disableBody(false);

        setTimeout(() => {
          _door.enableBody(false);
        }, 2000);

        if (_door.body) {
          this._enemiesGroup.addRndEnemiesByPosition(
            _door.body.center.x,
            _door.body.center.y
          );
        }
      },
      (_, door) => {
        const _door = door as Physics.Arcade.Sprite;

        return _door.body?.enable && _door.visible;
      },
      this
    );

    this.physics.add.overlap(
      this._bombGroup.explosionGroup,
      this._enemiesGroup,
      (_, enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.kill();
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this._bombGroup.explosionGroup,
      this._mapManager.wallsGroup,
      (_, wall) => {
        const _wall = wall as Wall;

        _wall.kill();

        if (_wall.getData('hasDoor')) {
          this._mapManager.door.setVisible(true);
        }

        if (_wall.getData('hasPowerUp')) {
          this._mapManager.powerUp.setVisible(true);
        }
      },
      undefined,
      this
    );
  }

  update() {
    //if (this._save.isDown) {
    //coming soon
    //}

    this._player?.addControlsListener();
  }

  addPowerUp(powerUp: PLAYER_POWER_UP_ENUM) {
    const extraPoints = this._powerUpManager.addPowerUp(powerUp);

    this._stageBomberman.stage_points += extraPoints;

    this._labels
      .getChildren()
      .find((obj) => obj.name === 'SCORE')
      ?.setState(this._stageBomberman.stage_points);
  }

  win() {
    this.game.sound.stopAll();

    const highScore = localStorage.getItem('HightScore') ?? 0;

    if (highScore < localStorage.stage_points)
      localStorage.setItem('HightScore', localStorage.stage_points);

    this._player.setImmovable(true);

    this._stageBomberman.points = this._stageBomberman.stage_points;
    this._stageBomberman.stage_points += 450;
    this._stageBomberman.status = 'next-stage';

    this._labels
      .getChildren()
      .find((obj) => obj.name === 'SCORE')
      ?.setState(this._stageBomberman.stage_points);

    this.sound.play('level-complete');

    const _timerNextStage = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: 5,
      callback: () => {
        const { repeatCount } = _timerNextStage;

        if (repeatCount <= 0) {
          const _timerExploitBomb = this._timers.get(
            TIMER_GAME_ENUM.EXPLOIT_BOMB
          );

          if (_timerExploitBomb) {
            _timerExploitBomb.paused = true;
          }

          this.scene.start('ChangeStage', this._stageBomberman);
        }
      },
      callbackScope: this
    });

    this.time.addEvent(_timerNextStage);
  }

  lose() {
    const _timerGame = this._timers.get(TIMER_GAME_ENUM.GAME);

    if (_timerGame) {
      _timerGame.paused = true;
    }

    this._stageBomberman.stage_points = 0;
    this._stageBomberman.stage_time = this._stageBomberman.time;

    this._player.kill();

    const _timerLose = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: 4,
      callback: () => {
        const { repeatCount } = _timerLose;

        if (repeatCount <= 0) {
          _timerLose.paused = true;

          this._stageBomberman.lives--;

          if (this._stageBomberman.lives >= 0) {
            this._stageBomberman.status = 'restart';
            this.scene.start('ChangeStage', this._stageBomberman);
          } else {
            this._stageBomberman.status = 'game-over';
            this.scene.start('ChangeStage', this._stageBomberman);
          }
        }
      },
      callbackScope: this
    });

    this.time.addEvent(_timerLose);
  }

  createStatistics() {
    this._labels = this.add.group();

    const style = {
      font: '15px BitBold',
      fill: 'white',
      stroke: 'black',
      strokeThickness: 2.5
    };

    let distance = 22;

    const information = this.add.text(
      distance,
      22,
      'TIME: ' + this._stageBomberman.time,
      style
    );

    information.setScrollFactor(0, 0);
    information.name = 'TIME';
    this._labels.add(information);
    distance += 170;

    const score = this.add.text(
      distance,
      22,
      this._stageBomberman.points.toString(),
      style
    );

    score.setScrollFactor(0, 0);
    score.name = 'SCORE';
    this._labels.add(score);
    distance += 128;

    const lives = this.add.text(
      distance,
      22,
      'LEFT: ' + this._stageBomberman.lives,
      style
    );

    lives.setScrollFactor(0, 0);
    lives.name = 'LEFT';
    this._labels.add(lives);

    const _timerGame = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._stageBomberman.time,
      callback: () => {
        const { repeatCount } = _timerGame;

        if (repeatCount <= 0) {
          this._stageBomberman.stage_time = 0;

          _timerGame.paused = false;
          //this.replaceEnemies('coin');
        }

        const _label = getItemFromPhaserGroup(
          this._labels.getChildren(),
          'TIME'
        );

        if (_label) {
          (_label as GameObjects.Text).setText('TIME: ' + repeatCount);
        }
      },
      callbackScope: this
    });

    this.time.addEvent(_timerGame);
    this._timers.set(TIMER_GAME_ENUM.GAME, _timerGame);
  }
}
