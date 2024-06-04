import { GAME_STAGE_ENUM } from '../enums/GameStageEnum';
import { GAME_STATUS_ENUM } from '../enums/GameStatusEnum';
import { IGameInitialStage } from '../interfaces/IGameInitialStage';

const getInitialGameStage = (): IGameInitialStage => {
  return {
    stage: GAME_STAGE_ENUM.ONE,
    lives: 5,
    time: 200,
    status: GAME_STATUS_ENUM.START,
    totalScore: 0,
    stageScore: 0
  };
};

export default getInitialGameStage;