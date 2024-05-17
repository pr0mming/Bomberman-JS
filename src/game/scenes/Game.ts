import { GameObjects, Scene, Time } from 'phaser';

// Common types
import { IBombermanStage } from '@game/common/interfaces/IBombermanStage';
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';

// Helpers
import getInitialBombermanStage from '@game/common/helpers/getInitialBombermanStage';
import getItemFromPhaserGroup from '@game/common/helpers/getItemFromPhaserGroup';

// Sprites
import { Player } from '@game/sprites/Player';
import { BombGroup } from '@game/sprites/bomb/BombGroup';

// Managers
import { MapManager } from '@game/managers/MapManager';
import { EnemyGroup } from '../sprites/enemy/EnemyGroup';
import { LEVEL_ENUM } from '../common/enums/LevelEnum';

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
      scene: this
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
      positions: []
    });

    this.createStatistics();

    this.physics.add.collider(this._player, this._mapManager.mapLayer);
    this.physics.add.collider(this._player, this._mapManager.bricks);
    this.physics.add.collider(this._player, this._bombGroup);
    this.physics.add.collider(this._enemiesGroup, this._bombGroup);

    // this.physics.add.collider(
    //   this._enemies,
    //   this._layer,
    //   undefined,
    //   (enemy) => {
    //     const _enemy = enemy as Types.Physics.Arcade.SpriteWithDynamicBody;

    //     return _enemy.getData('physicsLayer') as boolean;
    //   },
    //   this
    // );

    // this.physics.add.collider(
    //   this._enemies,
    //   this._brick,
    //   undefined,
    //   (enemy) => {
    //     const _enemy = enemy as Types.Physics.Arcade.SpriteWithDynamicBody;

    //     return _enemy.getData('physicsLaphysicsBrickyer') as boolean;
    //   },
    //   this
    // );

    // this.physics.add.overlap(
    //   this._bomberman,
    //   this._enemies,
    //   () => {
    //     this.lose();
    //   },
    //   undefined,
    //   this
    // );

    // this.physics.add.overlap(
    //   this._bomberman,
    //   this._explosion,
    //   () => {
    //     this.lose();
    //   },
    //   undefined,
    //   this
    // );

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

    // const powerSpeciality = this.getItemFromPhaserGroup(
    //   this._specialties.getChildren(),
    //   'power'
    // );

    // if (powerSpeciality) {
    //   this.physics.add.overlap(
    //     this._bomberman,
    //     powerSpeciality as Types.Physics.Arcade.SpriteWithDynamicBody,
    //     (_, power) => {
    //       const _power = power as Types.Physics.Arcade.SpriteWithDynamicBody;

    //       this.updateCharacter(_power.getData('TypePower'));
    //       _power.active = false;
    //     },
    //     undefined,
    //     this
    //   );

    //   this.physics.add.overlap(
    //     this._explosion,
    //     powerSpeciality as Types.Physics.Arcade.SpriteWithDynamicBody,
    //     (power, fragment) => {
    //       const _power = power as Types.Physics.Arcade.SpriteWithDynamicBody;
    //       const _fragment =
    //         fragment as Types.Physics.Arcade.SpriteWithDynamicBody;

    //       _fragment.on(
    //         Animations.Events.ANIMATION_COMPLETE_KEY,
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
    //this.activeMotionEnemy();
  }

  render() {
    //this.game.debug.body(this._bomberman);
    /*if (this._bombs != undefined) {
            this._bombs.forEach(function(brick) {
                this.game.debug.body(brick);
            }, this);
        }*/
    //this.game.debug.spriteInfo(this.hero.getByName('hero'), 50, 50);
  }

  updateCharacter(power: string) {
    this.sound.stopByKey('stage-theme');
    this.sound.play('find-the-door', { loop: true });

    if (power == 'ExtendExplosion') {
      this._stageBomberman.stage_points += 160;

      this._bombGroup.setExplosionLength = this._bombGroup.explosionLength + 1;
    } else if (power == 'AddBomb') {
      this._stageBomberman.stage_points += 180;

      this._bombGroup.setMaxAmountBombs = this._bombGroup.maxAmountBombs + 1;
    }

    this._labels
      .getChildren()
      .find((obj) => obj.name === 'SCORE')
      ?.setState(this._stageBomberman?.stage_points);
  }

  win() {
    this.game.sound.stopAll();

    const highScore = localStorage.getItem('HightScore') ?? 0;

    if (highScore < localStorage.stage_points)
      localStorage.setItem('HightScore', localStorage.stage_points);

    this._player.setImmovable(true);

    //this._stageBomberman.map = this._map.objects;
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
      paused: true,
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
