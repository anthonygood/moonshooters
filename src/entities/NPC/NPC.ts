import Player, { SpriteLayer, VELOCITY } from '../Player';
import NPCState from '../../state/NPCState';
import { createFramesForCombinedKey } from '../../animations';
import Driver, { NPCDirection, NPCDriver } from './Driver';
import { getCombinedKey, extractKey } from '../../util/dynamicSpriteAtlas';
import Layers from './Layers';

const sample = (vals = []) =>
  vals[Math.floor(Math.random() * vals.length)];

export type Modifiers = {
  idle?: boolean;
  moveOnTouch?: NPCDirection;
};

const VERTICAL_MARGIN = 64;
const HORIZONTAL_MARGIN = 32;

const containerInView = (container: Phaser.GameObjects.Container, camera: Phaser.Cameras.Scene2D.Camera) => {
  const withinX = container.x > camera.scrollX - HORIZONTAL_MARGIN && container.x < camera.scrollX + camera.width + HORIZONTAL_MARGIN;
  const withinY = container.y > camera.scrollY - VERTICAL_MARGIN && container.y < camera.scrollY + camera.height + VERTICAL_MARGIN;

  return withinX && withinY;
}

class NPC extends Player {
  public spawned = false;
  public state: NPCState;
  static readonly Layers = Layers;
  readonly driver: NPCDriver;
  private modifiers: Modifiers;

  static preload(scene) {
    NPC.Layers.forEach(layer => layer.forEach(({ key, json }) => {
      if (scene.textures.exists(key)) return;
      scene.load.multiatlas(key, json, './assets/sprites');
    }));
  }

  constructor(scene) {
    super(scene);
    this.driver = Driver();
  }

  create(cursors, spawn, modifiers?: Modifiers) {
    super.create(cursors, spawn);
    this.tintSprites();
    this.toggleMask(); // hide
    this.spawned = true;
    this.modifiers = modifiers;

    if (!modifiers || !modifiers.idle) this.move();
  }

  getStateMachine() {
    return new NPCState({
      container: this.container,
      velocities: VELOCITY,
      onTouch: () => {
        this.toggleMask();
        this.modifiers.moveOnTouch && this.driver.go(this.modifiers.moveOnTouch);
      }
    });
  }

  getDirection() {
    return this.driver.getDirection();
  }

  move() {
    // TODO: manage in state machine?
    setTimeout(() => {
      this.driver.change();
      this.move();
    }, sample([800, 1000, 1500]));
  }

  update(
    time: number,
    delta: number
  ) {
    // Check container visibility
    this.container.visible = containerInView(this.container, this.scene.cameras.main);
    // TODO: state machine for NPC driver
    // 'AI' lol
    const direction = this.driver.getDirection();

    const containerData = this.container.data && this.container.data.values;
    this.state.process({ delta, direction, near: this.near, time, containerData }); // input data
  }

  tintSprites() {
    this.container.iterate(sprite => {
      // TODO: separate lookup object for tints?
      const spriteLayer = this.findSprite(sprite);
      if (!spriteLayer) {
        throw new Error(`No sprite layer data found for ${sprite.name}`);
      }

      const { blendMode, tints } = spriteLayer;
      const tint = sample(tints);
      tint && sprite.setTint(tint);
      blendMode && (sprite.blendMode = blendMode);
    });
  }

  loopSprites() {
    setTimeout(() => {
      this.container.removeAll()
      this.addSprites();
      this.tintSprites();
      this.loopSprites();
    }, 1000);
  }

  findSprite({ name }): SpriteLayer {
    for (const layer of NPC.Layers) {
      for (const sprite of layer) {
        const { key } = sprite;
        if (key === name || key === extractKey(name)) return sprite;
      }
    }
  }

  addSprites() {
    this.forEachLayer(layer => {
      const sampleSprite = sample(layer);
      const shouldAdd = sample([true, !sampleSprite.optional]);
      shouldAdd && this.addSprite({ key: getCombinedKey(sampleSprite.key) });
    });
  }

  toggleMask() {
    const mask: any = this.container.getByName('mask') || this.container.getByName(getCombinedKey('mask'));
    mask.visible = !mask.visible;
  }

  createSprites() {
    const createFrames = createFramesForCombinedKey(this.scene);
    this.forEachSprite(({ key }) => {
      createFrames(key);
    });
  }
}

export default NPC;
