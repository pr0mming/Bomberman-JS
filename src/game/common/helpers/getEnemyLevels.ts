import { ENEMY_ENUM } from '../enums/EnemyEnum';
import { GAME_STAGE_ENUM } from '../enums/GameStageEnum';
import { IEnemyLevel } from '../interfaces/IEnemyLevel';

const getEnemyLevels = () => {
  return new Map<GAME_STAGE_ENUM, IEnemyLevel[]>([
    [GAME_STAGE_ENUM.ONE, [{ quantity: 10, type: ENEMY_ENUM.BALLOM }]],
    [
      GAME_STAGE_ENUM.TWO,
      [
        { quantity: 10, type: ENEMY_ENUM.BALLOM },
        { quantity: 5, type: ENEMY_ENUM.ONIL }
      ]
    ],
    [
      GAME_STAGE_ENUM.THREE,
      [
        { quantity: 8, type: ENEMY_ENUM.ONIL },
        { quantity: 5, type: ENEMY_ENUM.DAHL }
      ]
    ],
    [
      GAME_STAGE_ENUM.FOUR,
      [
        { quantity: 2, type: ENEMY_ENUM.BALLOM },
        { quantity: 8, type: ENEMY_ENUM.DAHL },
        { quantity: 3, type: ENEMY_ENUM.MINVO }
      ]
    ],
    [
      GAME_STAGE_ENUM.FIVE,
      [
        { quantity: 4, type: ENEMY_ENUM.MINVO },
        { quantity: 4, type: ENEMY_ENUM.OVAPE },
        { quantity: 3, type: ENEMY_ENUM.PONTAN }
      ]
    ]
  ]);
};

export default getEnemyLevels;
