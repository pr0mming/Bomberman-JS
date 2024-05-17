import { Physics, Scene, Types } from 'phaser';
import { Enemy } from '@src/game/sprites/enemy/Enemy';
import { LEVEL_ENUM } from '@src/game/common/enums/LevelEnum';
import getEnemyLevels from '@src/game/common/helpers/getEnemyLevels';
import getEnemies from '@src/game/common/helpers/getEnemies';
import { IEnemy } from '@src/game/common/interfaces/IEnemy';
import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';
import { IMapPosition } from '@src/game/common/interfaces/IMapPosition';
import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';

interface IEnemyGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  level: LEVEL_ENUM;
  positions: IMapPosition[];
}

export class EnemyGroup extends Physics.Arcade.Group {
  private _level: LEVEL_ENUM;
  private _positions: IMapPosition[];
  private _directions: ENEMY_DIRECTION_ENUM[];

  constructor({ world, scene, level, positions }: IEnemyGroupProps) {
    super(world, scene, {});

    this._level = level;
    this._positions = positions;
    this._directions = [
      ENEMY_DIRECTION_ENUM.LEFT,
      ENEMY_DIRECTION_ENUM.RIGH,
      ENEMY_DIRECTION_ENUM.UP,
      ENEMY_DIRECTION_ENUM.DOWN
    ];

    this.classType = Enemy;

    this._setUp();
  }

  private _setUp() {
    const enemyLevels = getEnemyLevels();

    let enemyLevel = enemyLevels.get(this._level);

    if (enemyLevel === undefined) {
      enemyLevel = Array.from(enemyLevels.values())[0];
    }

    const enemies = getEnemies();

    for (const enemyInput of enemyLevel) {
      let enemy = enemies.get(enemyInput.type);

      if (enemy === undefined) {
        enemy = Array.from(enemies.values())[0];
      }

      for (let i = 0; i < enemyInput.quantity; i++) {
        const index = Math.floor(Math.random() * this._positions.length);
        const chosenPos = this._positions[index];

        const newEnemy = new Enemy({
          scene: this.scene,
          x: chosenPos.x,
          y: chosenPos.y,
          type: enemyInput.type,
          enemy
        });

        this.add(newEnemy);
      }
    }

    this.scene.anims.create({
      key: 'destroy-enemy',
      frames: this.scene.anims.generateFrameNumbers('destroy-enemy'),
      frameRate: 2
    });
  }

  private _executeRandomDecision(enemy: Physics.Arcade.Sprite) {
    const index = Math.floor(Math.random() * this._directions.length);

    const directionToTake = this._directions[index];

    switch (directionToTake) {
      case ENEMY_DIRECTION_ENUM.LEFT:
      case ENEMY_DIRECTION_ENUM.DOWN:
        enemy.anims.play('left');
        break;

      case ENEMY_DIRECTION_ENUM.RIGH:
      case ENEMY_DIRECTION_ENUM.UP:
        enemy.anims.play('right');
        break;

      default:
        break;
    }
  }

  addAutonomyListener() {
    // this.getChildren().forEach((enemy) => {
    //   const _enemy = enemy as Physics.Arcade.Sprite;
    //   const hasOverlap = overlapCallback()
    // });
  }
}
