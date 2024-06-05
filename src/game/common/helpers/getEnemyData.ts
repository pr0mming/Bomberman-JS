import { ENEMY_ENUM } from '@game/common/enums/EnemyEnum';
import { ENEMY_MOTION_ENUM } from '@game/common/enums/EnemyMotionEnum';
import { IEnemy } from '@game/common/interfaces/IEnemy';

const getEnemyData = (): IEnemy[] => {
  return [
    {
      type: ENEMY_ENUM.BALLOM,
      textureKey: 'ballom',
      velocity: 30,
      hasWallPassPowerUp: false,
      rewardPoints: 100,
      motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
    },
    {
      type: ENEMY_ENUM.ONIL,
      textureKey: 'onil',
      velocity: 65,
      hasWallPassPowerUp: false,
      rewardPoints: 150,
      motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
    },
    {
      type: ENEMY_ENUM.MINVO,
      textureKey: 'minvo',
      velocity: 100,
      hasWallPassPowerUp: false,
      rewardPoints: 200,
      motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
    },
    {
      type: ENEMY_ENUM.DAHL,
      textureKey: 'dahl',
      velocity: 70,
      hasWallPassPowerUp: false,
      rewardPoints: 250,
      motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
    },

    {
      type: ENEMY_ENUM.OVAPE,
      textureKey: 'ovape',
      velocity: 50,
      hasWallPassPowerUp: true,
      rewardPoints: 300,
      motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
    },
    {
      type: ENEMY_ENUM.PASS,
      textureKey: 'pass',
      velocity: 95,
      hasWallPassPowerUp: false,
      rewardPoints: 350,
      motionEnemyType: ENEMY_MOTION_ENUM.FIRST_LEVEL
    },

    {
      type: ENEMY_ENUM.PONTAN,
      textureKey: 'pontan',
      velocity: 120,
      hasWallPassPowerUp: true,
      rewardPoints: 400,
      motionEnemyType: ENEMY_MOTION_ENUM.SECOND_LEVEL
    }
  ];
};

export default getEnemyData;
