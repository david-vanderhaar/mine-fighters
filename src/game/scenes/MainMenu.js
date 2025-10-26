import { BaseScene } from './BaseScene.js';

export class MainMenu extends BaseScene {
  constructor() {
    super('MainMenu');
  }

  create() {
    super.create();

    this.add.image(512, 384, 'background');

    this.add.image(512, 300, 'logo');

    this.add.text(512, 560, 'Press to Start', {
      fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);
  }
}
