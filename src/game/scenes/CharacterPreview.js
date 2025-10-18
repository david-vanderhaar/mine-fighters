import { Scene } from 'phaser';
import { BaseCharacter } from '../characters/BaseCharacter.js';

export class CharacterPreview extends Scene {
  constructor() {
    super('CharacterPreview');
  }

  create() {
    const steve = BaseCharacter(this, {
      name: 'Steve',
      spritesheetName: 'steve'
    });

    const zombie = BaseCharacter(this, {
      name: 'Zombie',
      spritesheetName: 'zombie'
    });

    steve.initializeAnimations();
    steve.startAnimationPreview({x: 800, y: 370});

    zombie.initializeAnimations();
    zombie.startAnimationPreview({x: 400, y: 370, flipRight: true});
  }
}
