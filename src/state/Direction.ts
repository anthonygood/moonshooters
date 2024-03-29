export interface Direction {
  right?: boolean;
  left?: boolean;
  up?: boolean;
  down?: boolean;
  timeDown?: (string) => number;
}

// Thin wrapper over cursor keys, Direction interface helps for driving NPCs
// without implementing cursors' interface
export class CursorKeyDirection implements Direction {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
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
    return key ? key.timeDown : 0;
  }
}

const POINTER_MARGIN = 50;

export class PointerDirection implements Direction {
  private input: Phaser.Input.InputPlugin;
  private player: Phaser.GameObjects.Container;

  constructor(
    input: Phaser.Input.InputPlugin,
    player: Phaser.GameObjects.Container
  ) {
    this.input = input;
    this.player = player;
  }

  get pointer() {
    return this.input.pointer1;
  }

  get pointer2() {
    return this.input.pointer2;
  }

  get up() {
    return this.pointer.isDown && this.pointer2.isDown;
  }

  get down() {
    return false;
  }

  get left() {
    const position = this.positionX();
    return this.pointer.isDown && position && position < this.player.x - POINTER_MARGIN;
  }

  get right() {
    const position = this.positionX();

    return this.pointer.isDown && position && position > this.player.x + POINTER_MARGIN;
  }

  positionX() {
    const { pointer } = this;

    if (!pointer.camera) return null;

    return pointer.x + pointer.camera.scrollX;
  }

  timeDown(direction: 'up' | 'down' | 'left' | 'right') {
    if (direction === 'up') return this.up && this.pointer2.downTime;
    return this.pointer.downTime;
  }
}
