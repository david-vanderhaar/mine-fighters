import { Scene } from 'phaser';
import { BaseCharacter } from '../characters/BaseCharacter.js';

export class CharacterPreview extends Scene {
  constructor() {
    super('CharacterPreview');

    this.sprites = [];
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
    this.sprites.push(steve.sprite);

    piglin.initializeAnimations();
    piglin.startAnimationPreview();
    piglin.initializePhysics();
    this.sprites.push(piglin.sprite);

    // zombie.initializeAnimations();
    // zombie.startAnimationPreview();
    // zombie.initializePhysics();
    // this.sprites.push(zombie.sprite);

    console.log(this.input);
    
    this.input.gamepad.once('connected', function (pad) {
      console.log('Gamepad connected:', pad.id);
    }, this);
  }

  update() {
    processInputs(this);
  }
}

function processInputs(scene) {
  const pads = scene.input.gamepad.gamepads;

  for (let i = 0; i < pads.length; i++) {
    const gamepad = pads[i];

    if (!gamepad) {
      continue;
    }

    const sprite = scene.sprites[i];

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
        // sprite.y -= 4;
        sprite.body.setVelocityY(-300);
      }
    }
    else if (gamepad.down) {
      // sprite.y += 4;
      
    }
  }
}
