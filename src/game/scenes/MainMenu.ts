import { IBombermanStage } from '@game/common/IBombermanStage';
import { Scene, VERSION } from 'phaser';

/**
 * The menu screen to choose any option to start the game
 */
export class MainMenu extends Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    // Change backgound color to black
    this.cameras.main.backgroundColor =
      Phaser.Display.Color.HexStringToColor('#000000');

    // Add a serie of images and texts with different locations (X, Y) and styles
    this.add
      .sprite(
        this.cameras.main.centerX,
        this.cameras.main.centerY - 50,
        'menu-title'
      )
      .setOrigin(0.5)
      .setScale(2.5);

    const start = this.add
      .text(
        this.cameras.main.centerX - 180,
        this.cameras.main.centerY + 160,
        'START'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(20)
      .setColor('white')
      .setStroke('black', 2.5);

    // Event to start a new game
    start.on(
      Phaser.Input.Events.POINTER_DOWN,
      () => {
        this.sound.stopAll();

        const stageBomberman: IBombermanStage = {
          stage: 1,
          lives: 3,
          points: 0,
          time: 190,
          status: 'start',
          stage_enemies: [
            ['ballon'],
            ['ballon', 'snow'],
            ['snow', 'cookie'],
            ['cookie', 'ghost'],
            ['barrel', 'bear']
          ]
        };

        this.scene.start('ChangeStage', stageBomberman);
      },
      this
    );

    // New feature
    this.add
      .text(
        this.cameras.main.centerX + 90,
        this.cameras.main.centerY + 160,
        'CONTINUE'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(20)
      .setColor('white')
      .setStroke('black', 2.5);

    //continueGame.events.onInputDown.add(function () {}, this);

    this.add
      .text(
        this.cameras.main.centerX - 180,
        this.cameras.main.centerY + 190,
        'TOP'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(20)
      .setColor('white')
      .setStroke('black', 2.5);

    // Show highest score
    const highScore = localStorage.getItem('HightScore') ?? 0;

    this.add
      .text(
        this.cameras.main.centerX + 90,
        this.cameras.main.centerY + 190,
        highScore.toString()
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(20)
      .setColor('white')
      .setStroke('black', 2.5);

    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 260,
        `This little game was born as an inspiration \n to learn about the awesome universe of the Web Game Development`
      )
      .setOrigin(0.5)
      .setAlign('center')
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(12)
      .setColor('white')
      .setStroke('black', 2.5);

    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY + 290,
        `Phaser ${VERSION} ❤️`
      )
      .setOrigin(0.5)
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(13)
      .setColor('#bdbd16')
      .setStroke('#8e001c', 2.5);

    this.sound.play('menu-audio', { loop: true, volume: 0.5 });
  }
}
