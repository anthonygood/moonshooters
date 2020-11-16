import PlayerState from '../state/PlayerState';
import { createFramesForKey, spriteJson } from '../animations';

const VELOCITY = {
  run: 1600,
  jump: 1000,
};

export interface Near {
  climbable: boolean;
}

export type SpriteLayer = {
  key: string,
  json: object,
  tints?: number[], // representing possible colours
  blendMode?: number,
};

class Player {
  // TODO: Define in map
  readonly spawn = [50, 50];
  readonly State = PlayerState;
  public scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public container: Phaser.GameObjects.Container;
  public state: PlayerState;
  protected near: Near;
  // A 2D array of Layer objects: a layer with multiple keys represents multiple possibilites,
  // where only one will be rendered. Used for rendering different features.
  static readonly layers: SpriteLayer[][] = [
    [{ key: 'boris', json: spriteJson('bojo_frames') }],
  ];

  constructor(scene) {
    this.scene = scene;
    this.near = {
      climbable: false,
    };
  }

  preload(): void {
    this.forEachSprite(({ key, json }) => {
      this.scene.load.multiatlas(key, json, '/assets/sprites')
    })
  }

  create(): void {
    const [x, y] = this.spawn;
    const container = this.container = this.scene.add.container(x, y);
    this.scene.physics.world.enable(container);

    (container.body as Phaser.Physics.Arcade.Body)
      .setMaxVelocity(400, 1000)
      .setSize(32, 96);

    this.createSprites();
    this.addSprites();
    this.state = new this.State({ container, velocities: VELOCITY });
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

  createSprites() {
    this.forEachSprite(({ key }) => {
      createFramesForKey(this.scene)(key);
    });
  }

  addSprites() {
    this.forEachSprite(this.addSprite);
  }

  addSprite = ({ key }) => {
    const sprite = this.scene.add.sprite(16, 48, key)
      .setName(key)
      .setScale(3);

    this.container.add(sprite);
  }

  nearClimbable() {
    this.near.climbable = true;
  }

  forEachLayer(fn) {
    // @ts-ignore
    this.constructor.layers.forEach(fn)
  }

  forEachSprite(fn) {
    this.forEachLayer(layer => layer.forEach(fn))
  }
}

export default Player;
