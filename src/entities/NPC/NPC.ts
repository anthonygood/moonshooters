import { sample } from '../../util';
import Player, { SPRITE_SCALE, VELOCITY } from '../Player';
import NPCState from '../../state/NPCState';
import { createFramesForCharacterAtlas } from '../../animations';
import Driver, { NPCDriver } from './Driver';
import { getCharSpriteKey, CHAR_ATLAS_KEY } from '../../util/TextureKeys';
import Layers from './Layers';
import { ContainerAnimation } from '../../animations/index';
import { GREYSCALE_PIPELINE_KEY } from '../../rendering/GreyscalePipeline';

const MASK_KEY = 'mask';
const SPRITE_KEY = 'main';

const getMaskKeyForSprite = (textures: Phaser.Textures.TextureManager, frameKey) => {
  const { dependencies = [] } = textures.getFrame('@@charSprites', frameKey).customData;
  const maskDep = dependencies.find(key => key.includes('mask'));
  return `${maskDep || MASK_KEY}_idle_1`;
};

const VERTICAL_MARGIN = 64;
const HORIZONTAL_MARGIN = 32;

const containerInView = (container: Phaser.GameObjects.Container, camera: Phaser.Cameras.Scene2D.Camera) => {
  const withinX = container.x > camera.scrollX - HORIZONTAL_MARGIN && container.x < camera.scrollX + camera.width + HORIZONTAL_MARGIN;
  const withinY = container.y > camera.scrollY - VERTICAL_MARGIN && container.y < camera.scrollY + camera.height + VERTICAL_MARGIN;

  return withinX && withinY;
}

class NPC extends Player {
  static readonly Layers = Layers;
  public spawned = false;
  public spriteId: number;
  public state: NPCState;
  readonly driver: NPCDriver;
  private frozen: boolean;
  private modifiers: NPCState.Modifiers;

  static preload(scene) {
    NPC.Layers.forEach(layer => layer.forEach(({ key, json }) => {
      if (scene.textures.exists(key)) return;
      scene.load.multiatlas(key, json, './assets/sprites');
    }));
  }

  static createAnimations(scene, count) {
    const createFrames = createFramesForCharacterAtlas(scene);
    createFrames(MASK_KEY);

    for (let spriteId = 0; spriteId < count; spriteId++) {
      createFrames(spriteId);
    }
  }

  constructor(scene, spriteId = 0) {
    super(scene);
    this.spriteId = spriteId;
    this.driver = Driver();
    this.scale = SPRITE_SCALE * sample([1.075, 1.05, 1, .95, .925]);
    this.frozen = false;
  }

  create(cursors, spawn, modifiers?: NPCState.Modifiers) {
    this.modifiers = modifiers;
    super.create(cursors, spawn);
    this.toggleMask(); // hide
    this.spawned = true;

    this.state.touch.on('touched', () => {
      this.toggleMask();
      this.greyscale();
      if (modifiers.moveOnTouch) {
        this.driver.go(modifiers.moveOnTouch);
      } else {
        this.frozen = true;
      }
    });

    (!modifiers || !modifiers.idle) ? this.move() : setTimeout(
      () => this.playAnim('idle'),
      sample([100,200,300,400,500])
    );
    return this;
  }

  getStateMachine() {
    const { container, modifiers } = this;
    return new NPCState({
      container,
      modifiers,
      velocities: VELOCITY,
      setAnimation: this.playAnim,
      stopAnimation: this.stopAnim,
    });
  }

  playAnim = (name: string) => {
    ContainerAnimation.playAnimationWithCharAtlas(this.container, name, this.spriteId)
  }

  stopAnim = () => {
    ContainerAnimation.stop(this.container);
  }

  getDirection() {
    return this.driver.getDirection();
  }

  move() {
    // TODO: manage in state machine?
    setTimeout(() => {
      if (this.frozen) return;
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

    this.state.process({
      containerData,
      delta,
      direction,
      time,
      near: this.near,
    });
  }

  addSprites() {
    const { scene, spriteId } = this;
    const key = getCharSpriteKey(spriteId, 'idle_1');
    const maskKey = getMaskKeyForSprite(scene.textures, key);

    this.addSprite({ key: CHAR_ATLAS_KEY }, key, SPRITE_KEY);
    this.addSprite({ key: CHAR_ATLAS_KEY }, maskKey, MASK_KEY);
  }

  toggleMask() {
    const mask: any = this.container.getByName(MASK_KEY);
    mask.visible = !mask.visible;
  }

  greyscale() {
    const sprite = this.container.getByName(SPRITE_KEY) as Phaser.GameObjects.Sprite;
    sprite.setPipeline(GREYSCALE_PIPELINE_KEY);
  }

  createAnimations() {
    // NPC animations are pre-generated (NPC.createAnimations)
    // because they all share the same mask animation (for now).
    return;
  }
}

export default NPC;
