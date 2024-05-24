import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';
import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';
import { IEnemy } from '@src/game/common/interfaces/IEnemy';
import { IEnemyMotion } from '@src/game/common/interfaces/IEnemyMotion';
import { Physics, Scene } from 'phaser';
import { Player } from '../player/Player';
import { ENEMY_MOTION_ENUM } from '@src/game/common/enums/EnemyMotionEnum';
import { FirstLevelEnemyMotion } from '@src/game/managers/enemy-motion/FirstLevelEnemyMotion';
import { SecondLevelEnemyMotion } from '@src/game/managers/enemy-motion/SecondLevelEnemyMotion';
import { ISpritePosition } from '@src/game/common/interfaces/ISpritePosition';

interface IEnemyProps {
  scene: Scene;
  x: number;
  y: number;
  type: ENEMY_ENUM;
  enemyData: IEnemy;
  player: Player;
}

export class Enemy extends Physics.Arcade.Sprite {
  private _direction: ENEMY_DIRECTION_ENUM;
  private _type: ENEMY_ENUM;
  private _enemyData: IEnemy;
  private _player: Player;

  private _animLeftKey: string;
  private _animRightKey: string;
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
    this._mapCrossroadOffset = 50;
    this._lastCrossroadTouched = { x, y };

    this.setScale(2.0);
  }

  private _updateSpriteMotion() {
    if (this._lastCrossroadTouched) {
      switch (this._direction) {
        case ENEMY_DIRECTION_ENUM.LEFT:
          this.play(this._animLeftKey);
          this.scene.physics.moveTo(
            this,
            this._lastCrossroadTouched.x - this._mapCrossroadOffset,
            this._lastCrossroadTouched.y,
            this._enemyData.velocity
          );

          break;

        case ENEMY_DIRECTION_ENUM.RIGH:
          this.play(this._animRightKey);
          this.scene.physics.moveTo(
            this,
            this._lastCrossroadTouched.x + this._mapCrossroadOffset,
            this._lastCrossroadTouched.y,
            this._enemyData.velocity
          );

          break;

        case ENEMY_DIRECTION_ENUM.DOWN:
          this.play(this._animLeftKey);
          this.scene.physics.moveTo(
            this,
            this._lastCrossroadTouched.x,
            this._lastCrossroadTouched.y + this._mapCrossroadOffset,
            this._enemyData.velocity
          );

          break;

        case ENEMY_DIRECTION_ENUM.UP:
          this.play(this._animRightKey);
          this.scene.physics.moveTo(
            this,
            this._lastCrossroadTouched.x,
            this._lastCrossroadTouched.y - this._mapCrossroadOffset,
            this._enemyData.velocity
          );

          break;

        default:
          break;
      }
    }
  }

  setMotionManager(type: ENEMY_MOTION_ENUM) {
    switch (type) {
      case ENEMY_MOTION_ENUM.FIRST_LEVEL:
        this._motionManager = new FirstLevelEnemyMotion(this._player, this);
        break;

      case ENEMY_MOTION_ENUM.SECOND_LEVEL:
        this._motionManager = new SecondLevelEnemyMotion(this._player, this);
        break;

      default:
        break;
    }
  }

  dispatchMotion() {
    const newDirection = this._motionManager?.computeNewDirection();

    if (newDirection !== undefined) {
      this._direction = newDirection;
      this._updateSpriteMotion();
    }
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
