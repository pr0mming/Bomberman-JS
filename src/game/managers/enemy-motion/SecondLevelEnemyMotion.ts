import { Physics } from 'phaser';
import { Player } from '@src/game/sprites/player/Player';
import { BaseEnemyMotion } from '@src/game/managers/enemy-motion/BaseEnemyMotion';
import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';

export class SecondLevelEnemyMotion extends BaseEnemyMotion {
  constructor(
    player: Player,
    enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null
  ) {
    super(player, enemyBody);
  }

  computeNewDirection(): ENEMY_DIRECTION_ENUM {
    if (this.enemyBody && this.player.body) {
      const playerCenterX = Math.round(this.player.body.center.x);
      const playerCenterY = Math.round(this.player.body.center.y);
      const enemyCenterX = Math.round(this.enemyBody.center.x);
      const enemyCenterY = Math.round(this.enemyBody.center.y);

      const deltaX = playerCenterX - enemyCenterX;
      const deltaY = playerCenterY - enemyCenterY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0
          ? ENEMY_DIRECTION_ENUM.RIGHT
          : ENEMY_DIRECTION_ENUM.LEFT;
      } else if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return deltaY > 0 ? ENEMY_DIRECTION_ENUM.UP : ENEMY_DIRECTION_ENUM.DOWN;
      } else {
        // If the player is exactly aligned in one direction
        if (deltaX !== 0) {
          return deltaX > 0
            ? ENEMY_DIRECTION_ENUM.RIGHT
            : ENEMY_DIRECTION_ENUM.LEFT;
        }
        if (deltaY !== 0) {
          return deltaY > 0
            ? ENEMY_DIRECTION_ENUM.UP
            : ENEMY_DIRECTION_ENUM.DOWN;
        }
      }
    }

    return ENEMY_DIRECTION_ENUM.LEFT;
  }
}
