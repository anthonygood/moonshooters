import PlayerState from '../state/PlayerState';
import spriteJson from '../../assets/sprites/bojo_frames';

const PLAYER_KEY = 'player';
const asset = (path: string) => `/assets/${path}`;

const ANIMATIONS = {
  suit: {
    dark: 'suit/dark',
  },
  mask: 'mask',
};

const COLOURS = {
  green: 0x89F94F,
  blue: 0x4FE1FC,
};

const VELOCITY = {
  run: 1600,
  jump: 1000,
};

export interface Near {
  climbable: boolean;
}

class Player {
  // TODO: Define in map
  readonly spawn = [50, 50];
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
    // spriteJson.textures[0].image = 'bluemask.png';
    const boris = spriteJson('bojo_frames')
    const mask = spriteJson('mask');
    const darksuit = spriteJson('darksuit');
    // this.scene.load.multiatlas(PLAYER_KEY, boris, asset('sprites'));
    this.scene.load.multiatlas(PLAYER_KEY, boris, asset('sprites'));
    this.scene.load.multiatlas(ANIMATIONS.suit.dark, darksuit, asset('sprites'));
		this.scene.load.multiatlas(ANIMATIONS.mask, mask, asset('sprites'));
  }

  create(): void {
    const [x, y] = this.spawn;
    // const sprite = this.sprite = this.scene.physics.add.sprite(x, y, PLAYER_KEY, 'idle_1.png');
    const sprite = this.sprite = this.scene.add.sprite(16, 48, PLAYER_KEY, 'idle_1.png');

    // const sprite = this.sprite = this.scene.add.sprite(16, 48, ANIMATIONS.suit.dark, 'suit/dark/idle_1.png');
    const mask = this.scene.add.sprite(16, 48, ANIMATIONS.mask, 'mask/blue/idle_1.png');
    mask.setData('key', ANIMATIONS.mask);
    sprite.setData('key', ANIMATIONS.suit.dark);
    mask.setScale(3);
    sprite.setScale(3);

    mask.setTint(COLOURS.blue);

    const container = this.container = this.scene.add.container(x, y);
    container.add([sprite, mask]);
    this.scene.physics.world.enable(container);
    container.body.setMaxVelocity(400, 1000);
    container.body.setSize(32, 96);

    // TODO: Set animations for each layer
    const spriteKeys = [PLAYER_KEY, ANIMATIONS.mask, ANIMATIONS.suit.dark];
    spriteKeys.forEach(key => {
      console.log(`setting some anim for`, key, `${key}/idle`);
      this.scene.anims.create({
        key: `${key}/walk`,
        frameRate: 4,
        repeat: -1,
        frames: this.getFrames('walk_', 4, key),
      });
      this.scene.anims.create({
        key: `${key}/idle`,
        frameRate: 2,
        repeat: -1,
        frames: this.getFrames('idle_', 2, key),
      });
      this.scene.anims.create({
        key: `${key}/jump`,
        frameRate: 6,
        repeat: -1,
        frames: this.getFrames('jump_', 2, key),
      });

      this.scene.anims.create({
        key: `${key}/halfspin`,
        frameRate: 8,
        repeat: 0,
        frames: [
          { key, frame: 'walk_4.png' },
          { key, frame: 'walk_2.png' },
          { key, frame: 'walk_3.png' },
          { key, frame: 'walk_1.png' },
        ],
      });
    });

    // this.scene.anims.create({
    //   key: 'idle_mask',
    //   frameRate: 2,
    //   repeat: -1,
    //   frames: this.getFrames('idle_', 2, 'MASK'),
    // });

    // sprite.play('idle');
    // mask.play('idle_mask');

    this.state = new PlayerState({ container, velocities: VELOCITY });
  }

  private getFrames(prefix, end, key = PLAYER_KEY) {
    return this.scene.anims.generateFrameNames(
      key,
      {
        prefix,
        suffix: `.png`,
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
