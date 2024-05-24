import { ENEMY_DIRECTION_ENUM } from '../enums/EnemyDirectionEnum';
import { Player } from '@src/game/sprites/Player';
import { Enemy } from '@src/game/sprites/enemy/Enemy';

export interface IEnemyMotion {
  player: Player;
  enemy: Enemy;
  computeNewDirection(): ENEMY_DIRECTION_ENUM;
}
