import { IExplosionFragment } from '@game/common/interfaces/IExplosionFragment';

const getExplosionData = (): IExplosionFragment[] => {
  // Visual distance bettween sprites (center of the explosion and the other fragments)
  const visualOffsetAxis = 33;

  // NOTE: This offset is used to check if a position (center, top, right, left and bottom) is occupied (by a bomb or even a explosion fragment)
  // You shouldn't modify this value unless you're doing changes in the tilemap
  const tileOffsetAxis = 40;

  return [
    {
      spriteXOffset: 0,
      spriteYOffset: 0,
      tileXOffset: 0,
      tileYOffset: 0,
      textureKey: 'explosion-center'
    },
    {
      spriteXOffset: 0,
      spriteYOffset: -visualOffsetAxis,
      tileXOffset: 0,
      tileYOffset: -tileOffsetAxis,
      textureKey: 'explosion-upper-lenght',
      textureKeyExtension: 'explosion-extension-vertical'
    },
    {
      spriteXOffset: 0,
      spriteYOffset: visualOffsetAxis,
      tileXOffset: 0,
      tileYOffset: tileOffsetAxis,
      textureKey: 'explosion-lower-lenght',
      textureKeyExtension: 'explosion-extension-vertical'
    },
    {
      spriteXOffset: visualOffsetAxis,
      spriteYOffset: 0,
      tileXOffset: tileOffsetAxis,
      tileYOffset: 0,
      textureKey: 'explosion-right-lenght',
      textureKeyExtension: 'explosion-extension-horizontal'
    },
    {
      spriteXOffset: -visualOffsetAxis,
      spriteYOffset: 0,
      tileXOffset: -tileOffsetAxis,
      tileYOffset: 0,
      textureKey: 'explosion-left-lenght',
      textureKeyExtension: 'explosion-extension-horizontal'
    }
  ];
};

export default getExplosionData;
