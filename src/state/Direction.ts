export interface Direction {
  right: boolean;
  left: boolean;
  up: boolean;
  down: boolean;
  timeDown: (string) => number;
}

// Thin wrapper over cursor keys
export class CursorKeyDirection implements Direction {
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

  timeDown(direction: 'up' | 'down' | 'left' | 'right') {
    const key = this.cursors[direction];
    console.log('timeDown', direction, key);
    return key ? key.timeDown : 0;
  }
}
