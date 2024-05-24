import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';
import { BaseEnemyMotion } from './BaseEnemyMotion';
import { Player } from '@src/game/sprites/player/Player';
import { Physics } from 'phaser';

export class FirstLevelEnemyMotion extends BaseEnemyMotion {
  constructor(
    player: Player,
    enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null
  ) {
    super(player, enemyBody);
  }

  computeNewDirection(): ENEMY_DIRECTION_ENUM {
    const index = Phaser.Math.RND.between(0, this.directions.length - 1);

    return this.directions[index];
  }
}
