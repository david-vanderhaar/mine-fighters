import { Boot } from './scenes/Boot';
import { CharacterPreview } from './scenes/CharacterPreview';
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import { CharacterSelect } from './scenes/CharacterSelect';
import { Battle } from './scenes/Battle';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config = {
  type: AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#141516',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  },
  input: {
    gamepad: true
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    CharacterPreview,
    CharacterSelect,
    Battle,
    MainGame,
    GameOver
  ],
};

const StartGame = (parent) => {
  return new Game({ ...config, parent });
}

export default StartGame;
