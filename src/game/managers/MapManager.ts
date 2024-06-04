import { Physics, Scene, Tilemaps } from 'phaser';

// Sprites
import { WallGroup } from '@game/sprites/wall/WallGroup';
import { Wall } from '@game/sprites/wall/Wall';

// Helpers
import getPlayerPowerUps from '@game/common/helpers/getPlayerPowerUps';
import getStagesData from '../common/helpers/getStagesData';

// Interfaces
import { IGameInitialStage } from '../common/interfaces/IGameInitialStage';
import { IPowerUp } from '../common/interfaces/IPowerUp';

// Managers
import { WallBuilderManager } from '@game/managers/WallBuilderManager';

// Enums
import { GAME_STAGE_ENUM } from '../common/enums/GameStageEnum';
import { IGameSaved, IMapSaved } from '../common/interfaces/IGameSaved';
import { GAME_STATUS_ENUM } from '../common/enums/GameStatusEnum';

interface IMapManager {
  scene: Scene;
  world: Physics.Arcade.World;
  gameStage: IGameInitialStage;
  savedGame: IGameSaved | null;
}

export class MapManager {
  private _scene: Scene;
  private _world: Physics.Arcade.World;

  private _map!: Tilemaps.Tilemap;
  private _mapLayer!: Tilemaps.TilemapLayer;

  private _wallBuilderManager!: WallBuilderManager;
  private _wallsGroup!: WallGroup;

  private _roads!: Physics.Arcade.Group;
  private _crossroads!: Physics.Arcade.Group;

  private _DEFAULT_MIN_WALLS: number;
  private _DEFAULT_MAX_WALLS: number;

  private _powerUp!: Physics.Arcade.Image;
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
        _mapLayer.setCollisionByExclusion([-1]);

        return { _map, _mapLayer };
      }
    }

    return null;
  }

  private _setUpWalls() {
    const roads =
      this._map.objects.find((object) => object.name === 'Roads')?.objects ??
      [];

    const crossroads =
      this._map.objects.find((object) => object.name === 'Crossroads')
        ?.objects ?? [];

    const { minWalls, maxWalls } = this._getAverageWalls();

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

  private _setUpTileGroup(key: string) {
    const group = this._scene.physics.add.group();

    const gameObjects = this._map.createFromObjects(key, {
      classType: Physics.Arcade.Image
    });

    return group.addMultiple(gameObjects).setVisible(false).scaleXY(1.2, 1.2);
  }

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
    const powerUpType = this._getPowerUp();

    const position = this._getPositionByObject('powerUp', 'hasPowerUp');

    this._powerUp = this._scene.physics.add
      .image(position.x, position.y, powerUpType.textureKey)
      .setScale(2.5)
      .setData('powerUpId', powerUpType.id)
      .setVisible(this._getVisibilityByObject('powerUp'));
  }

  private _getPositionByObject(
    objectKey: 'door' | 'powerUp',
    wallDataKey: string
  ) {
    if (
      this._gameStage.status === GAME_STATUS_ENUM.LOADED_GAME &&
      this._savedGame
    ) {
      const object = this._savedGame.map[objectKey];

      if (!object.isVisible) {
        const wall = this.wallsGroup.getChildren().find((item) => {
          const _item = item as Wall;

          return (
            Math.floor(_item.body?.center.x ?? 0) === object.x &&
            Math.floor(_item.body?.center.y ?? 0) === object.y
          );
        });

        if (wall) {
          wall.setData(wallDataKey, true);
        }
      }

      return { x: object.x, y: object.y };
    }

    const wall = this._pickSafeRndWall();
    wall.setData(wallDataKey, true);

    return { x: wall.x, y: wall.y };
  }

  private _getVisibilityByObject(objectKey: 'door' | 'powerUp') {
    if (
      this._gameStage.status === GAME_STATUS_ENUM.LOADED_GAME &&
      this._savedGame
    ) {
      const object = this._savedGame.map[objectKey];
      return object.isVisible;
    }

    return false;
  }

  private _getPowerUp(): IPowerUp {
    const stages = getStagesData();
    const powerUps = getPlayerPowerUps();

    let stage = stages.find((item) => item.stage === this._gameStage.stage);

    if (stage === undefined) {
      stage = stages[0];
    }

    return powerUps.find((item) => item.id === stage.powerUp) ?? powerUps[0];
  }

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
