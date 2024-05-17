import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';
import { IPowerUp } from '@game/common/interfaces/IPowerUp';

const getPlayerPowerUps = (): IPowerUp[] => {
  return [
    { id: PLAYER_POWER_UP_ENUM.BOMB_UP, textureKey: 'bomb_up' },
    { id: PLAYER_POWER_UP_ENUM.FIRE_UP, textureKey: 'fire_up' },
    { id: PLAYER_POWER_UP_ENUM.FLAME_PASS, textureKey: 'flame_pass' },
    { id: PLAYER_POWER_UP_ENUM.REMOTE_CONTROL, textureKey: 'remote_control' },
    { id: PLAYER_POWER_UP_ENUM.SPEED_UP, textureKey: 'speed_up' },
    { id: PLAYER_POWER_UP_ENUM.WALL_PASS, textureKey: 'wall_pass' }
  ];
};

export default getPlayerPowerUps;
