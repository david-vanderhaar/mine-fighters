import { BaseScene } from './BaseScene.js';

export class CharacterSelect extends BaseScene
{
    constructor ()
    {
        super('CharacterSelect');
    }

    create ()
    {
        super.create();
        this.cameras.main.setBackgroundColor(0x00ff00);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(512, 384, 'Character Select', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // on enter key press, start main game
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('MainGame');
        });
    }
}
