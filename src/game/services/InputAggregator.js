// Simple input aggregation helper for merging multiple input sources
export function initPlayerInputState(player) {
  if (!player) return;
  if (!player.inputState) {
    player.inputState = { sources: {} };
  }
}

export function setSourceIntent(player, sourceId, intent = {}) {
  if (!player) return;
  initPlayerInputState(player);
  const copy = Object.assign({}, intent);
  copy.ts = Date.now();
  player.inputState.sources[sourceId] = copy;
  applyMergedIntent(player);
}

export function clearSourceIntent(player, sourceId) {
  if (!player || !player.inputState) return;
  delete player.inputState.sources[sourceId];
  applyMergedIntent(player);
}

export function applyMergedIntent(player) {
  if (!player) return;
  const sprite = player.sprite;
  if (!sprite || !sprite.body) return;

  const sources = player.inputState && player.inputState.sources ? Object.values(player.inputState.sources) : [];

  // Prefer analog axis with largest magnitude
  let bestAxis = 0;
  for (const s of sources) {
    if (typeof s.axisX === 'number' && Math.abs(s.axisX) > Math.abs(bestAxis)) {
      bestAxis = s.axisX;
    }
  }

  if (Math.abs(bestAxis) > 0.05) {
    sprite.body.setVelocityX(bestAxis * player.speed * 100);
    try { sprite.flipX = bestAxis > 0; } catch (e) {}
    // don't override animations here; movement animation handled below
  }

  // Fall back to digital flags
  let left = false;
  let right = false;
  for (const s of sources) {
    if (s.left) left = true;
    if (s.right) right = true;
  }

  if (left && !right) {
    sprite.body.setVelocityX(-player.speed * 100);
    try { sprite.flipX = false; } catch (e) {}
  } else if (right && !left) {
    sprite.body.setVelocityX(player.speed * 100);
    try { sprite.flipX = true; } catch (e) {}
  } else {
    sprite.body.setVelocityX(0);
  }

  // NOTE: animation playback is handled by the individual input handlers
  // (they call tryPlay/player.play). The aggregator only sets velocity/flipX
  // to avoid clobbering animation state unexpectedly.
}
