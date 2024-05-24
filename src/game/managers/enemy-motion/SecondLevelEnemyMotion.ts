import { Physics } from 'phaser';
import { BaseEnemyMotion } from './BaseEnemyMotion';
import { Player } from '@src/game/sprites/player/Player';
import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';

export class SecondLevelEnemyMotion extends BaseEnemyMotion {
  constructor(
    player: Player,
    enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null
  ) {
    super(player, enemyBody);
  }

  computeNewDirection(): ENEMY_DIRECTION_ENUM {
    if (this.enemyBody) {
      if (
        Math.round(this.player.x) > Math.round(this.enemyBody.center.x) &&
        Math.round(this.player.y) != Math.round(this.enemyBody.center.y)
      ) {
        return ENEMY_DIRECTION_ENUM.RIGH;
      } else if (
        Math.round(this.player.x) < Math.round(this.enemyBody.center.x) &&
        Math.round(this.player.y) != Math.round(this.enemyBody.center.y)
      ) {
        return ENEMY_DIRECTION_ENUM.LEFT;
      } else if (
        Math.round(this.player.y) > Math.round(this.enemyBody.center.y) &&
        Math.round(this.player.x) != Math.round(this.enemyBody.center.x)
      ) {
        return ENEMY_DIRECTION_ENUM.UP;
      } else if (
        Math.round(this.player.y) < Math.round(this.enemyBody.center.y) &&
        Math.round(this.player.x) != Math.round(this.enemyBody.center.x)
      ) {
        return ENEMY_DIRECTION_ENUM.DOWN;
      } else if (
        Math.round(this.player.x) == Math.round(this.enemyBody.center.x) &&
        Math.round(this.player.y) != Math.round(this.enemyBody.center.y)
      ) {
        if (Math.round(this.player.y) > Math.round(this.enemyBody.center.y))
          return ENEMY_DIRECTION_ENUM.UP;
        else return ENEMY_DIRECTION_ENUM.DOWN;
      } else if (
        Math.round(this.player.y) == Math.round(this.enemyBody.center.y) &&
        Math.round(this.player.x) != Math.round(this.enemyBody.center.x)
      ) {
        if (Math.round(this.player.x) > Math.round(this.enemyBody.center.x))
          return ENEMY_DIRECTION_ENUM.RIGH;
        else return ENEMY_DIRECTION_ENUM.LEFT;
      }
    }

    return ENEMY_DIRECTION_ENUM.LEFT;
  }
}
