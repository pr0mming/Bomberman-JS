import { ENEMY_ENUM } from '../enums/EnemyEnum';
import { ENEMY_MOTION_ENUM } from '../enums/EnemyMotionEnum';

export interface IEnemy {
  type: ENEMY_ENUM;
  textureKey: string;
  velocity: number;
  hasWallPassPowerUp: boolean;
  rewardPoints: number;
  motionEnemyType: ENEMY_MOTION_ENUM;
}
