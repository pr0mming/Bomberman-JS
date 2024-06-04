import { Physics, Scene, Time } from 'phaser';

// Sprites
import { Bomb } from '@game/sprites/bomb/Bomb';
import { ExplosionGroup } from '@game/sprites/explosion/ExplosionGroup';

import { WallBuilderManager } from '@src/game/managers/WallBuilderManager';

// Enums
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';

interface IBombGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  wallBuilderManager: WallBuilderManager;
}

export class BombGroup extends Physics.Arcade.StaticGroup {
  private _timers: Map<number, Time.TimerEvent>;

  private _maxAmountBombs: number;
  private _isActiveRemoteControl: boolean;

  private _timePutBomb: number;
  private _timeExplosion: number;

  private _explosionGroup: ExplosionGroup;

  private _wallBuilderManager: WallBuilderManager;

  constructor({ world, scene, wallBuilderManager }: IBombGroupProps) {
    super(world, scene);

    this.classType = Bomb;

    this._timers = new Map<number, Time.TimerEvent>();

    this._maxAmountBombs = 1;
    this._isActiveRemoteControl = false;

    this._timePutBomb = 0;
    this._timeExplosion = 2;

    this._explosionGroup = new ExplosionGroup({
      world: this.world,
      scene: this.scene,
      wallBuilderManager
    });

    this._wallBuilderManager = wallBuilderManager;
  }

  putBomb(x: number, y: number) {
    if (this._canPutBomb(x, y)) {
      this.scene.sound.play('put-bomb');

      const newBomb = new Bomb({
        scene: this.scene,
        x,
        y
      });

      this.add(newBomb, true);

      this._wallBuilderManager.deletePositionFree(x, y);

      if (!this.isActiveRemoteControl) {
        this._setExplodeBombTimer(false);
      }

      this._setPutBombTimer(false);
    }
  }

  exploitByBomb(bomb: Bomb) {
    this._exploitBomb(bomb);
  }

  exploitNextBomb() {
    if (this._canExploitBomb()) {
      const bomb = this.getFirstAlive() as Bomb;

      this._exploitBomb(bomb);
    }
  }

  private _exploitBomb(bomb: Bomb) {
    if (bomb.body) {
      const posX = Math.floor(bomb.body.center.x);
      const posY = Math.floor(bomb.body.center.y);

      const timerFreePosition = new Phaser.Time.TimerEvent({
        delay: 1000,
        callback: () => {
          this._wallBuilderManager.addPositionFree(posX, posY);
        },
        callbackScope: this
      });

      this.scene.time.addEvent(timerFreePosition);

      this._explosionGroup.addNewExplosion(posX, posY);

      bomb.destroy(true);
    }
  }

  private _setPutBombTimer(isPaused: boolean) {
    const _timerPutBomb = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._timePutBomb,
      paused: isPaused,
      callbackScope: this
    });

    this.scene.time.addEvent(_timerPutBomb);
    this._timers.set(TIMER_GAME_ENUM.PUT_BOMB, _timerPutBomb);
  }

  private _setExplodeBombTimer(isPaused: boolean) {
    const _timerExploitBomb = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._timeExplosion,
      paused: isPaused,
      callback: () => {
        const { repeatCount } = _timerExploitBomb;

        if (repeatCount <= 0) {
          const bomb = this.getFirstAlive() as Bomb;

          if (bomb) {
            this.exploitByBomb(bomb);
          }
        }
      },
      callbackScope: this
    });

    this.scene.time.addEvent(_timerExploitBomb);
    this._timers.set(TIMER_GAME_ENUM.EXPLOIT_BOMB, _timerExploitBomb);
  }

  private _canPutBomb(x: number, y: number) {
    const _timerPutBomb = this._timers.get(TIMER_GAME_ENUM.PUT_BOMB);

    if (!this._wallBuilderManager.isPositionFree(x, y)) return false;

    return (
      (_timerPutBomb === undefined ||
        _timerPutBomb?.elapsed ||
        _timerPutBomb?.repeatCount === 0) &&
      this.getTotalUsed() < this._maxAmountBombs
    );
  }

  private _canExploitBomb() {
    return this._isActiveRemoteControl && this.getTotalUsed() > 0;
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
