import { Steve } from '../characters/Steve.js';
import { Zombie } from '../characters/Zombie.js';
import { BaseScene } from './BaseScene.js';
import { BattleInputHandler } from '../services/BattleInputHandler.js';
import { HealthBar } from '../services/HealthBar.js';

export class Battle extends BaseScene {
  constructor() {
    super('Battle');
    this.players = {};
  }

  init() {
    // 
  }

  create() {
    super.create();
    addPageTitle(this, 'Battle!');
    // add background image
    this.add.image(640, 360, 'battle_bg_0');
    initialzeCharacters(this);
    this.setupPhysics();
    this.setupUI();

    BattleInputHandler(this, this.players.player_1);
    BattleInputHandler(this, this.players.player_2, 'gamepad');
  }

  setupUI() {
    this.setupHealthBars();
  }

  setupHealthBars() {
    // player 1 health bar
    const player1HealthBar = new HealthBar(this, 20, 20, this.players.player_1.health);
    this.players.player_1['healthBar'] = player1HealthBar;

    // player 2 health bar
    const player2HealthBar = new HealthBar(this, 1000, 20, this.players.player_2.health);
    this.players.player_2['healthBar'] = player2HealthBar;
  }

  setupPhysics() {
    this.collisionSetup();
    this.hitHurtSetup();
  }

  collisionSetup() {
    this.physics.add.collider(
      this.players.player_1.sprite,
      this.players.player_2.sprite,
      (player1Sprite, player2Sprite) => {
        // make them stop so they don't overlap
        player1Sprite.body.setVelocityX(0);
        player2Sprite.body.setVelocityX(0);
        // play idle animation
        this.players.player_1.play('idle');
        this.players.player_2.play('idle');
      }
    );
  }

  hitHurtSetup() {
    // when any player punches or kicks, check for overlap with the other player
    Object.values(this.players).forEach((attacker) => {
      const attackerSprite = attacker.sprite;
      ['punch', 'kick'].forEach((attackType) => {
        // when attacker animation name matches "attacker.spriteSheetName-attackType"
        attackerSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + attacker.spritesheetName + '-' + attackType, () => {
          Object.values(this.players).forEach((defender) => {
            if (attacker !== defender) {
              const defenderSprite = defender.sprite;
              // check for overlap
              if (Phaser.Geom.Intersects.RectangleToRectangle(
                // attackerSprite.getBounds(),
                // defenderSprite.getBounds()
                // bodies for more accurate hitbox
                attackerSprite.body,
                defenderSprite.body
              )) {
                // reduce defender health
                defender.health -= attacker.attack;
                // update defender health bar
                this.updateHealthbar(defender, attacker.attack);
                // flash defender sprite to indicate hit
                this.tweens.add({
                  targets: defenderSprite,
                  alpha: 0,
                  duration: 100,
                  ease: 'Linear',
                  yoyo: true,
                  repeat: 3
                });
                console.log(`${defender.name} hit! Health: ${defender.health}`);
                if (defender.health <= 0) {
                  defender.play('die');
                  console.log(`${defender.name} defeated!`);
                  // disable defender physics body
                  defender.sprite.body.enable = false;
                  // disable input for both players so animations can't be interrupted
                  Object.values(this.players).forEach((player) => {
                    player.inputEnabled = false;
                  });

                  // stop attacker from moving
                  attacker.sprite.body.setVelocityX(0);
                  attacker.play('win');

                }
              }
            }
          });
        });
      });
    });
  }


  updateHealthbar(defender, damage) {
    const healthBar = defender.healthBar;
    const isDead = healthBar.decrease(damage);
    if (isDead) {
      console.log(`${defender.name} health bar depleted!`);
    }
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
