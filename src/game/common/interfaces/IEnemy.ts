import { ENEMY_ENUM } from '@game/common/enums/EnemyEnum';
import { ENEMY_MOTION_ENUM } from '@game/common/enums/EnemyMotionEnum';

export interface IEnemy {
  type: ENEMY_ENUM;
  textureKey: string;
  velocity: number;
  hasWallPassPowerUp: boolean;
  rewardPoints: number;
  motionEnemyType: ENEMY_MOTION_ENUM;
}
