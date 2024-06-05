import { Physics } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';

// Managers
import { FirstLevelEnemyMotion } from '@game/managers/enemy-motion/FirstLevelEnemyMotion';
import { SecondLevelEnemyMotion } from '@game/managers/enemy-motion/SecondLevelEnemyMotion';

// Enums
import { ENEMY_MOTION_ENUM } from '@game/common/enums/EnemyMotionEnum';

interface EnemyMotionFactoryProps {
  type: ENEMY_MOTION_ENUM;
  player: Player;
  enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null;
}

/**
 * This method is a little factory to return a new instance of a EnemyMotion class
 */
export class EnemyMotionFactory {
  static getInstance({ type, player, enemyBody }: EnemyMotionFactoryProps) {
    switch (type) {
      case ENEMY_MOTION_ENUM.FIRST_LEVEL:
        return new FirstLevelEnemyMotion(player, enemyBody);

      case ENEMY_MOTION_ENUM.SECOND_LEVEL:
        return new SecondLevelEnemyMotion(player, enemyBody);

      default:
        break;
    }
  }
}
