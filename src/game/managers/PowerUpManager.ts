import { Scene } from 'phaser';

// Sprites
import BombGroup from '@game/sprites/bomb/BombGroup';
import { Player } from '@game/sprites/player/Player';

// Interfaces
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';

// Enums
import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';

interface IPowerUpManagerProps {
  scene: Scene;
  player: Player;
  bombGroup: BombGroup;
  gameStage: IGameInitialStage;
}

/**
 * This class manage all related to the powerUps of the player and assign a score by each powerUp
 */
export class PowerUpManager {
  private _player: Player;
  private _bombGroup: BombGroup;
  private _scene: Scene;
  private _gameStage: IGameInitialStage;

  constructor({ scene, player, bombGroup, gameStage }: IPowerUpManagerProps) {
    this._scene = scene;
    this._player = player;
    this._bombGroup = bombGroup;
    this._gameStage = gameStage;

    this._setUp();
  }

  /**
   * This method update the player with the powerUps captured so far
   */
  private _setUp() {
    for (const powerUp of this._gameStage.powerUps) {
      this._enablePowerUp(powerUp);
    }
  }

  /**
   * This method is used by the game scene in case the player gets a new power-up
   * @param powerUp powerUp Id
   * @returns the score of the powerUp
   */
  addPowerUp(powerUp: PLAYER_POWER_UP_ENUM): number {
    this._scene.sound.stopByKey('stage-theme');

    this._scene.sound.play('power-up');
    this._scene.sound.play('find-the-door', { loop: true });

    this._gameStage.powerUps.push(powerUp);

    return this._enablePowerUp(powerUp);
  }

  /**
   * This method update the game with the powerUp
   * @param powerUp powerUp Id
   * @returns the score of the powerUp
   */
  private _enablePowerUp(powerUp: PLAYER_POWER_UP_ENUM) {
    switch (powerUp) {
      case PLAYER_POWER_UP_ENUM.BOMB_UP:
        this._bombGroup.maxAmountBombs++;
        return 100;

      case PLAYER_POWER_UP_ENUM.FIRE_UP:
        this._bombGroup.explosionGroup.explosionLength++;
        return 150;

      case PLAYER_POWER_UP_ENUM.SPEED_UP:
        this._player.speed += 20;
        return 200;

      case PLAYER_POWER_UP_ENUM.REMOTE_CONTROL:
        this._bombGroup.isActiveRemoteControl = true;
        return 250;

      case PLAYER_POWER_UP_ENUM.WALL_PASS:
        this._player.hasWallPassPowerUp = true;
        return 300;

      case PLAYER_POWER_UP_ENUM.BOMB_PASS:
        this._player.hasBombPassPowerUp = true;
        return 350;

      case PLAYER_POWER_UP_ENUM.FLAME_PASS:
        this._player.hasFlamePassPowerUp = true;
        return 400;

      default:
        throw new Error('Power Up invalid');
    }
  }
}
