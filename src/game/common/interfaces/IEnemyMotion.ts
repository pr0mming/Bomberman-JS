import { Physics } from 'phaser';
import { Player } from '@src/game/sprites/player/Player';
import { ENEMY_DIRECTION_ENUM } from '../enums/EnemyDirectionEnum';
import { ISpritePosition } from './ISpritePosition';

export interface IEnemyMotion {
  player: Player;
  enemyBody: Physics.Arcade.Body | Physics.Arcade.StaticBody | null;
  direction: ENEMY_DIRECTION_ENUM;
  directions: ENEMY_DIRECTION_ENUM[];
  computeNewDirection(): void;
  retraceMotion(): void;
  validateCrossroadOverlap(
    enemyCrossroad: ISpritePosition,
    crossroadPosition: ISpritePosition
  ): boolean;
}
