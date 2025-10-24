import { Scene } from 'phaser';
import { BaseCharacter } from '../characters/BaseCharacter.js';

export class CharacterPreview extends Scene {
  constructor() {
    super('CharacterPreview');

    this.characters = [];
  }

  create() {
    const steve = BaseCharacter(this, {
      name: 'Steve',
      spritesheetName: 'steve',
      x: 800,
      y: 370,
    });

    const zombie = BaseCharacter(this, {
      name: 'Zombie',
      spritesheetName: 'zombie',
      x: 400,
      y: 370,
      flipRight: true
    });
    
    const piglin = BaseCharacter(this, {
      name: 'piglin',
      spritesheetName: 'piglin',
      x: 400,
      y: 370,
      flipRight: true
    });

    steve.initializeAnimations();
    steve.startAnimationPreview();
    steve.initializePhysics();
    this.characters.push(steve);

    piglin.initializeAnimations();
    piglin.startAnimationPreview();
    piglin.initializePhysics();
    this.characters.push(piglin);

    // zombie.initializeAnimations();
    // zombie.startAnimationPreview();
    // zombie.initializePhysics();
    // this.characters.push(zombie);

    console.log(this.input);
    
    this.input.gamepad.once('connected', function (pad) {
      console.log('Gamepad connected:', pad.id);
    }, this);
  }

  update() {
    processInputs(this, this.characters);
  }
}

function processInputs(scene, characters) {
  const pads = scene.input.gamepad.gamepads;

  characters.forEach((character, index) => {
    processCharacterGamepadInputs(scene, character, pads[index]);
  });
}

function processCharacterGamepadInputs(scene, character, gamepad) {
  if (!gamepad) {
    return;
  }

  const sprite = character.sprite;

  if (gamepad.left) {
    sprite.x -= 4;
    sprite.flipX = false;
  }
  else if (gamepad.right) {
    sprite.x += 4;
    sprite.flipX = true;
  }

  if (gamepad.up) {
    if (sprite.body.onFloor()) {
      sprite.body.setVelocityY(-300);
    }
  }
  else if (gamepad.down) {
    // sprite.y += 4;
  }
}
