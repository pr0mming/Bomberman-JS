import { Animations, Physics, Scene } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';

// Interfaces
import { IEnemy } from '@game/common/interfaces/IEnemy';
import { IEnemyMotion } from '@game/common/interfaces/IEnemyMotion';
import { ISpritePosition } from '@game/common/interfaces/ISpritePosition';

// Helpers
import { EnemyMotionFactory } from '@game/managers/enemy-motion/EnemyMotionFactory';

// Enums
import { ENEMY_MOTION_ENUM } from '@game/common/enums/EnemyMotionEnum';
import { ENEMY_DIRECTION_ENUM } from '@game/common/enums/EnemyDirectionEnum';

interface IEnemyProps {
  scene: Scene;
  x: number;
  y: number;
  enemyData: IEnemy;
  hasTemporalShield: boolean;
  player: Player;
}

/**
 * This class represents one enemy
 */
export class Enemy extends Physics.Arcade.Sprite {
  private _enemyData: IEnemy;
  private _player: Player;

  private _animLeftKey: string;
  private _animRightKey: string;
  private _animDeadKey: string;

  // This shield is used when are generated enemies from the door
  private _hasTemporalShield: boolean;
  // Offset of distance to reach
  private _mapCrossroadOffset: number;
  private _lastCrossroadTouched?: ISpritePosition;

  private _motionManager?: IEnemyMotion;

  constructor({
    scene,
    x,
    y,
    enemyData,
    hasTemporalShield,
    player
  }: IEnemyProps) {
    super(scene, x, y, enemyData.textureKey);

    scene.physics.add.existing(this);

    this._enemyData = enemyData;
    this._player = player;

    this._animLeftKey = `${this._enemyData.type}-left`;
    this._animRightKey = `${this._enemyData.type}-right`;
    this._animDeadKey = `${this._enemyData.type}-dead`;

    this._hasTemporalShield = hasTemporalShield;
    this._mapCrossroadOffset = 50;
    this._lastCrossroadTouched = { x, y };

    this.setScale(2.0);

    this._setUpTemporalShield();
  }

  /**
   * This method gives a blink to the sprite and avoid any explosion affects the sprite for a short time
   */
  private _setUpTemporalShield() {
    if (this._hasTemporalShield) {
      const _temporalShieldTimer = new Phaser.Time.TimerEvent({
        delay: 100,
        repeat: 40,
        callback: () => {
          const { repeatCount } = _temporalShieldTimer;

          this.setVisible(!this.visible);

          if (repeatCount <= 0) {
            this.setVisible(true);

            this._hasTemporalShield = false;
          }
        },
        callbackScope: this
      });

      this.scene.time.addEvent(_temporalShieldTimer);
    }
  }

  private _updateSpriteMotion(fromPosition: ISpritePosition) {
    if (this.body?.enable) {
      switch (this._motionManager?.direction) {
        case ENEMY_DIRECTION_ENUM.LEFT:
          this.play(this._animLeftKey);
          // It performs movement to a point X,Y
          this.scene.physics.moveTo(
            this,
            fromPosition.x - this._mapCrossroadOffset,
            fromPosition.y,
            this._enemyData.velocity
          );

          break;

        case ENEMY_DIRECTION_ENUM.RIGHT:
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
  }

  /**
   * This method is used to change the type of motion engine to move the enemy
   * @param type
   */
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

      this._motionManager?.computeNewDirection();

      this._updateSpriteMotion({
        x: this._lastCrossroadTouched.x,
        y: this._lastCrossroadTouched.y
      });
    }
  }

  /**
   * This method is used when enemy collides with the map layer, soft wall or a bomb (to avoid stay quiet forever)
   */
  retraceMotion() {
    // Stop the motion ...
    this.setVelocity(0);

    if (this.body) {
      this._motionManager?.retraceMotion();

      this._updateSpriteMotion({
        x: this.body?.center.x,
        y: this.body?.center.y
      });
    }
  }

  /**
   * This method validates if the enemy is aligned with the center of a tile
   * @param tilePosition position X, Y of tile
   * @returns true if is aligned
   */
  validateCrossroadOverlap(tilePosition: ISpritePosition): boolean {
    if (this._motionManager && this._lastCrossroadTouched)
      return this._motionManager.validateCrossroadOverlap(
        {
          x: this._lastCrossroadTouched?.x,
          y: this._lastCrossroadTouched?.y
        },
        tilePosition
      );

    return false;
  }

  kill() {
    this.disableBody(false);
    this.setImmovable(true);

    this.play(this._animDeadKey).once(
      Animations.Events.ANIMATION_COMPLETE,
      () => {
        this.play('destroy-enemy').once(
          Animations.Events.ANIMATION_COMPLETE,
          () => {
            if (this.body) {
              // Show for a short time the points earned by the player ...
              const rewardPoints = this.scene.add
                .text(
                  this.body?.center.x,
                  this.body?.center.y,
                  this.enemyData.rewardPoints.toString()
                )
                .setFontFamily('"BitBold", "Tahoma"')
                .setFontSize(10)
                .setColor('white')
                .setStroke('black', 2.5);

              this.scene.time.addEvent({
                delay: 2000,
                callback: () => rewardPoints.destroy(true),
                callbackScope: this
              });
            }

            this.destroy(true);
          }
        );
      }
    );
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

  public get hasTemporalShield() {
    return this._hasTemporalShield;
  }
}
