import { Physics, Scene } from 'phaser';

interface IBombProps {
  scene: Scene;
  x: number;
  y: number;
}

export class Bomb extends Physics.Arcade.Sprite {
  constructor({ scene, x, y }: IBombProps) {
    super(scene, x, y, 'bomb');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1.8);
    this.setSize(this.width - 4, this.height - 4);

    this._setUpAnimations();

    this.anims.play('wait');
  }

  // Prepare all the animations for the player
  private _setUpAnimations() {
    this.anims.create({
      key: 'wait',
      frames: this.anims.generateFrameNumbers('bomb'),
      frameRate: 3,
      repeat: -1
    });
  }
}
