import { Input, Scene, Types } from 'phaser';

class PlayerControlsManager {
  private _cursorKeys?: Types.Input.Keyboard.CursorKeys;
  private _putBombControl?: Input.Keyboard.Key;
  private _exploitBombControl?: Input.Keyboard.Key;

  constructor(scene: Scene) {
    this._setUpControls(scene);
  }

  private _setUpControls(scene: Scene) {
    if (scene.input.keyboard) {
      this._cursorKeys = scene.input.keyboard.createCursorKeys();

      this._putBombControl = scene.input.keyboard.addKey(
        Input.Keyboard.KeyCodes.X
      );
      this._exploitBombControl = scene.input.keyboard.addKey(
        Input.Keyboard.KeyCodes.SPACE
      );
    }
  }

  public get cursorKeys() {
    return this._cursorKeys;
  }

  public get putBombControl() {
    return this._putBombControl;
  }

  public get exploitBombControl() {
    return this._exploitBombControl;
  }
}

export default PlayerControlsManager;
