import { Physics, Scene, Time } from 'phaser';

// Sprites
import { Bomb } from '@game/sprites/bomb/Bomb';
import { ExplosionGroup } from '@game/sprites/explosion/ExplosionGroup';

import { WallBuilderManager } from '@game/managers/WallBuilderManager';

// Enums
import { TIMER_GAME_ENUM } from '@game/common/enums/TimerGameEnum';

interface IBombGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  wallBuilderManager: WallBuilderManager;
}

/**
 * This class manage all related to any bomb (when and where to put) and it also trigger the explosion
 */
export class BombGroup extends Physics.Arcade.StaticGroup {
  private _timers: Map<number, Time.TimerEvent>;

  // Max ammount of bombs to put in the stage
  private _maxAmountBombs: number;

  // PowerUp
  private _isActiveRemoteControl: boolean;

  // Delay to put and explode a bomb
  private _timePutBomb: number;
  private _timeExplosion: number;

  private _explosionGroup: ExplosionGroup;

  // It's useful to know where to put the bomb
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

  /**
   * This method is used by the player to put a bomb and perform some validations
   * @param x position in axis X to put the new bomb
   * @param y position in axis Y to put the new bomb
   */
  putBomb(x: number, y: number) {
    if (this._canPutBomb(x, y)) {
      this.scene.sound.play('put-bomb');

      const newBomb = new Bomb({
        scene: this.scene,
        x,
        y
      });

      this.add(newBomb, true);

      // This is useful to control a chain explosion ...
      this._wallBuilderManager.deletePositionFree(x, y);

      if (!this.isActiveRemoteControl) {
        this._setExplodeBombTimer(newBomb);
      }

      // Set up delay to put another bomb again ...
      this._setPutBombTimer();
    }
  }

  /**
   * This method is used by a explosion to explode a close bomb
   */
  exploitByBomb(bomb: Bomb) {
    this._exploitBomb(bomb);
  }

  /**
   * This method is used by the player from the Game scene
   */
  exploitNextBomb() {
    if (this._canExploitBomb()) {
      const bomb = this.getFirstAlive() as Bomb;

      this._exploitBomb(bomb);
    }
  }

  /**
   * This method mark the occupied position by the bomb (to explode) as free, then is created the explosion
   * @param bomb sprite reference
   */
  private _exploitBomb(bomb: Bomb) {
    // This validation is important,
    // because when a explosion explode a close bomb this body is undefined when is called by the timer of the bomb reference
    if (bomb.body) {
      const posX = Math.floor(bomb.body.center.x);
      const posY = Math.floor(bomb.body.center.y);

      // Important: This little delay is useful to create the effect of a chain explosion
      const timerFreePosition = new Phaser.Time.TimerEvent({
        delay: 400,
        callback: () => {
          // Release position to put another bomb there again in the future ...
          this._wallBuilderManager.addPositionFree(posX, posY);
        },
        callbackScope: this
      });

      this.scene.time.addEvent(timerFreePosition);

      this._explosionGroup.addNewExplosion(posX, posY);

      bomb.destroy(true);
    }
  }

  /**
   * This method set up a simple timeout to check if is possible put another bomb
   */
  private _setPutBombTimer() {
    const _timerPutBomb = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._timePutBomb,
      callbackScope: this
    });

    this.scene.time.addEvent(_timerPutBomb);
    this._timers.set(TIMER_GAME_ENUM.PUT_BOMB, _timerPutBomb);
  }

  /**
   * This method set up a timeout to explode the bomb (in case the powerUp isn't active)
   * As each bomb is placed, each timer will be set up, it is because a bomb can be also explode by an explosion ...
   * @param bomb sprite reference
   */
  private _setExplodeBombTimer(bomb: Bomb) {
    const _timerExploitBomb = new Phaser.Time.TimerEvent({
      delay: 1000,
      repeat: this._timeExplosion,
      callback: () => {
        const { repeatCount } = _timerExploitBomb;

        if (repeatCount <= 0) {
          this._exploitBomb(bomb);
        }
      },
      callbackScope: this
    });

    this.scene.time.addEvent(_timerExploitBomb);
  }

  /**
   * This method checks if the timer (delay) isn't active and if the player hasn't reached the limit of max bombs to put
   * It also checks if can put a bomb at the X, Y position (for example, you can't put a bomb over other one...)
   * @param x position in axis X to put the bomb
   * @param y position in axis Y to put the bomb
   * @returns if can put or not the bomb
   */
  private _canPutBomb(x: number, y: number): boolean {
    const _timerPutBomb = this._timers.get(TIMER_GAME_ENUM.PUT_BOMB);

    if (!this._wallBuilderManager.isPositionFree(x, y)) return false;

    return (
      (_timerPutBomb === undefined || _timerPutBomb?.repeatCount === 0) &&
      this.getTotalUsed() < this._maxAmountBombs
    );
  }

  /**
   * This method returns if can explode a bomb taking in account the powerUp of remote control
   * @returns if can explode or not the bomb
   */
  private _canExploitBomb(): boolean {
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
