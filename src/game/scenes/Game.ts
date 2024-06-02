import { Physics, Scene } from 'phaser';

// Interfaces
import { IGameStage } from '@game/common/interfaces/IGameStage';

// Helpers
import getInitialBombermanStage from '@game/common/helpers/getInitialBombermanStage';

// Sprites
import { Player } from '@game/sprites/player/Player';
import { Wall } from '@game/sprites/wall/Wall';
import { Bomb } from '@game/sprites/bomb/Bomb';
import { BombGroup } from '@game/sprites/bomb/BombGroup';
import { Enemy } from '@game/sprites/enemy/Enemy';
import { EnemyGroup } from '@game/sprites/enemy/EnemyGroup';

// Managers
import { MapManager } from '@game/managers/MapManager';
import { PowerUpManager } from '@game/managers/PowerUpManager';
import { GameRulesManager } from '@game/managers/GameRulesManager';

export class Game extends Scene {
  private _gameStage: IGameStage;

  private _gameRulesManager!: GameRulesManager;
  private _mapManager!: MapManager;
  private _powerUpManager!: PowerUpManager;

  private _player!: Player;
  private _bombGroup!: BombGroup;
  private _enemiesGroup!: EnemyGroup;

  constructor() {
    super('Game');

    this._gameStage = getInitialBombermanStage();
  }

  init(gameStage: IGameStage) {
    this._gameStage = gameStage;
  }

  create() {
    this._mapManager = new MapManager({
      scene: this,
      world: this.physics.world
    });

    this._bombGroup = new BombGroup({
      scene: this,
      world: this.physics.world,
      wallBuilderManager: this._mapManager.wallBuilderManager
    });

    this._player = new Player({
      scene: this,
      x: 60,
      y: 120,
      bombGroup: this._bombGroup
    });

    this._enemiesGroup = new EnemyGroup({
      scene: this,
      world: this.physics.world,
      stage: this._gameStage.stage,
      wallBuilderManager: this._mapManager.wallBuilderManager,
      player: this._player
    });

    this._powerUpManager = new PowerUpManager({
      scene: this,
      player: this._player,
      bombGroup: this._bombGroup
    });

    this._gameRulesManager = new GameRulesManager({
      scene: this,
      player: this._player,
      enemiesGroup: this._enemiesGroup,
      gameStage: this._gameStage
    });

    // Set up colliders and overlap events

    this.physics.add.collider(this._player, this._mapManager.mapLayer);
    this.physics.add.collider(
      this._player,
      this._bombGroup,
      undefined,
      (player, _) => {
        const _player = player as Player;

        return !_player.hasBombPassPowerUp;
      },
      this
    );

    this.physics.add.collider(
      this._player,
      this._mapManager.wallsGroup,
      undefined,
      (player, _) => {
        const _player = player as Player;

        return !_player.hasWallPassPowerUp;
      },
      this
    );

    this.physics.add.overlap(
      this._player,
      this._mapManager.crossroads,
      (_, tile) => {
        const _tile = tile as Physics.Arcade.Image;

        if (_tile.body) {
          this._player.lastTilePassedPosition = {
            x: Math.floor(_tile.body.center.x),
            y: Math.floor(_tile.body.center.y)
          };
        }
      },
      (_, tile) => {
        const _tile = tile as Physics.Arcade.Image;

        return this._player.validateTileOverlap(_tile);
      },
      this
    );

    this.physics.add.overlap(
      this._player,
      this._mapManager.roads,
      (_, tile) => {
        const _tile = tile as Physics.Arcade.Image;

        if (_tile.body) {
          this._player.lastTilePassedPosition = {
            x: Math.floor(_tile.body.center.x),
            y: Math.floor(_tile.body.center.y)
          };
        }
      },
      (_, tile) => {
        const _tile = tile as Physics.Arcade.Image;

        return this._player.validateTileOverlap(_tile);
      },
      this
    );

    this.physics.add.overlap(
      this._player,
      this._enemiesGroup,
      () => {
        this._gameRulesManager.lose();
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this._player,
      this._bombGroup.explosionGroup,
      () => {
        this._gameRulesManager.lose();
      },
      () => {
        return !this._player.hasFlamePassPowerUp;
      },
      this
    );

    this.physics.add.collider(
      this._enemiesGroup,
      this._bombGroup,
      (enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this._enemiesGroup,
      this._mapManager.mapLayer,
      (enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this._enemiesGroup,
      this._mapManager.wallsGroup,
      (enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      (enemy) => {
        const _enemy = enemy as Enemy;

        return !_enemy.enemyData.hasWallPassPowerUp;
      },
      this
    );

    this.physics.add.overlap(
      this._enemiesGroup,
      this._mapManager.crossroads,
      (enemy, crossroad) => {
        const _crossroad = crossroad as Physics.Arcade.Sprite;
        const _enemy = enemy as Enemy;

        const crossroadPos = {
          x: _crossroad.body?.x ?? 0,
          y: _crossroad.body?.y ?? 0
        };

        _enemy.lastCrossroadTouched = {
          x: crossroadPos.x,
          y: crossroadPos.y
        };

        // Perform movement so that the enemy isn't immovable
        _enemy.dispatchMotion();
      },
      (enemy, crossroad) => {
        const _enemy = enemy as Enemy;
        const _crossroad = crossroad as Physics.Arcade.Sprite;

        const tilePos = {
          x: _crossroad.body?.x ?? 0,
          y: _crossroad.body?.y ?? 0
        };

        return _enemy.validateCrossroadOverlap({
          x: tilePos.x,
          y: tilePos.y
        });
      },
      this
    );

    this.physics.add.overlap(
      this._bombGroup.explosionGroup,
      this._bombGroup,
      (_, bomb) => {
        const _bomb = bomb as Bomb;

        this._bombGroup.exploitByBomb(_bomb);
      },
      undefined,
      this
    );

    this.physics.add.overlap(
      this._player,
      this._mapManager.powerUp,
      (_, powerUp) => {
        const _powerUp = powerUp as Physics.Arcade.Sprite;
        const powerUpId = _powerUp.getData('powerUpId') as number;

        const extraPoints = this._powerUpManager.addPowerUp(powerUpId);

        this._gameRulesManager.score += extraPoints;

        _powerUp.destroy();
      },
      (player, powerUp) => {
        const _player = player as Player;
        const _powerUp = powerUp as Physics.Arcade.Image;

        if (_player.body && _powerUp.body) {
          const playerCenterX = Math.round(_player.body.center.x);
          const playerCenterY = Math.round(_player.body.center.y);
          const powerUpCenterX = Math.round(_powerUp.body.center.x);
          const powerUpCenterY = Math.round(_powerUp.body.center.y);

          const deltaX = Math.abs(playerCenterX - powerUpCenterX);
          const deltaY = Math.abs(playerCenterY - powerUpCenterY);

          return deltaX <= 5 && deltaY <= 5;
        }

        return false;
      },
      this
    );

    this.physics.add.overlap(
      this._player,
      this._mapManager.door,
      () => {
        if (this._enemiesGroup.getLength() === 0) this._gameRulesManager.win();
      },
      (player, door) => {
        const _player = player as Player;
        const _door = door as Physics.Arcade.Image;

        return (
          _player.body &&
          _door.body &&
          Math.floor(_player.body.center.x) ===
            Math.floor(_door.body.center.x) &&
          Math.floor(_player.body.center.y) === Math.floor(_door.body.center.y)
        );
      },
      this
    );

    this.physics.add.overlap(
      this._bombGroup.explosionGroup,
      this._mapManager.door,
      () => {
        const door = this._mapManager.door;

        if (door.body) {
          this._enemiesGroup.addRandomByPosition(
            door.body.center.x,
            door.body.center.y
          );
        }
      },
      () => {
        const _door = this._mapManager.door;

        return _door.body?.enable && _door.visible;
      },
      this
    );

    this.physics.add.overlap(
      this._bombGroup.explosionGroup,
      this._enemiesGroup,
      (_, enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.kill();

        this._gameRulesManager.score += _enemy.enemyData.rewardPoints;
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this._bombGroup.explosionGroup,
      this._mapManager.wallsGroup,
      (_, wall) => {
        const _wall = wall as Wall;

        _wall.kill();

        if (_wall.getData('hasDoor')) {
          const door = this._mapManager.door;

          door.disableBody(false);

          setTimeout(() => {
            door.enableBody(false);
          }, 3000);

          door.setVisible(true);
        }

        if (_wall.getData('hasPowerUp')) {
          this._mapManager.powerUp.setVisible(true);
        }

        if (_wall.body) {
          const posX = Math.floor(_wall.body.center.x);
          const posY = Math.floor(_wall.body.center.y);

          this._mapManager.wallBuilderManager.addPositionFree(posX, posY);
        }
      },
      undefined,
      this
    );
  }

  update() {
    //if (this._save.isDown) {
    //coming soon
    //}

    this._player?.addControlsListener();
  }
}
