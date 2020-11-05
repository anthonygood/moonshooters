const PLAYER_KEY = 'player';
const asset = (path: string) => `/assets/${path}`;

const RUN_VELOCITY = 250;
const JUMP_VELOCITY = 500;

class Player {
  public scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;

  constructor(scene) {
    this.scene = scene;
  }

  preload(): void {
		this.scene.load.multiatlas(PLAYER_KEY, asset('sprites/bojo_frames.json'), asset('sprites'));
  }

  create(): void {
    const sprite = this.sprite = this.scene.physics.add.sprite(150, 50, PLAYER_KEY, 'idle_1.png');
    sprite.debugShowVelocity = true;

    sprite.setScale(2);
    this.scene.anims.create({
      key: 'walk',
      frameRate: 6,
      repeat: -1,
      frames: this.getFrames('walk_', 4),
    });
    this.scene.anims.create({
      key: 'idle',
      frameRate: 2,
      repeat: -1,
      frames: this.getFrames('idle_', 2),
    });
    this.scene.anims.create({
      key: 'jump',
      frameRate: 2,
      repeat: -1,
      frames: this.getFrames('jump_', 2),
    });
    this.sprite.anims.play('walk');
  }

  private getFrames(prefix, end) {
    return this.scene.anims.generateFrameNames(
      PLAYER_KEY,
      {
        prefix,
        suffix: '.png',
        start: 1,
        end,
      }
    )
  }

	update(
    time: number,
    delta: number,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ) {
    // this.sprite.anims.play('walk');
    this.sprite.setVelocityX(0);
		if (cursors.left.isDown) {
      this.sprite.setVelocityX(-RUN_VELOCITY);
		}
		if (cursors.right.isDown) {
      this.sprite.setVelocityX(RUN_VELOCITY);
      // this.sprite.setFrame('walk_1.png');
      // this.sprite.anims.play('walk');
		}
		if (cursors.down.isDown) {
			this.sprite.y += 5;
		}
		if (cursors.up.isDown) {
      this.sprite.setVelocityY(-JUMP_VELOCITY);
		}
	}
}

export default Player;
