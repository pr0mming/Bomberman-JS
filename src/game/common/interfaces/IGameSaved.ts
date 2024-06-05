import { IEnemySaved } from '@game/common/interfaces/IEnemySaved';
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';
import { IMapPosition } from '@game/common/interfaces/IMapPosition';
import { ISpritePosition } from '@game/common/interfaces/ISpritePosition';

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
