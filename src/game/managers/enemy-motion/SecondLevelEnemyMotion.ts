import { Physics } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';

// Managers
import { BaseEnemyMotion } from '@game/managers/enemy-motion/BaseEnemyMotion';

// Enums
import { ENEMY_DIRECTION_ENUM } from '@game/common/enums/EnemyDirectionEnum';

/**
 * It's the kinda logic that uses the enemy PONTAN, the purpose is chase the player around the map
 */
export class SecondLevelEnemyMotion extends BaseEnemyMotion {
  constructor(
    player: Player,
    enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null
  ) {
    super(player, enemyBody);
  }

  computeNewDirection() {
    if (this.enemyBody && this.player.body) {
      this.retracedMotions = 0;

      const playerCenterX = Math.round(this.player.body.center.x);
      const playerCenterY = Math.round(this.player.body.center.y);
      const enemyCenterX = Math.round(this.enemyBody.center.x);
      const enemyCenterY = Math.round(this.enemyBody.center.y);

      const deltaX = playerCenterX - enemyCenterX;
      const deltaY = playerCenterY - enemyCenterY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.direction =
          deltaX > 0 ? ENEMY_DIRECTION_ENUM.RIGHT : ENEMY_DIRECTION_ENUM.LEFT;

        return;
      }

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        this.direction =
          deltaY > 0 ? ENEMY_DIRECTION_ENUM.DOWN : ENEMY_DIRECTION_ENUM.UP;

        return;
      }

      // If the player is exactly aligned in one direction
      if (deltaX !== 0) {
        this.direction =
          deltaX > 0 ? ENEMY_DIRECTION_ENUM.RIGHT : ENEMY_DIRECTION_ENUM.LEFT;
      }

      if (deltaY !== 0) {
        this.direction =
          deltaY > 0 ? ENEMY_DIRECTION_ENUM.DOWN : ENEMY_DIRECTION_ENUM.UP;
      }
    }
  }
}
