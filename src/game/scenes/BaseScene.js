import { Scene } from 'phaser';

export class BaseScene extends Scene {
  constructor(key) {
    super(key);
  }

  create() {
    // on enter key press, start next scene
    this.input.keyboard.once('keydown-ENTER', () => {
      this.goToNextSceneOnEnter();      
    });

    // add button to go to next scene for touch devices
    const width = (this.scale && this.scale.width) || (this.cameras && this.cameras.main && this.cameras.main.width) || 800;
    const height = (this.scale && this.scale.height) || (this.cameras && this.cameras.main && this.cameras.main.height) || 600;
    const nextButton = this.add.text(width / 2, 100, 'Next', { fontSize: '16px', color: '#ffffff' })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.goToNextSceneOnEnter());

    // keep button on top and fixed to camera if needed
    try {
      nextButton.setDepth(1000);
      nextButton.setScrollFactor(0);
    } catch (e) {
      // some Phaser builds may not support setScrollFactor on text; ignore
    }
  }

  goToNextSceneOnEnter() {
    const currentSceneKey = this.scene.key;
    const currentIndex = SCENE_ORDER.indexOf(currentSceneKey);
    const nextIndex = (currentIndex + 1) % SCENE_ORDER.length;
    const nextSceneKey = SCENE_ORDER[nextIndex];

    this.scene.start(nextSceneKey);
  }
}



const SCENE_KEYS = {
  BOOT: 'Boot',
  PRELOADER: 'Preloader',
  MAIN_MENU: 'MainMenu',
  CHARACTER_PREVIEW: 'CharacterPreview',
  CHARACTER_SELECT: 'CharacterSelect',
  BATTLE: 'Battle',
  MAIN_GAME: 'Game',
  GAME_OVER: 'GameOver'
};

const SCENE_ORDER = [
  SCENE_KEYS.MAIN_MENU,
  SCENE_KEYS.CHARACTER_PREVIEW,
  SCENE_KEYS.CHARACTER_SELECT,
  SCENE_KEYS.BATTLE,
  SCENE_KEYS.MAIN_GAME,
  SCENE_KEYS.GAME_OVER
];