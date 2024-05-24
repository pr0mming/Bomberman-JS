import { Physics, Scene } from 'phaser';
import { Player } from '@src/game/sprites/player/Player';
import { IEnemy } from '@src/game/common/interfaces/IEnemy';

import { IEnemyMotion } from '@src/game/common/interfaces/IEnemyMotion';
import { ISpritePosition } from '@src/game/common/interfaces/ISpritePosition';

import { EnemyMotionFactory } from '@src/game/managers/enemy-motion/EnemyMotionFactory';

import { ENEMY_MOTION_ENUM } from '@src/game/common/enums/EnemyMotionEnum';
import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';
import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';

interface IEnemyProps {
  scene: Scene;
  x: number;
  y: number;
  type: ENEMY_ENUM;
  enemyData: IEnemy;
  player: Player;
}

export class Enemy extends Physics.Arcade.Sprite {
  private _type: ENEMY_ENUM;
  private _direction: ENEMY_DIRECTION_ENUM;
  private _enemyData: IEnemy;
  private _player: Player;

  private _animLeftKey: string;
  private _animRightKey: string;
  private _retracedMotionsAmmount: number;
  private _mapCrossroadOffset: number;
  private _lastCrossroadTouched?: ISpritePosition;

  private _motionManager?: IEnemyMotion;

  constructor({ scene, x, y, type, enemyData, player }: IEnemyProps) {
    super(scene, x, y, enemyData.textureKey);

    scene.physics.add.existing(this);

    this._type = type;
    this._direction = ENEMY_DIRECTION_ENUM.LEFT;
    this._enemyData = enemyData;
    this._player = player;

    this._animLeftKey = `${this._type}-left`;
    this._animRightKey = `${this._type}-right`;
    this._retracedMotionsAmmount = 0;
    this._mapCrossroadOffset = 50;
    this._lastCrossroadTouched = { x, y };

    this.setScale(2.0);
  }

  private _updateSpriteMotion(fromPosition: ISpritePosition) {
    switch (this._direction) {
      case ENEMY_DIRECTION_ENUM.LEFT:
        this.play(this._animLeftKey);
        this.scene.physics.moveTo(
          this,
          fromPosition.x - this._mapCrossroadOffset,
          fromPosition.y,
          this._enemyData.velocity
        );

        break;

      case ENEMY_DIRECTION_ENUM.RIGH:
        this.play(this._animRightKey);
        this.scene.physics.moveTo(
          this,
          fromPosition.x + this._mapCrossroadOffset,
          fromPosition.y,
          this._enemyData.velocity
        );

        break;

      case ENEMY_DIRECTION_ENUM.DOWN:
        this.play(this._animLeftKey);
        this.scene.physics.moveTo(
          this,
          fromPosition.x,
          fromPosition.y + this._mapCrossroadOffset,
          this._enemyData.velocity
        );

        break;

      case ENEMY_DIRECTION_ENUM.UP:
        this.play(this._animRightKey);
        this.scene.physics.moveTo(
          this,
          fromPosition.x,
          fromPosition.y - this._mapCrossroadOffset,
          this._enemyData.velocity
        );

        break;

      default:
        break;
    }
  }

  private _computeNewDirection(fromPosition: ISpritePosition) {
    const newDirection = this._motionManager?.computeNewDirection();

    if (newDirection !== undefined) {
      this._direction = newDirection;

      this._updateSpriteMotion({
        x: fromPosition.x,
        y: fromPosition.y
      });

      this._retracedMotionsAmmount = 0;
    }
  }

  setMotionManager(type: ENEMY_MOTION_ENUM) {
    this._motionManager = EnemyMotionFactory.getInstance({
      type,
      player: this._player,
      enemyBody: this.body
    });
  }

  dispatchMotion() {
    // Stop the motion ...
    this.setVelocity(0);

    if (this._lastCrossroadTouched) {
      // So important: Reset the enemy position according to the crossroad it's on
      // Otherwise it'll be a huge offset to detect the next crossroad
      // and the enemys will never execute a new movement
      this.setPosition(
        this._lastCrossroadTouched.x,
        this._lastCrossroadTouched.y
      );

      this._computeNewDirection({
        x: this._lastCrossroadTouched.x,
        y: this._lastCrossroadTouched.y
      });

      this._retracedMotionsAmmount = 0;
    }
  }

  retraceMotion() {
    // Stop the motion ...
    this.setVelocity(0);

    if (this._retracedMotionsAmmount >= 5 && this.body) {
      this._computeNewDirection({
        x: this.body.center.x,
        y: this.body.center.y
      });

      this._retracedMotionsAmmount = 0;

      return;
    }

    const newDirection = this._motionManager?.getOppositeDirection(
      this._direction
    );

    if (newDirection !== undefined && this.body) {
      this._direction = newDirection;

      this._updateSpriteMotion({
        x: this.body.center.x,
        y: this.body.center.y
      });

      this._retracedMotionsAmmount++;
    }
  }

  validateCrossroadOverlap(crossroadPosition: ISpritePosition): boolean {
    if (this._motionManager && this._lastCrossroadTouched)
      return this._motionManager.validateCrossroadOverlap(
        {
          x: this._lastCrossroadTouched?.x,
          y: this._lastCrossroadTouched?.y
        },
        crossroadPosition
      );

    return false;
  }

  public get enemyData() {
    return this._enemyData;
  }

  public get lastCrossroadTouched(): ISpritePosition | undefined {
    return this._lastCrossroadTouched;
  }

  public set lastCrossroadTouched(v: ISpritePosition) {
    this._lastCrossroadTouched = v;
  }
}
