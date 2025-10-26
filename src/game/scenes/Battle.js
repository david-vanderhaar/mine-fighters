import { Steve } from '../characters/Steve.js';
import { Zombie } from '../characters/Zombie.js';
import { BaseScene } from './BaseScene.js';

export class Battle extends BaseScene {
  constructor() {
    super('Battle');
    this.players = {};
  }

  init() {
    this.players = selectedCharacters(this)
  }

  create() {
    super.create();
    addPageTitle(this, 'Battle!');
    initialzeCharacters(this.players);
  }
}

function initialzeCharacters(players) {
  Object.values(players).forEach((player) => {
    player.initializeAnimations();
    player.play('idle');
    player.initializePhysics();
  });
}


function selectedCharacters(game) {
  return {
    player_1: Steve(game, {x: 400, y: 470, flipRight: true}),
    player_2: Zombie(game, {x: 800, y: 470})
  }
}

function addPageTitle(scene, title) {
  scene.add.text(512, 20, title, {
    fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
    stroke: '#000000', strokeThickness: 8,
    align: 'center'
  }).setOrigin(0.5);
}
