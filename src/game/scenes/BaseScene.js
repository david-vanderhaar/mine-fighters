import { Scene } from 'phaser';

export class BaseScene extends Scene {
  constructor(key) {
    super(key);
  }

  create() {
    // on enter key press, start next scene
    this.goToNextSceneOnEnter();      
  }

  goToNextSceneOnEnter() {
    this.input.keyboard.once('keydown-ENTER', () => {
      const currentSceneKey = this.scene.key;
      const currentIndex = SCENE_ORDER.indexOf(currentSceneKey);
      const nextIndex = (currentIndex + 1) % SCENE_ORDER.length;
      const nextSceneKey = SCENE_ORDER[nextIndex];

      this.scene.start(nextSceneKey);
    });
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
  // SCENE_KEYS.CHARACTER_PREVIEW,
  // SCENE_KEYS.CHARACTER_SELECT,
  SCENE_KEYS.BATTLE,
  SCENE_KEYS.MAIN_GAME,
  SCENE_KEYS.GAME_OVER
];