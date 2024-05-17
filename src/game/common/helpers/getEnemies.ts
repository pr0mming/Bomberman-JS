import { ENEMY_ENUM } from '../enums/EnemyEnum';
import { IEnemy } from '../interfaces/IEnemy';

const getEnemies = () => {
  return new Map<ENEMY_ENUM, IEnemy>([
    [
      ENEMY_ENUM.BALLOM,
      {
        textureKey: 'ballom',
        velocity: 30,
        hasWallPassPowerUp: false,
        rewardPoints: 50
      }
    ],
    [
      ENEMY_ENUM.ONIL,
      {
        textureKey: 'onil',
        velocity: 50,
        hasWallPassPowerUp: false,
        rewardPoints: 60
      }
    ],
    [
      ENEMY_ENUM.MINVO,
      {
        textureKey: 'minvo',
        velocity: 60,
        hasWallPassPowerUp: false,
        rewardPoints: 100
      }
    ],
    [
      ENEMY_ENUM.DAHL,
      {
        textureKey: 'dahl',
        velocity: 60,
        hasWallPassPowerUp: false,
        rewardPoints: 150
      }
    ],
    [
      ENEMY_ENUM.OVAPE,
      {
        textureKey: 'ovape',
        velocity: 20,
        hasWallPassPowerUp: true,
        rewardPoints: 180
      }
    ],
    [
      ENEMY_ENUM.PASS,
      {
        textureKey: 'pass',
        velocity: 80,
        hasWallPassPowerUp: false,
        rewardPoints: 200
      }
    ],
    [
      ENEMY_ENUM.PONTAN,
      {
        textureKey: 'pontan',
        velocity: 90,
        hasWallPassPowerUp: true,
        rewardPoints: 250
      }
    ]
  ]);
};

export default getEnemies;
