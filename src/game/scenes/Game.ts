import {
  Animations,
  GameObjects,
  Input,
  Physics,
  Scene,
  Tilemaps,
  Time,
  Types
} from 'phaser';
import { IBombermanStage } from '@game/common/IBombermanStage';

export class Game extends Scene {
  _stageBomberman?: IBombermanStage;
  _timers: Time.TimerEvent[] = [];
  _coordsBrick = [];
  _brickPosition: string[] = [];
  _map!: Tilemaps.Tilemap;
  _brick!: Physics.Arcade.Group;
  _enemies!: Physics.Arcade.Group;
  _explosion!: Physics.Arcade.Group;
  _specialties!: Physics.Arcade.Group;
  _crossroads!: Physics.Arcade.Group;
  _hero!: Physics.Arcade.Group;
  _bombs!: Physics.Arcade.Group;
  _bomberman!: Types.Physics.Arcade.SpriteWithDynamicBody;
  _heroSpeed = 150;
  _explosionLength = 0;
  _amountBombs = 0;
  _timeExplosion = 10;
  _labels!: GameObjects.Group;

  _layer!: Tilemaps.TilemapLayer;
  _directions?: Types.Input.Keyboard.CursorKeys;
  _put_bomb?: Input.Keyboard.Key;
  _exploit_bomb?: Input.Keyboard.Key;
  _save?: Input.Keyboard.Key;
  _direction: string = '';
  _numberEnemies = 7;
  _explosionProperties: any;
  _typesEnemies: any;
  _movements: any[] = [];
  _explosionLengthProperties: string[] = [];

  constructor() {
    super('Game');
  }

  init(stageBomberman: IBombermanStage) {
    this._stageBomberman = stageBomberman;
  }

  create() {
    this.createMap();
    this.createControls();
    this.createCharacter();
    this.createStatistics();
    this.createBomb();
    this.createAutonomy();
    this.createEnemies();
  }

  update() {
    //if (this._save.isDown) {
    //coming soon
    //}

    this.physics.add.collider(this._bomberman, this._layer);
    this.physics.add.collider(this._bomberman, this._brick);
    this.physics.add.collider(this._bomberman, this._bombs);
    this.physics.add.collider(this._enemies, this._bombs);

    this.physics.add.collider(
      this._enemies,
      this._layer,
      undefined,
      (enemy) => {
        const _enemy = enemy as Types.Physics.Arcade.SpriteWithDynamicBody;

        return _enemy.getData('physicsLayer') as boolean;
      },
      this
    );

    this.physics.add.collider(
      this._enemies,
      this._brick,
      undefined,
      (enemy) => {
        const _enemy = enemy as Types.Physics.Arcade.SpriteWithDynamicBody;

        return _enemy.getData('physicsLaphysicsBrickyer') as boolean;
      },
      this
    );

    this.physics.add.overlap(
      this._bomberman,
      this._enemies,
      () => {
        this.lose();
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this._bomberman,
      this._explosion,
      () => {
        this.lose();
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this._explosion,
      this._bombs,
      (_, detected_bomb) => {
        const _detected_bomb =
          detected_bomb as Types.Physics.Arcade.SpriteWithDynamicBody;

        this.exploitBomb(_detected_bomb);
      },
      undefined,
      this
    );

    const powerSpeciality = this.getItemFromPhaserGroup(
      this._specialties.getChildren(),
      'power'
    );

    if (powerSpeciality) {
      this.physics.add.overlap(
        this._bomberman,
        powerSpeciality as Types.Physics.Arcade.SpriteWithDynamicBody,
        (_, power) => {
          const _power = power as Types.Physics.Arcade.SpriteWithDynamicBody;

          this.updateCharacter(_power.getData('TypePower'));
          _power.active = false;
        },
        undefined,
        this
      );

      this.physics.add.overlap(
        this._explosion,
        powerSpeciality as Types.Physics.Arcade.SpriteWithDynamicBody,
        (power, fragment) => {
          const _power = power as Types.Physics.Arcade.SpriteWithDynamicBody;
          const _fragment =
            fragment as Types.Physics.Arcade.SpriteWithDynamicBody;

          _fragment.on(
            Animations.Events.ANIMATION_COMPLETE_KEY,
            () => {
              if (this._stageBomberman) {
                const stage = this._stageBomberman.stage - 1;

                for (let i = 0; i < this._numberEnemies; i++) {
                  this.putEnemy(
                    this._stageBomberman.stage_enemies[stage][0],
                    false,
                    _power.body.x,
                    _power.body.y
                  );
                }
              }
            },
            this
          );

          _power.active = false;
        },
        undefined,
        this
      );
    }

    const doorSpeciality = this.getItemFromPhaserGroup(
      this._specialties.getChildren(),
      'door'
    );

    if (doorSpeciality) {
      this.physics.add.overlap(
        this._bomberman,
        doorSpeciality as Types.Physics.Arcade.SpriteWithDynamicBody,
        (_, door) => {
          const _door = door as Types.Physics.Arcade.SpriteWithDynamicBody;

          if (
            this._enemies.getLength() == 0 &&
            // this._timerGame.running &&
            Math.round(this._bomberman.body.x) == Math.round(_door.body.x) &&
            Math.round(this._bomberman.body.y) == Math.round(_door.body.y)
          )
            this.win();
        },
        undefined,
        this
      );
    }

    /*
        this.physics.add.collider(this._explosion, this._layer, null, function(explosion, layer) {
            explosion.kill();
        }, this);*/

    this.physics.add.overlap(
      this._explosion,
      this._enemies,
      (_, enemy) => {
        const _enemy = enemy as Types.Physics.Arcade.SpriteWithDynamicBody;

        _enemy.setData('autonomy', false);
        _enemy.body.enable = false;

        this.destroyEnemy(_enemy);
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this._explosion,
      this._brick,
      (fragment, brick) => {
        const _fragment =
          fragment as Types.Physics.Arcade.SpriteWithDynamicBody;
        const _brick = brick as Types.Physics.Arcade.SpriteWithDynamicBody;

        _brick.anims.play('destroy');

        if (_brick.name == 'door-brick') {
          const _speciality = this.getItemFromPhaserGroup(
            this._specialties.getChildren(),
            'door'
          );

          if (_speciality) {
            _speciality.active = true;
          }
        } else if (_brick.name == 'power-brick') {
          const _speciality = this.getItemFromPhaserGroup(
            this._specialties.getChildren(),
            'power'
          );

          if (_speciality) {
            _speciality.active = true;
          }
        }

        _fragment.active = false;
      },
      undefined,
      this
    );

    this.moveCharacter();
    this.activeMotionEnemy();
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

  createMap() {
    this.cameras.main.backgroundColor =
      Phaser.Display.Color.HexStringToColor('#1F8B00');

    this._map = this.add.tilemap('world');
    const tilesMap = this._map.addTilesetImage('playing-environment');

    if (this._stageBomberman?.map && this._stageBomberman?.map.length > 0)
      this._map.objects = this._stageBomberman.map;

    //TODO: Pendiente ver como agregamos el GUID
    const _tiles = this._map.objects.find(
      (object) => object.name === 'Objects'
    );

    if (_tiles) {
      _tiles.objects.forEach(function (brick) {
        if (brick.name == '' || brick.name.includes('brick')) brick.gid = 10;
        else if (brick.name == 'power') brick.gid = 20;
        else if (brick.name == 'door') brick.gid = 15;
      }, this);

      console.log(_tiles);
    }

    //this._map.setCollisionBetween(1, 14, true, 'Map');
    this._map.setCollisionBetween(1, 14, true);

    this._brick = this.physics.add.group();
    this._specialties = this.physics.add.group();

    this.sound.play('stage-theme', { loop: true, volume: 0.5 });

    if (tilesMap) {
      const _layerTmp = this._map.createLayer('Map', tilesMap);

      if (_layerTmp) {
        this._layer = _layerTmp;
        //this._layer.resizeWorld();
      }
    }

    const _bricks = this._map.createFromObjects('Objects', {
      gid: 10,
      key: 'brick',
      frame: 0
    });

    this._brick.addMultiple(_bricks);

    this.anims.create({
      key: 'brick-wait',
      frames: this.anims.generateFrameNumbers('brick', {
        frames: [0]
      }),
      frameRate: 10
    });

    this.anims.create({
      key: 'brick-destroy',
      frames: this.anims.generateFrameNumbers('brick', {
        frames: [1, 2, 3, 4, 5, 6]
      }),
      frameRate: 10
    });

    this._brick.getChildren().forEach((element) => {
      const _element = element as Types.Physics.Arcade.SpriteWithDynamicBody;

      _element.anims.play('brick-wait');

      _element.body.setSize(16, 16, true);
      _element.body.immovable = true;

      this._brickPosition.push(
        Math.round(_element.body.x) + ',' + Math.round(_element.body.y)
      );
    }, this);

    const powers_group = [
      'power-1',
      'ExtendExplosion',
      'power-2',
      'AddBomb',
      'power-3',
      'TimeExploitBomb'
    ];

    let index = Math.floor(Math.random() * powers_group.length);

    if (index % 2 != 0) index = 0;

    const _doorSpeciality = this._map.createFromObjects('Objects', {
      gid: 15,
      key: 'door',
      frame: 0
    });

    _doorSpeciality[0].active = false;

    this._specialties.addMultiple(_doorSpeciality);

    const _speciality = this._map.createFromObjects('Objects', {
      gid: 20,
      key: powers_group[index],
      frame: 0
    });

    _speciality[0].active = false;
    _speciality[0].setData('TypePower', powers_group[++index]);

    this._specialties.addMultiple(_speciality);

    this._crossroads = this.physics.add.group();

    // var distance = 40 * 2,
    //   rows = 11 / 2,
    //   cols = 35 / 2;

    // //TODO: Pendiente
    // for (var i = 0, y = 117, id = 0; i < rows; i++, y += distance)
    //   for (var j = 0, x = 55; j < cols; j++, x += distance, id++) {
    //     //Modify JSON
    //     this._map.objects.Crossroads.push({
    //       height: 1.6,
    //       id: id,
    //       name: 'crossroad' + id,
    //       rotation: 0,
    //       type: '',
    //       visible: true,
    //       width: 1.6,
    //       x: x,
    //       y: y,
    //       gid: 30
    //     });
    //   }

    const _crossroadsTmp = this._map.createFromObjects('Crossroads', {
      id: 30,
      frame: 0
    });

    this._crossroads.addMultiple(_crossroadsTmp);
  }

  createControls() {
    if (this.input.keyboard) {
      this._directions = this.input.keyboard.createCursorKeys();
      this._put_bomb = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.X);
      this._exploit_bomb = this.input.keyboard.addKey(
        Input.Keyboard.KeyCodes.SPACE
      );
      this._save = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.S);
    }
  }

  createCharacter() {
    this._direction = '';

    this._bomberman = this.physics.add.sprite(45, 102, 'bomberman-move');
    // this._hero = this.physics.add.group();
    // this._hero.createMultiple({
    //   key: 'bomberman-dead',
    //   quantity: 1
    // });

    const timerLose = new Phaser.Time.TimerEvent({
      delay: 1000,
      callback: () => {
        const elapsedTime = timerLose.getElapsedSeconds();

        if (elapsedTime >= 4) {
          //this._timers[0].seconds = 0;
          timerLose.paused = true;

          if (this._stageBomberman) {
            this._stageBomberman.lives--;

            if (this._stageBomberman.lives >= 0) {
              this._stageBomberman.status = 'restart';
              this.scene.start('ChangeStage', this._stageBomberman);
            } else {
              this._stageBomberman.status = 'game-over';
              this.scene.start('ChangeStage', this._stageBomberman);
            }
          }
        }
      },
      callbackScope: this,
      loop: true
    });

    this.time.addEvent(timerLose);
    this._timers.push(timerLose);

    // this._soundLose = this.add.audio('lose');
    // this._soundJustDied = this.add.audio('just-died');
    // this._soundPower = this.add.audio('power');

    // this._bomberman = this._hero.create(45, 102, 'bomberman-move');
    // this._bomberman.name = 'hero';
    // this._bomberman.smoothed = false;

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [3, 4, 5]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [0, 1, 2]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [9, 10, 11]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [6, 7, 8]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNumbers('bomberman-dead'),
      frameRate: 8
    });

    // var right = this._bomberman.animations.add('right', [3, 4, 5], 10, true);
    // right.enableUpdate = true;
    // var left = this._bomberman.animations.add('left', [0, 1, 2], 10, true);
    // left.enableUpdate = true;
    // var up = this._bomberman.animations.add('up', [9, 10, 11], 10, true);
    // up.enableUpdate = true;
    // var down = this._bomberman.animations.add('down', [6, 7, 8], 10, true);
    // down.enableUpdate = true;

    this._bomberman.setScale(2.0);
    this._bomberman.body.setSize(
      this._bomberman.body.width - 5,
      this._bomberman.body.height - 2,
      true
    );

    this._bomberman.body.mass = 0;

    if (this._stageBomberman) {
      this._stageBomberman.playerPositions = {
        x: this._bomberman.body.x,
        y: this._bomberman.body.y
      };
    }

    this.cameras.main.startFollow(this._bomberman);
  }

  updateCharacter(power: string) {
    this.sound.stopByKey('stage-theme');
    this.sound.play('find-the-door', { loop: true });

    if (power == 'ExtendExplosion') {
      if (this._stageBomberman) {
        this._stageBomberman.stage_points += 160;
      }

      this._explosionLength++;
    } else if (power == 'AddBomb') {
      if (this._stageBomberman) {
        this._stageBomberman.stage_points += 180;
      }

      this._amountBombs++;
    }

    if (this._stageBomberman) {
      this._labels
        .getChildren()
        .find((obj) => obj.name === 'SCORE')
        ?.setState(this._stageBomberman?.stage_points);
    }
  }

  moveCharacter() {
    if (this._bomberman.active) {
      this._bomberman.body.velocity.x = 0;
      this._bomberman.body.velocity.y = 0;

      if (this._directions?.right.isDown) {
        this._bomberman.body.velocity.x = this._heroSpeed;
        if (this._direction != 'right') {
          this._bomberman.anims.play('right');
          this._direction = 'right';
        }
      } else if (this._directions?.left.isDown) {
        this._bomberman.body.velocity.x = -this._heroSpeed;
        if (this._direction != 'left') {
          this._bomberman.anims.play('left');
          this._direction = 'left';
        }
      } else if (this._directions?.up.isDown) {
        this._bomberman.body.velocity.y = -this._heroSpeed;
        if (this._direction != 'up') {
          this._bomberman.anims.play('up');
          this._direction = 'up';
        }
      } else if (this._directions?.down.isDown) {
        this._bomberman.body.velocity.y = this._heroSpeed;
        if (this._direction != 'down') {
          this._bomberman.anims.play('down');
          this._direction = 'down';
        }
      } else if (this._direction != 'stop') {
        this._bomberman.anims.stop();
        this._direction = 'stop';
      }

      if (this._put_bomb?.isDown) {
        this.putBomb(this._bomberman);
      } else if (this._exploit_bomb?.isDown) {
        this.exploitBomb(this._bombs.getFirstAlive());
      }
    }
  }

  win() {
    this.game.sound.stopAll();

    const highScore = localStorage.getItem('HightScore') ?? 0;

    if (highScore < localStorage.stage_points)
      localStorage.setItem('HightScore', localStorage.stage_points);

    this.sound.play('level-complete');
    this._timers[1].paused = true;

    this._bomberman.body.moves = false;

    if (this._stageBomberman) {
      this._stageBomberman.map = this._map.objects;
      this._stageBomberman.points = this._stageBomberman.stage_points;

      this._stageBomberman.stage_points += 450;
      this._stageBomberman.status = 'next-stage';

      this._labels
        .getChildren()
        .find((obj) => obj.name === 'SCORE')
        ?.setState(this._stageBomberman.stage_points);
    }

    const timerNextStage = new Phaser.Time.TimerEvent({
      delay: 1000,
      callback: () => {
        if (timerNextStage.getElapsedSeconds() > 5) {
          this._timers[4].paused = true;
          this.scene.start('ChangeStage', this._stageBomberman);
        }
      },
      callbackScope: this,
      loop: true
    });

    this.time.addEvent(timerNextStage);

    this._timers.push(timerNextStage);
  }

  lose() {
    this._bomberman.body.enable = false;

    this._bomberman.anims.play('die');

    this._timers[1].paused = true;

    if (this._stageBomberman) {
      this._stageBomberman.stage_points = 0;
      this._stageBomberman.stage_time = this._stageBomberman.time;
    }

    this._timers[0].paused = false;
    this.game.sound.stopAll();
    this.sound.play('lose');

    this._bomberman.on(
      Animations.Events.ANIMATION_COMPLETE_KEY,
      () => {
        this.sound.play('just-died');
      },
      this
    );
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
      'TIME: ' + this._stageBomberman?.time,
      style
    );

    information.setScrollFactor(0, 0);
    information.name = 'TIME';
    this._labels.add(information);
    distance += 170;

    const score = this.add.text(
      distance,
      22,
      this._stageBomberman!.points.toString(),
      style
    );

    score.setScrollFactor(0, 0);
    score.name = 'SCORE';
    this._labels.add(score);
    distance += 128;

    const lives = this.add.text(
      distance,
      22,
      'LEFT: ' + this._stageBomberman?.lives,
      style
    );

    lives.setScrollFactor(0, 0);
    lives.name = 'LEFT';
    this._labels.add(lives);

    const timerGame = new Phaser.Time.TimerEvent({
      delay: 1000,
      callback: () => {
        this._stageBomberman!.stage_time--;

        if (this._stageBomberman!.stage_time < 0) {
          this._timers[1].paused = false;
          this.replaceEnemies('coin');
        } else {
          const _label = this.getItemFromPhaserGroup(
            this._labels.getChildren(),
            'TIME'
          );

          if (_label) {
            (_label as GameObjects.Text).setText(
              'TIME: ' + this._stageBomberman?.stage_time
            );
          }
        }
      },
      callbackScope: this,
      loop: true
    });

    this.time.addEvent(timerGame);

    this._timers.push(timerGame);
  }

  createBomb() {
    this._bombs = this.physics.add.group();
    this._bombs.createMultiple({
      key: 'bomb',
      quantity: 3,
      setScale: { x: 1.8, y: 18 }
    });

    this._bombs.getChildren().forEach((element) => {
      const _element = element as Types.Physics.Arcade.SpriteWithDynamicBody;

      _element.setScale(1.8);
      _element.body.immovable = true;

      this._brickPosition.push(
        Math.round(_element.body.x) + ',' + Math.round(_element.body.y)
      );
    }, this);

    var distance = 23;

    this._explosionProperties = [
      [0, 0, 'explosion-center'],
      [0, distance * -1, 'explosion-upper-lenght'],
      [0, distance, 'explosion-lower-lenght'],
      [distance, 0, 'explosion-right-lenght'],
      [distance * -1, 0, 'explosion-left-lenght']
    ];

    this._explosionLengthProperties = [
      'explosion-extension-vertical',
      'explosion-extension-vertical',
      'explosion-extension-horizontal',
      'explosion-extension-horizontal'
    ];

    this._explosionLength = 0;
    this._amountBombs = 1;
    this._timeExplosion = 10;

    const _timerPutBomb = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: 5,
      paused: true,
      callbackScope: this,
      loop: false
    });

    this.time.addEvent(_timerPutBomb);

    const _timerExploitBomb = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: 3,
      paused: true,
      callbackScope: this,
      loop: false
    });

    this.time.addEvent(_timerExploitBomb);

    this._timers.push(_timerPutBomb, _timerExploitBomb);
  }

  putBomb(character: Types.Physics.Arcade.SpriteWithDynamicBody) {
    if (this._timers[2].paused || this._bombs.getTotalUsed() == 0) {
      const newBomb = this._bombs.getFirstAlive(false);

      if (newBomb) {
        newBomb.reset(
          Math.round(character.body.x),
          Math.round(character.body.y)
        );

        newBomb.body.setSize(
          newBomb.body.width - 4,
          newBomb.body.height - 4,
          2,
          2
        );

        newBomb.animations.play('wait', 3, true);
        this.sound.play('put-bomb');

        this._timers[2].paused = false;
        this._timers[3].paused = false;
      }
    }
  }

  exploitBomb(bomb: Types.Physics.Arcade.SpriteWithDynamicBody) {
    if (bomb && this._timers[3].paused) {
      bomb.active = false;

      this._explosion = this.physics.add.group();

      for (var i = 0; i < this._explosionProperties.length; i++) {
        var x = bomb.body.x + this._explosionProperties[i][0],
          y = bomb.body.y + this._explosionProperties[i][1];

        for (var j = 0, k = i - 1; j < this._explosionLength && i > 0; j++) {
          var explosion_extension = this._explosion.create(
            x,
            y,
            this._explosionLengthProperties[k]
          );

          explosion_extension.name = this._explosionLengthProperties[k];
          explosion_extension.setScale(1.6);
          explosion_extension.body.setSize(
            explosion_extension.body.width - 5,
            explosion_extension.body.width - 5,
            1,
            1
          );
          explosion_extension.animations.add('kaboom');
          explosion_extension.animations.play('kaboom', 6, false, true);
          x += this._explosionProperties[i][0];
          y += this._explosionProperties[i][1];
        }

        var explosion_fragment = this._explosion.create(
          x,
          y,
          this._explosionProperties[i][2]
        );
        explosion_fragment.name = this._explosionProperties[i][2];
        explosion_fragment.smoothed = false;
        explosion_fragment.scale.setTo(1.6, 1.6);
        explosion_fragment.body.setSize(
          explosion_fragment.body.width - 5,
          explosion_fragment.body.width - 5,
          1,
          1
        );
        explosion_fragment.animations.add('kaboom');
        explosion_fragment.animations.play('kaboom', 6, false, true);
      }

      this.sound.play('explosion');

      if (this._bombs.getTotalUsed() > 0) this._timers[3].paused = false;

      //this._bombs.sort('y', Phaser.Group.SORT_ASCENDING);
    }
  }

  createEnemies() {
    this._enemies = this.physics.add.group();

    this._numberEnemies = 7;
    this._typesEnemies = [
      'ballon',
      30,
      'snow',
      50,
      'cookie',
      60,
      'barrel',
      40,
      'water',
      20,
      'ghost',
      25,
      'bear',
      70,
      'coin',
      80
    ];

    this.anims.create({
      key: 'coin-right',
      frames: this.anims.generateFrameNumbers('cookie', {
        frames: [0, 1, 2, 3, 4]
      }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'coin-left',
      frames: this.anims.generateFrameNumbers('cookie', {
        frames: [7, 8, 9, 10, 11]
      }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'coin-die',
      frames: this.anims.generateFrameNumbers('cookie', {
        frames: [5]
      }),
      frameRate: 6,
      repeat: -1
    });

    this.anims.create({
      key: 'ballon-right',
      frames: this.anims.generateFrameNumbers('ballon', {
        frames: [4, 5, 6]
      }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'ballon-left',
      frames: this.anims.generateFrameNumbers('ballon', {
        frames: [0, 1, 2]
      }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'ballon-die',
      frames: this.anims.generateFrameNumbers('ballon', {
        frames: [3]
      }),
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'destroy-enemy',
      frames: this.anims.generateFrameNumbers('destroy-enemy'),
      frameRate: 2
    });

    if (this._stageBomberman) {
      const stage = this._stageBomberman.stage - 1,
        split = Math.round(
          this._numberEnemies / this._stageBomberman.stage_enemies[stage].length
        );

      for (let i = 0; i < this._numberEnemies; i++)
        for (let j = 0; j < split; j++)
          this.putEnemy(this._stageBomberman.stage_enemies[stage][i], false);
    }
  }

  putEnemy(type: string, replace: boolean, x?: number, y?: number) {
    let coords = [];
    let position = { x: 0, y: 0 };
    let index = this._typesEnemies.indexOf(type);

    const _tiles = this._map.objects.find(
      (object) => object.name === 'Objects'
    );

    if (_tiles) {
      const _positionTmp =
        _tiles.objects[Math.floor(Math.random() * _tiles.objects.length)];

      position.x = _positionTmp.x ?? 0;
      position.y = _positionTmp.y ?? 0;
    }

    if (x == undefined && y == undefined) {
      coords = [position.x - 12, position.y - 15];
    } else coords = [x, y];

    if (index != -1) {
      const enemy: Types.Physics.Arcade.SpriteWithDynamicBody =
        this._enemies.create(coords[0], coords[1], type);
      enemy.body.setSize(enemy.body.width - 2, enemy.body.height - 2, true);

      if (replace || this.physics.overlap(enemy, this._bomberman)) {
        this._enemies.remove(enemy);
        //this.createEnemies(type, replace, x, y);
      } else {
        if (type == 'coin') {
          enemy.anims.play('coin-right');

          enemy.setData('physicsLayer', false);
          enemy.setData('physicsBrick', false);
        } else {
          enemy.anims.play('ballon-right');

          if (type == 'ghost') {
            enemy.setData('physicsBrick', false);
            enemy.setData('physicsLayer', true);
          } else {
            enemy.setData('physicsBrick', true);
            enemy.setData('physicsLayer', true);
          }
        }

        enemy.name = type;
        enemy.setData('currentCrossroad', '');
        enemy.setData('velocity', this._typesEnemies[++index]);
        enemy.setData('autonomy', true);
        enemy.setScale(2.0, 2.0);
      }
    }
  }

  destroyEnemy(enemy: Types.Physics.Arcade.SpriteWithDynamicBody) {
    enemy.anims.play('die');

    enemy.on(
      Animations.Events.ANIMATION_COMPLETE_KEY,
      () => {
        enemy.anims.play('destroy-enemy');
        enemy.on(
          Animations.Events.ANIMATION_COMPLETE_KEY,
          () => {
            this._enemies.remove(enemy);
          },
          this
        );
      },
      this
    );

    if (this._enemies.getLength() == 1) this.sound.play('last-enemy');

    if (this._stageBomberman) {
      if (enemy.name == 'ballon') {
        this._stageBomberman.stage_points += 50;
      } else if (enemy.name == 'snow') {
        this._stageBomberman.stage_points += 90;
      } else if (enemy.name == 'cookie') {
        this._stageBomberman.stage_points += 150;
      } else if (enemy.name == 'ghost') {
        this._stageBomberman.stage_points += 70;
      } else if (enemy.name == 'bear') {
        this._stageBomberman.stage_points += 250;
      } else if (enemy.name == 'coin') {
        this._stageBomberman.stage_points += 350;
      }

      const label = this.getItemFromPhaserGroup(
        this._labels.getChildren(),
        'SCORE'
      );

      if (label) {
        (label as GameObjects.Text).setText(
          this._stageBomberman.stage_points.toString()
        );
      }
    }
  }

  replaceEnemies(type: string) {
    if (this._enemies.getLength() > 0) {
      var positions: number[][] = [];

      this._enemies.getChildren().forEach((enemy) => {
        const _enemy = enemy as Types.Physics.Arcade.SpriteWithDynamicBody;

        positions.push([_enemy.body.x, _enemy.body.y]);
      }, this);

      this._enemies.destroy(true, true);

      positions.forEach((coords) => {
        this.putEnemy('coin', false, coords[0], coords[1]);
      }, this);
    } else {
      for (var i = 0; i < this._numberEnemies; i++)
        this.putEnemy('coin', false);
    }
  }

  createAutonomy() {
    this._movements = [
      function (enemy: Types.Physics.Arcade.SpriteWithDynamicBody) {
        enemy.anims.play('right');
        enemy.body.velocity.x = enemy.getData('velocity');
      },
      function (enemy: Types.Physics.Arcade.SpriteWithDynamicBody) {
        enemy.anims.play('left');
        enemy.body.velocity.x = enemy.getData('velocity') * -1;
      },
      function (enemy: Types.Physics.Arcade.SpriteWithDynamicBody) {
        enemy.anims.play('right');
        enemy.body.velocity.y = enemy.getData('velocity');
      },
      function (enemy: Types.Physics.Arcade.SpriteWithDynamicBody) {
        enemy.anims.play('left');
        enemy.body.velocity.y = enemy.getData('velocity') * -1;
      }
    ];
  }

  activeMotionEnemy() {
    this._enemies.getChildren().forEach((enemy) => {
      const _enemy = enemy as Types.Physics.Arcade.SpriteWithDynamicBody;

      if (_enemy.getData('autonomy') as boolean) {
        if (enemy.name == 'ballon' || enemy.name == 'snow') {
          var move = this.physics.overlap(
            enemy,
            this._crossroads,
            undefined,
            (enemy, crossroad) => {
              const __enemy =
                enemy as Types.Physics.Arcade.SpriteWithDynamicBody;
              const __crossroad =
                crossroad as Types.Physics.Arcade.SpriteWithDynamicBody;

              if (__crossroad.name != __enemy.getData('currentCrossroad')) {
                __enemy.setData('currentCrossroad', __crossroad.name);
                return true;
              } else return false;
            },
            this
          );

          if (move || _enemy.body.speed == 0) {
            _enemy.body.velocity.x = 0;
            _enemy.body.velocity.y = 0;
            this._movements[Math.floor(Math.random() * this._movements.length)](
              enemy
            );
          }
        } else if (enemy.name == 'coin') {
          if (this._bomberman.active) {
            _enemy.body.velocity.x = 0;
            _enemy.body.velocity.y = 0;

            if (
              Math.round(this._bomberman.body.x) > Math.round(_enemy.body.x) &&
              Math.round(this._bomberman.body.y) != Math.round(_enemy.body.y)
            ) {
              this._movements[0](enemy);
            } else if (
              Math.round(this._bomberman.body.x) < Math.round(_enemy.body.x) &&
              Math.round(this._bomberman.body.y) != Math.round(_enemy.body.y)
            ) {
              this._movements[1](enemy);
            } else if (
              Math.round(this._bomberman.body.y) > Math.round(_enemy.body.y) &&
              Math.round(this._bomberman.body.x) != Math.round(_enemy.body.x)
            ) {
              this._movements[2](enemy);
            } else if (
              Math.round(this._bomberman.body.y) < Math.round(_enemy.body.y) &&
              Math.round(this._bomberman.body.x) != Math.round(_enemy.body.x)
            ) {
              this._movements[3](enemy);
            } else if (
              Math.round(this._bomberman.body.x) == Math.round(_enemy.body.x) &&
              Math.round(this._bomberman.body.y) != Math.round(_enemy.body.y)
            ) {
              if (
                Math.round(this._bomberman.body.y) > Math.round(_enemy.body.y)
              )
                this._movements[2](enemy);
              else this._movements[3](enemy);
            } else if (
              Math.round(this._bomberman.body.y) == Math.round(_enemy.body.y) &&
              Math.round(this._bomberman.body.x) != Math.round(_enemy.body.x)
            ) {
              if (
                Math.round(this._bomberman.body.x) > Math.round(_enemy.body.x)
              )
                this._movements[0](enemy);
              else this._movements[1](enemy);
            }
          } else enemy.name = 'ballon';
        }
      }
    }, this);
  }

  private getItemFromPhaserGroup<G extends GameObjects.GameObject>(
    group: G[],
    key: string
  ) {
    const _label = group.find((obj) => obj.name === key);

    if (_label) {
      return _label;
    }

    return null;
  }
}
