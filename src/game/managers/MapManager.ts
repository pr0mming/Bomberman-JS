import { Physics, Scene, Tilemaps } from 'phaser';
import getPlayerPowerUps from '../common/helpers/getPlayerPowerUps';
import { WallGroup } from '../sprites/wall/WallGroup';
import { Wall } from '../sprites/wall/Wall';
import { WallBuilderManager } from './WallBuilderManager';
import { IMapPosition } from '../common/interfaces/IMapPosition';

interface IMapManager {
  scene: Scene;
  world: Physics.Arcade.World;
}

export class MapManager {
  private _scene: Scene;
  private _world: Physics.Arcade.World;

  private _map!: Tilemaps.Tilemap;
  private _mapLayer!: Tilemaps.TilemapLayer;

  private _wallBuilderManager!: WallBuilderManager;
  private _wallsGroup!: WallGroup;

  private _crossroads!: Physics.Arcade.Group;

  private _powerUp!: Physics.Arcade.Sprite;
  private _door!: Physics.Arcade.Sprite;

  constructor({ scene, world }: IMapManager) {
    this._scene = scene;
    this._world = world;

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

    this._setUpDoor();
    this._setUpPowerUp();

    this._scene.cameras.main.setBounds(
      0,
      0,
      this._map.widthInPixels,
      this._map.heightInPixels
    );

    this._scene.sound.play('stage-theme', { loop: true, volume: 0.5 });
  }

  private _createMapLayer() {
    const _map = this._scene.add.tilemap('world');
    const tilesMap = _map.addTilesetImage('playing-environment');

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

    const freePositions: IMapPosition[] = [
      ...roads.map((item) => ({ x: item.x ?? 0, y: item.y ?? 0 })),
      ...crossroads.map((item) => ({ x: item.x ?? 0, y: item.y ?? 0 }))
    ];

    this._wallsGroup = new WallGroup({
      scene: this._scene,
      world: this._world
    });

    this._wallBuilderManager = new WallBuilderManager(freePositions);

    this._wallBuilderManager.buildWalls((x: number, y: number) => {
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

  private _setUpCrossroads() {
    this._crossroads = this._scene.physics.add.group();

    const _crossroadsTmp = this._map.createFromObjects('Crossroads', {
      frame: 0
    });

    this._crossroads.addMultiple(_crossroadsTmp);
  }

  private _setUpDoor() {
    const indexTmp = Phaser.Math.RND.between(
      0,
      this.wallsGroup.getLength() - 1
    );

    const wall = this.wallsGroup.getChildren()[
      indexTmp
    ] as Physics.Arcade.Sprite;

    this._door = this._scene.physics.add
      .sprite(wall.x, wall.y, 'door')
      .setScale(2.5);
    //.setVisible(false);
  }

  private _setUpPowerUp() {
    const powerUpType = this._pickPowerUp();

    const indexTmp = Phaser.Math.RND.between(
      0,
      this.wallsGroup.getLength() - 1
    );

    const wall = this.wallsGroup.getChildren()[
      indexTmp
    ] as Physics.Arcade.Sprite;

    this._powerUp = this._scene.physics.add
      .sprite(wall.x, wall.y, powerUpType.textureKey)
      .setScale(2.5)
      .setData('powerUpId', powerUpType.id);
    //.setVisible(false);
  }

  private _pickPowerUp() {
    const powerUps = getPlayerPowerUps();
    const index = Phaser.Math.RND.between(0, powerUps.length - 1);

    return powerUps[index];
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

  public get freePositions() {
    return this._wallBuilderManager.freePositions;
  }

  public get door() {
    return this._door;
  }

  public get powerUp() {
    return this._powerUp;
  }
}
