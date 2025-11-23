export function BattleRealtimeTouchInputHandler(scene, player, side = 'left') {
	// Initialize per-player animation lock store and an animation-complete listener (only once)
	if (!player._animLocks) {
		player._animLocks = {};
	}
	if (!player._animListenerAttached) {
		const sprite = player.sprite;
		if (sprite && sprite.on) {
			sprite.on('animationcomplete', (anim /*, frame */) => {
				if (player._animLocks) player._animLocks[anim.key] = false;
			});
		}
		player._animListenerAttached = true;
	}

	// Helper to decide whether to play/lock an animation.
	function tryPlay(animName) {
		const sprite = player.sprite;
		if (!sprite || !sprite.anims) {
			player.play(animName);
			return;
		}

		const cur = sprite.anims.currentAnim && sprite.anims.currentAnim.key;
		const isPlaying = sprite.anims.isPlaying;

		if (animName === 'punch' || animName === 'kick') {
			if (player._animLocks[animName]) return;
			player._animLocks[animName] = true;
			player.play(animName);
			// ensure we go back to idle after the attack finishes and clear the lock
			if (sprite && sprite.once) {
				sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + player.spritesheetName + '-' + animName,
					() => {
						player.play('idle');
						player._animLocks[animName] = false;
					}
				);
			}
			return;
		}

		if ((animName === 'walk' || animName === 'idle') && cur === animName && isPlaying) {
			return;
		}

		player.play(animName);
	}

	// State for touch controls
	// Use Sets of pointer ids so multiple touches don't clobber each other.
	const state = {
		presses: {
			left: new Set(),
			right: new Set(),
			jump: new Set(), // edge-detected via prevEdge
			punch: new Set(),
			kick: new Set()
		},
		prevEdge: {
			jump: false,
			punch: false,
			kick: false
		},
		container: null,
		buttons: {} // UI button objects
	};

	// Create a simple UI button (circle + label). Returns an object with the interactive shape and label.
	function createButton(x, y, radius, labelText) {
		const circle = scene.add.circle(x, y, radius, 0x000000, 0.45).setInteractive({ useHandCursor: true });
		const label = scene.add.text(x, y, labelText, { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
		// Grouping by putting both in a container makes it easier to move/cleanup
		const c = scene.add.container(0, 0, [circle, label]);
		// keep UI on top and fixed to camera if needed
		try {
			c.setDepth(1000);
			c.setScrollFactor(0);
		} catch (e) {
			// some Phaser builds may not support setScrollFactor on container; ignore
		}
		return { group: c, circle, label };
	}

	// Setup creates the touch buttons on the screen.
	function setup() {
		const width = (scene.scale && scene.scale.width) || (scene.cameras && scene.cameras.main && scene.cameras.main.width) || 800;
		const height = (scene.scale && scene.scale.height) || (scene.cameras && scene.cameras.main && scene.cameras.main.height) || 600;

		// base position depending on player side
		const sideLeft = side === 'left';
		const baseX = sideLeft ? 80 : width - 80;
		const baseY = height - 80;

		// Movement buttons (left / right)
		const leftBtn = createButton(baseX - 44, baseY, 28, '◀');
		const rightBtn = createButton(baseX + 44, baseY, 28, '▶');
		const jumpBtn = createButton(baseX, baseY - 90, 30, 'J');

		// Attack buttons - place on the opposite side of the movement pad for player_1; mirror for player_2
		const attackBaseX = sideLeft ? baseX + 160 : baseX - 160;
		const punchBtn = createButton(attackBaseX, baseY - 30, 30, 'P');
		const kickBtn = createButton(attackBaseX, baseY + 50, 30, 'K');

		// Container for easier cleanup
		const uiContainer = scene.add.container(0, 0, [
			leftBtn.group, rightBtn.group, jumpBtn.group, punchBtn.group, kickBtn.group
		]);
		try { uiContainer.setScrollFactor(0); uiContainer.setDepth(1000); } catch (e) {}

		state.container = uiContainer;
		state.buttons = { leftBtn, rightBtn, jumpBtn, punchBtn, kickBtn };

		// Ensure multiple pointers are available for multitouch (do this once)
		try {
			if (scene && scene.input && scene.input.addPointer && !scene._multiTouchConfiguredForBattleRealtime) {
				// Add a few extra pointers; default platform pointer count may be limited
				scene.input.addPointer(5);
				scene._multiTouchConfiguredForBattleRealtime = true;
			}
		} catch (e) {}

		// Helper to add pointer handlers; track pointer ids in a Set
		function bindPress(obj, setKey, isEdge = false) {
			const interactive = obj.circle;
			interactive.on('pointerdown', (pointer) => {
				console.log('[touch] down', setKey, 'id=', pointer.id, 'x=', pointer.x, 'y=', pointer.y);
				state.presses[setKey].add(pointer.id);
			});
			interactive.on('pointerup', (pointer) => {
				console.log('[touch] up', setKey, 'id=', pointer.id);
				state.presses[setKey].delete(pointer.id);
			});
			// pointerout should also reset (finger dragged away)
			interactive.on('pointerout', (pointer) => {
				console.log('[touch] out', setKey, 'id=', pointer.id);
				state.presses[setKey].delete(pointer.id);
			});
			// pointermove while down: keep state active for that pointer
			interactive.on('pointermove', (pointer) => {
				if (pointer.isDown) {
					console.log('[touch] move (down)', setKey, 'id=', pointer.id, 'x=', pointer.x, 'y=', pointer.y);
					state.presses[setKey].add(pointer.id);
				}
			});
		}

		bindPress(leftBtn, 'left');
		bindPress(rightBtn, 'right');
		bindPress(jumpBtn, 'jump', true);
		bindPress(punchBtn, 'punch', true);
		bindPress(kickBtn, 'kick', true);

		return uiContainer;
	}

	// Update reads the UI state and controls the player accordingly.
	function update() {
		if (!player.inputEnabled) return;
		const sprite = player.sprite;

		// if anim is "die", block all inputs
		if (player._animLocks['die']) {
			player.inputEnabled = false;
			return;
		}
		// if punch or kick animation is playing, block other inputs
		if (player._animLocks['punch'] || player._animLocks['kick']) return;

		if (!sprite || !sprite.body) return;

		// Horizontal movement (check Sets)
		const leftActive = state.presses.left.size > 0;
		const rightActive = state.presses.right.size > 0;

		if (leftActive) {
			console.log('[touch] update -> leftActive for', player.name || player.spritesheetName || 'player');
			sprite.body.setVelocityX(-player.speed * 100);
			sprite.flipX = false;
			if (sprite.body.onFloor()) tryPlay('walk');
		} else if (rightActive) {
			console.log('[touch] update -> rightActive for', player.name || player.spritesheetName || 'player');
			sprite.body.setVelocityX(player.speed * 100);
			sprite.flipX = true;
			if (sprite.body.onFloor()) tryPlay('walk');
		} else {
			sprite.body.setVelocityX(0);
			if (sprite.body.onFloor() && player.health > 0) tryPlay('idle');
		}

		// Edge detection for jump/punch/kick
		const jumpActive = state.presses.jump.size > 0;
		const punchActive = state.presses.punch.size > 0;
		const kickActive = state.presses.kick.size > 0;

		const jumpEdge = jumpActive && !state.prevEdge.jump;
		const punchEdge = punchActive && !state.prevEdge.punch;
		const kickEdge = kickActive && !state.prevEdge.kick;

		if (jumpEdge && sprite.body.onFloor()) {
			console.log('[touch] jumpEdge for', player.name || player.spritesheetName || 'player');
			sprite.body.setVelocityY(player.jumpStrength * -100);
			tryPlay('jump');
		}

		if (punchEdge) {
			console.log('[touch] punchEdge for', player.name || player.spritesheetName || 'player');
			tryPlay('punch');
		}
		if (kickEdge) {
			console.log('[touch] kickEdge for', player.name || player.spritesheetName || 'player');
			tryPlay('kick');
		}

		// Update previous-edge trackers so a press fires only once per touch
		state.prevEdge.jump = jumpActive;
		state.prevEdge.punch = punchActive;
		state.prevEdge.kick = kickActive;
	}

	return { update, setup };
}
