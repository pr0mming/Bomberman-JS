import { Physics, Scene } from 'phaser';
import { Enemy } from '@src/game/sprites/enemy/Enemy';
import { LEVEL_ENUM } from '@src/game/common/enums/LevelEnum';
import getEnemyLevels from '@src/game/common/helpers/getEnemyLevels';
import getEnemies from '@src/game/common/helpers/getEnemies';
import { IMapPosition } from '@src/game/common/interfaces/IMapPosition';
import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';
import { IEnemy } from '@src/game/common/interfaces/IEnemy';
import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';

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
    super(world, scene);

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

      this._createAnimations(enemyInput.type, enemy);

      for (let i = 0; i < enemyInput.quantity; i++) {
        const index = Phaser.Math.RND.between(0, this._positions.length - 1);
        const chosenPos = this._positions[index];

        const newEnemy = new Enemy({
          scene: this.scene,
          x: chosenPos.x,
          y: chosenPos.y,
          type: enemyInput.type,
          enemy
        });

        this.add(newEnemy, true);
      }
    }

    this.scene.anims.create({
      key: 'destroy-enemy',
      frames: this.scene.anims.generateFrameNumbers('destroy-enemy'),
      frameRate: 2
    });
  }

  private _createAnimations(type: ENEMY_ENUM, enemy: IEnemy) {
    const framesLeft = type === ENEMY_ENUM.PONTAN ? [0, 1, 2, 3, 4] : [0, 1, 2];
    const framesRight =
      type === ENEMY_ENUM.PONTAN ? [7, 8, 9, 10, 11] : [0, 1, 2];
    const framesDead = type === ENEMY_ENUM.PONTAN ? [5, 6] : [3];

    this.scene.anims.create({
      key: `${type}-left`,
      frames: this.scene.anims.generateFrameNumbers(enemy.textureKey, {
        frames: framesLeft
      }),
      frameRate: 6,
      repeat: -1
    });

    this.scene.anims.create({
      key: `${type}-right`,
      frames: this.scene.anims.generateFrameNumbers(enemy.textureKey, {
        frames: framesRight
      }),
      frameRate: 6,
      repeat: -1
    });

    this.scene.anims.create({
      key: `${type}-dead`,
      frames: this.scene.anims.generateFrameNumbers(enemy.textureKey, {
        frames: framesDead
      }),
      frameRate: 6
    });
  }

  executeRandomDecision(enemy: Physics.Arcade.Sprite) {
    const index = Phaser.Math.RND.between(0, this._directions.length - 1);

    const directionToTake = this._directions[index];

    switch (directionToTake) {
      case ENEMY_DIRECTION_ENUM.LEFT:
      case ENEMY_DIRECTION_ENUM.DOWN:
        enemy.play(enemy.getData('animLeftKey'));
        break;

      case ENEMY_DIRECTION_ENUM.RIGH:
      case ENEMY_DIRECTION_ENUM.UP:
        enemy.play(enemy.getData('animRightKey'));
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
