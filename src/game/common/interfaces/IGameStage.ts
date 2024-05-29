import { Tilemaps } from 'phaser';
import { GAME_STATUS_ENUM } from '../enums/GameStatusEnum';
import { GAME_STAGE_ENUM } from '../enums/GameStageEnum';

interface IPlayerPositions {
  x: number;
  y: number;
}
export interface IGameStage {
  stage: GAME_STAGE_ENUM;
  lives: number;
  time: number;
  status: GAME_STATUS_ENUM;
  totalScore: number;
  stageScore: number;
  map: Tilemaps.ObjectLayer[];
  playerPositions?: IPlayerPositions;
}
