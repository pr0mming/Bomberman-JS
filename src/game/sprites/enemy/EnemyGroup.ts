import { Physics, Scene } from 'phaser';
import { Enemy } from '@src/game/sprites/enemy/Enemy';
import { Player } from '@src/game/sprites/player/Player';

import getStagesData from '@src/game/common/helpers/getStagesData';
import getEnemyData from '@src/game/common/helpers/getEnemyData';

import { IEnemy } from '@src/game/common/interfaces/IEnemy';
import { IEnemyLevel } from '@src/game/common/interfaces/IEnemyLevel';
import { IMapPosition } from '@src/game/common/interfaces/IMapPosition';

import { WallBuilderManager } from '@src/game/managers/WallBuilderManager';

import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';
import { GAME_STAGE_ENUM } from '@src/game/common/enums/GameStageEnum';
import { IEnemySaved } from '@src/game/common/interfaces/IEnemySaved';
import { IGameSaved } from '@src/game/common/interfaces/IGameSaved';
import { IGameInitialStage } from '@src/game/common/interfaces/IGameInitialStage';
import { GAME_STATUS_ENUM } from '@src/game/common/enums/GameStatusEnum';

interface IEnemyGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  wallBuilderManager: WallBuilderManager;
  player: Player;
  gameStage: IGameInitialStage;
  savedGame: IGameSaved | null;
}

export class EnemyGroup extends Physics.Arcade.Group {
  private _enemyLevel: IEnemyLevel[];
  private _wallBuilderManager: WallBuilderManager;
  private _player: Player;

  private _savedGame: IGameSaved | null;
  private _gameStage: IGameInitialStage;

  constructor({
    world,
    scene,
    wallBuilderManager,
    player,
    savedGame,
    gameStage
  }: IEnemyGroupProps) {
    super(world, scene);

    this._enemyLevel = this._getEnemyLevelByKey(gameStage.stage);

    this._wallBuilderManager = wallBuilderManager;
    this._player = player;

    this._gameStage = gameStage;
    this._savedGame = savedGame;

    this.classType = Enemy;

    this._setUp();
  }

  private _getEnemyLevelByKey(key: GAME_STAGE_ENUM) {
    const stages = getStagesData();
    const stage = stages.find((item) => item.stage === key);

    if (stage === undefined) {
      return stages[0].enemies;
    }

    return stage.enemies;
  }

  private _getEnemyDataByKey(key: ENEMY_ENUM) {
    const enemies = getEnemyData();
    const enemyData = enemies.find((item) => item.type === key);

    if (enemyData === undefined) {
      return enemies[0];
    }

    return enemyData;
  }

  private _setUp() {
    if (
      this._gameStage.status === GAME_STATUS_ENUM.LOADED_GAME &&
      this._savedGame
    ) {
      this._createEnemiesFromData(this._savedGame.enemies);
    } else {
      this._createEnemies();
    }

    this._setUpAnimations();
  }

  private _createEnemies() {
    for (const enemyInput of this._enemyLevel) {
      const enemyData = this._getEnemyDataByKey(enemyInput.type);

      this._createAnimationByEnemy(enemyData);

      for (let i = 0; i < enemyInput.quantity; i++) {
        const { element } = this._wallBuilderManager.pickSafeRndFreePosition();

        this._createNewEnemy(element, enemyData, false);
      }
    }
  }

  private _createEnemiesFromData(enemies: IEnemySaved[]) {
    for (const enemyInput of enemies) {
      const enemyData = this._getEnemyDataByKey(enemyInput.enemyData.type);

      this._createAnimationByEnemy(enemyData);

      const { x, y } = enemyInput;

      this._createNewEnemy({ x, y }, enemyData, false);
    }
  }

  private _setUpAnimations() {
    if (
      this._enemyLevel.find((item) => item.type === ENEMY_ENUM.PONTAN) ===
      undefined
    ) {
      const enemyData = this._getEnemyDataByKey(ENEMY_ENUM.PONTAN);

      this._createAnimationByEnemy(enemyData);
    }

    if (!this.scene.anims.exists('destroy-enemy'))
      this.scene.anims.create({
        key: 'destroy-enemy',
        frames: this.scene.anims.generateFrameNumbers('destroy-enemy'),
        frameRate: 3,
        delay: 2000
      });
  }

  private _createAnimationByEnemy(enemy: IEnemy) {
    const { type } = enemy;

    const framesLeft = type === ENEMY_ENUM.PONTAN ? [0, 1, 2, 3, 4] : [0, 1, 2];
    const framesRight =
      type === ENEMY_ENUM.PONTAN ? [7, 8, 9, 10, 11] : [4, 5, 6];
    const framesDead =
      type === ENEMY_ENUM.PONTAN ? [Phaser.Math.RND.between(5, 6)] : [3];

    if (!this.scene.anims.exists(`${type}-left`))
      this.scene.anims.create({
        key: `${type}-left`,
        frames: this.scene.anims.generateFrameNumbers(enemy.textureKey, {
          frames: framesLeft
        }),
        frameRate: 6,
        repeat: -1
      });

    if (!this.scene.anims.exists(`${type}-right`))
      this.scene.anims.create({
        key: `${type}-right`,
        frames: this.scene.anims.generateFrameNumbers(enemy.textureKey, {
          frames: framesRight
        }),
        frameRate: 6,
        repeat: -1
      });

    if (!this.scene.anims.exists(`${type}-dead`))
      this.scene.anims.create({
        key: `${type}-dead`,
        frames: this.scene.anims.generateFrameNumbers(enemy.textureKey, {
          frames: framesDead
        }),
        frameRate: 6
      });
  }

  private _createNewEnemy(
    position: IMapPosition,
    enemyData: IEnemy,
    hasTemporalShield: boolean
  ) {
    const newEnemy = new Enemy({
      scene: this.scene,
      x: position.x,
      y: position.y,
      enemyData,
      hasTemporalShield,
      player: this._player
    });

    this.add(newEnemy, true);

    newEnemy.setMotionManager(enemyData.motionEnemyType);
    newEnemy.dispatchMotion();
  }

  private _getEnemiesPosition(): IMapPosition[] {
    const positions: IMapPosition[] = [];

    if (this.getLength() > 0) {
      this.getChildren().forEach((enemy) => {
        const _enemy = enemy as Enemy;

        _enemy.setImmovable(true);

        positions.push({
          x: Math.floor(_enemy.body?.center.x ?? 0),
          y: Math.floor(_enemy.body?.center.y ?? 0)
        });
      });

      return positions;
    }

    const enemiesToAdd = 7;

    for (let i = 0; i < enemiesToAdd; i++) {
      const { element } = this._wallBuilderManager.pickSafeRndFreePosition();

      positions.push({
        x: element.x,
        y: element.y
      });
    }

    return positions;
  }

  addRandomByPosition(x: number, y: number) {
    const enemiesNumber = Phaser.Math.RND.between(3, 6);
    const enemyType = this._enemyLevel[this._enemyLevel.length - 1];
    const enemyData = this._getEnemyDataByKey(enemyType.type);

    for (let i = 0; i < enemiesNumber; i++) {
      this._createNewEnemy({ x, y }, enemyData, true);
    }
  }

  replaceAllByType(type: ENEMY_ENUM) {
    const enemyData = this._getEnemyDataByKey(type);

    this.clear(true, true);

    const enemyPositions = this._getEnemiesPosition();

    for (const enemyPos of enemyPositions) {
      this._createNewEnemy(enemyPos, enemyData, false);
    }
  }

  getSavedState(): IEnemySaved[] {
    return this.getChildren().map((enemy) => {
      const _enemy = enemy as Enemy;

      return {
        x: Math.round(_enemy.body?.center.x ?? 0),
        y: Math.round(_enemy.body?.center.y ?? 0),
        enemyData: _enemy.enemyData
      };
    });
  }
}
