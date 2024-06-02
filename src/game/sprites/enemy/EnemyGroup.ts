import { Physics, Scene } from 'phaser';
import { Enemy } from '@src/game/sprites/enemy/Enemy';
import { Player } from '@src/game/sprites/player/Player';

import getEnemyLevels from '@src/game/common/helpers/getEnemyLevels';
import getEnemyData from '@src/game/common/helpers/getEnemyData';

import { IEnemy } from '@src/game/common/interfaces/IEnemy';
import { IEnemyLevel } from '@src/game/common/interfaces/IEnemyLevel';

import { WallBuilderManager } from '@src/game/managers/WallBuilderManager';

import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';
import { GAME_STAGE_ENUM } from '@src/game/common/enums/GameStageEnum';

interface IEnemyGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  stage: GAME_STAGE_ENUM;
  wallBuilderManager: WallBuilderManager;
  player: Player;
}

export class EnemyGroup extends Physics.Arcade.Group {
  private _enemyLevel: IEnemyLevel[];
  private _wallBuilderManager: WallBuilderManager;
  private _player: Player;

  constructor({
    world,
    scene,
    stage,
    wallBuilderManager,
    player
  }: IEnemyGroupProps) {
    super(world, scene);

    this._enemyLevel = this._getEnemyLevelByKey(stage);

    this._wallBuilderManager = wallBuilderManager;
    this._player = player;

    this.classType = Enemy;

    this._setUp();
  }

  private _getEnemyLevelByKey(key: GAME_STAGE_ENUM) {
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
    for (const enemyInput of this._enemyLevel) {
      const enemyData = this._getEnemyDataByKey(enemyInput.type);

      this._createAnimations(enemyInput.type, enemyData);

      for (let i = 0; i < enemyInput.quantity; i++) {
        const { element } = this._wallBuilderManager.pickSafeRndFreePosition();

        const newEnemy = new Enemy({
          scene: this.scene,
          x: element.x,
          y: element.y,
          type: enemyInput.type,
          enemyData,
          player: this._player
        });

        this.add(newEnemy, true);

        newEnemy.setMotionManager(enemyData.motionEnemyType);
        newEnemy.dispatchMotion();
      }
    }

    if (
      this._enemyLevel.find((item) => item.type === ENEMY_ENUM.PONTAN) ===
      undefined
    ) {
      const enemyData = this._getEnemyDataByKey(ENEMY_ENUM.PONTAN);

      this._createAnimations(ENEMY_ENUM.PONTAN, enemyData);
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

  addRandomByPosition(x: number, y: number) {
    const enemiesNumber = Phaser.Math.RND.between(3, 6);
    const enemyType = this._enemyLevel[this._enemyLevel.length - 1];
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

  replaceAllByType(type: ENEMY_ENUM) {
    const enemyData = this._getEnemyDataByKey(type);
    const enemyPositions = this.getChildren().map((enemy) => {
      const _enemy = enemy as Enemy;

      return {
        x: Math.floor(_enemy.body?.center.x ?? 0),
        y: Math.floor(_enemy.body?.center.y ?? 0)
      };
    });

    this.clear(true);

    for (const enemyPos of enemyPositions) {
      const newEnemy = new Enemy({
        scene: this.scene,
        x: enemyPos.x,
        y: enemyPos.y,
        type: type,
        enemyData,
        player: this._player
      });

      this.add(newEnemy, true);

      newEnemy.setMotionManager(enemyData.motionEnemyType);
      newEnemy.dispatchMotion();
    }
  }
}
