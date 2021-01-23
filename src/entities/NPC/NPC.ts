import { sample } from '../../util';
import Player, { SPRITE_SCALE, VELOCITY } from '../Player';
import NPCState from '../../state/NPCState';
import { createFramesForCharacterAtlas } from '../../animations';
import Driver, { NPCDirection, NPCDriver } from './Driver';
import { getCharSpriteKey, CHAR_ATLAS_KEY } from '../../util/TextureKeys';
import Layers from './Layers';
import { ContainerAnimation } from '../../animations/index';

const MASK_KEY = 'mask';

const getMaskKeyForSprite = (textures: Phaser.Textures.TextureManager, frameKey) => {
  const { dependencies = [] } = textures.getFrame('@@charSprites', frameKey).customData;
  const maskDep = dependencies.find(key => key.includes('mask'));
  return `${maskDep || MASK_KEY}_idle_1`;
};

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
  public spriteId: number;
  public state: NPCState;
  static readonly Layers = Layers;
  readonly driver: NPCDriver;
  private modifiers: Modifiers;
  private scale: number;

  static preload(scene) {
    NPC.Layers.forEach(layer => layer.forEach(({ key, json }) => {
      if (scene.textures.exists(key)) return;
      scene.load.multiatlas(key, json, './assets/sprites');
    }));
  }

  static createAnimations(scene, count) {
    createFramesForCharacterAtlas(scene)(MASK_KEY);

    for (let spriteId = 0; spriteId < count; spriteId++) {
      createFramesForCharacterAtlas(scene)(spriteId);
    }
  }

  constructor(scene, spriteId = 0) {
    super(scene);
    this.spriteId = spriteId;
    this.driver = Driver();
    this.scale = SPRITE_SCALE * sample([1.1, 1.05, 1, .95, .9]);
  }

  create(cursors, spawn, modifiers?: Modifiers) {
    super.create(cursors, spawn);
    this.toggleMask(); // hide
    this.spawned = true;
    this.modifiers = modifiers;

    (!modifiers || !modifiers.idle) ? this.move() : this.playAnim('idle');
    return this;
  }

  getStateMachine() {
    return new NPCState({
      container: this.container,
      velocities: VELOCITY,
      onTouch: () => {
        this.toggleMask();
        this.modifiers.moveOnTouch && this.driver.go(this.modifiers.moveOnTouch);
      },
      setAnimation: this.playAnim,
    });
  }

  playAnim = (name: string) => {
    ContainerAnimation.playAnimationWithCharAtlas(this.container, name, this.spriteId)
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

  addSprites() {
    const { scene, spriteId } = this;
    const key = getCharSpriteKey(spriteId, 'idle_1');
    const maskKey = getMaskKeyForSprite(scene.textures, key);

    this.addSprite({ key: CHAR_ATLAS_KEY }, key, null);
    this.addSprite({ key: CHAR_ATLAS_KEY }, maskKey, 'mask');
  }

  toggleMask() {
    const mask: any = this.container.getByName(MASK_KEY);
    mask.visible = !mask.visible;
  }

  createAnimations() {
    // NPC animations are pre-generated (NPC.createAnimations)
    // because they all share the same mask animation (for now).
    return;
  }
}

export default NPC;
