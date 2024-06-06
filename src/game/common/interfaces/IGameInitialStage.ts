import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';
import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';

export interface IGameInitialStage {
  stage: GAME_STAGE_ENUM;
  lives: number;
  time: number;
  status: GAME_STATUS_ENUM;
  totalScore: number;
  stageScore: number;
  powerUps: PLAYER_POWER_UP_ENUM[];
}
