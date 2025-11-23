import { initPlayerInputState, setSourceIntent, clearSourceIntent } from './InputAggregator.js';

export function BattleInputHandler(scene, player, type='keyboard') {
  initPlayerInputState(player);
  if (type === 'keyboard') {
    BattleKeyboardInputHandler(scene, player);
  } else if (type === 'gamepad') {
    BattleGamepadInputHandler(scene, player);
  }
}

function BattleGamepadInputHandler(scene, player) {
  scene.input.gamepad.on('down', (pad, button, index) => {
    if (!player.inputEnabled) return;
    handleGamepadButtonInput(button, [player]);
  });
  scene.input.gamepad.on('up', (pad, button, index) => {
    if (!player.inputEnabled) return;
    handleGamepadButtonRelease(button, [player]);
  });
}

function handleGamepadButtonInput(button, players) {
  Object.values(players).forEach((player) => {
    const sprite = player.sprite;
    switch (button.index) {
      case 14: // left
        setSourceIntent(player, 'gamepad', { left: true, right: false, axisX: -1 });
        if (sprite && sprite.body && sprite.body.onFloor()) player.play('walk');
        break;
      case 15: // right
        setSourceIntent(player, 'gamepad', { left: false, right: true, axisX: 1 });
        if (sprite && sprite.body && sprite.body.onFloor()) player.play('walk');
        break;
      case 12: // up
        if (sprite.body.onFloor()) {
          sprite.body.setVelocityY(player.jumpStrength * -100);
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
        // clear directional intent for gamepad when D-pad released
        setSourceIntent(player, 'gamepad', { left: false, right: false, axisX: 0 });
        if (sprite && sprite.body && sprite.body.onFloor()) {
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
    // update keyboard intent based on current held keys
    const leftActive = (cursors.left && cursors.left.isDown) || (wasdKeys.left && wasdKeys.left.isDown);
    const rightActive = (cursors.right && cursors.right.isDown) || (wasdKeys.right && wasdKeys.right.isDown);
    let axis = 0;
    if (leftActive && !rightActive) axis = -1;
    else if (rightActive && !leftActive) axis = 1;
    setSourceIntent(player, 'keyboard', { left: leftActive, right: rightActive, axisX: axis });
    if (axis !== 0 && sprite && sprite.body && sprite.body.onFloor()) player.play('walk');
    if (axis === 0 && sprite && sprite.body && sprite.body.onFloor()) {
      player.play('idle');
    } else if (keyCode === cursors.up.keyCode || keyCode === wasdKeys.up.keyCode) {
      if (sprite.body.onFloor()) {
        sprite.body.setVelocityY(player.jumpStrength * -100);
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
      const leftActive = (cursors.left && cursors.left.isDown) || (wasdKeys.left && wasdKeys.left.isDown);
      const rightActive = (cursors.right && cursors.right.isDown) || (wasdKeys.right && wasdKeys.right.isDown);
      let axis = 0;
      if (leftActive && !rightActive) axis = -1;
      else if (rightActive && !leftActive) axis = 1;
      setSourceIntent(player, 'keyboard', { left: leftActive, right: rightActive, axisX: axis });
      if (axis === 0 && sprite && sprite.body && sprite.body.onFloor()) {
        player.play('idle');
      }
    }
  });
}

