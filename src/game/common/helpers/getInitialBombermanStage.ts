import { GAME_STAGE_ENUM } from '../enums/GameStageEnum';
import { GAME_STATUS_ENUM } from '../enums/GameStatusEnum';
import { IGameStage } from '../interfaces/IGameStage';

const getInitialBombermanStage = (): IGameStage => {
  return {
    stage: GAME_STAGE_ENUM.ONE,
    lives: 5,
    time: 200,
    status: GAME_STATUS_ENUM.START,
    totalScore: 0,
    stageScore: 0,
    map: []
  };
};

export default getInitialBombermanStage;
