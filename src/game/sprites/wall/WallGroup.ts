import { Physics, Scene } from 'phaser';
import { Wall } from './Wall';

interface IWallGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
}

export class WallGroup extends Physics.Arcade.Group {
  constructor({ world, scene }: IWallGroupProps) {
    super(
      world,
      scene,
      {},
      {
        immovable: true
      }
    );

    this.classType = Wall;

    this._setUpAnimations();
  }

  private _setUpAnimations() {
    this.scene.anims.create({
      key: 'destroy-wall',
      frames: this.scene.anims.generateFrameNumbers('wall', {
        frames: [1, 2, 3, 4, 5, 6]
      }),
      frameRate: 10
    });
  }
}
