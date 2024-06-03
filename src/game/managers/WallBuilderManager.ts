import { Types } from 'phaser';

// Interfaces
import { IMapPosition } from '../common/interfaces/IMapPosition';

// Enums
import { WALL_TO_BUILD_ENUM } from '../common/enums/WallToBuildEnum';

interface ISafeRndFreePositionResult {
  index: number;
  element: IMapPosition;
}

interface IAllocateWallsInAxisParams {
  posWall: IMapPosition;
  posWallsInAxis: IMapPosition[];
  addWallSpriteFn: (x: number, y: number) => void;
}

interface IWallBuilderManagerProps {
  roads: Types.Tilemaps.TiledObject[];
  crossroads: Types.Tilemaps.TiledObject[];
  minWalls: number;
  maxWalls: number;
}

export class WallBuilderManager {
  private _freePositions: IMapPosition[];

  private _minWalls: number;
  private _maxWalls: number;
  private _wallTypes: WALL_TO_BUILD_ENUM[];

  constructor({
    roads,
    crossroads,
    minWalls,
    maxWalls
  }: IWallBuilderManagerProps) {
    this._freePositions = [];

    this._minWalls = minWalls;
    this._maxWalls = maxWalls;

    this._wallTypes = [
      WALL_TO_BUILD_ENUM.ISOLATED,
      WALL_TO_BUILD_ENUM.COLUMN,
      WALL_TO_BUILD_ENUM.ROW
    ];

    this._setUp(roads, crossroads);
  }

  private _setUp(
    roads: Types.Tilemaps.TiledObject[],
    crossroads: Types.Tilemaps.TiledObject[]
  ) {
    const freePositions = [
      ...roads.map((item) => ({
        x: item.x ?? 0,
        y: item.y ?? 0
      })),
      ...crossroads.map((item) => ({
        x: item.x ?? 0,
        y: item.y ?? 0
      }))
    ];

    this._freePositions = freePositions;
  }

  private _isIllegalPositions(position: IMapPosition): boolean {
    return (
      (position.x === 60 && position.y === 120) ||
      (position.x === 60 && position.y === 160) ||
      (position.x === 100 && position.y === 120)
    );
  }

  pickSafeRndFreePosition(): ISafeRndFreePositionResult {
    const index = Phaser.Math.RND.between(0, this._freePositions.length - 1);

    let element = this._freePositions[index];

    if (this._isIllegalPositions(element)) {
      return this.pickSafeRndFreePosition();
    }

    return { element, index };
  }

  buildWalls(addWallSpriteFn: (x: number, y: number) => void) {
    const wallNumber = Phaser.Math.RND.between(this._minWalls, this._maxWalls);

    let i = 0;

    while (i < wallNumber) {
      const indexTmp = Phaser.Math.RND.between(0, this._wallTypes.length - 1);
      const wallTypeToBuild = this._wallTypes[indexTmp];

      const { element, index } = this.pickSafeRndFreePosition();

      switch (wallTypeToBuild) {
        case WALL_TO_BUILD_ENUM.ISOLATED:
          addWallSpriteFn(element.x, element.y);

          this._freePositions.splice(index, 1);
          i++;

          break;

        case WALL_TO_BUILD_ENUM.ROW:
          i += this._allocateWallsInAxis({
            posWall: element,
            posWallsInAxis: this._freePositions.filter(
              (wall) => wall.y === element.y
            ),
            addWallSpriteFn
          });

          break;

        case WALL_TO_BUILD_ENUM.COLUMN:
          i += this._allocateWallsInAxis({
            posWall: element,
            posWallsInAxis: this._freePositions.filter(
              (wall) => wall.x === element.x
            ),
            addWallSpriteFn
          });

          break;

        default:
          break;
      }
    }
  }

  private _allocateWallsInAxis(parameters: IAllocateWallsInAxisParams): number {
    const { posWall, posWallsInAxis, addWallSpriteFn } = parameters;

    let blockLenght = Phaser.Math.RND.between(2, 4);

    if (blockLenght > posWallsInAxis.length) {
      blockLenght = posWallsInAxis.length;
    }

    const startIndex = posWallsInAxis.findIndex(
      (wall) => wall.x === posWall.x && wall.y === posWall.y
    );

    let blockLenghtTmp = blockLenght;

    for (
      let i = startIndex;
      i < posWallsInAxis.length && blockLenghtTmp > 0;
      i++
    ) {
      if (this._isIllegalPositions(posWallsInAxis[i])) {
        continue;
      }

      addWallSpriteFn(posWallsInAxis[i].x, posWallsInAxis[i].y);

      this.deletePositionFree(posWallsInAxis[i].x, posWallsInAxis[i].y);

      blockLenghtTmp--;
    }

    for (let i = startIndex; i >= 0 && blockLenghtTmp > 0; i--) {
      if (this._isIllegalPositions(posWallsInAxis[i])) {
        continue;
      }

      addWallSpriteFn(posWallsInAxis[i].x, posWallsInAxis[i].y);

      this.deletePositionFree(posWallsInAxis[i].x, posWallsInAxis[i].y);

      blockLenghtTmp--;
    }

    return blockLenght;
  }

  public isPositionFree(x: number, y: number) {
    return (
      this.freePositions.findIndex((item) => item.x === x && item.y === y) > -1
    );
  }

  public addPositionFree(x: number, y: number) {
    return this.freePositions.push({ x, y });
  }

  public deletePositionFree(x: number, y: number) {
    const indexToDelete = this.freePositions.findIndex(
      (item) => item.x === x && item.y === y
    );

    this._freePositions.splice(indexToDelete, 1);
  }

  public get freePositions() {
    return this._freePositions;
  }

  public set freePositions(v: IMapPosition[]) {
    this._freePositions = v;
  }
}
