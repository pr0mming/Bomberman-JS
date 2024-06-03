import { Physics } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';

// Managers
import { BaseEnemyMotion } from '@game/managers/enemy-motion/BaseEnemyMotion';

export class FirstLevelEnemyMotion extends BaseEnemyMotion {
  constructor(
    player: Player,
    enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null
  ) {
    super(player, enemyBody);
  }

  computeNewDirection() {
    this.retracedMotions = 0;

    const index = Phaser.Math.RND.between(0, this.directions.length - 1);

    this.direction = this.directions[index];
  }
}
