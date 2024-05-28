import { Physics, Scene } from 'phaser';
import { ExplosionFragment } from './ExplosionFragment';
import { IExplosionFragment } from '@src/game/common/interfaces/IExplosionFragment';
import getExplosionData from '@src/game/common/helpers/getExplosionData';

interface IExplosionGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
}

export class ExplosionGroup extends Physics.Arcade.StaticGroup {
  private _explosionLength: number;
  private _explosionProperties: IExplosionFragment[];

  constructor({ world, scene }: IExplosionGroupProps) {
    super(world, scene);

    this.classType = ExplosionFragment;

    this._explosionLength = 0;
    this._explosionProperties = getExplosionData();

    this._setUpAnimations();
  }

  private _setUpAnimations() {
    for (const explosionAnim of this._explosionProperties) {
      this.scene.anims.create({
        key: explosionAnim.textureKey,
        frames: this.scene.anims.generateFrameNumbers(explosionAnim.textureKey),
        frameRate: 6
      });
    }

    let explosionExtensions = new Set(
      this._explosionProperties
        .filter((item) => item.textureKeyExtension !== undefined)
        .map((item) => item.textureKeyExtension ?? '')
    );

    for (const explosionAnim of explosionExtensions) {
      this.scene.anims.create({
        key: explosionAnim,
        frames: this.scene.anims.generateFrameNumbers(explosionAnim),
        frameRate: 6
      });
    }
  }

  addNewExplosion(bombX: number, bombY: number) {
    for (const explosionProperty of this._explosionProperties) {
      let x = bombX + explosionProperty.x;
      let y = bombY + explosionProperty.y;

      if (explosionProperty.textureKeyExtension) {
        for (let i = 0; i < this._explosionLength; i++) {
          const explosion_extension = new ExplosionFragment({
            scene: this.scene,
            x,
            y,
            textureKey: explosionProperty.textureKeyExtension
          });

          x += explosionProperty.x;
          y += explosionProperty.y;

          this.add(explosion_extension, true);
        }
      }

      const explosion_fragment = new ExplosionFragment({
        scene: this.scene,
        x,
        y,
        textureKey: explosionProperty.textureKey
      });

      this.add(explosion_fragment, true);
    }

    this.scene.sound.play('explosion');
  }

  public get explosionLength() {
    return this._explosionLength;
  }

  public set explosionLength(v: number) {
    this._explosionLength = v;
  }
}
