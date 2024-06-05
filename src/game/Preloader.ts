import { Scene } from 'phaser';

/**
 * The Preloader of the game, I put here all the required assets to use in the next scenes
 */
export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Little label to show loading process
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'LOADING GAME ...'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(15)
      .setColor('white')
      .setStroke('black', 2.5)
      .setOrigin(0.5, 0.5);

    // Load map of tiles
    this.load.tilemapTiledJSON('world', '/game/map/tilemap.json');
    this.load.image('tilemap', '/game/map/hard-wall.png');

    // Load spritesheets and other assets
    this.load.image('door', '/game/images/door.png');
    this.load.image('bomb-up', '/game/images/power-up/bomb-up.png');
    this.load.image('fire-up', '/game/images/power-up/fire-up.png');
    this.load.image(
      'remote-control',
      '/game/images/power-up/remote-control.png'
    );
    this.load.image('menu-title', '/game/images/menu-title.png');

    this.load.spritesheet(
      'bomberman-move',
      '/game/sprites/player/walking.png',
      {
        frameWidth: 16,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'bomberman-dead',
      '/game/sprites/player/killing.png',
      {
        frameWidth: 16,
        frameHeight: 21
      }
    );
    this.load.spritesheet('bomb', '/game/sprites/bomb/bomb.png', {
      frameWidth: 17,
      frameHeight: 18
    });
    this.load.spritesheet('wall', '/game/sprites/wall/wall.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet(
      'wall-explosion',
      '/game/sprites/wall/wall-explosion.png',
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet('ballom', '/game/sprites/enemies/ballom.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('onil', '/game/sprites/enemies/onil.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('minvo', '/game/sprites/enemies/minvo.png', {
      frameWidth: 17,
      frameHeight: 16
    });
    this.load.spritesheet('dahl', '/game/sprites/enemies/dahl.png', {
      frameWidth: 18,
      frameHeight: 16
    });
    this.load.spritesheet('ovape', '/game/sprites/enemies/ovape.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('pass', '/game/sprites/enemies/pass.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet('pontan', '/game/sprites/enemies/pontan.png', {
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
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-lower-lenght',
      '/game/sprites/bomb/explosion/explosion-lower-lenght.png',
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-right-lenght',
      '/game/sprites/bomb/explosion/explosion-right-lenght.png',
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-left-lenght',
      '/game/sprites/bomb/explosion/explosion-left-lenght.png',
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-extension-horizontal',
      '/game/sprites/bomb/explosion/explosion-extension-horizontal.png',
      {
        frameWidth: 18,
        frameHeight: 16
      }
    );
    this.load.spritesheet(
      'explosion-extension-vertical',
      '/game/sprites/bomb/explosion/explosion-extension-vertical.png',
      {
        frameWidth: 18,
        frameHeight: 16
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
    this.load.audio('bonus-theme', '/game/music/stage/bonus-theme.mp3');
    this.load.audio('level-start', '/game/music/stage/level-start.mp3');
    this.load.audio('level-complete', '/game/music/stage/level-complete.mp3');
    this.load.audio('just-died', '/game/music/character/just-died.mp3');
    this.load.audio('explosion', '/game/music/bomb/explosion.mp3');
    this.load.audio('find-the-door', '/game/music/character/find_the_door.mp3');
    this.load.audio('game-over', '/game/music/stage/game-over.mp3');
    this.load.audio('menu-audio', '/game/music/stage/title-screen.mp3');
    this.load.audio('walking-y', '/game/music/character/walk.mp3');
    this.load.audio('walking-x', '/game/music/character/walk-2.mp3');
    this.load.audio('put-bomb', '/game/music/bomb/put-bomb.wav');
    this.load.audio('power-up', '/game/music/character/power-up.wav');
    this.load.audio('lose', '/game/music/character/lose.wav');
    this.load.audio('last-enemy', '/game/music/enemy/last-enemy.wav');
  }

  create() {
    this.scene.start('MainMenu');
  }
}
