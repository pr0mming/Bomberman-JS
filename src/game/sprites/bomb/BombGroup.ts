import { Physics, Scene, Time } from 'phaser';

// Sprites
import { Bomb } from '@game/sprites/bomb/Bomb';
import { ExplosionGroup } from '@game/sprites/explosion/ExplosionGroup';

// Enums
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';

interface IBombGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
}

export class BombGroup extends Physics.Arcade.StaticGroup {
  private _timers: Map<number, Time.TimerEvent>;

  private _maxAmountBombs: number;
  private _isActiveRemoteControl: boolean;

  private _timePutBomb: number;
  private _timeExplosion: number;

  private _explosionGroup: ExplosionGroup;

  constructor({ world, scene }: IBombGroupProps) {
    super(world, scene);

    this.classType = Bomb;

    this._timers = new Map<number, Time.TimerEvent>();

    this._maxAmountBombs = 1;
    this._isActiveRemoteControl = false;

    this._timePutBomb = 5;
    this._timeExplosion = 5;

    this._explosionGroup = new ExplosionGroup({
      world: this.world,
      scene: this.scene
    });

    this._setUpTimers();
  }

  putBomb(x: number, y: number) {
    if (this._canPutBomb()) {
      this.scene.sound.play('put-bomb');

      const newBomb = new Bomb({
        scene: this.scene,
        x,
        y
      });

      this.add(newBomb, true);

      let _timerPutBomb = this._timers.get(TIMER_GAME_ENUM.PUT_BOMB);

      if (_timerPutBomb) {
        _timerPutBomb = new Phaser.Time.TimerEvent({
          delay: 1000,
          repeat: this._timePutBomb,
          callbackScope: this
        });

        this._timers.set(TIMER_GAME_ENUM.PUT_BOMB, _timerPutBomb);

        this.scene.time.addEvent(_timerPutBomb);
      }
    }
  }

  exploitByBomb(bomb: Bomb) {
    this._exploitBomb(bomb);
  }

  exploitNextBomb() {
    if (this._canExploitBomb()) {
      const bomb = this.getFirstAlive() as Bomb;

      this._exploitBomb(bomb);

      let _timerExloitBomb = this._timers.get(TIMER_GAME_ENUM.EXPLOIT_BOMB);

      if (this.getTotalUsed() > 0 && _timerExloitBomb) {
        _timerExloitBomb = new Phaser.Time.TimerEvent({
          delay: 1000,
          repeat: this._timeExplosion,
          callbackScope: this
        });

        this._timers.set(TIMER_GAME_ENUM.EXPLOIT_BOMB, _timerExloitBomb);

        this.scene.time.addEvent(_timerExloitBomb);
      }
    }
  }

  private _exploitBomb(bomb: Bomb) {
    if (bomb.body) {
      this._explosionGroup.addNewExplosion(
        bomb.body.center.x,
        bomb.body.center.y
      );
    }

    bomb.destroy(true);
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

    return (
      _timerPutBomb?.paused ||
      _timerPutBomb?.repeatCount === 0 ||
      this.getTotalUsed() < this._maxAmountBombs
    );
  }

  private _canExploitBomb() {
    if (this._isActiveRemoteControl) {
      return true;
    }

    const _timerExloitBomb = this._timers.get(TIMER_GAME_ENUM.EXPLOIT_BOMB);

    return (
      (_timerExloitBomb?.paused || _timerExloitBomb?.repeatCount === 0) &&
      this.getTotalUsed() > 0
    );
  }

  public get explosionGroup() {
    return this._explosionGroup;
  }

  public get maxAmountBombs() {
    return this._maxAmountBombs;
  }

  public set maxAmountBombs(v: number) {
    this._maxAmountBombs = v;
  }

  public get isActiveRemoteControl() {
    return this._isActiveRemoteControl;
  }

  public set isActiveRemoteControl(v: boolean) {
    this._isActiveRemoteControl = v;
  }
}

export default BombGroup;
