import { Physics } from 'phaser';

// Sprites
import { Player } from '@game/sprites/player/Player';

// Interfaces
import { ISpritePosition } from '@game/common/interfaces/ISpritePosition';

// Enums
import { ENEMY_DIRECTION_ENUM } from '@game/common/enums/EnemyDirectionEnum';

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
