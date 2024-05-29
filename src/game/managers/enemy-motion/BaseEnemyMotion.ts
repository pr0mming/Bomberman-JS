import { Physics } from 'phaser';
import { Player } from '@src/game/sprites/player/Player';
import { IEnemyMotion } from '@src/game/common/interfaces/IEnemyMotion';
import { ISpritePosition } from '@src/game/common/interfaces/ISpritePosition';
import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';

export class BaseEnemyMotion implements IEnemyMotion {
  player: Player;
  enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null;
  directions: ENEMY_DIRECTION_ENUM[];

  constructor(
    player: Player,
    enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null
  ) {
    this.player = player;
    this.enemyBody = enemyBody;

    this.directions = [
      ENEMY_DIRECTION_ENUM.LEFT,
      ENEMY_DIRECTION_ENUM.RIGHT,
      ENEMY_DIRECTION_ENUM.UP,
      ENEMY_DIRECTION_ENUM.DOWN
    ];
  }

  computeNewDirection(): ENEMY_DIRECTION_ENUM {
    throw new Error('Method not implemented.');
  }

  getOppositeDirection(direction: ENEMY_DIRECTION_ENUM): ENEMY_DIRECTION_ENUM {
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

  validateCrossroadOverlap(
    enemyCrossroad: ISpritePosition,
    crossroadPosition: ISpritePosition
  ): boolean {
    // If we are performig or even calculating the new direction of the enemy it should be immovable
    // This is to avoid execute the rest of the logic in this scenario
    if (this.enemyBody?.velocity.x === 0 && this.enemyBody?.velocity.y === 0)
      return false;

    const enemyCrossroadPos = {
      x: enemyCrossroad.x ?? 0,
      y: enemyCrossroad.y ?? 0
    };

    // This is to avoid change the direction multiple times if the enemy is on the same crossroad
    // so that I save the last crossroad passed to verify
    if (
      crossroadPosition &&
      crossroadPosition.x === enemyCrossroadPos?.x &&
      crossroadPosition.y === enemyCrossroadPos?.y
    )
      return false;

    const enemyPos = {
      x: this.enemyBody?.center.x ?? 0,
      y: this.enemyBody?.center.y ?? 0
    };

    // This validation asserts the enemy reaches the approximately x, y position of the crossroad
    // If this is true so we can tell to the enemy perform a new or the same movement (direction)
    // Note: Idk but it wasn't good enough with "crossroadPos.x === enemyPos.x" because the enemy takes a decimals-offset positions
    return (
      crossroadPosition &&
      enemyPos &&
      (crossroadPosition.x === Math.floor(enemyPos.x) ||
        crossroadPosition.x === Math.round(enemyPos.x)) &&
      (crossroadPosition.y === Math.floor(enemyPos.y) ||
        crossroadPosition.y === Math.round(enemyPos.y))
    );
  }
}
