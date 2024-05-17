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
    super(scene, x, y, 'bomb');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this._type = type;
    this._direction = ENEMY_DIRECTION_ENUM.LEFT;
    this._enemy = enemy;

    this.setVelocity(enemy.velocity);
    this.setScale(2.0);
    this.setOrigin(0.5, 0.5);
    this.setSize(this.width - 2, this.height - 2);
    this.setData('hasWallPassPowerUp', enemy.hasWallPassPowerUp);
    this.setData('enemyType', this._type);

    this._createAnimations();
    this._setUpDirection();
    this._setUpMotion();
  }

  private _createAnimations() {
    const framesLeft =
      this._type === ENEMY_ENUM.PONTAN ? [0, 1, 2, 3, 4] : [0, 1, 2];
    const framesRight =
      this._type === ENEMY_ENUM.PONTAN ? [7, 8, 9, 10, 11] : [0, 1, 2];
    const framesDead = this._type === ENEMY_ENUM.PONTAN ? [5, 6] : [3];

    this.scene.anims.create({
      key: 'left',
      frames: this.scene.anims.generateFrameNumbers(this._enemy.textureKey, {
        frames: framesLeft
      }),
      frameRate: 6,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'right',
      frames: this.scene.anims.generateFrameNumbers(this._enemy.textureKey, {
        frames: framesRight
      }),
      frameRate: 6,
      repeat: -1
    });

    this.scene.anims.create({
      key: 'dead',
      frames: this.scene.anims.generateFrameNumbers(this._enemy.textureKey, {
        frames: framesDead
      }),
      frameRate: 6
    });
  }

  private _setUpMotion() {
    switch (this._direction) {
      case ENEMY_DIRECTION_ENUM.LEFT:
        this.anims.play('left');
        this.setVelocityX(-this._enemy.velocity);
        break;

      case ENEMY_DIRECTION_ENUM.DOWN:
        this.anims.play('left');
        this.setVelocityX(this._enemy.velocity);
        break;

      case ENEMY_DIRECTION_ENUM.RIGH:
        this.anims.play('right');
        this.setVelocityX(this._enemy.velocity);
        break;

      case ENEMY_DIRECTION_ENUM.UP:
        this.anims.play('right');
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

    const index = Math.floor(Math.random() * direction.length);

    this._direction = direction[index];
  }
}
