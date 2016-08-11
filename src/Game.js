/*
    This application was developed by @pr0mming with the intention of learning more about the Phaser Framework known. You can see my work at: https://github.com/pr0mming
*/
Game.Game = function(game) {};

Game.Game.prototype = {
    
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
        var character = this.hero.getByName('hero');
        
        if (this.save.isDown) {
            
            //possibly save game function
        }
        
        this.physics.arcade.collide(character, this.brick);
        this.physics.arcade.collide(character, this.layer);
        this.physics.arcade.collide(character, this.bombs);
        this.physics.arcade.collide(this.enemies, this.bombs);
        this.physics.arcade.collide(this.enemies, this.layer, null, function(enemy) {
            if (enemy.physics) return true;
            else return false;
        }, this);
        this.physics.arcade.collide(this.enemies, this.brick, null, function(enemy) {
            if (enemy.physics) return true;
            else return false;
        }, this);
        this.physics.arcade.overlap(character, this.enemies, function(hero, enemy) { this.destroyCharacter(); }, null, this);
        this.physics.arcade.overlap(character, this.explosion, function(hero, explosion) { this.destroyCharacter(); }, null, this);
        this.physics.arcade.overlap(this.explosion, this.bombs, function(explosion, detected_bomb) {
           this.exploitBomb(detected_bomb, true);
        }, null, this);
        this.physics.arcade.overlap(this.explosion, this.enemies, function(explosion, enemy) {
            enemy.autonomy = false;
            enemy.body.enable = false;
            this.destroyEnemy(enemy);
        }, null, this);
        this.physics.arcade.overlap(this.explosion, this.brick, function(fragment, brick) { 
            brick.animations.play('destroy', 10, false, true); 
            if (brick.name == 'door-brick') this.specialties.getByName('door').revive();
            else if (brick.name == 'power-brick') this.specialties.getByName('power').revive();
            fragment.kill();
        }, null, this);
        this.physics.arcade.overlap(character, this.specialties.getByName('power'), function(hero, power) { 
            this.sound_stage.stop();
            this.sound_find_the_door.play();
            this.sound_find_the_door.loopFull();
            this.explosion_length++;
            power.kill();
        }, null, this);
        this.physics.arcade.overlap(character, this.specialties.getByName('door'), function(hero, door) { 
            if (this.enemies.length == 0 && (this.timer_game.running) && (Math.round(character.body.x) == Math.round(door.body.x) && Math.round(character.body.y) == Math.round(door.body.y))) 
                this.Win();
        }, null, this);
        this.physics.arcade.overlap(this.explosion, this.specialties.getByName('power'), function(power, fragment) { 
            fragment.events.onAnimationComplete.add(function() {
                for (var i = 0; i < this.number_enemies; i++)
                    this.putEnemy('ballon', false, power.body.x, power.body.y);
            }, this);
            power.kill();
        }, null, this);
        
        this.moveCharacter();
        this.activeMotionEnemy();
    },
    
    render: function() {
        //this.game.debug.spriteBounds(this.hero.getByName('hero'));
        //this.game.debug.spriteInfo(this.hero.getByName('hero'), 50, 50);
    },
    
    createMap: function() {
        //Important:
        this.timers = [];
        this.coords_brick = [];
        
        this.map = this.add.tilemap('world');
        this.map.addTilesetImage('playing-environment');

        this.map.objects.Objects.forEach(function(brick) {
            if (brick.name == '' || brick.name.includes('brick')) brick.gid = 10;
            else if (brick.name == 'power') brick.gid = 20;
            else if (brick.name == 'door') brick.gid = 15;
        }, this);
        
        this.createCoords(this.coords_brick, 40, 38, 98);
        
        this.map.setCollisionBetween(1, 12, true, 'Map');

        this.brick = this.add.group();
        this.brick.enableBody = true;
        this.brick.physicsBodyType = Phaser.Physics.ARCADE;

        this.specialties = this.add.group();
        this.specialties.enableBody = true;
        this.specialties.physicsBodyType = Phaser.Physics.ARCADE;

        this.sound_find_the_door = this.add.audio('find-the-door');
        this.sound_stage = this.add.audio('stage-theme');

        this.sound_stage.loopFull();
        
        this.stage.backgroundColor = '#1F8B00';
    
        this.layer = this.map.createLayer('Map');
        this.layer.resizeWorld();
        
        //this.map.setCollision([1, 2, 3, 5, 6, 7, 10, 11, 12], true);
        
        this.brick_position = [];
        this.map.createFromObjects('Objects', 10, 'brick', 0, true, true, this.brick, Phaser.Sprite, false);
        this.brick.callAll('animations.add', 'animations', 'wait', [0], 10, true);
        this.brick.callAll('animations.add', 'animations', 'destroy', [1, 2, 3, 4, 5, 6], 10, true);
        this.brick.callAll('animations.play', 'animations', 'wait');
        this.brick.forEach(function(brick) {
            brick.body.immovable = true;
            this.brick_position.push(Math.round(brick.body.x)+','+Math.round(brick.body.y));
        }, this);
        this.map.createFromObjects('Objects', 15, 'door', 0, true, true, this.specialties, Phaser.Sprite, false);
        this.map.createFromObjects('Objects', 20, 'power-1', 0, true, true, this.specialties, Phaser.Srpite, false);
        this.specialties.getByName('door').kill();
        this.specialties.getByName('power').kill();
    },
    
    createCharacter: function() {
        this.direction = '';
        this.hero = this.add.group();
        this.hero.enableBody = true;
        this.hero.physicsBodyType = Phaser.Physics.ARCADE;
        this.hero.createMultiple(1, 'bomberman-dead');
        
        var timer_lose = this.time.create(false);
        timer_lose.seconds = 0;
        
        timer_lose.loop(1000, function() {
            this.timers[0].seconds++;
            if (this.timers[0].seconds >= 4) {
                this.timers[0].seconds = 0;
                this.timers[0].stop(false);
                localStorage.lives--;
                localStorage.stage_points = 0;
                localStorage.time = 190;
                if (localStorage.lives >= 0) 
                    this.state.start('ChangeStage', true, false, 'restart');
                else
                    this.state.start('ChangeStage', true, false, 'game-over');
            }   
        }, this);
        
        this.timers.push(timer_lose);

        this.sound_lose = this.add.audio('lose');
        this.sound_just_died = this.add.audio('just-died');
        this.sound_power = this.add.audio('power');
        
        var bomberman = this.hero.create(45, 102, 'bomberman-move');
        bomberman.name = 'hero';
        bomberman.animations.add('right', [3, 4, 5], 10, true);
        bomberman.animations.add('left', [0, 1, 2], 10, true);
        bomberman.animations.add('up', [9, 10, 11], 10, true);
        bomberman.animations.add('down', [6, 7, 8], 10, true);
        bomberman.scale.setTo(1.9, 1.9);

        this.camera.follow(bomberman);
    },
    
    createControls: function() {
        this.directions = this.input.keyboard.createCursorKeys();
        this.put_bomb = this.input.keyboard.addKey(Phaser.Keyboard.X);
        this.exploit_bomb = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.save = this.input.keyboard.addKey(Phaser.Keyboard.S);
    },
    
    destroyCharacter: function() {
        var character = this.hero.getByName('hero');
        
        character.body.enable = false;
        character.kill();

        var death_animation = this.hero.getFirstExists(false);
        death_animation.reset(character.body.x, character.body.y);
        death_animation.scale.setTo(character.scale.x, character.scale.y);
        death_animation.animations.add('die');
        death_animation.animations.play('die', 8, false, true);

        this.timers[0].start(); 
        this.game.sound.stopAll();
        this.sound_lose.play();
        
        death_animation.events.onAnimationComplete.add(function() { 
            this.hero.remove(character);
            this.camera.follow(null);
            this.lose = true;
            this.sound_just_died.play();
        }, this);
    },
    
    moveCharacter: function() {
        
        var character = this.hero.getByName('hero');
    
        if (character != null) {

            character.body.velocity.x = 0;
            character.body.velocity.y = 0;

            if (this.directions.right.isDown) {
                character.body.velocity.x = 150;
                if (this.direction != 'right') {
                    character.animations.play('right');
                    this.direction = 'right';
                }
            } else
                if (this.directions.left.isDown) {
                    character.body.velocity.x = -150;
                    if (this.direction != 'left') {
                        character.animations.play('left');
                        this.direction = 'left';
                    }
                } else
                    if (this.directions.up.isDown) {
                        character.body.velocity.y = -150;
                        if (this.direction != 'up') {
                            character.animations.play('up');
                            this.direction = 'up';
                        }
                    } else
                        if (this.directions.down.isDown) {
                            character.body.velocity.y = 150;
                            if (this.direction != 'down') {
                                character.animations.play('down');
                                this.direction = 'down';
                            }
                        }  else 
                            if (this.direction != 'stop') {
                                character.animations.stop();
                                this.direction = 'stop';
                            }

            if (this.put_bomb.isDown) {
                this.putBomb(character);
            } else
                if (this.exploit_bomb.isDown) {
                    if (this.bombs.length > 0) 
                        this.exploitBomb(this.bombs.getFirstExists(), false);
                }
        }
    },
    
    Win: function() {
        this.game.sound.stopAll();
        
        if (localStorage.getItem('HightScore') < localStorage.stage_points) 
            localStorage.setItem('HightScore', localStorage.stage_points);
        
        this.sound_level_complete = this.add.audio('level-complete');
        this.sound_level_complete.play();
        this.timers[1].stop(false);
        this.hero.getByName('hero').body.moves = false;
        
        var timer_next_stage = this.time.create(false);
        timer_next_stage.seconds = 0;
        
        timer_next_stage.loop(1000, function() {
            this.timers[4].seconds++;
            if (this.timers[4].seconds > 5) {
                this.timers[4].stop();
                this.state.start('ChangeStage', true, false, 'next-stage');
            } 
        }, this);
        
        timer_next_stage.start();
        this.timers.push(timer_next_stage);
    },
    
    createStatistics: function() {
        this.text = this.add.group();
        
        var style = {
            font : '15px BitBold',
            fill: 'white',
            stroke: 'black',
            strokeThickness: 2.5
        };

        var timer_game = this.time.create(false);
        timer_game.name = 'TimerGame';
        timer_game.loop(1000, function() {
            localStorage.time--;
            if (localStorage.time < 0) {
                this.timers[1].stop(false);
                this.replaceEnemies('coin');
            } else
                this.text.getByName('TIME').setText('TIME: '+localStorage.time);
        }, this);
        
        this.timers.push(timer_game);
        
        localStorage.stage_points = localStorage.stage_points || 0;
        localStorage.lives = localStorage.lives || 3;
        
        var distance = 22,
            information;
        
        information  = this.add.text(distance, 22, 'TIME :'+localStorage.time, style);
        information.fixedToCamera = true;
        information.name = 'TIME';
        this.text.add(information);
        distance+= 170;
        
        information = this.add.text(distance, 22, localStorage.stage_points, style);
        information.fixedToCamera = true;
        information.name = 'SCORE';
        this.text.add(information);
        distance+= 128;
        
        information = this.add.text(distance, 22, 'LEFT: '+localStorage.lives, style);
        information.fixedToCamera = true;
        information.name = 'LEFT';
        this.text.add(information);

        timer_game.start();
    },
    
    createBomb: function() {
        this.bombs = this.add.group();
        this.bombs.enableBody = true;
        this.bombs.physicsBodyType = Phaser.Physics.ARCADE;

        var distance = 23;

        this.explosion_properties = [
            [0, 0, 'explosion-center'],
            [0, (distance * -1), 'explosion-upper-lenght'],
            [0, distance, 'explosion-lower-lenght'],
            [distance, 0, 'explosion-right-lenght'],
            [(distance * -1), 0, 'explosion-left-lenght']
        ];

        this.explosion_length_properties = [
            'explosion-extension-vertical',
            'explosion-extension-vertical',
            'explosion-extension-horizontal',
            'explosion-extension-horizontal'
        ];

        this.explosion_length = 0;
        this.amount_bombs = 1;
        this.sound_put_bomb = this.add.audio('put-bomb');
        this.sound_exploit_bomb = this.add.audio('explosion');
        
        var timer_put_bomb = this.game.time.create(false);  
        timer_put_bomb.seconds = 0;
        
        timer_put_bomb.loop(1000, function() {
            this.timers[2].seconds++;
            if (this.timers[2].seconds >= 5) {
                this.timers[2].seconds = 0;
                this.timers[2].stop(false);
            }
        }, this);
        
        var timer_exploit_bomb = this.game.time.create(false);
        timer_exploit_bomb.seconds = 0;
        
        timer_exploit_bomb.loop(1000, function() {
            this.timers[3].seconds++;
            if (this.timers[3].seconds >= 3) {
                this.timers[3].seconds = 0;
                this.timers[3].stop(false);
            }
        }, this);
        
        this.timers.push(timer_put_bomb, timer_exploit_bomb);
    },
    
    putBomb: function(character) {
        if (!this.timers[2].running && this.bombs.length < this.amount_bombs) {
            var newbomb = this.bombs.create(Math.round(character.body.x), Math.round(character.body.y), 'bomb');
            newbomb.animations.add('wait');
            newbomb.animations.play('wait', 3, true);
            newbomb.body.immovable = true;
            newbomb.scale.setTo(1.8, 1.8);
            this.sound_put_bomb.play();
            this.timers[2].start();
        }
    },
    
    exploitBomb: function(bomb, chain) {
        if (!this.timers[3].running || chain) {
            
            bomb.kill();
            
            this.explosion = this.add.group();
            this.explosion.enableBody = true;
            this.explosion.physicsBodyType = Phaser.Physics.ARCADE;
            
            for (var i = 0; i < this.explosion_properties.length; i++) {
                var x = bomb.body.x + this.explosion_properties[i][0],
                    y = bomb.body.y + this.explosion_properties[i][1];
                
                for (var j = 0, k = i - 1; j < this.explosion_length && i > 0; j++) {
                    var explosion_extension = this.explosion.create(x, y, this.explosion_length_properties[k]);
                    explosion_extension.scale.setTo(1.6, 1.6);
                    explosion_extension.animations.add('kaboom');
                    explosion_extension.animations.play('kaboom', 6, false, true);
                    x+=this.explosion_properties[i][0];
                    y+=this.explosion_properties[i][1];
                }
                
                var explosion_fragment = this.explosion.create(x, y, this.explosion_properties[i][2]);
                explosion_fragment.scale.setTo(1.6, 1.6);
                explosion_fragment.animations.add('kaboom');
                explosion_fragment.animations.play('kaboom', 6, false, true);
            }
            
            this.sound_exploit_bomb.play();
            this.bombs.remove(bomb);
            
            if (this.bombs.length > 0) 
                this.timers[5].start();
        }
    },
    
    createEnemies: function() {
        this.enemies = this.add.group();
        this.enemies.enableBody = true;
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE;
        this.number_enemies = 7;
        this.types = ['ballon', 30,
                      'snow', 40,
                      'cookie', 50,
                      'barrel', 40,
                      'water', 20,
                      'ghost', 25,
                      'bear', 50,
                      'coin', 80];

        this.sound_last_enemy = this.add.audio('last-enemy');
        
        for (var i = 0; i < this.number_enemies; i++)
            this.putEnemy('ballon', false);
    },
    
    putEnemy: function(type, replace, x, y) {
        
        var coords;
        
        if (x == undefined && y == undefined)
            coords = this.randomPosition();
        else
            coords = [x, y];

        var index = this.types.indexOf(type);

        if (index != -1) {
            
            var enemy = this.enemies.create(parseInt(coords[0]), parseInt(coords[1]), type); 
            
            if (this.checkOverlap(enemy)) {
                    
                this.enemies.remove(enemy);
                this.createEnemies(type, replace, x, y);  
                            
            } else {
                if (type == 'coin') {
                    enemy.animations.add('right', [0, 1, 2, 3, 4], 6, true);
                    enemy.animations.add('left', [7, 8, 9, 10, 11], 6, true);
                    enemy.animations.add('die', [this.rnd.integerInRange(5, 6)], 4, true);
                    enemy.animations.play('right');
                    enemy.physics = false;
                } else {
                    enemy.animations.add('right', [4, 5, 6], 4, true);
                    enemy.animations.add('left', [0, 1, 2], 4, true);
                    enemy.animations.add('die', [3], 4, true);
                    enemy.animations.play('right');
                    enemy.physics = true;
                }
                enemy.name = type;
                enemy.velocity = this.types[++index];
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
            enemy.events.onAnimationComplete.add(function() { this.enemies.remove(enemy); }, this);

        }, this);

        if (this.enemies.length == 1) this.sound_last_enemy.play();

        if (enemy.name == 'ballon') {
            localStorage.stage_points = (parseInt(localStorage.stage_points) + 50);
            this.text.getByName('SCORE').setText(localStorage.stage_points);
        }
    },
    
    replaceEnemies: function(type) {
        
        if (this.enemies.length == 0) {
            var positions = [];

            this.enemies.forEach(function(enemy) {
                positions.push([enemy.body.x, enemy.body.y]);
            }, this);

            this.enemies.destroy(true, true);

            positions.forEach(function(coords) {
                this.putEnemy('coin', true, coords[0], coords[1]);
            }, this);
        } else {
            for (var i = 0; i < this.number_enemies; i++)
                this.createEnemies('coin', true);
        }
    },
    
    randomPosition: function() {
        var coords = this.crossroads[(this.rnd.integerInRange(0, this.crossroads.length-1))].split(','),    
            character = this.hero.getByName('hero');                
            
        if (coords[0] == character.body.x && coords[1] == character.body.y) {
            return this.randomPosition();
        } else {
            return coords;
        }
    },
    
    checkOverlap: function(enemy) {
        if (this.brick_position.includes(enemy.body.x+','+enemy.body.y)) {
            return true;
        } else
            return false;
    },
    
    createAutonomy: function() {
        var distance = 40,
            rows = 11;
            cols = 35;
        
        this.crossroads = [];
        this.movements = [
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
        
        this.createCoords(this.crossroads, 40, 45, 102);
    },
    
    createCoords: function(array, distance, xi, yi) {
        var rows = 11,
            cols = 35;
        
        for (var i = 0, y = yi; i < rows; i++, y+=distance) 
            for (var j = 0, x = xi; j < cols; j++, x+=distance) 
                array.push(x+','+y);
    },
    
    activeMotionEnemy: function() {
        this.enemies.forEach(function(enemy) {
            if (enemy.autonomy) {
                if (enemy.name == 'ballon') {
                    var position = Math.round(enemy.body.x)+','+Math.round(enemy.body.y),
                        index = this.crossroads.indexOf(position);
                    if ((index != -1 && index % 2 == 0) || enemy.body.speed == 0) {
                        enemy.body.velocity.x = 0;
                        enemy.body.velocity.y = 0;
                        this.movements[this.rnd.integerInRange(0, (this.movements.length-1))](enemy);
                    }
                } else
                    if (enemy.name == 'coin') {                 

                        var character = this.hero.getByName('hero');

                        if (character != null) {

                            enemy.body.velocity.x = 0;
                            enemy.body.velocity.y = 0;

                            if (Math.round(character.body.x) > Math.round(enemy.body.x) && Math.round(character.body.y) != Math.round(enemy.body.y)) {
                                this.movements[0](enemy);
                            } else
                                if (Math.round(character.body.x) < Math.round(enemy.body.x) && Math.round(character.body.y) != Math.round(enemy.body.y)) {
                                    this.movements[1](enemy);
                                } else 
                                    if (Math.round(character.body.y) > Math.round(enemy.body.y) && Math.round(character.body.x) != Math.round(enemy.body.x)) {
                                        this.movements[2](enemy);
                                    } else
                                        if(Math.round(character.body.y) < Math.round(enemy.body.y) && Math.round(character.body.x) != Math.round(enemy.body.x)) {
                                            this.movements[3](enemy);
                                        } else 
                                            if (Math.round(character.body.x) == Math.round(enemy.body.x) && Math.round(character.body.y) != Math.round(enemy.body.y)) {
                                                if (Math.round(character.body.y) > Math.round(enemy.body.y)) 
                                                    this.movements[2](enemy);
                                                else
                                                    this.movements[3](enemy);
                                            } else
                                                if (Math.round(character.body.y) == Math.round(enemy.body.y) && Math.round(character.body.x) != Math.round(enemy.body.x)) {
                                                    if (Math.round(character.body.x) > Math.round(enemy.body.x)) 
                                                        this.movements[0](enemy);
                                                    else
                                                        this.movements[1](enemy);
                                                }
                        } else enemy.name = 'ballon';
                    }
            }
        }, this);
    }
}