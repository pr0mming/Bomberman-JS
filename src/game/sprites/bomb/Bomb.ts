import { Physics, Scene } from 'phaser';

interface IBombProps {
  scene: Scene;
  x: number;
  y: number;
}

export class Bomb extends Physics.Arcade.Sprite {
  constructor({ scene, x, y }: IBombProps) {
    super(scene, x, y, 'bomb');

    this.setScale(1.8);
    this._setUpAnimations();

    this.play('wait');
  }

  private _setUpAnimations() {
    this.anims.create({
      key: 'wait',
      frames: this.anims.generateFrameNumbers('bomb'),
      frameRate: 3,
      repeat: -1
    });
  }
}
