import { IPowerUp } from '@game/common/interfaces/IPowerUp';

// Enums
import { PLAYER_POWER_UP_ENUM } from '@game/common/enums/PlayerPowerUpEnum';

const getPlayerPowerUps = (): IPowerUp[] => {
  return [
    { id: PLAYER_POWER_UP_ENUM.BOMB_UP, textureKey: 'bomb-up' },
    { id: PLAYER_POWER_UP_ENUM.FIRE_UP, textureKey: 'fire-up' },
    { id: PLAYER_POWER_UP_ENUM.FLAME_PASS, textureKey: 'flame-pass' },
    { id: PLAYER_POWER_UP_ENUM.REMOTE_CONTROL, textureKey: 'remote-control' },
    { id: PLAYER_POWER_UP_ENUM.SPEED_UP, textureKey: 'speed-up' },
    { id: PLAYER_POWER_UP_ENUM.WALL_PASS, textureKey: 'wall-pass' }
  ];
};

export default getPlayerPowerUps;
