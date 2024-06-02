import { Physics } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';

// Interfaces
import { IEnemyMotion } from '@game/common/interfaces/IEnemyMotion';
import { ISpritePosition } from '@game/common/interfaces/ISpritePosition';

// Enums
import { ENEMY_DIRECTION_ENUM } from '@game/common/enums/EnemyDirectionEnum';

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
    enemyPosition: ISpritePosition,
    tilePosition: ISpritePosition
  ): boolean {
    // If we are performig or even calculating the new direction of the enemy it should be immovable
    // This is to avoid execute the rest of the logic in this scenario
    if (this.enemyBody?.velocity.x === 0 && this.enemyBody?.velocity.y === 0)
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
      x: this.enemyBody?.center.x ?? 0,
      y: this.enemyBody?.center.y ?? 0
    };

    // This validation asserts the enemy reaches the approximately x, y position of the crossroad
    // If this is true so we can tell to the enemy perform a new or the same movement (direction)
    // Note: Is important to keep an offset between distances,
    // the reason is because compare enemy.body.center.x === tile.body.center.x isn't gonna be always true

    const enemyCenterX = Math.floor(enemyPos.x);
    const enemyCenterY = Math.floor(enemyPos.y);
    const tileCenterX = Math.floor(tilePosition.x);
    const tileCenterY = Math.floor(tilePosition.y);

    const deltaX = Math.abs(enemyCenterX - tileCenterX);
    const deltaY = Math.abs(enemyCenterY - tileCenterY);

    return deltaX <= 3 && deltaY <= 3;
  }
}
