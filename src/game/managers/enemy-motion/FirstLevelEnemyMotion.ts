import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';
import { BaseEnemyMotion } from './BaseEnemyMotion';
import { Player } from '@src/game/sprites/Player';
import { Enemy } from '@src/game/sprites/enemy/Enemy';

export class FirstLevelEnemyMotion extends BaseEnemyMotion {
  constructor(player: Player, enemy: Enemy) {
    super(player, enemy);
  }

  computeNewDirection(): ENEMY_DIRECTION_ENUM {
    const index = Phaser.Math.RND.between(0, this.directions.length - 1);

    return this.directions[index];
  }
}
