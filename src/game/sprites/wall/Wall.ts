import { Animations, Physics, Scene } from 'phaser';

interface IWallProps {
  scene: Scene;
  x: number;
  y: number;
}

export class Wall extends Physics.Arcade.Sprite {
  constructor({ scene, x, y }: IWallProps) {
    super(scene, x, y, 'wall', 0);

    //this.setOrigin(0.5, -0.5);

    this.setScale(2.5);
    //this.setSize(this.width - 5, this.height - 2);
    // _element.setOrigin(0.5, -0.5);
  }

  kill() {
    this.play('destroy-wall');
    this.once(Animations.Events.ANIMATION_COMPLETE_KEY, () => {
      this.destroy(true);
    });
  }
}
