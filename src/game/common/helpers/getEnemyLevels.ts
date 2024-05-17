import { ENEMY_ENUM } from '../enums/EnemyEnum';
import { LEVEL_ENUM } from '../enums/LevelEnum';
import { ILevel } from '../interfaces/ILevel';

const getEnemyLevels = () => {
  return new Map<LEVEL_ENUM, ILevel[]>([
    [LEVEL_ENUM.ONE, [{ quantity: 20, type: ENEMY_ENUM.BALLOM }]],
    [
      LEVEL_ENUM.TWO,
      [
        { quantity: 10, type: ENEMY_ENUM.BALLOM },
        { quantity: 5, type: ENEMY_ENUM.ONIL }
      ]
    ],
    [
      LEVEL_ENUM.THREE,
      [
        { quantity: 10, type: ENEMY_ENUM.ONIL },
        { quantity: 5, type: ENEMY_ENUM.DAHL }
      ]
    ],
    [
      LEVEL_ENUM.FOUR,
      [
        { quantity: 2, type: ENEMY_ENUM.BALLOM },
        { quantity: 8, type: ENEMY_ENUM.DAHL },
        { quantity: 3, type: ENEMY_ENUM.MINVO }
      ]
    ],
    [
      LEVEL_ENUM.FIVE,
      [
        { quantity: 4, type: ENEMY_ENUM.MINVO },
        { quantity: 4, type: ENEMY_ENUM.OVAPE },
        { quantity: 3, type: ENEMY_ENUM.PONTAN }
      ]
    ]
  ]);
};

export default getEnemyLevels;
