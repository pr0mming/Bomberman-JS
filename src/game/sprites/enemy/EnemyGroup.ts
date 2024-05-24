import { Physics, Scene } from 'phaser';
import { Enemy } from '@src/game/sprites/enemy/Enemy';

import { LEVEL_ENUM } from '@src/game/common/enums/LevelEnum';
import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';

import { IMapPosition } from '@src/game/common/interfaces/IMapPosition';
import { IEnemy } from '@src/game/common/interfaces/IEnemy';

import getEnemyLevels from '@src/game/common/helpers/getEnemyLevels';
import getEnemies from '@src/game/common/helpers/getEnemies';

import { Player } from '@src/game/sprites/player/Player';
import { ENEMY_MOTION_ENUM } from '@src/game/common/enums/EnemyMotionEnum';

interface IEnemyGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  level: LEVEL_ENUM;
  freePositions: IMapPosition[];
  player: Player;
}

export class EnemyGroup extends Physics.Arcade.Group {
  private _level: LEVEL_ENUM;
  private _freePositions: IMapPosition[];
  private _player: Player;

  constructor({
    world,
    scene,
    level,
    freePositions,
    player
  }: IEnemyGroupProps) {
    super(world, scene);

    this._level = level;
    this._freePositions = freePositions;
    this._player = player;

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
      let enemyData = enemies.get(enemyInput.type);

      if (enemyData === undefined) {
        enemyData = Array.from(enemies.values())[0];
      }

      this._createAnimations(enemyInput.type, enemyData);

      for (let i = 0; i < enemyInput.quantity; i++) {
        const index = Phaser.Math.RND.between(
          0,
          this._freePositions.length - 1
        );
        const chosenPos = this._freePositions[index];

        const newEnemy = new Enemy({
          scene: this.scene,
          x: chosenPos.x,
          y: chosenPos.y,
          type: enemyInput.type,
          enemyData,
          player: this._player
        });

        this.add(newEnemy, true);

        newEnemy.setMotionManager(ENEMY_MOTION_ENUM.FIRST_LEVEL);
        newEnemy.dispatchMotion();
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
      type === ENEMY_ENUM.PONTAN ? [7, 8, 9, 10, 11] : [4, 5, 6];
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
}
