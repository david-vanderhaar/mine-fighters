import { BaseScene } from './BaseScene.js';

export class CharacterSelect extends BaseScene {
  constructor() {
    super('CharacterSelect');
    this.selectableCharacterBoxes = [];

    // selection state
    this.playerSelectionIndex = { 1: 0, 2: 0 };
    this.playerConfirmed = { 1: false, 2: false };
    this.playerSelectCooldowns = { 1: 0, 2: 0 };
    this.playerSelectionIndicators = {}; // will hold rectangles for visual indicator
    this.playerLockedLabels = {}; // will hold "Locked" texts
  }

  create() {
    super.create();
    this.cameras.main.setBackgroundColor('#3b3b44');

    // create keyboard keys used for player 1
    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      select: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER
    });

    this.addScreenTitle();
    this.addSelectedCharacterBoxes();
    this.addSelectableCharacters();

    // initialize selection indices (clamp to available portraits)
    const total = Math.max(1, this.selectableCharacterBoxes.length);
    this.playerSelectionIndex[1] = 0;
    this.playerSelectionIndex[2] = Math.min(1, total - 1);

    // create visual indicators and locked labels for each player
    for (let p = 1; p <= 2; p++) {
      // indicator: transparent rectangle with colored stroke
      const color = p === 1 ? 0x2f80ed : 0x27ae60;
      const indicator = this.add.rectangle(0, 0, 170, 170)
        .setOrigin(0.5)
        .setStrokeStyle(4, color)
        .setVisible(false);
      this.playerSelectionIndicators[p] = indicator;

      // locked label (hidden until confirmed)
      const lockedText = this.add.text(0, 0, 'Locked', {
        fontFamily: 'Arial', fontSize: 18, color: '#ffffff',
        stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5).setVisible(false);
      this.playerLockedLabels[p] = lockedText;

      // initial visual update
      this.updatePlayerSelectionVisual(p);
    }
  }

  update() {
    super.update();
    this.handleInput();
  }

  // custom methods

  handleInput() {
    // There will be an input for game controller and keyboard/mouse
    // player 1 users keyboard/mouse
    // player 2 uses game controller

    // call the class method (was calling a global before)
    this.handlerPlayerSelectInput(1, 'keyboard');
    this.handlerPlayerSelectInput(2, 'gamepad');
  }

  handlerPlayerSelectInput(playerNumber, inputType) {
    // cooldown to avoid rapid-fire movement
    const now = Date.now();
    const cooldown = 160; // ms

    if (this.playerConfirmed[playerNumber]) {
      // already locked in — ignore input
      return;
    }

    let move = 0; // -1 left, +1 right
    let confirm = false;

    if (inputType === 'keyboard') {
      ({ move, confirm } = this.handleKeyboardInput(playerNumber, now, cooldown, move, confirm));
    } else if (inputType === 'gamepad') {
      ({ move, confirm } = this.handleGamepadInput(playerNumber, now, cooldown, move, confirm));
    }

    // process move
    if (move !== 0) {
      const total = this.selectableCharacterBoxes.length;
      if (total === 0) return;
      let idx = this.playerSelectionIndex[playerNumber] + move;
      // wrap around
      if (idx < 0) idx = total - 1;
      if (idx >= total) idx = 0;
      this.playerSelectionIndex[playerNumber] = idx;
      this.updatePlayerSelectionVisual(playerNumber);
    }

    // process confirm
    if (confirm) {
      this.playerConfirmed[playerNumber] = true;
      // show locked label and keep indicator visible
      const indicator = this.playerSelectionIndicators[playerNumber];
      const label = this.playerLockedLabels[playerNumber];
      const box = this.selectableCharacterBoxes[this.playerSelectionIndex[playerNumber]];
      if (box && indicator && label) {
        label.setPosition(box.rect.x, box.rect.y + 100);
        label.setVisible(true);
        indicator.setStrokeStyle(6, playerNumber === 1 ? 0x1e90ff : 0x2ecc71);
      }
      // here you could dispatch an event or call a method to notify other parts of the UI
    }
  }

  handleKeyboardInput(playerNumber, now, cooldown, move, confirm) {
    const k = this.keys;
    if (!k) return;

    // left: LEFT or A
    if ((Phaser.Input.Keyboard.JustDown(k.left) || Phaser.Input.Keyboard.JustDown(k.a)) && now - this.playerSelectCooldowns[playerNumber] > cooldown) {
      move = -1;
      this.playerSelectCooldowns[playerNumber] = now;
    }
    // right: RIGHT or D
    if ((Phaser.Input.Keyboard.JustDown(k.right) || Phaser.Input.Keyboard.JustDown(k.d)) && now - this.playerSelectCooldowns[playerNumber] > cooldown) {
      move = 1;
      this.playerSelectCooldowns[playerNumber] = now;
    }
    // select: SPACE or ENTER
    if (Phaser.Input.Keyboard.JustDown(k.select) || Phaser.Input.Keyboard.JustDown(k.enter)) {
      confirm = true;
    }

    return {move, confirm}
  }

  handleGamepadInput(playerNumber, now, cooldown, move, confirm) {
    const pad = this.input.gamepad ? this.input.gamepad.getPad(playerNumber - 1) || this.input.gamepad.getPad(0) : null;
    if (pad) {
      // check left/right axis (axes[0]) or D-pad buttons (14/15 typical)
      const axisX = (pad.axes && pad.axes.length) ? pad.axes[0].getValue() : 0;
      if (axisX < -0.5 && now - this.playerSelectCooldowns[playerNumber] > cooldown) {
        move = -1;
        this.playerSelectCooldowns[playerNumber] = now;
      } else if (axisX > 0.5 && now - this.playerSelectCooldowns[playerNumber] > cooldown) {
        move = 1;
        this.playerSelectCooldowns[playerNumber] = now;
      } else {
        // D-pad fallback: buttons 14 (left) and 15 (right) are common
        if (pad.buttons[14] && pad.buttons[14].pressed && now - this.playerSelectCooldowns[playerNumber] > cooldown) {
          move = -1;
          this.playerSelectCooldowns[playerNumber] = now;
        } else if (pad.buttons[15] && pad.buttons[15].pressed && now - this.playerSelectCooldowns[playerNumber] > cooldown) {
          move = 1;
          this.playerSelectCooldowns[playerNumber] = now;
        }
      }

      // button 0 (A) or button 1 (B) for confirm (A typical)
      if ((pad.buttons[0] && pad.buttons[0].pressed) || (pad.buttons[1] && pad.buttons[1].pressed)) {
        confirm = true;
      }
    }

    return {move, confirm}
  }

  // helper to update indicator/thumbnail tints when selection changes
  updatePlayerSelectionVisual(playerNumber) {
    const idx = this.playerSelectionIndex[playerNumber];
    const box = this.selectableCharacterBoxes[idx];
    if (!box) return;

    // move indicator to the selected portrait
    const indicator = this.playerSelectionIndicators[playerNumber];
    if (indicator) {
      indicator.setPosition(box.rect.x, box.rect.y).setVisible(true);
    }

    // update tints: highlight selected for this player, clear tint for others
    this.selectableCharacterBoxes.forEach((b, i) => {
      if (i === idx) {
        // slightly brighten the selected portrait for this player
        b.portrait.clearTint();
        b.portrait.setTint(playerNumber === 1 ? 0x88b6ff : 0xb8f0c9);
      } else {
        // remove tint only if not locked by another player
        const lockedByOther = Object.keys(this.playerConfirmed).some(p => this.playerConfirmed[p] && this.playerSelectionIndex[p] === i);
        if (!lockedByOther) {
          b.portrait.clearTint();
        }
      }
    });
  }

  addScreenTitle() {
    this.add.text(this.cameras.main.width / 2, 20, 'Character Select', {
      fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);
  }

  addSelectedCharacterBoxes() {
    // x1 is 1/4 width, x2 is 3/4 width
    const x1 = this.cameras.main.width / 4;
    const x2 = (this.cameras.main.width / 4) * 3;
    this.createPlayerSelectedPortaitBox(x1, 184, '#ffffff', 0x18181b, 'Player 1');
    this.createPlayerSelectedPortaitBox(x2, 184, '#ffffff', 0x18181b, 'Player 2');
  }

  createPlayerSelectedPortaitBox(x, y, color, borderColor, text) {
    this.add.rectangle(x, y, 250, 200, `${borderColor}`).setOrigin(0.5);

    this.add.text(x, y + 120, text, {
      fontFamily: 'Arial', fontSize: 24, color: color,
      stroke: '#000000', strokeThickness: 1,
      align: 'center'
    }).setOrigin(0.5);
  }

  addSelectableCharacters() {
    // 5 selectable character portraits
    // 2 rows of portraits
    // first row has steve, zombie
    // second row has piglin, drowned, golem
    // evenly space them out, center on the screen
    const startY = 450;
    const gapY = 175;
    const gapX = 250;
    const centerX = this.cameras.main.width / 2;
    this.createSelectableCharacterPortrait(centerX - gapX + 75, startY, 'steve');
    this.createSelectableCharacterPortrait(centerX + gapX - 75, startY, 'zombie');
    this.createSelectableCharacterPortrait(centerX - gapX, startY + gapY, 'piglin');
    this.createSelectableCharacterPortrait(centerX, startY + gapY, 'drowned');
    this.createSelectableCharacterPortrait(centerX + gapX, startY + gapY, 'golem');
  }

  createSelectableCharacterPortrait(x, y, characterKey) {
    // Portrait background
    const rect = this.add.rectangle(x, y, 150, 150, 0x18181b).setOrigin(0.5);
    // Portrait image
    const portrait = this.add.image(x, y, characterKey).setOrigin(0.5).setScale(3);
    this.selectableCharacterBoxes.push({ rect, portrait, characterKey });
  }

}
