/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can see my work at: https://github.com/pr0mming
*/
Game.ChangeStage = function(game) {};

Game.ChangeStage.prototype = {
    
    init: function(status, map) {
        this.status = status;
        this.map = map;
    },
    
    create: function() {
        this.sound.stopAll();
        this.stage.backgroundColor = '#000000';
        
        this.start_stage = this.time.create(false);
        this.start_stage.seconds = 0;

        if (this.status == 'restart') {
            this.restartGame();
        } else
            if (this.status == 'game-over') {
                this.endGame();
            } else
                if (this.status == 'next-stage') {
                    this.nextStage();
                }
    },
    
    restartGame: function() {
        this.sound_level_start = this.add.audio('level-start');
        var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'STAGE '+localStorage.stage, {
            font: '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        this.sound_level_start.play();
            
        this.start_stage.loop(1000, function() {
            this.start_stage.seconds++;
            if (this.start_stage.seconds >= 4) {
                this.start_stage.stop(false);
                this.state.start('Game', true, false, this.map);
            }
        }, this);
        
        this.start_stage.start();
    },
    
    endGame: function() {
        this.sound_game_over = this.add.audio('game-over');
        var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'GAME OVER', {
            font: '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        }); 
        this.sound_game_over.play();
            
        this.start_stage.loop(1000, function() {
            this.start_stage.seconds++;
            if (this.start_stage.seconds >= 7) {
                this.start_stage.stop(false);
                this.state.start('MainMenu');
            }
        }, this);
                
        this.start_stage.start();
    },
    
    nextStage: function() {
        localStorage.stage = parseInt(localStorage.stage) + 1;
        this.sound_level_start = this.add.audio('level-start');
        var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'STAGE '+localStorage.stage, {
            font: '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        
        this.sound_level_start.play();
        this.coords = [];
        
        var rows = 11,
            cols = 35,
            distance = 40,
            specialities = ['door', 'power'];
        
        for (var i = 0, y = 98; i < rows; i++, y+=distance) {
            if (i % 2 == 0)
                for (var j = 0, x = 38; j < cols; j++, x+=distance) 
                    this.coords.push(x+','+y);
            else
                for (var j = 0, x = 38; j < cols; j++, x+=(distance * 2)) 
                    this.coords.push(x+','+y);
        }
        
        for (var i in this.map) {
            var coord = this.coords[this.rnd.integerInRange(0, this.coords.length - 1)].split(','),
                index = specialities.indexOf(this.map[i].name);
            
            if (index != -1) {
                var brick = this.map.map((object) => { return object.name; }, this).indexOf(specialities[index]+'-brick');
                this.map[brick].x = parseInt(coord[0]);
                this.map[brick].y = parseInt(coord[1]);
            }
            
            this.map[i].x = parseInt(coord[0]);
            this.map[i].y = parseInt(coord[1]);
            this.coords.splice(this.coords.indexOf(coord.join(',')), 1);
        }

        this.start_stage.loop(1000, function() {
            this.start_stage.seconds++;
            if (this.start_stage.seconds >= 4) {
                this.start_stage.stop(false);
                this.state.start('Game', true, false, this.map);
            }
        }, this);

        this.start_stage.start();
    }
}