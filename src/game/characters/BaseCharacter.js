export function BaseCharacter(scene, {
  name = 'BaseCharacter',
  health = 10,
  speed = 10,
  attack = 1,
  spritesheetName = 'default',
  x = 600,
  y = 370,
  flipRight = false
}) {
  const sprite = initializeSprite(scene, x, y, flipRight);
  return {
    name,
    health,
    speed,
    attack,
    sprite,
    initializeAnimations: () => initializeAnimations(scene, spritesheetName),
    startAnimationPreview: () => startAnimationPreview(scene, sprite, spritesheetName, x, y),
    initializePhysics: () => {
      scene.physics.add.existing(sprite);
      sprite.body.setCollideWorldBounds(true);
      sprite.body.setGravity(0, 1000);
      sprite.body.setMaxVelocity(600, 600)
    },
    play: (action) => play(sprite, spritesheetName, action),
  }
}

function initializeSprite(scene, x, y, flipRight) {
  const sprite = scene.add.sprite(x, y);
  sprite.setScale(8);
  sprite.setFlipX(flipRight);

  return sprite;
}

function startAnimationPreview(scene, sprite, spritesheetName, x , y ) {
  const keys = ['walk', 'idle', 'kick', 'punch', 'jump', 'jumpkick', 'win', 'die'];

  sprite.play(spritesheetName + '-idle');

  const current = scene.add.text(x, y + 200, 'Playing: idle', { color: '#00ff00' });

  // randomly change animation on pointer down
  let c = Math.floor(Math.random() * keys.length);
  scene.input.on('pointerdown', function () {
    c++;
    if (c === keys.length) {
      c = 0;
    }
    const key = `${spritesheetName}-${keys[c]}`;
    sprite.play(key);
    current.setText('Playing: ' + key);
  });
}

function play(sprite, spritesheetName, action) {
  const key = `${spritesheetName}-${action}`;
  sprite.play(key);
}

function initializeAnimations(scene, spritesheetName) {
  // Animation set
  scene.anims.create({
    key: spritesheetName + '-punch',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [0, 1, 2, 3] }),
    frameRate: 8,
  });

  scene.anims.create({
    key: spritesheetName + '-walk',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [4, 5, 6, 7] }),
    frameRate: 8,
    // repeat: -1
  });

  scene.anims.create({
    key: spritesheetName + '-idle',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [8, 9, 10, 11] }),
    frameRate: 8,
    repeat: -1,
  });

  scene.anims.create({
    key: spritesheetName + '-kick',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [12, 13, 14, 15, 12] }),
    frameRate: 8,
  });

  scene.anims.create({
    key: spritesheetName + '-jump',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [16, 17, 18, 19] }),
    frameRate: 8,
  });

  scene.anims.create({
    key: spritesheetName + '-jumpkick',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [16, 17, 18, 19, 20, 19, 18] }),
    frameRate: 8,
  });

  scene.anims.create({
    key: spritesheetName + '-win',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [24, 25] }),
    frameRate: 8,
    repeat: -1,
    repeatDelay: 1000
  });

  scene.anims.create({
    key: spritesheetName + '-die',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [28, 29, 30] }),
    frameRate: 8,
  });
}