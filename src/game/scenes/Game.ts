import { Physics, Scene } from 'phaser';

// Interfaces
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';
import { IGameSaved } from '@game/common/interfaces/IGameSaved';

// Sprites
import { Player } from '@game/sprites/player/Player';
import { Wall } from '@game/sprites/wall/Wall';
import { Bomb } from '@game/sprites/bomb/Bomb';
import { BombGroup } from '@game/sprites/bomb/BombGroup';
import { Enemy } from '@game/sprites/enemy/Enemy';
import { EnemyGroup } from '@game/sprites/enemy/EnemyGroup';

// Managers
import { GameRulesManager } from '@game/managers/GameRulesManager';
import { MapManager } from '@game/managers/MapManager';
import { PowerUpManager } from '@game/managers/PowerUpManager';
import { SaveGameManager } from '@game/managers/SaveGameManager';

// Enums
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';

/**
 * This class is the codebase of the game
 */
export class Game extends Scene {
  // Core variables to set up the game and player (number of lifes, time, powerups, etc.)
  private _gameStage!: IGameInitialStage;
  private _savedGame: IGameSaved | null;

  // Elemens different to sprites or groups are called "Managers"
  private _gameRulesManager!: GameRulesManager;
  private _mapManager!: MapManager;
  private _powerUpManager!: PowerUpManager;
  private _saveGameManager!: SaveGameManager;

  // Sprites
  private _player!: Player;
  private _bombGroup!: BombGroup;
  private _enemiesGroup!: EnemyGroup;

  constructor() {
    super('Game');

    this._savedGame = null;
  }

  init(gameStage: IGameInitialStage) {
    this._gameStage = gameStage;
    this._savedGame = SaveGameManager.getLoadedGame();
  }

  create() {
    // Add core instances of the game
    this._mapManager = new MapManager({
      scene: this,
      world: this.physics.world,
      gameStage: this._gameStage,
      savedGame: this._savedGame
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
      bombGroup: this._bombGroup,
      gameStage: this._gameStage,
      savedGame: this._savedGame
    });

    this._enemiesGroup = new EnemyGroup({
      scene: this,
      world: this.physics.world,
      player: this._player,
      wallBuilderManager: this._mapManager.wallBuilderManager,
      gameStage: this._gameStage,
      savedGame: this._savedGame
    });

    this._powerUpManager = new PowerUpManager({
      scene: this,
      player: this._player,
      bombGroup: this._bombGroup,
      gameStage: this._gameStage
    });

    this._gameRulesManager = new GameRulesManager({
      scene: this,
      gameStage: this._gameStage,
      player: this._player,
      enemiesGroup: this._enemiesGroup
    });

    this._saveGameManager = new SaveGameManager({
      scene: this,
      gameStage: this._gameStage,
      player: this._player,
      enemiesGroup: this._enemiesGroup,
      mapManager: this._mapManager
    });

    // Set up colliders and overlap events

    // Add boundaries between the layermap and player
    this.physics.add.collider(this._player, this._mapManager.mapLayer);

    // Add boundaries between the any bomb and player
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

    // Add boundaries between the any soft wall and player
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

    // These two events are the same for "crossroads" and "roads"
    // It allows save the last tile (little part of the map) passed by the player
    // it allow know where to put the bomb using the right center position ...
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

    // If player touches any enemy, it dies
    this.physics.add.overlap(
      this._player,
      this._enemiesGroup,
      () => {
        this._gameRulesManager.lose();
      },
      undefined,
      this
    );

    // If player touches is reached out by any explosion, it dies
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

    // These events avoid the enemies stay in the same position forever
    // It moves the enemy in the opposite direction
    this.physics.add.collider(
      this._enemiesGroup,
      this._bombGroup,
      (enemy, _) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this._enemiesGroup,
      this._mapManager.mapLayer,
      (enemy, _) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      undefined,
      this
    );

    this.physics.add.collider(
      this._enemiesGroup,
      this._mapManager.wallsGroup,
      (enemy, _) => {
        const _enemy = enemy as Enemy;

        _enemy.retraceMotion();
      },
      (enemy, _) => {
        const _enemy = enemy as Enemy;

        return !_enemy.enemyData.hasWallPassPowerUp;
      },
      this
    );

    // If any enemy is aligned with the center of a "crossroad" it can perform movements in any direction
    this.physics.add.overlap(
      this._enemiesGroup,
      this._mapManager.crossroads,
      (enemy, crossroad) => {
        const _crossroad = crossroad as Physics.Arcade.Sprite;
        const _enemy = enemy as Enemy;

        const crossroadPos = {
          x: _crossroad.body?.center.x ?? 0,
          y: _crossroad.body?.center.y ?? 0
        };

        _enemy.lastCrossroadTouched = {
          x: crossroadPos.x,
          y: crossroadPos.y
        };

        // Perform motion
        _enemy.dispatchMotion();
      },
      (enemy, crossroad) => {
        const _enemy = enemy as Enemy;
        const _crossroad = crossroad as Physics.Arcade.Sprite;

        const tilePos = {
          x: _crossroad.body?.center.x ?? 0,
          y: _crossroad.body?.center.y ?? 0
        };

        // Is enemy center aligned with the tile center?
        return _enemy.validateCrossroadOverlap({
          x: tilePos.x,
          y: tilePos.y
        });
      },
      this
    );

    // If the explosion reaches out any bomb it will explode
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

    // Tese two events do the same,
    // Detect if the center of the player is aligned with the door or powerup, then is taken
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
          const powerUpCenterX = Math.floor(_powerUp.body.center.x);
          const powerUpCenterY = Math.floor(_powerUp.body.center.y);

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

    // If the explosion touches the door it will free a random number of enemies
    this.physics.add.overlap(
      this._bombGroup.explosionGroup,
      this._mapManager.door,
      () => {
        const door = this._mapManager.door;

        // Disable physics on the door temporary
        door.disableBody(false);

        setTimeout(() => {
          door.enableBody(false);
        }, 3000);

        if (door.body) {
          this._enemiesGroup.addRandomByPosition(
            door.body.center.x,
            door.body.center.y
          );
        }
      },
      () => {
        // This validation is to execute the event only once!
        // Otherwise there will be too many enemies there!
        const _door = this._mapManager.door;

        return _door.body?.enable && _door.visible;
      },
      this
    );

    // If the explosion reaches out any enemy, it dies
    this.physics.add.overlap(
      this._bombGroup.explosionGroup,
      this._enemiesGroup,
      (_, enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.kill();

        this._gameRulesManager.score += _enemy.enemyData.rewardPoints;

        if (
          this._enemiesGroup.getTotalUsed() === 0 &&
          this._gameStage.stage === GAME_STAGE_ENUM.FINAL_BONUS
        ) {
          this._gameRulesManager.win();
        }
      },
      (_, enemy) => {
        const _enemy = enemy as Enemy;

        return !_enemy.hasTemporalShield;
      },
      this
    );

    // If the explosion reaches out any enemy, it will be destroyed
    this.physics.add.collider(
      this._bombGroup.explosionGroup,
      this._mapManager.wallsGroup,
      (_, wall) => {
        const _wall = wall as Wall;

        _wall.kill();

        // Check if the wall hides the door ot powerup, then show it
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

        // Update map of free positions
        // It's important to know there to put the bomb or control the explosion range
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
    this._player.addControlsListener();
    this._saveGameManager.addControlsListener();
  }
}
