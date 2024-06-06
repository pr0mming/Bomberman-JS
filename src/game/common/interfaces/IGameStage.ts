import { IEnemyLevel } from './IEnemyLevel';

// Enums
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';
import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';

export interface IGameStage {
  stage: GAME_STAGE_ENUM;
  powerUp?: PLAYER_POWER_UP_ENUM;
  enemies: IEnemyLevel[];
}
