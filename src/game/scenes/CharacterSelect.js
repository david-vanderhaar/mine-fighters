import { BaseScene } from './BaseScene.js';

export class CharacterSelect extends BaseScene {
  constructor() {
    super('CharacterSelect');
  }

  create() {
    super.create();
    this.cameras.main.setBackgroundColor('#3b3b44');


    this.add.text(this.cameras.main.width/2, 20, 'Character Select', {
      fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);

    // x1 is 1/4 width, x2 is 3/4 width
    const x1 = this.cameras.main.width / 4;
    const x2 = (this.cameras.main.width / 4) * 3;
    this.createPlayerSelectedPortaitBox(x1, 184, '#ffffff', 0x18181b, 'Player 1');
    this.createPlayerSelectedPortaitBox(x2, 184, '#ffffff', 0x18181b, 'Player 2');

    // 5 selectable character portraits
    // 2 rows of portraits
    // first row has steve, zombie
    // second row has piglin, drowned, golem
    // evenly space them out, center on the screen
    const startY = 450;
    const gapY = 175;
    const gapX = 250;
    const centerX = this.cameras.main.width / 2;
    this.createSelectableCharacterPortrait(centerX - gapX + 75, startY, 'steve');
    this.createSelectableCharacterPortrait(centerX + gapX - 75, startY, 'zombie');
    this.createSelectableCharacterPortrait(centerX - gapX, startY + gapY, 'piglin');
    this.createSelectableCharacterPortrait(centerX, startY + gapY, 'drowned');
    this.createSelectableCharacterPortrait(centerX + gapX, startY + gapY, 'golem');
  }

  createPlayerSelectedPortaitBox(x, y, color, borderColor, text) {
    this.add.rectangle(x, y, 250, 200, `${borderColor}`).setOrigin(0.5);

    this.add.text(x, y + 120, text, {
      fontFamily: 'Arial', fontSize: 24, color: color,
      stroke: '#000000', strokeThickness: 1,
      align: 'center'
    }).setOrigin(0.5);
  }

  createSelectableCharacterPortrait(x, y, characterKey) {
    // Portrait background
    this.add.rectangle(x, y, 150, 150, 0x18181b).setOrigin(0.5);
    // Portrait image
    this.add.image(x, y, characterKey).setOrigin(0.5).setScale(3);
  }
}
