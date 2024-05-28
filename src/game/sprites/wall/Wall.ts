import { Animations, Physics, Scene } from 'phaser';

interface IWallProps {
  scene: Scene;
  x: number;
  y: number;
}

export class Wall extends Physics.Arcade.Sprite {
  constructor({ scene, x, y }: IWallProps) {
    super(scene, x, y, 'wall', 0);

    this.setScale(2.5);
  }

  kill() {
    if (this.body?.enable) {
      this.disableBody(false);

      this.play('wall-explosion').once(
        Animations.Events.ANIMATION_COMPLETE,
        () => {
          this.destroy(true);
        }
      );
    }
  }
}
