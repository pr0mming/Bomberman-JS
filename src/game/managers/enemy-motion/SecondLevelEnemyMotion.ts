import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';
import { BaseEnemyMotion } from './BaseEnemyMotion';
import { Player } from '@src/game/sprites/Player';
import { Enemy } from '@src/game/sprites/enemy/Enemy';

export class SecondLevelEnemyMotion extends BaseEnemyMotion {
  constructor(player: Player, enemy: Enemy) {
    super(player, enemy);
  }

  computeNewDirection(): ENEMY_DIRECTION_ENUM {
    if (
      Math.round(this.player.x) > Math.round(this.enemy.x) &&
      Math.round(this.player.y) != Math.round(this.enemy.y)
    ) {
      return ENEMY_DIRECTION_ENUM.RIGH;
    } else if (
      Math.round(this.player.x) < Math.round(this.enemy.x) &&
      Math.round(this.player.y) != Math.round(this.enemy.y)
    ) {
      return ENEMY_DIRECTION_ENUM.LEFT;
    } else if (
      Math.round(this.player.y) > Math.round(this.enemy.y) &&
      Math.round(this.player.x) != Math.round(this.enemy.x)
    ) {
      return ENEMY_DIRECTION_ENUM.UP;
    } else if (
      Math.round(this.player.y) < Math.round(this.enemy.y) &&
      Math.round(this.player.x) != Math.round(this.enemy.x)
    ) {
      return ENEMY_DIRECTION_ENUM.DOWN;
    } else if (
      Math.round(this.player.x) == Math.round(this.enemy.x) &&
      Math.round(this.player.y) != Math.round(this.enemy.y)
    ) {
      if (Math.round(this.player.y) > Math.round(this.enemy.y))
        return ENEMY_DIRECTION_ENUM.UP;
      else return ENEMY_DIRECTION_ENUM.DOWN;
    } else if (
      Math.round(this.player.y) == Math.round(this.enemy.y) &&
      Math.round(this.player.x) != Math.round(this.enemy.x)
    ) {
      if (Math.round(this.player.x) > Math.round(this.enemy.x))
        return ENEMY_DIRECTION_ENUM.RIGH;
      else return ENEMY_DIRECTION_ENUM.LEFT;
    }

    return ENEMY_DIRECTION_ENUM.LEFT;
  }
}
