import PlayerState from '../state/PlayerState';
import spriteJson from '../../assets/sprites/bojo_frames';
import { createFramesForKey } from '../animations';

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
  public container: Phaser.GameObjects.Container;
  public state: PlayerState;
  private near: Near;

  constructor(scene) {
    this.scene = scene;
    this.near = {
      climbable: false,
    };
  }

  preload(): void {
    const boris = spriteJson('bojo_frames');
    // TODO: layers for Boris' sprite
    // @ts-ignore
    this.scene.load.multiatlas(PLAYER_KEY, boris, asset('sprites'));
  }

  create(): void {
    const [x, y] = this.spawn;
    const sprite = this.scene.add.sprite(16, 48, PLAYER_KEY);

    sprite.setData('key', PLAYER_KEY)
      .setScale(3);

    const container = this.container = this.scene.add.container(x, y);
    container.add([sprite]);

    this.scene.physics.world.enable(container);

    (container.body as Phaser.Physics.Arcade.Body)
      .setMaxVelocity(400, 1000)
      .setSize(32, 96);

    const spriteKeys = [PLAYER_KEY];
    spriteKeys.forEach(createFramesForKey(this.scene));

    this.state = new PlayerState({ container, velocities: VELOCITY });
  }

	update(
    time: number,
    delta: number,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ) {
    this.state.process({ cursors, near: this.near, time });
    // Move into state machine
    this.near.climbable = false;
  }

  nearClimbable() {
    this.near.climbable = true;
  }
}

export default Player;
