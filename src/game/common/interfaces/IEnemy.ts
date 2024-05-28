import { ENEMY_MOTION_ENUM } from '../enums/EnemyMotionEnum';

export interface IEnemy {
  textureKey: string;
  velocity: number;
  hasWallPassPowerUp: boolean;
  rewardPoints: number;
  motionEnemyType: ENEMY_MOTION_ENUM;
}
