import { Physics, Scene } from 'phaser';

// Sprites
import { Wall } from '@game/sprites/wall/Wall';

interface IWallGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
}

export class WallGroup extends Physics.Arcade.StaticGroup {
  constructor({ world, scene }: IWallGroupProps) {
    super(world, scene);

    this.classType = Wall;

    this._setUpAnimations();
  }

  private _setUpAnimations() {
    if (!this.scene.anims.exists('wall-explosion'))
      this.scene.anims.create({
        key: 'wall-explosion',
        frames: this.scene.anims.generateFrameNumbers('wall-explosion'),
        frameRate: 12
      });
  }
}
