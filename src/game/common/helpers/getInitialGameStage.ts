import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';

// Enums
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';

/**
 * Feel free to play with this data, this parameters will be loaded in the first match
 * @returns
 */
const getInitialGameStage = (): IGameInitialStage => {
  return {
    stage: GAME_STAGE_ENUM.ONE,
    lives: 5,
    time: 200,
    status: GAME_STATUS_ENUM.START,
    totalScore: 0,
    stageScore: 0,
    powerUps: []
  };
};

export default getInitialGameStage;
