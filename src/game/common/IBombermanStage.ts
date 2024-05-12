import { Tilemaps } from 'phaser';

interface IPlayerPositions {
  x: number;
  y: number;
}
export interface IBombermanStage {
  stage: number;
  lives: number;
  points: number;
  time: number;
  status: string;
  map: Tilemaps.ObjectLayer[];
  stage_enemies: string[][];
  stage_points: number;
  stage_time: number;
  playerPositions?: IPlayerPositions;
}
