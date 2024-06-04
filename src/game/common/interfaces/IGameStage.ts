import { IEnemyLevel } from './IEnemyLevel';

import { GAME_STAGE_ENUM } from '../enums/GameStageEnum';
import { PLAYER_POWER_UP_ENUM } from '../enums/PlayerPowerUpEnum';

export interface IGameStage {
  stage: GAME_STAGE_ENUM;
  powerUp?: PLAYER_POWER_UP_ENUM;
  enemies: IEnemyLevel[];
}
