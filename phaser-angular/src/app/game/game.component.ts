import { Component, OnInit } from '@angular/core';

import Phaser from 'phaser';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  constructor() {
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: [MainScene, SettingsMenu],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 100 }
        }
      }
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }
}

class MainScene extends Phaser.Scene {
  gameSettings: any;
  defaultSettings: any = [
    { setting: 'music', value: true },
    { setting: 'sfx', value: true }
  ];

  constructor() {
    super({ key: 'main' });
  }

  preload() {
    this.load.image('gradient', '../../assets/gradient.png');
    this.load.image('button', '../../assets/green_button02.png');
    this.load.image('button_pressed', '../../assets/green_button03.png');
    this.load.audio('buttonSound', '../../assets/switch33.wav');
    this.load.audio('backgroundMusic', '../../assets/Alexander Ehlers - Twists.mp3');
  }

  create() {
    this.gameSettings = JSON.parse(localStorage.getItem('myGameSettings'));
    if (this.gameSettings === null || this.gameSettings.length <= 0) {
      localStorage.setItem('myGameSettings', JSON.stringify(this.defaultSettings));
      this.gameSettings = this.defaultSettings;
    }

    this.add.image(0, 0, 'gradient');
    const settingsButton = new Button(this, 100, 100, '#000', 'button', 'button_pressed', 'Settings', 'navigation', 'settings', 'settings');

    const music = this.sound.add('backgroundMusic', {
      mute: false,
      volume: 1,
      rate: 1,
      loop: true,
      delay: 200
    });

    if (this.gameSettings[0].value) {
      music.play();
    }
  }

  playButtonSound() {
    if (this.gameSettings[1].value) {
      this.sound.play('buttonSound');
    }
  }
}

class SettingsMenu extends Phaser.Scene {
  gameSettings: any;

  constructor() {
    super({ key: 'settings' });
  }
  create() {
    this.gameSettings = JSON.parse(localStorage.getItem('myGameSettings'));

    this.add.text(250, 40, 'Settings', {
      fontSize: '56px', color: '#ffffff'
    });

    this.add.text(200, 220, 'Sound Effects',
      { fontSize: '28px', color: '#ffffff' });
    // tslint:disable-next-line:max-line-length
    const soundFxButton = new Button(this, 300, 115, '#000', 'button', 'button_pressed', this.gameSettings[1].value === true ? 'On' : 'Off', 'toggle', 'sfx');

    this.add.text(200, 350, 'Music',
      { fontSize: '28px', color: '#ffffff' });

    // tslint:disable-next-line:max-line-length
    const musicButton = new Button(this, 300, 180, '#000', 'button', 'button_pressed', this.gameSettings[0].value === true ? 'On' : 'Off', 'toggle', 'music');

    const backButton = new Button(this, 180, 230, '#000', 'button', 'button_pressed', 'Back', 'navigation', 'back', 'main');
  }

  playButtonSound() {
    if (this.gameSettings[1].value) {
      this.sound.play('buttonSound');
    }
  }

  toggleItem(button, text) {
    if (button.name === 'sfx') {
      this.gameSettings[1].value = text === 'On' ? true : false;
    } else if (button.name === 'music') {
      this.gameSettings[0].value = text === 'On' ? true : false;
    }
    localStorage.setItem('myGameSettings',
      JSON.stringify(this.gameSettings));
  }
}

class Button extends Phaser.GameObjects.Container {
  targetScene: any;
  currentText: any;

  constructor(scene, x, y, fontColor, key1, key2, text, type, name, targetScene?) {
    super(scene);

    this.scene = scene;
    this.x = x;
    this.y = y;
    this.name = name;

    if (type === 'navigation') {
      this.targetScene = targetScene;
    } else if (type === 'toggle') {
      this.currentText = text;
    }

    const button = this.scene.add.image(x, y, key1).setInteractive();
    // tslint:disable-next-line:prefer-const
    let buttonText = this.scene.add.text(x, y, text, {
      fontSize: '28px', color: fontColor
    });
    Phaser.Display.Align.In.Center(buttonText, button);
    this.add(button);
    this.add(buttonText);
    button.on('pointerdown', () => {
      button.setTexture(key2);
      scene.playButtonSound();
    });
    button.on('pointerup', () => {
      button.setTexture(key1);
      if (this.targetScene) {
        setTimeout(() => {
          this.scene.scene.launch(targetScene);
          this.scene.scene.stop(scene);
        }, 300);
      } else if (this.currentText) {
        buttonText.text = buttonText.text === 'On' ? 'Off' : 'On';
        scene.toggleItem(this, buttonText.text);
      }
    });
    this.scene.add.existing(this);
  }
}
