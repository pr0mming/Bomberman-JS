import { GameObjects, Physics, Scene, Time } from 'phaser';

// Common types
import { IBombermanStage } from '@game/common/interfaces/IBombermanStage';
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';

// Helpers
import getInitialBombermanStage from '@game/common/helpers/getInitialBombermanStage';
import getItemFromPhaserGroup from '@game/common/helpers/getItemFromPhaserGroup';

// Sprites
import { Player } from '@game/sprites/player/Player';
import { BombGroup } from '@game/sprites/bomb/BombGroup';
import { Enemy } from '@game/sprites/enemy/Enemy';

// Managers
import { MapManager } from '@game/managers/MapManager';
import { EnemyGroup } from '@game/sprites/enemy/EnemyGroup';

// Enums
import { LEVEL_ENUM } from '@game/common/enums/LevelEnum';
import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';

export class Game extends Scene {
  _stageBomberman: IBombermanStage;

  _playerSpeed: number;

  _timers: Map<number, Time.TimerEvent>;
  _mapManager!: MapManager;
  _player!: Player;
  _bombGroup!: BombGroup;
  _enemiesGroup!: EnemyGroup;

  _labels!: GameObjects.Group;

  constructor() {
    super('Game');

    this._stageBomberman = getInitialBombermanStage();

    this._timers = new Map<number, Time.TimerEvent>();
    this._playerSpeed = 150;
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
      speed: this._playerSpeed,
      bombGroup: this._bombGroup
    });

    this._enemiesGroup = new EnemyGroup({
      scene: this,
      world: this.physics.world,
      level: LEVEL_ENUM.ONE,
      freePositions: this._mapManager.freePositions,
      player: this._player
    });

    this.createStatistics();

    this.physics.add.collider(this._player, this._mapManager.mapLayer);
    this.physics.add.collider(this._player, this._mapManager.wallsGroup);
    this.physics.add.collider(this._player, this._bombGroup);
    this.physics.add.collider(this._enemiesGroup, this._bombGroup);

    this.physics.add.collider(
      this._enemiesGroup,
      this._mapManager.mapLayer,
      undefined,
      (enemy) => {
        const _enemy = enemy as Enemy;

        return !_enemy.enemyData.hasWallPassPowerUp;
      },
      this
    );

    this.physics.add.collider(
      this._enemiesGroup,
      this._mapManager.wallsGroup,
      undefined,
      (enemy) => {
        const _enemy = enemy as Enemy;

        return !_enemy.enemyData.hasWallPassPowerUp;
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
      this._bombGroup.explosion,
      () => {
        this.lose();
      },
      undefined,
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

    this.physics.add.overlap(
      this._enemiesGroup,
      this._mapManager.crossroads,
      (enemy, crossroad) => {
        const _crossroad = crossroad as Physics.Arcade.Sprite;
        const _enemy = enemy as Enemy;

        // Stop the motion ...
        _enemy.setVelocity(0);

        const crossroadPos = {
          x: _crossroad.body?.x ?? 0,
          y: _crossroad.body?.y ?? 0
        };

        // So important: Reset the enemy position according to the crossroad it's on
        // Otherwise it'll be a huge offset to detect the next crossroad
        // and the enemys will never execute a new movement
        _enemy.setPosition(crossroadPos.x, crossroadPos.y);

        _enemy.lastCrossroadTouched = {
          x: crossroadPos.x,
          y: crossroadPos.y
        };

        // Perform movement so that the enemy isn't immovable
        _enemy.dispatchMotion();
      },
      (enemy, crossroad) => {
        const _crossroad = crossroad as Physics.Arcade.Sprite;
        const _enemy = enemy as Enemy;

        // If we are performig or even calculating the new direction of the enemy it should be immovable
        // This is to avoid execute the rest of the logic in this scenario
        if (_enemy.body?.velocity.x === 0 && _enemy.body?.velocity.y === 0)
          return false;

        const crossroadPos = {
          x: _crossroad.body?.x ?? 0,
          y: _crossroad.body?.y ?? 0
        };

        const enemyCrossroadPos = {
          x: _enemy.lastCrossroadTouched?.x ?? 0,
          y: _enemy.lastCrossroadTouched?.y ?? 0
        };

        // This is to avoid change the direction multiple times if the enemy is on the same crossroad
        // so that I save the last crossroad passed to verify
        if (
          crossroadPos &&
          crossroadPos.x === enemyCrossroadPos?.x &&
          crossroadPos.y === enemyCrossroadPos?.y
        )
          return false;

        const enemyPos = {
          x: _enemy.body?.center.x ?? 0,
          y: _enemy.body?.center.y ?? 0
        };

        // This validation asserts the enemy reaches the approximately x, y position of the crossroad
        // If this is true so we can tell to the enemy perform a new or the same movement (direction)
        // Note: Idk but it wasn't good enough with "crossroadPos.x === enemyPos.x" because the enemy takes a decimals-offset positions
        return (
          crossroadPos &&
          enemyPos &&
          (crossroadPos.x === Math.floor(enemyPos.x) ||
            crossroadPos.x === Math.round(enemyPos.x)) &&
          (crossroadPos.y === Math.floor(enemyPos.y) ||
            crossroadPos.y === Math.round(enemyPos.y))
        );
      },
      this
    );

    // this.physics.add.overlap(
    //   this._explosion,
    //   this._bombs,
    //   (_, detected_bomb) => {
    //     const _detected_bomb =
    //       detected_bomb as Types.Physics.Arcade.SpriteWithDynamicBody;

    //     this.exploitBomb(_detected_bomb);
    //   },
    //   undefined,
    //   this
    // );

    this.physics.add.overlap(
      this._player,
      this._mapManager.powerUp,
      (_, powerUp) => {
        const _powerUp = powerUp as Physics.Arcade.Sprite;
        const powerUpId = _powerUp.getData('powerUpId') as number;

        this.addPowerUp(powerUpId);

        _powerUp.destroy();
      },
      undefined,
      this
    );

    //   this.physics.add.overlap(
    //     this._explosion,
    //     powerSpeciality as Types.Physics.Arcade.SpriteWithDynamicBody,
    //     (power, fragment) => {
    //       const _power = power as Types.Physics.Arcade.SpriteWithDynamicBody;
    //       const _fragment =
    //         fragment as Types.Physics.Arcade.SpriteWithDynamicBody;

    //       _fragment.on(
    //         Animations.Events.ANIMATION_COMPLETE,
    //         () => {
    //           if (this._stageBomberman) {
    //             const stage = this._stageBomberman.stage - 1;

    //             for (let i = 0; i < this._numberEnemies; i++) {
    //               this.putEnemy(
    //                 this._stageBomberman.stage_enemies[stage][0],
    //                 false,
    //                 _power.body.x,
    //                 _power.body.y
    //               );
    //             }
    //           }
    //         },
    //         this
    //       );

    //       _power.active = false;
    //     },
    //     undefined,
    //     this
    //   );
    // }

    // const doorSpeciality = this.getItemFromPhaserGroup(
    //   this._specialties.getChildren(),
    //   'door'
    // );

    // if (doorSpeciality) {
    //   this.physics.add.overlap(
    //     this._bomberman,
    //     doorSpeciality as Types.Physics.Arcade.SpriteWithDynamicBody,
    //     (_, door) => {
    //       const _door = door as Types.Physics.Arcade.SpriteWithDynamicBody;

    //       if (
    //         this._enemies.getLength() == 0 &&
    //         // this._timerGame.running &&
    //         Math.round(this._player.x) == Math.round(_door.body.x) &&
    //         Math.round(this._player.y) == Math.round(_door.body.y)
    //       )
    //         this.win();
    //     },
    //     undefined,
    //     this
    //   );
    // }

    // /*
    //     this.physics.add.collider(this._explosion, this._layer, null, function(explosion, layer) {
    //         explosion.kill();
    //     }, this);*/

    // this.physics.add.overlap(
    //   this._explosion,
    //   this._enemies,
    //   (_, enemy) => {
    //     const _enemy = enemy as Types.Physics.Arcade.SpriteWithDynamicBody;

    //     _enemy.setData('autonomy', false);
    //     _enemy.body.enable = false;

    //     this.destroyEnemy(_enemy);
    //   },
    //   undefined,
    //   this
    // );

    // this.physics.add.overlap(
    //   this._explosion,
    //   this._brick,
    //   (fragment, brick) => {
    //     const _fragment =
    //       fragment as Types.Physics.Arcade.SpriteWithDynamicBody;
    //     const _brick = brick as Types.Physics.Arcade.SpriteWithDynamicBody;

    //     _brick.anims.play('destroy');

    //     if (_brick.name == 'door-brick') {
    //       const _speciality = this.getItemFromPhaserGroup(
    //         this._specialties.getChildren(),
    //         'door'
    //       );

    //       if (_speciality) {
    //         _speciality.active = true;
    //       }
    //     } else if (_brick.name == 'power-brick') {
    //       const _speciality = this.getItemFromPhaserGroup(
    //         this._specialties.getChildren(),
    //         'power'
    //       );

    //       if (_speciality) {
    //         _speciality.active = true;
    //       }
    //     }

    //     _fragment.active = false;
    //   },
    //   undefined,
    //   this
    // );
  }

  update() {
    //if (this._save.isDown) {
    //coming soon
    //}

    this._player?.addControlsListener();
  }

  addPowerUp(powerUp: PLAYER_POWER_UP_ENUM) {
    const extraPoints = this._player.addPowerUp(powerUp);

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
        } else {
          const _label = getItemFromPhaserGroup(
            this._labels.getChildren(),
            'TIME'
          );

          if (_label) {
            (_label as GameObjects.Text).setText('TIME: ' + repeatCount);
          }
        }
      },
      callbackScope: this
    });

    this.time.addEvent(_timerGame);
    this._timers.set(TIMER_GAME_ENUM.GAME, _timerGame);
  }
}
