import { GAME_STATUS_ENUM } from '../enums/GameStatusEnum';
import { GAME_STAGE_ENUM } from '../enums/GameStageEnum';

export interface IGameInitialStage {
  stage: GAME_STAGE_ENUM;
  lives: number;
  time: number;
  status: GAME_STATUS_ENUM;
  totalScore: number;
  stageScore: number;
}
