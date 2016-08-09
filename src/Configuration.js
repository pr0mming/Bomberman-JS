/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can help me improve this app or see more of my work: https://github.com/pr0mming
*/
(function() {
    var game = new Phaser.Game(1000, 580, Phaser.AUTO, 'bomberman');

    game.state.add('Boot', Game.Boot);
    game.state.add('Load', Game.Load);
    game.state.add('MainMenu', Game.MainMenu);
    game.state.add('Game', Game.Game);
    game.state.add('ChangeStage', Game.ChangeStage);
    
    game.state.start('Boot');    
})();