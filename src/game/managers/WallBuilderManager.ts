import { Types } from 'phaser';

// Interfaces
import { IMapPosition } from '@game/common/interfaces/IMapPosition';

// Enums
import { WALL_TO_BUILD_ENUM } from '@game/common/enums/WallToBuildEnum';

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

/**
 * This class performs the algorithm to place each soft wall on the map
 */
export class WallBuilderManager {
  // Important: This variable keeps all the free positions of the map
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
      WALL_TO_BUILD_ENUM.ISOLATED, // One soft wall
      WALL_TO_BUILD_ENUM.COLUMN, // Two or more soft walls together (column dir)
      WALL_TO_BUILD_ENUM.ROW // Two or more soft walls together (row dir)
    ];

    this._setUp(roads, crossroads);
  }

  private _setUp(
    roads: Types.Tilemaps.TiledObject[],
    crossroads: Types.Tilemaps.TiledObject[]
  ) {
    // Just merge both arrays, I think order isn't important so far ...
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

  /**
   * This method checks if a x, y position is illegal, it is when is the same position of the player (60, 120)
   * Or it is x + 40, y (right side of the player)
   * Or it is x, y + 40 (bottom side of the player)
   * Take care of the positions you place here, otherwise it won't work!
   * @param position position to evaluate
   * @returns is illegal or not
   */
  private _isIllegalPositions(position: IMapPosition): boolean {
    return (
      (position.x === 60 && position.y === 120) ||
      (position.x === 60 && position.y === 160) ||
      (position.x === 100 && position.y === 120)
    );
  }

  /**
   * Return a random element from free positions but it evaluates if the position is legal
   * @returns position x, y and index of the element
   */
  pickSafeRndFreePosition(): ISafeRndFreePositionResult {
    const index = Phaser.Math.RND.between(0, this._freePositions.length - 1);

    const element = this._freePositions[index];

    if (this._isIllegalPositions(element)) {
      return this.pickSafeRndFreePosition();
    }

    return { element, index };
  }

  /**
   * This method places the soft walls on the map given an array, that's it!
   * It's called to load a saved game from local storage
   * @param walls data of wall positions
   * @param addWallSpriteFn callback to put the wall sprite
   */
  buildWallsFromArray(
    walls: IMapPosition[],
    addWallSpriteFn: (x: number, y: number) => void
  ) {
    for (const position of walls) {
      addWallSpriteFn(position.x, position.y);

      this.deletePositionFree(position.x, position.y);
    }
  }

  /**
   * This method put the walls in a random way, but sometimes it can create row or column structures
   * @param addWallSpriteFn callback to put the wall sprite
   */
  buildWalls(addWallSpriteFn: (x: number, y: number) => void) {
    // First, get the number of walls to place ...
    const wallNumber = Phaser.Math.RND.between(this._minWalls, this._maxWalls);

    let i = 0;

    while (i < wallNumber) {
      // Choose the type of structure to place (isolate, row or column)
      const indexTmp = Phaser.Math.RND.between(0, this._wallTypes.length - 1);
      const wallTypeToBuild = this._wallTypes[indexTmp];

      // Take a legal position to place our structure ...
      const { element, index } = this.pickSafeRndFreePosition();

      switch (wallTypeToBuild) {
        // Most simple case: Put one wall and mark the position as busy!
        case WALL_TO_BUILD_ENUM.ISOLATED:
          addWallSpriteFn(element.x, element.y);

          this._freePositions.splice(index, 1);
          i++;

          break;

        // Row case: Two or more walls to place, so we take the walls (y axis)
        case WALL_TO_BUILD_ENUM.ROW:
          i += this._allocateWallsInAxis({
            posWall: element,
            posWallsInAxis: this._freePositions.filter(
              (wall) => wall.y === element.y
            ),
            addWallSpriteFn
          });

          break;

        // Column case: Same case as above, but for x axis
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

  /**
   * This method places a wall structure (row or column)
   * @param parameters set of wall positions (row or column)
   * @returns number of walls placed
   */
  private _allocateWallsInAxis(parameters: IAllocateWallsInAxisParams): number {
    const { posWall, posWallsInAxis, addWallSpriteFn } = parameters;

    // How long would be the row/column ...
    let blockLenght = Phaser.Math.RND.between(2, 4);

    // Is possible the walls to place are too many!
    if (blockLenght > posWallsInAxis.length) {
      blockLenght = posWallsInAxis.length;
    }

    // Choose randomly in wich position put the first wall
    const startIndex = posWallsInAxis.findIndex(
      (wall) => wall.x === posWall.x && wall.y === posWall.y
    );

    let blockLenghtTmp = blockLenght;

    // Iterate from left to right until complete the length of the structure
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

    // In case there is missing walls to place, do the same but from right to left
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
