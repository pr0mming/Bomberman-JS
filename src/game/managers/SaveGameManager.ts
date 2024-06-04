import { Scene } from 'phaser';
import { IGameInitialStage } from '../common/interfaces/IGameInitialStage';
import { EnemyGroup } from '../sprites/enemy/EnemyGroup';
import { Player } from '../sprites/player/Player';
import { MapManager } from './MapManager';
import { IGameSaved } from '../common/interfaces/IGameSaved';
import { LOCAL_STORAGE_KEYS_ENUM } from '../common/enums/LocalStorageKeysEnum';
import { GameRulesControlManager } from './controls-manager/GameRulesControlManager';
import { GAME_STATUS_ENUM } from '../common/enums/GameStatusEnum';

interface SaveGameManagerProps {
  scene: Scene;
  gameStage: IGameInitialStage;
  player: Player;
  enemiesGroup: EnemyGroup;
  mapManager: MapManager;
}

export class SaveGameManager {
  private _scene: Scene;
  private _gameStage: IGameInitialStage;
  private _player: Player;
  private _enemiesGroup: EnemyGroup;
  private _mapManager: MapManager;

  private _controlsManager: GameRulesControlManager;

  constructor({
    scene,
    gameStage,
    player,
    enemiesGroup,
    mapManager
  }: SaveGameManagerProps) {
    this._scene = scene;
    this._gameStage = gameStage;
    this._player = player;
    this._enemiesGroup = enemiesGroup;
    this._mapManager = mapManager;

    this._controlsManager = new GameRulesControlManager(scene);
  }

  static getLoadedGame(): IGameSaved | null {
    const state = localStorage.getItem(LOCAL_STORAGE_KEYS_ENUM.SAVED_GAME);

    if (state) {
      return JSON.parse(state) as IGameSaved;
    }

    return null;
  }

  addControlsListener() {
    if (
      this._player.body?.enable &&
      this._controlsManager?.saveGameControl?.isDown
    ) {
      const tempText = this._scene.add
        .text(850, 22, 'SAVING GAME ...')
        .setFontFamily('"BitBold", "Tahoma"')
        .setFontSize(15)
        .setColor('white')
        .setStroke('black', 2.5)
        .setScrollFactor(0, 0);

      this._scene.time.addEvent({
        delay: 2000,
        callback: () => tempText.destroy(true),
        callbackScope: this
      });

      this._saveGame();
    }
  }

  private _saveGame() {
    const gameStage = { ...this._gameStage };

    gameStage.status = GAME_STATUS_ENUM.LOADED_GAME;

    const savedGame: IGameSaved = {
      gameStage: gameStage,
      player: this._player.getSavedState(),
      enemies: this._enemiesGroup.getSavedState(),
      map: this._mapManager.getSavedState()
    };

    localStorage.setItem(
      LOCAL_STORAGE_KEYS_ENUM.SAVED_GAME,
      JSON.stringify(savedGame)
    );
  }
}
