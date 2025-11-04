import { Steve } from '../characters/Steve.js';
import { Zombie } from '../characters/Zombie.js';
import { BaseScene } from './BaseScene.js';

export class Battle extends BaseScene {
  constructor() {
    super('Battle');
    this.players = {};
  }

  init() {
    
  }

  create() {
    super.create();
    addPageTitle(this, 'Battle!');
    initialzeCharacters(this);
  }
}

function initialzeCharacters(scene) {
  const playerBuilders = selectedCharacters(scene.game);
  Object.values(playerBuilders).forEach(([builder, args], index) => {
    const player = builder(scene, args);
    player.initializeAnimations();
    player.play('idle');
    player.initializePhysics();
    scene.players[`player_${index + 1}`] = player;
  });
}


function selectedCharacters(game) {
  return {
    player_1: [game.registry.get('player_1_character') || Steve, {x: 400, y: 470, flipRight: true}],
    player_2: [game.registry.get('player_2_character') || Zombie, {x: 800, y: 470}],
  }
}

function addPageTitle(scene, title) {
  scene.add.text(512, 20, title, {
    fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
    stroke: '#000000', strokeThickness: 8,
    align: 'center'
  }).setOrigin(0.5);
}
