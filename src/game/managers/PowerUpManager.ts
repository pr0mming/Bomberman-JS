import { Scene } from 'phaser';
import BombGroup from '@game/sprites/bomb/BombGroup';
import { Player } from '@game/sprites/player/Player';
import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';

interface IPowerUpManagerProps {
  scene: Scene;
  player: Player;
  bombGroup: BombGroup;
}

export class PowerUpManager {
  private _player: Player;
  private _bombGroup: BombGroup;
  private _scene: Scene;

  constructor({ scene, player, bombGroup }: IPowerUpManagerProps) {
    this._scene = scene;
    this._player = player;
    this._bombGroup = bombGroup;
  }

  addPowerUp(powerUp: PLAYER_POWER_UP_ENUM): number {
    this._scene.sound.stopByKey('stage-theme');
    this._scene.sound.play('find-the-door', { loop: true });

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
