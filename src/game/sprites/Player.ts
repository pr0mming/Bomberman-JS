import { Animations, Physics, Scene } from 'phaser';
import { PLAYER_DIRECTION_ENUM } from '@game/common/enums/PlayerDirectionEnum';
import PlayerControlsManager from '@game/managers/PlayerControlsManager';
import BombGroup from './bomb/BombGroup';

interface IPlayerProps {
  scene: Scene;
  x: number;
  y: number;
  speed: number;
  bombGroup: BombGroup;
}

export class Player extends Physics.Arcade.Sprite {
  private _controlsManager?: PlayerControlsManager;
  private _bombGroup: BombGroup;
  private _speed: number;
  private _direction: string = '';

  constructor({ scene, x, y, speed, bombGroup }: IPlayerProps) {
    super(scene, x, y, 'bomberman-move');

    this._speed = speed;
    this._bombGroup = bombGroup;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2.0);
    this.setSize(this.width - 5, this.height - 2);

    this._setUpAnimations();
    this._setUpControls();

    this.scene.cameras.main.startFollow(this);
  }

  // Play animation or frame by movement (left, right, up, down)
  private _playAnimationByKey(key: string) {
    if (this._direction != key) {
      this.play(key);
      this._direction = key;

      return;
    }

    if (!this.anims.isPlaying) this.anims.nextFrame();
  }

  // Prepare keys to move the player
  private _setUpControls() {
    this._controlsManager = new PlayerControlsManager(this.scene);
  }

  // Prepare all the animations for the player
  private _setUpAnimations() {
    this.anims.create({
      key: PLAYER_DIRECTION_ENUM.LEFT,
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [0, 1, 2]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: PLAYER_DIRECTION_ENUM.RIGH,
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [3, 4, 5]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: PLAYER_DIRECTION_ENUM.DOWN,
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [6, 7, 8]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: PLAYER_DIRECTION_ENUM.UP,
      frames: this.anims.generateFrameNumbers('bomberman-move', {
        frames: [9, 10, 11]
      }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNumbers('bomberman-dead'),
      frameRate: 8
    });
  }

  addControlsListener() {
    if (!this.body?.immovable) {
      this.setVelocity(0);

      // Set up cursor keys to move the player on the "update" function of the Scene
      if (this._controlsManager?.cursorKeys?.right.isDown) {
        this.setVelocityX(this._speed);
        this._playAnimationByKey(PLAYER_DIRECTION_ENUM.RIGH);

        return;
      }

      if (this._controlsManager?.cursorKeys?.left.isDown) {
        this.setVelocityX(-this._speed);
        this._playAnimationByKey(PLAYER_DIRECTION_ENUM.LEFT);

        return;
      }

      if (this._controlsManager?.cursorKeys?.up.isDown) {
        this.setVelocityY(-this._speed);
        this._playAnimationByKey(PLAYER_DIRECTION_ENUM.UP);

        return;
      }

      if (this._controlsManager?.cursorKeys?.down.isDown) {
        this.setVelocityY(this._speed);
        this._playAnimationByKey(PLAYER_DIRECTION_ENUM.DOWN);

        return;
      }

      // Set up put bomb control
      if (this._controlsManager?.putBombControl?.isDown) {
        this._bombGroup.putBomb(this.x, this.y);
      }

      // Set up exploit bomb control
      if (this._controlsManager?.exploitBombControl?.isDown) {
        this._bombGroup.exploitBomb();
      }

      // Stop current animation to avoid infinite loop ("walking")
      if (this._direction != PLAYER_DIRECTION_ENUM.IDLE) {
        this.stop();
        this._direction = PLAYER_DIRECTION_ENUM.IDLE;
      }
    }
  }

  // Destroy player with "style" of the scene
  kill() {
    // Stop motion!
    this.setVelocity(0);

    // Disable events from colliders or overlaps
    this.disableBody(false);

    // Fix player to screen and also disable control keys
    this.setImmovable(true);

    this.scene.game.sound.stopAll();
    this.scene.sound.play('lose');

    this.play({
      key: 'die',
      hideOnComplete: true
    }).on(
      Animations.Events.ANIMATION_COMPLETE,
      () => {
        this.scene.sound.play('just-died');
      },
      this
    );
  }
}
