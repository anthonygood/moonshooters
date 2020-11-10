import PlayerState from '../state/PlayerState';

const PLAYER_KEY = 'player';
const asset = (path: string) => `/assets/${path}`;

const VELOCITY = {
  RUN: 1600,
  JUMP: 1000,
};

export interface Near {
  climbable: boolean;
}

class Player {
  // TODO: Define in map
  readonly spawn = [150, 50];
  public scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public state: PlayerState;
  private near: Near;

  constructor(scene) {
    this.scene = scene;
    this.near = {
      climbable: false,
    };
  }

  preload(): void {
		this.scene.load.multiatlas(PLAYER_KEY, asset('sprites/bojo_frames.json'), asset('sprites'));
  }

  create(): void {
    const [x, y] = this.spawn;
    const sprite = this.sprite = this.scene.physics.add.sprite(x, y, PLAYER_KEY, 'idle_1.png');
    sprite.setDebug(false, false, 1);
    sprite.setScale(2);
    sprite.setMaxVelocity(400, 1000);
    sprite.body.setSize(8, 30);

    this.scene.anims.create({
      key: 'walk',
      frameRate: 8,
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
      frameRate: 6,
      repeat: -1,
      frames: this.getFrames('jump_', 2),
    });

    this.scene.anims.create({
      key: 'halfspin',
      frameRate: 8,
      repeat: 0,
      frames: [
        { key: PLAYER_KEY, frame: 'walk_4.png' },
        { key: PLAYER_KEY, frame: 'walk_2.png' },
        { key: PLAYER_KEY, frame: 'walk_3.png' },
        { key: PLAYER_KEY, frame: 'walk_1.png' },

      ],
    });

    this.state = new PlayerState({ sprite, velocities: { jump: VELOCITY.JUMP, run: VELOCITY.RUN} });
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
    this.state.process({ cursors, near: this.near });
    // Move into state machine
    this.near.climbable = false;
    if (cursors.space.isDown) {
      this.sprite.anims.play('halfspin', true).once('animationcomplete', () => {
        this.sprite.flipX = true;
        this.sprite.anims.play('halfspin', true).once('animationcomplete', () => {
          this.sprite.flipX = false;
          this.sprite.anims.play('halfspin', true);
        });
      });
    }
  }

  nearClimbable() {
    this.near.climbable = true;
  }
}

export default Player;
