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
      world: this.physics.world
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
      freePositions: this._mapManager.freePositions,
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
      (player, _) => {
        const _player = player as Player;

        return !_player.hasFlamePassPowerUp;
      },
      this
    );

    // this.physics.add.overlap(
    //   this._player,
    //   this._mapManager.crossroads,
    //   (enemy, crossroad) => {
    //     const _crossroad = crossroad as Physics.Arcade.Sprite;

    //     console.log(_crossroad.body?.x, _crossroad.body?.y);
    //   },
    //   undefined,
    //   this
    // );

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

        const crossroadPos = {
          x: _crossroad.body?.x ?? 0,
          y: _crossroad.body?.y ?? 0
        };

        return _enemy.validateCrossroadOverlap({
          x: crossroadPos.x,
          y: crossroadPos.y
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

        this._gameStage.stageScore += extraPoints;

        this._gameRulesManager.setLabelTextByKey(
          'SCORE',
          this._gameStage.stageScore.toString()
        );

        _powerUp.destroy();
      },
      (player, powerUp) => {
        const _player = player as Player;
        const _powerUp = powerUp as Physics.Arcade.Sprite;

        return (
          _player.body &&
          _powerUp.body &&
          Math.floor(_player.body.center.x) ===
            Math.floor(_powerUp.body.center.x) &&
          Math.floor(_player.body.center.y) ===
            Math.floor(_powerUp.body.center.y)
        );
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
        const _door = door as Physics.Arcade.Sprite;

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
      (_, door) => {
        const _door = door as Physics.Arcade.Sprite;

        _door.disableBody(false);

        setTimeout(() => {
          _door.enableBody(false);
        }, 2000);

        if (_door.body) {
          this._enemiesGroup.addRandomByPosition(
            _door.body.center.x,
            _door.body.center.y
          );
        }
      },
      (_, door) => {
        const _door = door as Physics.Arcade.Sprite;

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
          this._mapManager.door.setVisible(true);
        }

        if (_wall.getData('hasPowerUp')) {
          this._mapManager.powerUp.setVisible(true);
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
