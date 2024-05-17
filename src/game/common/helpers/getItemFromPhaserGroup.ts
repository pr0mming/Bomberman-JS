import { GameObjects } from 'phaser';

const getItemFromPhaserGroup = <G extends GameObjects.GameObject>(
  group: G[],
  key: string
) => {
  const _label = group.find((obj) => obj.name === key);

  if (_label) {
    return _label;
  }

  return null;
};

export default getItemFromPhaserGroup;
