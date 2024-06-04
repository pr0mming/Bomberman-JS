import { GAME_STATUS_ENUM } from '../enums/GameStatusEnum';
import { GAME_STAGE_ENUM } from '../enums/GameStageEnum';
import { PLAYER_POWER_UP_ENUM } from '../enums/PlayerPowerUpEnum';

export interface IGameInitialStage {
  stage: GAME_STAGE_ENUM;
  lives: number;
  time: number;
  status: GAME_STATUS_ENUM;
  totalScore: number;
  stageScore: number;
  powerUps: PLAYER_POWER_UP_ENUM[];
}
