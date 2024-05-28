import { Physics, Scene } from 'phaser';
import { Enemy } from '@src/game/sprites/enemy/Enemy';
import { Player } from '@src/game/sprites/player/Player';

import getEnemyLevels from '@src/game/common/helpers/getEnemyLevels';
import getEnemyData from '@src/game/common/helpers/getEnemyData';

import { IMapPosition } from '@src/game/common/interfaces/IMapPosition';
import { IEnemy } from '@src/game/common/interfaces/IEnemy';
import { ILevel } from '@src/game/common/interfaces/ILevel';

import { LEVEL_ENUM } from '@src/game/common/enums/LevelEnum';
import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';

interface IEnemyGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  level: LEVEL_ENUM;
  freePositions: IMapPosition[];
  player: Player;
}

export class EnemyGroup extends Physics.Arcade.Group {
  private enemyLevel: ILevel[];
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

    this.enemyLevel = this._getEnemyLevelByKey(level);

    this._freePositions = freePositions;
    this._player = player;

    this.classType = Enemy;

    this._setUp();
  }

  private _getEnemyLevelByKey(key: LEVEL_ENUM) {
    const enemyLevels = getEnemyLevels();
    const enemyLevel = enemyLevels.get(key);

    if (enemyLevel === undefined) {
      return Array.from(enemyLevels.values())[0];
    }

    return enemyLevel;
  }

  private _getEnemyDataByKey(key: ENEMY_ENUM) {
    const enemies = getEnemyData();
    const enemyData = enemies.get(key);

    if (enemyData === undefined) {
      return Array.from(enemies.values())[0];
    }

    return enemyData;
  }

  private _setUp() {
    for (const enemyInput of this.enemyLevel) {
      const enemyData = this._getEnemyDataByKey(enemyInput.type);

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

        newEnemy.setMotionManager(enemyData.motionEnemyType);
        newEnemy.dispatchMotion();
      }
    }

    this.scene.anims.create({
      key: 'destroy-enemy',
      frames: this.scene.anims.generateFrameNumbers('destroy-enemy'),
      frameRate: 3,
      delay: 2000
    });
  }

  private _createAnimations(type: ENEMY_ENUM, enemy: IEnemy) {
    const framesLeft = type === ENEMY_ENUM.PONTAN ? [0, 1, 2, 3, 4] : [0, 1, 2];
    const framesRight =
      type === ENEMY_ENUM.PONTAN ? [7, 8, 9, 10, 11] : [4, 5, 6];
    const framesDead =
      type === ENEMY_ENUM.PONTAN ? [Phaser.Math.RND.between(5, 6)] : [3];

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

  addRndEnemiesByPosition(x: number, y: number) {
    const enemiesNumber = Phaser.Math.RND.between(3, 6);
    const enemyType = this.enemyLevel[this.enemyLevel.length - 1];
    const enemyData = this._getEnemyDataByKey(enemyType.type);

    for (let i = 0; i < enemiesNumber; i++) {
      const newEnemy = new Enemy({
        scene: this.scene,
        x,
        y,
        type: enemyType.type,
        enemyData,
        player: this._player
      });

      this.add(newEnemy, true);

      newEnemy.setMotionManager(enemyData.motionEnemyType);
      newEnemy.dispatchMotion();
    }
  }
}
