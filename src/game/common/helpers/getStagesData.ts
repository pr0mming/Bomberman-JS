import { IGameStage } from '@game/common/interfaces/IGameStage';

// Enums
import { ENEMY_ENUM } from '@game/common/enums/EnemyEnum';
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';
import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';

const getStagesData = (): IGameStage[] => {
  return [
    {
      stage: GAME_STAGE_ENUM.ONE,
      powerUp: PLAYER_POWER_UP_ENUM.BOMB_UP,
      enemies: [{ quantity: 4, type: ENEMY_ENUM.BALLOM }]
    },
    {
      stage: GAME_STAGE_ENUM.TWO,
      powerUp: PLAYER_POWER_UP_ENUM.FIRE_UP,
      enemies: [
        { quantity: 2, type: ENEMY_ENUM.BALLOM },
        { quantity: 3, type: ENEMY_ENUM.ONIL }
      ]
    },
    {
      stage: GAME_STAGE_ENUM.THREE,
      powerUp: PLAYER_POWER_UP_ENUM.REMOTE_CONTROL,
      enemies: [
        { quantity: 2, type: ENEMY_ENUM.BALLOM },
        { quantity: 3, type: ENEMY_ENUM.ONIL },
        { quantity: 1, type: ENEMY_ENUM.DAHL }
      ]
    },
    {
      stage: GAME_STAGE_ENUM.FOUR,
      powerUp: PLAYER_POWER_UP_ENUM.SPEED_UP,
      enemies: [
        { quantity: 2, type: ENEMY_ENUM.BALLOM },
        { quantity: 3, type: ENEMY_ENUM.DAHL },
        { quantity: 2, type: ENEMY_ENUM.MINVO }
      ]
    },
    {
      stage: GAME_STAGE_ENUM.FIVE,
      powerUp: PLAYER_POWER_UP_ENUM.FLAME_PASS,
      enemies: [
        { quantity: 4, type: ENEMY_ENUM.MINVO },
        { quantity: 3, type: ENEMY_ENUM.OVAPE },
        { quantity: 1, type: ENEMY_ENUM.PASS }
      ]
    },
    {
      stage: GAME_STAGE_ENUM.FINAL_BONUS,
      enemies: [{ quantity: 10, type: ENEMY_ENUM.PONTAN }]
    }
  ];
};

export default getStagesData;
