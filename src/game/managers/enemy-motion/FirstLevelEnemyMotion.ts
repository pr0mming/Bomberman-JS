import { Physics } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';

// Managers
import { BaseEnemyMotion } from '@game/managers/enemy-motion/BaseEnemyMotion';

// Enums
import { ENEMY_DIRECTION_ENUM } from '@game/common/enums/EnemyDirectionEnum';

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
