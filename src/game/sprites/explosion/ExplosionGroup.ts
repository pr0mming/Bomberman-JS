import { Physics, Scene } from 'phaser';

// Sprites
import { ExplosionFragment } from '@game/sprites/explosion/ExplosionFragment';

// Interfaces
import { IExplosionFragment } from '@game/common/interfaces/IExplosionFragment';

// Helpers
import getExplosionData from '@game/common/helpers/getExplosionData';
import { WallBuilderManager } from '@src/game/managers/WallBuilderManager';

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

export class ExplosionGroup extends Physics.Arcade.Group {
  private _explosionLength: number;
  private _explosionProperties: IExplosionFragment[];

  private _wallBuilderManager: WallBuilderManager;

  constructor({ world, scene, wallBuilderManager }: IExplosionGroupProps) {
    super(world, scene);

    this.classType = ExplosionFragment;

    this._explosionLength = 0;
    this._explosionProperties = getExplosionData();

    this._wallBuilderManager = wallBuilderManager;

    this._setUpAnimations();
  }

  private _setUpAnimations() {
    for (const explosionAnim of this._explosionProperties) {
      this.scene.anims.create({
        key: explosionAnim.textureKey,
        frames: this.scene.anims.generateFrameNumbers(explosionAnim.textureKey),
        frameRate: 12,
        yoyo: true
      });
    }

    const explosionExtensions = new Set(
      this._explosionProperties
        .filter((item) => item.textureKeyExtension !== undefined)
        .map((item) => item.textureKeyExtension ?? '')
    );

    for (const explosionAnim of explosionExtensions) {
      this.scene.anims.create({
        key: explosionAnim,
        frames: this.scene.anims.generateFrameNumbers(explosionAnim),
        frameRate: 12,
        yoyo: true
      });
    }
  }

  addNewExplosion(bombX: number, bombY: number) {
    for (const explosionData of this._explosionProperties) {
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

  private _addExplosionExtension(
    explosionProps: IExprosionSpriteProps,
    explosionData: IExplosionFragment
  ): boolean {
    if (explosionData.textureKeyExtension) {
      for (let i = 0; i < this._explosionLength; i++) {
        const canContinue = this._addExplosionSprite(
          explosionProps,
          explosionData.textureKeyExtension,
          false
        );

        if (!canContinue) {
          return false;
        }

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

    if (isOrigin) {
      isBusyPosition = false;
    }

    const gameObject = new ExplosionFragment({
      scene: this.scene,
      x: explosionProps.spriteX,
      y: explosionProps.spriteY,
      textureKey,
      isVisible: !isBusyPosition
    });

    this.add(gameObject, true);

    return !isBusyPosition;
  }

  private _isBusyPosition(explosionProps: IExprosionSpriteProps) {
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
