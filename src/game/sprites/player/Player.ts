import { Animations, Physics, Scene } from 'phaser';

// Sprites
import BombGroup from '@game/sprites/bomb/BombGroup';

// Helpers
import PlayerControlsManager from '@game/managers/PlayerControlsManager';

// Enums
import { PLAYER_DIRECTION_ENUM } from '@game/common/enums/PlayerDirectionEnum';
import { ISpritePosition } from '@src/game/common/interfaces/ISpritePosition';

interface IPlayerProps {
  scene: Scene;
  x: number;
  y: number;
  bombGroup: BombGroup;
}

export class Player extends Physics.Arcade.Sprite {
  private _controlsManager?: PlayerControlsManager;
  private _direction: PLAYER_DIRECTION_ENUM;

  private _speed: number;
  private _hasWallPassPowerUp: boolean;
  private _hasBombPassPowerUp: boolean;
  private _hasFlamePassPowerUp: boolean;

  private _bombGroup: BombGroup;

  private _lastTilePassedPosition: ISpritePosition;

  constructor({ scene, x, y, bombGroup }: IPlayerProps) {
    super(scene, x, y, 'bomberman-move');

    this._direction = PLAYER_DIRECTION_ENUM.LEFT;

    this._speed = 150;
    this._hasWallPassPowerUp = false;
    this._hasBombPassPowerUp = false;
    this._hasFlamePassPowerUp = false;

    this._bombGroup = bombGroup;

    this._lastTilePassedPosition = { x, y };

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(2.0);
    this.setBodySize(this.width - 5, this.height);

    this._setUpControls();
    this._setUpAnimations();

    // The camera follows always the player in the map
    this.scene.cameras.main.startFollow(this);
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

  // Play animation or frame by movement (left, right, up, down)
  private _playAnimationByKey(key: PLAYER_DIRECTION_ENUM) {
    if (this._direction != key) {
      this.play(key);
      this._direction = key;

      return;
    }

    if (!this.anims.isPlaying) this.anims.nextFrame();
  }

  addControlsListener() {
    if (this.body?.enable) {
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
        this._bombGroup.putBomb(
          this._lastTilePassedPosition.x,
          this._lastTilePassedPosition.y
        );
      }

      // Set up exploit bomb control
      if (this._controlsManager?.exploitBombControl?.isDown) {
        this._bombGroup.exploitNextBomb();
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

  validateTileOverlap(tile: Physics.Arcade.Image) {
    if (tile.body && this.body) {
      const playerCenterX = Math.round(this.body.center.x);
      const playerCenterY = Math.round(this.body.center.y);
      const tileCenterX = Math.floor(tile.body.center.x);
      const tileCenterY = Math.floor(tile.body.center.y);

      const deltaX = Math.abs(playerCenterX - tileCenterX);
      const deltaY = Math.abs(playerCenterY - tileCenterY);

      return deltaX <= 5 && deltaY <= 5;
    }

    return false;
  }

  public get speed() {
    return this._speed;
  }

  public set speed(v: number) {
    this._speed = v;
  }

  public get hasWallPassPowerUp() {
    return this._hasWallPassPowerUp;
  }

  public set hasWallPassPowerUp(v: boolean) {
    this._hasWallPassPowerUp = v;
  }

  public get hasBombPassPowerUp() {
    return this._hasBombPassPowerUp;
  }

  public set hasBombPassPowerUp(v: boolean) {
    this._hasBombPassPowerUp = v;
  }

  public get hasFlamePassPowerUp() {
    return this._hasFlamePassPowerUp;
  }

  public set hasFlamePassPowerUp(v: boolean) {
    this._hasFlamePassPowerUp = v;
  }

  public get lastTilePassedPosition() {
    return this._lastTilePassedPosition;
  }

  public set lastTilePassedPosition(v: ISpritePosition) {
    this._lastTilePassedPosition = v;
  }
}
