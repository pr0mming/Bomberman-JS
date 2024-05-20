import { ENEMY_DIRECTION_ENUM } from '@src/game/common/enums/EnemyDirectionEnum';
import { ENEMY_ENUM } from '@src/game/common/enums/EnemyEnum';
import { IEnemy } from '@src/game/common/interfaces/IEnemy';
import { Physics, Scene } from 'phaser';

interface IEnemyProps {
  scene: Scene;
  x: number;
  y: number;
  type: ENEMY_ENUM;
  enemy: IEnemy;
}

export class Enemy extends Physics.Arcade.Sprite {
  private _direction: ENEMY_DIRECTION_ENUM;
  private _type: ENEMY_ENUM;
  private _enemy: IEnemy;

  constructor({ scene, x, y, type, enemy }: IEnemyProps) {
    super(scene, x, y, enemy.textureKey);

    //scene.add.existing(this);
    scene.physics.add.existing(this);

    this._type = type;
    this._direction = ENEMY_DIRECTION_ENUM.LEFT;
    this._enemy = enemy;

    this.setVelocity(enemy.velocity);
    this.setScale(2.0);
    //this.setOrigin(0.5, 0.5);
    this.setSize(this.width - 2, this.height - 2);

    this.setData('animLeftKey', `${this._type}-left`);
    this.setData('animRightKey', `${this._type}-right`);
    this.setData('hasWallPassPowerUp', enemy.hasWallPassPowerUp);
    this.setData('enemyType', this._type);

    this._setUpDirection();
    this._setUpMotion();
  }

  private _setUpMotion() {
    switch (this._direction) {
      case ENEMY_DIRECTION_ENUM.LEFT:
        this.play(this.getData('animLeftKey'));
        this.setVelocityX(-this._enemy.velocity);
        break;

      case ENEMY_DIRECTION_ENUM.DOWN:
        this.play(this.getData('animLeftKey'));
        this.setVelocityX(this._enemy.velocity);
        break;

      case ENEMY_DIRECTION_ENUM.RIGH:
        this.play(this.getData('animRightKey'));
        this.setVelocityX(this._enemy.velocity);
        break;

      case ENEMY_DIRECTION_ENUM.UP:
        this.play(this.getData('animRightKey'));
        this.setVelocityX(-this._enemy.velocity);
        break;

      default:
        break;
    }
  }

  private _setUpDirection() {
    const direction = [
      ENEMY_DIRECTION_ENUM.LEFT,
      ENEMY_DIRECTION_ENUM.RIGH,
      ENEMY_DIRECTION_ENUM.UP,
      ENEMY_DIRECTION_ENUM.DOWN
    ];

    const index = Phaser.Math.RND.between(0, direction.length - 1);

    this._direction = direction[index];
  }
}
