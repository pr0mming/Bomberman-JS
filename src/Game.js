/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can see my work at: https://github.com/pr0mming
*/

/// <reference path="lib/phaser.js"/>

Game.Game = function(game) {};

Game.Game.prototype = {
    
    init: function(stageBomberman) {
        this._stageBomberman = stageBomberman;
    },
    
    create: function() {
        this.createMap();
        this.createControls();
        this.createCharacter();
        this.createStatistics();
        this.createBomb();
        this.createAutonomy();
        this.createEnemies();
    },
    
    update: function() {
        
        if (this._save.isDown) {
            //coming soon
        }
        
        this.physics.arcade.collide(this._bomberman, this._brick);
        this.physics.arcade.collide(this._bomberman, this._layer);
        this.physics.arcade.collide(this._bomberman, this._bombs);
        this.physics.arcade.collide(this._enemies, this._bombs);
        
        this.physics.arcade.collide(this._enemies, this._layer, null, function(enemy) {
            if (enemy.physicsLayer) return true;
            else return false;
        }, this);
        
        this.physics.arcade.collide(this._enemies, this._brick, null, function(enemy) {
            if (enemy.physicsBrick) return true;
            else return false;
        }, this);
        
        this.physics.arcade.overlap(this._bomberman, this._enemies, function(hero, enemy) { this.lose(); }, null, this);
        this.physics.arcade.overlap(this._bomberman, this._explosion, function(hero, explosion) { this.lose(); }, null, this);
        this.physics.arcade.overlap(this._explosion, this._bombs, function(explosion, detected_bomb) {
           this.exploitBomb(detected_bomb);
        }, null, this);
        
        this.physics.arcade.overlap(this._bomberman, this._specialties.getByName('power'), function(hero, power) { 
            this.updateCharacter(power.TypePower);            
            power.kill();
        }, null, this);
        
        this.physics.arcade.overlap(this._bomberman, this._specialties.getByName('door'), function(hero, door) { 
            if (this._enemies.length == 0 && (this._timerGame.running) && (Math.round(this._bomberman.body.x) == Math.round(door.body.x) && Math.round(this._bomberman.body.y) == Math.round(door.body.y))) 
                this.win();
        }, null, this);
        /*
        this.physics.arcade.collide(this._explosion, this._layer, null, function(explosion, layer) {
            explosion.kill();
        }, this);*/
        
        this.physics.arcade.overlap(this._explosion, this._enemies, function(explosion, enemy) {
            enemy.autonomy = false;
            enemy.body.enable = false;
            this.destroyEnemy(enemy);
        }, null, this);
        
        this.physics.arcade.overlap(this._explosion, this._brick, function(fragment, brick) { 
            brick.animations.play('destroy', 10, false, true); 
            if (brick.name == 'door-brick') this._specialties.getByName('door').revive();
            else if (brick.name == 'power-brick') this._specialties.getByName('power').revive();
            fragment.kill();
        }, null, this);
        
        this.physics.arcade.overlap(this._explosion, this._specialties.getByName('power'), function(power, fragment) { 
            fragment.events.onAnimationComplete.add(function() {
                for (var i = 0; i < this._numberEnemies; i++)
                    var stage = this._stageBomberman.stage - 1;
                    this.putEnemy(this._stageBomberman.stage_enemies[stage][0], false, power.body.x, power.body.y);
            }, this);
            power.kill();
        }, null, this);
        
        this.moveCharacter();
        this.activeMotionEnemy();
    },
    
    render: function() {
        //this.game.debug.body(this._bomberman);
        /*if (this._bombs != undefined) {
            this._bombs.forEach(function(brick) {
                this.game.debug.body(brick);
            }, this);
        }*/
        //this.game.debug.spriteInfo(this.hero.getByName('hero'), 50, 50);
    },
    
    createMap: function() {
        this._timers = [];
        this._coordsBrick = [];
        this._brickPosition = [];
        
        this._map = this.add.tilemap('world');
        this._map.addTilesetImage('playing-environment');
        
        if (typeof this._stageBomberman.map != 'undefined') this._map.objects.Objects = this._stageBomberman.map;
        
        this._map.objects.Objects.forEach(function(brick) {
            if (brick.name == '' || brick.name.includes('brick')) brick.gid = 10;
            else if (brick.name == 'power') brick.gid = 20;
            else if (brick.name == 'door') brick.gid = 15;
        }, this);
        
        this._map.setCollisionBetween(1, 14, true, 'Map');
        
        this._brick = this.add.group();
        this._brick.enableBody = true;
        this._brick.physicsBodyType = Phaser.Physics.ARCADE;

        this._specialties = this.add.group();
        this._specialties.enableBody = true;
        this._specialties.physicsBodyType = Phaser.Physics.ARCADE;

        this._soundFindTheDoor = this.add.audio('find-the-door');
        this._soundStage = this.add.audio('stage-theme');

        this._soundStage.loopFull();
        
        this.game.stage.backgroundColor = '#1F8B00';
    
        this._layer = this._map.createLayer('Map');
        this._layer.resizeWorld();
        
        this._map.createFromObjects('Objects', 10, 'brick', 0, true, true, this._brick, Phaser.Sprite, false);
        this._brick.callAll('animations.add', 'animations', 'wait', [0], 10, true);
        this._brick.callAll('animations.add', 'animations', 'destroy', [1, 2, 3, 4, 5, 6], 10, true);
        this._brick.callAll('animations.play', 'animations', 'wait');
        this._brick.forEach(function(element) {
            element.body.setSize(16, 16, 1, 1);
            element.body.immovable = true;
            element.smoothed = false;
            this._brickPosition.push(Math.round(element.body.x)+','+Math.round(element.body.y));
        }, this);
        
        var powers_group = ['power-1', 'ExtendExplosion', 'power-2', 'AddBomb', 'power-3', 'TimeExploitBomb'],
            index = this.rnd.integerInRange(0, powers_group.length - 1);
        
        if (index % 2 != 0) index = 0;
        
        this._map.createFromObjects('Objects', 15, 'door', 0, true, true, this._specialties, Phaser.Sprite, false);
        this._map.createFromObjects('Objects', 20, powers_group[index], 0, true, true, this._specialties, Phaser.Sprite, false);
        
        this._specialties.getByName('door').kill();
        var power = this._specialties.getByName('power');
        power.kill();
        power.TypePower = powers_group[++index];
        
        this._crossroads = this.add.group();
        this._crossroads.enableBody = true;
        this._crossroads.physicsBodyType = Phaser.Physics.ARCADE;
        
         var distance = 40 * 2,
             rows = 11 / 2,
             cols = 35 / 2;
        
        for (var i = 0, y = 117, id = 0; i < rows; i++, y += distance) 
            for (var j = 0, x = 55; j < cols; j++, x += distance, id++) {
                //Modify JSON
                this._map.objects.Crossroads.push(
                        {
                         "height":1.6,
                         "id":id,
                         "name":("crossroad"+id),
                         "rotation":0,
                         "type":"",
                         "visible":true,
                         "width":1.6,
                         "x":x,
                         "y":y,
                         "gid":30
                        }
                );
            }
        
        this._map.createFromObjects('Crossroads', 30, null, 0, true, true, this._crossroads, Phaser.Sprite, false);
    },
    
    createControls: function() {
        this._directions = this.input.keyboard.createCursorKeys();
        this._put_bomb = this.input.keyboard.addKey(Phaser.Keyboard.X);
        this._exploit_bomb = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this._save = this.input.keyboard.addKey(Phaser.Keyboard.S);
    },
    
    createCharacter: function() {
        this._direction = '';
        this._hero = this.add.group();
        this._hero.enableBody = true;
        this._hero.physicsBodyType = Phaser.Physics.ARCADE;
        this._hero.createMultiple(1, 'bomberman-dead');
        
        var timerLose = this.time.create(false);
        timerLose.seconds = 0;
        
        timerLose.loop(1000, function() {
            this._timers[0].seconds++;
            if (this._timers[0].seconds >= 4) {
                this._timers[0].seconds = 0;
                this._timers[0].stop(false);
                this._stageBomberman.lives--;
                if (this._stageBomberman.lives >= 0) {
                    this._stageBomberman.status = 'restart';
                    this.state.start('ChangeStage', true, false, this._stageBomberman);
                } else {
                    this._stageBomberman.status = 'game-over';
                    this.state.start('ChangeStage', true, false, this._stageBomberman);
                }
            }   
        }, this);
        
        this._timers.push(timerLose);

        this._soundLose = this.add.audio('lose');
        this._soundJustDied = this.add.audio('just-died');
        this._soundPower = this.add.audio('power');
        
        this._bomberman = this._hero.create(45, 102, 'bomberman-move');
        this._bomberman.name = 'hero';
        this._bomberman.smoothed = false;
        
        var right = this._bomberman.animations.add('right', [3, 4, 5], 10, true);
        right.enableUpdate = true;
        var left = this._bomberman.animations.add('left', [0, 1, 2], 10, true);
        left.enableUpdate = true;
        var up = this._bomberman.animations.add('up', [9, 10, 11], 10, true);
        up.enableUpdate = true;
        var down = this._bomberman.animations.add('down', [6, 7, 8], 10, true);
        down.enableUpdate = true;
        
        this._bomberman.scale.setTo(2.0, 2.0);
        this._bomberman.body.setSize(this._bomberman.body.width - 5, this._bomberman.body.height - 2, 1, 1);
        this._bomberman.body.mass = 0;
        
        this._heroSpeed = 150;
        
        this._stageBomberman._hero = { x: this._bomberman.body.x, y: this._bomberman.body.y };

        this.camera.follow(this._bomberman);
    },
    
    updateCharacter: function(power) {
        this._soundStage.stop();
        this._soundFindTheDoor.play();
        this._soundFindTheDoor.loopFull();
        
        if (power == 'ExtendExplosion') {
            this._stageBomberman.stage_points += 160;
            this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
            this._explosionLength++;
        } else
            if (power == 'AddBomb') {
                this._stageBomberman.stage_points += 180;
                this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
                this._amountBombs++;
            }
    },
    
    moveCharacter: function() {
        
        if (this._bomberman.exists) {

            this._bomberman.body.velocity.x = 0;
            this._bomberman.body.velocity.y = 0;

            if (this._directions.right.isDown) {
                this._bomberman.body.velocity.x = this._heroSpeed;
                if (this._direction != 'right') {
                    this._bomberman.animations.play('right');
                    this._direction = 'right';
                }
            } else
                if (this._directions.left.isDown) {
                    this._bomberman.body.velocity.x = -this._heroSpeed;
                    if (this._direction != 'left') {
                        this._bomberman.animations.play('left');
                        this._direction = 'left';
                    }
                } else
                    if (this._directions.up.isDown) {
                        this._bomberman.body.velocity.y = -this._heroSpeed;
                        if (this._direction != 'up') {
                            this._bomberman.animations.play('up');
                            this._direction = 'up';
                        }
                    } else
                        if (this._directions.down.isDown) {
                            this._bomberman.body.velocity.y = this._heroSpeed;
                            if (this._direction != 'down') {
                                this._bomberman.animations.play('down');
                                this._direction = 'down';
                            }
                        }  else 
                            if (this._direction != 'stop') {
                                this._bomberman.animations.stop();
                                this._direction = 'stop';
                            }

            if (this._put_bomb.isDown) {
                this.putBomb(this._bomberman);
            } else
                if (this._exploit_bomb.isDown) {
                        this.exploitBomb(this._bombs.getFirstAlive());
                }
        }
        
    },
    
    win: function() {
        this.game.sound.stopAll();
        
        if (localStorage.getItem('HightScore') < localStorage.stage_points) 
            localStorage.setItem('HightScore', localStorage.stage_points);
        
        this._soundLevelComplete = this.add.audio('level-complete');
        this._soundLevelComplete.play();
        this._timers[1].stop(false);
        
        var timerNextStage = this.time.create(false)
        
        timerNextStage.seconds = 0;
        this._bomberman.body.moves = false;
        this._stageBomberman._map = this._map.objects.Objects;
        this._stageBomberman.points = this._stageBomberman.stage_points;
        
        this._stageBomberman.stage_points += 450;
        this._stageBomberman.status = 'next-stage';
        this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
        
        timerNextStage.loop(1000, function() {
            this._timers[4].seconds++;
            if (this._timers[4].seconds > 5) {
                this._timers[4].stop();
                this.state.start('ChangeStage', true, false, this._stageBomberman);
            } 
        }, this);
        
        timerNextStage.start();
        this._timers.push(timerNextStage);
    },
    
    lose: function() {
        
        this._bomberman.body.enable = false;
        this._bomberman.kill();

        var dead = this._hero.getFirstExists(false);
        dead.reset(this._bomberman.body.x, this._bomberman.body.y);
        dead.scale.setTo(this._bomberman.scale.x, this._bomberman.scale.y);
        dead.smoothed = false;
        dead.animations.add('die');
        dead.animations.play('die', 8, false, true);

        this._timers[1].stop(false);
        this._stageBomberman.stage_points = 0;
        this._stageBomberman.stage_time = this._stageBomberman.time;
        
        this._timers[0].start();
        this.game.sound.stopAll();
        this._soundLose.play();
        
        dead.events.onAnimationComplete.add(function() { 
            this._soundJustDied.play();
        }, this);
    },
    
    createStatistics: function() {
        this._labels = this.add.group();
        
        var style = {
            font : '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        };

        var timerGame = this.time.create(false);
        timerGame.name = 'TimerGame';
        timerGame.loop(1000, function() {
            this._stageBomberman.stage_time--;
            if (this._stageBomberman.stage_time < 0) {
                this._timers[1].stop(false);
                this.replaceEnemies('coin');
            } else
                this._labels.getByName('TIME').setText('TIME: '+this._stageBomberman.stage_time);
        }, this);
        
        this._timers.push(timerGame);
        
        var distance = 22;
        
        var information  = this.add.text(distance, 22, 'TIME: '+this._stageBomberman.time, style);
        information.fixedToCamera = true;
        information.name = 'TIME';
        this._labels.add(information);
        distance+= 170;
        
        information = this.add.text(distance, 22, this._stageBomberman.points, style);
        information.fixedToCamera = true;
        information.name = 'SCORE';
        this._labels.add(information);
        distance+= 128;
        
        information = this.add.text(distance, 22, 'LEFT: '+this._stageBomberman.lives, style);
        information.fixedToCamera = true;
        information.name = 'LEFT';
        this._labels.add(information);

        timerGame.start();
    },
    
    createBomb: function() {
        this._bombs = this.add.group();
        this._bombs.enableBody = true;
        this._bombs.physicsBodyType = Phaser.Physics.ARCADE;
        this._bombs.createMultiple(3, 'bomb');
        this._bombs.callAll('scale.setTo', 'scale', 1.8, 1.8);
        this._bombs.callAll('animations.add', 'animations', 'wait');
        this._bombs.setAll('body.immovable', true);
        this._bombs.setAll('smoothed', false);

        var distance = 23;

        this._explosionProperties = [
            [0, 0, 'explosion-center'],
            [0, (distance * -1), 'explosion-upper-lenght'],
            [0, distance, 'explosion-lower-lenght'],
            [distance, 0, 'explosion-right-lenght'],
            [(distance * -1), 0, 'explosion-left-lenght']
        ];

        this._explosionLengthProperties = [
            'explosion-extension-vertical',
            'explosion-extension-vertical',
            'explosion-extension-horizontal',
            'explosion-extension-horizontal'
        ];

        this._explosionLength = 0;
        this._amountBombs = 1;
        this._timeExplosion = 10;
        this._soundPutBomb = this.add.audio('put-bomb');
        this._soundExploitBomb = this.add.audio('explosion');
        
        var timerPutBomb = this.game.time.create(false);  
        timerPutBomb.seconds = 0;
        
        timerPutBomb.loop(1000, function() {
            this._timers[2].seconds++;
            if (this._timers[2].seconds >= 5) {
                this._timers[2].seconds = 0;
                this._timers[2].stop(false);
            }
        }, this);
        
        var _timerExploitBomb = this.game.time.create(false);
        _timerExploitBomb.seconds = 0;
        
        _timerExploitBomb.loop(1000, function() {
            this._timers[3].seconds++;
            if (this._timers[3].seconds >= 3) {
                this._timers[3].seconds = 0;
                this._timers[3].stop(false);
            }
        }, this);
        
        this._timers.push(timerPutBomb, _timerExploitBomb);
    },
    
    putBomb: function(character) {
        if (!this._timers[2].running || this._bombs.countLiving() == 0) {
            var newBomb = this._bombs.getFirstExists(false);
            
            if (newBomb) {
                newBomb.reset(Math.round(character.body.x), Math.round(character.body.y));
                newBomb.body.setSize(newBomb.body.width - 4, newBomb.body.height - 4, 2, 2);
                newBomb.animations.play('wait', 3, true);
                this._soundPutBomb.play();
                this._timers[2].start();
                this._timers[3].start();
            }
        }
    },
    
    exploitBomb: function(bomb) {
        if (bomb && !this._timers[3].running) {
            
            bomb.kill();
            
            this._explosion = this.add.group();
            this._explosion.enableBody = true;
            this._explosion.physicsBodyType = Phaser.Physics.ARCADE;
            
            for (var i = 0; i < this._explosionProperties.length; i++) {
                var x = bomb.body.x + this._explosionProperties[i][0],
                    y = bomb.body.y + this._explosionProperties[i][1];
                
                for (var j = 0, k = i - 1; j < this._explosionLength && i > 0; j++) {
                    var explosion_extension = this._explosion.create(x, y, this._explosionLengthProperties[k]);
                    explosion_extension.name = this._explosionLengthProperties[k];
                    explosion_extension.smoothed = false;
                    explosion_extension.scale.setTo(1.6, 1.6);
                    explosion_extension.body.setSize(explosion_extension.body.width - 5, explosion_extension.body.width - 5, 1, 1);
                    explosion_extension.animations.add('kaboom');
                    explosion_extension.animations.play('kaboom', 6, false, true);
                    x+=this._explosionProperties[i][0];
                    y+=this._explosionProperties[i][1];
                }
                
                var explosion_fragment = this._explosion.create(x, y, this._explosionProperties[i][2]);
                explosion_fragment.name = this._explosionProperties[i][2];
                explosion_fragment.smoothed = false;
                explosion_fragment.scale.setTo(1.6, 1.6);
                explosion_fragment.body.setSize(explosion_fragment.body.width - 5, explosion_fragment.body.width - 5, 1, 1);
                explosion_fragment.animations.add('kaboom');
                explosion_fragment.animations.play('kaboom', 6, false, true);                
            }
            
            this._soundExploitBomb.play();
            
            if (this._bombs.countLiving() > 0) 
                this._timers[3].start();
            
            this._bombs.sort('y', Phaser.Group.SORT_ASCENDING);
        }
    },
    
    createEnemies: function() {
        this._enemies = this.add.group();
        this._enemies.enableBody = true;
        this._enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this._numberEnemies = 7;
        this._typesEnemies = ['ballon', 30,
                      'snow', 50,
                      'cookie', 60,
                      'barrel', 40,
                      'water', 20,
                      'ghost', 25,
                      'bear', 70,
                      'coin', 80];

        this._soundLastEnemy = this.add.audio('last-enemy');
        var stage = this._stageBomberman.stage - 1,
            split = Math.round(this._numberEnemies / this._stageBomberman.stage_enemies[stage].length); 
        
        for (var i = 0; i < this._numberEnemies; i++)
            for (var j = 0; j < split; j++)
                this.putEnemy(this._stageBomberman.stage_enemies[stage][i], false);
    },
    
    putEnemy: function(type, replace, x, y) {
        
        var coords,
            position = this._map.objects.Crossroads[Math.floor((Math.random() * this._map.objects.Crossroads.length) + 0)];
            index = this._typesEnemies.indexOf(type);
        
        if (x == undefined && y == undefined){
            
            coords = [(position.x - 12), (position.y - 15)];
        }
        else
            coords = [x, y];

        if (index != -1) {
            
            var enemy = this._enemies.create(coords[0], coords[1], type); 
            enemy.smoothed = false;
            enemy.body.setSize(enemy.body.width - 2, enemy.body.height - 2, 1, 1);
            
            if (replace || this.physics.arcade.overlap(enemy, this._bomberman, null, null, this)) {
                    
                this._enemies.remove(enemy);
                this.createEnemies(type, replace, x, y);  
                            
            } else {
                if (type == 'coin') {
                    enemy.animations.add('right', [0, 1, 2, 3, 4], 6, true);
                    enemy.animations.add('left', [7, 8, 9, 10, 11], 6, true);
                    enemy.animations.add('die', [this.rnd.integerInRange(5, 6)], 4, true);
                    enemy.animations.play('right');
                    enemy.physicsLayer = false;
                    enemy.physicsBrick = false;
                } else {
                    enemy.animations.add('right', [4, 5, 6], 4, true);
                    enemy.animations.add('left', [0, 1, 2], 4, true);
                    enemy.animations.add('die', [3], 4, true);
                    enemy.animations.play('right');
                    if (type == 'ghost') {
                        enemy.physicsBrick = false;
                        enemy.physicsLayer = true;
                    } else {
                        enemy.physicsBrick = true;
                        enemy.physicsLayer = true;
                    }
                }
                enemy.name = type;
                enemy.currentCrossroad = '';
                enemy.velocity = this._typesEnemies[++index];
                enemy.autonomy = true;
                enemy.scale.setTo(2.0, 2.0);    
            }
        }      
    },
    
    destroyEnemy: function(enemy) {
        enemy.animations.play('die', 1, false);
        enemy.events.onAnimationComplete.add(function() { 

            enemy.loadTexture('destroy-enemy', 0, true);
            enemy.animations.add('destroy');
            enemy.animations.play('destroy', 2, false, true);
            enemy.events.onAnimationComplete.add(function() { this._enemies.remove(enemy); }, this);

        }, this);

        if (this._enemies.length == 1) this._soundLastEnemy.play();

        if (enemy.name == 'ballon') {
            this._stageBomberman.stage_points += 50;
            this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
        } else
            if (enemy.name == 'snow') {
                this._stageBomberman.stage_points += 90;
                this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
            } else
                if (enemy.name == 'cookie') {
                    this._stageBomberman.stage_points += 150;
                    this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
                } else
                    if (enemy.name == 'ghost') {
                        this._stageBomberman.stage_points += 70;
                        this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
                    } else
                        if (enemy.name == 'bear') {
                            this._stageBomberman.stage_points += 250;
                            this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
                        } else
                            if (enemy.name == 'coin') {
                                this._stageBomberman.stage_points += 350;
                                this._labels.getByName('SCORE').setText(this._stageBomberman.stage_points);
                            }
    },
    
    replaceEnemies: function(type) {
        
        if (this._enemies.length > 0) {
            
            var positions = [];

            this._enemies.forEach(function(enemy) {
                positions.push([enemy.body.x, enemy.body.y]);
            }, this);

            this._enemies.destroy(true, true);

            positions.forEach(function(coords) {
                this.putEnemy('coin', false, coords[0], coords[1]);
            }, this);
            
        } else {
            
            for (var i = 0; i < this._numberEnemies; i++)
                this.putEnemy('coin', false);
        }
    },
    
    createAutonomy: function() {
        this._movements = [
            function(enemy) {
                enemy.animations.play('right');
                enemy.body.velocity.x = enemy.velocity;
            },
            function(enemy) {
                enemy.animations.play('left');
                enemy.body.velocity.x = (enemy.velocity) * -1;
            },
            function(enemy) {
                enemy.animations.play('right');
                enemy.body.velocity.y = enemy.velocity;
            },
            function(enemy) {
                enemy.animations.play('left');
                enemy.body.velocity.y = (enemy.velocity) * -1;
            }
        ];
    },
    
    activeMotionEnemy: function() {
        this._enemies.forEach(function(enemy) {
            if (enemy.autonomy) {
                if (enemy.name == 'ballon' || enemy.name == 'snow') {
                    var move = this.physics.arcade.overlap(enemy, this._crossroads, null, function(x, y) { 
                        if (y.name != x.currentCrossroad) {
                            x.currentCrossroad = y.name;
                            return true;
                        } else  
                            return false;
                    }, this);
                    
                    if (move || enemy.body.speed == 0) {
                        enemy.body.velocity.x = 0;
                        enemy.body.velocity.y = 0;
                        this._movements[this.rnd.integerInRange(0, (this._movements.length-1))](enemy);
                    }
                } else
                    if (enemy.name == 'coin') {                 


                        if (this._bomberman.exists) {

                            enemy.body.velocity.x = 0;
                            enemy.body.velocity.y = 0;

                            if (Math.round(this._bomberman.body.x) > Math.round(enemy.body.x) && Math.round(this._bomberman.body.y) != Math.round(enemy.body.y)) {
                                this._movements[0](enemy);
                            } else
                                if (Math.round(this._bomberman.body.x) < Math.round(enemy.body.x) && Math.round(this._bomberman.body.y) != Math.round(enemy.body.y)) {
                                    this._movements[1](enemy);
                                } else 
                                    if (Math.round(this._bomberman.body.y) > Math.round(enemy.body.y) && Math.round(this._bomberman.body.x) != Math.round(enemy.body.x)) {
                                        this._movements[2](enemy);
                                    } else
                                        if(Math.round(this._bomberman.body.y) < Math.round(enemy.body.y) && Math.round(this._bomberman.body.x) != Math.round(enemy.body.x)) {
                                            this._movements[3](enemy);
                                        } else 
                                            if (Math.round(this._bomberman.body.x) == Math.round(enemy.body.x) && Math.round(this._bomberman.body.y) != Math.round(enemy.body.y)) {
                                                if (Math.round(this._bomberman.body.y) > Math.round(enemy.body.y)) 
                                                    this._movements[2](enemy);
                                                else
                                                    this._movements[3](enemy);
                                            } else
                                                if (Math.round(this._bomberman.body.y) == Math.round(enemy.body.y) && Math.round(this._bomberman.body.x) != Math.round(enemy.body.x)) {
                                                    if (Math.round(this._bomberman.body.x) > Math.round(enemy.body.x)) 
                                                        this._movements[0](enemy);
                                                    else
                                                        this._movements[1](enemy);
                                                }
                        } else enemy.name = 'ballon';
                    }
            }
        }, this);
    } 
}