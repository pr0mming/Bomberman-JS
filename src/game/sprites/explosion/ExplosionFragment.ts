import { Animations, Physics, Scene } from 'phaser';

interface IExplosionFragmentProps {
  scene: Scene;
  x: number;
  y: number;
  textureKey: string;
}

export class ExplosionFragment extends Physics.Arcade.Sprite {
  constructor({ scene, x, y, textureKey }: IExplosionFragmentProps) {
    super(scene, x, y, textureKey);

    this.setScale(1.6);

    this.play(textureKey).once(Animations.Events.ANIMATION_COMPLETE, () => {
      this.destroy(true);
    });
  }
}
