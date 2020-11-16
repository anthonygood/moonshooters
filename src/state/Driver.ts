export interface Driver {
  right: boolean;
  left: boolean;
  up: boolean;
  down: boolean;
}

// Thin wrapper over cursor keys
export class CursorKeyDriver implements Driver {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(cursors: Phaser.Types.Input.Keyboard.CursorKeys;) {
    this.cursors = cursors;
  }
  get up() {
    return this.cursors.up.isDown;
  }
  get down() {
    return this.cursors.down.isDown;
  }
  get left() {
    return this.cursors.left.isDown;
  }
  get right() {
    return this.cursors.right.isDown;
  }

  timeDown(direction) {
    const key = this.cursors[direction];
    return key ? key.timeDown : 0;
  }
}
