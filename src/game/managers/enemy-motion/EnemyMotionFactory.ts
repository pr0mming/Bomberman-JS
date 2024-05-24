import { Physics } from 'phaser';
import { Player } from '@src/game/sprites/player/Player';
import { FirstLevelEnemyMotion } from './FirstLevelEnemyMotion';
import { SecondLevelEnemyMotion } from './SecondLevelEnemyMotion';
import { ENEMY_MOTION_ENUM } from '@src/game/common/enums/EnemyMotionEnum';

interface EnemyMotionFactoryProps {
  type: ENEMY_MOTION_ENUM;
  player: Player;
  enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null;
}

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
