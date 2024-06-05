import { Physics, Scene, Types } from 'phaser';

// Sprites
import { ExplosionFragment } from '@game/sprites/explosion/ExplosionFragment';

// Interfaces
import { IExplosionFragment } from '@game/common/interfaces/IExplosionFragment';

// Managers
import { WallBuilderManager } from '@game/managers/WallBuilderManager';

// Helpers
import getExplosionData from '@game/common/helpers/getExplosionData';

interface IExplosionGroupProps {
  world: Physics.Arcade.World;
  scene: Scene;
  wallBuilderManager: WallBuilderManager;
}

interface IExprosionSpriteProps {
  spriteX: number;
  spriteY: number;
  tileX: number;
  tileY: number;
}

/**
 * This class orchestrate everything related to the explosion or chain explosion
 */
export class ExplosionGroup extends Physics.Arcade.Group {
  private _explosionLength: number;
  private _explosionProperties: IExplosionFragment[];

  private _wallBuilderManager: WallBuilderManager;

  constructor({ world, scene, wallBuilderManager }: IExplosionGroupProps) {
    super(world, scene);

    this.classType = ExplosionFragment;

    // PowerUp
    this._explosionLength = 0;
    this._explosionProperties = getExplosionData();

    this._wallBuilderManager = wallBuilderManager;

    this._setUpAnimations();
  }

  private _setUpAnimations() {
    // This loop creates the animations for the most basic explosion
    for (const explosionAnim of this._explosionProperties) {
      const frames = this.scene.anims.generateFrameNumbers(
        explosionAnim.textureKey
      );
      this._createAnimationByData(explosionAnim.textureKey, frames);
    }

    // Workaround: create the animation for the extensions of the explosions, use a Set to avoid duplicates and
    const explosionExtensions = new Set(
      this._explosionProperties
        .filter((item) => item.textureKeyExtension !== undefined)
        .map((item) => item.textureKeyExtension ?? '')
    );

    for (const explosionAnim of explosionExtensions) {
      const frames = this.scene.anims.generateFrameNumbers(explosionAnim);
      this._createAnimationByData(explosionAnim, frames);
    }
  }

  private _createAnimationByData(
    animationKey: string,
    frames: Types.Animations.AnimationFrame[]
  ) {
    if (!this.scene.anims.exists(animationKey))
      this.scene.anims.create({
        key: animationKey,
        frames: frames,
        frameRate: 12,
        yoyo: true
      });
  }

  /**
   * This method put a explosion on the position X, Y
   * @param bombX position in axis X
   * @param bombY position in axis Y
   */
  addNewExplosion(bombX: number, bombY: number) {
    // First, iterate the basic elements of the explosion: center, top, right, left and bottom
    for (const explosionData of this._explosionProperties) {
      // Sum or minus the offsets, according to the type of fragment (for example, the center should be zero because it's the origin of the explosion)
      const spriteX = bombX + explosionData.spriteXOffset;
      const spriteY = bombY + explosionData.spriteYOffset;

      const tileX = bombX + explosionData.tileXOffset;
      const tileY = bombY + explosionData.tileYOffset;

      const explosionProps = {
        spriteX,
        spriteY,
        tileX,
        tileY
      };

      // This line will put the explosion extension until detects a busy position
      const canAddFinalExtension = this._addExplosionExtension(
        explosionProps,
        explosionData
      );

      if (canAddFinalExtension) {
        const isOrigin =
          explosionData.tileXOffset === 0 && explosionData.tileYOffset === 0;

        this._addExplosionSprite(
          explosionProps,
          explosionData.textureKey,
          isOrigin
        );
      }
    }

    this.scene.sound.play('explosion');
  }

  /**
   * This method put a extension of explosion according to the type of fragment
   * @param explosionProps data with initial position to put the sprites
   * @param explosionData data with offsets
   * @returns true if there isn't any collision or overlap with soft walls/map, otherwise will be false
   */
  private _addExplosionExtension(
    explosionProps: IExprosionSpriteProps,
    explosionData: IExplosionFragment
  ): boolean {
    // Validation for the center of the explosion
    if (explosionData.textureKeyExtension) {
      for (let i = 0; i < this._explosionLength; i++) {
        // Add sprite
        const canContinue = this._addExplosionSprite(
          explosionProps,
          explosionData.textureKeyExtension,
          false
        );

        // Collision or overlap detected, then cut it off!
        if (!canContinue) {
          return false;
        }

        // Otherwise continue ...
        explosionProps.spriteX += explosionData.spriteXOffset;
        explosionProps.spriteY += explosionData.spriteYOffset;

        explosionProps.tileX += explosionData.tileXOffset;
        explosionProps.tileY += explosionData.tileYOffset;
      }
    }

    return true;
  }

  private _addExplosionSprite(
    explosionProps: IExprosionSpriteProps,
    textureKey: string,
    isOrigin: boolean
  ) {
    let isBusyPosition = this._isBusyPosition(explosionProps);

    // Exception: It's for the center of the explosion, normally the center is occupied by the own bomb
    if (isOrigin) {
      isBusyPosition = false;
    }

    const gameObject = new ExplosionFragment({
      scene: this.scene,
      x: explosionProps.spriteX,
      y: explosionProps.spriteY,
      textureKey,
      isVisible: !isBusyPosition // Magic: it will destroy a near wall (but the sprite isn't visible)
    });

    this.add(gameObject, true);

    return !isBusyPosition;
  }

  /**
   * This method detect if the given position X, Y is occupied by a soft wall or a bomb
   * If the position isn't found so it's a position of the map layer (is busy)
   * @param explosionProps position X, Y to evaluate
   * @returns true if is occupied
   */
  private _isBusyPosition(explosionProps: IExprosionSpriteProps): boolean {
    const isPositionFree = this._wallBuilderManager.isPositionFree(
      explosionProps.tileX,
      explosionProps.tileY
    );

    return !isPositionFree;
  }

  public get explosionLength() {
    return this._explosionLength;
  }

  public set explosionLength(v: number) {
    this._explosionLength = v;
  }
}
