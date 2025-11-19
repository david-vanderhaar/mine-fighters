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
	const state = {
		left: false,
		right: false,
		jumpPressed: false, // edge (set true on pointerdown, cleared after processed)
		punchPressed: false,
		kickPressed: false,
		container: null,
		buttons: {}
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

		// Helper to add pointer handlers
		function bindPress(obj, handlers) {
			const interactive = obj.circle;
			interactive.on('pointerdown', (pointer) => {
				handlers.down(pointer);
			});
			interactive.on('pointerup', (pointer) => {
				handlers.up(pointer);
			});
			// pointerout should also reset (finger dragged away)
			interactive.on('pointerout', (pointer) => {
				handlers.up(pointer);
			});
			// pointermove while down: keep state true
			interactive.on('pointermove', (pointer) => {
				if (pointer.isDown) {
					handlers.down(pointer);
				}
			});
		}

		bindPress(leftBtn, {
			down: () => { state.left = true; },
			up: () => { state.left = false; }
		});
		bindPress(rightBtn, {
			down: () => { state.right = true; },
			up: () => { state.right = false; }
		});
		bindPress(jumpBtn, {
			down: () => { state.jumpPressed = true; },
			up: () => { /* no-op - we treat jump as edge when pointerdown */ }
		});
		bindPress(punchBtn, {
			down: () => { state.punchPressed = true; },
			up: () => { /* no-op - treat as edge */ }
		});
		bindPress(kickBtn, {
			down: () => { state.kickPressed = true; },
			up: () => { /* no-op - treat as edge */ }
		});

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

		// Horizontal movement
		if (state.left) {
			sprite.body.setVelocityX(-player.speed * 100);
			sprite.flipX = false;
			if (sprite.body.onFloor()) tryPlay('walk');
		} else if (state.right) {
			sprite.body.setVelocityX(player.speed * 100);
			sprite.flipX = true;
			if (sprite.body.onFloor()) tryPlay('walk');
		} else {
			sprite.body.setVelocityX(0);
			if (sprite.body.onFloor() && player.health > 0) tryPlay('idle');
		}

		// Jump (edge-detect)
		if (state.jumpPressed && sprite.body.onFloor()) {
			sprite.body.setVelocityY(player.jumpStrength * -100);
			tryPlay('jump');
		}

		// Punch / Kick (edge)
		if (state.punchPressed) {
			tryPlay('punch');
		}
		if (state.kickPressed) {
			tryPlay('kick');
		}

		// Clear edge presses after they've been considered, so a new touch is required
		state.jumpPressed = false;
		state.punchPressed = false;
		state.kickPressed = false;
	}

	return { update, setup };
}
