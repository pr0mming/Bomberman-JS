/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can help me improve this app or see more of my work: https://github.com/pr0mming
*/
Game.ChangeStage = function(game) {};

Game.ChangeStage.prototype = {
    
    create: function() {
        this.stage.backgroundColor = '#000000';
        this.sound.stopAll();
        
        var seconds = 0;
        this.start_stage = this.time.create(false);

        if (this.status == 'restart') {
            this.sound_level_start = this.add.audio('level-start');
            var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'STAGE 1', {
                font : '15px BitBold',
                fill: 'white',
                stroke: 'black',
                strokeThickness: 2.5
            });
            this.sound_level_start.play();
            
            this.start_stage.loop(1000, function() {
                seconds++;
                if (seconds >= 4) {
                    this.start_stage.stop(false);
                    this.state.start('Game');
                }
            }, this);
            
            this.start_stage.start();
        } else
            if (this.status == 'game-over') {
                this.sound_game_over = this.add.audio('game-over');
                var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'GAME OVER', {
                    font : '15px BitBold',
                    fill: 'white',
                    stroke: 'black',
                    strokeThickness: 2.5
                }); 
                this.sound_game_over.play();
            
                this.start_stage.loop(1000, function() {
                    seconds++;
                    if (seconds >= 7) {
                        this.start_stage.stop(false);
                        this.state.start('MainMenu');
                    }
                }, this);
                
                this.start_stage.start();
            } else
                if (this.status == 'next-stage') {
                    
                }
    },
    
    init: function(status) {
        this.status = status;
    }
}