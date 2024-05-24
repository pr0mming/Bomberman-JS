import { IEnemyMotion } from '@src/game/common/interfaces/IEnemyMotion';
import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';
import { Player } from '@src/game/sprites/Player';
import { Enemy } from '@src/game/sprites/enemy/Enemy';

export class BaseEnemyMotion implements IEnemyMotion {
  player: Player;
  enemy: Enemy;
  directions: ENEMY_DIRECTION_ENUM[];

  constructor(player: Player, enemy: Enemy) {
    this.player = player;
    this.enemy = enemy;

    this.directions = [
      ENEMY_DIRECTION_ENUM.LEFT,
      ENEMY_DIRECTION_ENUM.RIGH,
      ENEMY_DIRECTION_ENUM.UP,
      ENEMY_DIRECTION_ENUM.DOWN
    ];
  }

  computeNewDirection(): ENEMY_DIRECTION_ENUM {
    throw new Error('Method not implemented.');
  }
}
