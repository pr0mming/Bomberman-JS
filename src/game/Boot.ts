import { Scene } from 'phaser';

/**
 * First scene to load
 */
export class Boot extends Scene {
  constructor() {
    super('Boot');
  }

  create() {
    this.scene.start('Preloader');
  }
}
