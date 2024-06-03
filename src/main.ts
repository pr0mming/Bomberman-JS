import { AUTO, Game } from 'phaser';

import { Boot } from '@game/Boot';
import { Preloader } from '@game/Preloader';
import { MainMenu } from '@game/scenes/MainMenu';
import { ChangeStage } from '@game/scenes/ChangeStage';
import { Game as BombermanGame } from '@game/scenes/Game';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1024,
  height: 580,
  parent: 'bomberman-container',
  backgroundColor: '#000000',
  antialias: true,
  physics: {
    default: 'arcade'
    //arcade: { debug: true }
  },
  scene: [Boot, Preloader, MainMenu, ChangeStage, BombermanGame]
};

export default new Game(config);
