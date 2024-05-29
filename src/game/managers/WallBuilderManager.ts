// Interfaces
import { IMapPosition } from '../common/interfaces/IMapPosition';

// Enums
import { WALL_TO_BUILD_ENUM } from '../common/enums/WallToBuildEnum';

interface IAllocateWallsInAxisParams {
  posWall: IMapPosition;
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

    this._minWalls = 90;
    this._maxWalls = 130;

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
        !(pos.x === 60 && pos.y === 160) &&
        !(pos.x === 100 && pos.y === 120)
    );
  }

  buildWalls(addWallSpriteFn: (x: number, y: number) => void) {
    const wallNumber = Phaser.Math.RND.between(this._minWalls, this._maxWalls);

    let i = 0;

    while (i < wallNumber) {
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
          i++;

          break;

        case WALL_TO_BUILD_ENUM.ROW:
          i += this._allocateWallsInAxis({
            posWall,
            posWallsInAxis: this._freePositions.filter(
              (wall) => wall.y === posWall.y
            ),
            addWallSpriteFn
          });

          break;

        case WALL_TO_BUILD_ENUM.COLUMN:
          i += this._allocateWallsInAxis({
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
      addWallSpriteFn(posWallsInAxis[i].x, posWallsInAxis[i].y);

      const indexToDelete = this.freePositions.findIndex(
        (wall) =>
          wall.x === posWallsInAxis[i].x && wall.y === posWallsInAxis[i].y
      );

      this._freePositions.splice(indexToDelete, 1);

      blockLenghtTmp--;
    }

    for (let i = startIndex; i >= 0 && blockLenghtTmp > 0; i--) {
      addWallSpriteFn(posWallsInAxis[i].x, posWallsInAxis[i].y);

      const indexToDelete = this.freePositions.findIndex(
        (wall) =>
          wall.x === posWallsInAxis[i].x && wall.y === posWallsInAxis[i].y
      );

      this._freePositions.splice(indexToDelete, 1);

      blockLenghtTmp--;
    }

    return blockLenght;
  }

  public get freePositions() {
    return this._freePositions;
  }
}
