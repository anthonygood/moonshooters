import PlayerState from '../state/PlayerState';
import { createFramesForKey, spriteJson } from '../animations';

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
  static readonly sprites: object = {
    boris: spriteJson('bojo_frames'),
  };

  constructor(scene) {
    this.scene = scene;
    this.near = {
      climbable: false,
    };
  }

  forEachSprite(fn) {
    // @ts-ignore
    Object.entries(this.constructor.sprites).forEach(fn);
  }

  preload(): void {
    this.forEachSprite(([key, json]) => {
      this.scene.load.multiatlas(key, json, '/assets/sprites');
    })
  }

  create(): void {
    const [x, y] = this.spawn;
    const container = this.container = this.scene.add.container(x, y);

    this.forEachSprite(([key]) => {
      createFramesForKey(this.scene)(key);
      const sprite = this.scene.add.sprite(16, 48, key)
        // .setData('key', key)
        .setName(key)
        // .setData('name', key)
        .setScale(3);

      container.add(sprite);
    });

    this.scene.physics.world.enable(container);

    (container.body as Phaser.Physics.Arcade.Body)
      .setMaxVelocity(400, 1000)
      .setSize(32, 96);

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
