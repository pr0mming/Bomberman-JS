import { ENEMY_ENUM } from '../enums/EnemyEnum';
import { ENEMY_MOTION_ENUM } from '../enums/EnemyMotionEnum';
import { IEnemy } from '../interfaces/IEnemy';

const getEnemyData = () => {
  return new Map<ENEMY_ENUM, IEnemy>([
    [
      ENEMY_ENUM.BALLOM,
      {
        textureKey: 'ballom',
        velocity: 30,
        hasWallPassPowerUp: false,
        rewardPoints: 50,
        motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
      }
    ],
    [
      ENEMY_ENUM.ONIL,
      {
        textureKey: 'onil',
        velocity: 50,
        hasWallPassPowerUp: false,
        rewardPoints: 60,
        motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
      }
    ],
    [
      ENEMY_ENUM.MINVO,
      {
        textureKey: 'minvo',
        velocity: 60,
        hasWallPassPowerUp: false,
        rewardPoints: 100,
        motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
      }
    ],
    [
      ENEMY_ENUM.DAHL,
      {
        textureKey: 'dahl',
        velocity: 60,
        hasWallPassPowerUp: false,
        rewardPoints: 150,
        motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
      }
    ],
    [
      ENEMY_ENUM.OVAPE,
      {
        textureKey: 'ovape',
        velocity: 20,
        hasWallPassPowerUp: true,
        rewardPoints: 180,
        motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
      }
    ],
    [
      ENEMY_ENUM.PASS,
      {
        textureKey: 'pass',
        velocity: 80,
        hasWallPassPowerUp: false,
        rewardPoints: 200,
        motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
      }
    ],
    [
      ENEMY_ENUM.PONTAN,
      {
        textureKey: 'pontan',
        velocity: 90,
        hasWallPassPowerUp: true,
        rewardPoints: 250,
        motionEnemyType: ENEMY_MOTION_ENUM.SECOND_LEVEL
      }
    ]
  ]);
};

export default getEnemyData;
