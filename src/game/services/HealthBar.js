export class HealthBar {
  constructor(scene, x, y, maxHealth, width = 400, height = 32) {
    this.bar = new Phaser.GameObjects.Graphics(scene);

    this.x = x;
    this.y = y;

    this.maxHealth = (maxHealth !== undefined) ? maxHealth : 100;
    this.value = this.maxHealth;

    // Outer dimensions (background)
    this.outerWidth = width;
    this.outerHeight = height;

    // Padding between outer and inner (same as original: 2px)
    this.innerOffset = 2;

    // Inner (health) area dimensions
    this.innerWidth = Math.max(0, this.outerWidth - this.innerOffset * 2);
    this.innerHeight = Math.max(0, this.outerHeight - this.innerOffset * 2);

    // pixels per health unit
    this.p = this.innerWidth / this.maxHealth;

    this.draw();

    scene.add.existing(this.bar);
  }

  decrease(amount) {
    this.value -= amount;

    if (this.value < 0) {
      this.value = 0;
    }

    this.draw();

    return (this.value === 0);
  }

  // Adjust size at runtime
  setSize(width, height) {
    this.outerWidth = width;
    this.outerHeight = height;
    this.innerWidth = Math.max(0, this.outerWidth - this.innerOffset * 2);
    this.innerHeight = Math.max(0, this.outerHeight - this.innerOffset * 2);
    this.p = this.innerWidth / Math.max(1, this.maxHealth);
    this.draw();
  }

  // Adjust max health at runtime
  setMaxHealth(maxHealth) {
    this.maxHealth = Math.max(1, maxHealth);
    // ensure value does not exceed new max
    this.value = Math.min(this.value, this.maxHealth);
    this.p = this.innerWidth / this.maxHealth;
    this.draw();
  }

  draw() {
    this.bar.clear();

    //  BG (outer)
    this.bar.fillStyle(0x000000);
    this.bar.fillRect(this.x, this.y, this.outerWidth, this.outerHeight);

    //  Inner background (white)
    this.bar.fillStyle(0x000000);
    this.bar.fillRect(this.x + this.innerOffset, this.y + this.innerOffset, this.innerWidth, this.innerHeight);

    // Health color: green >= 90%, yellow >= 40%, red otherwise
    const pct = (this.value / Math.max(1, this.maxHealth)) * 100;
    if (pct >= 90) {
      this.bar.fillStyle(0x00ff00);
    } else if (pct >= 40) {
      this.bar.fillStyle(0xffff00);
    } else {
      this.bar.fillStyle(0xff0000);
    }

    const d = Math.floor(this.p * this.value);

    this.bar.fillRect(this.x + this.innerOffset, this.y + this.innerOffset, d, this.innerHeight);
  }

}