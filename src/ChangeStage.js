/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can see my work at: https://github.com/pr0mming
*/
Game.ChangeStage = function(game) {};

Game.ChangeStage.prototype = {
    
    init: function(stageBomberman) {
        this._stageBomberman = stageBomberman;
    },
    
    create: function() {
        this.sound.stopAll();
        this.game.stage.backgroundColor = '#000000';
        
        this._startStage = this.time.create(false);
        this._startStage.seconds = 0;

        if (this._stageBomberman.status == 'restart') {
            this.restartGame();
        } else
            if (this._stageBomberman.status == 'game-over') {
                this.endGame();
            } else
                if (this._stageBomberman.status == 'next-stage') {
                    this.nextStage();
                } else
                    if (this._stageBomberman.status == 'start') {
                        this.startGame();
                    }
    },
    
    startGame: function() {
        var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'STAGE '+this._stageBomberman.stage, {
            font: '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        
        this._soundLevelStart = this.add.audio('level-start');
        this._soundLevelStart.play();
        
        this._startStage.loop(1000, function() {
            this._startStage.seconds++;
            if (this._startStage.seconds >= 4) {
                this._startStage.stop(false);
                this.state.start('Game', true, false, this._stageBomberman);
            }
        }, this);
        
        this._startStage.start();
    },
    
    restartGame: function() {
        var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'STAGE '+this._stageBomberman.stage, {
            font: '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        
        this._soundLevelStart = this.add.audio('level-start');
        this._soundLevelStart.play();
            
        this._startStage.loop(1000, function() {
            this._startStage.seconds++;
            if (this._startStage.seconds >= 4) {
                this._startStage.stop(false);
                this.state.start('Game', true, false, this._stageBomberman);
            }
        }, this);
        
        this._startStage.start();
    },
    
    endGame: function() {
        var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'GAME OVER', {
            font: '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        }); 
        
        this._soundGameOver = this.add.audio('game-over');
        this._soundGameOver.play();
            
        this._startStage.loop(1000, function() {
            this._startStage.seconds++;
            if (this._startStage.seconds >= 7) {
                this._startStage.stop(false);
                this.state.start('MainMenu');
            }
        }, this);
                
        this._startStage.start();
    },
    
    nextStage: function() {
        this._stageBomberman.stage++;
        
        var presentation_stage = this.add.text(this.game.width/2, this.game.height/2, 'STAGE '+this._stageBomberman.stage, {
            font: '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        });
        
        this._soundLevelStart = this.add.audio('level-start');
        this._soundLevelStart.play();
        
        var rows = 11,
            cols = 35,
            distance = 40,
            coords = [],
            specialities = ['door', 'power'];
        
        for (var i = 0, y = 98; i < rows; i++, y+=distance) {
            if (i % 2 == 0)
                for (var j = 0, x = 38; j < cols; j++, x+=distance) 
                    coords.push(x+','+y);
            else
                for (var j = 0, x = 38; j < cols; j++, x+=(distance * 2)) 
                    coords.push(x+','+y);
        }
        
        for (var i in this._stageBomberman.map) {
            var coord = coords[this.rnd.integerInRange(0, coords.length - 1)].split(','),
                index = specialities.indexOf(this._stageBomberman.map[i].name);
            
            if (index != -1) {
                var brick = this._stageBomberman.map.map((object) => { return object.name; }, this).indexOf(specialities[index]+'-brick');
                this._stageBomberman.map[brick].x = parseInt(coord[0]);
                this._stageBomberman.map[brick].y = parseInt(coord[1]);
            }
            
            this._stageBomberman.map[i].x = parseInt(coord[0]);
            this._stageBomberman.map[i].y = parseInt(coord[1]);
            
            coords.splice(coords.indexOf(coord.join(',')), 1);
        }

        this._startStage.loop(1000, function() {
            this._startStage.seconds++;
            if (this._startStage.seconds >= 4) {
                this._startStage.stop(false);
                this.state.start('Game', true, false, this._stageBomberman);
            }
        }, this);

        this._startStage.start();
    }
}