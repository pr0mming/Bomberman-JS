import { Physics, Scene } from 'phaser';

// Sprites
import { Enemy } from '@game/sprites/enemy/Enemy';
import { Player } from '@game/sprites/player/Player';

// Helpers
import getStagesData from '@game/common/helpers/getStagesData';
import getEnemyData from '@game/common/helpers/getEnemyData';

// Interfaces
import { IEnemy } from '@game/common/interfaces/IEnemy';
import { IEnemyLevel } from '@game/common/interfaces/IEnemyLevel';
import { IEnemySaved } from '@game/common/interfaces/IEnemySaved';
import { IMapPosition } from '@game/common/interfaces/IMapPosition';
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';
import { IGameSaved } from '@game/common/interfaces/IGameSaved';

// Managers
import { WallBuilderManager } from '@game/managers/WallBuilderManager';

// Enums
import { ENEMY_ENUM } from '@game/common/enums/EnemyEnum';
import { GAME_STAGE_ENUM } from '@game/common/enums/GameStageEnum';
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';

interface IEnemyGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  wallBuilderManager: WallBuilderManager;
  player: Player;
  gameStage: IGameInitialStage;
  savedGame: IGameSaved | null;
}

/**
 * This class orchestrate all related to enemies
 */
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

    // Initial data: enemies per stage
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

  /**
   * This method created the enemies from a saved game or from the stage to play
   */
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
      // Get properties like textureKey, velocity, reward points, etc.
      const enemyData = this._getEnemyDataByKey(enemyInput.type);

      // Create animations only once!
      this._createAnimationByEnemy(enemyData);

      // Put enemy by enemy ...
      for (let i = 0; i < enemyInput.quantity; i++) {
        const { element } = this._wallBuilderManager.pickSafeRndFreePosition();

        // Normally the enemies of the stage don't have shield
        this._createNewEnemy(element, enemyData, false);
      }
    }
  }

  /**
   * This method is only used for a saved game and is pretty similar to _createEnemies but with slight variations
   * @param enemies array fo enemies to create
   */
  private _createEnemiesFromData(enemies: IEnemySaved[]) {
    for (const enemyInput of enemies) {
      const enemyData = this._getEnemyDataByKey(enemyInput.enemyData.type);

      this._createAnimationByEnemy(enemyData);

      const { x, y } = enemyInput;

      this._createNewEnemy({ x, y }, enemyData, false);
    }
  }

  /**
   * This method created aditional animations: the pink coin can appear at any stage (when the time is run out)
   */
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

  /**
   * This method creates the animation for a type of enemy with a slight variation
   * @param enemy data of enemy type
   */
  private _createAnimationByEnemy(enemy: IEnemy) {
    const { type } = enemy;

    // If you see the sprites, the PONTAN (pink coin) enemy has more frames to show, this validation controls that ...
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

    // Set up type of motion
    newEnemy.setMotionManager(enemyData.motionEnemyType);
    // Move the enemy
    newEnemy.dispatchMotion();
  }

  /**
   * This method is used to place the pink coin
   * @returns set of positions
   */
  private _getEnemiesPosition(): IMapPosition[] {
    const positions: IMapPosition[] = [];

    if (this.getTotalUsed() > 0) {
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

    // In case there aren't any enemies alive but time is run out ...

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

  /**
   * This method is used to place enemies when a explosion collides with the door
   * @param x position in axis X
   * @param y position in axis Y
   */
  addRandomByPosition(x: number, y: number) {
    const enemiesNumber = Phaser.Math.RND.between(3, 6);
    const enemyType = this._enemyLevel[this._enemyLevel.length - 1];
    const enemyData = this._getEnemyDataByKey(enemyType.type);

    for (let i = 0; i < enemiesNumber; i++) {
      this._createNewEnemy({ x, y }, enemyData, true);
    }
  }

  /**
   * This method will put more enemies when the time is run out
   * @param type normally should be PONTAN type
   */
  replaceAllByType(type: ENEMY_ENUM) {
    const enemyData = this._getEnemyDataByKey(type);

    // Destroy all enemies!
    this.clear(true, true);

    const enemyPositions = this._getEnemiesPosition();

    for (const enemyPos of enemyPositions) {
      this._createNewEnemy(enemyPos, enemyData, false);
    }
  }

  /**
   * This method returns the data for a saved game
   * @returns data with enemies
   */
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
