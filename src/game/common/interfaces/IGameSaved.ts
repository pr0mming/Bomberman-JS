import { IEnemySaved } from './IEnemySaved';
import { IGameInitialStage } from './IGameInitialStage';
import { IMapPosition } from './IMapPosition';
import { ISpritePosition } from './ISpritePosition';

interface ISpecialObject {
  x: number;
  y: number;
  isVisible: boolean;
}

export interface IMapSaved {
  walls: IMapPosition[];
  door: ISpecialObject;
  powerUp: ISpecialObject;
}

export interface IGameSaved {
  gameStage: IGameInitialStage;
  player: ISpritePosition;
  map: IMapSaved;
  enemies: IEnemySaved[];
}
