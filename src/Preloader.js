/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can see my work at: https://github.com/pr0mming
*/
Game.Preloader = function(game) {};

Game.Preloader.prototype = {
    
    preload: function() {
        this.load.tilemap('world', 'resources/game-map/playing-environment.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('playing-environment', 'resources/game-map/environment.png');
        this.load.image('door', 'resources/specialties/door.png');
        this.load.image('power-1', 'resources/specialties/powers/power1.png');
        this.load.image('power-2', 'resources/specialties/powers/power2.png');
        this.load.image('power-3', 'resources/specialties/powers/power3.png');
        this.load.image('menu-title', 'resources/icons/menu-title.png');
        this.load.spritesheet('bomberman-move', 'resources/character/bomberman-move.png', 16, 18);
        this.load.spritesheet('bomberman-dead', 'resources/character/bomberman-dead.png', 16, 21);
        this.load.spritesheet('bomb', 'resources/bomb/bomb.png', 18, 18);
        this.load.spritesheet('brick', 'resources/game-map/brick/brick.png', 18, 18);
        this.load.spritesheet('ballon', 'resources/enemies/ballon.png', 16, 18);
        this.load.spritesheet('snow', 'resources/enemies/snow.png', 16, 16);
        this.load.spritesheet('barrel', 'resources/enemies/barrel.png', 18, 16);
        this.load.spritesheet('cookie', 'resources/enemies/cookie.png', 17, 16);
        this.load.spritesheet('ghost', 'resources/enemies/ghost.png', 16, 16);
        this.load.spritesheet('bear', 'resources/enemies/bear.png', 16, 16);
        this.load.spritesheet('coin', 'resources/enemies/money.png', 16, 16);
        this.load.spritesheet('explosion-center', 'resources/bomb/explosion/explosion-center.png', 18, 18);
        this.load.spritesheet('explosion-upper-lenght', 'resources/bomb/explosion/explosion-upper-lenght.png', 18, 18);
        this.load.spritesheet('explosion-lower-lenght', 'resources/bomb/explosion/explosion-lower-lenght.png', 18, 18);
        this.load.spritesheet('explosion-right-lenght', 'resources/bomb/explosion/explosion-right-lenght.png', 18, 18);
        this.load.spritesheet('explosion-left-lenght', 'resources/bomb/explosion/explosion-left-lenght.png', 18, 18);
        this.load.spritesheet('explosion-extension-horizontal', 'resources/bomb/explosion/explosion-extension-horizontal.png', 18, 18);
        this.load.spritesheet('explosion-extension-vertical', 'resources/bomb/explosion/explosion-extension-vertical.png', 18, 18);
        this.load.spritesheet('destroy-enemy', 'resources/enemies/destroy-enemy/destroy-enemy.png', 14, 16);
        this.load.audio('stage-theme', 'resources/music/stage/stage-theme.mp3');
        this.load.audio('level-start', 'resources/music/stage/level-start.mp3');
        this.load.audio('level-complete', 'resources/music/stage/level-complete.mp3');
        this.load.audio('just-died', 'resources/music/character/just-died.mp3');
        this.load.audio('explosion', 'resources/music/bomb/explosion.mp3');
        this.load.audio('find-the-door', 'resources/music/character/find_the_door.mp3');
        this.load.audio('game-over', 'resources/music/stage/game-over.mp3');
        this.load.audio('title-screen', 'resources/music/stage/title-screen.mp3');
        this.load.audio('put-bomb', 'resources/music/bomb/put-bomb.wav');
        this.load.audio('power', 'resources/music/character/power.wav')
        this.load.audio('lose', 'resources/music/character/lose.wav');
        this.load.audio('last-enemy', 'resources/music/enemy/last-enemy.wav');
    },
    
    create: function() {
        this.state.start('MainMenu');
    }
}