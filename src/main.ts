import { AUTO, Game } from 'phaser';

import { Boot } from '@game/Boot';
import { Preloader } from '@game/Preloader';
import { MainMenu } from '@game/scenes/MainMenu';
import { ChangeStage } from '@game/scenes/ChangeStage';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 680,
  parent: 'bomberman-container',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: [Boot, Preloader, MainMenu, ChangeStage]
};

export default new Game(config);
