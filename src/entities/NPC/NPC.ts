import COLOURS from './Colours';
import Player, { SpriteLayer, VELOCITY } from '../Player';
import NPCState from '../../state/NPCState';
import { spriteJson, createFramesForKey } from '../../animations';
import Driver, { NPCDirection, NPCDriver } from './Driver';

const sample = (vals = []) =>
  vals[Math.floor(Math.random() * vals.length)];

export type Modifiers = {
  idle?: boolean;
  moveOnTouch?: NPCDirection;
};

class NPC extends Player {
  public spawned = false;
  public state: NPCState;
  readonly driver: NPCDriver;
  static readonly layers = [
    // Trousers
    [
      { key: 'trousers:dark',  json: spriteJson('trousers:dark'), tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] },
      { key: 'trousers:light', json: spriteJson('trousers:light'), tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }
    ],
    // Tops
    [
      { key: 'top',   json: spriteJson('top:blank'),  tints: [COLOURS.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] },
      { key: 'shirt', json: spriteJson('shirt:full'), tints: [COLOURS.white, ...Object.values(COLOURS.shirt), COLOURS.hair.ginger] }
    ],
    // Ties
    // TODO: define as sub-layer with shirt?
    [
      { key: 'tie',        optional: true, json: spriteJson('tie'),        tints: [COLOURS.grey, COLOURS.green, ...Object.values(COLOURS.tie)] },
      { key: 'tie:skinny', optional: true, json: spriteJson('tie:skinny'), tints: [COLOURS.grey, COLOURS.green, ...Object.values(COLOURS.tie)] }

    ],
    [{ key: 'jacket',    optional: true, json: spriteJson('jacket'),    tints: [COLOURS.grey, COLOURS.white, COLOURS.green, COLOURS.blue] }],
    [{ key: 'headhands', json: spriteJson('headhands'), tints: Object.values(COLOURS.skin) }],
    // Mouth
    [
      { key: 'mouth:plain', json: spriteJson('mouth:plain'), blendMode: 2 /* MULTIPLY */, tints: [COLOURS.skin.pink] }, // https://stackoverflow.com/questions/22434240/how-to-use-blending-in-phaserjs
    ],
    // Eyes
    [
      { key: 'eyes:big',    json: spriteJson('eyes:big')    },
      { key: 'eyes:small',  json: spriteJson('eyes:small')  },
      { key: 'eyes:shifty', json: spriteJson('eyes:shifty') },
    ],
    // Hair
    [
      { key: 'hair:helmet',  optional: true, json: spriteJson('hair:helmet'),  tints: Object.values(COLOURS.hair) },
      { key: 'hair:balding', optional: true, json: spriteJson('hair:balding'), tints: Object.values(COLOURS.hair) },
    ],
    [{ key: 'mask', json: spriteJson('mask'), tints: [COLOURS.white, COLOURS.green, ...Object.values(COLOURS.mask)] } ],
  ];

  private modifiers: Modifiers;

  static preload(scene) {
    NPC.layers.forEach(layer => layer.forEach(({ key, json }) => {
      if (scene.textures.exists(key)) return;
      scene.load.multiatlas(key, json, '/assets/sprites');
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
    // TODO: state machine for NPC driver
    // 'AI' lol
    const direction = this.driver.getDirection();

    const containerData = this.container.data && this.container.data.values;
    this.state.process({ delta, direction, near: this.near, time, containerData }); // input data
  }

  tintSprites() {
    this.container.iterate(sprite => {
      // TODO: separate lookup object for tints?
      const { blendMode, tints } = this.findSprite(sprite);
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
    for (const layer of NPC.layers) {
      for (const sprite of layer) {
        if (sprite.key === name) return sprite;
      }
    }
  }

  addSprites() {
    this.forEachLayer(layer => {
      const sampleSprite = sample(layer);
      const shouldAdd = sample([true, !sampleSprite.optional]);
      shouldAdd && this.addSprite(sampleSprite);
    });
  }

  toggleMask() {
    const mask: any = this.container.getByName('mask');
    mask.visible = !mask.visible;
  }

  createSprites() {
    const createFrames = createFramesForKey(this.scene);
    this.forEachSprite(({ key }) => {
      createFrames(key);
    });
  }
}

export default NPC;
