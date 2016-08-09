var Game = Game || {};

Game.Boot = function(game) {};

Game.Boot.prototype = {
    
    create: function() {
        this.physics.startSystem(Phaser.Physics.ARCADE);
    
        var box_size = document.getElementById('bomberman');
        box_size.style.width = this.game.width + 'px';
        box_size.style.height = this.game.height + 'px';
        this.state.start('Load');
    }
};

