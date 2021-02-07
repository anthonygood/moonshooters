import { Direction, CursorKeyDirection, PointerDirection } from '../state/Direction';
import PlayerState from '../state/PlayerState';
import FlightRecorder, { Records } from '../state/FlightRecorder';
import { createFramesForKey, spriteJson } from '../animations';
import PlayerSound from '../sound/PlayerSounds';
import { ContainerAnimation } from '../animations/index';

Error.stackTraceLimit = 200;

export const SPRITE_SCALE = 2;

// max speed levels:
//  LEVEL  | RUN |  JUMP
//  lvl 1  | 400 |  1,000
//  lvl 2  | 600 |  1,100
//  lvl 3  | 800 |  1,200

export const VELOCITY = {
  run: 1600,
  jump: 1000,
  airControl: 400,
  max: {
    x: 600,
    y: 1000,
  }
};

export interface Near {
  climbable: boolean;
}

export type SpriteLayer = {
  key: string,
  json: object,
  tints?: number[], // representing possible colours
  alpha?: number,
  requires?: string[],
};

class Player {
  protected scale: number;
  protected direction: Direction;
  protected near: Near;
  public container: Phaser.GameObjects.Container;
  public flightRecorder: Records;
  public scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public state: PlayerState;
  public sound: PlayerSound;
  // A 2D array of Layer objects: a layer with multiple keys represents multiple possibilites,
  // where only one will be rendered. Used for rendering different features.
  static readonly Layers: SpriteLayer[][] = [
    [{ key: 'boris', json: spriteJson('bojo_frames') }],
  ];

  constructor(scene) {
    this.scene = scene;
    this.near = {
      climbable: false,
    };
    this.sound = new PlayerSound(scene);
    this.scale = SPRITE_SCALE;
  }

  preload(): void {
    // TODO: combine all sprites into a single texture atlas
    this.forEachSprite(({ key, json }) => {
      if (this.scene.textures.exists(key)) return;
      this.scene.load.multiatlas(key, json, './assets/sprites');
    });
    this.sound.preload();
  }

  // TODO: more cleanup?
  destroy(): void {
    this.container.destroy();
  }

  create(cursors, spawn: number[], _modifiers?: any): Player {
    const [x, y] = spawn;
    const container = this.container = this.scene.add.container(x, y);
    this.scene.physics.world.enable(container);

    (container.body as Phaser.Physics.Arcade.Body)
      .setMaxVelocity(VELOCITY.max.x, VELOCITY.max.y)
      .setSize(11 * this.scale, 32 * this.scale);

    this.createAnimations();
    this.addSprites();
    this.direction = this.getDirection(cursors);
    const state = this.state = this.getStateMachine();
    this.sound.create();

    state.action.on('jump', this.sound.jump);

    return this;
  }

  getStateMachine() {
    const state = new PlayerState({
      container: this.container,
      velocities: VELOCITY,
      setAnimation: name => ContainerAnimation.__playAnimationWithDedicatedAtlas(this.container, name),
    });

    this.flightRecorder = FlightRecorder(state.action, state.direction);

    state.init();

    return state;
  }

  getDirection(cursors): Direction {
    const isDesktop = this.scene.game.device.os.desktop;

    return isDesktop ?
      new CursorKeyDirection(cursors) :
      new PointerDirection(this.scene.input, this.container);
  }

	update(
    time: number,
    delta: number
  ) {
    this.state.process({ direction: this.direction, near: this.near, time, delta });
    // Move into state machine
    this.near.climbable = false;
  }

  // Creates animation frames, rather than sprites...
  createAnimations() {
    const createFrame = createFramesForKey(this.scene);
    this.forEachSprite(({ key }) => {
      createFrame(key);
    });
  }

  addSprites() {
    this.forEachSprite(this.addSprite);
  }

  addSprite = ({ key }, frame?: string, name?: string | object) => {
    const { scale } = this;
    name = typeof name === 'string' ? name : null;
    const sprite = this.scene.add.sprite(8 * scale, 16 * scale, key, frame)
      .setName(name || key)
      .setScale(scale);

    this.container.add(sprite);
  }

  nearClimbable() {
    this.near.climbable = true;
  }

  forEachLayer(fn) {
    // @ts-ignore
    this.constructor.Layers.forEach(fn)
  }

  forEachSprite(fn) {
    this.forEachLayer(layer => layer.forEach(fn))
  }
}

export default Player;
