import { initPlayerInputState, setSourceIntent, clearSourceIntent } from './InputAggregator.js';

export function BattleRealtimeInputHandler(scene, player, type = 'keyboard') {
	// Initialize per-player animation lock store and an animation-complete listener (only once)
	if (!player._animLocks) {
		player._animLocks = {}; // e.g. { punch: false, kick: false, ... }
	}
	if (!player._animListenerAttached) {
		const sprite = player.sprite;
		if (sprite && sprite.on) {
			sprite.on('animationcomplete', (anim, frame) => {
				// clear any lock that corresponds to this animation key
				if (player._animLocks) player._animLocks[anim.key] = false;
			});
		}
		player._animListenerAttached = true;
	}

	// Helper to decide whether to play/lock an animation.
	function tryPlay(animName) {
		const sprite = player.sprite;
		// Safety: if no sprite or no anim system, just call player.play
		if (!sprite || !sprite.anims) {
			player.play(animName);
			return;
		}

		const cur = sprite.anims.currentAnim && sprite.anims.currentAnim.key;
		const isPlaying = sprite.anims.isPlaying;

		// For punch/kick, block if currently locked (i.e., currently performing)
		if (animName === 'punch' || animName === 'kick') {
			if (player._animLocks[animName]) return; // blocked until completion
			player._animLocks[animName] = true;
			player.play(animName);
      // play idle after attack
      sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + player.spritesheetName + '-' + animName,
        () => { 
          player.play('idle'); 
          // REMOVE LOCK
          player._animLocks[animName] = false;
          // console.log(); animlocks
          // console.log(player._animLocks);
        }
      );
			return;
		}

		// For movement (walk/idle), do not retrigger the same animation while it's already playing.
		if ((animName === 'walk' || animName === 'idle') && cur === animName && isPlaying) {
			// already playing same movement animation; don't restart it
			return;
		}

		// Default: play the animation
		player.play(animName);
	}

  if (type === 'keyboard') {
    const cursors = scene.input.keyboard.createCursorKeys();
    const wasdKeys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT
    });

    initPlayerInputState(player);
    return {
      update() {
        if (!player.inputEnabled) return;
        const sprite = player.sprite;
        // if anim is "die", block all inputs
        if (player._animLocks['die']) {
          player.inputEnabled = false;
          return;
        }
        // if punch or kick animation is playing, block other inputs
        if (player._animLocks['punch'] || player._animLocks['kick']) {
          return;
        }

        // Horizontal movement intent
        const left = cursors.left.isDown || wasdKeys.left.isDown;
        const right = cursors.right.isDown || wasdKeys.right.isDown;
        let axis = 0;
        if (left && !right) axis = -1;
        else if (right && !left) axis = 1;
        setSourceIntent(player, 'keyboard', { left, right, axisX: axis });

        // Play movement animations (use tryPlay to respect locks)
        if (axis !== 0 && sprite && sprite.body && sprite.body.onFloor()) tryPlay('walk');
        else if (axis === 0 && sprite && sprite.body && sprite.body.onFloor() && player.health > 0) tryPlay('idle');

        // Jump (only trigger when pressed and on floor)
        if ((Phaser.Input.Keyboard.JustDown(cursors.up) || Phaser.Input.Keyboard.JustDown(wasdKeys.up)) && sprite.body.onFloor()) {
          sprite.body.setVelocityY(player.jumpStrength * -100);
          tryPlay('jump');
        }

        // Punch / Kick (edge-detect using JustDown so we don't spam)
        if (Phaser.Input.Keyboard.JustDown(cursors.space) || Phaser.Input.Keyboard.JustDown(wasdKeys.space)) {
          tryPlay('punch');
        }
        if (Phaser.Input.Keyboard.JustDown(cursors.shift) || Phaser.Input.Keyboard.JustDown(wasdKeys.shift)) {
          tryPlay('kick');
        }
      }
    };
  } else if (type === 'gamepad') {
    // Keep previous button states to detect edges (press events)
    const prevButtons = {};

    initPlayerInputState(player);
    return {
      update() {
        if (!player.inputEnabled) return;
        // if anim is "die", block all inputs
        if (player._animLocks['die']) {
          player.inputEnabled = false;
          return;
        }
        if (player._animLocks['punch'] || player._animLocks['kick']) {
          return;
        }
        const pad = scene.input.gamepad && scene.input.gamepad.total ? scene.input.gamepad.getPad(0) : null;
        if (!pad) return;
        const sprite = player.sprite;

        // Axis or D-pad horizontal input
        let left = false;
        let right = false;
        let axisVal = 0;

        if (pad.axes && pad.axes.length) {
          const axis0 = pad.axes[0].getValue();
          axisVal = axis0;
          if (axis0 < -0.1) left = true;
          if (axis0 > 0.1) right = true;
        }

        // D-pad overrides axes if pressed
        if (pad.buttons[14] && pad.buttons[14].pressed) { left = true; axisVal = -1; }
        if (pad.buttons[15] && pad.buttons[15].pressed) { right = true; axisVal = 1; }

        setSourceIntent(player, 'gamepad', { left, right, axisX: axisVal });

        // Play movement animations
        if ((left || right) && sprite && sprite.body && sprite.body.onFloor()) tryPlay('walk');
        else if (!left && !right && sprite && sprite.body && sprite.body.onFloor() && player.health > 0) tryPlay('idle');

        // Jump: D-pad up or face button (mapped previously to 12 in old handler)
        const jumpPressed = (pad.buttons[12] && pad.buttons[12].pressed) || (pad.buttons[3] && pad.buttons[3].pressed);
        if (jumpPressed && sprite.body.onFloor() && !prevButtons[12]) {
          sprite.body.setVelocityY(player.jumpStrength * -100);
          tryPlay('jump');
        }

        // A (0) = punch, B (1) = kick. Use edge detection so actions fire once per press.
        const punchPressed = pad.buttons[0] && pad.buttons[0].pressed;
        const kickPressed = pad.buttons[1] && pad.buttons[1].pressed;

        if (punchPressed && !prevButtons[0]) {
          tryPlay('punch');
        }
        if (kickPressed && !prevButtons[1]) {
          tryPlay('kick');
        }

        // Update previous button states
        for (let i = 0; i < pad.buttons.length; i++) {
          prevButtons[i] = !!(pad.buttons[i] && pad.buttons[i].pressed);
        }
      }
    };
  }

  // Fallback: return an object with a no-op update to avoid checks elsewhere
  return { update() {} };
}
