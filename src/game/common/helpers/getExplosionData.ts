import { IExplosionFragment } from '../interfaces/IExplosionFragment';

const getExplosionData = (): IExplosionFragment[] => {
  const offsetAxis = 23;

  return [
    {
      x: 0,
      y: 0,
      textureKey: 'explosion-center'
    },
    {
      x: 0,
      y: -offsetAxis,
      textureKey: 'explosion-upper-lenght',
      textureKeyExtension: 'explosion-extension-vertical'
    },
    {
      x: 0,
      y: offsetAxis,
      textureKey: 'explosion-lower-lenght',
      textureKeyExtension: 'explosion-extension-vertical'
    },
    {
      x: offsetAxis,
      y: 0,
      textureKey: 'explosion-right-lenght',
      textureKeyExtension: 'explosion-extension-horizontal'
    },
    {
      x: -offsetAxis,
      y: 0,
      textureKey: 'explosion-left-lenght',
      textureKeyExtension: 'explosion-extension-horizontal'
    }
  ];
};

export default getExplosionData;
