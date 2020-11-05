const PLAYER_KEY = 'player';
const asset = (path: string) => `/assets/${path}`;

class Player {
  public scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite;

  constructor(scene) {
    this.scene = scene;
  }

  preload(): void {
		this.scene.load.multiatlas(PLAYER_KEY, asset('sprites/bojo_frames.json'), asset('sprites'));
  }

  create(): void {
    this.sprite = this.scene.add.sprite(150, 50, PLAYER_KEY, 'idle_1.png');
		this.sprite.setScale(4);
  }

	update(
    time: number,
    delta: number,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ) {
		this.sprite.setFrame('idle_1.png');
		if (cursors.left.isDown) {
			this.sprite.x -= 5;
		}
		if (cursors.right.isDown) {
			this.sprite.x += 5;
			this.sprite.setFrame('walk_1.png');
		}
		if (cursors.down.isDown) {
			this.sprite.y += 5;
		}
		if (cursors.up.isDown) {
			this.sprite.y -= 5;
		}
	}
}

export default Player;
