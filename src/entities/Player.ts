import { Direction, CursorKeyDirection, PointerDirection } from '../state/Direction';
import PlayerState from '../state/PlayerState';
import { createFramesForKey, spriteJson } from '../animations';
import PlayerSound from '../sound/PlayerSounds';

const SPRITE_SCALE = 3;

// max speed levels:
//  LEVEL  | RUN |  JUMP
//  lvl 1  | 400 |  1,000
//  lvl 2  | 600 |  1,100
//  lvl 3  | 800 |  1,200

export const VELOCITY = {
  run: 1600,
  jump: 1400,
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
  blendMode?: number,
};

class Player {
  protected direction: Direction;
  public scene: Phaser.Scene;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public container: Phaser.GameObjects.Container;
  public state: PlayerState;
  public sound: PlayerSound;
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
    this.sound = new PlayerSound(scene);
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

  create(cursors, spawn: number[]): void {
    const [x, y] = spawn;
    const container = this.container = this.scene.add.container(x, y);
    this.scene.physics.world.enable(container);

    (container.body as Phaser.Physics.Arcade.Body)
      .setMaxVelocity(VELOCITY.max.x, VELOCITY.max.y)
      .setSize(11 * SPRITE_SCALE, 32 * SPRITE_SCALE);

    this.createSprites();
    this.addSprites();
    this.direction = this.getDirection(cursors);
    const state = this.state = this.getStateMachine();
    this.sound.create();

    state.action.on('jump', this.sound.jump);
  }

  getStateMachine() {
    return new PlayerState({ container: this.container, velocities: VELOCITY });
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

  createSprites() {
    const createFrame = createFramesForKey(this.scene);
    this.forEachSprite(({ key }) => {
      createFrame(key);
    });
  }

  addSprites() {
    this.forEachSprite(this.addSprite);
  }

  addSprite = ({ key }) => {
    const sprite = this.scene.add.sprite(8 * SPRITE_SCALE, 16 * SPRITE_SCALE, key)
      .setName(key)
      .setScale(SPRITE_SCALE);

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
