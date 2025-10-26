import { BaseScene } from './BaseScene.js';

export class Boot extends BaseScene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/title_bg.png');
    }

    create ()
    {
        this.scene.start('Preloader');
    }
}
