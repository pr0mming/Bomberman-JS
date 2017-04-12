/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can see my work at: https://github.com/pr0mming
*/
var Game = Game || {};

Game.Boot = function(game) {};

Game.Boot.prototype = {
    
    create: function() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
        
        var box_size = document.getElementById('bomberman');
        box_size.style.width = this.game.width + 'px';
        box_size.style.height = this.game.height + 'px';
        
        this.state.start('Preloader');
    }
};

