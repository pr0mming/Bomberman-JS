import { Scene } from 'phaser';

/**
 * The Preloader of the game, I put here all the required assets to use in the next scenes
 */
export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Load map of tiles
    this.load.tilemapTiledJSON('world', '/game/map/playing-environment.json');

    // Load spritesheets and other assets
    this.load.image('playing-environment', '/game/map/environment.png');
    this.load.image('door', '/game/images/door.png');
    this.load.image('power-1', '/game/images/powers/power1.png');
    this.load.image('power-2', '/game/images/powers/power2.png');
    this.load.image('power-3', '/game/images/powers/power3.png');
    this.load.image('menu-title', '/game/images/menu-title.png');

    this.load.spritesheet(
      'bomberman-move',
      '/game/sprites/character/bomberman-move.png',
      {
        frameWidth: 16,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'bomberman-dead',
      '/game/sprites/character/bomberman-dead.png',
      {
        frameWidth: 16,
        frameHeight: 21
      }
    );
    this.load.spritesheet('bomb', '/game/sprites/bomb/bomb.png', {
      frameWidth: 18,
      frameHeight: 18
    });
    this.load.spritesheet('brick', '/game/sprites/brick/brick.png', {
      frameWidth: 18,
      frameHeight: 18
    });
    this.load.spritesheet('ballon', '/game/sprites/enemies/ballon.png', {
      frameWidth: 16,
      frameHeight: 18
    });
    this.load.spritesheet('snow', '/game/sprites/enemies/snow.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('barrel', '/game/sprites/enemies/barrel.png', {
      frameWidth: 18,
      frameHeight: 16
    });
    this.load.spritesheet('cookie', '/game/sprites/enemies/cookie.png', {
      frameWidth: 17,
      frameHeight: 16
    });
    this.load.spritesheet('ghost', '/game/sprites/enemies/ghost.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('bear', '/game/sprites/enemies/bear.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('coin', '/game/sprites/enemies/money.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet(
      'explosion-center',
      '/game/sprites/bomb/explosion/explosion-center.png',
      {
        frameWidth: 18,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'explosion-upper-lenght',
      '/game/sprites/bomb/explosion/explosion-upper-lenght.png',
      {
        frameWidth: 18,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'explosion-lower-lenght',
      '/game/sprites/bomb/explosion/explosion-lower-lenght.png',
      {
        frameWidth: 18,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'explosion-right-lenght',
      '/game/sprites/bomb/explosion/explosion-right-lenght.png',
      {
        frameWidth: 18,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'explosion-left-lenght',
      '/game/sprites/bomb/explosion/explosion-left-lenght.png',
      {
        frameWidth: 18,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'explosion-extension-horizontal',
      '/game/sprites/bomb/explosion/explosion-extension-horizontal.png',
      {
        frameWidth: 18,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'explosion-extension-vertical',
      '/game/sprites/bomb/explosion/explosion-extension-vertical.png',
      {
        frameWidth: 18,
        frameHeight: 18
      }
    );
    this.load.spritesheet(
      'destroy-enemy',
      '/game/sprites/enemies/destroy-enemy/destroy-enemy.png',
      {
        frameWidth: 14,
        frameHeight: 16
      }
    );

    // Load all the sounds
    this.load.audio('stage-theme', '/game/music/stage/stage-theme.mp3');
    this.load.audio('level-start', '/game/music/stage/level-start.mp3');
    this.load.audio('level-complete', '/game/music/stage/level-complete.mp3');
    this.load.audio('just-died', '/game/music/character/just-died.mp3');
    this.load.audio('explosion', '/game/music/bomb/explosion.mp3');
    this.load.audio('find-the-door', '/game/music/character/find_the_door.mp3');
    this.load.audio('game-over', '/game/music/stage/game-over.mp3');
    this.load.audio('menu-audio', '/game/music/stage/title-screen.mp3');
    this.load.audio('put-bomb', '/game/music/bomb/put-bomb.wav');
    this.load.audio('power', '/game/music/character/power.wav');
    this.load.audio('lose', '/game/music/character/lose.wav');
    this.load.audio('last-enemy', '/game/music/enemy/last-enemy.wav');
  }

  create() {
    this.scene.start('MainMenu');
  }
}
