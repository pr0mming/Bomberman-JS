import { Physics, Scene, Tilemaps } from 'phaser';

// Sprites
import { WallGroup } from '@game/sprites/wall/WallGroup';
import { Wall } from '@game/sprites/wall/Wall';

// Helpers
import getPlayerPowerUps from '@game/common/helpers/getPlayerPowerUps';
import getStagesData from '@game/common/helpers/getStagesData';

// Interfaces
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';
import { IPowerUp } from '@game/common/interfaces/IPowerUp';
import { IGameSaved, IMapSaved } from '@game/common/interfaces/IGameSaved';

// Managers
import { WallBuilderManager } from '@game/managers/WallBuilderManager';

// Enums
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';

interface IMapManager {
  scene: Scene;
  world: Physics.Arcade.World;
  gameStage: IGameInitialStage;
  savedGame: IGameSaved | null;
}

/**
 * This class build the map (use the tilemap and the soft walls)
 */
export class MapManager {
  private _scene: Scene;
  private _world: Physics.Arcade.World;

  private _map!: Tilemaps.Tilemap;
  private _mapLayer!: Tilemaps.TilemapLayer;

  // This manager performs the logic to put the soft walls
  private _wallBuilderManager!: WallBuilderManager;
  private _wallsGroup!: WallGroup;

  private _roads!: Physics.Arcade.Group;
  private _crossroads!: Physics.Arcade.Group;

  // Constants to use in a Random function
  private _DEFAULT_MIN_WALLS: number;
  private _DEFAULT_MAX_WALLS: number;

  // The power up is different per stage, it is used only by the player
  private _powerUp!: Physics.Arcade.Image;

  // The door is used to know when to win
  private _door!: Physics.Arcade.Image;

  private _savedGame: IGameSaved | null;
  private _gameStage: IGameInitialStage;

  constructor({ scene, world, gameStage, savedGame }: IMapManager) {
    this._scene = scene;
    this._world = world;

    this._gameStage = gameStage;
    this._savedGame = savedGame;

    this._DEFAULT_MIN_WALLS = 45;
    this._DEFAULT_MAX_WALLS = 60;

    this._scene.cameras.main.backgroundColor =
      Phaser.Display.Color.HexStringToColor('#1F8B00');

    this._createMap();
  }

  /**
   * This method create the layer map and put elements like soft walls, the door and powerup
   */
  private _createMap() {
    const mapResult = this._createMapLayer();

    if (mapResult === null) {
      throw new Error('Map Layer is null to continue');
    }

    this._map = mapResult._map;
    this._mapLayer = mapResult._mapLayer;

    this._setUpWalls();
    this._setUpCrossroads();
    this._setUpSpecialObjects();

    this._setUpMusic();

    this._scene.cameras.main.setBounds(
      0,
      0,
      this._map.widthInPixels,
      this._map.heightInPixels
    );
  }

  private _createMapLayer() {
    const _map = this._scene.add.tilemap('world');
    const tilesMap = _map.addTilesetImage('tilemap');

    if (tilesMap) {
      const _mapLayer = _map.createLayer('Map', tilesMap);

      if (_mapLayer) {
        // Important: This line allows the sprites collide with the map layer
        _mapLayer.setCollisionByExclusion([-1]);

        return { _map, _mapLayer };
      }
    }

    return null;
  }

  /**
   * This method put the soft walls
   */
  private _setUpWalls() {
    // Roads: positions saved in the tilemap, those are positions that follows only two ways
    const roads =
      this._map.objects.find((object) => object.name === 'Roads')?.objects ??
      [];

    // Crossroads: positions saved in the tilemap, those are positions that follows up to 4 ways
    const crossroads =
      this._map.objects.find((object) => object.name === 'Crossroads')
        ?.objects ?? [];

    const { minWalls, maxWalls } = this._getAverageWalls();

    // Use manager ...
    this._wallBuilderManager = new WallBuilderManager({
      roads,
      crossroads,
      minWalls,
      maxWalls
    });

    this._wallsGroup = new WallGroup({
      scene: this._scene,
      world: this._world
    });

    this._validateSavedWalls((x: number, y: number) => {
      this._wallsGroup.add(
        new Wall({
          scene: this._scene,
          x,
          y
        }),
        true
      );
    });
  }

  /**
   * This method put the soft walls,
   * But if the stage is loaded (game saved) it will take the walls in local storage
   * Otherwise it will put the walls using a particular way ...
   * @param addWallSpriteFn it's a callback, this function perform the action of put the sprite (soft wall) on the map
   */
  private _validateSavedWalls(addWallSpriteFn: (x: number, y: number) => void) {
    if (
      this._gameStage.status === GAME_STATUS_ENUM.LOADED_GAME &&
      this._savedGame
    ) {
      this._wallBuilderManager.buildWallsFromArray(
        this._savedGame.map.walls,
        addWallSpriteFn
      );
    } else {
      this._wallBuilderManager.buildWalls(addWallSpriteFn);
    }
  }

  /**
   * This method checks if the stage is a bonus
   * Normally, a bonus stage doesn't have soft walls so that is returned 0 walls, otherwise is returned the default value
   * @returns the min and max of walls to put in the map
   */
  private _getAverageWalls() {
    if (this._gameStage.stage === GAME_STAGE_ENUM.FINAL_BONUS) {
      return { minWalls: 0, maxWalls: 0 };
    }

    return {
      minWalls: this._DEFAULT_MIN_WALLS,
      maxWalls: this._DEFAULT_MAX_WALLS
    };
  }

  private _setUpCrossroads() {
    this._crossroads = this._setUpTileGroup('Crossroads');
    this._roads = this._setUpTileGroup('Roads');
  }

  /**
   * This method convert an array of elements (x, y) of the tilemap to sprites
   * This is useful to save the roads and crossroads
   * @param key is the key of the array of objects of the tilemap
   * @returns a group of sprites
   */
  private _setUpTileGroup(key: string) {
    const group = this._scene.physics.add.group();

    const gameObjects = this._map.createFromObjects(key, {
      classType: Physics.Arcade.Image
    });

    return group.addMultiple(gameObjects).setVisible(false).scaleXY(1.2, 1.2);
  }

  /**
   * This method assign the door and power up, the bonus stage doesn't have any of these ones
   */
  private _setUpSpecialObjects() {
    if (this._gameStage.stage !== GAME_STAGE_ENUM.FINAL_BONUS) {
      this._setUpDoor();
      this._setUpPowerUp();
    }
  }

  private _setUpDoor() {
    const position = this._getPositionByObject('door', 'hasDoor');

    this._door = this._scene.physics.add
      .image(position.x, position.y, 'door')
      .setScale(2.5)
      .setVisible(this._getVisibilityByObject('door'));
  }

  private _setUpPowerUp() {
    // Pick powerup by stage
    const powerUpType = this._getPowerUp();

    const position = this._getPositionByObject('powerUp', 'hasPowerUp');

    this._powerUp = this._scene.physics.add
      .image(position.x, position.y, powerUpType.textureKey)
      .setScale(2.5)
      .setData('powerUpId', powerUpType.id)
      .setVisible(this._getVisibilityByObject('powerUp'));
  }

  /**
   * This method is used to get a free position of the map and place the door or powerup sprite
   * @param objectKey key of the saved game object, it's used to access the property
   * @param wallDataKey key that is used to mark a wall as the allocator of the door or powerup
   * @returns free position to being used by a sprite
   */
  private _getPositionByObject(
    objectKey: 'door' | 'powerUp',
    wallDataKey: string
  ) {
    if (
      this._gameStage.status === GAME_STATUS_ENUM.LOADED_GAME &&
      this._savedGame
    ) {
      // If is a saved game the position of the element is taken first (from local storage)
      const object = this._savedGame.map[objectKey];

      // If the element isn't visible it means there is a wall over
      if (!object.isVisible) {
        // Look up the wall with the position
        const wall = this.wallsGroup.getChildren().find((item) => {
          const _item = item as Wall;

          return (
            Math.floor(_item.body?.center.x ?? 0) === object.x &&
            Math.floor(_item.body?.center.y ?? 0) === object.y
          );
        });

        if (wall) {
          // Set the flag
          wall.setData(wallDataKey, true);
        }
      }

      return { x: object.x, y: object.y };
    }

    // Pick random position
    const wall = this._pickSafeRndWall();
    wall.setData(wallDataKey, true);

    return { x: wall.x, y: wall.y };
  }

  /**
   * This method decides if the object is visible or not
   * @param objectKey key of the saved game object, it's used to access the property
   * @returns if is visible or not
   */
  private _getVisibilityByObject(objectKey: 'door' | 'powerUp'): boolean {
    if (
      this._gameStage.status === GAME_STATUS_ENUM.LOADED_GAME &&
      this._savedGame
    ) {
      const object = this._savedGame.map[objectKey];
      return object.isVisible;
    }

    return false;
  }

  /**
   * This method pick the powerup id by stage
   * @returns Power Up Id
   */
  private _getPowerUp(): IPowerUp {
    const stages = getStagesData();
    const powerUps = getPlayerPowerUps();

    let stage = stages.find((item) => item.stage === this._gameStage.stage);

    if (stage === undefined) {
      stage = stages[0];
    }

    return powerUps.find((item) => item.id === stage.powerUp) ?? powerUps[0];
  }

  /**
   * This method get a random free position of the map to place the door or powerup
   * It also validates don't take any position taken before by any of the elements
   * @returns Sprite of wall
   */
  private _pickSafeRndWall(): Physics.Arcade.Sprite {
    const indexTmp = Phaser.Math.RND.between(
      0,
      this.wallsGroup.getLength() - 1
    );

    const wall = this.wallsGroup.getChildren()[
      indexTmp
    ] as Physics.Arcade.Sprite;

    if (
      (wall.getData('hasPowerUp') as boolean) ||
      (wall.getData('hasDoor') as boolean)
    ) {
      return this._pickSafeRndWall();
    }

    return wall;
  }

  private _setUpMusic() {
    const stageSong =
      this._gameStage.stage === GAME_STAGE_ENUM.FINAL_BONUS
        ? 'bonus-theme'
        : 'stage-theme';

    this._scene.sound.play(stageSong, { loop: true, volume: 0.5 });
  }

  /**
   * This method returns the walls and elements positions for local storage
   * @returns object ready to being save in local storage
   */
  getSavedState(): IMapSaved {
    return {
      walls: this.wallsGroup.getChildren().map((wall) => {
        const _wall = wall as Wall;

        return {
          x: Math.round(_wall.body?.center.x ?? 0),
          y: Math.round(_wall.body?.center.y ?? 0)
        };
      }),
      door: {
        x: Math.round(this.door.body?.center.x ?? 0),
        y: Math.round(this.door.body?.center.y ?? 0),
        isVisible: this.door.visible
      },
      powerUp: {
        x: Math.round(this.powerUp.body?.center.x ?? 0),
        y: Math.round(this.powerUp.body?.center.y ?? 0),
        isVisible: this.powerUp.visible
      }
    };
  }

  public get map() {
    return this._map;
  }

  public get mapLayer() {
    return this._mapLayer;
  }

  public get wallsGroup() {
    return this._wallsGroup;
  }

  public get crossroads() {
    return this._crossroads;
  }

  public get roads() {
    return this._roads;
  }

  public get wallBuilderManager() {
    return this._wallBuilderManager;
  }

  public get door() {
    return this._door;
  }

  public get powerUp() {
    return this._powerUp;
  }
}
