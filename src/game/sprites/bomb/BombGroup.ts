import { Physics, Scene, Time } from 'phaser';
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';
import { Bomb } from '@src/game/sprites/bomb/Bomb';

interface IBombGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
}

export class BombGroup extends Physics.Arcade.StaticGroup {
  private _timers: Map<number, Time.TimerEvent>;

  private _explosionLength: number;
  private _maxAmountBombs: number;

  private _timePutBomb: number;
  private _timeExplosion: number;

  private _explosion: Physics.Arcade.Group;
  private _explosionProperties: any;
  private _explosionLengthProperties: any;

  constructor({ world, scene }: IBombGroupProps) {
    super(world, scene);

    this.classType = Bomb;

    this._timers = new Map<number, Time.TimerEvent>();
    this._explosionLength = 0;
    this._maxAmountBombs = 1;
    this._timePutBomb = 5 * 1000;
    this._timeExplosion = 10 * 1000;

    const distance = 23;

    this._explosion = this.scene.physics.add.group();

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

    this._setUpTimers();
  }

  putBomb(x: number, y: number) {
    if (this._canPutBomb()) {
      const newBomb = new Bomb({
        scene: this.scene,
        x,
        y
      });

      this.add(newBomb, true);

      const _timerPutBomb = this._timers.get(TIMER_GAME_ENUM.PUT_BOMB);
      const _timerExloitBomb = this._timers.get(TIMER_GAME_ENUM.EXPLOIT_BOMB);

      if (_timerPutBomb) {
        _timerPutBomb.reset({
          delay: 1000,
          repeat: this._timePutBomb
        });
      }

      if (_timerExloitBomb?.paused) _timerExloitBomb.paused = false;
    }
  }

  exploitBomb() {
    if (this._canExploitBomb()) {
      const bomb = this.getFirstAlive();

      bomb.active = false;

      for (let i = 0; i < this._explosionProperties.length; i++) {
        let x = bomb.body.x + this._explosionProperties[i][0];
        let y = bomb.body.y + this._explosionProperties[i][1];

        for (let j = 0, k = i - 1; j < this._explosionLength && i > 0; j++) {
          const explosion_extension = this.scene.physics.add.sprite(
            x,
            y,
            this._explosionLengthProperties[k]
          );

          explosion_extension.name = this._explosionLengthProperties[k];
          explosion_extension.setScale(1.6);
          explosion_extension.body.setSize(
            explosion_extension.body.width - 5,
            explosion_extension.body.width - 5,
            true
          );

          explosion_extension.anims.create({
            key: 'kaboom',
            frames: this.scene.anims.generateFrameNames(
              this._explosionLengthProperties[k]
            ),
            frameRate: 6
          });

          explosion_extension.anims.play('kaboom');
          x += this._explosionProperties[i][0];
          y += this._explosionProperties[i][1];

          this._explosion.add(explosion_extension);
        }

        const explosion_fragment = this.scene.physics.add.sprite(
          x,
          y,
          this._explosionProperties[i][2]
        );

        explosion_fragment.name = this._explosionProperties[i][2];
        explosion_fragment.setScale(1.6);
        explosion_fragment.body.setSize(
          explosion_fragment.body.width - 5,
          explosion_fragment.body.width - 5,
          true
        );

        explosion_fragment.anims.create({
          key: 'kaboom',
          frames: this.scene.anims.generateFrameNames(
            this._explosionProperties[i][2]
          ),
          frameRate: 6
        });

        explosion_fragment.anims.play('kaboom');
      }

      this.scene.sound.play('explosion');

      const _timerExloitBomb = this._timers.get(TIMER_GAME_ENUM.EXPLOIT_BOMB);

      if (this.getTotalUsed() > 0 && _timerExloitBomb) {
        _timerExloitBomb.reset({
          delay: 1000,
          repeat: this._timeExplosion
        });
      }

      //this._bombs.sort('y', Phaser.Group.SORT_ASCENDING);
    }
  }

  private _setUpTimers() {
    const _timerPutBomb = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._timePutBomb,
      paused: true,
      callbackScope: this
    });

    this.scene.time.addEvent(_timerPutBomb);
    this._timers.set(TIMER_GAME_ENUM.PUT_BOMB, _timerPutBomb);

    const _timerExploitBomb = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._timeExplosion,
      paused: true,
      callbackScope: this
    });

    this.scene.time.addEvent(_timerExploitBomb);
    this._timers.set(TIMER_GAME_ENUM.EXPLOIT_BOMB, _timerExploitBomb);
  }

  private _canPutBomb() {
    const _timerPutBomb = this._timers.get(TIMER_GAME_ENUM.PUT_BOMB);

    return _timerPutBomb?.paused || this.getTotalUsed() < this._maxAmountBombs;
  }

  private _canExploitBomb() {
    const _timerExloitBomb = this._timers.get(TIMER_GAME_ENUM.EXPLOIT_BOMB);

    return _timerExloitBomb?.paused && this.getTotalUsed() > 0;
  }

  public get explosion() {
    return this._explosion;
  }

  public get explosionLength() {
    return this._explosionLength;
  }

  public set setExplosionLength(v: number) {
    this._explosionLength = v;
  }

  public get maxAmountBombs() {
    return this._maxAmountBombs;
  }

  public set setMaxAmountBombs(v: number) {
    this._maxAmountBombs = v;
  }
}

export default BombGroup;
