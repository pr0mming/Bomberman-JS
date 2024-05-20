import { WALL_TO_BUILD_ENUM } from '../common/enums/WallToBuildEnum';
import { IMapPosition } from '../common/interfaces/IMapPosition';

interface IAllocateWallsInAxisParams {
  posWall: IMapPosition;
  posWallIndex: number;
  posWallsInAxis: IMapPosition[];
  addWallSpriteFn: (x: number, y: number) => void;
}

export class WallBuilderManager {
  private _freePositions: IMapPosition[];

  private _minWalls: number;
  private _maxWalls: number;
  private _wallTypes: WALL_TO_BUILD_ENUM[];

  constructor(freePositions: IMapPosition[]) {
    this._freePositions = this._excludeIllegalPositions(freePositions);

    this._minWalls = 5;
    this._maxWalls = 10;

    this._wallTypes = [
      WALL_TO_BUILD_ENUM.ISOLATED,
      WALL_TO_BUILD_ENUM.COLUMN,
      WALL_TO_BUILD_ENUM.ROW
    ];
  }

  private _excludeIllegalPositions(positions: IMapPosition[]) {
    return positions.filter(
      (pos) =>
        !(pos.x === 60 && pos.y === 120) &&
        !(pos.x === 140 && pos.y === 120) &&
        !(pos.x === 60 && pos.y === 200)
    );
  }

  buildWalls(addWallSpriteFn: (x: number, y: number) => void) {
    const wallNumber = Phaser.Math.RND.between(this._minWalls, this._maxWalls);

    for (let i = 0; i < wallNumber; i++) {
      const indexTmp = Phaser.Math.RND.between(0, this._wallTypes.length - 1);
      const wallTypeToBuild = this._wallTypes[indexTmp];

      const posWallIndex = Phaser.Math.RND.between(
        0,
        this._freePositions.length - 1
      );
      const posWall = this._freePositions[posWallIndex];

      switch (wallTypeToBuild) {
        case WALL_TO_BUILD_ENUM.ISOLATED:
          addWallSpriteFn(posWall.x, posWall.y);

          this._freePositions.splice(posWallIndex, 1);
          break;

        case WALL_TO_BUILD_ENUM.ROW:
          this._allocateWallsInAxis({
            posWallIndex,
            posWall,
            posWallsInAxis: this._freePositions.filter(
              (wall) => wall.y === posWall.y
            ),
            addWallSpriteFn
          });

          break;

        case WALL_TO_BUILD_ENUM.COLUMN:
          this._allocateWallsInAxis({
            posWallIndex,
            posWall,
            posWallsInAxis: this._freePositions.filter(
              (wall) => wall.x === posWall.x
            ),
            addWallSpriteFn
          });

          break;

        default:
          break;
      }
    }
  }

  private _allocateWallsInAxis(parameters: IAllocateWallsInAxisParams) {
    const { posWall, posWallIndex, posWallsInAxis, addWallSpriteFn } =
      parameters;

    let blockLenght = Phaser.Math.RND.between(2, 4);

    if (blockLenght > posWallsInAxis.length) {
      blockLenght = posWallsInAxis.length;
    }

    const startIndex = posWallsInAxis.findIndex(
      (wall) => wall.x === posWall.x && wall.y === posWall.y
    );

    for (
      let i = startIndex;
      i < posWallsInAxis.length && blockLenght > 0;
      i++
    ) {
      addWallSpriteFn(posWallsInAxis[i].x, posWallsInAxis[i].y);
      this._freePositions.splice(posWallIndex, 1);

      blockLenght--;
    }

    for (let i = startIndex; i >= 0 && blockLenght > 0; i--) {
      addWallSpriteFn(posWallsInAxis[i].x, posWallsInAxis[i].y);
      this._freePositions.splice(posWallIndex, 1);

      blockLenght--;
    }
  }

  public get freePositions() {
    return this._freePositions;
  }
}
