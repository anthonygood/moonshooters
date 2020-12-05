export interface Direction {
  right: boolean;
  left: boolean;
  up: boolean;
  down: boolean;
  timeDown: (string) => number;
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
    return this.input.activePointer;
  }

  get up() {
    return this.pointer.isDown;
  }

  get down() {
    return false;
  }

  get left() {
    const position = this.positionX();
    return position && this.positionX() < this.player.x - POINTER_MARGIN;
  }

  get right() {
    const position = this.positionX();

    return position && this.positionX() > this.player.x + POINTER_MARGIN;
  }

  positionX() {
    const { pointer } = this;

    if (!pointer.camera) return null;

    return pointer.x + pointer.camera.scrollX;
  }

  timeDown(direction: 'up' | 'down' | 'left' | 'right') {
    return this[direction] ? this.pointer.downTime : 0;
  }
}

export class CursorKeyOrPointerDirection implements Direction {
  private cursorDirection: CursorKeyDirection;
  private pointerDirection: PointerDirection;

  constructor(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    input: Phaser.Input.InputPlugin,
    camera: Phaser.Cameras.Scene2D.Camera,
    player: Phaser.GameObjects.Container
  ) {
    this.cursorDirection = new CursorKeyDirection(cursors);
    this.pointerDirection = new PointerDirection(input, player);
  }

  get up() {
    return this.cursorDirection.up || this.pointerDirection.up;
  }

  get down() {
    return this.cursorDirection.down || this.pointerDirection.down;
  }

  get left() {
    return this.cursorDirection.left || this.pointerDirection.left;
  }

  get right() {
    return this.cursorDirection.right || this.pointerDirection.right;
  }

  timeDown(direction: 'up' | 'down' | 'left' | 'right') {
    return this.cursorDirection.timeDown(direction) || this.pointerDirection.timeDown(direction);
  }

  positionX() {
    return this.pointerDirection.positionX();
  }
}
