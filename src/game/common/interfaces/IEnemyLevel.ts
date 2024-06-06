import { ENEMY_ENUM } from '@game/common/enums/EnemyEnum';

export interface IEnemyLevel {
  quantity: number;
  type: ENEMY_ENUM;
}
