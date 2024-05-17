import { Physics, Scene, Tilemaps, Types } from 'phaser';
import getPlayerPowerUps from '../common/helpers/getPlayerPowerUps';

interface IMapManager {
  scene: Scene;
}

export class MapManager {
  private _map!: Tilemaps.Tilemap;
  private _mapLayer!: Tilemaps.TilemapLayer;

  private _bricks!: Physics.Arcade.Group;
  private _crossroads!: Physics.Arcade.Group;

  private _powerUp!: Physics.Arcade.Sprite;
  private _door!: Physics.Arcade.Sprite;
  private _bricksPosition: string[] = [];

  constructor({ scene }: IMapManager) {
    scene.cameras.main.backgroundColor =
      Phaser.Display.Color.HexStringToColor('#1F8B00');

    this._createMap(scene);
  }

  private _createMap(scene: Scene) {
    const mapResult = this._createMapLayer(scene);

    if (mapResult === null) {
      throw new Error('Map Layer is null to continue');
    }

    this._map = mapResult._map;
    this._mapLayer = mapResult._mapLayer;

    this._setUpBricks(scene);
    this._setUpCrossroads(scene);

    this._setUpDoor();
    this._setUpPowerUp();

    scene.cameras.main.setBounds(
      0,
      0,
      this._map.widthInPixels,
      this._map.heightInPixels
    );

    scene.sound.play('stage-theme', { loop: true, volume: 0.5 });
  }

  private _createMapLayer(scene: Scene) {
    const _map = scene.add.tilemap('world');
    const tilesMap = this._map.addTilesetImage('playing-environment');

    //if (this._stageBomberman.map.length > 0)
    //  this._map.objects = this._stageBomberman.map;

    const _tiles = _map.objects.find((object) => object.name === 'Objects');

    if (_tiles) {
      _tiles.objects.forEach((brick) => {
        if (brick.name == '') brick.gid = 10;
        else if (brick.name == 'power') brick.gid = 20;
        else if (brick.name == 'door') brick.gid = 15;
      }, this);

      _map.objects = [
        ..._map.objects.filter((object) => object.name !== 'Objects'),
        _tiles
      ];
    }

    if (tilesMap) {
      const _mapLayer = _map.createLayer('Map', tilesMap);

      if (_mapLayer) {
        _mapLayer.setCollisionByExclusion([-1]);

        return { _map, _mapLayer };
      }
    }

    return null;
  }

  private _setUpBricks(scene: Scene) {
    this._bricks = scene.physics.add.group();

    const _bricks = this._map.createFromObjects('Objects', {
      gid: 10,
      key: 'brick',
      frame: 0
    });

    this._bricks.addMultiple(_bricks);

    scene.anims.create({
      key: 'brick-wait',
      frames: scene.anims.generateFrameNumbers('brick', {
        frames: [0]
      }),
      frameRate: 10
    });

    scene.anims.create({
      key: 'brick-destroy',
      frames: scene.anims.generateFrameNumbers('brick', {
        frames: [1, 2, 3, 4, 5, 6]
      }),
      frameRate: 10
    });

    this._bricks.getChildren().forEach((element) => {
      const _element = element as Types.Physics.Arcade.SpriteWithDynamicBody;

      // Set the anchor of each brick
      // This is to allocate correctly all the elements,
      // Otherwise they'll be appear overlaped the enemies or metal blocks
      _element.setOrigin(0.5, -0.5);
      _element.body.setSize(16, 16, true);
      _element.body.immovable = true;

      this._bricksPosition.push(
        Math.round(_element.body.x) + ',' + Math.round(_element.body.y)
      );
    }, this);
  }

  private _setUpCrossroads(scene: Scene) {
    this._crossroads = scene.physics.add.group();

    const _crossroadsTmp = this._map.createFromObjects('Crossroads', {
      gid: 30,
      frame: 0
    });

    this._crossroads.addMultiple(_crossroadsTmp).setVisible(false);
  }

  private _setUpDoor() {
    this._door = this._map.createFromObjects('Objects', {
      gid: 20,
      key: 'door',
      frame: 0
    })[0] as Types.Physics.Arcade.SpriteWithDynamicBody;

    this._door.setOrigin(0.5, 0.6).setVisible(false).setData('isDoor', true);
  }

  private _setUpPowerUp() {
    const powerUpType = this._pickPowerUp();

    this._powerUp = this._map.createFromObjects('Objects', {
      gid: 15,
      key: powerUpType.textureKey,
      frame: 0
    })[0] as Types.Physics.Arcade.SpriteWithDynamicBody;

    this._powerUp
      .setOrigin(0.5, 0.6)
      .setVisible(false)
      .setData('powerUp', powerUpType.id);
  }

  private _pickPowerUp() {
    const powerUps = getPlayerPowerUps();
    const index = Math.floor(Math.random() * powerUps.length);

    return powerUps[index];
  }

  public get map() {
    return this._map;
  }

  public get mapLayer() {
    return this._mapLayer;
  }

  public get bricks() {
    return this._bricks;
  }

  public get crossroads() {
    return this._crossroads;
  }
}
