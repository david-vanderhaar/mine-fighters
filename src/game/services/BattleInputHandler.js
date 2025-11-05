export function BattleInputHandler(scene, player, type='keyboard') {
  if (type === 'keyboard') {
    BattleKeyboardInputHandler(scene, player);
  } else if (type === 'gamepad') {
    BattleGamepadInputHandler(scene, player);
  }
}

function BattleGamepadInputHandler(scene, player) {
  // scene.input.gamepad.once('connected', (pad) => {
  // });
  scene.input.gamepad.on('down', (pad, button, index) => {
    handleGamepadButtonInput(button, [player]);
  });
  scene.input.gamepad.on('up', (pad, button, index) => {
    handleGamepadButtonRelease(button, [player]);
  });
}

function handleGamepadButtonInput(button, players) {
  Object.values(players).forEach((player) => {
    const sprite = player.sprite;
    switch (button.index) {
      case 14: // left
        sprite.body.setVelocityX(-player.speed * 100);
        sprite.flipX = false;
        player.play('walk');
        break;
      case 15: // right
        sprite.body.setVelocityX(player.speed * 100);
        sprite.flipX = true;
        player.play('walk');
        break;
      case 12: // up
        if (sprite.body.onFloor()) {
          sprite.body.setVelocityY(-400);
          player.play('jump');
        }
        break;
      case 0: // A button
        player.play('punch');
        break;
      case 1: // B button
        player.play('kick');
        break;
    }
  });
}

function handleGamepadButtonRelease(button, players) {
  Object.values(players).forEach((player) => {
    const sprite = player.sprite;
    switch (button.index) {
      case 14: // left
      case 15: // right
        sprite.body.setVelocityX(0);
        if (sprite.body.onFloor()) {
          player.play('idle');
        }
        break;
    }
  });
}

function BattleKeyboardInputHandler(scene, player) {
  const cursors = scene.input.keyboard.createCursorKeys();
  const wasdKeys = scene.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
  });
  scene.input.keyboard.on('keydown', (event) => {
    handleKeyInput(event, [player], cursors, wasdKeys);
  });
  scene.input.keyboard.on('keyup', (event) => {
    handleKeyRelease(event, [player], cursors, wasdKeys);
  });
}

function handleKeyInput(event, players, cursors, wasdKeys) {
  const keyCode = event.keyCode
  
  Object.values(players).forEach((player) => {
    // debugger;
    const sprite = player.sprite;
    if (keyCode === cursors.left.keyCode || keyCode === wasdKeys.left.keyCode) {
      sprite.body.setVelocityX(-player.speed * 100);
      sprite.flipX = false;
      player.play('walk');
    } else if (keyCode === cursors.right.keyCode || keyCode === wasdKeys.right.keyCode) {
      sprite.body.setVelocityX(player.speed * 100);
      sprite.flipX = true;
      player.play('walk');
    } else if (keyCode === cursors.up.keyCode || keyCode === wasdKeys.up.keyCode) {
      if (sprite.body.onFloor()) {
        sprite.body.setVelocityY(-400);
        player.play('jump');
      }
    } else if (keyCode === cursors.space.keyCode || keyCode === wasdKeys.space.keyCode) {
      player.play('punch');
    } else if (keyCode === cursors.shift.keyCode || keyCode === wasdKeys.shift.keyCode) {
      player.play('kick');
    } 
  });
}

function handleKeyRelease(event, players, cursors, wasdKeys) {
  const keyCode = event.keyCode
  Object.values(players).forEach((player) => {
    const sprite = player.sprite;
    if (
      keyCode === cursors.left.keyCode || 
      keyCode === wasdKeys.left.keyCode ||
      keyCode === cursors.right.keyCode || 
      keyCode === wasdKeys.right.keyCode
    ) {
      sprite.body.setVelocityX(0);
      if (sprite.body.onFloor()) {
        player.play('idle');
      }
    }
  });
}

