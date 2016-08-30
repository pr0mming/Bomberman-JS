/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can see my work at: https://github.com/pr0mming
*/
Game.MainMenu = function(game) {};

Game.MainMenu.prototype = {
    create: function() {
        this.title = this.add.sprite((this.game.world.centerX - 340), (this.game.world.centerY - 260), 'menu-title');
        this.title.scale.setTo(3.0, 3.0);
        
        this.start = this.add.text((this.game.world.centerX - 180), (this.game.world.centerY + 170), 'START', {
            font: '19px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        this.start.inputEnabled = true;
        this.start.events.onInputDown.add(function(){
            this.sound.stopAll();
            
            var stage = {
                stage: 1,
                lives: 3,
                points: 0,
                time: 190,
                stage_enemies: [['ballon'], ['ballon', 'snow'], ['snow', 'cookie'], ['cookie', 'ghost'], ['barrel', 'bear']]
            };
            
            stage.stage_points = stage.points;
            stage.stage_time = stage.time;
            stage.status = 'start';
            
            this.state.start('ChangeStage', true, false, stage);
        }, this);
        
        this.continue = this.add.text((this.game.world.centerX + 90), (this.game.world.centerY + 170), 'CONTINUE', {
            font : '19px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        this.continue.inputEnable = true;
        this.continue.events.onInputDown.add(function() {
            
        }, this);
        
        this.top = this.add.text((this.game.world.centerX - 180), (this.game.world.centerY + 200), 'TOP', {
            font : '19px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        
        this.hight_score = this.add.text((this.game.world.centerX + 90), (this.game.world.centerY + 200), (localStorage.getItem('HightScore') || 0), {
            font : '19px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        
        this.description = this.add.text((this.game.world.centerX - 260), (this.game.world.centerY + 250), 'This application is developed in JavaScript using Phaser.js.\n has not been tested in other browsers except Mozilla Firefox', {
            font : '12px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        
        this.sound_title_screen = this.add.audio('title-screen');
        this.sound_title_screen.loopFull();
    }
}