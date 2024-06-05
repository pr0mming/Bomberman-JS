import { Scene } from 'phaser';

// Interfaces
import { IGameInitialStage } from '@game/common/interfaces/IGameInitialStage';
import { IGameSaved } from '@game/common/interfaces/IGameSaved';

// Sprites
import { EnemyGroup } from '@game/sprites/enemy/EnemyGroup';
import { Player } from '@game/sprites/player/Player';

// Managers
import { MapManager } from '@game/managers/MapManager';
import { GameRulesControlManager } from '@game/managers/controls-manager/GameRulesControlManager';

// Enums
import { LOCAL_STORAGE_KEYS_ENUM } from '@game/common/enums/LocalStorageKeysEnum';
import { GAME_STATUS_ENUM } from '@game/common/enums/GameStatusEnum';

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

  /**
   * This method is static to allow be executed from any scene (like MainMenu) and get the last saved game instance
   * @returns instance of saved game
   */
  static getLoadedGame(): IGameSaved | null {
    const state = localStorage.getItem(LOCAL_STORAGE_KEYS_ENUM.SAVED_GAME);

    if (state) {
      return JSON.parse(state) as IGameSaved;
    }

    return null;
  }

  addControlsListener() {
    // If the player is dead this feature is disabled
    if (
      this._player.body?.enable &&
      this._controlsManager?.saveGameControl?.isDown
    ) {
      // Add little label ...
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

  /**
   * This method gather the necessary elements of the game to save in local storage
   */
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
