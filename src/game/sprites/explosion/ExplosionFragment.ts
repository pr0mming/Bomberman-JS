import { Animations, Physics, Scene } from 'phaser';

interface IExplosionFragmentProps {
  scene: Scene;
  x: number;
  y: number;
  textureKey: string;
  isVisible: boolean;
}

export class ExplosionFragment extends Physics.Arcade.Sprite {
  constructor({ scene, x, y, textureKey, isVisible }: IExplosionFragmentProps) {
    super(scene, x, y, textureKey);

    scene.physics.add.existing(this);

    this.setScale(2.4);
    this.setVisible(isVisible);

    this.setImmovable(true);

    // Important: This line reduces a bit the physics body to make a bit bigger the explosion effect
    this.setBodySize(this.width - 5, this.height - 5);

    this.play(textureKey).once(Animations.Events.ANIMATION_COMPLETE, () => {
      this.destroy(true);
    });
  }
}
