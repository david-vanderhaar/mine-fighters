export function BaseCharacter(scene, {
  name = 'BaseCharacter',
  health = 10,
  speed = 10,
  attack = 1,
  spritesheetName = 'default'
}) {
  return {
    name,
    health,
    speed,
    attack,
    initializeAnimations: () => initializeAnimations(scene, spritesheetName),
    startAnimationPreview: ({x, y, flipRight}) => startAnimationPreview(scene, spritesheetName, flipRight, x, y)
  }
}

function startAnimationPreview(scene, spritesheetName, flipRight= false, x = 600, y = 370) {
  const keys = ['walk', 'idle', 'kick', 'punch', 'jump', 'jumpkick', 'win', 'die'];
  const character = scene.add.sprite(x, y);
  character.setScale(8);
  // flip the character to face left
  if (flipRight) character.setFlipX(true);
  character.play(spritesheetName + '-walk');

  const current = scene.add.text(x, y + 200, 'Playing: walk', { color: '#00ff00' });

  // randomly change animation on pointer down
  // let c = 0;
  let c = Math.floor(Math.random() * keys.length);
  scene.input.on('pointerdown', function () {
    c++;
    if (c === keys.length) {
      c = 0;
    }
    const key = `${spritesheetName}-${keys[c]}`;
    character.play(key);
    current.setText('Playing: ' + key);
  });
}

function initializeAnimations(scene, spritesheetName) {
  // Animation set
  scene.anims.create({
    key: spritesheetName + '-punch',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [0, 1, 2, 3] }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: spritesheetName + '-walk',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [4, 5, 6, 7] }),
    frameRate: 8,
    repeat: -1
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
    repeat: -1,
    repeatDelay: 500
  });

  scene.anims.create({
    key: spritesheetName + '-jump',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [16, 17, 18, 19] }),
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: spritesheetName + '-jumpkick',
    frames: scene.anims.generateFrameNumbers(spritesheetName, { frames: [16, 17, 18, 19, 20, 19, 18] }),
    frameRate: 8,
    repeat: -1
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