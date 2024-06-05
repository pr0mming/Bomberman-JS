import { Physics } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';

// Interfaces
import { IEnemyMotion } from '@game/common/interfaces/IEnemyMotion';
import { ISpritePosition } from '@game/common/interfaces/ISpritePosition';

// Enums
import { ENEMY_DIRECTION_ENUM } from '@game/common/enums/EnemyDirectionEnum';

export class BaseEnemyMotion implements IEnemyMotion {
  private _player: Player;
  private _enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null;

  private _direction: ENEMY_DIRECTION_ENUM;
  private _directions: ENEMY_DIRECTION_ENUM[];
  private _retracedMotions: number;

  private _MAX_RETRACED_MOTIONS: number;

  constructor(
    player: Player,
    enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null
  ) {
    this._player = player;
    this._enemyBody = enemyBody;

    this._direction = ENEMY_DIRECTION_ENUM.LEFT;
    this._directions = [
      ENEMY_DIRECTION_ENUM.LEFT,
      ENEMY_DIRECTION_ENUM.RIGHT,
      ENEMY_DIRECTION_ENUM.UP,
      ENEMY_DIRECTION_ENUM.DOWN
    ];
    this._retracedMotions = 0;

    this._MAX_RETRACED_MOTIONS = 5;
  }

  computeNewDirection() {
    throw new Error('Method not implemented.');
  }

  private _getOppositeDirection(
    direction: ENEMY_DIRECTION_ENUM
  ): ENEMY_DIRECTION_ENUM {
    switch (direction) {
      case ENEMY_DIRECTION_ENUM.LEFT:
        return ENEMY_DIRECTION_ENUM.RIGHT;

      case ENEMY_DIRECTION_ENUM.RIGHT:
        return ENEMY_DIRECTION_ENUM.LEFT;

      case ENEMY_DIRECTION_ENUM.UP:
        return ENEMY_DIRECTION_ENUM.DOWN;

      case ENEMY_DIRECTION_ENUM.DOWN:
        return ENEMY_DIRECTION_ENUM.UP;

      default:
        throw new Error('Direction type is invalid');
    }
  }

  /**
   * This method is used to get a random direction, but don't take the parameter
   * @param directionExcluded direction to don't take in account
   * @returns new direction
   */
  private _getRndDirectionByExclusion(
    directionExcluded: ENEMY_DIRECTION_ENUM
  ): ENEMY_DIRECTION_ENUM {
    const newDirections = this._directions.filter(
      (item) => item !== directionExcluded
    );

    const index = Phaser.Math.RND.between(0, newDirections.length - 1);

    return newDirections[index];
  }

  /**
   * This method take the current direction and set the opposite one, for example, the opposite of left is right and so on ...
   */
  retraceMotion() {
    const newDirection = this._getOppositeDirection(this._direction);

    // Is possible reach a limit, so is taken a different new direction
    if (this._retracedMotions >= this._MAX_RETRACED_MOTIONS) {
      this._direction = this._getRndDirectionByExclusion(newDirection);

      this._retracedMotions = 0;

      return;
    }

    if (newDirection !== undefined) {
      this._direction = newDirection;

      this._retracedMotions++;
    }
  }

  validateCrossroadOverlap(
    enemyPosition: ISpritePosition,
    tilePosition: ISpritePosition
  ): boolean {
    // If we are performig or even calculating the new direction of the enemy it should be immovable
    // This is to avoid execute the rest of the logic in this scenario
    if (this._enemyBody?.velocity.x === 0 && this._enemyBody?.velocity.y === 0)
      return false;

    const enemyCrossroadPos = {
      x: enemyPosition.x ?? 0,
      y: enemyPosition.y ?? 0
    };

    // This is to avoid change the direction multiple times if the enemy is on the same crossroad
    // so that I save the last crossroad passed to verify
    if (
      tilePosition &&
      tilePosition.x === enemyCrossroadPos?.x &&
      tilePosition.y === enemyCrossroadPos?.y
    )
      return false;

    const enemyPos = {
      x: this._enemyBody?.center.x ?? 0,
      y: this._enemyBody?.center.y ?? 0
    };

    // This validation asserts the enemy reaches the approximately x, y position of the crossroad
    // If this is true so we can tell to the enemy perform a new or the same movement (direction)
    // Note: Is important to keep an offset between distances,
    // the reason is because compare enemy.body.center.x === tile.body.center.x isn't gonna be always true

    const enemyCenterX = Math.round(enemyPos.x);
    const enemyCenterY = Math.round(enemyPos.y);
    const tileCenterX = Math.floor(tilePosition.x);
    const tileCenterY = Math.floor(tilePosition.y);

    const deltaX = Math.abs(enemyCenterX - tileCenterX);
    const deltaY = Math.abs(enemyCenterY - tileCenterY);

    return deltaX <= 5 && deltaY <= 5;
  }

  public get direction() {
    return this._direction;
  }

  public set direction(v: ENEMY_DIRECTION_ENUM) {
    this._direction = v;
  }

  public get directions() {
    return this._directions;
  }

  public get retracedMotions() {
    return this._retracedMotions;
  }

  public set retracedMotions(v: number) {
    this._retracedMotions = v;
  }

  public get player() {
    return this._player;
  }

  public get enemyBody() {
    return this._enemyBody;
  }
}
